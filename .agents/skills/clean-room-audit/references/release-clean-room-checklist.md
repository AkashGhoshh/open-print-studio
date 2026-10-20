# Release Clean-Room & Legal Audit Checklist

## 1. Clean-Room Provenance Mandate
Every line of code, documentation, template, and design in Open Print Studio must originate from original authoring, public standards (ISO/IEC 7810, W3C), or open-source libraries with permissive licenses.
Under no circumstances should the project claim or display evidence of copying proprietary software.

## 2. Pre-Release Verification Checklist
Before any production tag or release binary is published:

- [ ] **Name Audit:** Run `python3 scripts/audit_names.py` across the entire workspace. Must return 0 violations.
- [ ] **Dependency License Compliance:**
  - Run `npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-3-Clause;ISC"` (or equivalent check).
  - Ensure zero copyleft/GPL licenses exist in bundled distribution without compliance review.
- [ ] **Asset Authenticity:**
  - Verify all UI icons originate from Lucide, Heroicons, or original SVG authoring.
  - Verify all sample document fixtures are synthetic (marked "SPECIMEN").
  - Confirm zero proprietary graphics, fonts, or copyrighted logos are present in `public/` or `src/assets/`.
- [ ] **Storage Namespace Hygiene:**
  - Verify all `localStorage` keys start with `ops_prefs`.
  - Verify all IndexedDB databases are named `ops_db`.
  - Verify all Electron IPC channels use `ops:*` prefix.
- [ ] **Documentation Cleanliness:**
  - Confirm documentation describes features by functional terms (e.g. "CR-80 PVC Card Printing", "AI Passport Photo Sheet").
  - Ensure all mentions of external URLs, proprietary product names, or deobfuscation are completely eradicated.
