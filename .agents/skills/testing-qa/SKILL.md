---
name: testing-qa
description: Use this skill when writing Vitest unit tests, golden millimeter coordinate assertions, pixel-for-pixel flip mode invariance tests, Playwright Electron E2E flows, visual regression, or configuring synthetic test fixtures.
---

# Testing & QA Strategy

## Goal
Enforce end-to-end quality assurance across the test pyramid, validating pure core math with Vitest golden fixtures, proving mirror/flip pixel invariance, and verifying user flows in Playwright.

## Use this skill when
- Writing or executing Vitest unit tests for `@ops/core`.
- Testing golden millimeter slot coordinates for A4, 4×6, and PVC tray layouts.
- Proving mathematically and visually that flip/mirror mode equals mirrored pixels.
- Implementing Playwright E2E tests for Electron application flows.
- Performing visual regression snapshot testing on rendered print sheets.
- Structuring synthetic test fixtures in `tests/fixtures/`.

## Do NOT use when
- Measuring physical printouts with calipers (use `print-calibration-wizard`).
- Scanning code for banned brand names (use `clean-room-audit`).
- Generating dummy synthetic cards from CLI (use `id-document-pipeline`).

## Workflow
1. **Unit Test Pure Math**: Run `npm run test:unit` via Vitest. Test millimeter conversions and layout solver boundary cases.
2. **Execute Golden Coordinate Tests**: Compare computed slot coordinates $(X, Y)$ against reference tables with $\pm 0.01$ mm tolerance.
3. **Verify Flip Mode Invariance**: Execute `flip-mirror.test.ts`. Verify $\sum |I - \text{flip}(\text{flip}(I))| == 0$.
4. **Prepare Synthetic Fixtures**: Place watermarked mock IDs in `tests/fixtures/`. Never use real documents.
5. **Run Playwright E2E**: Launch Electron test harness via `npm run test:e2e`. Verify ID card ingest, AI portrait flow, and print spooling.
6. **Capture Visual Snapshots**: Verify rendered canvas snapshots against approved golden sheets.

## Rules and constraints
- Never commit real identity documents or personal photos into test fixtures.
- Every layout must have a corresponding golden-coordinate test asserting slot positions.
- Unit tests in `@ops/core` must execute without DOM or browser dependencies.
- Playwright tests must run with all network traffic blocked to verify offline operation.

## Verification checklist
- [ ] All Vitest unit tests pass with 100% coverage on core geometry modules.
- [ ] Golden coordinate test verifies A4 (5-pair) and 4×6 (1-pair) slot positions.
- [ ] Flip mode invariance test confirms 0 pixel difference after double reflection.
- [ ] Playwright E2E suite passes in headless and headful modes.

## References
- [Flip / Mirror Mathematical Test Template](./templates/flip-mirror-test.ts)
- [Playwright E2E Matrix & Visual Regression Guide](./references/e2e-matrix-guide.md)
