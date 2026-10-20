/**
 * Open Print Studio Core — Standard Sheet Presets & Slot Geometry
 * 
 * Provides mathematically verified layouts for A4 (5-Pair), 4x6 (1-Pair), and PVC direct tray.
 * Adheres strictly to golden coordinates (references/golden-coordinates.md).
 */

import {
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  PAPER_4X6_WIDTH_MM,
  PAPER_4X6_HEIGHT_MM,
  CR80_WIDTH_MM,
  CR80_HEIGHT_MM,
} from "../constants/dimensions";
import { roundMm } from "../constants/dpi";
import { mirrorFlipX } from "../geometry/transform";

export interface NudgeConfig {
  offsetX?: number; // mm
  offsetY?: number; // mm
  cardScale?: number; // 0.90 - 1.10
  isFlipped?: boolean;
  gapX?: number; // mm override
  gapY?: number; // mm override
}

export type SlotCardSide = "front" | "back";

export interface SheetSlot {
  slotNumber: number; // 1-indexed
  pairIndex: number;  // 0-indexed pair (0 to 4 on A4)
  side: SlotCardSide;
  col: number;
  row: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  isFlipped: boolean;
}

export interface SheetLayoutResult {
  sheetType: "A4" | "4x6" | "PVC_TRAY";
  sheetWidthMm: number;
  sheetHeightMm: number;
  cardCount: number;
  pairCount: number;
  cols: number;
  rows: number;
  slots: SheetSlot[];
}

/**
 * Generates the standard A4 5-Pair CR-80 layout (10 cards total: 5 front, 5 back)
 * Golden margins: Left 17.40 mm, Top 8.55 mm, Col gap 4.00 mm, Row gap 2.50 mm.
 */
export function solveA4IdCardSheet(nudge: NudgeConfig = {}): SheetLayoutResult {
  const {
    offsetX = 0,
    offsetY = 0,
    cardScale = 1.0,
    isFlipped = false,
    gapX = 4.0,
    gapY = 2.5,
  } = nudge;

  const cardW = CR80_WIDTH_MM * cardScale;
  const cardH = CR80_HEIGHT_MM * cardScale;

  // Golden base coordinates
  const baseMarginLeft = 17.40;
  const baseMarginTop = 8.55;

  const cols = 2;
  const rows = 5;
  const slots: SheetSlot[] = [];

  let slotNum = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x = baseMarginLeft + c * (cardW + gapX) + offsetX;
      const y = baseMarginTop + r * (cardH + gapY) + offsetY;

      // Col 0 is Front, Col 1 is Back
      const side: SlotCardSide = c === 0 ? "front" : "back";
      const pairIndex = r;

      if (isFlipped) {
        x = mirrorFlipX(x, PAPER_A4_WIDTH_MM, cardW);
      }

      slots.push({
        slotNumber: slotNum,
        pairIndex,
        side,
        col: c + 1,
        row: r + 1,
        xMm: roundMm(x, 2),
        yMm: roundMm(y, 2),
        widthMm: roundMm(cardW, 2),
        heightMm: roundMm(cardH, 2),
        isFlipped,
      });

      slotNum++;
    }
  }

  return {
    sheetType: "A4",
    sheetWidthMm: PAPER_A4_WIDTH_MM,
    sheetHeightMm: PAPER_A4_HEIGHT_MM,
    cardCount: 10,
    pairCount: 5,
    cols,
    rows,
    slots,
  };
}

/**
 * Generates the standard 4x6 Photo Paper 1-Pair CR-80 layout (2 cards total: 1 front, 1 back)
 * Golden margins: Left 8.00 mm, Top 20.22 mm, Row gap 4.00 mm.
 */
export function solve4x6IdCardSheet(nudge: NudgeConfig = {}): SheetLayoutResult {
  const {
    offsetX = 0,
    offsetY = 0,
    cardScale = 1.0,
    isFlipped = false,
    gapY = 4.0,
  } = nudge;

  const cardW = CR80_WIDTH_MM * cardScale;
  const cardH = CR80_HEIGHT_MM * cardScale;

  const baseMarginLeft = 8.00;
  const baseMarginTop = 20.22;

  const cols = 1;
  const rows = 2;
  const slots: SheetSlot[] = [];

  for (let r = 0; r < rows; r++) {
    let x = baseMarginLeft + offsetX;
    const y = baseMarginTop + r * (cardH + gapY) + offsetY;

    const side: SlotCardSide = r === 0 ? "front" : "back";

    if (isFlipped) {
      x = mirrorFlipX(x, PAPER_4X6_WIDTH_MM, cardW);
    }

    slots.push({
      slotNumber: r + 1,
      pairIndex: 0,
      side,
      col: 1,
      row: r + 1,
      xMm: roundMm(x, 2),
      yMm: roundMm(y, 2),
      widthMm: roundMm(cardW, 2),
      heightMm: roundMm(cardH, 2),
      isFlipped,
    });
  }

  return {
    sheetType: "4x6",
    sheetWidthMm: PAPER_4X6_WIDTH_MM,
    sheetHeightMm: PAPER_4X6_HEIGHT_MM,
    cardCount: 2,
    pairCount: 1,
    cols,
    rows,
    slots,
  };
}

/**
 * Generates direct PVC tray layout (Carrier standard: 130 x 220 mm with 2 card slots)
 */
export function solvePvcTraySheet(nudge: NudgeConfig = {}): SheetLayoutResult {
  const trayWidthMm = 130.0;
  const trayHeightMm = 220.0;

  const {
    offsetX = 0,
    offsetY = 0,
    cardScale = 1.0,
    isFlipped = false,
    gapY = 10.0,
  } = nudge;

  const cardW = CR80_WIDTH_MM * cardScale;
  const cardH = CR80_HEIGHT_MM * cardScale;

  // Center horizontally on tray
  const baseMarginLeft = (trayWidthMm - cardW) / 2;
  const baseMarginTop = (trayHeightMm - (2 * cardH + gapY)) / 2;

  const slots: SheetSlot[] = [];
  for (let r = 0; r < 2; r++) {
    let x = baseMarginLeft + offsetX;
    const y = baseMarginTop + r * (cardH + gapY) + offsetY;
    const side: SlotCardSide = r === 0 ? "front" : "back";

    if (isFlipped) {
      x = mirrorFlipX(x, trayWidthMm, cardW);
    }

    slots.push({
      slotNumber: r + 1,
      pairIndex: 0,
      side,
      col: 1,
      row: r + 1,
      xMm: roundMm(x, 2),
      yMm: roundMm(y, 2),
      widthMm: roundMm(cardW, 2),
      heightMm: roundMm(cardH, 2),
      isFlipped,
    });
  }

  return {
    sheetType: "PVC_TRAY",
    sheetWidthMm: trayWidthMm,
    sheetHeightMm: trayHeightMm,
    cardCount: 2,
    pairCount: 1,
    cols: 1,
    rows: 2,
    slots,
  };
}
