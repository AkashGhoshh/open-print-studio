/**
 * Open Print Studio Core — Geometric Transforms & Flip Invariance Math
 */

import { Point2D } from "./point.js";
import { Rect2D } from "./rect.js";

/**
 * Applies horizontal and vertical millimeter nudge offsets.
 */
export function applyNudge(point: Point2D, offsetX: number, offsetY: number): Point2D {
  return {
    x: point.x + offsetX,
    y: point.y + offsetY,
  };
}

/**
 * Applies calibration scaling factors centered on origin.
 */
export function applyScale(rect: Rect2D, scaleX: number, scaleY: number): Rect2D {
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}

/**
 * Computes mirrored X-coordinate for horizontal flip mode across a sheet.
 * Invariant: mirrorFlipX(mirrorFlipX(x, sheetWidth, itemWidth), sheetWidth, itemWidth) === x
 */
export function mirrorFlipX(x: number, sheetWidth: number, itemWidth: number): number {
  return sheetWidth - x - itemWidth;
}

/**
 * Reflects a complete 2D bounding box across the vertical axis of a sheet.
 */
export function mirrorFlipRect(rect: Rect2D, sheetWidth: number): Rect2D {
  return {
    x: mirrorFlipX(rect.x, sheetWidth, rect.width),
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}
