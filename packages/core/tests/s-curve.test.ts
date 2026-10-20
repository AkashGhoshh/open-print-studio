import { describe, it, expect } from "vitest";
import { transformLuminance, applyTextDarkening } from "../src/filters/s-curve.js";

describe("Core S-Curve Faint Text Darkener", () => {
  it("leaves luminance completely unchanged at level 0", () => {
    expect(transformLuminance(150, 0)).toBe(150);
    expect(transformLuminance(80, 0)).toBe(80);
  });

  it("darkens mid-range faint text at level 3", () => {
    const original = 150;
    const darkened = transformLuminance(original, 3);
    expect(darkened).toBeLessThan(original);
  });

  it("strictly protects white paper background (> 220)", () => {
    expect(transformLuminance(230, 5)).toBe(230);
    expect(transformLuminance(255, 5)).toBe(255);
  });

  it("mutates pixel buffer with text darkening", () => {
    // 2 pixels: one faint gray (160, 160, 160), one white (240, 240, 240)
    const pixels = new Uint8ClampedArray([
      160, 160, 160, 255,
      240, 240, 240, 255,
    ]);

    applyTextDarkening(pixels, 3);

    // Faint gray pixel should be darkened
    expect(pixels[0]).toBeLessThan(160);
    expect(pixels[1]).toBeLessThan(160);
    expect(pixels[2]).toBeLessThan(160);

    // White pixel should remain unchanged
    expect(pixels[4]).toBe(240);
    expect(pixels[5]).toBe(240);
    expect(pixels[6]).toBe(240);
  });
});
