# Shopkeeper Interaction Matrix, Keyboard Shortcuts & Accessibility

## 1. Operating Environment Context
Indian Cyber Cafes and CSCs are high-pressure, noisy retail environments.
Operators process dozens of customers in line, often multitasking across scans, passport photos, and government forms.
Interfaces designed for developers or graphic artists fail here. The UX must be **tactile, fast, unambiguous, and resilient to mistakes**.

## 2. Standardized Keyboard Shortcuts
| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Ctrl + O` | Open / Ingest Document or Image | Global |
| `Ctrl + P` | Instant Spool to Selected Printer Profile | Global |
| `Ctrl + Z` | Undo Last Edit (Crop / Nudge / Filter) | Canvas Workspace |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo Edit | Canvas Workspace |
| `F` | Toggle Mirror / Flip Mode | Canvas Workspace |
| `Arrow Keys` | Nudge Card by 0.1 mm | Selected Card |
| `Shift + Arrow Keys` | Nudge Card by 1.0 mm | Selected Card |
| `1`, `2`, `3`, `4` | Switch Tab (ID Card, Visiting, Membership, Photo) | Navigation |
| `Escape` | Close Modal / Cancel Crop Drag | Global |

## 3. Tactile Ergonomics & Visual Design Rules
- **Large Touch-Friendly Buttons:** Minimum button touch target: $44 \times 44$ px. Important actions ("Print Now", "Remove BG") have $52$ px height.
- **High-Contrast Dark & Light Themes:**
  - Dark Theme: Deep slate background (`#0F172A`), high-contrast text (`#F8FAFC`), vivid action blue (`#2563EB`).
  - Light Theme: Clean neutral background (`#F8FAFC`), crisp dark text (`#0F172A`).
- **Live Canvas Rulers:** Millimeter tick marks rendered directly along canvas borders for immediate visual size confirmation.
- **Plain-Language Actionable Errors:**
  - ❌ *"Exception 0x80040154 in spooler"*
  - ✅ *"Printer is not responding. Check power cable and press Retry."*
  - ❌ *"Password verification failed"*
  - ✅ *"Wrong PDF password. Try: FIRST 4 LETTERS OF NAME (CAPS) + BIRTH YEAR (e.g. RAMA1985)."*
