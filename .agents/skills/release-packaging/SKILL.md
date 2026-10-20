---
name: release-packaging
description: Use this skill when configuring electron-builder packaging, building Windows NSIS installers or portable binaries, code signing executables, managing versioned settings migrations, or validating production release checklists.
---

# Release Packaging & Distribution

## Goal
Build production-ready, code-signed, zero-dependency Windows desktop packages (NSIS installer and standalone portable binary) with versioned data migrations and opt-in updates.

## Use this skill when
- Configuring `electron-builder` targets and asset bundling scripts.
- Generating Windows x64 NSIS installers and portable executables.
- Managing code-signing certificates and Windows SmartScreen compliance.
- Implementing versioned settings schema migrations (`migrateSettings()`).
- Configuring manual, opt-in update check dialogues.
- Executing final production packaging validation.

## Do NOT use when
- Implementing print spooling or printer profile drivers (use `electron-secure-printing`).
- Auditing clean-room terminology or licenses (use `clean-room-audit`).
- Writing Vitest unit tests for core math (use `testing-qa`).

## Workflow
1. **Build Web Bundle**: Run `npm run build` to generate optimized production assets in `dist/`.
2. **Compile Electron Shell**: Compile `main.ts` and `preload.ts` into `dist-electron/`.
3. **Verify Asset Inclusion**: Ensure local AI models (`.tflite`), WASM binaries, and fonts are in distribution.
4. **Apply Versioned Migrations**: Ensure `migrateSettings()` handles backward-compatible upgrades from prior schemas.
5. **Run electron-builder**: Execute `npm run build:win` to generate NSIS and portable executables in `release/`.
6. **Smoke Test Binary**: Launch the packaged binary on a fresh Windows sandbox without network connectivity.

## Rules and constraints
- Never enable automatic background updates; updates must be explicit and user-triggered.
- Always generate both NSIS installer and standalone portable `.exe` formats.
- All application dependencies (PDF.js, MediaPipe WASM, models) must be packaged into the executable.
- The packaged binary must launch cleanly on a machine with zero internet connection.

## Verification checklist
- [ ] NSIS installer runs cleanly and creates desktop shortcuts.
- [ ] Portable binary runs without requiring admin privileges.
- [ ] Settings from previous versions migrate cleanly without schema crashes.
- [ ] App launches and prints cards in 100% offline flight mode.

## References
- [Electron Builder Configuration & Targets](./references/electron-builder-config.md)
- [Versioned Settings Migration Architecture](./references/settings-migration-guide.md)
