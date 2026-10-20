---
name: id-document-pipeline
description: Use this skill when configuring ID card crop templates, Aadhaar, Ayushman, PAN or Voter ID processing, faint-text contrast darkening, disclaimer cleaning, signature overlays, or generating synthetic test cards.
---

# ID Document Pipeline

## Goal
Manage government document templates, automated dual-side bounding crops, in-memory password decryption, faint-text enhancement, and safe disclaimer removal using synthetic fixtures.

## Use this skill when
- Defining or updating document template coordinates (`Aadhaar`, `Ayushman`, `PAN`, `Voter`, `E-Shram`).
- Implementing independent front and back card side rotations (0°, 90°, 180°, 270°).
- Handling password-protected e-Aadhaar PDFs with zero-persistence memory decryption.
- Applying text bolding/darkening S-curve levels 0–5.
- Implementing the opt-in UIDAI disclaimer cleaner with bounding-box safeguards.
- Generating synthetic ID fixtures for development and testing.

## Do NOT use when
- Offloading PDF parsing to Web Workers (use `pdfjs-worker-rendering`).
- Calculating physical sheet multi-up positions (use `print-geometry-layout`).
- Persisting customer card session history to disk (use `privacy-local-data`).

## Workflow
1. **Load Template Data**: Retrieve coordinate boundaries from `templates/crop-templates.json`.
2. **In-Memory Password Ingestion**: Prompt user for password (`FIRST4NAME + YEAR`). Pass password directly to PDF worker in memory. Never log or store.
3. **Extract & Normalize**: Crop front and back regions and normalize to CR-80 standard ($85.60 \times 53.98$ mm).
4. **Apply Contrast / Bolding**: When `textBoldLevel > 0`, apply the analytical S-curve luminance filter to darken faint text.
5. **Evaluate Disclaimer Cleaner**: If user explicitly toggles `activePdfPatches = ["aadhaar_disclaimer"]`, mask only the bottom boilerplate region. Verify identity pixels are unaltered.
6. **Overlay Signature / Stamp**: Composite custom stamps or customer mobile numbers at configured relative coordinates.

## Rules and constraints
- Store templates as pure JSON data in `templates/crop-templates.json`, never hardcoded into React component code.
- Never persist, log, or cache PDF passwords; clear password strings from memory immediately after decryption.
- Disclaimer cleaner is strictly opt-in (default OFF) and must never intersect photo, QR, or text zones.
- Strictly forbidden from using real identity documents. All test data must be generated via `make_synthetic_id.py`.

## Verification checklist
- [ ] Template JSON validates against coordinate schema.
- [ ] Pixel integrity test verifies protected zones are 100% untouched by disclaimer cleaner.
- [ ] Decryption password is never present in localStorage, logs, or IndexedDB.
- [ ] Synthetic cards generated via `./scripts/make_synthetic_id.py` contain "SPECIMEN" watermark.

## References
- [Crop Templates Specification](./templates/crop-templates.json)
- [Disclaimer Cleaner & Text Darkener Spec](./references/disclaimer-cleaner-spec.md)
- [Synthetic ID Generator CLI](./scripts/make_synthetic_id.py)
