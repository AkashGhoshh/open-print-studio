import { describe, it, expect } from "vitest";
import {
  calculateMobileOverlayCoordinates,
  calculateStampPixelRect,
} from "../src/crop/card-overlay";

describe("Card Overlays (Mobile Number & Official Stamp)", () => {
  const cardW = 1011; // 300 DPI CR-80 width
  const cardH = 638;  // 300 DPI CR-80 height

  it("calculates bottom-right corner coordinates for mobile number badge", () => {
    const boxW = 200;
    const boxH = 40;
    const margin = 20;

    const coords = calculateMobileOverlayCoordinates(cardW, cardH, boxW, boxH, "bottom-right", margin);

    expect(coords.x).toBe(cardW - boxW - margin); // 1011 - 200 - 20 = 791
    expect(coords.y).toBe(cardH - boxH - margin); // 638 - 40 - 20 = 578
    expect(coords.width).toBe(200);
    expect(coords.height).toBe(40);
  });

  it("calculates top-left corner coordinates for mobile number badge", () => {
    const coords = calculateMobileOverlayCoordinates(cardW, cardH, 180, 35, "top-left", 15);

    expect(coords.x).toBe(15);
    expect(coords.y).toBe(15);
  });

  it("calculates top-right and bottom-left coordinates correctly", () => {
    const tr = calculateMobileOverlayCoordinates(cardW, cardH, 150, 30, "top-right", 10);
    expect(tr.x).toBe(cardW - 150 - 10);
    expect(tr.y).toBe(10);

    const bl = calculateMobileOverlayCoordinates(cardW, cardH, 150, 30, "bottom-left", 10);
    expect(bl.x).toBe(10);
    expect(bl.y).toBe(cardH - 30 - 10);
  });

  it("calculates pixel dimensions and placement for stamp overlay", () => {
    const stamp = {
      relX: 0.70,
      relY: 0.65,
      widthMm: 25.4, // 1 inch = 300 px
      heightMm: 12.7, // 0.5 inch = 150 px
    };

    const rect = calculateStampPixelRect(cardW, cardH, stamp, 300);

    expect(rect.x).toBe(Math.round(0.70 * cardW));
    expect(rect.y).toBe(Math.round(0.65 * cardH));
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(150);
  });
});
