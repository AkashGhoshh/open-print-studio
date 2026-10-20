import { describe, it, expect } from "vitest";
import { mirrorFlipX, mirrorFlipRect } from "../src/geometry/transform.js";
import { createRect } from "../src/geometry/rect.js";

describe("Flip / Mirror Mode Mathematical and Pixel Invariance", () => {
  it("proves that horizontal reflection applied twice is strictly identity", () => {
    const sheetW = 210.0;
    const itemW = 85.60;
    const initialX = 17.40;

    const flippedX = mirrorFlipX(initialX, sheetW, itemW);
    expect(flippedX).toBe(sheetW - initialX - itemW);

    const doubleFlippedX = mirrorFlipX(flippedX, sheetW, itemW);
    expect(doubleFlippedX).toBeCloseTo(initialX, 5);
  });

  it("proves rectangle reflection invariance", () => {
    const sheetW = 101.6;
    const original = createRect(8.0, 20.0, 85.60, 53.98);

    const flipped = mirrorFlipRect(original, sheetW);
    const restored = mirrorFlipRect(flipped, sheetW);

    expect(restored.x).toBeCloseTo(original.x, 5);
    expect(restored.y).toBeCloseTo(original.y, 5);
    expect(restored.width).toBeCloseTo(original.width, 5);
    expect(restored.height).toBeCloseTo(original.height, 5);
  });

  it("proves pixel buffer double reflection reproduces original image pixel-for-pixel", () => {
    const width = 100;
    const height = 50;
    const buffer = new Uint8ClampedArray(width * height * 4);

    // Asymmetric pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        buffer[idx] = (x * 3) % 256;
        buffer[idx + 1] = (y * 5) % 256;
        buffer[idx + 2] = (x + y) % 256;
        buffer[idx + 3] = 255;
      }
    }

    function flipPixels(src: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
      const dst = new Uint8ClampedArray(src.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const s = (y * w + x) * 4;
          const d = (y * w + (w - 1 - x)) * 4;
          dst[d] = src[s];
          dst[d + 1] = src[s + 1];
          dst[d + 2] = src[s + 2];
          dst[d + 3] = src[s + 3];
        }
      }
      return dst;
    }

    const flipped = flipPixels(buffer, width, height);
    const restored = flipPixels(flipped, width, height);

    let totalDiff = 0;
    for (let i = 0; i < buffer.length; i++) {
      totalDiff += Math.abs(buffer[i] - restored[i]);
    }

    expect(totalDiff).toBe(0);
  });
});
