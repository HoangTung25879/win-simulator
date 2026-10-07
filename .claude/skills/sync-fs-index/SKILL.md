---
name: sync-fs-index
description: Regenerate the virtual file system / search / icon / shortcut indexes in public/.index after files under public/ are added, removed, renamed or edited. Use whenever public/ changes or when a file "doesn't show up" in the desktop, File Explorer or search.
---

# Sync the file-system index

`public/` is the read-only base layer of the virtual disk. The app does not list `public/` at runtime — it reads prebuilt JSON in `public/.index/` (committed to git):

| Output | Script | Consumer |
| --- | --- | --- |
| `fs.9p.json` | `scripts/fs2json.js` | `src/contexts/fileSystem/core.ts` (imported at build time; BrowserFS `HTTPRequest` index) |
| `search.lunr.json` | `scripts/searchIndex.js` (options in `scripts/searchExtensions.json`) | taskbar search |
| `shortcutCache.json` | `scripts/cacheShortcuts.js` | `.url` shortcut parsing |
| preload/icon data | `scripts/preloadIcons.js` | icon preloading |

## Steps

1. Run:
   ```bash
   npm run build:prebuild
   ```
2. Check the result:
   ```bash
   git status --short public/.index
   git diff --stat public/.index
   ```
   Confirm the changed paths appear (e.g. `grep -c "<filename>" public/.index/fs.9p.json`). Only `public/.index/*` should change besides the files you added.
3. Restart `npm run dev` if the running dev server doesn't pick up the new `fs.9p.json`.

## Gotchas

- Users' own changes live in the IndexedDB overlay (BrowserFS `OverlayFS`). If a file was deleted/renamed in the browser before, the overlay can hide the new base file — test in a fresh profile or clear the site's IndexedDB.
- `searchIndex.js` ignores `System`, `.index`, `desktop.ini` and some other paths (`IGNORE_PATHS` / `IGNORE_FILES`) — files there won't be searchable by design.
- Don't hand-edit files in `public/.index/`; always regenerate them. `npm run clean` deletes the folder.
