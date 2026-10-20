/**
 * Open Print Studio Core — Paper Finish Presets
 * 
 * Provides color and tonal adjustments tailored to specific media types:
 * - Glossy Photo Paper (210-260 GSM): Enhanced contrast & vibrance for high-gloss reflex.
 * - Matte Heavy Cardstock (250-350 GSM): Non-reflective midtone smoothing and deep shadow lift.
 * - Plain / Inkjet: Linear pass-through.
 */

export type PaperFinish = "glossy" | "matte" | "plain";

export interface FinishOptions {
  finish: PaperFinish;
}

/**
 * Applies paper finish tonal adjustments in-place to RGBA pixel buffer.
 */
export function applyPaperFinishTransform(
  data: Uint8ClampedArray | Uint8Array,
  finish: PaperFinish
): void {
  if (finish === "plain") {
    // Identity - zero modifications
    return;
  }

  const len = data.length;

  if (finish === "glossy") {
    // Slight S-curve contrast and vibrance boost
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Normalized luminance
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Gentle S-curve centered around 0.5
      // y = x + 0.08 * sin(2 * PI * (x - 0.5))
      const factor = 1 + 0.08 * Math.sin(2 * Math.PI * (lum - 0.5));

      data[i] = Math.min(255, Math.max(0, Math.round(r * factor)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(g * factor)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(b * factor)));
    }
  } else if (finish === "matte") {
    // Matte cardstock: slight black level lift (+4 to prevent ink pooling) and slight highlight tame (-4)
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Compress range [0, 255] -> [5, 250] smoothly
      data[i] = Math.round(5 + (r / 255) * 245);
      data[i + 1] = Math.round(5 + (g / 255) * 245);
      data[i + 2] = Math.round(5 + (b / 255) * 245);
    }
  }
}
