# Worked Capacity Proofs & Physical Calculations

## 1. CR-80 Card Dimensions (ISO/IEC 7810 ID-1)
- **Width:** 85.60 mm (tolerance $\pm 0.12$ mm)
- **Height:** 53.98 mm (tolerance $\pm 0.05$ mm)
- **Corner Radius:** 3.18 mm
- **300 DPI Conversion:** 1 mm = $300 / 25.4 \approx 11.8110236$ px
  - Pixel Width = $85.60 \times 11.8110236 = 1011.02 \approx 1011$ px
  - Pixel Height = $53.98 \times 11.8110236 = 637.56 \approx 638$ px

## 2. 4×6 Photo Paper Capacity (101.6 × 152.4 mm)
- **Physical Reality:**
  - Landscape orientation: $85.60 \times 53.98$ mm.
  - Across 101.6 mm width: $\lfloor 101.6 / 85.60 \rfloor = 1$ column. (2 columns require 171.2 mm $> 101.6$ mm).
  - Along 152.4 mm length: $\lfloor 152.4 / 53.98 \rfloor = 2$ rows ($53.98 \times 2 = 107.96$ mm $\le 152.4$ mm).
  - Total capacity: $1 \times 2 = 2$ cards = **1 Front+Back Pair**.
  - **Fatal PRD Flaw:** The PRD's assertion of "2 card pairs" (4 cards) on 4×6 is physically impossible without shrinking, as 4 cards require at least $107.96 \times 171.2$ mm, which exceeds 4×6 by $+6.36$ mm in width and $+18.8$ mm in length.

## 3. A4 Paper Capacity (210 × 297 mm)
- **CR-80 ID Cards:**
  - 2 columns: $2 \times 85.60 = 171.2$ mm $\le 210$ mm (38.8 mm remainder).
  - 5 rows: $5 \times 53.98 = 269.9$ mm $\le 297$ mm (27.1 mm remainder).
  - Total capacity: $2 \times 5 = 10$ cards = **5 Front+Back Pairs**.
- **Visiting Cards (85 × 55 mm):**
  - 2 columns: $2 \times 85 = 170$ mm $\le 210$ mm (40 mm remainder).
  - 5 rows: $5 \times 55 = 275$ mm $\le 297$ mm (22 mm remainder).
  - Total capacity: $2 \times 5 = 10$ cards = **10-up**.

## 4. Passport Photo Layout (35 × 45 mm)
- **4×6 Paper:**
  - Unrotated (35 W × 45 H): $\lfloor 101.6 / 35 \rfloor \times \lfloor 152.4 / 45 \rfloor = 2 \times 3 = 6$ photos.
  - Rotated (45 W × 35 H): $\lfloor 101.6 / 45 \rfloor \times \lfloor 152.4 / 35 \rfloor = 2 \times 4 = 8$ photos.
  - 12-up is impossible for 35×45 mm; 12-up only fits 25×30 mm stamp size.
