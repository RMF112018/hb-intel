# Phase 18 Wave 02 — Prompt 01 Closure

**Status:** Closed
**Closure date:** 2026-04-16
**Manifest bump:** `hb-publisher` `1.0.0.64` → `1.0.0.65`
**Scope:** Remove the accidental SPFx version split between the app
layer and the shell compiler by governing the two baselines
explicitly.

## What was actually split

- `tools/spfx-shell/package.json` pins **exact `1.18.0`** for seven
  `@microsoft/sp-*` packages and is **excluded from the root pnpm
  workspace** (`pnpm-workspace.yaml`: `!tools/spfx-shell`). It
  installs its own `node_modules/` under Node 18.20.8 via `npm`. The
  `sp-build-web@1.18.0` gulp toolchain and the
  `sp-webpart-base@1.18.0` runtime identity both come from this
  install and are what actually ship inside the `.sppkg`.
- `apps/hb-publisher/package.json` and `apps/hb-webparts/package.json`
  declare **`^1.20.0`** for `@microsoft/sp-property-pane` and
  `@microsoft/sp-webpart-base` as devDependencies. These are
  type-only imports (e.g. `type { WebPartContext } from '@microsoft/sp-webpart-base'`).
  Every app's `vite.config.ts` externalizes `@microsoft/*` under
  `rollupOptions.external`, so no app-layer SPFx bytes ever enter
  the `.sppkg`.

The two baselines do not interact at runtime. The apps' declared
SPFx types exist purely for compiler / IDE ergonomics; the shell's
SPFx toolchain is what produces the packaged bytes.

## Decision: govern the split, do not collapse it

Collapsing to a single baseline was rejected:

- **Down to 1.18.0** would regress the `spfx-baseline.md` Wave 1
  declaration (`^1.20.0` is the app-layer standard) and strip the
  apps of modern SDK types.
- **Up to 1.20.0 for the shell** means revalidating the entire SPFx
  gulp/webpack packaging pipeline against a newer toolchain — not a
  Wave 02 hygiene task, and the prompt's guardrail is "do not make
  unrelated dependency upgrades." Raising the shell baseline is
  explicitly called out as ADR-worthy.

Governing the split:

1. Rewrote `docs/reference/developer/spfx-baseline.md` §1a to declare
   both baselines, their scopes, install locations, and the
   change-control procedure for raising either one.
2. Added a hard preflight check in `tools/build-spfx-package.ts`
   (`assertSpfxBaselines`) that runs before the main packaging loop
   and fails fast with a violations list + pointer to the baseline
   doc when:
   - any of the seven governed shell SPFx packages declares a version
     other than `1.18.0` exact in `tools/spfx-shell/package.json`, or
   - any of the two governed app-layer SPFx packages declares a
     version other than `^1.20.0` in any governed app's
     `package.json`.

The preflight emits a green line on success so drift events are
visible in the log:

```
✓ SPFx baselines: shell=1.18.0 exact (7 pkgs), apps=^1.20.0 (hb-publisher, hb-webparts)
```

## Verification

1. `npx tsx tools/build-spfx-package.ts --domain hb-publisher`:
   - ✓ SPFx baseline preflight green.
   - ✓ Fresh Vite build, freshness evidence, all four package-truth
     checks pass, all four hosted-load-proof checks pass.
   - ✅ `hb-publisher.sppkg` (355.1 KB).
2. `npx tsx tools/build-spfx-package.ts --domain hb-webparts`:
   - ✓ SPFx baseline preflight green.
   - ✓ All four package-truth checks pass.
   - ✅ `hb-webparts.sppkg` (3180.3 KB).
3. Standalone `tsc --noEmit` on the orchestrator: clean.
4. Packaged Publisher `ComponentManifest` unchanged — still references
   `shell-entry-1a6f8b2c-…-3fd81f9c.js`, whose AMD identity comes
   from the shell's `1.18.0` pinned toolchain. Proof of the "packaged
   manifest output matches the intended strategy" requirement.

## Files changed

- `docs/reference/developer/spfx-baseline.md` — new §1a governance.
- `tools/build-spfx-package.ts` — baseline constants + preflight.
- `apps/hb-publisher/config/package-solution.json` — version bump.
- `tools/spfx-shell/config/package-solution.json` — orchestrator-
  propagated version.

## Out of scope

- Raising either baseline. That is an ADR-worthy decision; the
  baseline doc spells out the revalidation checklist when the time
  comes.
