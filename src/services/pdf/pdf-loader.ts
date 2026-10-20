/**
 * Open Print Studio — PDF Loader Client Service
 * Dispatches PDF rasterization tasks to Web Worker.
 * Enforces zero-telemetry and memory-safe lifecycle rules.
 */

import type { PdfWorkerRenderRequest, PdfWorkerResponse } from "../../workers/pdf.worker";

export interface PdfRenderResult {
  pageNumber: number;
  numPages: number;
  width: number;
  height: number;
  bitmap: ImageBitmap;
}

export class PdfPasswordRequiredError extends Error {
  constructor(message = "Document is password protected.") {
    super(message);
    this.name = "PdfPasswordRequiredError";
  }
}

export class PdfWrongPasswordError extends Error {
  constructor(message = "Incorrect document password.") {
    super(message);
    this.name = "PdfWrongPasswordError";
  }
}

export class PdfLoaderService {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (res: PdfRenderResult) => void;
      reject: (err: Error) => void;
    }
  >();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL("../../workers/pdf.worker.ts", import.meta.url),
        { type: "module" }
      );

      this.worker.onmessage = (e: MessageEvent<PdfWorkerResponse>) => {
        const msg = e.data;
        const pending = this.pendingRequests.get(msg.id);
        if (!pending) return;

        this.pendingRequests.delete(msg.id);

        switch (msg.type) {
          case "SUCCESS":
            pending.resolve({
              pageNumber: msg.pageNumber,
              numPages: msg.numPages,
              width: msg.width,
              height: msg.height,
              bitmap: msg.bitmap,
            });
            break;
          case "PASSWORD_REQUIRED":
            pending.reject(new PdfPasswordRequiredError());
            break;
          case "WRONG_PASSWORD":
            pending.reject(new PdfWrongPasswordError(msg.error));
            break;
          case "ERROR":
            pending.reject(new Error(msg.error));
            break;
        }
      };

      this.worker.onerror = (err) => {
        for (const [id, req] of this.pendingRequests.entries()) {
          req.reject(new Error(`PDF Worker error: ${err.message}`));
          this.pendingRequests.delete(id);
        }
      };
    }
    return this.worker;
  }

  /**
   * Renders a PDF page to high-DPI ImageBitmap via background Web Worker.
   */
  public async renderPage(
    data: ArrayBuffer,
    options: {
      pageNumber?: number;
      password?: string;
      targetDpi?: number;
    } = {}
  ): Promise<PdfRenderResult> {
    const worker = this.getWorker();
    const id = `pdf_req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return new Promise<PdfRenderResult>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      // Clone array buffer for transferable postMessage
      const bufferCopy = data.slice(0);
      const req: PdfWorkerRenderRequest = {
        id,
        type: "RENDER_PAGE",
        data: bufferCopy,
        pageNumber: options.pageNumber ?? 1,
        password: options.password,
        targetDpi: options.targetDpi ?? 300,
      };

      worker.postMessage(req, [bufferCopy]);
    });
  }

  /**
   * Closes an ImageBitmap instance to release GPU memory.
   */
  public releaseBitmap(bitmap: ImageBitmap): void {
    try {
      if (typeof bitmap.close === "function") {
        bitmap.close();
      }
    } catch {
      // Ignored if already closed
    }
  }

  /**
   * Terminates the worker and cleans up any pending jobs.
   */
  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

export const pdfLoader = new PdfLoaderService();
