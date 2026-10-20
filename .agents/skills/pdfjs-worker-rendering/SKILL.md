---
name: pdfjs-worker-rendering
description: Use this skill when implementing pdfjs-dist v4 in Web Workers, decrypting password-protected PDFs, rendering documents at 300 DPI to OffscreenCanvas, managing page memory lifecycles, or handling corrupt PDF errors.
---

# PDF.js Worker Rendering

## Goal
Execute high-DPI document rasterization, e-Aadhaar decryption, and memory-safe page rendering in background Web Workers with zero UI thread jank.

## Use this skill when
- Implementing `pdf.worker.ts` with `pdfjs-dist` v4.
- Ingesting and decrypting password-protected government identity PDFs.
- Rendering PDF vector streams to 300 DPI `OffscreenCanvas` bitmaps.
- Managing canvas memory lifecycles, bitmap closures, and render queues.
- Formatting error states for wrong password, password required, and corrupt file inputs.

## Do NOT use when
- Extracting CR-80 card crops from the rasterized bitmap (use `id-document-pipeline`).
- Laying out multiple cards on paper sheets (use `print-geometry-layout`).
- Removing background from portrait photos (use `offline-ai-segmentation`).

## Workflow
1. **Initialize Web Worker**: Bundle `pdfjs-dist/build/pdf.worker.min.mjs` locally without remote CDN calls.
2. **Transfer ArrayBuffer**: Transfer uploaded file bytes to worker via transferrable streams.
3. **Handle Password Challenge**: If `PasswordException` fires, signal UI for user input. Pass password strictly in memory.
4. **Render to OffscreenCanvas**: Compute viewport scale for 300 DPI ($300 / 72 = 4.1667$). Render to `OffscreenCanvas`.
5. **Transfer ImageBitmap**: Convert offscreen canvas to transferrable `ImageBitmap` and return to main thread.
6. **Enforce Memory Cleanup**: Call `page.cleanup()` in worker and `bitmap.close()` in main thread after draw.

## Rules and constraints
- Never render PDFs directly on the React UI main thread.
- Cap concurrent rendering to a maximum of 2 pages at a time.
- All PDF worker bundles and CMAP files must be loaded locally from app assets.
- Explicitly release all `ImageBitmap` and canvas instances to prevent memory leaks.

## Verification checklist
- [ ] UI maintains 60 FPS while rendering a 10-page PDF document.
- [ ] Entering an incorrect password displays a clean retry prompt without worker crash.
- [ ] `page.cleanup()` and `bitmap.close()` are verified via memory snapshot.
- [ ] CMAPs load completely offline with zero external network attempts.

## References
- [Memory Lifecycle & Concurrency Rules](./references/memory-lifecycle-rules.md)
- [PDF.js Worker Implementation Template](./templates/pdf-worker.ts)
