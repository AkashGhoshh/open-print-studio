#!/usr/bin/env python3
"""
Open Print Studio — Agent Skills Validator
Usage: python3 tools/validate_skills.py

Validates all skills in .agents/skills/ against Antigravity requirements:
1. Folder name matches frontmatter name (kebab-case)
2. Description starts with 'Use this skill when...' and is under 300 chars
3. Mandatory body sections present in exact order:
   - Goal
   - Use this skill when
   - Do NOT use when
   - Workflow
   - Rules and constraints
   - Verification checklist
   - References
4. Line count is under ~150 lines
5. Relative links point to existing files
6. No machine-specific absolute paths
7. No trigger collision between skills
"""

import os
import re
import sys
import yaml
from pathlib import Path

EXPECTED_SKILLS = [
    "print-geometry-layout",
    "electron-secure-printing",
    "id-document-pipeline",
    "pdfjs-worker-rendering",
    "offline-ai-segmentation",
    "privacy-local-data",
    "clean-room-audit",
    "testing-qa",
    "print-calibration-wizard",
    "shopkeeper-ux",
    "i18n-hindi",
    "release-packaging",
]

EXPECTED_SECTIONS = [
    "Goal",
    "Use this skill when",
    "Do NOT use when",
    "Workflow",
    "Rules and constraints",
    "Verification checklist",
    "References",
]

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = PROJECT_ROOT / ".agents" / "skills"

def parse_frontmatter(content):
    if not content.startswith("---"):
        return None, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, content
    try:
        data = yaml.safe_load(parts[1])
        return data, parts[2]
    except Exception as e:
        return None, f"YAML parse error: {e}"

def validate_skill(skill_name, skill_path):
    errors = []
    warnings = []
    
    skill_file = skill_path / "SKILL.md"
    if not skill_file.exists():
        errors.append(f"Missing SKILL.md in {skill_path}")
        return errors, warnings, None

    content = skill_file.read_text(encoding="utf-8")
    lines = content.splitlines()
    if len(lines) > 165:
        warnings.append(f"SKILL.md length is {len(lines)} lines (target <= 150 lines)")

    frontmatter, body = parse_frontmatter(content)
    if not frontmatter or not isinstance(frontmatter, dict):
        errors.append("Invalid or missing YAML frontmatter")
        return errors, warnings, None

    name = frontmatter.get("name")
    if name != skill_name:
        errors.append(f"Frontmatter name '{name}' does not match folder '{skill_name}'")

    desc = frontmatter.get("description", "")
    if not desc.startswith("Use this skill when"):
        errors.append("Description must start with 'Use this skill when...'")
    if len(desc) > 300:
        errors.append(f"Description length ({len(desc)} chars) exceeds 300 characters")

    # Check absolute paths
    abs_matches = re.findall(r"(/home/\w+|/tmp/|[A-Za-z]:\\)", content)
    if abs_matches:
        errors.append(f"Machine-specific absolute path detected: {set(abs_matches)}")

    # Check sections in exact order
    headings = re.findall(r"^##\s+(.+)$", body, re.MULTILINE)
    cleaned_headings = [h.strip() for h in headings]
    
    # Check for presence and order of EXPECTED_SECTIONS
    sec_idx = 0
    for h in cleaned_headings:
        if sec_idx < len(EXPECTED_SECTIONS) and h.lower() == EXPECTED_SECTIONS[sec_idx].lower():
            sec_idx += 1

    if sec_idx != len(EXPECTED_SECTIONS):
        missing = [s for s in EXPECTED_SECTIONS if s.lower() not in [h.lower() for h in cleaned_headings]]
        if missing:
            errors.append(f"Missing required sections: {missing}")
        else:
            errors.append(f"Sections out of order. Found: {cleaned_headings}, Expected: {EXPECTED_SECTIONS}")

    # Check Workflow has numbered steps
    wf_match = re.search(r"##\s+Workflow(.*?)(?=##|\Z)", body, re.DOTALL | re.IGNORECASE)
    if wf_match:
        wf_text = wf_match.group(1)
        if not re.search(r"^\s*1\.\s+", wf_text, re.MULTILINE):
            errors.append("Workflow section must contain numbered steps (e.g. '1. ...')")
    else:
        errors.append("Workflow section not found")

    # Check relative links exist
    link_matches = re.findall(r"\[([^\]]+)\]\(([^)]+)\)", body)
    for text, link in link_matches:
        if link.startswith("http://") or link.startswith("https://"):
            warnings.append(f"External link detected: {link}")
            continue
        if link.startswith("#"):
            continue
        # Clean query/hash
        clean_link = link.split("#")[0].split("?")[0]
        if not clean_link:
            continue
        target_path = (skill_path / clean_link).resolve()
        if not target_path.exists():
            errors.append(f"Broken relative link: '{link}' (resolved to {target_path})")

    return errors, warnings, desc

def check_overlaps(descriptions):
    overlaps = []
    skills = list(descriptions.keys())
    for i in range(len(skills)):
        for j in range(i + 1, len(skills)):
            s1, s2 = skills[i], skills[j]
            d1, d2 = set(re.findall(r"\b\w{4,}\b", descriptions[s1].lower())), set(re.findall(r"\b\w{4,}\b", descriptions[s2].lower()))
            common = d1.intersection(d2)
            # Remove very common words
            common = common - {"when", "this", "skill", "open", "print", "studio", "need", "with", "from"}
            if len(common) > 6:
                overlaps.append((s1, s2, common))
    return overlaps

def main():
    print("=" * 60)
    print("Open Print Studio — Agent Skills Validator")
    print("=" * 60)

    total_errors = 0
    descriptions = {}

    for skill_name in EXPECTED_SKILLS:
        skill_path = SKILLS_DIR / skill_name
        if not skill_path.exists():
            print(f"❌ [MISSING] Skill folder does not exist: {skill_name}")
            total_errors += 1
            continue

        errors, warnings, desc = validate_skill(skill_name, skill_path)
        if desc:
            descriptions[skill_name] = desc

        if errors:
            print(f"❌ [{skill_name}] Failed validation:")
            for e in errors:
                print(f"   - ERROR: {e}")
            total_errors += len(errors)
        else:
            print(f"✅ [{skill_name}] Passed validation")

        for w in warnings:
            print(f"   - WARNING: {w}")

    print("\n--- Trigger & Overlap Analysis ---")
    overlaps = check_overlaps(descriptions)
    if overlaps:
        for s1, s2, words in overlaps:
            print(f"⚠️  Potential overlap between '{s1}' and '{s2}': {words}")
    else:
        print("✅ No significant trigger overlap detected across skills.")

    print("=" * 60)
    if total_errors == 0:
        print(f"🎉 All {len(EXPECTED_SKILLS)} skills validated successfully!")
        sys.exit(0)
    else:
        print(f"💥 Validation failed with {total_errors} error(s).")
        sys.exit(1)

if __name__ == "__main__":
    main()
