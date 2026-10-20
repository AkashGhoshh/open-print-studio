# Open Print Studio — Always-On Workspace Rules

These rules apply to all development, design, and testing within the Open Print Studio project.

## 1. 100% Offline-First & No Telemetry
- The application must function completely offline without any internet connection.
- No analytics, tracking pixels, error telemetry, or background pings are permitted.
- The only permitted outbound network call is an explicit, user-triggered manual update check that is disabled by default.
- All AI models, WASM runtimes, fonts, and assets must be bundled locally.

## 2. Zero Real Identity Documents (Synthetic Data Only)
- Never import, process, store, screenshot, or commit real government identity documents (Aadhaar, PAN, Voter ID, Ayushman Bharat, Passport).
- Use only synthetic, procedurally generated dummy documents with fictional names, placeholder numbers, and prominent "SPECIMEN" watermarks for development, tests, and walkthroughs.

## 3. Mathematical Computation Over Assertion
- All sheet capacities, grid counts, gaps, offsets, and physical tolerances must be derived from mathematical calculation (DPI constants, ISO millimeter dimensions), never hardcoded or asserted.
- Example: CR-80 card capacity on 4×6 photo paper is computed as $\lfloor 101.6 / 85.6 \rfloor \times \lfloor 152.4 / 53.98 \rfloor = 1 \times 2 = 2$ cards (1 front+back pair). Claims of "2 card pairs" on 4×6 are physically impossible and strictly prohibited.

## 4. Clean-Room Neutral Namespace (`ops_`)
- Use the neutral prefix `ops_` for all storage keys, IPC channels, IndexedDB tables, configuration files, and custom data formats.
- Strictly ban third-party product names, server URLs, and proprietary identifiers across all code, tests, comments, and documentation.
- Maintain an untainted clean-room implementation based solely on public ISO standards, hardware specifications, and original architecture.

## 5. Architectural Decision Logging
- Every architectural choice, deviation, or mathematical correction from the PRD must be immediately logged in `docs/DECISIONS.md` with an ADR number, date, rationale, and mathematical proof.

## 6. Modular Core & Pure Functions
- All geometry, unit conversions, layout calculations, and coordinate transforms must reside in a zero-dependency pure TypeScript core package (`@ops/core`).
- No React, DOM, or Electron dependencies are permitted in `@ops/core`.
- Maintain 100% unit test coverage for core functions using Vitest.
