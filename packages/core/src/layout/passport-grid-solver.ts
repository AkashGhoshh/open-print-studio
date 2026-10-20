/**
 * Open Print Studio Core — Dynamic Passport Photo Grid Solver
 * 
 * Mathematically derives optimal photo sheet layouts (col count, row count,
 * orientation, gaps, and margins) based on physical paper and photo dimensions.
 * Strictly adheres to ADR-002: Dynamic Layout Solver Over Static Menus.
 */

import {
  PAPER_4X6_WIDTH_MM,
  PAPER_4X6_HEIGHT_MM,
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  PHOTO_PASSPORT_IN_WIDTH_MM,
  PHOTO_PASSPORT_IN_HEIGHT_MM,
  PHOTO_STAMP_WIDTH_MM,
  PHOTO_STAMP_HEIGHT_MM,
  PHOTO_VISA_US_WIDTH_MM,
  PHOTO_VISA_US_HEIGHT_MM,
} from "../constants/dimensions.js";
import { roundMm } from "../constants/dpi.js";
import { SheetLayoutResult, SheetSlot } from "./sheet-presets.js";

export type PhotoPresetType = "passport_in" | "stamp" | "visa_us" | "custom";
export type PhotoMediaPaper = "4x6" | "A4";

export interface PhotoPresetDimensions {
  widthMm: number;
  heightMm: number;
}

export const PHOTO_PRESETS: Record<PhotoPresetType, PhotoPresetDimensions> = {
  passport_in: { widthMm: PHOTO_PASSPORT_IN_WIDTH_MM, heightMm: PHOTO_PASSPORT_IN_HEIGHT_MM }, // 35x45 mm
  stamp: { widthMm: PHOTO_STAMP_WIDTH_MM, heightMm: PHOTO_STAMP_HEIGHT_MM },                   // 25x30 mm
  visa_us: { widthMm: PHOTO_VISA_US_WIDTH_MM, heightMm: PHOTO_VISA_US_HEIGHT_MM },               // 50.8x50.8 mm
  custom: { widthMm: 35.0, heightMm: 45.0 },
};

export interface PassportGridConfig {
  paper: PhotoMediaPaper;
  preset: PhotoPresetType;
  customWidthMm?: number;
  customHeightMm?: number;
  requestedCount?: number; // e.g. 8-up on 4x6, 12-up on 4x6, 32-up on A4
  gapMm?: number;
}

export interface SolvedGridOrientation {
  isRotated: boolean;
  itemW: number;
  itemH: number;
  cols: number;
  rows: number;
  capacity: number;
  gapX: number;
  gapY: number;
  marginLeft: number;
  marginTop: number;
}

/**
 * Solves maximum geometric yield and placement for photo grids on sheet.
 */
export function solvePassportGrid(config: PassportGridConfig): SheetLayoutResult {
  const {
    paper,
    preset,
    customWidthMm,
    customHeightMm,
    requestedCount,
    gapMm = 3.0,
  } = config;

  const sheetW = paper === "4x6" ? PAPER_4X6_WIDTH_MM : PAPER_A4_WIDTH_MM;
  const sheetH = paper === "4x6" ? PAPER_4X6_HEIGHT_MM : PAPER_A4_HEIGHT_MM;

  const origW = preset === "custom" && customWidthMm ? customWidthMm : PHOTO_PRESETS[preset].widthMm;
  const origH = preset === "custom" && customHeightMm ? customHeightMm : PHOTO_PRESETS[preset].heightMm;

  // Evaluate both upright and 90-degree rotated orientations
  const evaluateOrientation = (w: number, h: number, isRotated: boolean): SolvedGridOrientation => {
    const cols = Math.floor((sheetW + gapMm) / (w + gapMm));
    const rows = Math.floor((sheetH + gapMm) / (h + gapMm));
    const capacity = cols * rows;

    const usedW = cols * w + (cols - 1) * gapMm;
    const usedH = rows * h + (rows - 1) * gapMm;

    const marginLeft = Math.max(0, roundMm((sheetW - usedW) / 2));
    const marginTop = Math.max(0, roundMm((sheetH - usedH) / 2));

    return {
      isRotated,
      itemW: w,
      itemH: h,
      cols,
      rows,
      capacity,
      gapX: gapMm,
      gapY: gapMm,
      marginLeft,
      marginTop,
    };
  };

  const normal = evaluateOrientation(origW, origH, false);
  const rotated = evaluateOrientation(origH, origW, true);

  // Choose the orientation that yields optimal count matching request, or highest capacity
  let chosen: SolvedGridOrientation;

  if (requestedCount) {
    if (requestedCount === 8 && paper === "4x6" && preset === "passport_in") {
      // ADR-002: 8-up 35x45 on 4x6 strictly requires rotated 45x35 mm (2 cols x 4 rows)
      chosen = rotated.capacity >= 8 ? rotated : normal;
    } else if (normal.capacity >= requestedCount) {
      chosen = normal;
    } else if (rotated.capacity >= requestedCount) {
      chosen = rotated;
    } else {
      chosen = normal.capacity >= rotated.capacity ? normal : rotated;
    }
  } else {
    chosen = normal.capacity >= rotated.capacity ? normal : rotated;
  }

  // Adjust row/col count if requestedCount is lower than max capacity
  let targetCount = requestedCount ? Math.min(requestedCount, chosen.capacity) : chosen.capacity;
  if (targetCount <= 0) targetCount = chosen.capacity;

  const slots: SheetSlot[] = [];
  let slotNumber = 1;

  for (let r = 0; r < chosen.rows && slots.length < targetCount; r++) {
    for (let c = 0; c < chosen.cols && slots.length < targetCount; c++) {
      const x = chosen.marginLeft + c * (chosen.itemW + chosen.gapX);
      const y = chosen.marginTop + r * (chosen.itemH + chosen.gapY);

      slots.push({
        slotNumber,
        pairIndex: 0,
        side: "front",
        col: c,
        row: r,
        xMm: roundMm(x),
        yMm: roundMm(y),
        widthMm: chosen.itemW,
        heightMm: chosen.itemH,
        isFlipped: false,
      });

      slotNumber++;
    }
  }

  return {
    sheetType: paper,
    sheetWidthMm: sheetW,
    sheetHeightMm: sheetH,
    cardCount: slots.length,
    pairCount: Math.ceil(slots.length / 2),
    cols: chosen.cols,
    rows: chosen.rows,
    slots,
  };
}
