/**
 * Open Print Studio Core — DPI & Unit Conversion Constants
 * 100% pure TypeScript, zero dependencies.
 */

export const STANDARD_DPI = 300;
export const MM_PER_INCH = 25.4;
export const PX_PER_MM_300DPI = STANDARD_DPI / MM_PER_INCH; // ~11.8110236 px/mm

/**
 * Converts millimeters to integer pixels at specified DPI.
 */
export function mmToPx(mm: number, dpi: number = STANDARD_DPI): number {
  return Math.round(mm * (dpi / MM_PER_INCH));
}

/**
 * Converts millimeters to exact floating-point pixels at specified DPI.
 */
export function mmToPxFloat(mm: number, dpi: number = STANDARD_DPI): number {
  return mm * (dpi / MM_PER_INCH);
}

/**
 * Converts pixels to millimeters at specified DPI.
 */
export function pxToMm(px: number, dpi: number = STANDARD_DPI): number {
  return (px * MM_PER_INCH) / dpi;
}

/**
 * Rounds a millimeter value to specified decimal places (default: 2).
 */
export function roundMm(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
