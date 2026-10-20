import { describe, it, expect } from "vitest";
import { applyPaperFinishTransform } from "../src/filters/finish-presets.js";

describe("Paper Finish Presets Filter", () => {
  it("leaves pixel buffer completely untouched for 'plain' finish", () => {
    const data = new Uint8ClampedArray([10, 50, 100, 255, 200, 150, 50, 255]);
    const clone = new Uint8ClampedArray(data);
    applyPaperFinishTransform(data, "plain");
    expect(data).toEqual(clone);
  });

  it("applies glossy curve without blowing out white point or crushing black", () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 255,       // pure black
      128, 128, 128, 255, // midtone
      255, 255, 255, 255  // pure white
    ]);
    applyPaperFinishTransform(data, "glossy");

    // Pure black remains at or near 0
    expect(data[0]).toBe(0);
    // Pure white clamped to 255
    expect(data[8]).toBe(255);
    // Midtones remain bounded
    expect(data[4]).toBeGreaterThan(0);
    expect(data[4]).toBeLessThan(255);
  });

  it("applies matte curve lifting deep blacks to prevent ink pooling", () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    applyPaperFinishTransform(data, "matte");

    // Black is lifted to 5
    expect(data[0]).toBe(5);
    expect(data[1]).toBe(5);
    expect(data[2]).toBe(5);

    // White is compressed to 250
    expect(data[4]).toBe(250);
    expect(data[5]).toBe(250);
    expect(data[6]).toBe(250);
  });
});
