# PDF.js Worker Memory Lifecycle & Concurrency Rules

## 1. The Multi-Page PDF Problem
In Indian print shops, operators frequently upload multi-page scans or heavy e-Aadhaar PDFs containing complex vector paths, embedded fonts, and high-resolution JPEG streams.
Rendering multi-page documents on the main UI thread causes catastrophic UI freezes, dropped frames, and potential `Out Of Memory` (OOM) tab crashes.

## 2. Dedicated Web Worker Architecture
All PDF decryption and page rasterization execute inside a dedicated Web Worker (`pdf.worker.ts`):
1. **Transferrable Buffers:** The PDF file is read as an `ArrayBuffer` and transferred (`postMessage([buffer], [buffer])`) to the worker to eliminate memory copying.
2. **Offscreen Canvas:** Pages are rasterized directly onto an `OffscreenCanvas` at 300 DPI:
   ```typescript
   const viewport = page.getViewport({ scale: 300 / 72 }); // PDF 72pt to 300 DPI
   const canvas = new OffscreenCanvas(viewport.width, viewport.height);
   const ctx = canvas.getContext("2d");
   await page.render({ canvasContext: ctx, viewport }).promise;
   const bitmap = canvas.transferToImageBitmap();
   postMessage({ type: "PAGE_RENDERED", bitmap }, [bitmap]);
   ```
3. **Transferrable ImageBitmap:** The resulting `ImageBitmap` is transferred back to the main thread with zero-copy overhead.

## 3. Strict Concurrency & Memory Rules
- **Cap Concurrent Page Renders:** Maximum 2 concurrent page renders at any time. Additional pages must be queued.
- **Explicit Cleanup:**
  - Call `page.cleanup()` immediately after rasterization completes.
  - Call `pdfDocument.destroy()` when the document is closed or replaced.
  - On the main thread, call `bitmap.close()` as soon as the pixel data is drawn to the presentation canvas or cropped.
- **Error Propagation:**
  - Password required: Return `NEED_PASSWORD` with prompt reason.
  - Incorrect password: Catch `PasswordException` -> return `WRONG_PASSWORD` (with retry count).
  - Corrupt / Truncated PDF: Catch `InvalidPDFException` -> return descriptive user message.
