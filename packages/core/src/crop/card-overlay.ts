/**
 * Open Print Studio Core — Card Overlays (Signature/Stamp & Customer Mobile)
 * 
 * Mathematical placement calculations for customer mobile text and official stamps.
 * Pure TypeScript, zero external dependencies.
 */

import { mmToPx } from "../constants/dpi.js";

export type OverlayCornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface MobileOverlayConfig {
  mobileNumber: string;
  prefix?: string;
  position?: OverlayCornerPosition;
  fontSizePx?: number;
  textColor?: string;
  backgroundColor?: string;
  marginPx?: number;
}

export interface StampOverlayConfig {
  relX: number; // 0.0 - 1.0 on card
  relY: number; // 0.0 - 1.0 on card
  widthMm: number;
  heightMm: number;
  opacity?: number; // 0.0 - 1.0
}

export interface OverlayBoxResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates position coordinates for a customer mobile number badge in one of 4 corners.
 */
export function calculateMobileOverlayCoordinates(
  cardWidthPx: number,
  cardHeightPx: number,
  boxWidthPx: number,
  boxHeightPx: number,
  position: OverlayCornerPosition = "bottom-right",
  marginPx = 20
): OverlayBoxResult {
  let x = marginPx;
  let y = marginPx;

  switch (position) {
    case "top-left":
      x = marginPx;
      y = marginPx;
      break;
    case "top-right":
      x = cardWidthPx - boxWidthPx - marginPx;
      y = marginPx;
      break;
    case "bottom-left":
      x = marginPx;
      y = cardHeightPx - boxHeightPx - marginPx;
      break;
    case "bottom-right":
      x = cardWidthPx - boxWidthPx - marginPx;
      y = cardHeightPx - boxHeightPx - marginPx;
      break;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(boxWidthPx),
    height: Math.round(boxHeightPx),
  };
}

/**
 * Calculates pixel rectangle for an official stamp/signature overlay on a CR-80 card.
 */
export function calculateStampPixelRect(
  cardWidthPx: number,
  cardHeightPx: number,
  stamp: StampOverlayConfig,
  dpi = 300
): OverlayBoxResult {
  const widthPx = mmToPx(stamp.widthMm, dpi);
  const heightPx = mmToPx(stamp.heightMm, dpi);

  const x = Math.round(stamp.relX * cardWidthPx);
  const y = Math.round(stamp.relY * cardHeightPx);

  return {
    x,
    y,
    width: widthPx,
    height: heightPx,
  };
}
