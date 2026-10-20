import { describe, it, expect } from "vitest";
import {
  solveA4VisitingCardSheet,
  VISITING_CARD_GOLDEN_MARGINS,
} from "../src/layout/visiting-card-layout.js";
import {
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  VISITING_CARD_WIDTH_MM,
  VISITING_CARD_HEIGHT_MM,
} from "../src/constants/dimensions.js";

describe("Visiting Card Layout Solver (A4 10-Up)", () => {
  it("computes exactly 10 slots on A4 sheet (2 columns x 5 rows)", () => {
    const layout = solveA4VisitingCardSheet();
    expect(layout.sheetType).toBe("A4");
    expect(layout.cardCount).toBe(10);
    expect(layout.cols).toBe(2);
    expect(layout.rows).toBe(5);
    expect(layout.slots).toHaveLength(10);
  });

  it("strictly adheres to golden millimeter margins and gap symmetry", () => {
    const layout = solveA4VisitingCardSheet();
    const col0 = layout.slots.find((s) => s.col === 0 && s.row === 0)!;
    const col1 = layout.slots.find((s) => s.col === 1 && s.row === 0)!;

    // Col 0 Left Margin
    expect(col0.xMm).toBe(VISITING_CARD_GOLDEN_MARGINS.leftMm); // 18.00 mm
    // Col 1 X = 18.00 + 85.00 + 4.00 = 107.00 mm
    expect(col1.xMm).toBe(107.00);

    // Right margin symmetry: 210 - (107 + 85) = 18.00 mm
    const rightMargin = PAPER_A4_WIDTH_MM - (col1.xMm + col1.widthMm);
    expect(Math.abs(rightMargin - VISITING_CARD_GOLDEN_MARGINS.leftMm)).toBeLessThan(0.001);

    // Top margin
    expect(col0.yMm).toBe(VISITING_CARD_GOLDEN_MARGINS.topMm); // 5.00 mm

    // Bottom margin symmetry with row 4
    const row4 = layout.slots.find((s) => s.col === 0 && s.row === 4)!;
    // Row 4 Y = 5.00 + 4 * (55.00 + 3.00) = 5.00 + 4 * 58.00 = 237.00 mm
    expect(row4.yMm).toBe(237.00);
    const bottomMargin = PAPER_A4_HEIGHT_MM - (row4.yMm + row4.heightMm);
    expect(Math.abs(bottomMargin - VISITING_CARD_GOLDEN_MARGINS.topMm)).toBeLessThan(0.001);
  });

  it("supports repeated front mode and pair mode correctly", () => {
    const pairsLayout = solveA4VisitingCardSheet({ mode: "pairs" });
    expect(pairsLayout.slots[0].side).toBe("front");
    expect(pairsLayout.slots[1].side).toBe("back");

    const repeatedLayout = solveA4VisitingCardSheet({ mode: "repeated" });
    expect(repeatedLayout.slots[0].side).toBe("front");
    expect(repeatedLayout.slots[1].side).toBe("front");
    expect(repeatedLayout.slots.every((s) => s.side === "front")).toBe(true);
  });

  it("proves double-flip invariance (flip(flip) === original)", () => {
    const normal = solveA4VisitingCardSheet({ isFlipped: false });
    const flippedOnce = solveA4VisitingCardSheet({ isFlipped: true });
    
    // Invert the flipped slots manually using the reflection formula
    const restoredX = flippedOnce.slots.map((slot) => {
      return Number((PAPER_A4_WIDTH_MM - slot.xMm - slot.widthMm).toFixed(2));
    });

    for (let i = 0; i < normal.slots.length; i++) {
      expect(restoredX[i]).toBeCloseTo(normal.slots[i].xMm, 1);
    }
  });

  it("applies calibration nudge offsets linearly", () => {
    const nudged = solveA4VisitingCardSheet({ offsetX: 2.5, offsetY: -1.0 });
    expect(nudged.slots[0].xMm).toBe(VISITING_CARD_GOLDEN_MARGINS.leftMm + 2.5);
    expect(nudged.slots[0].yMm).toBe(VISITING_CARD_GOLDEN_MARGINS.topMm - 1.0);
  });
});
