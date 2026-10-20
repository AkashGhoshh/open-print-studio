---
name: offline-ai-segmentation
description: Use this skill when implementing AI background removal, MediaPipe tasks-vision ImageSegmenter, offline WebAssembly inference, alpha mask feathering, studio background color replacement, or benchmarking segmentation latency.
---

# Offline AI Segmentation

## Goal
Execute 100% local, offline neural background segmentation for passport portraits in under 1.5 seconds using `@mediapipe/tasks-vision` and Web Workers.

## Use this skill when
- Initializing `@mediapipe/tasks-vision` `ImageSegmenter` in a Web Worker.
- Loading offline `.tflite` model and WASM binaries from local application assets.
- Applying soft Gaussian alpha feathering (1.5px) for natural hair and shoulder edges.
- Compositing portraits against standard studio backgrounds (Studio Blue, White, Grey).
- Detecting low-resolution portraits ($< 600$ px) and raising non-blocking UI warnings.
- Benchmarking segmentation latency to ensure sub-1.5s execution.

## Do NOT use when
- Laying out passport photos onto multi-up grid sheets (use `print-geometry-layout`).
- Adjusting basic brightness, saturation, or sharpness sliders (use `id-document-pipeline`).
- Printing or exporting the completed photo sheet (use `electron-secure-printing`).

## Workflow
1. **Bundle Local Assets**: Ensure `selfie_segmenter.tflite` is in `public/models/` and WASM binaries are in `public/wasm/`.
2. **Spawn Worker Thread**: Initialize `segmenter.worker.ts` with `OffscreenCanvas`.
3. **Execute Offline Segmentation**: Run `segmenter.segment()` to produce an 8-bit alpha confidence mask.
4. **Feather Alpha Edges**: Apply a 1.5px Gaussian kernel to soften hair boundaries and prevent blue fringe.
5. **Composite Background**: Blend the cutout over user-selected background color (e.g. `#2B6CB0` for Studio Blue).
6. **Benchmark Speed**: Ensure end-to-end processing completes within 1.5 seconds on commodity shop laptops.

## Rules and constraints
- Never use legacy `@mediapipe/selfie_segmentation`; use modern `@mediapipe/tasks-vision`.
- Zero network requests: WASM and model files must never be downloaded from CDNs at runtime.
- Never run AI segmentation on the main UI thread; always offload to a worker.
- Maximum allowable latency is 1.5 seconds on standard x86_64 dual-core hardware.

## Verification checklist
- [ ] Offline operation verified with Wi-Fi / Ethernet completely disconnected.
- [ ] `./scripts/benchmark_segmentation.py` reports total pipeline time $< 1.50$ s.
- [ ] Composited portrait shows clean, halo-free edges on dark and light backgrounds.
- [ ] Low-res image ($< 600$ px) triggers notification warning without crashing.

## References
- [Segmentation Architecture & Alpha Feathering](./references/segmentation-pipeline.md)
- [Performance Benchmark CLI](./scripts/benchmark_segmentation.py)
