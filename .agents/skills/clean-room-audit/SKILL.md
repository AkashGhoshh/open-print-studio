---
name: clean-room-audit
description: Use this skill when conducting clean-room audits, enforcing ops_ neutral naming, scanning for banned terms or proprietary URLs, verifying open-source licenses, or validating release provenance checklists.
---

# Clean-Room Audit & Provenance

## Goal
Enforce genuine clean-room implementation hygiene, neutral `ops_` namespacing, zero proprietary branding, and verifiable open-source license compliance.

## Use this skill when
- Naming new storage keys, IPC events, classes, or database stores.
- Running automated scans for banned proprietary product names or server URLs.
- Auditing third-party npm package licenses before production bundling.
- Reviewing documentation, code comments, and commit messages for clean-room phrasing.
- Executing final pre-release provenance verification.

## Do NOT use when
- Converting physical millimeter dimensions to pixels (use `print-geometry-layout`).
- Benchmarking AI segmentation performance (use `offline-ai-segmentation`).
- Auditing network telemetry and outgoing socket calls (use `privacy-local-data`).

## Workflow
1. **Apply Neutral Prefix**: Use `ops_` for all storage keys (`ops_prefs`), IndexedDB databases (`ops_db`), and IPC channels (`ops:*`).
2. **Consult Banned Terms**: Reference `./references/banned-terms.txt` to avoid prohibited words or external domains.
3. **Run Automated Audit**: Execute `python3 ./scripts/audit_names.py` across all workspace files.
4. **Remediate Findings**: Replace flagged terms with neutral functional descriptions (e.g. replace product names with "CR-80 ID Printing Utility").
5. **Check Package Licenses**: Ensure all dependencies in `package.json` use permissive licenses (MIT, Apache-2.0, BSD).
6. **Sign Off Release Checklist**: Complete all items in `./references/release-clean-room-checklist.md`.

## Rules and constraints
- Strictly forbid third-party product names, proprietary URLs, or branding anywhere in code, comments, or docs.
- Never state or imply that code was derived from proprietary sources.
- Exclude `references/banned-terms.txt` itself from audit scans.
- All intellectual property must stem from ISO standards and original design.

## Verification checklist
- [ ] `./scripts/audit_names.py` returns exit code 0.
- [ ] All storage keys and IPC events adhere to `ops_` / `ops:*` naming.
- [ ] All bundled npm packages have permissive commercial licenses.
- [ ] Release checklist in `./references/release-clean-room-checklist.md` is fully checked.

## References
- [Banned Terms List](./references/banned-terms.txt)
- [Release Clean-Room Checklist](./references/release-clean-room-checklist.md)
- [Audit Names Scanner Script](./scripts/audit_names.py)
