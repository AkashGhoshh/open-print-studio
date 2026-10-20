import { describe, it, expect } from "vitest";
import { solve4x6IdCardSheet } from "../src/layout/sheet-presets.js";
import { generateSlotCutMarks } from "../src/layout/cut-marks.js";

describe("Vector Cut Marks & Trim Guides", () => {
  it("generates 8 tick segments per card slot", () => {
    const sheet = solve4x6IdCardSheet();
    const marks = generateSlotCutMarks(sheet.slots, 3.5, 0.2);

    // 2 cards * 8 ticks per card = 16 ticks total
    expect(marks).toHaveLength(16);
  });

  it("calculates corner coordinates with exact millimeter accuracy", () => {
    const sheet = solve4x6IdCardSheet();
    const marks = generateSlotCutMarks([sheet.slots[0]], 3.5, 0.2);
    const s = sheet.slots[0];

    // Top-left horizontal tick
    const tlH = marks[0];
    expect(tlH.x1Mm).toBeCloseTo(s.xMm - 3.5, 2);
    expect(tlH.y1Mm).toBeCloseTo(s.yMm, 2);
    expect(tlH.x2Mm).toBeCloseTo(s.xMm, 2);
    expect(tlH.y2Mm).toBeCloseTo(s.yMm, 2);
    expect(tlH.strokeWidthMm).toBe(0.2);

    // Top-left vertical tick
    const tlV = marks[1];
    expect(tlV.x1Mm).toBeCloseTo(s.xMm, 2);
    expect(tlV.y1Mm).toBeCloseTo(s.yMm - 3.5, 2);
    expect(tlV.x2Mm).toBeCloseTo(s.xMm, 2);
    expect(tlV.y2Mm).toBeCloseTo(s.yMm, 2);
  });
});
