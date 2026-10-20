# Saved Printer Profiles & Hardware Tray Setup Guide

## 1. Operating System & Electron Print Reality
Chromium and Electron print APIs (`webContents.print()`) communicate with the OS print spooler (GDI/WINSPOOL on Windows, CUPS on Linux). 
Crucially: **Chromium does NOT expose proprietary hardware tray switching mechanisms** (such as Epson's CD/DVD motorized tray or Canon's special rear card slot).

Attempting to programmatically set tray flags like `DISC/ID CARD TRAY` via Chromium print options will either be silently ignored or fail.

## 2. The Solution: Saved Profiles + In-App Driver Guide
Open Print Studio solves this cleanly by pairing **Saved Printer Profiles** with a one-time visual driver setup guide:

1. **Profile Data Structure:**
   ```typescript
   export interface PrinterProfile {
     id: string; // e.g. "epson-l805-pvc"
     name: string; // "Epson L805 (PVC Tray)"
     systemPrinterName: string;
     pageSize: "A4" | "4x6" | { width: number; height: number };
     marginsType: 0; // 0 = none / zero margins
     orientation: "portrait" | "landscape";
     scaleFactor: 100;
     isFlipped: boolean;
     calibrationId?: string;
   }
   ```

2. **In-App Driver Configuration Steps (Epson L805 / L850 / Canon G-Series):**
   - **Step 1:** Open Windows Control Panel -> *Devices and Printers*.
   - **Step 2:** Right-click the printer -> select *Printing Preferences*.
   - **Step 3:** Change *Source / Paper Tray* to:
     - For PVC card tray: Select **CD/DVD** or **CD/DVD Tray**.
     - For 4×6 photo paper: Select **Rear Feed (Photo Paper Glossy)**, Borderless: ON.
   - **Step 4:** Click *Add/Remove Presets* -> Save preset as *"Open Print Studio - PVC Tray"*.
   - In our app, selecting the profile sets exact dimensions and offsets; the OS driver handles the physical tray routing.

## 3. Print Dialog vs Silent Spooling
- **Interactive Print (Default):** Prompts system print dialog (`silent: false`), allowing the operator to verify ink levels and physical paper feed.
- **Silent Print:** For high-throughput queues where the printer profile is calibrated and pre-selected.
- **Offline Detection:** Query `webContents.getPrintersAsync()`. If `status !== 0` or printer is unreachable, display a friendly modal: *"Printer [Name] is offline or out of paper. Check cable connection."*
