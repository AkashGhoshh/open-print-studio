---
name: privacy-local-data
description: Use this skill when implementing IndexedDB storage for recent designs, localStorage for UI preferences, auto-expiry cleanup jobs, Privacy Mode history toggles, customer ID data deletion, or auditing zero-telemetry compliance.
---

# Privacy & Local Data Management

## Goal
Enforce Indian DPDP Act 2023 compliance, zero outbound network telemetry, and memory-safe storage segregation between lightweight `localStorage` prefs and `IndexedDB` customer records.

## Use this skill when
- Implementing or querying `ops_prefs` in `localStorage`.
- Storing recent card design sessions, crop coordinates, and image blobs in `IndexedDB` (`ops_db`).
- Implementing the "Don't Save History" (Privacy Mode) toggle.
- Configuring automated background session expiry (default: 24 hours).
- Implementing the one-click "Clear All History" wipe button.
- Auditing the codebase to ensure zero telemetry or unauthorized network requests.

## Do NOT use when
- Extracting crop coordinates from document templates (use `id-document-pipeline`).
- Laying out cards on print sheets (use `print-geometry-layout`).
- Managing Electron window security or CSP (use `electron-secure-printing`).

## Workflow
1. **Segregate Stores**: Store boolean preferences, active tab, and theme in `localStorage`. Store customer mobile numbers, crops, and thumbnails in `IndexedDB`.
2. **Evaluate Privacy Mode**: Before saving a design to `recent_designs`, check `ops_prefs.privacyMode`. If enabled, abort write.
3. **Execute Auto-Expiry**: Run periodic cleanup deleting records where `timestamp < Date.now() - retentionMs`.
4. **Provide Instant Wipe**: Implement `clearAllHistory()` which truncates the `recent_designs` store and closes all blob URLs.
5. **Audit Network Traffic**: Run `check_no_telemetry.py` to assert that no `fetch()`, `XHR`, or tracking calls exist.
6. **E2E Isolation Test**: Verify in Playwright that the entire app operates seamlessly with network routes blocked.

## Rules and constraints
- Never store base64 images, document crops, or customer mobile numbers in `localStorage`.
- Never transmit customer data, crash reports, or analytics to any remote server.
- Privacy Mode must prevent any disk write of customer identity data.
- All stored records must support instantaneous, irreversible deletion by the operator.

## Verification checklist
- [ ] `localStorage` remains strictly $< 50$ KB under all conditions.
- [ ] Auto-expiry successfully deletes records older than configured window.
- [ ] "Clear All History" completely purges all IndexedDB card records.
- [ ] `./scripts/check_no_telemetry.py` passes with zero violations.

## References
- [Storage Schema & Privacy Architecture](./references/storage-schema.md)
- [Zero-Telemetry Auditor Script](./scripts/check_no_telemetry.py)
