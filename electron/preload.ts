/**
 * Open Print Studio — Electron Preload Script
 * Strict context isolation bridge exposing type-safe IPC channels.
 */

import { contextBridge, ipcRenderer } from "electron";

export interface PrintOptions {
  printerName?: string;
  silent?: boolean;
  pageSize: "A4" | "4x6" | { width: number; height: number };
  landscape: boolean;
  scaleFactor?: number;
}

const opsBridge = {
  getPrinters: async () => {
    return await ipcRenderer.invoke("ops:get-printers");
  },
  printSheet: async (options: PrintOptions) => {
    return await ipcRenderer.invoke("ops:print-sheet", options);
  },
  exportPdf: async (filePath: string, landscape: boolean) => {
    return await ipcRenderer.invoke("ops:export-pdf", filePath, landscape);
  },
  getAppVersion: async () => {
    return await ipcRenderer.invoke("ops:get-version");
  },
};

contextBridge.exposeInMainWorld("opsBridge", opsBridge);

export type OpsBridge = typeof opsBridge;
