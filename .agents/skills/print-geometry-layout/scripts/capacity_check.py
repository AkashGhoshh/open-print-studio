#!/usr/bin/env python3
"""
Open Print Studio — Sheet Capacity & Layout Solver CLI
Usage:
  python3 scripts/capacity_check.py --paper 210x297 --item 85.6x53.98 --gap 4x2.5 --margin 10x10
  python3 scripts/capacity_check.py --paper 101.6x152.4 --item 85.6x53.98 --gap 0x4
  python3 scripts/capacity_check.py --preset a4-id-cr80
  python3 scripts/capacity_check.py --preset 4x6-id-cr80
  python3 scripts/capacity_check.py --preset 4x6-passport-35x45
"""

import argparse
import sys
import math

PRESETS = {
    "a4-id-cr80": {
        "paper": (210.0, 297.0),
        "item": (85.60, 53.98),
        "gap": (4.0, 2.5),
        "margin": (10.0, 8.5),
        "desc": "A4 Paper with CR-80 ID Cards (Expected: 10 cards = 5 pairs)"
    },
    "4x6-id-cr80": {
        "paper": (101.6, 152.4),
        "item": (85.60, 53.98),
        "gap": (0.0, 4.0),
        "margin": (8.0, 10.0),
        "desc": "4x6 Photo Paper with CR-80 ID Cards (Expected: 2 cards = 1 pair)"
    },
    "4x6-passport-35x45": {
        "paper": (101.6, 152.4),
        "item": (35.0, 45.0),
        "gap": (2.0, 2.0),
        "margin": (4.0, 3.0),
        "desc": "4x6 Photo Paper with 35x45mm Passport Photos (Expected: 8 rotated)"
    },
    "a4-visiting-card": {
        "paper": (210.0, 297.0),
        "item": (85.0, 55.0),
        "gap": (3.0, 3.0),
        "margin": (15.0, 10.0),
        "desc": "A4 Paper with Standard Visiting Cards (Expected: 10 cards)"
    }
}

def solve_grid(paper_w, paper_h, item_w, item_h, gap_x, gap_y, margin_x, margin_y):
    avail_w = paper_w - 2 * margin_x
    avail_h = paper_h - 2 * margin_y
    if avail_w <= 0 or avail_h <= 0 or item_w <= 0 or item_h <= 0:
        return 0, 0, 0, 0.0, 0.0

    cols = max(0, int((avail_w + gap_x) // (item_w + gap_x)))
    rows = max(0, int((avail_h + gap_y) // (item_h + gap_y)))
    count = cols * rows

    used_w = cols * item_w + max(0, cols - 1) * gap_x
    used_h = rows * item_h + max(0, rows - 1) * gap_y
    rem_w = paper_w - used_w
    rem_h = paper_h - used_h
    return cols, rows, count, rem_w, rem_h

def evaluate_layout(paper_w, paper_h, item_w, item_h, gap_x, gap_y, margin_x, margin_y):
    # Try normal orientation
    c_norm, r_norm, count_norm, rw_norm, rh_norm = solve_grid(
        paper_w, paper_h, item_w, item_h, gap_x, gap_y, margin_x, margin_y
    )
    # Try rotated item
    c_rot, r_rot, count_rot, rw_rot, rh_rot = solve_grid(
        paper_w, paper_h, item_h, item_w, gap_x, gap_y, margin_x, margin_y
    )

    return {
        "normal": {"cols": c_norm, "rows": r_norm, "count": count_norm, "rem_w": rw_norm, "rem_h": rh_norm},
        "rotated": {"cols": c_rot, "rows": r_rot, "count": count_rot, "rem_w": rw_rot, "rem_h": rh_rot},
    }

def main():
    parser = argparse.ArgumentParser(description="Calculate sheet capacity for print layouts.")
    parser.add_argument("--preset", choices=list(PRESETS.keys()), help="Run standard preset")
    parser.add_argument("--paper", help="Paper WxH in mm, e.g. 210x297")
    parser.add_argument("--item", help="Item WxH in mm, e.g. 85.6x53.98")
    parser.add_argument("--gap", default="2x2", help="Gap XxY in mm, e.g. 4x2.5")
    parser.add_argument("--margin", default="5x5", help="Margin XxY in mm, e.g. 10x10")

    args = parser.parse_args()

    if args.preset:
        cfg = PRESETS[args.preset]
        pw, ph = cfg["paper"]
        iw, ih = cfg["item"]
        gx, gy = cfg["gap"]
        mx, my = cfg["margin"]
        print(f"Preset: {args.preset} — {cfg['desc']}")
    elif args.paper and args.item:
        pw, ph = map(float, args.paper.split("x"))
        iw, ih = map(float, args.item.split("x"))
        gx, gy = map(float, args.gap.split("x"))
        mx, my = map(float, args.margin.split("x"))
    else:
        parser.print_help()
        sys.exit(1)

    res = evaluate_layout(pw, ph, iw, ih, gx, gy, mx, my)
    print(f"Paper: {pw:.1f} x {ph:.1f} mm | Item: {iw:.2f} x {ih:.2f} mm | Gap: {gx:.1f} x {gy:.1f} mm | Margins: {mx:.1f} x {my:.1f} mm")
    print(f"Normal  (Unrotated): {res['normal']['cols']} cols x {res['normal']['rows']} rows = {res['normal']['count']} items (Rem W: {res['normal']['rem_w']:.1f}mm, H: {res['normal']['rem_h']:.1f}mm)")
    print(f"Rotated (90 deg):    {res['rotated']['cols']} cols x {res['rotated']['rows']} rows = {res['rotated']['count']} items (Rem W: {res['rotated']['rem_w']:.1f}mm, H: {res['rotated']['rem_h']:.1f}mm)")

    best = "rotated" if res["rotated"]["count"] > res["normal"]["count"] else "normal"
    print(f"Optimal Choice: {best.upper()} -> Capacity: {res[best]['count']} units")

if __name__ == "__main__":
    main()
