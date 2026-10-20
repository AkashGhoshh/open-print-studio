# Disclaimer Cleaner Specification & Pixel Integrity Verification

## 1. Safety & Legal Philosophy
The Aadhaar Disclaimer Cleaner is designed exclusively to remove the boilerplate printing notice at the extreme bottom of e-Aadhaar cards when printing to physical CR-80 PVC cards.

To ensure strict legal and document integrity:
1. **Opt-in Only:** The feature is disabled (`enabled: false`) by default. The operator must explicitly toggle the checkbox.
2. **Strict Geometric Bounding Box:** The mask applies ONLY within the non-identity bottom region:
   - Relative $Y \in [0.92, 0.985]$
   - Relative $X \in [0.05, 0.95]$
3. **Hard Forbidden Zones:**
   - Identity Photo: Relative $X \in [0.05, 0.35], Y \in [0.20, 0.75]$ — strictly protected.
   - Secure QR Code: Relative $X \in [0.65, 0.95], Y \in [0.20, 0.70]$ — strictly protected.
   - Demographic Text (Name, DOB, Gender, Aadhaar Number): Relative $X \in [0.35, 0.95], Y \in [0.20, 0.90]$ — strictly protected.

## 2. Mathematical Integrity Test
In our automated test suite (`tests/unit/disclaimer-cleaner.test.ts`), we verify that applying the disclaimer patch satisfies:
$$\sum_{(x,y) \in \text{ProtectedZone}} |I_{\text{patched}}(x, y) - I_{\text{original}}(x, y)| \equiv 0$$
Any non-zero delta in the protected region immediately fails the build.

## 3. Faint-Text Darkening Algorithm
Faded government PDF text is darkened using an analytical S-curve luminance filter:
$$L_{\text{out}} = \frac{255}{1 + e^{-k \cdot (L_{\text{in}} - 128) / 32}}$$
where $k \in [0.0, 5.0]$ is controlled by `textBoldLevel`:
- Level 0: $k = 0.0$ (no alteration).
- Level 3: $k = 1.8$ (moderate contrast boost for faded dot-matrix / inkjet prints).
- Level 5: $k = 3.5$ (aggressive thresholding for heavily faded scans).
White paper background ($L > 220$) is protected from greying.
