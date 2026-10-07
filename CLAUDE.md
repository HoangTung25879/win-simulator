# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

WinSimulator: a Next.js (App Router, React 19, TypeScript) web app that replicates the Windows desktop in the browser — a virtual file system, draggable/resizable windows, taskbar, start menu, search, animated wallpapers and built-in apps (File Explorer, Photos, PDF, Video Player, Settings).

## Commands

```bash
npm install
npm run build:prebuild   # regenerate public/.index/* (search index, icon preload, shortcut cache, fs.9p.json)
npm run dev              # dev server on http://localhost:3002 (uses env/.env-dev, webpack)
npm run build            # production build (uses env/.env-production, webpack)
npm run build:analyze    # bundle analyzer build (env/.env-analyze, ANALYZE=true)
npx tsc --noEmit         # type-check
npm run prettier         # format everything (tailwind/classnames plugins)
npm run find-deadcode    # ts-prune
```

There is no test suite. Linting is currently broken: `npm run lint` uses `next lint` (removed in Next 16) and `.eslintrc.json` is the legacy format that ESLint 9 rejects. Full verification steps are in the `verify` skill.

Env files live in `env/` and are loaded via `env-cmd` (`NEXT_PUBLIC_ENV`, `ANALYZE`, `NEXT_PUBLIC_API_URL`). Both dev and build pass `--webpack` explicitly — the webpack config in `next.config.mjs` (asset rules for `.mp3`/`.ttf`, `new Worker(new URL(...))` workers) depends on it.

## Generated file-system index

`public/` is the read-only base of the virtual disk (`public/System`, `public/Users`, `public/session.json`). The scripts in `scripts/` build JSON indexes into `public/.index/` (committed to git):

- `fs2json.js` → `fs.9p.json`: the directory listing of `public/`, imported directly by `src/contexts/fileSystem/core.ts`
- `searchIndex.js` → `search.lunr.json` (Lunr search; options in `searchExtensions.json`)
- `preloadIcons.js`, `cacheShortcuts.js` → icon/shortcut caches

**Any time files are added, removed or renamed under `public/`, rerun `npm run build:prebuild`**, otherwise the virtual file system and search won't see them.

## Architecture

The whole desktop is a single client page: `src/app/page.tsx` nests the context providers (Notification → FullScreen → Process → FileSystem → Session → Menu → Wallpaper) around `Desktop`, `AppsLoader` and `Taskbar`. Provider order matters: later contexts consume earlier ones (e.g. Session reads/writes through FileSystem).

**Contexts (`src/contexts/`)** are the state layer. Each is built with `contextFactory(useXContextState)` which returns a `Provider` and a `useContext` hook; the state logic lives in `useXContextState.ts` and the module's `index.ts` exports `XProvider` and `useX` (e.g. `useProcesses`, `useFileSystem`, `useSession`).

- **fileSystem**: BrowserFS `MountableFileSystem` with an `OverlayFS` at `/` — readable layer is `HTTPRequest` backed by `fs.9p.json` (serving files from `public/`), writable layer is `IndexedDB` (falls back to `InMemory`). User changes are persisted to IndexedDB on top of the static `public/` tree. `useAsyncFs.ts` wraps the BrowserFS callbacks in promises.
- **process**: the "running apps" registry. `directory.ts` defines every app (`AllProcess` enum + a `directory` map with `Component`, default size, icon, title, titlebar colors, `singleton`, `dialogProcess`, `hasWindow`, `libs`). Only some enum entries have implementations. Process IDs are `${processName}__${url}` (with `__N` suffix for extra instances; `PROCESS_DELIMITER = "__"`). State updates are pure reducer-style functions in `functions.ts` passed to `setProcesses`.
- **session**: window positions/sizes, stack order/foreground, icon positions, sort orders, wallpaper, recent files, run history. Loaded from and saved to `/session.json` in the virtual FS (default from `public/session.json`).
- **menu**, **notification**, **fullScreen**, **search**, **wallpaper**: context menus, toasts, fullscreen API, search input state, wallpaper rendering.

**Rendering apps**: `AppsLoader` maps over `processes` and renders each through `RenderComponent`, which wraps the app component in `Window` (react-rnd based, in `src/components/Window/`) unless `hasWindow` is false. App components receive only `{ id }` (`ComponentProcessProps`) and pull everything else from contexts (`useProcesses().processes[id]`, `useSession`, `useFileSystem`).

**Adding an app**: create the component under `src/components/Apps/<Name>/`, register it in `src/contexts/process/directory.ts`, and map file extensions to it in `src/components/Files/extensions.ts` (extension → type → list of process names; the first available one opens the file).

**Files**: `src/components/Files/FileManager` renders a folder (used by both Desktop and File Explorer); `FileEntry/` holds the per-entry hooks (`useFolder`, `useFile`, context menus, drag/drop, keyboard shortcuts, sorting, focus/selection).

**Wallpapers**: `src/components/Wallpaper/` — each wallpaper type (`ambient`, `animation`, `synthwave`, `vanta`) is lazily imported via `WALLPAPER_PATHS` and rendered in a Web Worker on an `OffscreenCanvas` (`wallpaper.worker.ts`, workers created in `constants.ts`, consumed with `src/hooks/useWorker.ts`).

## Conventions

- Path aliases (tsconfig): `@/*` → `src/*`, plus `@components/*`, `@contexts/*`, `@hooks/*`, `@lib/*`, `@styles/*`, `@app/*`, `@scripts/*`.
- Styling is a mix of Tailwind and per-component `.scss` files next to the component (global styles in `src/styles/`).
- Animations use the `motion` package (`motion/react`), not `framer-motion`.
- Components/hooks are client-side (`"use client"`); browser-only APIs (BrowserFS, IndexedDB, workers) are used freely.
- ESLint has `react-hooks/exhaustive-deps` disabled; production builds strip `console.*` calls.
- UI must look like Windows 11 (Segoe UI, existing color tokens, acrylic shell surfaces). The full rules are in `.claude/skills/frontend-design/SKILL.md`.
