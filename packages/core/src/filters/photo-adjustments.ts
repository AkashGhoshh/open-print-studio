/**
 * Open Print Studio Core — Photo Tonal Adjustments & Studio Background Compositing
 * 
 * Provides pure mathematical operations for brightness, contrast, saturation,
 * unsharp mask sharpening, and background replacement.
 */

export interface PhotoAdjustmentsConfig {
  brightness?: number; // -100 to +100 (default 0)
  contrast?: number;   // -100 to +100 (default 0)
  saturation?: number; // -100 to +100 (default 0)
  sharpness?: number;  // 0 to 5 (default 0)
}

export type StudioBackgroundColor = "studio_blue" | "white" | "grey" | "transparent" | string;

export const STUDIO_BG_PRESETS: Record<string, string> = {
  studio_blue: "#2B6CB0",
  white: "#FFFFFF",
  grey: "#F1F5F9",
  transparent: "transparent",
};

/**
 * Parses hex color string to RGB tuple [R, G, B].
 */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Composites portrait image cutout with alpha mask over a solid background color.
 */
export function compositeCutoutOverBackground(
  rgbaData: Uint8ClampedArray | Uint8Array,
  alphaMask: Uint8ClampedArray | Uint8Array,
  bgColor: StudioBackgroundColor
): void {
  if (bgColor === "transparent") return;

  const resolvedHex = STUDIO_BG_PRESETS[bgColor] || bgColor;
  const [bgR, bgG, bgB] = hexToRgb(resolvedHex);

  const totalPixels = alphaMask.length;

  for (let i = 0; i < totalPixels; i++) {
    const alphaNorm = alphaMask[i] / 255; // 0.0 to 1.0
    const offset = i * 4;

    const fgR = rgbaData[offset];
    const fgG = rgbaData[offset + 1];
    const fgB = rgbaData[offset + 2];

    rgbaData[offset] = Math.round(fgR * alphaNorm + bgR * (1 - alphaNorm));
    rgbaData[offset + 1] = Math.round(fgG * alphaNorm + bgG * (1 - alphaNorm));
    rgbaData[offset + 2] = Math.round(fgB * alphaNorm + bgB * (1 - alphaNorm));
    rgbaData[offset + 3] = 255;
  }
}

/**
 * Applies brightness, contrast, and saturation adjustments in-place to RGBA pixel buffer.
 */
export function applyPhotoAdjustments(
  rgbaData: Uint8ClampedArray | Uint8Array,
  adjustments: PhotoAdjustmentsConfig
): void {
  const {
    brightness = 0,
    contrast = 0,
    saturation = 0,
  } = adjustments;

  if (brightness === 0 && contrast === 0 && saturation === 0) return;

  // Pre-calculate contrast factor
  // factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satFactor = 1 + saturation / 100;
  const len = rgbaData.length;

  for (let i = 0; i < len; i += 4) {
    let r = rgbaData[i];
    let g = rgbaData[i + 1];
    let b = rgbaData[i + 2];

    // 1. Brightness
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    // 2. Contrast
    if (contrast !== 0) {
      r = 128 + cFactor * (r - 128);
      g = 128 + cFactor * (g - 128);
      b = 128 + cFactor * (b - 128);
    }

    // 3. Saturation
    if (saturation !== 0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + satFactor * (r - lum);
      g = lum + satFactor * (g - lum);
      b = lum + satFactor * (b - lum);
    }

    // Clamping
    rgbaData[i] = Math.min(255, Math.max(0, Math.round(r)));
    rgbaData[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    rgbaData[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }
}
