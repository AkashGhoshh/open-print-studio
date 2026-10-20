---
name: electron-secure-printing
description: Use this skill when configuring Electron printing, zero-margin spooling, 100% scale output, typed IPC bridges, strict Content Security Policy, printer profiles, or PDF and 300 DPI PNG export.
---

# Electron Secure Printing

## Goal
Manage secure, context-isolated Electron IPC print bridges, zero-margin 100% scale physical output, PDF/PNG export, and saved printer profiles without remote dependencies.

## Use this skill when
- Implementing Electron `main.ts`, `preload.ts`, or print IPC handlers.
- Configuring zero-margin, exact page size print options in Chromium.
- Generating vector print-to-PDF or 300 DPI PNG exports.
- Setting up Saved Printer Profiles with in-app driver configuration guides.
- Handling offline printer states and spooling errors cleanly in the UI.

## Do NOT use when
- Calculating slot positions, crop boxes, or millimeter geometries (use `print-geometry-layout`).
- Designing UI buttons, modals, or shopkeeper shortcuts (use `shopkeeper-ux`).
- Running printer calibration measurement wizard (use `print-calibration-wizard`).

## Workflow
1. **Enforce Security Boundaries**: In `main.ts`, ensure `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and enforce a strict CSP (`default-src 'self'`).
2. **Define Typed IPC Channels**: Expose print APIs through a typed preload interface (`window.opsPrint`).
3. **Configure Print Spooling**: Set `margins: { marginType: "none" }`, `scaleFactor: 100`, exact `pageSize`, and target `landscape` orientation.
4. **Model Printer Profiles**: Store saved printer configurations in IndexedDB. Never promise programmatic physical tray switching; direct the operator to the driver guide.
5. **Handle Failures**: Catch spooler rejections, detect offline printers via `getPrintersAsync()`, and present clear recovery steps.
6. **Provide Export Alternatives**: Provide one-click "Export Print-Ready PDF" and "Save 300 DPI PNG" using `printToPDF` and canvas rasterization.

## Rules and constraints
- Never disable `contextIsolation` or enable `nodeIntegration`.
- Never attempt programmatic physical tray switching via Electron; use saved profiles and in-app driver guides.
- All IPC payloads must be validated at the handler boundary.
- Zero external network requests: CSP `connect-src 'none'`.
- All exported PDFs and prints must be strictly at 100% scale with zero Chromium default margins.

## Verification checklist
- [ ] Electron window opens with strict CSP active and devtools security warnings clear.
- [ ] Print spooler sends jobs with `marginType: "none"` and `scaleFactor: 100`.
- [ ] Offline printer detection triggers friendly user alert without crashing.
- [ ] Exported PDF opens at identical physical millimeter dimensions.

## References
- [Printer Profiles & Driver Guide](./references/printer-profiles-guide.md)
- [IPC Print Handler Template](./templates/ipc-print-handler.ts)
