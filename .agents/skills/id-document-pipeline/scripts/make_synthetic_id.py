#!/usr/bin/env python3
"""
Open Print Studio — Synthetic Identity Document Generator
Usage:
  python3 scripts/make_synthetic_id.py --output dummy-id.png --type cr80
  python3 scripts/make_synthetic_id.py --output dummy-aadhaar-page.png --type a4-page

Generates synthetic, fictional ID documents for testing and UI demonstrations.
CONSTRAINTS: NEVER USES REAL PERSONAL DATA. All documents are watermarked SPECIMEN.
"""

import argparse
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def create_synthetic_cr80(output_path: Path):
    # CR-80 at 300 DPI: 1011 x 638 px
    w, h = 1011, 638
    img = Image.new("RGB", (w, h), color="#FAFAFA")
    draw = ImageDraw.Draw(img)

    # Header bar
    draw.rectangle([0, 0, w, 80], fill="#1E3A8A")
    draw.text((30, 25), "SPECIMEN GOVERNMENT CARD", fill="#FFFFFF")

    # Photo placeholder
    photo_box = [60, 120, 320, 440]
    draw.rectangle(photo_box, fill="#E2E8F0", outline="#94A3B8", width=3)
    draw.rectangle([130, 180, 250, 300], fill="#CBD5E1") # face silhouette
    draw.ellipse([110, 320, 270, 430], fill="#CBD5E1") # body silhouette
    draw.text((120, 400), "DUMMY PHOTO", fill="#64748B")

    # Demographic data
    draw.text((360, 140), "Name: RAMESH KUMAR", fill="#0F172A")
    draw.text((360, 200), "DOB: 01/01/1990", fill="#0F172A")
    draw.text((360, 260), "Gender: MALE", fill="#0F172A")
    draw.text((360, 340), "ID No: XXXX-XXXX-9999", fill="#1E3A8A")

    # QR Code placeholder
    qr_box = [740, 140, 940, 340]
    draw.rectangle(qr_box, fill="#FFFFFF", outline="#000000", width=2)
    for x in range(760, 920, 20):
        for y in range(160, 320, 20):
            if (x + y) % 40 == 0:
                draw.rectangle([x, y, x + 15, y + 15], fill="#000000")

    # Watermark
    draw.text((350, 440), "SPECIMEN — DUMMY TEST DATA ONLY", fill="#DC2626")

    # Bottom disclaimer text (for testing disclaimer cleaner)
    draw.rectangle([40, 580, 970, 620], fill="#F1F5F9")
    draw.text((60, 590), "UIDAI Notice: This card is valid proof of identity, not of citizenship. (DISCLAIMER TEXT)", fill="#64748B")

    img.save(output_path, "PNG")
    print(f"✅ Generated synthetic CR-80 card: {output_path} ({w}x{h} px)")

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic ID document fixtures.")
    parser.add_argument("--output", default="synthetic_card.png", help="Output file path")
    parser.add_argument("--type", choices=["cr80"], default="cr80", help="Document type")
    args = parser.parse_args()

    out_p = Path(args.output).resolve()
    create_synthetic_cr80(out_p)

if __name__ == "__main__":
    main()
