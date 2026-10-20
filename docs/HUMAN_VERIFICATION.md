# Open Print Studio — Physical Human Verification Checklist
## Hardware Printer, PVC Tray & Caliper Verification Protocol

> [!IMPORTANT]
> Software unit tests and headless renders mathematically prove 100% scale coordinate placement, layout solvers, and double-flip reflection invariance. However, physical paper feed mechanical slippage, printer roller grip, tray tolerances, and ink bleeding can only be verified on physical hardware by a human operator.
> Do NOT claim physical hardware alignment as verified until the steps below are completed and signed off.

---

### Equipment Required for Verification
1. Metric Digital Vernier Caliper (0.01 mm resolution, e.g. Mitutoyo or equivalent).
2. Steel engineering ruler (300 mm).
3. Inkjet printer with photo-feed (e.g. Epson L805 / Canon G3010 or similar).
4. Paper stock:
   - ISO A4 210×297 mm 80 GSM paper (for calibration & ID card sheets).
   - 4×6 inch (101.6×152.4 mm) glossy photo paper.
   - Dual-card PVC Direct Printing Tray (e.g. Epson J-tray or Canon C-tray) with 2 blank CR-80 cards.

---

### Verification Test 1: Calibration Ruler Accuracy (100.0 mm Target)
1. Launch **Open Print Studio** and navigate to the **Calibration Wizard** tab (`Ctrl+5`).
2. Click **Print Test Pattern** (`Step 1`).
3. Ensure printer driver settings have page scaling set to **Actual Size / 100% Scale** (no "Fit to Page").
4. Measure the printed calibration sheet:
   - [ ] **Horizontal Target Line:** Measure from the left tick (0 mm) to the right tick (100 mm).  
     Measured $L_X$: `________.__ mm` (Acceptable range: $99.60 - 100.40$ mm).
   - [ ] **Vertical Target Line:** Measure from the top tick (0 mm) to the bottom tick (100 mm).  
     Measured $L_Y$: `________.__ mm` (Acceptable range: $99.60 - 100.40$ mm).
5. If measured length differs by $> 0.40$ mm, enter the values into `Step 2` in the Wizard. Verify that the software automatically computes the correction factor ($\text{scale} = 100.0 / L_{\text{measured}}$) and save the profile.

---

### Verification Test 2: Standard CR-80 Verification Target ($85.60 \times 53.98$ mm)
1. On the printed calibration sheet, locate the blue CR-80 outline box.
2. Using calipers, measure the dimensions:
   - [ ] **Width:** Target $85.60 \pm 0.40$ mm. Measured: `______.__ mm`.
   - [ ] **Height:** Target $53.98 \pm 0.30$ mm. Measured: `______.__ mm`.
   - [ ] **Corner Radius:** Check curvature against a physical debit/credit card.

---

### Verification Test 3: A4 5-Pair Multi-Card Sheet Alignment
1. Navigate to **ID Card (CR-80)** workspace (`Ctrl+1`).
2. Upload synthetic sample card PDF or select pre-loaded specimen.
3. Switch to **Print Sheet** and select **A4 (5-Pair / 10-Up)** layout.
4. Spool print job (`Ctrl+P`).
5. Verify on printed sheet:
   - [ ] Left margin: $17.40 \pm 0.50$ mm.
   - [ ] Right margin: $17.40 \pm 0.50$ mm.
   - [ ] Top margin: $8.55 \pm 0.50$ mm.
   - [ ] Column gap: $4.00 \pm 0.30$ mm.
   - [ ] Cut marks: Verify all 8 corner ticks align with guillotine cutting blade.

---

### Verification Test 4: 4×6 Photo Paper (1-Pair) Alignment
1. In Sheet Workspace, switch media preset to **4×6 Photo Paper (1-Pair / 2 Cards)**.
2. Load 4×6 glossy paper into rear tray.
3. Print sheet and verify:
   - [ ] Top card (Front): Centered horizontally with 8.00 mm side margins.
   - [ ] Bottom card (Back): Vertical gap between cards is exactly 4.00 mm.
   - [ ] Bottom margin: Symmetrical with top margin ($20.22 \pm 0.50$ mm).

---

### Verification Test 5: PVC Direct Tray Mechanical Alignment
1. Switch media preset to **PVC Direct Tray (2-Card Carrier)**.
2. Insert 2 blank PVC cards into the tray slot (Card 1: Front, Card 2: Back).
3. Feed the tray to the alignment arrows on the printer.
4. Execute print job.
5. Verify:
   - [ ] Artwork is aligned squarely onto the PVC cards without border clipping ($< 0.5$ mm edge variance).
   - [ ] In the event of tray lead-in offset, use the nudge controls (`offsetX`, `offsetY`) to calibrate and save to the printer profile.

---

### Operator Sign-Off
- **Tested By:** __________________________________
- **Printer Model:** _______________________________
- **Date Verified:** _______________________________
- **Overall Result:** [ ] PASS  /  [ ] FAIL
