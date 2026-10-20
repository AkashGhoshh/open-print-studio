import { describe, it, expect } from "vitest";
import {
  resolveRelativeCrop,
  normalizeToCR80,
  isConformingCR80Aspect,
} from "../src/crop/card-normalizer";
import { CR80_DIMENSIONS, CR80_PIXELS_300DPI } from "../src/constants/dimensions";

describe("CR-80 Card Normalizer & Geometry", () => {
  it("resolves relative crop coordinates to absolute pixels accurately", () => {
    const sourceW = 2480;
    const sourceH = 3508;

    const crop = resolveRelativeCrop(
      { relX: 0.05, relY: 0.68, relW: 0.42, relH: 0.28 },
      sourceW,
      sourceH
    );

    expect(crop.x).toBe(124);
    expect(crop.y).toBe(2385);
    expect(crop.width).toBe(1042);
    expect(crop.height).toBe(982);
  });

  it("handles boundary clamping when relative crop reaches edges", () => {
    const crop = resolveRelativeCrop(
      { relX: 0.8, relY: 0.9, relW: 0.5, relH: 0.5 },
      1000,
      1000
    );

    expect(crop.x).toBe(800);
    expect(crop.y).toBe(900);
    expect(crop.width).toBe(200); // Clamped to 1000 - 800
    expect(crop.height).toBe(100); // Clamped to 1000 - 900
  });

  it("normalizes unrotated card to CR-80 300 DPI dimensions", () => {
    const sourceCrop = { x: 100, y: 100, width: 800, height: 500 };
    const result = normalizeToCR80(sourceCrop, 0, 300);

    expect(result.targetWidthMm).toBe(CR80_DIMENSIONS.widthMm); // 85.60 mm
    expect(result.targetHeightMm).toBe(CR80_DIMENSIONS.heightMm); // 53.98 mm
    expect(result.targetWidthPx).toBe(CR80_PIXELS_300DPI.width); // 1011 px
    expect(result.targetHeightPx).toBe(CR80_PIXELS_300DPI.height); // 638 px
    expect(result.rotation).toBe(0);
    expect(result.scaleFactorX).toBeCloseTo(1011 / 800, 3);
    expect(result.scaleFactorY).toBeCloseTo(638 / 500, 3);
  });

  it("normalizes 90-degree rotated card by inverting target dimensions", () => {
    const sourceCrop = { x: 100, y: 100, width: 500, height: 800 };
    const result = normalizeToCR80(sourceCrop, 90, 300);

    // Rotated 90 degrees: portrait orientation in target canvas
    expect(result.targetWidthMm).toBe(CR80_DIMENSIONS.heightMm); // 53.98 mm
    expect(result.targetHeightMm).toBe(CR80_DIMENSIONS.widthMm); // 85.60 mm
    expect(result.targetWidthPx).toBe(CR80_PIXELS_300DPI.height); // 638 px
    expect(result.targetHeightPx).toBe(CR80_PIXELS_300DPI.width); // 1011 px
    expect(result.rotation).toBe(90);
  });

  it("normalizes 270-degree rotated card correctly", () => {
    const sourceCrop = { x: 50, y: 50, width: 400, height: 700 };
    const result = normalizeToCR80(sourceCrop, 270, 300);

    expect(result.targetWidthPx).toBe(CR80_PIXELS_300DPI.height);
    expect(result.targetHeightPx).toBe(CR80_PIXELS_300DPI.width);
    expect(result.rotation).toBe(270);
  });

  it("verifies CR-80 aspect ratio conformance within 0.5% tolerance", () => {
    // Exact standard aspect ratio: 85.60 / 53.98 = ~1.58577
    expect(isConformingCR80Aspect(85.60, 53.98)).toBe(true);
    expect(isConformingCR80Aspect(1011, 638)).toBe(true);
    expect(isConformingCR80Aspect(638, 1011)).toBe(true);

    // Square (1:1) should fail
    expect(isConformingCR80Aspect(500, 500)).toBe(false);
    // 16:9 should fail
    expect(isConformingCR80Aspect(160, 90)).toBe(false);
  });
});
