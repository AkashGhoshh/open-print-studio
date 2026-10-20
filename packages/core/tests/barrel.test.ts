import { describe, it, expect } from "vitest";
import * as Core from "../src/index.js";

describe("Core Public API Barrel and Uncovered Branches", () => {
  it("exports all public symbols from index.ts barrel", () => {
    expect(Core.STANDARD_DPI).toBe(300);
    expect(Core.CR80_WIDTH_MM).toBe(85.6);
    expect(typeof Core.mmToPx).toBe("function");
    expect(typeof Core.solveLayout).toBe("function");
    expect(typeof Core.calibratePoint).toBe("function");
    expect(typeof Core.transformLuminance).toBe("function");
  });

  it("tests mmToPxFloat function", () => {
    const px = Core.mmToPxFloat(25.4, 300);
    expect(px).toBe(300);
  });

  it("tests applyNudge and applyScale transforms", () => {
    const pt = Core.createPoint(10, 20);
    const nudged = Core.applyNudge(pt, 2, -3);
    expect(nudged).toEqual({ x: 12, y: 17 });

    const rect = Core.createRect(10, 20, 30, 40);
    const scaled = Core.applyScale(rect, 1.5, 2.0);
    expect(scaled).toEqual({ x: 15, y: 40, width: 45, height: 80 });
  });

  it("throws error when measured calibration length is <= 0", () => {
    expect(() => Core.calculateScaleFactor(100, 0)).toThrow("greater than zero");
    expect(() => Core.calculateScaleFactor(100, -5)).toThrow("greater than zero");
  });

  it("handles autoCenter: false in layout solver", () => {
    const result = Core.solveLayout({
      paperWidthMm: 210,
      paperHeightMm: 297,
      itemWidthMm: 85.6,
      itemHeightMm: 53.98,
      gapX: 4,
      gapY: 2.5,
      autoCenter: false,
      marginsMm: { left: 15, top: 12 },
    });

    expect(result.isValid).toBe(true);
    expect(result.actualMarginsMm.left).toBe(15);
    expect(result.actualMarginsMm.top).toBe(12);
  });
});
