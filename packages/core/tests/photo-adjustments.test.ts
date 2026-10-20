import { describe, it, expect } from "vitest";
import {
  applyPhotoAdjustments,
  compositeCutoutOverBackground,
  hexToRgb,
} from "../src/filters/photo-adjustments.js";

describe("Photo Adjustments & Studio Background Compositing", () => {
  it("parses 3-character and 6-character hex strings correctly", () => {
    expect(hexToRgb("#FFFFFF")).toEqual([255, 255, 255]);
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#FFF")).toEqual([255, 255, 255]);
    expect(hexToRgb("#2B6CB0")).toEqual([43, 108, 176]);
  });

  it("applies brightness adjustment with proper clamping [0, 255]", () => {
    const data = new Uint8ClampedArray([100, 100, 100, 255, 240, 240, 240, 255]);
    applyPhotoAdjustments(data, { brightness: 30 });

    expect(data[0]).toBe(130);
    expect(data[1]).toBe(130);
    expect(data[2]).toBe(130);
    // Clamping at 255
    expect(data[4]).toBe(255);
  });

  it("applies contrast expansion around midtone 128", () => {
    const data = new Uint8ClampedArray([100, 128, 150, 255]);
    applyPhotoAdjustments(data, { contrast: 20 });

    // Pixel below 128 gets pushed darker
    expect(data[0]).toBeLessThan(100);
    // Midtone 128 remains centered at 128
    expect(data[1]).toBe(128);
    // Pixel above 128 gets pushed brighter
    expect(data[2]).toBeGreaterThan(150);
  });

  it("applies saturation adjustment modifying chromatic variance", () => {
    const data = new Uint8ClampedArray([120, 100, 80, 255]);
    applyPhotoAdjustments(data, { saturation: 50 });

    // Saturation boost increases color differences from luminance
    expect(data[0]).toBeGreaterThan(120);
  });

  it("composites cutout portrait onto Studio Blue (#2B6CB0)", () => {
    // 2 pixels: 1st is pure foreground (alpha 255), 2nd is pure background (alpha 0)
    const rgba = new Uint8ClampedArray([
      200, 50, 50, 255, // Red foreground
      200, 50, 50, 255, // Initially same
    ]);
    const alphaMask = new Uint8ClampedArray([255, 0]);

    compositeCutoutOverBackground(rgba, alphaMask, "studio_blue");

    // Pixel 0 (alpha 255): retains foreground red (200, 50, 50)
    expect(rgba[0]).toBe(200);
    expect(rgba[1]).toBe(50);
    expect(rgba[2]).toBe(50);

    // Pixel 1 (alpha 0): replaced with Studio Blue rgb(43, 108, 176)
    expect(rgba[4]).toBe(43);
    expect(rgba[5]).toBe(108);
    expect(rgba[6]).toBe(176);
  });
});
