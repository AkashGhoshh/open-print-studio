#!/usr/bin/env python3
"""
Generate synthetic identity document fixtures for automated unit testing.
100% SPECIMEN data only. No real personal information.
"""

from pathlib import Path
from PIL import Image, ImageDraw

def create_synthetic_a4_eaadhaar(output_path: Path):
    # A4 at 150 DPI for test fixture speed: 1240 x 1754 px (or 300 DPI: 2480 x 3508 px)
    # Using 300 DPI: 2480 x 3508
    w, h = 2480, 3508
    img = Image.new("RGB", (w, h), color="#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Top letterhead area (non-card)
    draw.rectangle([100, 100, w - 100, 300], fill="#F3F4F6")
    draw.text((150, 180), "SPECIMEN GOVERNMENT ENROLLMENT LETTER", fill="#1F2937")

    # Front card region: relX: 0.05, relY: 0.68, relW: 0.42, relH: 0.28
    fx = int(0.05 * w)
    fy = int(0.68 * h)
    fw = int(0.42 * w)
    fh = int(0.28 * h)
    draw.rectangle([fx, fy, fx + fw, fy + fh], fill="#FAFAFA", outline="#2563EB", width=4)
    draw.text((fx + 30, fy + 30), "SPECIMEN FRONT CARD", fill="#1E3A8A")
    draw.rectangle([fx + 40, fy + 80, fx + 250, fy + 350], fill="#CBD5E1") # photo
    draw.text((fx + 280, fy + 100), "Name: MOCK PERSON", fill="#111827")
    draw.text((fx + 280, fy + 160), "DOB: 01/01/1990", fill="#111827")
    draw.text((fx + 280, fy + 220), "Gender: MALE", fill="#111827")
    draw.text((fx + 280, fy + 300), "1234 5678 9012", fill="#1E3A8A")

    # Back card region: relX: 0.53, relY: 0.68, relW: 0.42, relH: 0.28
    bx = int(0.53 * w)
    by = int(0.68 * h)
    bw = int(0.42 * w)
    bh = int(0.28 * h)
    draw.rectangle([bx, by, bx + bw, by + bh], fill="#FAFAFA", outline="#2563EB", width=4)
    draw.text((bx + 30, by + 30), "SPECIMEN BACK CARD", fill="#1E3A8A")
    draw.text((bx + 40, by + 100), "Address: Flat 101, Dummy Road, New Delhi", fill="#111827")
    # QR Code placeholder
    draw.rectangle([bx + bw - 260, by + 100, bx + bw - 60, by + 300], fill="#000000")

    # Disclaimer at bottom: relX: 0.05, relY: 0.93, relW: 0.90, relH: 0.06
    dx = int(0.05 * w)
    dy = int(0.93 * h)
    dw = int(0.90 * w)
    dh = int(0.06 * h)
    draw.rectangle([dx, dy, dx + dw, dy + dh], fill="#FEF3C7", outline="#F59E0B", width=2)
    draw.text((dx + 30, dy + 20), "UIDAI Notice: Aadhaar is a proof of identity, not of citizenship. (SPECIMEN DISCLAIMER)", fill="#92400E")

    img.save(output_path, "PNG")
    print(f"Generated synthetic e-Aadhaar A4 fixture: {output_path}")

if __name__ == "__main__":
    out = Path("tests/fixtures/synthetic_eaadhaar_page.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    create_synthetic_a4_eaadhaar(out)
