import { describe, it, expect } from "vitest";
import { templateRegistry } from "./template-registry";

describe("ID Card Template Registry", () => {
  it("loads all standard government templates", () => {
    const templates = templateRegistry.getAll();
    expect(templates.length).toBeGreaterThanOrEqual(5);

    const ids = templates.map((t) => t.id);
    expect(ids).toContain("eaadhaar-standard");
    expect(ids).toContain("ayushman-bharat");
    expect(ids).toContain("pan-card");
    expect(ids).toContain("voter-id-epic");
    expect(ids).toContain("eshram-card");
  });

  it("retrieves e-Aadhaar template as default", () => {
    const def = templateRegistry.getDefault();
    expect(def.id).toBe("eaadhaar-standard");
    expect(def.targetCard).toBe("CR-80");
    expect(def.disclaimerRegion).toBeDefined();
    expect(def.front).toBeDefined();
    expect(def.back).toBeDefined();
  });

  it("identifies PAN card as single-sided (back is null)", () => {
    const pan = templateRegistry.getById("pan-card");
    expect(pan).toBeDefined();
    expect(pan?.back).toBeNull();
  });

  it("validates valid and invalid template structures", () => {
    expect(templateRegistry.validate(null)).toBe(false);
    expect(templateRegistry.validate({})).toBe(false);
    expect(
      templateRegistry.validate({
        id: "custom-test",
        name: "Custom Test",
        front: { relX: 0.1, relY: 0.1, relW: 0.4, relH: 0.3 },
      })
    ).toBe(true);
  });
});
