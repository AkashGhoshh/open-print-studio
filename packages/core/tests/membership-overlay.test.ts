import { describe, it, expect } from "vitest";
import { solveMembershipOverlay } from "../src/crop/membership-overlay.js";
import { CR80_WIDTH_MM, CR80_HEIGHT_MM } from "../src/constants/dimensions.js";

describe("Membership Card Overlay Solver", () => {
  it("resolves default golden coordinates for standard membership fields", () => {
    const result = solveMembershipOverlay({
      memberId: "MEM-2026-9999",
      memberName: "Amit Kumar",
      validThru: "12/2028",
      orgName: "Royal Gym & Fitness",
    });

    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
    expect(result.fields).toHaveLength(4);

    const orgField = result.fields.find((f) => f.id === "orgName");
    expect(orgField?.text).toBe("ROYAL GYM & FITNESS");
    expect(orgField?.fontSizePt).toBe(12);

    const nameField = result.fields.find((f) => f.id === "memberName");
    expect(nameField?.text).toBe("AMIT KUMAR");

    const idField = result.fields.find((f) => f.id === "memberId");
    expect(idField?.text).toBe("ID: MEM-2026-9999");

    const expField = result.fields.find((f) => f.id === "validThru");
    expect(expField?.text).toBe("EXP: 12/2028");
  });

  it("strictly confines all fields within CR-80 boundaries", () => {
    const result = solveMembershipOverlay({
      memberId: "12345",
      memberName: "Test User",
      validThru: "01/2030",
      orgName: "Studio Club",
    });

    for (const field of result.fields) {
      expect(field.xMm).toBeGreaterThanOrEqual(0);
      expect(field.xMm).toBeLessThanOrEqual(CR80_WIDTH_MM);
      expect(field.yMm).toBeGreaterThanOrEqual(0);
      expect(field.yMm).toBeLessThanOrEqual(CR80_HEIGHT_MM);
    }
  });

  it("detects and warns on out-of-bounds custom fields", () => {
    const result = solveMembershipOverlay({
      customFields: [
        {
          text: "Out of Bounds X",
          xMm: 95.0, // > 85.60 mm
          yMm: 20.0,
          fontSizePt: 10,
          colorHex: "#000000",
        },
      ],
    });

    expect(result.isValid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("exceeds card width");

    const resultY = solveMembershipOverlay({
      customFields: [
        {
          text: "Out of Bounds Y",
          xMm: 20.0,
          yMm: 80.0, // > 53.98 mm
          fontSizePt: 10,
          colorHex: "#000000",
        },
      ],
    });
    expect(resultY.isValid).toBe(false);
    expect(resultY.warnings[0]).toContain("exceeds card height");
  });
});
