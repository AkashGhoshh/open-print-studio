#!/usr/bin/env python3
"""
Open Print Studio — Zero Telemetry & Network Call Auditor
Usage:
  python3 scripts/check_no_telemetry.py

Scans source code (src/, electron/, packages/) to verify that no unauthorized
network calls (fetch, XHR, WebSocket, analytics, tracking) exist in the codebase.
"""

import os
import re
import sys
from pathlib import Path

BANNED_PATTERNS = [
    (r"\bfetch\s*\(", "Raw fetch() call detected"),
    (r"\bXMLHttpRequest\b", "XMLHttpRequest detected"),
    (r"\bWebSocket\b", "WebSocket detected"),
    (r"\bgoogle-analytics\b", "Google Analytics identifier detected"),
    (r"\bmixpanel\b", "Mixpanel identifier detected"),
    (r"\bsentry\b", "Sentry telemetry detected"),
    (r"\bposthog\b", "PostHog analytics detected"),
]

ALLOWED_EXCLUSIONS = [
    "check_no_telemetry.py",
    "banned-terms.txt",
    "node_modules",
    ".git",
    "dist",
]

def scan_file(file_path: Path):
    violations = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return violations

    for pattern, desc in BANNED_PATTERNS:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for m in matches:
            line_no = content.count("\n", 0, m.start()) + 1
            violations.append((file_path, line_no, desc, m.group(0)))
    return violations

def main():
    root_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    print("=" * 60)
    print("Zero-Telemetry & Network Call Audit")
    print(f"Scanning target: {root_dir}")
    print("=" * 60)

    all_violations = []
    for root, dirs, files in os.walk(root_dir):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in ALLOWED_EXCLUSIONS]
        for f in files:
            if any(ex in f for ex in ALLOWED_EXCLUSIONS):
                continue
            if not f.endswith((".ts", ".tsx", ".js", ".jsx", ".html")):
                continue

            f_path = Path(root) / f
            violations = scan_file(f_path)
            all_violations.extend(violations)

    if all_violations:
        print(f"❌ FAILED: Detected {len(all_violations)} telemetry / network violation(s):")
        for f_path, line_no, desc, text in all_violations:
            print(f"   - {f_path.relative_to(root_dir)}:L{line_no} [{desc}] -> '{text}'")
        sys.exit(1)
    else:
        print("✅ PASSED: Zero unauthorized network calls or telemetry detected.")
        sys.exit(0)

if __name__ == "__main__":
    main()
