/**
 * Open Print Studio Core — Dynamic Multi-Up Layout Solver
 * Mathematical row/column solver with dual-orientation testing & margin distribution.
 */

import { roundMm } from "../constants/dpi.js";

export interface LayoutMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutSolverInput {
  paperWidthMm: number;
  paperHeightMm: number;
  itemWidthMm: number;
  itemHeightMm: number;
  gapX: number;
  gapY: number;
  marginsMm?: Partial<LayoutMargins>;
  allowRotation?: boolean;
  autoCenter?: boolean;
}

export interface LayoutSlotPosition {
  index: number;
  colIndex: number;
  rowIndex: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  isRotated: boolean;
}

export interface LayoutSolverResult {
  cols: number;
  rows: number;
  totalCapacity: number;
  isRotated: boolean;
  actualMarginsMm: LayoutMargins;
  slots: LayoutSlotPosition[];
  isValid: boolean;
  warningMessage?: string;
}

interface SingleOrientationResult {
  cols: number;
  rows: number;
  capacity: number;
  usedW: number;
  usedH: number;
  remW: number;
  remH: number;
  effectiveItemW: number;
  effectiveItemH: number;
  isRotated: boolean;
}

function solveSingleOrientation(
  paperW: number,
  paperH: number,
  effectiveW: number,
  effectiveH: number,
  gapX: number,
  gapY: number,
  minMargins: LayoutMargins,
  isRotated: boolean
): SingleOrientationResult {
  const availW = paperW - minMargins.left - minMargins.right;
  const availH = paperH - minMargins.top - minMargins.bottom;

  if (availW < effectiveW || availH < effectiveH) {
    return {
      cols: 0,
      rows: 0,
      capacity: 0,
      usedW: 0,
      usedH: 0,
      remW: paperW,
      remH: paperH,
      effectiveItemW: effectiveW,
      effectiveItemH: effectiveH,
      isRotated,
    };
  }

  const cols = Math.floor((availW + gapX) / (effectiveW + gapX));
  const rows = Math.floor((availH + gapY) / (effectiveH + gapY));
  const capacity = cols * rows;

  const usedW = cols > 0 ? cols * effectiveW + (cols - 1) * gapX : 0;
  const usedH = rows > 0 ? rows * effectiveH + (rows - 1) * gapY : 0;

  return {
    cols,
    rows,
    capacity,
    usedW,
    usedH,
    remW: paperW - usedW,
    remH: paperH - usedH,
    effectiveItemW: effectiveW,
    effectiveItemH: effectiveH,
    isRotated,
  };
}

/**
 * Solves optimal multi-up item placement on paper sheet.
 */
export function solveLayout(input: LayoutSolverInput): LayoutSolverResult {
  const {
    paperWidthMm,
    paperHeightMm,
    itemWidthMm,
    itemHeightMm,
    gapX,
    gapY,
    marginsMm = {},
    allowRotation = true,
    autoCenter = true,
  } = input;

  const defaultMargins: LayoutMargins = {
    top: marginsMm.top ?? 5.0,
    right: marginsMm.right ?? 5.0,
    bottom: marginsMm.bottom ?? 5.0,
    left: marginsMm.left ?? 5.0,
  };

  // Try normal orientation
  const normalRes = solveSingleOrientation(
    paperWidthMm,
    paperHeightMm,
    itemWidthMm,
    itemHeightMm,
    gapX,
    gapY,
    defaultMargins,
    false
  );

  let best = normalRes;

  // Try rotated orientation if allowed
  if (allowRotation) {
    const rotatedRes = solveSingleOrientation(
      paperWidthMm,
      paperHeightMm,
      itemHeightMm, // rotated W
      itemWidthMm,  // rotated H
      gapX,
      gapY,
      defaultMargins,
      true
    );

    if (rotatedRes.capacity > normalRes.capacity) {
      best = rotatedRes;
    }
  }

  if (best.capacity === 0) {
    return {
      cols: 0,
      rows: 0,
      totalCapacity: 0,
      isRotated: false,
      actualMarginsMm: defaultMargins,
      slots: [],
      isValid: false,
      warningMessage: "Item dimensions exceed available printable area.",
    };
  }

  // Calculate actual margins (center alignment if requested)
  const actualMargins: LayoutMargins = autoCenter
    ? {
        left: roundMm(best.remW / 2, 2),
        right: roundMm(best.remW / 2, 2),
        top: roundMm(best.remH / 2, 2),
        bottom: roundMm(best.remH / 2, 2),
      }
    : {
        left: defaultMargins.left,
        right: roundMm(paperWidthMm - defaultMargins.left - best.usedW, 2),
        top: defaultMargins.top,
        bottom: roundMm(paperHeightMm - defaultMargins.top - best.usedH, 2),
      };

  // Generate slot coordinates
  const slots: LayoutSlotPosition[] = [];
  let index = 0;
  for (let r = 0; r < best.rows; r++) {
    for (let c = 0; c < best.cols; c++) {
      const x = actualMargins.left + c * (best.effectiveItemW + gapX);
      const y = actualMargins.top + r * (best.effectiveItemH + gapY);

      slots.push({
        index,
        colIndex: c,
        rowIndex: r,
        xMm: roundMm(x, 2),
        yMm: roundMm(y, 2),
        widthMm: best.effectiveItemW,
        heightMm: best.effectiveItemH,
        isRotated: best.isRotated,
      });
      index++;
    }
  }

  return {
    cols: best.cols,
    rows: best.rows,
    totalCapacity: best.capacity,
    isRotated: best.isRotated,
    actualMarginsMm: actualMargins,
    slots,
    isValid: true,
  };
}
