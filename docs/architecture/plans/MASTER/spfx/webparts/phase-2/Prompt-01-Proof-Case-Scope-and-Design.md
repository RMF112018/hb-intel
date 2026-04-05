# Prompt-01 — Proof-Case Scope and Design

## Objective

Replace the current shim-based loader model **for `HbHeroBannerWebPart` only** with a first-class SPFx loader contract proof case, and lock the implementation scope before code changes broaden.

## Required operating rules

- Do not re-read files that are already in your active context or memory. Only open additional files when required to verify a dependency, inspect a touched surface, or resolve uncertainty.
- Use repo truth only. Do not rely on earlier assumptions if the current source disagrees.
- Stay narrowly focused on `HbHeroBannerWebPart`.
- Do not broaden into unrelated homepage webparts.
- Do not fix secondary console noise unless it blocks the proof case.
- Do not leave behind dual active packaging models for the same proof-case webpart.

## Repo focus

Audit only the files necessary to define the proof-case architecture and change plan:

- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/vite.config.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBannerWebPart.manifest.json`
- any directly related helper or config file that is required to complete this proof case

## Required conclusion

You must produce and then implement a narrow design that does all of the following:

1. packages only `HbHeroBannerWebPart` for the proof case
2. removes post-bundle manifest cloning for the proof case
3. removes generated AMD shim entry modules for the proof case
4. removes neutral-shell-manifest indirection for the proof case
5. allows the packaged loader contract to be emitted natively by SPFx for the proof case
6. keeps the code path reusable for later rollout to the other `hb-webparts`

## Recommended architecture target

Unless repo truth exposes a better first-class path, prefer the following model:

- single proof-case webpart target: `39762a4d-c7fd-44a6-a11e-4f8de9f5778d`
- no multi-manifest post-processing in `tools/build-spfx-package.ts` for the proof case
- one real shell manifest compiled with the hero webpart ID before `gulp bundle`
- no post-bundle `entryModuleId` rewrite
- no synthetic `define()` shim files
- if needed for isolation, a hero-only proof-case app entry and bundle/global name

## Deliverables in this prompt

Implement the proof-case scope lock and output a concise engineering note covering:

- exact files changed
- exact proof-case architecture selected
- what shim-era logic is now bypassed or removed
- what still remains deferred for later rollout
- why the selected design is the minimum correct proof case

## Acceptance criteria

This prompt is complete only when:

- the codebase is explicitly scoped to `HbHeroBannerWebPart` as the active proof case
- the planned implementation path no longer depends on post-bundle shim mechanics for the proof case
- the resulting design is ready for build/package work in the next prompt
