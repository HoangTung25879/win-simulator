---
name: add-context
description: Add a new global state context (provider + hook) following the project's contextFactory pattern and wire it into the provider tree in src/app/page.tsx. Use when new shared/global desktop state is needed.
---

# Add a context

All global state lives in `src/contexts/<name>/` and is built with `src/contexts/contextFactory.tsx`, which returns a memoized `Provider` (value = the result of a `useXContextState` hook) and a `useContext` accessor.

## 1. State hook — `src/contexts/<name>/use<Name>ContextState.ts`

```ts
import { useCallback, useState } from "react";

export type <Name>ContextState = {
  value: string;
  setValue: (value: string) => void;
};

const use<Name>ContextState = (): <Name>ContextState => {
  const [value, setValueState] = useState("");
  const setValue = useCallback((newValue: string) => setValueState(newValue), []);

  return { value, setValue };
};

export default use<Name>ContextState;
```

- Use `.tsx` if the hook returns JSX. Put larger types in `types.ts` and pure state-update helpers in `functions.ts` (see `src/contexts/process/` — updaters are curried `(args) => (current) => next` functions passed to `setState`).
- Wrap returned functions in `useCallback`; the whole value object is the context value, so unstable functions re-render every consumer.
- The hook may consume contexts that are provided *above* it (e.g. `useFileSystem()` inside session state).

## 2. Context module — `src/contexts/<name>/index.ts`

```ts
import contextFactory from "../contextFactory";
import use<Name>ContextState from "./use<Name>ContextState";

const { Provider, useContext } = contextFactory(use<Name>ContextState);

export { Provider as <Name>Provider, useContext as use<Name> };
```

`contextFactory` also takes an optional second argument: a JSX element rendered inside the provider after its children (used for context-owned UI such as menus/notifications).

## 3. Wire it up — `src/app/page.tsx`

Current order (outer → inner):

```
QueryClientProvider → NotificationProvider → FullScreenProvider → ProcessProvider
  → FileSystemProvider → SessionProvider → MenuProvider → WallpaperProvider
    → Desktop / AppsLoader / (SearchInputProvider → Taskbar)
```

Insert the new provider **below every context its state hook uses** and **above every component that calls `use<Name>()`**. If only one subtree needs it, wrap just that subtree (like `SearchInputProvider` around `Taskbar`).

## 4. Finish

Run the `verify` skill.
