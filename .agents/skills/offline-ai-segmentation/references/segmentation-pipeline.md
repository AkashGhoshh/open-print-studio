# Offline AI Background Segmentation Architecture

## 1. Migration from Legacy MediaPipe
The legacy `@mediapipe/selfie_segmentation` library is officially deprecated and attempts to download `.tflite` binaries from `cdn.jsdelivr.net` at runtime.
Open Print Studio uses the modern `@mediapipe/tasks-vision` `ImageSegmenter` API, with all dependencies bundled inside the application distribution:
- Model: `public/models/selfie_segmenter.tflite` (or `selfie_multiclass_256x256.tflite`)
- WASM: `public/wasm/vision_wasm_internal.wasm` and `vision_wasm_internal.js`

## 2. Worker Execution & Offline Initialization
Segmentation runs inside `segmenter.worker.ts`:
```typescript
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

const vision = await FilesetResolver.forVisionTasks("./wasm");
const segmenter = await ImageSegmenter.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "./models/selfie_segmenter.tflite",
    delegate: "GPU", // falls back gracefully to CPU WASM
  },
  runningMode: "IMAGE",
  outputCategoryMask: false,
  outputConfidenceMasks: true,
});
```

## 3. Alpha Feathering & Natural Edge Blending
Raw neural masks have stepped pixel boundaries around hair and collars.
We apply a 1.5px Gaussian kernel feathering on the confidence mask:
$$\alpha_{\text{smooth}}(x, y) = \sum_{dx=-1}^{1} \sum_{dy=-1}^{1} G(dx, dy) \cdot \alpha(x+dx, y+dy)$$
This prevents harsh halo artifacts when compositing against Studio Blue (`#2B6CB0`) or Studio White (`#FFFFFF`).

## 4. Low-Resolution Guard
If the input image dimension is $< 600$ px on either axis, the pipeline emits a `LOW_RES_WARNING` advising the operator: *"Low resolution photo detected. Print quality may appear grainy."*
Processing continues without blocking the user.
