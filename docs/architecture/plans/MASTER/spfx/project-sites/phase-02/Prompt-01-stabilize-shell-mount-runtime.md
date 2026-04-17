# Prompt 01 — Stabilize Shell Mount Runtime

## Objective
Make the active Project Sites shell mount/runtime seam idempotent so repeated SharePoint render calls do not recreate the React root, recreate the `QueryClient`, or reboot the app.

## Governing Authorities / Relevant Docs
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` where host-fit language is relevant
- `docs/architecture/reviews/spfx/project-sites/project-sites-search-filter-sort-enhancement.md` for historical context only
- the current repo truth in:
  - `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
  - `apps/project-sites/src/mount.tsx`
  - `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts`

## Critical Operating Instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Exact Files and Symbols to Inspect
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
  - `render()`
  - `onInit()`
  - `onDispose()`
- `apps/project-sites/src/mount.tsx`
  - module-level `root`
  - module-level `queryClient`
  - `mount(...)`
  - `unmount()`
- `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts`
  - use only as a contrast/reference for safe root/query-client lifecycle

## Exact Defect / Instability Issue to Close
The active shell path calls `mount()` from `render()`, but `mount()` recreates critical runtime objects unconditionally. That is unsafe under repeat SharePoint render events and can cause transient app reboots, cache resets, and visual flashes.

## Required Implementation Outcome
Implement a runtime contract in which:
1. The React root is created exactly once per mounted instance.
2. The `QueryClient` is created exactly once per mounted instance.
3. Auth bootstrap is not repeated unnecessarily on ordinary rerenders.
4. Repeated shell `render()` calls update the existing tree instead of recreating it.
5. `unmount()` fully cleans up the mounted instance so a later remount still works correctly.
6. The final design is explicit about source-of-truth ownership of the mounted instance.

You may revise either the shell caller, the app-host mount contract, or both, but the final contract must be coherent and minimal.

## Validation / Proof of Closure Requirements
Provide proof for all of the following:
- repeated shell `render()` calls do not create a second root
- repeated shell `render()` calls do not create a second `QueryClient`
- repeated shell `render()` calls do not trigger a full app reboot path
- `onDispose()` followed by a fresh mount still works
- tests or instrumentation logs demonstrate the repaired lifecycle

If current automated tests do not cover this, add targeted regression coverage.

## Explicit Non-Goals
- no feature redesign
- no search/filter/sort behavior changes unless strictly necessary for this lifecycle fix
- no unrelated packaging overhauls
