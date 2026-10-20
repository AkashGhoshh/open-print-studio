/**
 * Open Print Studio Core — Printer Calibration Mathematics
 */

import { Point2D } from "../geometry/point.js";
import { Rect2D } from "../geometry/rect.js";
import { roundMm } from "../constants/dpi.js";

export interface CalibrationProfile {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_CALIBRATION: CalibrationProfile = {
  scaleX: 1.0,
  scaleY: 1.0,
  offsetX: 0.0,
  offsetY: 0.0,
};

/**
 * Calculates hardware scale factor from target line length and measured line length.
 * Formula: scale = target / measured
 */
export function calculateScaleFactor(targetLengthMm: number, measuredLengthMm: number): number {
  if (measuredLengthMm <= 0) {
    throw new Error("Measured length must be greater than zero.");
  }
  return roundMm(targetLengthMm / measuredLengthMm, 4);
}

/**
 * Calculates linear origin offset from target position and measured position.
 * Formula: offset = target - measured
 */
export function calculateOffset(targetOriginMm: number, measuredOriginMm: number): number {
  return roundMm(targetOriginMm - measuredOriginMm, 2);
}

/**
 * Applies calibration scaling and offsets to a 2D millimeter point.
 */
export function calibratePoint(point: Point2D, profile: CalibrationProfile): Point2D {
  return {
    x: roundMm(point.x * profile.scaleX + profile.offsetX, 2),
    y: roundMm(point.y * profile.scaleY + profile.offsetY, 2),
  };
}

/**
 * Applies calibration scaling and offsets to a 2D millimeter rectangle.
 */
export function calibrateRect(rect: Rect2D, profile: CalibrationProfile): Rect2D {
  return {
    x: roundMm(rect.x * profile.scaleX + profile.offsetX, 2),
    y: roundMm(rect.y * profile.scaleY + profile.offsetY, 2),
    width: roundMm(rect.width * profile.scaleX, 2),
    height: roundMm(rect.height * profile.scaleY, 2),
  };
}

/**
 * Verifies if a physical dimension satisfies the required target tolerance.
 */
export function isWithinTolerance(measuredMm: number, targetMm: number, toleranceMm: number): boolean {
  return Math.abs(measuredMm - targetMm) <= toleranceMm;
}
