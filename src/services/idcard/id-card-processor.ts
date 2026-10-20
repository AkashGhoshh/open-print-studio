/**
 * Open Print Studio — ID Card Pipeline Processor
 * 
 * Orchestrates cropping, rotation, CR-80 normalization, S-curve contrast enhancement,
 * and opt-in disclaimer cleaning across front and back card sides.
 */

import {
  resolveRelativeCrop,
  normalizeToCR80,
  applyTextDarkening,
  applyDisclaimerMask,
  type RotationAngle,
  type NormalizedCardResult,
} from "@ops/core";
import type { IdCardTemplate } from "../crop/template-types";

export interface ProcessCardOptions {
  template: IdCardTemplate;
  frontRotation?: RotationAngle;
  backRotation?: RotationAngle;
  textBoldLevel?: number; // 0 - 5
  cleanDisclaimer?: boolean;
}

export interface ProcessedIdCardSides {
  frontCanvas: HTMLCanvasElement;
  backCanvas: HTMLCanvasElement | null;
  frontNormal: NormalizedCardResult;
  backNormal: NormalizedCardResult | null;
}

/**
 * Creates an Offscreen / HTML Canvas representing a cropped, normalized CR-80 card side.
 */
function renderSingleSide(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  relCrop: { relX: number; relY: number; relW: number; relH: number },
  rotation: RotationAngle,
  textBoldLevel: number,
  disclaimerRegion?: { relX: number; relY: number; relW: number; relH: number }
): { canvas: HTMLCanvasElement; normal: NormalizedCardResult } {
  const pixelCrop = resolveRelativeCrop(relCrop, sourceWidth, sourceHeight);
  const normal = normalizeToCR80(pixelCrop, rotation, 300);

  const canvas = document.createElement("canvas");
  canvas.width = normal.targetWidthPx;
  canvas.height = normal.targetHeightPx;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // Fill background white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply rotation and draw source image
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  const drawW = rotation === 90 || rotation === 270 ? canvas.height : canvas.width;
  const drawH = rotation === 90 || rotation === 270 ? canvas.width : canvas.height;

  ctx.drawImage(
    source,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );
  ctx.restore();

  // If text bolding requested, apply analytical S-curve TRC
  if (textBoldLevel > 0) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyTextDarkening(imgData.data, textBoldLevel);
    ctx.putImageData(imgData, 0, 0);
  }

  // If disclaimer cleaner requested for this side
  if (disclaimerRegion) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    try {
      applyDisclaimerMask(imgData.data, canvas.width, canvas.height, disclaimerRegion);
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn("Disclaimer cleaner skipped due to safety boundary check:", e);
    }
  }

  return { canvas, normal };
}

/**
 * Processes an ID card document image or rasterized PDF page into CR-80 front and back sides.
 */
export function processIdCardDocument(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  options: ProcessCardOptions
): ProcessedIdCardSides {
  const {
    template,
    frontRotation = template.front.defaultRotation ?? 0,
    backRotation = template.back?.defaultRotation ?? 0,
    textBoldLevel = 0,
    cleanDisclaimer = false,
  } = options;

  // Disclaimer cleaning is only evaluated on the front side if opt-in and present
  const frontDisclaimer = cleanDisclaimer ? template.disclaimerRegion : undefined;

  const front = renderSingleSide(
    source,
    sourceWidth,
    sourceHeight,
    template.front,
    frontRotation,
    textBoldLevel,
    frontDisclaimer
  );

  let back: { canvas: HTMLCanvasElement; normal: NormalizedCardResult } | null = null;
  if (template.back) {
    back = renderSingleSide(
      source,
      sourceWidth,
      sourceHeight,
      template.back,
      backRotation,
      textBoldLevel,
      undefined
    );
  }

  return {
    frontCanvas: front.canvas,
    backCanvas: back ? back.canvas : null,
    frontNormal: front.normal,
    backNormal: back ? back.normal : null,
  };
}
