import { describe, it, expect } from "vitest";
import {
  mmToPx,
  pxToMm,
  roundMm,
  STANDARD_DPI,
  PX_PER_MM_300DPI,
} from "../src/constants/dpi.js";
import {
  CR80_WIDTH_MM,
  CR80_HEIGHT_MM,
  CR80_WIDTH_PX_300DPI,
  CR80_HEIGHT_PX_300DPI,
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  PAPER_4X6_WIDTH_MM,
  PAPER_4X6_HEIGHT_MM,
} from "../src/constants/dimensions.js";

describe("Core DPI and Physical Unit Conversions", () => {
  it("verifies 300 DPI conversion constant", () => {
    expect(STANDARD_DPI).toBe(300);
    expect(roundMm(PX_PER_MM_300DPI, 4)).toBe(11.811);
  });

  it("converts ISO/IEC 7810 ID-1 (CR-80) millimeters to exact pixels", () => {
    // 85.60 mm * (300 / 25.4) = 1011.0236 -> 1011 px
    expect(mmToPx(CR80_WIDTH_MM)).toBe(1011);
    expect(CR80_WIDTH_PX_300DPI).toBe(1011);

    // 53.98 mm * (300 / 25.4) = 637.559 -> 638 px
    expect(mmToPx(CR80_HEIGHT_MM)).toBe(638);
    expect(CR80_HEIGHT_PX_300DPI).toBe(638);
  });

  it("converts standard paper sizes to exact pixels at 300 DPI", () => {
    expect(mmToPx(PAPER_A4_WIDTH_MM)).toBe(2480);
    expect(mmToPx(PAPER_A4_HEIGHT_MM)).toBe(3508);

    expect(mmToPx(PAPER_4X6_WIDTH_MM)).toBe(1200);
    expect(mmToPx(PAPER_4X6_HEIGHT_MM)).toBe(1800);
  });

  it("verifies bidirectional round-trip mm <-> px conversion precision", () => {
    const px = mmToPx(100.0);
    const mmBack = pxToMm(px);
    expect(roundMm(mmBack, 1)).toBe(100.0);
  });
});
