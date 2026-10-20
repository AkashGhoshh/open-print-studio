---
name: i18n-hindi
description: Use this skill when implementing English and Hindi bilingual UI, managing translation keys, formatting Devanagari typography and font fallbacks, handling text expansion rules, or checking for missing translation keys.
---

# Internationalization & Hindi Localization

## Goal
Deliver a first-class bilingual interface in English and Hindi (हिन्दी) from day one, ensuring cultural accuracy, zero hardcoded strings, and proper Devanagari typographic expansion.

## Use this skill when
- Adding or modifying user-facing text strings in React components.
- Maintaining `en.json` and `hi.json` translation dictionaries.
- Setting up or configuring the `i18next` localization engine.
- Applying Devanagari typography rules, line heights, and offline font fallbacks.
- Running the automated missing-key audit script to detect untranslated UI labels.

## Do NOT use when
- Designing UI button sizes or dark/light themes (use `shopkeeper-ux`).
- Validating physical millimeters on print sheets (use `print-geometry-layout`).
- Managing customer privacy settings (use `privacy-local-data`).

## Workflow
1. **Assign Hierarchical Keys**: Name keys using dot notation (`nav.*`, `action.*`, `label.*`, `error.*`).
2. **Add English & Hindi Pairs**: Always add the string to both `en.json` and `hi.json` simultaneously.
3. **Use Localized Hook**: In React components, use `const { t } = useTranslation()` instead of hardcoded strings.
4. **Account for Expansion**: Style containers with flexible widths and `line-height: 1.5` to prevent Devanagari clipping.
5. **Bundle Local Fonts**: Load Noto Sans Devanagari from `src/assets/fonts/` without CDN calls.
6. **Run Audit Script**: Execute `python3 scripts/check_missing_keys.py` to ensure 100% dictionary parity.

## Rules and constraints
- Zero hardcoded English strings in JSX or presentation components.
- Never use fixed pixel widths on buttons or labels containing translated text.
- Hindi translations must use natural, respectful retail shop terminology (e.g. "प्रिंट करें", "कार्ड क्रॉप करें").
- Fonts must be loaded 100% offline from local application bundles.

## Verification checklist
- [ ] `./scripts/check_missing_keys.py` reports 100% key parity with 0 missing keys.
- [ ] Switching between English and Hindi updates the UI instantly without page reload.
- [ ] No Devanagari glyphs or matras are vertically truncated or clipped.
- [ ] App operates offline without font network requests to Google Fonts.

## References
- [Devanagari Typography & Text Expansion Rules](./references/devanagari-typography-rules.md)
- [Missing Translation Keys Checker](./scripts/check_missing_keys.py)
