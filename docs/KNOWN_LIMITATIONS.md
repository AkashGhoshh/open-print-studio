# Open Print Studio — Known Limitations & Operational Constraints

**Document Purpose:** Transparently documents physical, hardware, and operational boundaries of Open Print Studio (`OPS`) to prevent operator error and guide physical setup.

---

## 1. Physical Hardware & Printer Driver Constraints

### 1.1 Programmatic Tray Switching (ADR-006)
- Standard operating system print spoolers (Windows GDI/WFP, CUPS on Linux) do not provide a standardized API to programmatically command consumer inkjet printers (e.g. Epson L805, Canon G-series) to switch physical feeder mechanisms from the rear paper tray to the CD/DVD/PVC card tray.
- **Operator Requirement:** The operator must manually load the physical PVC tray into the printer and select the appropriate tray in the OS print dialog. Open Print Studio provides precise slot coordinate alignment and visual guidelines.

### 1.2 Physical Paper Feed Variances & Caliper Calibration
- Entry-level photo paper feeds can have mechanical roller tolerances between $\pm 0.5$ mm and $\pm 1.5$ mm depending on roller wear, paper humidity, and paper weight.
- **Operator Requirement:** Operators printing on pre-cut PVC card sheets or PVC trays must run the in-app **Calibration Wizard** (`Ctrl + 5`) and measure test prints using a physical vernier caliper or millimeter ruler as detailed in [`docs/HUMAN_VERIFICATION.md`](./HUMAN_VERIFICATION.md).

---

## 2. Document & Image Resolution Constraints

### 2.1 Low-Resolution Input Guard
- The ID card crop normalizer and AI passport studio are optimized for 300 DPI native resolution ($1011 \times 638$ pixels for CR-80; $\ge 600 \times 600$ pixels for passport portraits).
- Uploading low-resolution mobile photographs ($< 600$ px) or heavily compressed WhatsApp scans may cause warning badges to appear in the UI and result in soft print output.

### 2.2 Disclaimer Cleaner Safety Limits (ADR-009)
- The opt-in disclaimer cleaner is mathematically constrained to the lower footer region ($Y \ge 0.92$, $[0.10, 0.90] \times [0.93, 0.98]$).
- Any attempt to position the disclaimer cleanup region over identity photo, QR code, or demographic text areas is rejected by the engine with a safety violation error.

---

## 3. Offline Environment & Zero-Network Constraints

### 3.1 100% Offline by Design
- The application enforces a strict Content Security Policy (`connect-src 'none'`) and has no network capabilities.
- Features requiring internet access (e.g. cloud document sync, remote printer discovery, automatic web updates) are deliberately prohibited to ensure complete privacy and zero telemetry for Indian citizen identity documents.

### 3.2 Model Asset Bundling
- The MediaPipe Selfie Segmenter neural model (`selfie_segmenter.tflite`, ~250 KB) and WebAssembly runtimes are packaged directly inside the application bundle (`public/models/`, `public/wasm/`). Updating the neural model requires installing a new software release.

---

## 4. Platform-Specific Scanner Protocols (ADR-005)
- **Windows:** Hardware scanning connects via Windows Image Acquisition (`WIA`).
- **Linux:** Hardware scanning connects via Scanner Access Now Easy (`SANE`).
- In environments without physical scanner hardware attached, the built-in `Virtual Scanner` provides high-resolution 300 DPI synthetic test documents for testing and calibration.
