import { describe, it, expect } from "vitest";
import {
  migrateSettings,
  DEFAULT_SETTINGS,
  CURRENT_SETTINGS_VERSION,
} from "./settings-schema.js";

describe("Typed Settings Schema & Migrations", () => {
  it("returns default settings for null or undefined input", () => {
    expect(migrateSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it("migrates legacy v0 unversioned preferences to v1 schema", () => {
    const legacy = {
      theme: "light",
      locale: "hi",
      privacyMode: true,
      textBoldLevel: 3,
    };

    const migrated = migrateSettings(legacy);
    expect(migrated.schemaVersion).toBe(CURRENT_SETTINGS_VERSION);
    expect(migrated.theme).toBe("light");
    expect(migrated.locale).toBe("hi");
    expect(migrated.privacyMode).toBe(true);
    expect(migrated.textBoldLevel).toBe(3);
    expect(migrated.autoExpiryHours).toBe(24); // default filled in
    expect(migrated.showCutGuides).toBe(true);
  });

  it("clamps invalid textBoldLevel ranges safely", () => {
    const outOfBounds = {
      schemaVersion: 0,
      textBoldLevel: 99,
    };
    const migrated = migrateSettings(outOfBounds);
    expect(migrated.textBoldLevel).toBe(5);
  });
});
