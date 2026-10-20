---
name: print-calibration-wizard
description: Use this skill when implementing the printer calibration wizard, generating ruler test sheets, computing scale and offset corrections from physical caliper measurements, or saving per-printer calibration profiles.
---

# Print Calibration Wizard

## Goal
Guide shop operators through interactive printer calibration, generating precision test patterns and computing exact hardware scale factors and millimeter offsets to achieve $\pm 0.4$ mm card accuracy.

## Use this skill when
- Building the UI Calibration Wizard modal or step-by-step assistant.
- Generating calibration sheets with 100 mm reference rulers and origin marks.
- Calculating `scaleX`, `scaleY`, `offsetX`, and `offsetY` from user caliper measurements.
- Saving and loading named calibration records in `printer_profiles`.
- Troubleshooting mechanical paper feed slippage or misalignment on retail inkjet printers.

## Do NOT use when
- Computing multi-card grid layouts or slot rotations (use `print-geometry-layout`).
- Triggering zero-margin Electron print spooling (use `electron-secure-printing`).
- Designing general application toolbar buttons or themes (use `shopkeeper-ux`).

## Workflow
1. **Print Calibration Sheet**: User triggers calibration; system spools a 300 DPI test sheet containing exact 100 mm horizontal and vertical reference lines.
2. **Physical Caliper Measurement**: Operator uses digital calipers or an engineering ruler to measure the actual printed line lengths in millimeters.
3. **Input Measurement Data**: Operator types measured values ($L_{X,\text{measured}}$, $L_{Y,\text{measured}}$) into the wizard dialog.
4. **Compute Scale & Offsets**: System applies formula $\text{scale} = 100.0 / L_{\text{measured}}$ and derives linear delta offsets.
5. **Save to Printer Profile**: Update the active printer profile in IndexedDB with newly calibrated coefficients.
6. **Print Verification Card**: Spool a test CR-80 card outline; operator confirms dimensions measure $85.60 \pm 0.40$ mm.

## Rules and constraints
- Target tolerance is strictly within $\pm 0.40$ mm of standard CR-80 dimensions.
- Never hardcode printer offsets; calibration must be per-printer and persisted in user storage.
- The calibration sheet must be printed strictly at 100% scale without browser page-scaling.
- Provide clear visual guidance reminding users to use calipers or rigid metric rulers.

## Verification checklist
- [ ] Calibration sheet prints 100 mm reference marks at exact 300 DPI coordinates.
- [ ] Formula correctly computes scale (e.g. 98.0 mm measured yields scale factor $1.0204$).
- [ ] Computed calibration profiles persist across app restarts in IndexedDB.
- [ ] Verification test print measures within $\pm 0.40$ mm tolerance.

## References
- [Calibration Formulas & Caliper Checklist](./references/calibration-math-formulas.md)
- [Calibration Test Sheet Generator](./templates/calibration-sheet-generator.ts)
