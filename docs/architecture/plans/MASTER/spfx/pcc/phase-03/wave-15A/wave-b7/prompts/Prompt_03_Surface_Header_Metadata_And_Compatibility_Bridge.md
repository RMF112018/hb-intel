# Prompt 03 — Surface Header Metadata and Compatibility Bridge

## Objective

Wire the new shell/header metadata through the active surface path and render a compact header summary without removing existing bento header cards.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state. Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks Before Editing

1. Inspect `PccApp.tsx` to confirm how `heroViewModel` is built and passed to `PccShell`.
2. Inspect `PccShell.tsx` and `PccProjectHeroBand.tsx` from current context unless stale.
3. Inspect surface metadata added in Prompt 02.
4. Re-search `dataActiveSurfacePanel` and `data-pcc-active-surface-panel` to understand the compatibility bridge.
5. Confirm that duplicate top-level header cards are still in place and are not to be removed in this prompt.


## Expected Files

Expected files:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Optional files:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.test.ts
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

## Rendering Requirements

Render compact surface-aware header metadata in `PccProjectHeroBand` or a child component.

Required behavior:

- Header content changes when active tab changes.
- Project facts remain visible.
- Existing command-search preview remains non-focusable/non-operational unless a future phase changes it.
- Metadata must fit within current responsive header posture.
- Do not add a Modules launcher.
- Do not remove any bento card.
- Do not create horizontal overflow.

## Compatibility Bridge Requirements

Document in code comments or tests:

- shell `main` is the semantic active-panel owner;
- card-level `dataActiveSurfacePanel` is deprecated compatibility;
- future duplicate-card removal phase should remove or demote card markers after tests/evidence are updated.

## Test Requirements

Add or update tests to verify:

- active surface header metadata changes for at least Project Home, Documents, and Site Health;
- all eight surface IDs have metadata;
- compact summary/cue items render without empty labels;
- no extra focusable controls are introduced into command-search preview.


## Validation Required

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/PccApp.tsx apps/project-control-center/src/preview/projectShellViewModel.ts apps/project-control-center/src/shell apps/project-control-center/src/tests/PccShell.responsive.test.tsx
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
