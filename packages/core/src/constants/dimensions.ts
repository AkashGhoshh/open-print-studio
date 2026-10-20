/**
 * Open Print Studio Core — Standard Dimensions & Media Sizes
 * Derived from ISO/IEC 7810, ISO 216, and photographic standards.
 */

import { mmToPx } from "./dpi.js";

// === ISO/IEC 7810 ID-1 (CR-80 Card) ===
export const CR80_WIDTH_MM = 85.60;
export const CR80_HEIGHT_MM = 53.98;
export const CR80_CORNER_RADIUS_MM = 3.18;
export const CR80_WIDTH_PX_300DPI = mmToPx(CR80_WIDTH_MM); // 1011 px
export const CR80_HEIGHT_PX_300DPI = mmToPx(CR80_HEIGHT_MM); // 638 px

export const CR80_DIMENSIONS = {
  widthMm: CR80_WIDTH_MM,
  heightMm: CR80_HEIGHT_MM,
  cornerRadiusMm: CR80_CORNER_RADIUS_MM,
};

export const CR80_PIXELS_300DPI = {
  width: CR80_WIDTH_PX_300DPI,
  height: CR80_HEIGHT_PX_300DPI,
};

// === Visiting / Business Card Standard ===
export const VISITING_CARD_WIDTH_MM = 85.00;
export const VISITING_CARD_HEIGHT_MM = 55.00;
export const VISITING_CARD_WIDTH_PX_300DPI = mmToPx(VISITING_CARD_WIDTH_MM); // 1004 px
export const VISITING_CARD_HEIGHT_PX_300DPI = mmToPx(VISITING_CARD_HEIGHT_MM); // 650 px

// === Paper Media Standards ===
export const PAPER_A4_WIDTH_MM = 210.0;
export const PAPER_A4_HEIGHT_MM = 297.0;
export const PAPER_A4_WIDTH_PX_300DPI = mmToPx(PAPER_A4_WIDTH_MM); // 2480 px
export const PAPER_A4_HEIGHT_PX_300DPI = mmToPx(PAPER_A4_HEIGHT_MM); // 3508 px

export const PAPER_4X6_WIDTH_MM = 101.6; // 4 inches exactly
export const PAPER_4X6_HEIGHT_MM = 152.4; // 6 inches exactly
export const PAPER_4X6_WIDTH_PX_300DPI = mmToPx(PAPER_4X6_WIDTH_MM); // 1200 px
export const PAPER_4X6_HEIGHT_PX_300DPI = mmToPx(PAPER_4X6_HEIGHT_MM); // 1800 px

// === Photo Studio Presets ===
export const PHOTO_PASSPORT_IN_WIDTH_MM = 35.0;
export const PHOTO_PASSPORT_IN_HEIGHT_MM = 45.0;
export const PHOTO_STAMP_WIDTH_MM = 25.0;
export const PHOTO_STAMP_HEIGHT_MM = 30.0;
export const PHOTO_VISA_US_WIDTH_MM = 50.8; // 2 inches
export const PHOTO_VISA_US_HEIGHT_MM = 50.8; // 2 inches

// === Physical Caliper Tolerances ===
export const CR80_TOLERANCE_WIDTH_MM = 0.40;
export const CR80_TOLERANCE_HEIGHT_MM = 0.30;
