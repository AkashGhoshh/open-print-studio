/**
 * Open Print Studio Core — Vector Cut Marks & Trim Guides
 * 
 * Generates millimeter-accurate L-marks and corner ticks around cards
 * to guide physical guillotine or scissors cutting.
 */

import type { SheetSlot } from "./sheet-presets.js";
import { roundMm } from "../constants/dpi.js";

export interface CutMarkSegment {
  x1Mm: number;
  y1Mm: number;
  x2Mm: number;
  y2Mm: number;
  strokeWidthMm: number;
}

/**
 * Generates corner cut marks around each slot on a print sheet.
 * Mark length default is 3.5 mm; stroke width default is 0.20 mm.
 */
export function generateSlotCutMarks(
  slots: SheetSlot[],
  markLengthMm = 3.5,
  strokeWidthMm = 0.20
): CutMarkSegment[] {
  const marks: CutMarkSegment[] = [];

  for (const s of slots) {
    const x = s.xMm;
    const y = s.yMm;
    const w = s.widthMm;
    const h = s.heightMm;

    // --- Top-Left Corner ---
    // Horizontal tick extending left
    marks.push({
      x1Mm: roundMm(x - markLengthMm, 2),
      y1Mm: roundMm(y, 2),
      x2Mm: roundMm(x, 2),
      y2Mm: roundMm(y, 2),
      strokeWidthMm,
    });
    // Vertical tick extending up
    marks.push({
      x1Mm: roundMm(x, 2),
      y1Mm: roundMm(y - markLengthMm, 2),
      x2Mm: roundMm(x, 2),
      y2Mm: roundMm(y, 2),
      strokeWidthMm,
    });

    // --- Top-Right Corner ---
    // Horizontal tick extending right
    marks.push({
      x1Mm: roundMm(x + w, 2),
      y1Mm: roundMm(y, 2),
      x2Mm: roundMm(x + w + markLengthMm, 2),
      y2Mm: roundMm(y, 2),
      strokeWidthMm,
    });
    // Vertical tick extending up
    marks.push({
      x1Mm: roundMm(x + w, 2),
      y1Mm: roundMm(y - markLengthMm, 2),
      x2Mm: roundMm(x + w, 2),
      y2Mm: roundMm(y, 2),
      strokeWidthMm,
    });

    // --- Bottom-Left Corner ---
    // Horizontal tick extending left
    marks.push({
      x1Mm: roundMm(x - markLengthMm, 2),
      y1Mm: roundMm(y + h, 2),
      x2Mm: roundMm(x, 2),
      y2Mm: roundMm(y + h, 2),
      strokeWidthMm,
    });
    // Vertical tick extending down
    marks.push({
      x1Mm: roundMm(x, 2),
      y1Mm: roundMm(y + h, 2),
      x2Mm: roundMm(x, 2),
      y2Mm: roundMm(y + h + markLengthMm, 2),
      strokeWidthMm,
    });

    // --- Bottom-Right Corner ---
    // Horizontal tick extending right
    marks.push({
      x1Mm: roundMm(x + w, 2),
      y1Mm: roundMm(y + h, 2),
      x2Mm: roundMm(x + w + markLengthMm, 2),
      y2Mm: roundMm(y + h, 2),
      strokeWidthMm,
    });
    // Vertical tick extending down
    marks.push({
      x1Mm: roundMm(x + w, 2),
      y1Mm: roundMm(y + h, 2),
      x2Mm: roundMm(x + w, 2),
      y2Mm: roundMm(y + h + markLengthMm, 2),
      strokeWidthMm,
    });
  }

  return marks;
}
