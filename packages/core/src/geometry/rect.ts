/**
 * Open Print Studio Core — 2D Rect Bounding Primitives
 */

export interface Rect2D {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface RelativeRect {
  readonly relX: number; // 0.0 to 1.0
  readonly relY: number;
  readonly relW: number;
  readonly relH: number;
}

export function createRect(x: number, y: number, width: number, height: number): Rect2D {
  return { x, y, width, height };
}

/**
 * Converts a relative bounding box [0..1] to absolute coordinates on a canvas/sheet.
 */
export function relativeToAbsolute(rel: RelativeRect, containerWidth: number, containerHeight: number): Rect2D {
  return {
    x: rel.relX * containerWidth,
    y: rel.relY * containerHeight,
    width: rel.relW * containerWidth,
    height: rel.relH * containerHeight,
  };
}

/**
 * Converts absolute rectangle coordinates into relative [0..1] box.
 */
export function absoluteToRelative(rect: Rect2D, containerWidth: number, containerHeight: number): RelativeRect {
  return {
    relX: rect.x / containerWidth,
    relY: rect.y / containerHeight,
    relW: rect.width / containerWidth,
    relH: rect.height / containerHeight,
  };
}

/**
 * Checks if two rectangles intersect.
 */
export function rectsIntersect(r1: Rect2D, r2: Rect2D): boolean {
  return !(
    r2.x >= r1.x + r1.width ||
    r2.x + r2.width <= r1.x ||
    r2.y >= r1.y + r1.height ||
    r2.y + r2.height <= r1.y
  );
}

/**
 * Clamps a rectangle within container boundaries.
 */
export function clampRect(rect: Rect2D, maxWidth: number, maxHeight: number): Rect2D {
  const x = Math.max(0, Math.min(rect.x, maxWidth));
  const y = Math.max(0, Math.min(rect.y, maxHeight));
  const width = Math.max(0, Math.min(rect.width, maxWidth - x));
  const height = Math.max(0, Math.min(rect.height, maxHeight - y));
  return { x, y, width, height };
}
