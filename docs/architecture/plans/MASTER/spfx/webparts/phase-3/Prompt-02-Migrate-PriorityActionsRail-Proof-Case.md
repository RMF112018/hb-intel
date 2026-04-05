# Prompt 02 — Migrate `PriorityActionsRailWebPart` to the First-Class Proof-Case Model

## Objective

Switch the single active hb-webparts proof case from `HbHeroBannerWebPart` to `PriorityActionsRailWebPart`, using the first-class SPFx loader-contract model already proven in tenant.

The target webpart is:

- **Name:** `PriorityActionsRailWebPart`
- **Manifest ID:** `b3f07190-79cf-437d-a1d6-ecbf3f77e616`

---

## Context

The rollout handoff identifies `PriorityActionsRailWebPart` as the recommended first Tier 1 migration target. The goal is to repeat the same validated pattern used for hero:

- isolated proof-case entry
- single active proof-case allowlist target
- native `{webpartId}_1.0.0` entry identity
- no neutral shell manifest
- no AMD shim files
- no multi-webpart batch packaging

---

## Scope

Primary files:

- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx` (new)
- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`

Relevant existing files for reference:

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json`
- `apps/hb-webparts/src/mount-hero-proof-case.tsx`

---

## Hard constraints

Do **not** do any of the following:

- add multiple proof-case IDs
- restore batch packaging
- change `ShellWebPart.ts`
- change `mount.tsx`
- change `vite.config.ts` unless a real blocker is proven
- touch unrelated webparts
- reintroduce neutral shell manifest usage for the single-target case
- reintroduce AMD shim generation for the single-target case

Do not re-read files that are already in your active context unless needed for verification.

---

## Required implementation

### 1. Create isolated proof-case entry

Create:

- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx`

The new entry must:

- import only `PriorityActionsRail`
- preserve the existing shell contract:
  - `mount(el, spfxContext?, config?)`
  - `unmount()`
- publish on the same global used by the hb-webparts shell
- render the target component directly
- pass through `webPartProperties` as `config`
- avoid unnecessary dispatcher logic

### 2. Switch the active proof-case target

Update `tools/build-spfx-package.ts` so the hb-webparts proof-case allowlist contains only:

- `b3f07190-79cf-437d-a1d6-ecbf3f77e616`

Ensure the proof-case entry lookup resolves this ID to:

- `src/mount-priority-actions-rail-proof-case.tsx`

### 3. Version bump

Bump the hb-webparts package version by one patch from the current source value.

The rollout note documents `1.0.0.16` as the current package version. If the live source still reflects that value, bump to:

- `1.0.0.17`

At minimum update:

- `solution.version`
- `solution.features[0].version`

If the current source has already moved past `1.0.0.16`, bump one patch beyond the current source value instead of forcing `1.0.0.17`.

### 4. Documentation

Write a concise completion note capturing:

- files changed
- new proof-case entry file
- active proof-case ID switch
- package version before/after
- why single-target first-class packaging remains the selected model

---

## Validation requirements

### A. Source validation
Confirm the active proof-case target is now only `PriorityActionsRailWebPart`.

### B. Entry validation
Confirm the build script routes the active proof-case to `src/mount-priority-actions-rail-proof-case.tsx`.

### C. Non-regression validation
Confirm none of the following changed:
- `ShellWebPart.ts`
- `mount.tsx`
- shim guard semantics for multi-target mode

---

## Deliverable

Provide a concise completion note with:

1. files changed
2. new proof-case entry created
3. active proof-case ID switched to `b3f07190-79cf-437d-a1d6-ecbf3f77e616`
4. package version before/after
5. confirmation that the migration remains single-target and shim-free by design
