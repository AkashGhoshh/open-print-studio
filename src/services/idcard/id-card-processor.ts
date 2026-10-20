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
  calculateMobileOverlayCoordinates,
  calculateStampPixelRect,
  type MobileOverlayConfig,
  type StampOverlayConfig,
} from "@ops/core";
import type { IdCardTemplate } from "../crop/template-types";

export interface ProcessCardOptions {
  template: IdCardTemplate;
  frontRotation?: RotationAngle;
  backRotation?: RotationAngle;
  textBoldLevel?: number; // 0 - 5
  cleanDisclaimer?: boolean;
  mobileOverlay?: MobileOverlayConfig;
  stampOverlay?: {
    config: StampOverlayConfig;
    image: CanvasImageSource;
    targetSide?: "front" | "back";
  };
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
  disclaimerRegion?: { relX: number; relY: number; relW: number; relH: number },
  mobileOverlay?: MobileOverlayConfig,
  stampOverlay?: { config: StampOverlayConfig; image: CanvasImageSource }
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

  // If customer mobile overlay requested for this side
  if (mobileOverlay && mobileOverlay.mobileNumber) {
    const text = `${mobileOverlay.prefix || ""}${mobileOverlay.mobileNumber}`;
    const fontSize = mobileOverlay.fontSizePx || 22;
    ctx.font = `bold ${fontSize}px sans-serif`;
    const textMetrics = ctx.measureText(text);
    const boxW = textMetrics.width + 16;
    const boxH = fontSize + 12;

    const coords = calculateMobileOverlayCoordinates(
      canvas.width,
      canvas.height,
      boxW,
      boxH,
      mobileOverlay.position || "bottom-right",
      mobileOverlay.marginPx || 20
    );

    ctx.fillStyle = mobileOverlay.backgroundColor || "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === "function") {
      (ctx as any).roundRect(coords.x, coords.y, coords.width, coords.height, 6);
    } else {
      ctx.rect(coords.x, coords.y, coords.width, coords.height);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = mobileOverlay.textColor || "#0F172A";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, coords.x + 8, coords.y + coords.height / 2);
  }

  // If stamp overlay requested for this side
  if (stampOverlay) {
    const stampRect = calculateStampPixelRect(
      canvas.width,
      canvas.height,
      stampOverlay.config,
      300
    );
    ctx.save();
    ctx.globalAlpha = stampOverlay.config.opacity ?? 0.85;
    ctx.drawImage(
      stampOverlay.image,
      stampRect.x,
      stampRect.y,
      stampRect.width,
      stampRect.height
    );
    ctx.restore();
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
    mobileOverlay,
    stampOverlay,
  } = options;

  // Disclaimer cleaning is only evaluated on the front side if opt-in and present
  const frontDisclaimer = cleanDisclaimer ? template.disclaimerRegion : undefined;

  const isStampOnFront = !stampOverlay?.targetSide || stampOverlay.targetSide === "front";
  const isStampOnBack = stampOverlay?.targetSide === "back";

  const front = renderSingleSide(
    source,
    sourceWidth,
    sourceHeight,
    template.front,
    frontRotation,
    textBoldLevel,
    frontDisclaimer,
    mobileOverlay,
    isStampOnFront ? stampOverlay : undefined
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
      undefined,
      undefined,
      isStampOnBack ? stampOverlay : undefined
    );
  }

  return {
    frontCanvas: front.canvas,
    backCanvas: back ? back.canvas : null,
    frontNormal: front.normal,
    backNormal: back ? back.normal : null,
  };
}
