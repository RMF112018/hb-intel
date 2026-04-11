# PnP Ops Gap Closure Prompt Package

## Objective

This package instructs a local code agent to close the current PnP Operations SPFx packaging/runtime gaps, harden the build pipeline against stale app-bundle reuse, prove package freshness, and validate that the `hb-webparts.sppkg` artifact reflects current repo truth.

## Recommended Execution Order

1. `Prompt-01-Pipeline-Audit-and-Repo-Truth.md`
2. `Prompt-02-Fresh-Build-Enforcement.md`
3. `Prompt-03-Package-Truth-and-Freshness-Proofs.md`
4. `Prompt-04-Render-Path-and-Authoring-Gap-Closure.md`
5. `Prompt-05-Final-Validation-and-Closure-Report.md`

## Core Working Rules

- Work from live repo truth, not plan docs.
- Do not re-read files that are still within your active context or memory window.
- Do not treat prior generated package artifacts as authoritative unless you prove they were freshly produced from the current working tree.
- Prefer small, reviewable commits or patch groups.
- Surface blockers explicitly instead of silently working around them.
- When you change packaging logic, also change the proof/verification logic so the pipeline can detect regressions later.

## Primary Audit/Closure Targets

- `apps/hb-webparts/src/webparts/pnp/`
- `apps/hb-webparts/src/mount.tsx`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/config/package-solution.json`
- `tools/spfx-shell/release/manifests/`
- `dist/sppkg/hb-webparts.sppkg`

## Required Outcomes

- Fresh Vite/SPFx outputs are guaranteed to make it into the shipped `.sppkg`
- Stale `apps/hb-webparts/dist` reuse is no longer able to create source/package drift
- Package-truth verification proves the shipped `hb-webparts-app-*.js` and `shell-entry-*` assets correspond to the current source and current packaging run
- PnP Ops render-path diagnostics are strong enough to isolate page/runtime failures quickly
- Any remaining uncertainty is documented with exact next-proof requests
