/**
 * Open Print Studio Core — Analytical Faint-Text Darkening Tone Curve
 * Applies an analytical tone reproduction curve (TRC) to darken faded text
 * while preserving pure white paper backgrounds (> 220).
 */

const BOLD_LEVEL_GAMMA: Record<number, number> = {
  0: 1.0,
  1: 1.3,
  2: 1.6,
  3: 2.0,
  4: 2.5,
  5: 3.2,
};

/**
 * Transforms an 8-bit luminance value (0-255) using a tone curve.
 * Darkens faint ink (gray tones) while protecting clean white paper (> 220).
 */
export function transformLuminance(luminance: number, boldLevel: number): number {
  if (boldLevel <= 0) return luminance;
  if (luminance >= 220) return luminance; // White paper protection

  const gamma = BOLD_LEVEL_GAMMA[Math.min(5, Math.max(0, Math.round(boldLevel)))] ?? 2.0;
  
  // Normalize against 220 threshold to ensure smooth continuity at boundary
  const norm = luminance / 220;
  const darkened = Math.pow(norm, gamma) * 220;

  return Math.max(0, Math.min(220, Math.round(darkened)));
}

/**
 * Mutates an RGBA pixel buffer in-place to darken text based on boldness level (0-5).
 */
export function applyTextDarkening(pixels: Uint8ClampedArray, boldLevel: number): void {
  if (boldLevel <= 0) return;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Standard ITU-R BT.601 perceptual luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const newLum = transformLuminance(lum, boldLevel);

    if (newLum !== lum) {
      const ratio = lum > 0 ? newLum / lum : 0;
      pixels[i] = Math.min(255, Math.round(r * ratio));
      pixels[i + 1] = Math.min(255, Math.round(g * ratio));
      pixels[i + 2] = Math.min(255, Math.round(b * ratio));
    }
  }
}
