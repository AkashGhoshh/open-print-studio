# Printer Calibration Mathematical Formulas & Caliper Checklist

## 1. Physical Target & Tolerances
- **Target Standard:** ISO/IEC 7810 ID-1 CR-80 card ($85.60 \times 53.98$ mm).
- **Physical Caliper Target:** $85.60 \pm 0.40$ mm width; $53.98 \pm 0.30$ mm height.
- **Tools Required:** Metric vernier or digital calipers (or high-accuracy steel engineering ruler).

## 2. Calibration Sheet Reference Targets
The generated test sheet prints:
- Horizontal reference line $L_{X,\text{target}} = 100.00$ mm.
- Vertical reference line $L_{Y,\text{target}} = 100.00$ mm.
- Target origin markers at $(X_{\text{origin}}, Y_{\text{origin}}) = (10.00, 10.00)$ mm.

## 3. Transformation Formulas
When the operator measures actual printed lengths $L_{X,\text{measured}}$ and $L_{Y,\text{measured}}$:

1. **Scale Factors:**
   $$\text{scaleX} = \frac{L_{X,\text{target}}}{L_{X,\text{measured}}} = \frac{100.00}{L_{X,\text{measured}}}$$
   $$\text{scaleY} = \frac{L_{Y,\text{target}}}{L_{Y,\text{measured}}} = \frac{100.00}{L_{Y,\text{measured}}}$$

2. **Linear Offsets:**
   When measuring top/left edge margin discrepancy $\Delta X$ and $\Delta Y$:
   $$\text{offsetX} = X_{\text{target}} - X_{\text{measured}}$$
   $$\text{offsetY} = Y_{\text{target}} - Y_{\text{measured}}$$

3. **Application to Render Pipeline:**
   For any slot coordinate $(x, y)$ on canvas:
   $$x' = (x \cdot \text{scaleX}) + \text{offsetX}$$
   $$y' = (y \cdot \text{scaleY}) + \text{offsetY}$$

4. **Saving Profile:**
   Values are stored in IndexedDB under `printer_profiles` keyed by printer name:
   `{ id: "profile-epson-l805", scaleX, scaleY, offsetX, offsetY, updatedAt: Date.now() }`.
