# Prompt 02 — Shell Hero View-Model Extension

## Objective

Extend the shell/header view-model seam so the command header can eventually absorb duplicate surface-header content without requiring bento header cards.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state. Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks Before Editing

1. Inspect `apps/project-control-center/src/preview/projectShellViewModel.ts`.
2. Inspect `apps/project-control-center/src/shell/surfaceHeroCopy.ts`.
3. Inspect `packages/models/src/pcc/PccMvpSurfaces.ts`.
4. Confirm all eight surface IDs are represented.
5. Confirm `PccProjectHeroBand.tsx` currently renders identity, facts, and command-search preview only.
6. Do not implement the Modules launcher.
7. Do not activate command search.


## Expected Files

Expected files:

```text
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Optional new file if cleaner:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```


## Implementation Requirements

- Keep the scope limited to this prompt.
- Preserve the PCC read-only / preview / no-writeback posture.
- Do not introduce live SharePoint, Graph, Procore, Sage, Autodesk, or tenant mutation.
- Do not introduce package dependency changes.
- Do not modify `pnpm-lock.yaml`, package dependency sections, SPFx manifests, or packaging files unless you first prove an unavoidable reason and stop for approval.
- Preserve bento direct-child invariants.
- Preserve tablist / tab / tabpanel accessibility.
- Avoid broad formatting or unrelated refactors.
- Use repo truth over assumptions.

## Required Model Shape

Add a typed, deterministic metadata seam equivalent to:

```ts
export interface IPccShellSurfaceSummaryItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface IPccShellSurfaceCue {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface IPccShellHeroViewModel {
  ...
  readonly surfaceSummaryItems: readonly IPccShellSurfaceSummaryItem[];
  readonly surfaceCues: readonly IPccShellSurfaceCue[];
  readonly readOnlyCue: string;
}
```

Exact names may vary if they better fit existing code, but the contract must be typed and deterministic.

## Required Surface Coverage

Provide metadata for all eight surfaces:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

## Content Constraints

- Compact labels only.
- No invented live counts unless sourced from existing fixtures/view-models.
- Use preview/read-only/source cue language where counts are not available.
- Do not claim writeback authority.
- HBI/command search language must not imply autonomous decisions.


## Validation Required

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/preview/projectShellViewModel.ts apps/project-control-center/src/shell apps/project-control-center/src/tests/PccShell.responsive.test.tsx
git diff --check
```


## Required Response Format

After planning, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Implementation Plan

## Test / Validation Plan

## Package / Lockfile / Manifest Posture

## Risks / Open Items
```

After execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Changed

## What Changed

## Tests / Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```
