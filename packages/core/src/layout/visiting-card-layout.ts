/**
 * Open Print Studio Core — Visiting Card Layout Solver (A4 10-Up)
 * 
 * Computes exact mathematical slot placements for standard 85.00 x 55.00 mm
 * visiting/business cards on ISO 216 A4 paper (210 x 297 mm).
 * 
 * Geometry:
 * - 2 Columns x 5 Rows = 10 Cards
 * - Card Dimensions: 85.00 x 55.00 mm
 * - Column Gap: 4.00 mm
 * - Row Gap: 3.00 mm
 * - Symmetrical Margins:
 *     Left/Right = (210.00 - (2 * 85.00 + 4.00)) / 2 = 18.00 mm
 *     Top/Bottom = (297.00 - (5 * 55.00 + 4 * 3.00)) / 2 = 5.00 mm
 */

import {
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  VISITING_CARD_WIDTH_MM,
  VISITING_CARD_HEIGHT_MM,
} from "../constants/dimensions.js";
import { roundMm } from "../constants/dpi.js";
import { mirrorFlipX } from "../geometry/transform.js";
import { NudgeConfig, SheetLayoutResult, SheetSlot } from "./sheet-presets.js";

export const VISITING_CARD_GOLDEN_MARGINS = {
  leftMm: 18.00,
  topMm: 5.00,
  colGapMm: 4.00,
  rowGapMm: 3.00,
};

export interface VisitingCardSheetConfig extends NudgeConfig {
  mode?: "pairs" | "repeated"; // 5 front+back pairs or 10 repeated front cards
}

/**
 * Solves 10-up visiting card layout on A4 paper.
 */
export function solveA4VisitingCardSheet(config: VisitingCardSheetConfig = {}): SheetLayoutResult {
  const {
    offsetX = 0,
    offsetY = 0,
    cardScale = 1.0,
    isFlipped = false,
    gapX = VISITING_CARD_GOLDEN_MARGINS.colGapMm,
    gapY = VISITING_CARD_GOLDEN_MARGINS.rowGapMm,
    mode = "pairs",
  } = config;

  const cardW = roundMm(VISITING_CARD_WIDTH_MM * cardScale);
  const cardH = roundMm(VISITING_CARD_HEIGHT_MM * cardScale);

  const startX = VISITING_CARD_GOLDEN_MARGINS.leftMm + offsetX;
  const startY = VISITING_CARD_GOLDEN_MARGINS.topMm + offsetY;

  const cols = 2;
  const rows = 5;
  const slots: SheetSlot[] = [];

  let slotNumber = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xUnflipped = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);

      // In "pairs" mode: Col 0 is Front, Col 1 is Back
      // In "repeated" mode: All cards are Front
      const side = mode === "repeated" ? "front" : c === 0 ? "front" : "back";
      const pairIndex = r;

      const finalX = isFlipped
        ? mirrorFlipX(xUnflipped, PAPER_A4_WIDTH_MM, cardW)
        : xUnflipped;

      slots.push({
        slotNumber,
        pairIndex,
        side,
        col: c,
        row: r,
        xMm: roundMm(finalX),
        yMm: roundMm(y),
        widthMm: cardW,
        heightMm: cardH,
        isFlipped,
      });

      slotNumber++;
    }
  }

  return {
    sheetType: "A4",
    sheetWidthMm: PAPER_A4_WIDTH_MM,
    sheetHeightMm: PAPER_A4_HEIGHT_MM,
    cardCount: slots.length,
    pairCount: rows,
    cols,
    rows,
    slots,
  };
}
