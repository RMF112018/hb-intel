# Prompt 05 — Playwright Selector and Evidence Posture

## Objective

Confirm and, if appropriate, improve Playwright live evidence so it records shell active-panel ownership without breaking current tenant-hosted smoke coverage.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state. Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks Before Editing

1. Inspect:
   - `e2e/pcc-live/pcc-live.page-object.ts`
   - `e2e/pcc-live/pcc-live.surfaces.ts`
   - `e2e/pcc-live/pcc-live.surface-smoke.spec.ts`
   - evidence writer/types if surface smoke output shape changes.
2. Confirm whether current checks only require presence/count.
3. Confirm whether any evidence files or snapshots assume card-level marker ownership.
4. Confirm whether tenant deployment may lag local source and should not hard-fail owner checks prematurely.


## Expected Files

Expected files:

```text
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

Optional if evidence output expands:

```text
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.workflow.types.ts
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

## Preferred Playwright Enhancement

Enhance surface smoke inspection to record:

- `activePanelFound`;
- `activePanelCount`;
- `activePanelOwnerTagName`;
- `activePanelRole`;
- `activePanelId`;
- `activePanelIsShellMain`.

Do not make `activePanelIsShellMain` a hard pass/fail requirement unless the tenant-hosted package version being tested is known to include Phase 2. Otherwise, record a warning or evidence field so the local source can progress without being blocked by tenant deployment lag.

## Do Not

- Do not weaken existing navigation smoke tests.
- Do not include auth/storage/token paths in evidence.
- Do not commit traces, videos, raw reports, storage state, or screenshots unless the evidence harness explicitly sanitizes and curates them.
- Do not claim live evidence success without artifacts.


## Validation Required

Run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check e2e/pcc-live/pcc-live.page-object.ts e2e/pcc-live/pcc-live.surfaces.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
git diff --check
```

If running live Playwright is appropriate and env/auth are available:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
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
