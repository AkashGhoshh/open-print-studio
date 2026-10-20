/**
 * Open Print Studio — Electron IPC Print & Export Handler Template
 * Usage: Copy into electron/ipc/print-ipc.ts
 */

import { ipcMain, BrowserWindow, WebContentsPrintOptions } from "electron";
import { writeFile } from "node:fs/promises";

export interface PrintRequestPayload {
  printerName?: string;
  silent?: boolean;
  pageSize: "A4" | "4x6" | { width: number; height: number };
  landscape: boolean;
  scaleFactor?: number; // Always 100
  copies?: number;
}

export function registerPrintIpcHandlers(mainWindow: BrowserWindow): void {
  // Query available printers with status
  ipcMain.handle("ops:get-printers", async () => {
    return await mainWindow.webContents.getPrintersAsync();
  });

  // Zero-margin exact scale print
  ipcMain.handle("ops:print-sheet", async (_event, payload: PrintRequestPayload) => {
    const printOptions: WebContentsPrintOptions = {
      silent: payload.silent ?? false,
      printBackground: true,
      deviceName: payload.printerName || undefined,
      margins: { marginType: "none" }, // Zero margins
      pageSize: payload.pageSize,
      landscape: payload.landscape,
      scaleFactor: 100, // Exact 100% scale
      copies: payload.copies ?? 1,
    };

    return new Promise((resolve) => {
      mainWindow.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          resolve({ ok: false, error: failureReason });
        } else {
          resolve({ ok: true });
        }
      });
    });
  });

  // Print to PDF export
  ipcMain.handle("ops:export-pdf", async (_event, filePath: string, landscape: boolean) => {
    try {
      const data = await mainWindow.webContents.printToPDF({
        printBackground: true,
        margins: { marginType: "none" },
        landscape,
        scale: 1,
      });
      await writeFile(filePath, data);
      return { ok: true, path: filePath };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  });
}
