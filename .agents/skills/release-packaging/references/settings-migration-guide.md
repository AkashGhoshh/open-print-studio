# Versioned Settings Schema & Migration Strategy

## 1. Schema Versioning Architecture
To prevent app crashes when upgrading versions, all application settings in `localStorage` (`ops_prefs`) and IndexedDB (`ops_db`) contain an integer `schemaVersion`:

```typescript
export interface AppSettingsV1 {
  schemaVersion: 1;
  theme: "dark" | "light";
  locale: "en" | "hi";
  privacyMode: boolean;
  autoExpiryHours: number;
  showCutGuides: boolean;
  showRulers: boolean;
}

export interface AppSettingsV2 extends AppSettingsV1 {
  schemaVersion: 2;
  defaultPaperPreset: "A4" | "4x6";
}
```

## 2. Linear Migration Pipeline
Migrations are pure functions executed sequentially upon application startup:

```typescript
type MigrationFn = (oldSettings: any) => any;

const MIGRATIONS: Record<number, MigrationFn> = {
  1: (v0) => ({
    schemaVersion: 1,
    theme: v0?.theme || "dark",
    locale: v0?.locale || "en",
    privacyMode: v0?.privacyMode ?? false,
    autoExpiryHours: v0?.autoExpiryHours ?? 24,
    showCutGuides: true,
    showRulers: true,
  }),
  2: (v1) => ({
    ...v1,
    schemaVersion: 2,
    defaultPaperPreset: "A4",
  }),
};

export function migrateSettings(raw: any, targetVersion: number = 2): any {
  let current = raw || {};
  let currentVersion = current.schemaVersion || 0;

  while (currentVersion < targetVersion) {
    const nextVersion = currentVersion + 1;
    const migrator = MIGRATIONS[nextVersion];
    if (migrator) {
      current = migrator(current);
      currentVersion = nextVersion;
    } else {
      break;
    }
  }
  return current;
}
```
This guarantees backward and forward stability across all desktop updates.
