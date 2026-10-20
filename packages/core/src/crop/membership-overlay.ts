/**
 * Open Print Studio Core — Membership Card Overlay Geometry
 * 
 * Computes exact millimeter and pixel placement coordinates for custom membership
 * card fields (Member ID, Expiry, Name, Organization) on standard ISO CR-80 cards.
 */

import { CR80_WIDTH_MM, CR80_HEIGHT_MM } from "../constants/dimensions.js";
import { mmToPx, roundMm } from "../constants/dpi.js";

export interface MembershipFieldConfig {
  text: string;
  xMm: number;
  yMm: number;
  fontSizePt: number;
  colorHex: string;
  fontFamily?: string;
  isBold?: boolean;
}

export interface MembershipCardOverlayConfig {
  memberId?: string;
  memberName?: string;
  validThru?: string;
  orgName?: string;
  themeColor?: string; // Hex color for header/footer accents
  customFields?: MembershipFieldConfig[];
}

export interface ResolvedOverlayField {
  id: string;
  text: string;
  xMm: number;
  yMm: number;
  xPx: number;
  yPx: number;
  fontSizePt: number;
  fontSizePx: number;
  colorHex: string;
  isBold: boolean;
}

export interface MembershipOverlayResult {
  fields: ResolvedOverlayField[];
  isValid: boolean;
  warnings: string[];
}

/**
 * Computes default golden layout coordinates for membership card text overlays.
 */
export function solveMembershipOverlay(
  config: MembershipCardOverlayConfig
): MembershipOverlayResult {
  const fields: ResolvedOverlayField[] = [];
  const warnings: string[] = [];

  // 1. Organization Name (Header strip, centered or top-left)
  if (config.orgName && config.orgName.trim().length > 0) {
    const xMm = 6.0;
    const yMm = 9.0;
    fields.push({
      id: "orgName",
      text: config.orgName.toUpperCase(),
      xMm,
      yMm,
      xPx: mmToPx(xMm),
      yPx: mmToPx(yMm),
      fontSizePt: 12,
      fontSizePx: Math.round(12 * (300 / 72)),
      colorHex: config.themeColor || "#1E3A8A",
      isBold: true,
    });
  }

  // 2. Member Name (Mid-lower left)
  if (config.memberName && config.memberName.trim().length > 0) {
    const xMm = 6.0;
    const yMm = 38.0;
    fields.push({
      id: "memberName",
      text: config.memberName.toUpperCase(),
      xMm,
      yMm,
      xPx: mmToPx(xMm),
      yPx: mmToPx(yMm),
      fontSizePt: 11,
      fontSizePx: Math.round(11 * (300 / 72)),
      colorHex: "#111827",
      isBold: true,
    });
  }

  // 3. Member ID (Prominent badge style)
  if (config.memberId && config.memberId.trim().length > 0) {
    const xMm = 6.0;
    const yMm = 45.0;
    fields.push({
      id: "memberId",
      text: `ID: ${config.memberId}`,
      xMm,
      yMm,
      xPx: mmToPx(xMm),
      yPx: mmToPx(yMm),
      fontSizePt: 10,
      fontSizePx: Math.round(10 * (300 / 72)),
      colorHex: "#374151",
      isBold: true,
    });
  }

  // 4. Valid Thru / Expiry Date (Lower right corner)
  if (config.validThru && config.validThru.trim().length > 0) {
    const xMm = 52.0;
    const yMm = 45.0;
    fields.push({
      id: "validThru",
      text: `EXP: ${config.validThru}`,
      xMm,
      yMm,
      xPx: mmToPx(xMm),
      yPx: mmToPx(yMm),
      fontSizePt: 9,
      fontSizePx: Math.round(9 * (300 / 72)),
      colorHex: "#4B5563",
      isBold: false,
    });
  }

  // 5. Custom fields
  if (config.customFields && config.customFields.length > 0) {
    config.customFields.forEach((cf, idx) => {
      fields.push({
        id: `custom_${idx}`,
        text: cf.text,
        xMm: roundMm(cf.xMm),
        yMm: roundMm(cf.yMm),
        xPx: mmToPx(cf.xMm),
        yPx: mmToPx(cf.yMm),
        fontSizePt: cf.fontSizePt,
        fontSizePx: Math.round(cf.fontSizePt * (300 / 72)),
        colorHex: cf.colorHex,
        isBold: !!cf.isBold,
      });
    });
  }

  // Check boundary constraints
  for (const field of fields) {
    if (field.xMm < 0 || field.xMm > CR80_WIDTH_MM) {
      warnings.push(`Field '${field.id}' X position ${field.xMm}mm exceeds card width (${CR80_WIDTH_MM}mm)`);
    }
    if (field.yMm < 0 || field.yMm > CR80_HEIGHT_MM) {
      warnings.push(`Field '${field.id}' Y position ${field.yMm}mm exceeds card height (${CR80_HEIGHT_MM}mm)`);
    }
  }

  return {
    fields,
    isValid: warnings.length === 0,
    warnings,
  };
}
