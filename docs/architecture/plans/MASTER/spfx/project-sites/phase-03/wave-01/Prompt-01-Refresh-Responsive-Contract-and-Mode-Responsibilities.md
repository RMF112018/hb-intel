# Prompt-01-Refresh-Responsive-Contract-and-Mode-Responsibilities

## Objective

Refresh the Project Sites responsive contract so the repo no longer relies on an under-expressive three-mode interpretation, and make the code, docs, and future-state responsibilities line up clearly.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `PROJECT_SITES_WIDE_MIN_WIDTH`
  - `PROJECT_SITES_MEDIUM_MIN_WIDTH`
  - `PROJECT_SITES_SHORT_HEIGHT_MAX`
  - `resolveProjectSitesLayoutMode`
  - `resolveProjectSitesContainerState`
  - `useProjectSitesContainerState`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - mode-dependent control/grid/card branching points
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`

## Current gap to close

Main already has a breakpoint-contract closure document and validation evidence, but the active contract is still too coarse and too three-mode-centric for the responsive quality bar now required. The repo should not continue with a contract that technically exists but does not sufficiently govern tablet/transitional behavior, compact density policy, sparse wide behavior, and first-screen priorities.

## Required implementation outcome

Refresh the responsive contract so it clearly defines:
- the supported display classes and practical usable-space assumptions
- the meaning of short-height states versus narrow-width states
- the mode responsibilities that the root and card surfaces must honor
- what changes in control-band composition, card density, and sparse/wide behavior by mode

You may keep three public mode names if you can make the responsibilities materially sharper, or you may introduce a richer public mode system if that is the cleaner solution. The important requirement is that the contract become more expressive, more testable, and more discoverable from repo truth.

Update the existing closure docs intentionally. Do not pretend they do not exist, and do not create a misleading parallel document set unless you are clearly superseding the old files with explicit replacement language.

## Proof of closure required

- code contract and docs align
- a reviewer can understand the responsive responsibilities without reverse-engineering them from styling alone
- the updated contract clearly governs later prompts in this package
- any threshold or mode-meaning changes are reflected in tests and docs together

## Constraints

- do not drift into unrelated product scope
- do not add decorative mode names without meaningful behavioral differentiation
- do not leave the old contract docs stale if the code contract changes

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Refresh the Project Sites responsive contract so the repo no longer relies on an under-expressive three-mode interpretation, and make the code, docs, and future-state responsibilities line up clearly.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
  - `PROJECT_SITES_WIDE_MIN_WIDTH`
  - `PROJECT_SITES_MEDIUM_MIN_WIDTH`
  - `PROJECT_SITES_SHORT_HEIGHT_MAX`
  - `resolveProjectSitesLayoutMode`
  - `resolveProjectSitesContainerState`
  - `useProjectSitesContainerState`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - mode-dependent control/grid/card branching points
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`

Current Gap:
Main already has a breakpoint-contract closure document and validation evidence, but the active contract is still too coarse and too three-mode-centric for the responsive quality bar now required. The repo should not continue with a contract that technically exists but does not sufficiently govern tablet/transitional behavior, compact density policy, sparse wide behavior, and first-screen priorities.

Required Outcome:
Refresh the responsive contract so it clearly defines:
- the supported display classes and practical usable-space assumptions
- the meaning of short-height states versus narrow-width states
- the mode responsibilities that the root and card surfaces must honor
- what changes in control-band composition, card density, and sparse/wide behavior by mode

You may keep three public mode names if you can make the responsibilities materially sharper, or you may introduce a richer public mode system if that is the cleaner solution. The important requirement is that the contract become more expressive, more testable, and more discoverable from repo truth.

Update the existing closure docs intentionally. Do not pretend they do not exist, and do not create a misleading parallel document set unless you are clearly superseding the old files with explicit replacement language.

Proof of Closure:
- code contract and docs align
- a reviewer can understand the responsive responsibilities without reverse-engineering them from styling alone
- the updated contract clearly governs later prompts in this package
- any threshold or mode-meaning changes are reflected in tests and docs together

Constraints:
- do not drift into unrelated product scope
- do not add decorative mode names without meaningful behavioral differentiation
- do not leave the old contract docs stale if the code contract changes

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- Treat this as a contract refresh, not a greenfield document write.
- Be explicit about what the previous contract got right and what it no longer covers well enough.
- Summarize final mode responsibilities in plain language at the end.
```
