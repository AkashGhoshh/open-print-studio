/**
 * Open Print Studio — Opt-In Disclaimer Cleaner & Pixel Integrity Safeguards
 * 
 * Based on ADR-009 and Clean-Room ID Document Pipeline rules.
 * Strictly verifies zero overlap with identity, photo, and QR regions.
 */

import type { RelativeCropRegion } from "./card-normalizer.js";

export interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Hard Protected Zones on standard e-Aadhaar cards (relative [0, 1] coordinates)
 */
export const PROTECTED_ZONES: Record<string, BoundingBox2D> = {
  photo: { minX: 0.05, minY: 0.20, maxX: 0.35, maxY: 0.75 },
  qrCode: { minX: 0.65, minY: 0.20, maxX: 0.95, maxY: 0.70 },
  demographics: { minX: 0.35, minY: 0.20, maxX: 0.95, maxY: 0.90 },
};

/**
 * Permitted legal disclaimer boundary according to ADR-009
 */
export const PERMITTED_DISCLAIMER_BOUNDS: BoundingBox2D = {
  minX: 0.05,
  minY: 0.92,
  maxX: 0.95,
  maxY: 0.985,
};

/**
 * Checks whether two 2D bounding boxes overlap
 */
export function boxesIntersect(a: BoundingBox2D, b: BoundingBox2D): boolean {
  return !(
    a.maxX <= b.minX ||
    a.minX >= b.maxX ||
    a.maxY <= b.minY ||
    a.minY >= b.maxY
  );
}

/**
 * Converts RelativeCropRegion to BoundingBox2D
 */
export function regionToBoundingBox(region: RelativeCropRegion): BoundingBox2D {
  return {
    minX: region.relX,
    minY: region.relY,
    maxX: region.relX + region.relW,
    maxY: region.relY + region.relH,
  };
}

/**
 * Mathematically verifies that a proposed disclaimer region:
 * 1. Falls within the permitted bottom zone [0.92, 0.985] x [0.05, 0.95]
 * 2. Has ZERO intersection with identity photo, QR, or demographic text
 */
export function verifyDisclaimerSafety(region: RelativeCropRegion): {
  safe: boolean;
  violations: string[];
} {
  const box = regionToBoundingBox(region);
  const violations: string[] = [];

  const EPSILON = 1e-5;

  // Check 1: Must fall inside permitted disclaimer bounds (with floating-point epsilon tolerance)
  if (
    box.minX < PERMITTED_DISCLAIMER_BOUNDS.minX - EPSILON ||
    box.maxX > PERMITTED_DISCLAIMER_BOUNDS.maxX + EPSILON ||
    box.minY < PERMITTED_DISCLAIMER_BOUNDS.minY - EPSILON ||
    box.maxY > PERMITTED_DISCLAIMER_BOUNDS.maxY + EPSILON
  ) {
    violations.push(
      `Disclaimer box (${box.minX.toFixed(3)}, ${box.minY.toFixed(3)} to ${box.maxX.toFixed(3)}, ${box.maxY.toFixed(3)}) exceeds permitted boundary (${PERMITTED_DISCLAIMER_BOUNDS.minX}, ${PERMITTED_DISCLAIMER_BOUNDS.minY} to ${PERMITTED_DISCLAIMER_BOUNDS.maxX}, ${PERMITTED_DISCLAIMER_BOUNDS.maxY})`
    );
  }

  // Check 2: Must NOT intersect any protected zone
  for (const [zoneName, zoneBox] of Object.entries(PROTECTED_ZONES)) {
    if (boxesIntersect(box, zoneBox)) {
      violations.push(`Disclaimer region intersects protected zone '${zoneName}'`);
    }
  }

  return {
    safe: violations.length === 0,
    violations,
  };
}

/**
 * Safely applies disclaimer cleaning mask to a raw RGBA pixel buffer
 * If safety verification fails, an Error is thrown and no pixels are modified.
 */
export function applyDisclaimerMask(
  pixelData: Uint8ClampedArray | Uint8Array,
  imageWidth: number,
  imageHeight: number,
  region: RelativeCropRegion,
  fillColor: [number, number, number] = [255, 255, 255]
): { pixelsModified: number } {
  const verification = verifyDisclaimerSafety(region);
  if (!verification.safe) {
    throw new Error(
      `Cannot apply disclaimer mask: Unsafe region! Violations:\n${verification.violations.join("\n")}`
    );
  }

  const startX = Math.max(0, Math.round(region.relX * imageWidth));
  const startY = Math.max(0, Math.round(region.relY * imageHeight));
  const endX = Math.min(imageWidth, Math.round((region.relX + region.relW) * imageWidth));
  const endY = Math.min(imageHeight, Math.round((region.relY + region.relH) * imageHeight));

  let pixelsModified = 0;
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * imageWidth + x) * 4;
      pixelData[idx] = fillColor[0];     // R
      pixelData[idx + 1] = fillColor[1]; // G
      pixelData[idx + 2] = fillColor[2]; // B
      // Alpha remains 255
      pixelData[idx + 3] = 255;
      pixelsModified++;
    }
  }

  return { pixelsModified };
}
