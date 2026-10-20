import { describe, it, expect } from "vitest";
import {
  solvePassportGrid,
  PHOTO_PRESETS,
} from "../src/layout/passport-grid-solver.js";
import {
  PAPER_4X6_WIDTH_MM,
  PAPER_4X6_HEIGHT_MM,
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
} from "../src/constants/dimensions.js";

describe("Dynamic Passport Photo Grid Solver (ADR-002)", () => {
  it("proves 8-up Indian Passport (35x45 mm) on 4x6 strictly rotates to 45x35 mm", () => {
    // Normal 35x45 mm: floor((101.6+3)/(35+3)) = 2 cols, floor((152.4+3)/(45+3)) = 3 rows -> 6 photos
    // Rotated 45x35 mm: floor((101.6+3)/(45+3)) = 2 cols, floor((152.4+3)/(35+3)) = 4 rows -> 8 photos!
    const result = solvePassportGrid({
      paper: "4x6",
      preset: "passport_in",
      requestedCount: 8,
      gapMm: 3.0,
    });

    expect(result.sheetType).toBe("4x6");
    expect(result.cardCount).toBe(8);
    expect(result.cols).toBe(2);
    expect(result.rows).toBe(4);

    // Each slot should have rotated dimensions: width 45 mm, height 35 mm
    for (const slot of result.slots) {
      expect(slot.widthMm).toBe(45.0);
      expect(slot.heightMm).toBe(35.0);
      expect(slot.xMm + slot.widthMm).toBeLessThanOrEqual(PAPER_4X6_WIDTH_MM);
      expect(slot.yMm + slot.heightMm).toBeLessThanOrEqual(PAPER_4X6_HEIGHT_MM);
    }
  });

  it("fits standard 12-up stamp size photos (25x30 mm) on 4x6 paper", () => {
    const result = solvePassportGrid({
      paper: "4x6",
      preset: "stamp",
      requestedCount: 12,
      gapMm: 3.0,
    });

    expect(result.cardCount).toBe(12);
    expect(result.slots.length).toBe(12);
    for (const slot of result.slots) {
      expect(slot.xMm + slot.widthMm).toBeLessThanOrEqual(PAPER_4X6_WIDTH_MM);
      expect(slot.yMm + slot.heightMm).toBeLessThanOrEqual(PAPER_4X6_HEIGHT_MM);
    }

    // Branch coverage: requestedCount = 7 on 4x6 (normal capacity is 6, rotated is 8)
    const result7 = solvePassportGrid({
      paper: "4x6",
      preset: "passport_in",
      requestedCount: 7,
    });
    expect(result7.cardCount).toBe(7);

    // Branch coverage: requestedCount exceeds both normal and rotated capacity
    const resultHuge = solvePassportGrid({
      paper: "4x6",
      preset: "passport_in",
      requestedCount: 50,
    });
    expect(resultHuge.cardCount).toBe(8);
  });

  it("maximizes yield on A4 paper for Indian Passport (up to 30 slots)", () => {
    const result = solvePassportGrid({
      paper: "A4",
      preset: "passport_in",
      gapMm: 4.0,
    });

    expect(result.sheetType).toBe("A4");
    expect(result.cardCount).toBeGreaterThanOrEqual(30);
    expect(result.slots[0].xMm).toBeGreaterThanOrEqual(0);
    expect(result.slots[0].yMm).toBeGreaterThanOrEqual(0);
  });

  it("centers photo grid symmetrically on the paper sheet", () => {
    const result = solvePassportGrid({
      paper: "4x6",
      preset: "passport_in",
      requestedCount: 8,
      gapMm: 3.0,
    });

    const first = result.slots[0];
    const lastCol = result.slots.find((s) => s.col === result.cols - 1 && s.row === 0)!;
    const rightMargin = PAPER_4X6_WIDTH_MM - (lastCol.xMm + lastCol.widthMm);

    // Left and right margins must be symmetrical within 0.1 mm
    expect(Math.abs(first.xMm - rightMargin)).toBeLessThan(0.1);
  });
});
