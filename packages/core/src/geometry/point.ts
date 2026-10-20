/**
 * Open Print Studio Core — 2D Point Primitives
 */

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export function createPoint(x: number, y: number): Point2D {
  return { x, y };
}

export function addPoints(p1: Point2D, p2: Point2D): Point2D {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function subtractPoints(p1: Point2D, p2: Point2D): Point2D {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

export function scalePoint(p: Point2D, factor: number): Point2D {
  return { x: p.x * factor, y: p.y * factor };
}
