/**
 * Open Print Studio — PDF.js Worker Renderer
 * Runs completely offline in Web Worker.
 * Handles in-memory decryption and 300 DPI OffscreenCanvas rasterization.
 */

import * as pdfjs from "pdfjs-dist";

// Set local worker bundle
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export interface PdfWorkerRenderRequest {
  id: string;
  type: "RENDER_PAGE";
  data: ArrayBuffer;
  pageNumber?: number;
  password?: string;
  targetDpi?: number;
}

export type PdfWorkerResponse =
  | {
      id: string;
      type: "SUCCESS";
      pageNumber: number;
      numPages: number;
      width: number;
      height: number;
      bitmap: ImageBitmap;
    }
  | {
      id: string;
      type: "PASSWORD_REQUIRED";
      reason?: string;
    }
  | {
      id: string;
      type: "WRONG_PASSWORD";
      error: string;
    }
  | {
      id: string;
      type: "ERROR";
      error: string;
    };

self.onmessage = async (e: MessageEvent<PdfWorkerRenderRequest>) => {
  const { id, type, data, pageNumber = 1, password, targetDpi = 300 } = e.data;

  if (type === "RENDER_PAGE") {
    let cleanPassword = password;
    try {
      const loadingTask = pdfjs.getDocument({
        data,
        password: cleanPassword || undefined,
        cMapUrl: "/cmaps/",
        cMapPacked: true,
      });

      loadingTask.onPassword = (_updatePassword: Function, reason: string) => {
        (self as any).postMessage({ id, type: "PASSWORD_REQUIRED", reason } satisfies PdfWorkerResponse);
      };

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const validPageNumber = Math.min(Math.max(1, pageNumber), numPages);

      const page = await pdf.getPage(validPageNumber);
      const scale = targetDpi / 72.0;
      const viewport = page.getViewport({ scale });

      const canvasWidth = Math.round(viewport.width);
      const canvasHeight = Math.round(viewport.height);

      const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create OffscreenCanvas 2D context");
      }

      await page.render({
        canvasContext: ctx as any,
        viewport,
      }).promise;

      const bitmap = canvas.transferToImageBitmap();

      // Page memory lifecycle cleanup
      page.cleanup();

      // Clear password string reference
      cleanPassword = undefined;

      const response: PdfWorkerResponse = {
        id,
        type: "SUCCESS",
        pageNumber: validPageNumber,
        numPages,
        width: canvasWidth,
        height: canvasHeight,
        bitmap,
      };

      (self as any).postMessage(response, [bitmap]);
    } catch (err: any) {
      cleanPassword = undefined;
      if (err?.name === "PasswordException") {
        (self as any).postMessage({
          id,
          type: "WRONG_PASSWORD",
          error: "Incorrect document password. Please re-enter.",
        } satisfies PdfWorkerResponse);
      } else {
        (self as any).postMessage({
          id,
          type: "ERROR",
          error: err?.message || "Failed to parse and render PDF document.",
        } satisfies PdfWorkerResponse);
      }
    }
  }
};
