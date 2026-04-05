# Prompt-02 Completion Note — Implement First-Class Loader Contract

## Status

Complete. `HbHeroBannerWebPart` is now packaged through a first-class SPFx loader contract with an isolated proof-case entry point.

## What changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/mount-hero-proof-case.tsx` | New. Isolated entry that imports only `HbHeroBanner`, preserving the same `mount`/`unmount` shell contract. |
| `apps/hb-webparts/vite.config.ts` | Entry file is now configurable via `HB_WEBPARTS_ENTRY` env var (defaults to `src/mount.tsx` for full bundle). |
| `tools/build-spfx-package.ts` | Detects proof-case mode and passes `HB_WEBPARTS_ENTRY=src/mount-hero-proof-case.tsx` to the Vite build step when a single proof-case target is active. |
| `apps/hb-webparts/config/package-solution.json` | Version bump to `01.000.014`. |
| `docs/architecture/plans/MASTER/spfx/webparts/phase-2/Prompt-02-Completion-Note.md` | This note. |

## What was removed (for the proof case)

The proof case no longer depends on:

- **Neutral shell manifest ID** (`9a2f7f61-...`): The real HbHeroBanner ID (`39762a4d-...`) is written directly into the shell manifest before `gulp bundle`.
- **Post-bundle manifest cloning**: With a single target, the compiled manifest IS the final manifest.
- **AMD shim modules** (`define("targetId_1.0.0", ["baseId_1.0.0"], ...)`): `targetEntryModuleId === compiledEntryModuleId`, so the shim-generation branch is never entered.
- **`entryModuleId` rewriting**: The compiled ID is already correct.
- **Bundle contamination from 9 unrelated webparts**: The proof-case entry imports only `HbHeroBanner`.

## Exact emitted loader path

```
SharePoint require("39762a4d-c7fd-44a6-a11e-4f8de9f5778d_01.000.014")
  → compiled shell-web-part asset (renamed to this entryModuleId by the build)
  → ShellWebPart.onInit() loads hb-webparts-app-{hash}.js via SPComponentLoader
  → globalThis.__hbIntel_hbWebparts.mount(el, context, config)
  → renders HbHeroBanner directly (no dispatcher lookup needed)
```

No AMD shim in the chain. No neutral manifest indirection.

## Proof-case bundle isolation

A dedicated entry (`mount-hero-proof-case.tsx`) was introduced because the shared `mount.tsx` imports all 10 webpart component trees at the top level. The proof-case entry:

- Imports only `HbHeroBanner`
- Exports the same `mount`/`unmount` contract on the same global (`__hbIntel_hbWebparts`)
- Produces a 192.85 kB bundle (vs 262.49 kB for the full 10-component bundle)
- Renders `HbHeroBanner` directly without webPartId dispatch (the only possible component)

`ShellWebPart.ts` requires no changes — it calls `mount(el, context, config)` identically.

## Verification results

- `check-types`: pass
- `lint`: pass
- `build` (default entry): pass (262.49 kB)
- `build` (proof-case entry): pass (192.85 kB)
- IIFE format verified: `var __hbIntel_hbWebparts=(function(...`
