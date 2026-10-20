/**
 * Open Print Studio — CR-80 Card Normalizer & Geometry
 * 
 * Computes exact coordinate transformations from page relative crops to CR-80 dimensions.
 * Pure TypeScript, zero external dependencies.
 */

import { CR80_DIMENSIONS, CR80_PIXELS_300DPI } from "../constants/dimensions";
import { mmToPx } from "../constants/dpi";

export type RotationAngle = 0 | 90 | 180 | 270;

export interface RelativeCropRegion {
  relX: number; // 0.0 - 1.0
  relY: number; // 0.0 - 1.0
  relW: number; // 0.0 - 1.0
  relH: number; // 0.0 - 1.0
  rotation?: RotationAngle;
}

export interface AbsolutePixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedCardResult {
  sourceCrop: AbsolutePixelCrop;
  targetWidthPx: number;
  targetHeightPx: number;
  targetWidthMm: number;
  targetHeightMm: number;
  aspectRatio: number;
  scaleFactorX: number;
  scaleFactorY: number;
  rotation: RotationAngle;
}

/**
 * Calculates absolute pixel coordinates from relative crop on a source image
 */
export function resolveRelativeCrop(
  relativeCrop: RelativeCropRegion,
  sourceWidth: number,
  sourceHeight: number
): AbsolutePixelCrop {
  const x = Math.max(0, Math.round(relativeCrop.relX * sourceWidth));
  const y = Math.max(0, Math.round(relativeCrop.relY * sourceHeight));
  const width = Math.min(sourceWidth - x, Math.round(relativeCrop.relW * sourceWidth));
  const height = Math.min(sourceHeight - y, Math.round(relativeCrop.relH * sourceHeight));

  return { x, y, width, height };
}

/**
 * Normalizes a source crop region to standard ISO/IEC 7810 CR-80 specifications
 */
export function normalizeToCR80(
  sourceCrop: AbsolutePixelCrop,
  rotation: RotationAngle = 0,
  targetDpi: number = 300
): NormalizedCardResult {
  const isRotated90or270 = rotation === 90 || rotation === 270;
  
  // Standard CR-80 dimensions: 85.60 x 53.98 mm
  const targetWidthMm = isRotated90or270 ? CR80_DIMENSIONS.heightMm : CR80_DIMENSIONS.widthMm;
  const targetHeightMm = isRotated90or270 ? CR80_DIMENSIONS.widthMm : CR80_DIMENSIONS.heightMm;

  const targetWidthPx = mmToPx(targetWidthMm, targetDpi);
  const targetHeightPx = mmToPx(targetHeightMm, targetDpi);

  const effectiveSourceW = isRotated90or270 ? sourceCrop.height : sourceCrop.width;
  const effectiveSourceH = isRotated90or270 ? sourceCrop.width : sourceCrop.height;

  const scaleFactorX = targetWidthPx / Math.max(1, effectiveSourceW);
  const scaleFactorY = targetHeightPx / Math.max(1, effectiveSourceH);

  return {
    sourceCrop,
    targetWidthPx,
    targetHeightPx,
    targetWidthMm,
    targetHeightMm,
    aspectRatio: targetWidthMm / targetHeightMm,
    scaleFactorX,
    scaleFactorY,
    rotation,
  };
}

/**
 * Verifies that a normalized card result matches CR-80 physical aspect ratio within 0.5% tolerance
 */
export function isConformingCR80Aspect(width: number, height: number, tolerance = 0.005): boolean {
  const standardAspect = CR80_DIMENSIONS.widthMm / CR80_DIMENSIONS.heightMm; // ~1.58577
  const landscapeAspect = Math.max(width, height) / Math.min(width, height);
  const delta = Math.abs(landscapeAspect - standardAspect) / standardAspect;
  return delta <= tolerance;
}
