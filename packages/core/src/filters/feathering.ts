/**
 * Open Print Studio Core — Alpha Feathering & Resolution Guard
 * 
 * Provides soft 1.5px Gaussian edge feathering for neural cutout boundaries
 * and checks minimum resolution guidelines (< 600 px).
 */

export interface LowResCheckResult {
  isLowRes: boolean;
  minDimension: number;
  warning?: string;
}

/**
 * Checks if input photo dimension is lower than acceptable studio print threshold (600 px).
 */
export function checkLowResolution(
  width: number,
  height: number,
  thresholdPx = 600
): LowResCheckResult {
  const minDimension = Math.min(width, height);
  const isLowRes = minDimension < thresholdPx;

  return {
    isLowRes,
    minDimension,
    warning: isLowRes
      ? `Low resolution image detected (${width}x${height} px, minimum recommended is ${thresholdPx} px). Printout may appear grainy.`
      : undefined,
  };
}

/**
 * Applies 1.5px Gaussian smoothing directly to an 8-bit alpha mask buffer.
 * Kernel: 3x3 Gaussian approximation with sigma ~ 0.8
 * [ 1  2  1 ]
 * [ 2  4  2 ] / 16
 * [ 1  2  1 ]
 */
export function applyAlphaFeathering(
  alphaMask: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(alphaMask.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let weightSum = 0;

      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;

        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;

          // Kernel weights
          let weight = 1;
          if (dx === 0 && dy === 0) weight = 4;
          else if (dx === 0 || dy === 0) weight = 2;

          sum += alphaMask[ny * width + nx] * weight;
          weightSum += weight;
        }
      }

      output[y * width + x] = Math.round(sum / weightSum);
    }
  }

  return output;
}
