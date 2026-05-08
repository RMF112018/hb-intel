# Prompt 06 — Targeted Validation and Closeout

## Objective

Run targeted and full validation, confirm no package/lockfile/manifest drift, and produce a reproducible Phase 2 closeout.

## Mandatory Opening Instruction

Before making any changes, confirm you are operating on the current repo state. Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Checks Before Editing

1. Inspect `git status --short`.
2. Confirm relevant changes are limited to Phase 2 scope.
3. Confirm no unexpected generated artifacts are staged.
4. Confirm `pnpm-lock.yaml` md5 before/after if possible.
5. Confirm package/manifest/SPPKG files were not changed.
6. Confirm active-panel ownership and header metadata tests are present.


## Expected Files

Expected files:

No new production changes unless validation exposes a minor Phase 2 defect. Documentation closeout file may be created only if repo placement is clear and user/package conventions support it.


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

## Closeout Must Prove

- Shell `main` owns `data-pcc-active-surface-panel`.
- Tab click updates shell marker and `aria-labelledby`.
- Tests no longer require active-panel marker on a bento card.
- Bento direct-child invariant still passes.
- Header metadata exists for all eight surfaces.
- Playwright posture is understood and documented.
- No package/lockfile/manifest drift.
- No unrelated files changed.
- Duplicate header cards remain in place and are deferred to Phase 3.

## Output Format

```markdown
## Phase 2 Closeout

## Git Status

## Files Changed

## Active Panel Ownership Proof

## Header Metadata Proof

## Test Results

## Playwright / Evidence Posture

## Package / Lockfile / Manifest Proof

## Compatibility Bridge Status

## Phase 3 Handoff Readiness
```


## Validation Required

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check   apps/project-control-center/src/shell   apps/project-control-center/src/preview/projectShellViewModel.ts   apps/project-control-center/src/tests/PccShell.responsive.test.tsx   apps/project-control-center/src/tests/PccCardTierContract.test.tsx   apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx   apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx   e2e/pcc-live/pcc-live.page-object.ts   e2e/pcc-live/pcc-live.surface-smoke.spec.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Run live Playwright only if env/auth are available and the user expects evidence. Otherwise report that it was listed but not executed.


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
