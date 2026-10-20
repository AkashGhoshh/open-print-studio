/**
 * Open Print Studio — Flip / Mirror Mathematical Invariance Test Template
 * Usage: Place in tests/unit/flip-mirror.test.ts
 */

import { describe, it, expect } from "vitest";

// Invariance formula: reflecting an image across the vertical axis twice
// must reproduce the original image pixel-for-pixel with zero difference.

function createTestBitmap(width: number, height: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  // Add asymmetric test pattern (distinct corners, text-like lines)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = (x * 7) % 256;     // R
      data[idx + 1] = (y * 11) % 256; // G
      data[idx + 2] = (x + y) % 256;  // B
      data[idx + 3] = 255;            // A
    }
  }
  return data;
}

function horizontalFlip(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const flipped = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = (y * width + (width - 1 - x)) * 4;
      flipped[dstIdx] = data[srcIdx];
      flipped[dstIdx + 1] = data[srcIdx + 1];
      flipped[dstIdx + 2] = data[srcIdx + 2];
      flipped[dstIdx + 3] = data[srcIdx + 3];
    }
  }
  return flipped;
}

describe("Flip / Mirror Mode Pixel Mathematical Equivalence", () => {
  it("proves double reflection reproduces original image pixel-for-pixel", () => {
    const width = 1011; // CR-80 width at 300 DPI
    const height = 638; // CR-80 height at 300 DPI

    const original = createTestBitmap(width, height);
    const flipped = horizontalFlip(original, width, height);
    const restored = horizontalFlip(flipped, width, height);

    // Sum of absolute pixel differences must be exactly zero
    let totalDifference = 0;
    for (let i = 0; i < original.length; i++) {
      totalDifference += Math.abs(original[i] - restored[i]);
    }

    expect(totalDifference).toBe(0);
  });
});
