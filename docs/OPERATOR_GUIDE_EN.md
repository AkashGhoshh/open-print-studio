# Open Print Studio — Operator Guide (English)

Welcome to **Open Print Studio** (`OPS`), the offline-first desktop printing workstation built for Indian retail cyber cafes, Common Service Centers (CSCs), and photo studios.

---

## 1. Quick Start & Daily Workflow

### 1.1 Printing Identity Cards (Aadhaar, Voter ID, PAN, Ayushman)
1. **Import Document:**
   - Click **Import Document** or press `Ctrl + O`.
   - Select the downloaded password-protected PDF or high-resolution scanned image.
2. **Password Decryption:**
   - If the PDF is password-protected (e.g. e-Aadhaar requiring first 4 letters of name in CAPITAL + 4-digit birth year), enter the password in the decryption modal.
   - Decryption takes place 100% in-memory in a background Web Worker; your files never touch the internet or disk unencrypted.
3. **Card Crop & Normalization:**
   - The document is automatically cropped to standard CR-80 card dimensions ($85.6 \times 53.98$ mm).
   - If needed, adjust the bounding box handles or toggle between "Front" and "Back" tabs.
4. **Faint-Text Darkening & Disclaimer Cleaning:**
   - Use the **Darken Text** slider ($0$ to $5$) to boost faded text contrast on older thermal prints while preserving clean white paper.
   - If desired, enable **Clean Disclaimer** to whiten government footer disclaimers without affecting photo, QR code, or demographic data.
5. **Print Spooling:**
   - Choose your target sheet: **A4 (5-Pair / 10 Cards)**, **4×6 Photo Paper (1 Pair / 2 Cards)**, or **PVC Direct Tray**.
   - Check printer settings: ensure paper scale is set to **100% (Actual Size)** with zero margins.
   - Press `Ctrl + P` to print.

---

## 2. Multi-Card Batch Printing
When handling rush-hour crowds or bulk card distribution:
1. Process individual cards and click **Add to Batch** (`src/components/batch/`).
2. Open the **Batch Queue** (`Queue` button in the header).
3. The queue holds up to 50 cards and automatically paginates them:
   - Example: 12 cards will automatically span 3 A4 sheets (5 pairs, 5 pairs, 2 pairs).
4. Reorder cards by dragging or using the up/down arrows.
5. Click **Print All Sheets** to spool the entire queue to the printer in sequence.
6. If the application is accidentally closed, your queue is automatically recovered upon restart.

---

## 3. AI Passport Photo Studio
1. Press `Ctrl + 4` to open the **AI Photo Studio**.
2. Click **Upload Portrait** and choose a high-resolution selfie or studio photo.
3. Click **AI Background Removal**:
   - The bundled neural segmentation model will isolate the subject in under 0.5 seconds completely offline.
   - Soft 1.5px Gaussian edge feathering ensures smooth hair boundaries without halos.
4. Select a background preset:
   - **Studio Blue** (`#2B6CB0`) for Indian passport standards.
   - **Pure White** (`#FFFFFF`) for Visa / OCI standards.
   - **Light Grey** (`#F1F5F9`) for official badges.
5. Fine-tune image tonal adjustments:
   - Adjust Brightness, Contrast, and Saturation sliders as needed.
6. Select your layout preset:
   - **8-Up on 4×6 Photo Paper:** Generates 8 standard $35 \times 45$ mm photos rotated 90° for optimal yield.
   - **12-Up Stamp Size on 4×6:** Generates 12 $25 \times 30$ mm stamp-size photos.
   - **32-Up on A4:** High-volume passport sheet with vector cutting ticks.
7. Click **Print Sheet** or **Export Vector PDF**.

---

## 4. Hardware Calibration
If your printer has physical feed offsets or scale distortion:
1. Press `Ctrl + 5` to launch the **Calibration Wizard**.
2. Print the 100 mm reference ruler test sheet on your target paper.
3. Measure the printed ruler with a digital caliper or millimeter ruler.
4. Enter the measured values for X and Y length and tray offsets.
5. Click **Save Calibrated Profile**. The software will automatically apply these corrections to all future print jobs.

---

## 5. Privacy & Data Security
- **100% Offline:** The software has zero internet access and sends zero analytics or telemetry.
- **Privacy Mode:** Toggle the **Privacy Mode** switch in the top header. When active, card images and customer mobile numbers are never saved to local IndexedDB session history.
- **Auto-Expiry:** All stored recent designs automatically expire and are purged from disk after 24 hours.
