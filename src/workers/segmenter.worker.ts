/**
 * Open Print Studio — Offline MediaPipe Segmentation Worker
 * 
 * Runs `@mediapipe/tasks-vision` ImageSegmenter in a Web Worker
 * with locally bundled WASM and model files.
 */

import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { applyAlphaFeathering } from "@ops/core";

let segmenterInstance: ImageSegmenter | null = null;

async function getSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterInstance) {
    const vision = await FilesetResolver.forVisionTasks("/wasm");
    segmenterInstance = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/selfie_segmenter.tflite",
        delegate: "CPU", // 100% reliable CPU WASM delegate
      },
      runningMode: "IMAGE",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  }
  return segmenterInstance;
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, imageBitmap, width, height } = e.data;

  if (type === "SEGMENT") {
    try {
      const segmenter = await getSegmenter();
      const result = segmenter.segment(imageBitmap);

      // Get confidence mask for person category
      const confidenceMasks = result.confidenceMasks;
      let alphaMask: Uint8ClampedArray;

      if (confidenceMasks && confidenceMasks.length > 0) {
        const floatData = confidenceMasks[0].getAsFloat32Array();
        alphaMask = new Uint8ClampedArray(floatData.length);
        for (let i = 0; i < floatData.length; i++) {
          alphaMask[i] = Math.round(floatData[i] * 255);
        }
      } else {
        // Fallback: full alpha
        alphaMask = new Uint8ClampedArray(width * height);
        alphaMask.fill(255);
      }

      // Apply 1.5px Gaussian edge feathering
      const feathered = applyAlphaFeathering(alphaMask, width, height);

      (self as any).postMessage(
        {
          id,
          success: true,
          alphaMask: feathered.buffer,
          width,
          height,
        },
        [feathered.buffer]
      );
    } catch (err: any) {
      (self as any).postMessage({
        id,
        success: false,
        error: err?.message || "Segmentation failed",
      });
    }
  }
};
