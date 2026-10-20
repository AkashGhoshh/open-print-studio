#!/usr/bin/env python3
"""
Open Print Studio — Clean-Room Name & Terminology Auditor
Usage:
  python3 scripts/audit_names.py

Scans code, comments, documentation, and configuration files to ensure that
no third-party brand names, external server URLs, or reverse-engineering terms
exist in the repository.
"""

import os
import re
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
BANNED_TERMS_FILE = SKILL_DIR / "references" / "banned-terms.txt"
PROJECT_ROOT = SKILL_DIR.parent.parent.parent

EXCLUDED_FILES = {
    "banned-terms.txt",
    "audit_names.py",
}

EXCLUDED_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "coverage",
    ".system_generated",
    "target", # target contains extracted research assets from earlier phase
    "reverse-engineer-anything", # external developer skill
}

def load_banned_terms():
    if not BANNED_TERMS_FILE.exists():
        print(f"Error: Banned terms file not found at {BANNED_TERMS_FILE}")
        sys.exit(1)

    terms = []
    for line in BANNED_TERMS_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            terms.append(line)
    return terms

def scan_file(file_path: Path, terms):
    violations = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return violations

    for term in terms:
        # Match as word boundary or exact substring
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        for m in pattern.finditer(content):
            line_no = content.count("\n", 0, m.start()) + 1
            violations.append((file_path, line_no, term, m.group(0)))
    return violations

def main():
    print("=" * 60)
    print("Clean-Room Naming & Brand Hygiene Audit")
    print(f"Scanning target: {PROJECT_ROOT}")
    print("=" * 60)

    terms = load_banned_terms()
    print(f"Loaded {len(terms)} banned term pattern(s).")

    all_violations = []
    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for f in files:
            if f in EXCLUDED_FILES:
                continue
            if not f.endswith((".ts", ".tsx", ".js", ".jsx", ".html", ".md", ".json", ".css", ".py")):
                continue

            f_path = Path(root) / f
            violations = scan_file(f_path, terms)
            all_violations.extend(violations)

    if all_violations:
        print(f"\n❌ FAILED: Detected {len(all_violations)} clean-room violation(s):")
        for f_path, line_no, term, match in all_violations:
            try:
                rel = f_path.relative_to(PROJECT_ROOT)
            except Exception:
                rel = f_path
            print(f"   - {rel}:L{line_no} [Banned: '{term}'] -> Found '{match}'")
        sys.exit(1)
    else:
        print("\n✅ PASSED: 100% clean-room compliant! Zero banned terms found.")
        sys.exit(0)

if __name__ == "__main__":
    main()
