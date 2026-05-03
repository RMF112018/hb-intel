# Prompt 05B — Project Home Unified Lifecycle Preview Integration

## Objective

Integrate compact unified lifecycle preview content into Project Home using the hook/container seam from Prompt 05A and the presentational preview components from Prompt 04C.

This prompt must reinforce the PCC as one project operating layer. Unified lifecycle content should appear as project context inside Project Home, not as a new workspace or separate route.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 05A has completed.

Expected available seams:

- `useUnifiedLifecycleReadModel` or equivalent hook/container seam;
- 04C presentational components:
  - `LifecycleTimelinePreview`
  - `ProjectMemoryPanel`
  - `ProjectLensSwitcher`
  - `RelatedRecordsPanel`
  - `WarrantyTracePreview`
  - `ClosedProjectReferencePreview`
  - `UnifiedProjectSearchPreview`

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as user-owned, agent-owned, or unknown. Preserve unrelated/user-owned changes.

## Files to Inspect

Inspect current Project Home structure and tests:

- `apps/project-control-center/src/surfaces/projectHome/`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx`
- `apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/`
- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `apps/project-control-center/src/tests/`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`

Do not broadly inspect or edit unrelated surfaces.

## Current Repo Truth to Preserve

Project Home already has two render paths:

- a read-model-driven path when `readModelClient` is provided;
- a fixture-only fallback path when it is not.

Preserve both paths. Do not break the direct-child `PccDashboardCard` / bento grid invariant.

## Required Work

Add compact unified lifecycle preview regions to Project Home.

Preferred approach:

1. Extend the Project Home read-model client type so it can consume the unified lifecycle client method, using the Prompt 05A interface.
2. Add a small Project Home unified lifecycle section/component that:
   - calls `useUnifiedLifecycleReadModel(client, projectId)`;
   - wraps selected 04C body components in `PccDashboardCard`;
   - returns a fragment of `PccDashboardCard` direct children.
3. Integrate only a bounded set of compact cards into Project Home.

Suggested Project Home cards:

- lifecycle timeline/context card;
- project memory highlights card;
- project lens/context card;
- related records / traceability preview card.

Do **not** add all seven 04C components if that overloads Project Home. Warranty trace and cross-project knowledge may be left for later or included only if the layout remains compact and tests prove card count/direct-child invariants still hold.

## Card Behavior

Cards must:

- use existing `PccDashboardCard`;
- use 04C presentational body components;
- show source/degraded/redacted posture through existing component behavior;
- preserve direct children of the bento grid;
- avoid new routes;
- avoid navigation affordances;
- avoid external writes;
- avoid overloading the home page.

## Lens Behavior

Project Home may show `ProjectLensSwitcher` as preview-only context.

Do not add active lens state in this prompt unless the hook/container and Project Home structure clearly support it without expanding scope. If in doubt, keep the lens selector preview-disabled and leave active-lens state for a later prompt.

## Unified Search

Do not add interactive query input in Prompt 05B unless Prompt 05A already introduced a safe controlled query seam. The default should be a non-interactive grounding preview or omit unified search from Project Home.

## Tests

Add/update tests proving:

- Project Home read-model path renders unified lifecycle preview content from fixtures;
- fallback fixture-only path still renders;
- exactly one active `project-home` surface marker remains;
- `PccDashboardCard` direct-child/bento invariant still holds;
- unified lifecycle cards do not introduce new route/workspace markers;
- lens cue does not change route/workspace behavior;
- redacted/withheld records behave safely;
- related records display source/citation/lineage cues where available;
- existing Project Home cards still render or are intentionally replaced with documented tests.

Avoid broad snapshot churn.

## Constraints

Do not modify:

- Project Readiness.
- Shell/router navigation.
- backend.
- models.
- package files.
- lockfile.
- docs/blueprint/canonical plans.

Do not create:

- a standalone `unified-lifecycle` route or surface;
- estimating/warranty/operations department workspaces;
- live external calls;
- write operations.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

Run models check only if type failures require it:

```bash
pnpm --filter @hbc/models check-types
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Project Home files changed.
4. Unified lifecycle preview cards/regions added.
5. Tests added/updated.
6. Validation results.
7. Lockfile MD5 before/after.
8. Remaining gaps for Prompt 05C.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 05B-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): integrate unified lifecycle previews into project home
```
