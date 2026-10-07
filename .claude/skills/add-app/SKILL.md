---
name: add-app
description: Scaffold and register a new app (process) in the Windows desktop simulator — component, process directory entry, file-extension mapping, icon and Start Menu shortcut. Use when asked to add/create a new app, viewer, player, editor or dialog window.
---

# Add an app

An "app" is a process: a React component registered in the process directory and rendered inside a `Window` by `AppsLoader` → `RenderComponent`.

## 1. Component

Create `src/components/Apps/<Name>/<Name>.tsx` (+ `<Name>.scss` next to it). Follow the shape of existing apps (`PDF`, `Photos`, `VideoPlayer`):

```tsx
"use client";

import { ComponentProcessProps } from "../RenderComponent";
import { useProcesses } from "@/contexts/process";
import "./<Name>.scss";

type <Name>Props = {} & ComponentProcessProps;

const <Name> = ({ id }: <Name>Props) => {
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  // read the file with useFileSystem().readFile(url), set title with useTitle(id), etc.
  return <div className="<name>">...</div>;
};

export default <Name>;
```

- The component only receives `{ id }`. Everything else comes from contexts: `useProcesses().processes[id]` (url, args), `useFileSystem`, `useSession`, `useNotification`, `useMenu`.
- `src/components/Window/useTitle.ts` → `prependFileToTitle` to show the opened file in the titlebar.
- `src/components/Files/FileEntry/useFileDrop.ts` to accept files dropped onto the window.
- Animations use `motion/react`; styling is Tailwind + the component's `.scss`.

## 2. Register the process

In `src/contexts/process/directory.ts`:

1. If the name is not already in the `AllProcess` enum, add it (many enum members are placeholders without an implementation).
2. Import the component statically (dynamic imports were deliberately removed — keep the commented `dynamic(...)` style only if the surrounding entries still have it) and add an entry to `directory`:

```ts
<Name>: {
  Component: <Name>,
  defaultSize: { height: 450, width: 600 },
  icon: "/System/Icons/<name>.png",
  title: "<Display Name>",
  // optional: singleton, hideTitlebarIcon, allowResizing, dialogProcess,
  // hasWindow: false, libs / dependantLibs (preloaded scripts), autoSizing,
  // titlebar*/navigationbar*/backgroundColor/textColor theme colors
},
```

Available fields are the `Process` / `ProcessArguments` types in `src/contexts/process/types.ts`. If the app needs a new process argument, add it to the matching `*ProcessArguments` type there.

Process ids are `<Name>__<url>` (`PROCESS_DELIMITER = "__"`), so the same app opened on different files gets separate windows unless `singleton: true`.

## 3. File associations (if the app opens files)

In `src/components/Files/extensions.ts` add (or extend) an entry in `types` with `process: ["<Name>", ...]` and map extensions to it in `extensions`. Order in `process` is the preference order for "Open with". Image extensions are added via `EDITABLE_IMAGE_FILE_EXTENSIONS` in `src/lib/constants.ts`; video via `VIDEO_FILE_EXTENSIONS`.

## 4. Icon and shortcuts

- Put the icon in `public/System/Icons/` (png; follow the sizes used by existing icons there).
- Optional Start Menu / Desktop shortcut: a `.url` file under `public/Users/Public/Start Menu/` or `public/Users/Public/Desktop/`:

```ini
[InternetShortcut]
BaseURL=<Name>
URL=
IconFile=/System/Icons/<name>.png
```

(`BaseURL` is the process name; `URL` is an optional file path to open.)

## 5. Finish

- Anything added under `public/` requires regenerating the index — run the `sync-fs-index` skill (`npm run build:prebuild`).
- Run the `verify` skill.
