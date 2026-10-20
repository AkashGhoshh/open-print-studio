/**
 * Open Print Studio — Electron Main Process
 * Strict context isolation, zero remote content, zero telemetry.
 */

import { app, BrowserWindow, ipcMain, session, WebContentsPrintOptions } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: "Open Print Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Enforce strict CSP headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:; font-src 'self' data:; connect-src 'none';",
        ],
      },
    });
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Register IPC handlers
app.whenReady().then(() => {
  ipcMain.handle("ops:get-version", () => app.getVersion());

  ipcMain.handle("ops:get-printers", async () => {
    if (!mainWindow) return [];
    return await mainWindow.webContents.getPrintersAsync();
  });

  ipcMain.handle("ops:print-sheet", async (_event, options: any) => {
    if (!mainWindow) return { ok: false, error: "No active window" };

    const printOptions: WebContentsPrintOptions = {
      silent: options.silent ?? false,
      printBackground: true,
      deviceName: options.printerName || undefined,
      margins: { marginType: "none" },
      pageSize: options.pageSize,
      landscape: Boolean(options.landscape),
      scaleFactor: 100,
      copies: options.copies ?? 1,
    };

    return new Promise((resolve) => {
      mainWindow!.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          resolve({ ok: false, error: failureReason });
        } else {
          resolve({ ok: true });
        }
      });
    });
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
