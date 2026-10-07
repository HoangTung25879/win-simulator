---
name: verify
description: Verify a change in this repo — TypeScript type-check, ESLint, and optionally a production build and an in-browser check. Use after editing code and before committing; this repo has no test suite, so this is the only automated check.
---

# Verify

There are no tests. Run these from the repo root, in order, and stop at the first failure to fix it:

```bash
npx tsc --noEmit        # type-check (strict mode, path aliases from tsconfig.json)
```

**Lint is currently broken:** `npm run lint` runs `next lint`, which was removed in Next 16, and `npx eslint src` fails because the repo still uses the legacy `.eslintrc.json` (ESLint 9 needs `eslint.config.mjs`). Don't report lint as passing; say it was skipped for this reason. Once the config is migrated to flat config, run `npx eslint src` here.

Known pre-existing `tsc` error (not caused by your change unless you touched it): `src/app/auth/page.tsx` imports `@/app/loading`, which doesn't exist. Only report *new* errors as regressions.

Then, for larger changes (new apps/contexts, config, dependency or webpack changes):

```bash
npm run build           # env/.env-production, webpack build
```

## Notes

- If `tsc` complains about missing `public/.index/*.json` or the file tree changed, run `npm run build:prebuild` first (see the `sync-fs-index` skill).
- Lint rules intentionally disabled (in `.eslintrc.json`): `react-hooks/exhaustive-deps`, `@next/next/no-img-element`, `react/display-name` — don't "fix" those.
- Formatting: `npx prettier --check <changed files>` (or `npm run prettier` to write; it formats the whole repo, so prefer passing the changed files).
- Optional dead-code check: `npm run find-deadcode`.
- Production builds strip `console.*` calls, so don't rely on logs there.

## In-browser check (UI changes)

Type-check and lint don't catch runtime/UI regressions. Start `npm run dev` (http://localhost:3002, uses `env/.env-dev`) and exercise the changed feature — open/close/drag/resize the window, right-click menus, open the related file types. State persists in IndexedDB; clear the site data if stale state interferes.

Report results honestly: list each command and whether it passed; quote errors that remain.
