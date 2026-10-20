# Playwright E2E Matrix & Visual Regression Testing Guide

## 1. Test Architecture & Structure
```
tests/
 ├── unit/                         # Vitest (Core math, geometry, solvers)
 │    ├── units.test.ts
 │    ├── layout-solver.test.ts
 │    ├── golden-coordinates.test.ts
 │    └── flip-mirror.test.ts
 ├── fixtures/                     # Strictly synthetic documents
 │    ├── synthetic-aadhaar.png
 │    ├── synthetic-pan.png
 │    └── synthetic-portrait.png
 └── e2e/                          # Playwright (Electron application flows)
      ├── id-card-flow.spec.ts
      ├── passport-photo-flow.spec.ts
      ├── recents-privacy.spec.ts
      └── visual-regression.spec.ts
```

## 2. Core E2E Test Scenarios (Playwright)
1. **Flow 1: e-Aadhaar Decrypt to A4 5-Card Print:**
   - Launch Electron app.
   - Upload synthetic PDF fixture with mock password `TEST1990`.
   - Verify front and back crops populate high-DPI canvas.
   - Select "A4 Sheet (5 Pairs)".
   - Verify 10 slots render with cut marks.
   - Trigger print IPC and intercept spooler arguments.
2. **Flow 2: AI Passport Portrait to 4×6 8-Up Print:**
   - Upload synthetic portrait.
   - Trigger background removal; verify Studio Blue fill.
   - Choose 4×6 photo sheet; verify automatic 90° rotation solver.
   - Assert visual screenshot diff $< 0.1\%$ against golden snapshot.
3. **Flow 3: Privacy Mode & Zero Disk Leak:**
   - Enable "Don't Save History" toggle.
   - Complete card layout flow.
   - Restart application.
   - Assert Recents Drawer is completely empty.
