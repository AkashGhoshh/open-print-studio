# Storage Schema, Segregation & DPDP Privacy Architecture

## 1. Storage Segregation Principle
In shared Cyber Cafe environments, operators process confidential government cards daily. Storing personal customer data indefinitely or in unencrypted synchronous browser storage causes serious stability and privacy issues.

Open Print Studio enforces strict data segregation:

```
[Browser Environment]
 ├── localStorage ("ops_prefs")
 │    ├── Theme ("dark" | "light")
 │    ├── Locale ("en" | "hi")
 │    ├── Active Tab ("id-card" | "photo-studio")
 │    ├── Privacy Mode Enabled (boolean)
 │    └── Auto-Expiry Window (hours, default: 24)
 │
 └── IndexedDB ("ops_db", version: 1)
      ├── Store "recent_designs" (Key: id)
      │    ├── id (UUID)
      │    ├── timestamp (epoch ms)
      │    ├── presetName ("Aadhaar Card", etc.)
      │    ├── cropData (front & back coords)
      │    ├── customerMobile (string | optional)
      │    └── thumbnailBlob (binary ImageBlob)
      │
      └── Store "printer_profiles" (Key: id)
           ├── id (string)
           ├── name (string)
           └── offsets (X, Y, scale, gaps)
```

## 2. Customer Privacy Controls
1. **"Don't Save History" (Privacy Mode):**
   - When toggled ON, the app operates strictly in volatile memory.
   - When a session ends or new file is loaded, all card buffers and mobile numbers are garbage-collected.
   - Zero writes to IndexedDB `recent_designs`.
2. **Auto-Expiry Engine:**
   - On application startup and once every hour, the background manager queries IndexedDB:
     ```typescript
     const cutoff = Date.now() - (prefs.autoExpiryHours * 3600 * 1000);
     await db.recent_designs.where("timestamp").below(cutoff).delete();
     ```
3. **One-Click "Clear All History":**
   - An immediate red action button in the Recents drawer.
   - Completely truncates the `recent_designs` object store and cleans all cached blobs.
