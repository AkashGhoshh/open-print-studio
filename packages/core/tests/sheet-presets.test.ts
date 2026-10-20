import { describe, it, expect } from "vitest";
import {
  solveA4IdCardSheet,
  solve4x6IdCardSheet,
  solvePvcTraySheet,
} from "../src/layout/sheet-presets.js";

describe("Sheet Presets & Golden Coordinates", () => {
  it("matches golden coordinates for A4 5-Pair sheet (10 cards)", () => {
    const sheet = solveA4IdCardSheet();

    expect(sheet.sheetType).toBe("A4");
    expect(sheet.cardCount).toBe(10);
    expect(sheet.pairCount).toBe(5);
    expect(sheet.cols).toBe(2);
    expect(sheet.rows).toBe(5);

    // Golden values from references/golden-coordinates.md:
    // Slot 1 (Row 1 Col 1 Front): 17.40, 8.55
    // Slot 2 (Row 1 Col 2 Back): 107.00, 8.55
    // Slot 3 (Row 2 Col 1 Front): 17.40, 65.03
    // Slot 4 (Row 2 Col 2 Back): 107.00, 65.03
    // Slot 9 (Row 5 Col 1 Front): 17.40, 234.47
    // Slot 10 (Row 5 Col 2 Back): 107.00, 234.47
    const s1 = sheet.slots[0];
    expect(s1.xMm).toBe(17.40);
    expect(s1.yMm).toBe(8.55);
    expect(s1.side).toBe("front");
    expect(s1.pairIndex).toBe(0);

    const s2 = sheet.slots[1];
    expect(s2.xMm).toBe(107.00);
    expect(s2.yMm).toBe(8.55);
    expect(s2.side).toBe("back");
    expect(s2.pairIndex).toBe(0);

    const s3 = sheet.slots[2];
    expect(s3.xMm).toBe(17.40);
    expect(s3.yMm).toBe(65.03);

    const s4 = sheet.slots[3];
    expect(s4.xMm).toBe(107.00);
    expect(s4.yMm).toBe(65.03);

    const s9 = sheet.slots[8];
    expect(s9.xMm).toBe(17.40);
    expect(s9.yMm).toBe(234.47);

    const s10 = sheet.slots[9];
    expect(s10.xMm).toBe(107.00);
    expect(s10.yMm).toBe(234.47);
  });

  it("matches golden coordinates for 4x6 1-Pair sheet (2 cards)", () => {
    const sheet = solve4x6IdCardSheet();

    expect(sheet.sheetType).toBe("4x6");
    expect(sheet.cardCount).toBe(2);
    expect(sheet.pairCount).toBe(1);
    expect(sheet.cols).toBe(1);
    expect(sheet.rows).toBe(2);

    // Golden values from references/golden-coordinates.md:
    // Slot 1 (Row 1 Col 1 Front): 8.00, 20.22
    // Slot 2 (Row 2 Col 1 Back): 8.00, 78.20
    const s1 = sheet.slots[0];
    expect(s1.xMm).toBe(8.00);
    expect(s1.yMm).toBe(20.22);
    expect(s1.side).toBe("front");

    const s2 = sheet.slots[1];
    expect(s2.xMm).toBe(8.00);
    expect(s2.yMm).toBe(78.20);
    expect(s2.side).toBe("back");
  });

  it("applies horizontal and vertical nudge offsets correctly", () => {
    const nudged = solveA4IdCardSheet({
      offsetX: 2.5,
      offsetY: -1.5,
    });

    const s1 = nudged.slots[0];
    expect(s1.xMm).toBeCloseTo(17.40 + 2.5, 2);
    expect(s1.yMm).toBeCloseTo(8.55 - 1.5, 2);
  });

  it("verifies double-flip invariance on A4 sheet: flip(flip(sheet)) == sheet", () => {
    const normal = solveA4IdCardSheet({ isFlipped: false });
    const flippedOnce = solveA4IdCardSheet({ isFlipped: true });
    
    // Once flipped, X coordinates are reflected
    expect(flippedOnce.slots[0].xMm).not.toBe(normal.slots[0].xMm);

    // Reflected back using mirror formula
    for (let i = 0; i < normal.slots.length; i++) {
      const origX = normal.slots[i].xMm;
      const flippedX = flippedOnce.slots[i].xMm;
      const cardW = normal.slots[i].widthMm;
      const sheetW = normal.sheetWidthMm;

      // X' = W - X - W_item
      expect(flippedX).toBeCloseTo(sheetW - origX - cardW, 2);

      // (X')' = W - X' - W_item = X
      const restoredX = sheetW - flippedX - cardW;
      expect(restoredX).toBeCloseTo(origX, 2);
    }
  });

  it("solves PVC direct tray sheet centering 2 cards", () => {
    const tray = solvePvcTraySheet();
    expect(tray.sheetType).toBe("PVC_TRAY");
    expect(tray.cardCount).toBe(2);
    expect(tray.slots[0].side).toBe("front");
    expect(tray.slots[1].side).toBe("back");
    expect(tray.slots[0].xMm).toBe(tray.slots[1].xMm); // Both centered horizontally
  });
});
