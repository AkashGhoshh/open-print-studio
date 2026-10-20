# Devanagari Typography, Text Expansion & Key Naming Standards

## 1. Key Naming Standards
Translation keys are namespaced hierarchically using lowercase dot notation:
- `nav.*`: Navigation tabs (e.g. `nav.id_card`, `nav.photo_studio`, `nav.visiting_card`).
- `action.*`: Buttons and actions (e.g. `action.print_now`, `action.remove_bg`, `action.undo`).
- `label.*`: Form labels, slider titles (e.g. `label.text_boldness`, `label.customer_mobile`).
- `error.*`: User-facing errors (e.g. `error.wrong_password`, `error.low_resolution`).
- `hint.*`: Helpful operational tips (e.g. `hint.aadhaar_password_format`).

## 2. Devanagari Text Expansion (Hindi vs English)
- **Visual Length Expansion:** Hindi text translated from English often expands in character count and horizontal width by **20% to 35%**.
- **Rule:** Never use fixed pixel widths on buttons or labels containing translated text.
  - ❌ `width: 120px; overflow: hidden;`
  - ✅ `min-width: 120px; width: fit-content; padding: 0 16px;`
- **Line-Height & Vertical Rhythm:** Devanagari glyphs with matras (मात्राएं) like `ी`, `ू`, `ै`, `ं`, `्` require slightly increased line height:
  - Minimum `line-height: 1.5` for Devanagari text (compared to 1.3 for English).

## 3. Bundled Offline Fonts
To ensure consistent rendering across all Windows and Linux operating systems without relying on Google Web Fonts CDN:
- English Font: Inter / System Sans-Serif (`system-ui, -apple-system, sans-serif`).
- Hindi / Devanagari Font: Noto Sans Devanagari (bundled locally in `src/assets/fonts/`).
- Fallback Stack: `"Noto Sans Devanagari", "Mangal", "Nirmala UI", sans-serif`.
