# Open Print Studio — Changelog

All notable changes to this project are documented in this file.
This project adheres to Semantic Versioning and clean-room implementation practices.

---

## [1.0.0] - 2026-10-20 (Phase 8 Production Release)

### Added
- **Phase 0: Spec Hardening & ADR Architecture:**
  - Audited PRD for impossible claims; proven that 4×6 photo paper fits 1 CR-80 card pair (not 2).
  - Derived 8-up on 4×6 passport photos by computing 90° rotation ($45 \times 35$ mm) mathematically (ADR-002).
  - Established clean-room neutral `ops_` naming convention with zero third-party references.
- **Phase 1: Zero-Dependency Core & Foundation:**
  - Implemented `@ops/core` pure TypeScript mathematical geometry engine with 100% unit test coverage.
  - Implemented settings persistence with versioned schema migrations (`migrateSettings()`).
  - Full English and Hindi bilingual localization framework with 100% key parity (81 keys).
  - Modern high-contrast dark/light design token system.
- **Phase 2: Client-Side ID Card Engine:**
  - In-memory PDF decryption and rendering at 300 DPI in isolated Web Workers using `pdfjs-dist`.
  - Sub-millimeter CR-80 card normalization and template cropping (Aadhaar, PAN, Voter, Ayushman).
  - Analytical S-curve faint-text darkening tone curve preserving pure white paper backgrounds.
  - Opt-in disclaimer cleaner with strict mathematical non-overlap boundary verification.
- **Phase 3: Multi-Up Sheet Solver & Print Pipeline:**
  - Dynamic mathematical layout solver for A4 (10 cards / 5 pairs), 4×6 (2 cards / 1 pair), and PVC direct trays.
  - Interactive millimeter nudge offsets ($\pm 10$ mm) and card scaling ($90\%$ to $110\%$).
  - Pixel-for-pixel mirror/flip printing mode with double-flip invariance.
  - Vector cutting marks, guillotine trim guides, and 300 DPI vector PDF / PNG export.
- **Phase 4: Overlays & Recent Designs Storage:**
  - Official stamp/signature overlay engine with rotation and scaling.
  - Customer mobile number overlay with customizable corner positioning.
  - Local IndexedDB storage engine (`ops_db`) for recent designs with 24-hour auto-expiry cleanup.
  - Zero-disk Privacy Mode toggle preventing persistence of customer identity data.
- **Phase 5: Visiting & Membership Card Studio:**
  - Standard 10-up visiting card layout ($85 \times 55$ mm) on A4 with cut tick marks.
  - Finish presets: Matte, Glossy, Linen, and Textured with live visual canvas rendering.
  - Membership card template mode with customizable photo cutout frames and membership badge overlays.
- **Phase 6: AI Passport Photo Studio:**
  - 100% offline neural segmentation using bundled `@mediapipe/tasks-vision` WebAssembly runtime and local `selfie_segmenter.tflite` model.
  - Sub-1.5s latency benchmark (0.391s achieved on standard CPU).
  - 1.5px Gaussian alpha feathering eliminating jagged hair fringes and edge artifacts.
  - Studio background replacement (Studio Blue, Pure White, Light Grey, Transparent) and real-time tonal sliders.
  - Dynamic grid solver generating 8-up on 4×6, 12-up stamp, and 32-up on A4.
- **Phase 7: Calibration Wizard & Ergonomics:**
  - Step-by-step interactive printer calibration wizard computing physical scale factor ($S = 100.0 / L_{\text{measured}}$) and origin offsets.
  - Vector 100 mm reference ruler test sheet generator.
  - Multi-card batch queue supporting up to 50 cards with multi-sheet auto-pagination and crash recovery.
  - Pluggable cross-platform scanner provider interface (WIA, SANE, Virtual 300 DPI).
  - Bounded 50-step immutable undo/redo history engine.
  - Global keyboard shortcuts (`Ctrl+P`, `Ctrl+O`, `Ctrl+1-5`, `Escape`).
- **Phase 8: Production Hardening:**
  - Strict Content Security Policy (`connect-src 'none'`) blocking any network connectivity.
  - Automated 100% offline flight-mode test suite verifying zero network calls.
  - High-throughput performance and memory leak benchmarks (50-card batches, 1000 solves, 600k pixels).
  - Production packaging for Windows NSIS, portable executable, and Linux distributions.
  - Comprehensive English and Hindi operator guides.
