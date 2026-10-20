import { describe, it, expect } from "vitest";
import { solveLayout } from "../src/layout/layout-solver.js";
import {
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  PAPER_4X6_WIDTH_MM,
  PAPER_4X6_HEIGHT_MM,
  CR80_WIDTH_MM,
  CR80_HEIGHT_MM,
  VISITING_CARD_WIDTH_MM,
  VISITING_CARD_HEIGHT_MM,
  PHOTO_PASSPORT_IN_WIDTH_MM,
  PHOTO_PASSPORT_IN_HEIGHT_MM,
  PHOTO_STAMP_WIDTH_MM,
  PHOTO_STAMP_HEIGHT_MM,
} from "../src/constants/dimensions.js";

describe("Dynamic Layout Solver Mathematical Verification", () => {
  it("proves A4 fits exactly 10 CR-80 cards (5 pairs)", () => {
    const result = solveLayout({
      paperWidthMm: PAPER_A4_WIDTH_MM,
      paperHeightMm: PAPER_A4_HEIGHT_MM,
      itemWidthMm: CR80_WIDTH_MM,
      itemHeightMm: CR80_HEIGHT_MM,
      gapX: 4.0,
      gapY: 2.5,
      marginsMm: { left: 10, right: 10, top: 8, bottom: 8 },
      allowRotation: false,
    });

    expect(result.isValid).toBe(true);
    expect(result.cols).toBe(2);
    expect(result.rows).toBe(5);
    expect(result.totalCapacity).toBe(10);
    expect(result.slots.length).toBe(10);
  });

  it("proves 4x6 photo paper fits exactly 2 CR-80 cards (1 pair), never 4", () => {
    const result = solveLayout({
      paperWidthMm: PAPER_4X6_WIDTH_MM,
      paperHeightMm: PAPER_4X6_HEIGHT_MM,
      itemWidthMm: CR80_WIDTH_MM,
      itemHeightMm: CR80_HEIGHT_MM,
      gapX: 0.0,
      gapY: 4.0,
      marginsMm: { left: 5, right: 5, top: 5, bottom: 5 },
      allowRotation: true,
    });

    expect(result.isValid).toBe(true);
    // Across 101.6mm: 1 col; along 152.4mm: 2 rows
    expect(result.totalCapacity).toBe(2);
    expect(result.cols * result.rows).toBe(2);
  });

  it("proves 4x6 fits 8 passport photos (35x45mm) ONLY when rotated", () => {
    const unrotated = solveLayout({
      paperWidthMm: PAPER_4X6_WIDTH_MM,
      paperHeightMm: PAPER_4X6_HEIGHT_MM,
      itemWidthMm: PHOTO_PASSPORT_IN_WIDTH_MM,
      itemHeightMm: PHOTO_PASSPORT_IN_HEIGHT_MM,
      gapX: 2.0,
      gapY: 2.0,
      marginsMm: { left: 3, right: 3, top: 3, bottom: 3 },
      allowRotation: false,
    });

    // 101.6 / 35 = 2 cols; 152.4 / 45 = 3 rows -> 6 photos
    expect(unrotated.totalCapacity).toBe(6);

    const withRotation = solveLayout({
      paperWidthMm: PAPER_4X6_WIDTH_MM,
      paperHeightMm: PAPER_4X6_HEIGHT_MM,
      itemWidthMm: PHOTO_PASSPORT_IN_WIDTH_MM,
      itemHeightMm: PHOTO_PASSPORT_IN_HEIGHT_MM,
      gapX: 2.0,
      gapY: 2.0,
      marginsMm: { left: 3, right: 3, top: 3, bottom: 3 },
      allowRotation: true,
    });

    // 101.6 / 45 = 2 cols; 152.4 / 35 = 4 rows -> 8 photos rotated!
    expect(withRotation.totalCapacity).toBe(8);
    expect(withRotation.isRotated).toBe(true);
  });

  it("proves 4x6 fits at least 12 stamp photos (25x30mm)", () => {
    // Unrotated 3 cols x 4 rows = 12
    const unrotatedStamp = solveLayout({
      paperWidthMm: PAPER_4X6_WIDTH_MM,
      paperHeightMm: PAPER_4X6_HEIGHT_MM,
      itemWidthMm: PHOTO_STAMP_WIDTH_MM,
      itemHeightMm: PHOTO_STAMP_HEIGHT_MM,
      gapX: 2.0,
      gapY: 2.0,
      marginsMm: { left: 3, right: 3, top: 3, bottom: 3 },
      allowRotation: false,
    });
    expect(unrotatedStamp.totalCapacity).toBe(12);

    // Rotated achieves 3 cols x 5 rows = 15
    const rotatedStamp = solveLayout({
      paperWidthMm: PAPER_4X6_WIDTH_MM,
      paperHeightMm: PAPER_4X6_HEIGHT_MM,
      itemWidthMm: PHOTO_STAMP_WIDTH_MM,
      itemHeightMm: PHOTO_STAMP_HEIGHT_MM,
      gapX: 2.0,
      gapY: 2.0,
      marginsMm: { left: 3, right: 3, top: 3, bottom: 3 },
      allowRotation: true,
    });
    expect(rotatedStamp.totalCapacity).toBeGreaterThanOrEqual(12);
  });

  it("proves A4 fits 10 visiting cards (85x55mm) with standard margins", () => {
    const result = solveLayout({
      paperWidthMm: PAPER_A4_WIDTH_MM,
      paperHeightMm: PAPER_A4_HEIGHT_MM,
      itemWidthMm: VISITING_CARD_WIDTH_MM,
      itemHeightMm: VISITING_CARD_HEIGHT_MM,
      gapX: 3.0,
      gapY: 2.0,
      marginsMm: { left: 10, right: 10, top: 5, bottom: 5 },
      allowRotation: false,
    });

    expect(result.isValid).toBe(true);
    expect(result.cols).toBe(2);
    expect(result.rows).toBe(5);
    expect(result.totalCapacity).toBe(10);
  });

  it("returns invalid result when item is larger than paper", () => {
    const result = solveLayout({
      paperWidthMm: 50,
      paperHeightMm: 50,
      itemWidthMm: 100,
      itemHeightMm: 100,
      gapX: 0,
      gapY: 0,
    });

    expect(result.isValid).toBe(false);
    expect(result.totalCapacity).toBe(0);
  });
});
