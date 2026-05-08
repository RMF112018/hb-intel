# Prompt 04 — Test Update and Direct-Child Guardrails

## Objective

Revise stale tests that assume active-panel ownership is card-based, while strengthening direct-child and no-nested-card guardrails.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state. Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks Before Editing

1. Inspect `apps/project-control-center/src/tests/PccCardTierContract.test.tsx`.
2. Inspect `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`.
3. Inspect `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx`.
4. Inspect any tests found by searching:
   - `getActiveBento`
   - `data-pcc-active-surface-panel`
   - `dataActiveSurfacePanel`
   - `active-panel`
5. Confirm shell ownership tests from Prompt 01/03 exist and pass.


## Expected Files

Expected files:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Optional new focused test:

```text
apps/project-control-center/src/tests/PccShell.activePanelOwnership.test.tsx
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

## Required Test Corrections

Revise `PccCardTierContract.test.tsx` helper logic if it currently does this:

```ts
const surfacePanel = container.querySelector(`[data-pcc-active-surface-panel="${surfaceId}"]`);
const parent = surfacePanel!.parentElement;
expect(parent.hasAttribute('data-pcc-bento-grid')).toBe(true);
```

That logic becomes invalid once the shell `main` owns the marker.

Replace with equivalent logic that:

1. Finds the shell active panel:

```ts
const panel = container.querySelector(`main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`);
```

2. Finds the bento grid within the panel:

```ts
const bento = panel?.querySelector('[data-pcc-bento-grid]');
```

3. Audits all cards under that bento.

## Required Assertions

Add/maintain assertions that:

- exactly one shell active panel exists;
- the shell active panel is a `MAIN`;
- the shell active panel has `role="tabpanel"`;
- the shell active panel has expected `aria-labelledby`;
- cards remain direct children of `[data-pcc-bento-grid]`;
- no `[data-pcc-card] [data-pcc-card]` nesting exists;
- card tier/region/footprint markers remain explicit and non-empty;
- no test relies on active-panel marker being a bento card.

## Compatibility Test

A small test may remain proving `PccDashboardCard` can emit `dataActiveSurfacePanel` for backward compatibility, but it must not describe that marker as semantic active-panel ownership.


## Validation Required

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/tests/PccCardTierContract.test.tsx apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx apps/project-control-center/src/tests/PccShell.responsive.test.tsx
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
