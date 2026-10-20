---
name: print-geometry-layout
description: Use this skill when calculating print geometry, mm to px 300 DPI conversions, CR-80 card dimensions, A4 layout grids, 4x6 photo paper capacities, nudge offsets, or solving multi-up sheet placements.
---

# Print Geometry & Layout

## Goal
Provide mathematically verified, zero-dependency geometric calculations, 300 DPI pixel derivations, dynamic multi-up layout solving, and flip/nudge transformations for all card and photo print targets.

## Use this skill when
- Implementing or unit-testing core geometric math in `@ops/core`.
- Converting physical millimeter dimensions to 300 DPI raster pixels.
- Calculating grid capacities, margins, and gaps for A4, 4×6, or PVC tray layouts.
- Applying nudge offsets (`offsetX`, `offsetY`, `cardScale`, `pvcHGap`, `pvcVGap`, `sheetNormalVGap`).
- Computing mirrored/flip coordinates for reverse-printing thermal and PVC card printers.

## Do NOT use when
- Managing native Electron print spooling or printer drivers (use `electron-secure-printing`).
- Implementing UI canvas zoom/pan gesture handlers (use `shopkeeper-ux`).
- Running AI background segmentation (use `offline-ai-segmentation`).

## Workflow
1. **Define Physical Units**: Use standard ISO/IEC 7810 ID-1 constants ($85.60 \times 53.98$ mm). Convert mm to pixels at 300 DPI using $1\text{ mm} = 300 / 25.4\text{ px} \approx 11.8110236\text{ px}$.
2. **Execute Layout Solver**: Pass sheet dimensions, item size, gaps, margins, and rotation flags to `solveGrid()`.
3. **Verify Fit in Both Orientations**: Test both normal and 90° rotated configurations. Select optimal capacity.
4. **Apply Nudges & Calibration**: Shift item coordinates by global offsets and scale factors.
5. **Handle Mirror / Flip**: When `isFlipped` is enabled, reflect $X$ coordinates across the sheet width: $X' = W_{\text{sheet}} - X - W_{\text{item}}$.
6. **Assert Golden Coordinates**: Compare calculated slot positions against golden reference fixtures.

## Rules and constraints
- Never hardcode pixel values; always derive from millimeter values and 300 DPI constants.
- Never assert sheet capacities; always compute them mathematically via `capacity_check.py`.
- 4×6 photo paper fits **exactly 2 CR-80 cards (1 pair)** at 100% scale. Any claim of "2 card pairs" is physically impossible.
- 8-up 35×45 mm passport photos on 4×6 require rotating the items by 90°.
- Pure TypeScript only: no DOM (`window`, `document`), React, or Electron imports in geometry modules.

## Verification checklist
- [ ] Capacity matches mathematical calculation using `./scripts/capacity_check.py`.
- [ ] Golden coordinates match `./references/golden-coordinates.md`.
- [ ] Double-flip invariance test passes: $\text{flip}(\text{flip}(\text{layout})) \equiv \text{layout}$.
- [ ] Rounding errors are strictly within $\pm 0.05$ mm tolerance.

## References
- [Worked Capacity Proofs](./references/worked-capacities.md)
- [Golden Coordinate Fixtures](./references/golden-coordinates.md)
- [Capacity Check CLI Helper](./scripts/capacity_check.py)
