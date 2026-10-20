import { describe, it, expect } from "vitest";
import {
  calculateScaleFactor,
  calculateOffset,
  calibratePoint,
  calibrateRect,
  isWithinTolerance,
} from "../src/calibration/calibration-math.js";
import { createPoint } from "../src/geometry/point.js";
import { createRect } from "../src/geometry/rect.js";
import { CR80_TOLERANCE_WIDTH_MM } from "../src/constants/dimensions.js";

describe("Core Calibration Mathematics", () => {
  it("calculates correct scale factors from physical measurements", () => {
    // If user measures 98mm for a 100mm target line, printer is under-scaling -> scale = 100/98 = 1.0204
    const scale = calculateScaleFactor(100.0, 98.0);
    expect(scale).toBe(1.0204);

    // If user measures 102mm for 100mm target -> scale = 100/102 = 0.9804
    const scaleOver = calculateScaleFactor(100.0, 102.0);
    expect(scaleOver).toBe(0.9804);
  });

  it("calculates origin offsets correctly", () => {
    // Target origin is 10mm, measured is 12mm -> offset = 10 - 12 = -2.0mm
    const offset = calculateOffset(10.0, 12.0);
    expect(offset).toBe(-2.0);
  });

  it("applies calibration profile to points and rects", () => {
    const profile = { scaleX: 1.02, scaleY: 0.98, offsetX: -1.0, offsetY: 0.5 };
    const pt = createPoint(50.0, 100.0);
    const calibratedPt = calibratePoint(pt, profile);

    // X: 50 * 1.02 + (-1.0) = 51.0 - 1.0 = 50.0
    // Y: 100 * 0.98 + 0.5 = 98.0 + 0.5 = 98.5
    expect(calibratedPt.x).toBe(50.0);
    expect(calibratedPt.y).toBe(98.5);

    const r = createRect(10.0, 10.0, 80.0, 50.0);
    const calibratedR = calibrateRect(r, profile);
    expect(calibratedR.width).toBe(81.6);
    expect(calibratedR.height).toBe(49.0);
  });

  it("verifies tolerance boundary checks", () => {
    expect(isWithinTolerance(85.8, 85.6, CR80_TOLERANCE_WIDTH_MM)).toBe(true);
    expect(isWithinTolerance(86.2, 85.6, CR80_TOLERANCE_WIDTH_MM)).toBe(false);
  });
});
