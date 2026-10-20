# Architectural Decision Records (ADR) & PRD Deviations
## Open Print Studio (`ops`)

This document tracks every architectural deviation from the original PRD, providing rationale, mathematical proof, and implementation specifics.

---

### ADR-001: 4×6 Photo Paper Sheet Capacity Correction
- **PRD Reference:** Section 4.4, Section 11 Criterion 3.
- **Original Claim:** 4×6 photo paper ($102 \times 152\,\text{mm}$) fits "2 complete card pairs" (4 CR-80 cards).
- **Physical Reality:** 4 CR-80 cards ($85.60 \times 53.98\,\text{mm}$) require at minimum $107.96 \times 171.20\,\text{mm}$, which exceeds the physical paper by $+6.36\,\text{mm}$ in width and $+18.80\,\text{mm}$ in length even with 0 margin.
- **Decision:** Corrected capacity to **exactly 2 cards = 1 complete card pair (1 Front + 1 Back)** at 100% scale.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-002: Dynamic Layout Solver Replacing Hardcoded Grids
- **PRD Reference:** Section 4.5, Flowchart 8.2.
- **Original Claim:** Fixed grids (8-up, 12-up on 4×6; 16-up, 32-up on A4).
- **Physical Reality:**
  - Standard Indian Passport ($35 \times 45\,\text{mm}$) 8-up on 4×6 only fits if rotated by $90^\circ$ ($45 \times 35\,\text{mm}$).
  - 12-up on 4×6 is physically impossible for $35 \times 45\,\text{mm}$ (width $105\,\text{mm} > 101.6\,\text{mm}$). Only fits smaller stamp sizes ($25 \times 30\,\text{mm}$).
  - 32-up portrait on A4 is impossible for $35 \times 45\,\text{mm}$ ($360\,\text{mm} > 297\,\text{mm}$).
- **Decision:** Implement pure TypeScript `LayoutSolver` engine with rotation checks, margin validation, and "Fit to Sheet" automatic computation.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-003: Storage Segregation & Customer Data Privacy
- **PRD Reference:** Section 3, Section 5 (recent designs in localStorage).
- **Original Claim:** All recent designs, crops, and customer mobile numbers stored in `localStorage`.
- **Engineering & Legal Risk:** Chromium `localStorage` 5MB quota exhaustion crash from base64 bitmaps; main thread blocking; DPDP Act 2023 compliance risk on shared cyber cafe PCs.
- **Decision:**
  - `localStorage`: Strictly for lightweight UI preferences (`ops_prefs`).
  - `IndexedDB` (`ops_db`): For recent design sessions, image blobs, and thumbnails.
  - Added Privacy Controls: "Privacy Mode (Don't Save History)" toggle, Auto-Expiry (default 24h), and "Clear All History" wipe button.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-004: Offline Modern AI Segmentation (@mediapipe/tasks-vision)
- **PRD Reference:** Section 4.1, Section 9.
- **Original Claim:** Legacy `@mediapipe/selfie_segmentation`.
- **Engineering Risk:** Deprecated by Google; risks external CDN fetch if not monkey-patched, breaking offline-first guarantee.
- **Decision:** Use `@mediapipe/tasks-vision` `ImageSegmenter` with offline-bundled `.tflite` model and WASM binaries in `public/models/` and `public/wasm/`. Run in a dedicated Web Worker (`segmenter.worker.ts`).
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-005: Cross-Platform ScannerProvider Abstraction
- **PRD Reference:** Section 3, Section 9 (WIA PowerShell).
- **Engineering Risk:** Windows-only; breaks Linux/BOSS CSC setups.
- **Decision:** Implement polymorphic `ScannerProvider`:
  - `WiaScannerProvider` (Windows)
  - `SaneScannerProvider` (Linux)
  - `FileImportScannerProvider` (Universal fallback)
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-006: Hardware Tray Switching via Saved Printer Profiles
- **PRD Reference:** Section 4.6 (programmatic tray flags).
- **Technical Reality:** Chromium `webContents.print()` cannot mechanically switch proprietary vendor hardware trays (Epson CD/DVD tray).
- **Decision:** Saved Printer Profiles storing zero margins, exact paper size, and calibration offsets, accompanied by a visual In-App Driver Configuration Guide.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-007: Clean-Room Neutral Namespace (`ops_`)
- **PRD Reference:** Section 3, Section 7 (proprietary keys, cloud API URLs, deobfuscation wording).
- **Legal & Quality Mandate:** Genuine clean-room project without external branding or proprietary references.
- **Decision:** Prefix all internal storage keys, IPC channels, and events with `ops_`. Remove all 3rd-party identifiers and deobfuscation terminology.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-008: Worker Decoupling for PDF Decryption and Rendering
- **PRD Reference:** Section 3, Section 8.
- **Engineering Risk:** Large multi-page government PDFs block the React 19 UI thread during PDF.js decryption and canvas rasterization.
- **Decision:** Execute all PDF operations inside `pdf.worker.ts` returning transferrable `ImageBitmap` objects.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-009: Opt-In Disclaimer Cleaner with Non-Overlapping Bounding Box
- **PRD Reference:** Section 4.3 (Aadhaar disclaimer cleaner).
- **Legal Safeguard:** Prevent accidental masking of document data.
- **Decision:** Feature is strictly Opt-In (default OFF). Bounding box is hard-clamped to bottom margin $[0.91, 0.99] \times [0.05, 0.95]$ with zero overlap with QR code, photo, name, or Aadhaar number.
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.

---

### ADR-010: Disambiguation of PVC Tray Gap vs Multi-Card Sheet Gap
- **PRD Reference:** Section 4.5, Section 7.
- **Engineering Clarification:** PRD previously conflated PVC tray dual-card spacing with A4 sheet grid spacing.
- **Decision:** Distinct properties: `pvcHGap` & `pvcVGap` (tray calibration) vs `sheetNormalHGap` & `sheetNormalVGap` (sheet layout).
- **Date:** 2026-10-20
- **Status:** Approved in Phase 0.
