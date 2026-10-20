/**
 * Open Print Studio — PDF.js v4 Web Worker Template
 * Usage: Place in src/workers/pdf.worker.ts
 */

import * as pdfjs from "pdfjs-dist";

// Configure local worker source (bundled locally, no CDN)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface WorkerMessage {
  id: string;
  type: "DECRYPT_AND_RENDER";
  data: ArrayBuffer;
  password?: string;
  targetDpi?: number;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, type, data, password, targetDpi = 300 } = e.data;

  if (type === "DECRYPT_AND_RENDER") {
    try {
      const loadingTask = pdfjs.getDocument({
        data,
        password: password || undefined,
        cMapUrl: "/cmaps/",
        cMapPacked: true,
      });

      // Handle password requests
      loadingTask.onPassword = (updatePassword, reason) => {
        self.postMessage({ id, type: "PASSWORD_REQUIRED", reason });
      };

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // Render first page at target DPI
      const page = await pdf.getPage(1);
      const scale = targetDpi / 72.0;
      const viewport = page.getViewport({ scale });

      const canvas = new OffscreenCanvas(Math.round(viewport.width), Math.round(viewport.height));
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("OffscreenCanvas 2D context failed");

      await page.render({ canvasContext: ctx as any, viewport }).promise;
      const bitmap = canvas.transferToImageBitmap();

      // Cleanup page
      page.cleanup();

      // Return result with transferrable ImageBitmap
      self.postMessage(
        { id, type: "SUCCESS", numPages, bitmap, width: viewport.width, height: viewport.height },
        [bitmap]
      );
    } catch (err: any) {
      if (err.name === "PasswordException") {
        self.postMessage({ id, type: "WRONG_PASSWORD", error: "Incorrect document password." });
      } else {
        self.postMessage({ id, type: "ERROR", error: err.message || "Failed to parse PDF document." });
      }
    }
  }
};
