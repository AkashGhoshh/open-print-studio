/**
 * Open Print Studio — Typed Settings Schema with Versioned Migrations
 */

export const CURRENT_SETTINGS_VERSION = 1;
export const SETTINGS_STORAGE_KEY = "ops_prefs";

export interface AppSettingsV1 {
  schemaVersion: 1;
  theme: "dark" | "light";
  locale: "en" | "hi";
  privacyMode: boolean;
  autoExpiryHours: number;
  defaultPaperPreset: "a4_5cards" | "photo_4x6_2cards" | "pvc_single_tray";
  showCutGuides: boolean;
  showRulers: boolean;
  soundFeedback: boolean;
  textBoldLevel: number;
  lastUsedPrinterProfileId?: string;
}

export type AppSettings = AppSettingsV1;

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: 1,
  theme: "dark",
  locale: "en",
  privacyMode: false,
  autoExpiryHours: 24,
  defaultPaperPreset: "a4_5cards",
  showCutGuides: true,
  showRulers: true,
  soundFeedback: false,
  textBoldLevel: 0,
};

type MigrationFunction = (old: Record<string, any>) => Record<string, any>;

const MIGRATIONS: Record<number, MigrationFunction> = {
  1: (v0) => ({
    schemaVersion: 1,
    theme: v0?.theme === "light" ? "light" : "dark",
    locale: v0?.locale === "hi" ? "hi" : "en",
    privacyMode: Boolean(v0?.privacyMode),
    autoExpiryHours: typeof v0?.autoExpiryHours === "number" ? v0.autoExpiryHours : 24,
    defaultPaperPreset: v0?.defaultPaperPreset || "a4_5cards",
    showCutGuides: v0?.showCutGuides ?? true,
    showRulers: v0?.showRulers ?? true,
    soundFeedback: Boolean(v0?.soundFeedback),
    textBoldLevel: typeof v0?.textBoldLevel === "number" ? Math.min(5, Math.max(0, v0.textBoldLevel)) : 0,
    lastUsedPrinterProfileId: v0?.lastUsedPrinterProfileId,
  }),
};

/**
 * Validates and safely migrates arbitrary stored data forward to current schema version.
 */
export function migrateSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  let current = { ...(raw as Record<string, any>) };
  let version = typeof current.schemaVersion === "number" ? current.schemaVersion : 0;

  while (version < CURRENT_SETTINGS_VERSION) {
    const nextVersion = version + 1;
    const migrator = MIGRATIONS[nextVersion];
    if (migrator) {
      current = migrator(current);
      version = nextVersion;
    } else {
      break;
    }
  }

  return current as AppSettings;
}

/**
 * Loads preferences from localStorage with fallback and migration.
 */
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return migrateSettings(parsed);
  } catch (err) {
    console.warn("Failed to load settings, falling back to defaults", err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves preferences to localStorage.
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings", err);
  }
}
