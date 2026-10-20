# Open Print Studio — Master Implementation Progress Tracker

**Document Purpose:** Living status report maintained across all build phases to enable unattended execution and immediate session resumption.  
**Last Updated:** Phase 0 Completion (2026-10-20)  
**Overall Status:** Phase 0 Complete (Green) -> Transitioning to Phase 1 (Foundation)  

---

## 1. Master Phase Matrix

| Phase | Description | Status | Exit Gate / Test Suite | Evidence / Report |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | **Spec Hardening & Audit** | **COMPLETE (GREEN)** | Math proofs, capacity checks, clean-room audit, `tools/validate_skills.py` | [`docs/reports/phase-0.md`](./reports/phase-0.md)<br>[`docs/PRD_v3.md`](./PRD_v3.md) |
| **Phase 1** | **Foundation** (Electron, React 19, TS, Vite, `@ops/core`, Settings, i18n, Tokens) | **COMPLETE (GREEN)** | Pure core Vitest tests (33/33, 100% core coverage), settings migrations, clean bundle | [`docs/reports/phase-1.md`](./reports/phase-1.md) |
| **Phase 2** | **ID Card Engine** (PDF Worker, Decrypt, Crop Templates, CR-80 Normalizer, S-Curve Contrast, Disclaimer Cleaner) | **COMPLETE (GREEN)** | In-memory decryption test, disclaimer non-overlap integrity test, synthetic card fixtures (58/58 tests passing) | [`docs/reports/phase-2.md`](./reports/phase-2.md) |
| **Phase 3** | **Sheets & Printing** (Dynamic Solver, A4 5-Pair, 4×6 1-Pair, PVC Tray, Nudge, Flip, Cut Marks, Print Pipeline, PDF/PNG Export) | **COMPLETE (GREEN)** | Golden mm coordinate assertions, double-flip pixel-for-pixel invariance test (73/73 tests passing) | [`docs/reports/phase-3.md`](./reports/phase-3.md) |
| **Phase 4** | **Overlays & Recents** (Signature/Stamp, Customer Mobile Overlay, IndexedDB `recent_designs`, 24h Auto-Expiry, Privacy Mode) | **COMPLETE (GREEN)** | Storage quota test, auto-expiry cleanup test, privacy mode zero-disk assertion (82/82 tests passing, 99.4% core coverage) | [`docs/reports/phase-4.md`](./reports/phase-4.md) |
| **Phase 5** | **Visiting & Membership Cards** (A4 10-Up Visiting Card 85×55mm, Finish Presets, CR-80 Membership Template Mode) | **COMPLETE (GREEN)** | Visiting card coordinate test, cut guide alignment verification (93/93 tests passing, 99.56% core coverage) | [`docs/reports/phase-5.md`](./reports/phase-5.md) |
| **Phase 6** | **AI Passport Photo Studio** (Offline `@mediapipe/tasks-vision`, 1.5px Alpha Feathering, Backgrounds, Dynamic Grid Solver) | **IN PROGRESS** | Sub-1.5s latency benchmark, edge fringe inspection, dynamic grid rotation solver test | In progress |
| **Phase 7** | **Calibration & Ergonomics** (Test Sheet with Rulers, Caliper Offset/Scale Solver, Batch Queue, Shortcuts, `ScannerProvider`) | **QUEUED** | Calibration mathematical solver test, keyboard navigation E2E flow | Pending |
| **Phase 8** | **Production Hardening & Release** (Strict CSP, Offline Flight-Mode E2E, Telemetry Grep, Windows NSIS/Portable Build, Docs) | **QUEUED** | Offline network blocking test, license audit, clean-room audit, smoke test binary | Pending |

---

## 2. Phase 0 Audit Summary & Resolved Decisions

Every contradiction in the original PRD has been resolved, proven with geometry math, and logged in [`docs/DECISIONS.md`](./DECISIONS.md):
- **ADR-001 (4×6 Sheet Capacity):** Proven that 4×6 photo paper fits **exactly 2 CR-80 cards (1 Pair)** at 100% scale.
- **ADR-002 (Dynamic Layout Solver):** Replaced static grid menus with a mathematical layout solver; 8-up on 4×6 requires 90° rotation ($45 \times 35\,\text{mm}$); 12-up is physically limited to $25 \times 30\,\text{mm}$ stamp sizes.
- **ADR-003 (Customer Data Privacy):** Moved customer card designs and mobile numbers from `localStorage` to `IndexedDB` (`ops_db`) with auto-expiry and Privacy Mode.
- **ADR-004 (Offline AI Vision):** Adopted `@mediapipe/tasks-vision` `ImageSegmenter` with locally bundled WASM and model files running in a Web Worker.
- **ADR-005 (Scanner Abstraction):** Defined cross-platform `ScannerProvider` (WIA, SANE, File Import).
- **ADR-006 (Printer Tray Realism):** Replaced programmatic hardware tray switching with Saved Printer Profiles + In-app Driver Setup Guide.
- **ADR-007 (Clean-Room Neutrality):** Standardized on `ops_` namespace and eradicated all third-party branding and deobfuscation references.
- **ADR-008 (PDF Worker Offloading):** Offloaded PDF parsing to Web Worker with transferrable `ImageBitmap` to maintain 60 FPS UI.
- **ADR-009 (Opt-in Disclaimer Cleaner):** Confined disclaimer mask strictly to $[0.91, 0.99] \times [0.05, 0.95]$ with zero overlap with identity data.
- **ADR-010 (Gap Disambiguation):** Separated PVC tray gap (`pvcHGap`, `pvcVGap`) from sheet multi-card gap (`sheetNormalVGap`, `sheetNormalHGap`).

---

## 3. Current Task & Immediate Next Steps

- **Current Step:** Begin **Phase 6: AI Passport Photo Studio** (offline MediaPipe WebAssembly segmentation, 1.5px feathered alpha mask, studio backgrounds, tonal adjustments, and solver-driven passport grids).
- **Completed Steps:** Phase 0 (Spec Hardening), Phase 1 (Foundation), Phase 2 (ID Card Engine), Phase 3 (Sheets & Printing), Phase 4 (Overlays and Recents), Phase 5 (Visiting & Membership Cards).
- **Open Blockers:** None.



