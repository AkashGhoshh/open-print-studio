import { describe, it, expect } from "vitest";
import {
  verifyDisclaimerSafety,
  applyDisclaimerMask,
  PROTECTED_ZONES,
  PERMITTED_DISCLAIMER_BOUNDS,
  boxesIntersect,
  regionToBoundingBox,
} from "../src/crop/disclaimer-cleaner";

describe("Opt-in Disclaimer Cleaner & Pixel Integrity Safeguards", () => {
  it("approves valid disclaimer box falling strictly within permitted zone", () => {
    // Valid region: Y: 0.93 - 0.98, X: 0.10 - 0.90
    const validRegion = {
      relX: 0.10,
      relY: 0.93,
      relW: 0.80,
      relH: 0.05,
    };

    const result = verifyDisclaimerSafety(validRegion);
    expect(result.safe).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("rejects disclaimer region that extends above permitted Y minimum (Y < 0.92)", () => {
    const creepingRegion = {
      relX: 0.10,
      relY: 0.89, // Creeping into card body
      relW: 0.80,
      relH: 0.08,
    };

    const result = verifyDisclaimerSafety(creepingRegion);
    expect(result.safe).toBe(false);
    expect(result.violations.some((v) => v.includes("exceeds permitted boundary"))).toBe(true);
  });

  it("strictly rejects any region intersecting the identity photo zone", () => {
    // Photo zone is [0.05, 0.35] x [0.20, 0.75]
    const photoIntersecting = {
      relX: 0.10,
      relY: 0.30,
      relW: 0.20,
      relH: 0.30,
    };

    const result = verifyDisclaimerSafety(photoIntersecting);
    expect(result.safe).toBe(false);
    expect(result.violations.some((v) => v.includes("photo"))).toBe(true);
  });

  it("strictly rejects any region intersecting the QR code zone", () => {
    // QR zone is [0.65, 0.95] x [0.20, 0.70]
    const qrIntersecting = {
      relX: 0.70,
      relY: 0.25,
      relW: 0.20,
      relH: 0.30,
    };

    const result = verifyDisclaimerSafety(qrIntersecting);
    expect(result.safe).toBe(false);
    expect(result.violations.some((v) => v.includes("qrCode"))).toBe(true);
  });

  it("strictly rejects any region intersecting demographic text zone", () => {
    // Demographics is [0.35, 0.95] x [0.20, 0.90]
    const demoIntersecting = {
      relX: 0.40,
      relY: 0.85,
      relW: 0.50,
      relH: 0.08,
    };

    const result = verifyDisclaimerSafety(demoIntersecting);
    expect(result.safe).toBe(false);
    expect(result.violations.some((v) => v.includes("demographics"))).toBe(true);
  });

  it("proves mathematical pixel integrity: protected zones are 100% untouched", () => {
    // Create synthetic 1000 x 1000 image buffer (RGBA)
    const width = 1000;
    const height = 1000;
    const original = new Uint8ClampedArray(width * height * 4);

    // Populate image with distinct test patterns
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        original[idx] = (x * 7) % 256;      // R
        original[idx + 1] = (y * 11) % 256; // G
        original[idx + 2] = (x + y) % 256;  // B
        original[idx + 3] = 255;            // A
      }
    }

    // Clone buffer for patching
    const patched = new Uint8ClampedArray(original);

    // Safe disclaimer region
    const disclaimerRegion = {
      relX: 0.10,
      relY: 0.93,
      relW: 0.80,
      relH: 0.04,
    };

    const maskResult = applyDisclaimerMask(patched, width, height, disclaimerRegion, [255, 255, 255]);
    expect(maskResult.pixelsModified).toBeGreaterThan(0);

    // VERIFICATION: Check EVERY pixel in all protected zones.
    // Sum of absolute differences must be identically 0.
    for (const [zoneName, zone] of Object.entries(PROTECTED_ZONES)) {
      const startX = Math.round(zone.minX * width);
      const endX = Math.round(zone.maxX * width);
      const startY = Math.round(zone.minY * height);
      const endY = Math.round(zone.maxY * height);

      let deltaSum = 0;
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          deltaSum += Math.abs(patched[idx] - original[idx]);
          deltaSum += Math.abs(patched[idx + 1] - original[idx + 1]);
          deltaSum += Math.abs(patched[idx + 2] - original[idx + 2]);
        }
      }

      expect(deltaSum, `Integrity failed for protected zone '${zoneName}'! Delta: ${deltaSum}`).toBe(0);
    }

    // Verify that the disclaimer region WAS modified to white
    const discStartX = Math.round(disclaimerRegion.relX * width);
    const discStartY = Math.round(disclaimerRegion.relY * height);
    const testIdx = (discStartY * width + discStartX) * 4;
    expect(patched[testIdx]).toBe(255);
    expect(patched[testIdx + 1]).toBe(255);
    expect(patched[testIdx + 2]).toBe(255);
  });

  it("throws error and refuses to patch when given an unsafe region", () => {
    const width = 100;
    const height = 100;
    const buffer = new Uint8ClampedArray(width * height * 4);

    const unsafeRegion = {
      relX: 0.10,
      relY: 0.50, // Clearly in photo zone
      relW: 0.50,
      relH: 0.20,
    };

    expect(() => {
      applyDisclaimerMask(buffer, width, height, unsafeRegion);
    }).toThrow(/Cannot apply disclaimer mask: Unsafe region/);
  });
});
