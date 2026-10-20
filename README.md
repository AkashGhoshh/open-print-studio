# Open Print Studio (OPS)

> **Offline-first, production-grade identity card and photo studio printing suite for Indian retail cyber cafes, Common Service Centers (CSCs), and photo studios.**

[![Tests](https://img.shields.io/badge/tests-131%2F131%20passing-brightgreen.svg)]()
[![Core Coverage](https://img.shields.io/badge/core%20coverage-99.64%25-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Privacy](https://img.shields.io/badge/privacy-100%25%20offline%20%7C%20zero%20telemetry-blue.svg)]()

---

## 🌟 Overview

**Open Print Studio** is an open-source, mathematically rigorous desktop printing suite designed specifically to streamline and automate high-volume document printing workflows across Indian retail computing environments.

### Core Capabilities:
- **🪪 ID Card Processing Engine:**
  - Automated client-side PDF decryption (e-Aadhaar, Voter EPIC, Ayushman Bharat, PAN card).
  - Web Worker OffscreenCanvas rendering at native 300 DPI.
  - Template-driven CR-80 card cropping with sub-millimeter precision.
  - Analytical faint-text darkening tone curve (TRC) to rescue degraded thermal/inkjet printouts while preserving clean white paper.
  - Opt-in disclaimer cleaner with mathematical non-overlap boundary verification.
- **📐 Mathematical Sheet & Multi-Up Layout Solver:**
  - Dynamic mathematical solver computing exact sheet capacity and coordinates from ISO millimeter dimensions and 300 DPI constants.
  - **A4 5-Pair Sheet (10 Cards):** 2 columns × 5 rows with 2 mm horizontal and 4 mm vertical gaps.
  - **4×6 Photo Paper (1 Pair / 2 Cards):** Mathematically proven exact capacity ($\lfloor 101.6 / 85.6 \rfloor \times \lfloor 152.4 / 53.98 \rfloor = 1 \times 2 = 2$).
  - **PVC Direct Tray Printing:** Epson, Canon, and Brother PVC ID card tray presets with front/back slot alignment.
  - Vector cutting marks, guillotine trim guides, and pixel-for-pixel mirror/flip printing mode.
- **🏷️ Visiting & Membership Cards:**
  - Standard 10-up visiting card layout ($85 \times 55$ mm) on A4 with cut tick marks.
  - Finish presets: Matte, Glossy, Linen, Textured with live visual canvas rendering.
  - Membership card template mode with photo cutout frames and membership badge overlays.
- **📷 AI Passport Photo Studio:**
  - 100% offline neural segmentation using bundled `@mediapipe/tasks-vision` WebAssembly runtime and local `selfie_segmenter.tflite` model.
  - 1.5px Gaussian alpha feathering eliminating jagged hair fringes and edge artifacts.
  - Studio background replacement: Studio Blue (`#2B6CB0`), Pure White (`#FFFFFF`), Light Grey (`#F1F5F9`), and Transparent.
  - Real-time tonal sliders: Brightness, Contrast, and Saturation.
  - Dynamic grid solver: 8-up on 4×6 photo paper (utilizing 90° rotation to $45 \times 35$ mm per ADR-002), 12-up stamp photos ($25 \times 30$ mm), and up to 32 photos on A4.
- **⚙️ Calibration Wizard & Batch Queue:**
  - Physical caliper calibration wizard generating 100 mm reference ruler test sheets.
  - Calculates per-printer hardware scale factors ($S = 100.0 / L_{\text{measured}}$) and origin offset corrections ($\Delta X, \Delta Y$).
  - Multi-card batch queue supporting up to 50 cards with multi-sheet auto-pagination and crash recovery.
  - Pluggable cross-platform scanner provider interface (WIA on Windows, SANE on Linux, Virtual 300 DPI).
- **🔒 Privacy, Clean-Room Neutrality & Security:**
  - 100% offline execution; zero telemetry, zero tracking pixels, zero analytics.
  - Strict Content Security Policy (`connect-src 'none'`) blocking any network connectivity at the browser engine level.
  - Recent designs stored locally in IndexedDB (`ops_db`) with auto-expiry and one-click Privacy Mode.
  - Clean-room implementation strictly banning third-party branding and proprietary identifiers (`ops_` namespace).

---

## 🏗️ Architecture

The application is structured as a monorepo featuring a pure, zero-dependency mathematical core package:

```
├── packages/
│   └── core/                      # Pure TypeScript Core Package (@ops/core)
│       ├── src/
│       │   ├── constants/         # ISO paper dimensions, 300 DPI constants
│       │   ├── geometry/          # Point2D, Rect2D, Affine transforms
│       │   ├── layout/            # Layout solver, sheet presets, passport grid solver
│       │   ├── crop/              # CR-80 normalizer, overlays, disclaimer cleaner
│       │   ├── filters/           # Faint-text darkening, feathering, photo adjustments
│       │   └── calibration/       # Caliper calibration math
│       └── tests/                 # 100% test coverage using Vitest
├── src/                           # Electron Renderer Process (React 19 + TypeScript + Vite)
│   ├── components/                # Modular UI components (ID card, photo studio, batch, calibration)
│   ├── services/                  # IndexedDB storage, PDF worker loader, scanner abstraction
│   └── workers/                   # Web Workers for PDF.js and MediaPipe AI segmentation
├── electron/                      # Electron Main & Preload Process
│   ├── main.ts                    # Window manager, typed IPC bridges, zero-margin print spooler
│   └── preload.ts                 # Context-isolated secure bridge
└── docs/                          # Architectural decisions (DECISIONS.md), progress, guides
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ or v22+
- npm v9+

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/openprintstudio/open-print-studio.git
cd open-print-studio

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### Running Test Suite & Quality Gates
```bash
# Run all unit and integration tests (131 tests across 31 suites)
npm test

# Run core package coverage audit (>= 90% required; currently 99.64%)
npm run test:coverage

# Full typecheck across core, renderer, and electron processes
npm run typecheck

# Clean-room neutral naming audit
npm run audit:names

# Zero-telemetry network isolation audit
npm run audit:telemetry
```

### Building Production Packages
```bash
# Build web bundles and compile electron process
npm run build && npm run build:electron

# Build Windows NSIS installer and portable executable
npm run dist:win

# Build Linux unpacked directory / AppImage
npm run dist:linux
```

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + P` | Quick Print active sheet with 100% scale |
| `Ctrl + O` | Import document, PDF, or card image |
| `Ctrl + 1` | Switch to ID Card Engine |
| `Ctrl + 2` | Switch to Visiting Cards |
| `Ctrl + 3` | Switch to Membership Cards |
| `Ctrl + 4` | Switch to AI Passport Photo Studio |
| `Ctrl + 5` | Open Printer Calibration Wizard |
| `Escape` | Close active drawer or modal dialog |

---

## 📖 Operator Documentation
- [English Operator Guide](docs/OPERATOR_GUIDE_EN.md)
- [Hindi Operator Guide / ऑपरेटर निर्देश](docs/OPERATOR_GUIDE_HI.md)
- [Physical Caliper Verification Checklist](docs/HUMAN_VERIFICATION.md)
- [Architectural Decision Records (ADR)](docs/DECISIONS.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)

---

## 📄 License
Open Print Studio is released under the permissive [MIT License](LICENSE).
