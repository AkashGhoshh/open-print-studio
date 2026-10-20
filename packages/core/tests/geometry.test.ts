import { describe, it, expect } from "vitest";
import { createPoint, addPoints, subtractPoints, scalePoint } from "../src/geometry/point.js";
import {
  createRect,
  relativeToAbsolute,
  absoluteToRelative,
  rectsIntersect,
  clampRect,
} from "../src/geometry/rect.js";

describe("Core 2D Geometry Primitives", () => {
  it("performs point arithmetic accurately", () => {
    const p1 = createPoint(10, 20);
    const p2 = createPoint(5, 15);

    expect(addPoints(p1, p2)).toEqual({ x: 15, y: 35 });
    expect(subtractPoints(p1, p2)).toEqual({ x: 5, y: 5 });
    expect(scalePoint(p1, 2.5)).toEqual({ x: 25, y: 50 });
  });

  it("converts relative bounding boxes to absolute and back", () => {
    const rel = { relX: 0.1, relY: 0.2, relW: 0.5, relH: 0.4 };
    const containerW = 1000;
    const containerH = 800;

    const abs = relativeToAbsolute(rel, containerW, containerH);
    expect(abs).toEqual({ x: 100, y: 160, width: 500, height: 320 });

    const relBack = absoluteToRelative(abs, containerW, containerH);
    expect(relBack.relX).toBeCloseTo(0.1);
    expect(relBack.relY).toBeCloseTo(0.2);
    expect(relBack.relW).toBeCloseTo(0.5);
    expect(relBack.relH).toBeCloseTo(0.4);
  });

  it("detects rectangle intersections", () => {
    const r1 = createRect(0, 0, 100, 100);
    const r2 = createRect(50, 50, 100, 100);
    const r3 = createRect(150, 150, 50, 50);

    expect(rectsIntersect(r1, r2)).toBe(true);
    expect(rectsIntersect(r1, r3)).toBe(false);
  });

  it("clamps rectangles within container boundaries", () => {
    const overflowRect = createRect(-10, -5, 200, 300);
    const clamped = clampRect(overflowRect, 150, 250);

    expect(clamped.x).toBe(0);
    expect(clamped.y).toBe(0);
    expect(clamped.width).toBe(150);
    expect(clamped.height).toBe(250);
  });
});
