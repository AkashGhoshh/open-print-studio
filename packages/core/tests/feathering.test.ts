import { describe, it, expect } from "vitest";
import {
  checkLowResolution,
  applyAlphaFeathering,
} from "../src/filters/feathering.js";

describe("Alpha Feathering & Resolution Guard Filter", () => {
  it("detects low-resolution images (< 600 px) and raises warning", () => {
    const low = checkLowResolution(400, 500, 600);
    expect(low.isLowRes).toBe(true);
    expect(low.warning).toContain("Low resolution image detected");

    const high = checkLowResolution(800, 1200, 600);
    expect(high.isLowRes).toBe(false);
    expect(high.warning).toBeUndefined();
  });

  it("applies 1.5px Gaussian smoothing to soften hard mask transitions", () => {
    // 4x4 binary mask with a hard vertical boundary (left 0, right 255)
    const mask = new Uint8ClampedArray([
      0, 0, 255, 255,
      0, 0, 255, 255,
      0, 0, 255, 255,
      0, 0, 255, 255,
    ]);

    const feathered = applyAlphaFeathering(mask, 4, 4);

    // Boundary column (x=1) should be smoothed up from 0
    expect(feathered[1]).toBeGreaterThan(0);
    expect(feathered[1]).toBeLessThan(255);

    // Boundary column (x=2) should be smoothed down from 255
    expect(feathered[2]).toBeLessThan(255);
    expect(feathered[2]).toBeGreaterThan(0);

    // Monotonic gradient from x=0 to x=3
    expect(feathered[0]).toBeLessThan(feathered[1]);
    expect(feathered[1]).toBeLessThan(feathered[2]);
    expect(feathered[2]).toBeLessThan(feathered[3]);
  });
});
