# Golden Millimeter Layout Coordinates

All coordinates represent top-left slot positions in millimeters at 100% scale.

## 1. A4 Sheet: 5 CR-80 Card Pairs (2 Columns × 5 Rows)
- Paper: 210.0 × 297.0 mm. Card: 85.60 × 53.98 mm.
- Margin Left: 17.40 mm, Margin Top: 8.55 mm.
- Column Gap: 4.00 mm, Row Gap: 2.50 mm.

| Slot # | Side | Column | Row | X (mm) | Y (mm) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Front | Col 1 | Row 1 | 17.40 | 8.55 |
| 2 | Back | Col 2 | Row 1 | 107.00 | 8.55 |
| 3 | Front | Col 1 | Row 2 | 17.40 | 65.03 |
| 4 | Back | Col 2 | Row 2 | 107.00 | 65.03 |
| 5 | Front | Col 1 | Row 3 | 17.40 | 121.51 |
| 6 | Back | Col 2 | Row 3 | 107.00 | 121.51 |
| 7 | Front | Col 1 | Row 4 | 17.40 | 177.99 |
| 8 | Back | Col 2 | Row 4 | 107.00 | 177.99 |
| 9 | Front | Col 1 | Row 5 | 17.40 | 234.47 |
| 10 | Back | Col 2 | Row 5 | 107.00 | 234.47 |

## 2. 4×6 Photo Sheet: 1 CR-80 Card Pair (1 Column × 2 Rows)
- Paper: 101.6 × 152.4 mm. Card: 85.60 × 53.98 mm.
- Margin Left: 8.00 mm, Margin Top: 20.22 mm.
- Row Gap: 4.00 mm.

| Slot # | Side | Column | Row | X (mm) | Y (mm) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Front | Col 1 | Row 1 | 8.00 | 20.22 |
| 2 | Back | Col 1 | Row 2 | 8.00 | 78.20 |

## 3. Mirror / Flip Transformation Formula
For sheet width $W$:
$$X_{\text{mirrored}} = W - X - \text{ItemWidth}$$
Applying reflection twice yields identical initial coordinates:
$$X_{\text{restored}} = W - (W - X - \text{ItemWidth}) - \text{ItemWidth} = X$$
