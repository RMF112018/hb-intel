# Prompt 04 — Wave 5 Project Home Rail Integration

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not reread files that are still available in your current context or memory. Do not implement Prompt 05, 06, or 07 early. Use repo truth only. If repo truth conflicts with the Wave 5 scope lock, closed decision register, or Prompts 02–03 output, stop and report the conflict.

## Objective

Integrate the PCC-local Priority Actions Rail into the existing Project Home `PccPriorityActionsCard` while preserving the 10-card Project Home bento/dashboard invariants.

This prompt remains fixture/read-model-data only. It must not add standalone backend `priority-actions` route consumption yet.

## Repo-Truth Basis

Inspect:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.states.test.tsx
```

## Allowed Files

Modify only:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.states.test.tsx
```

If a focused component test created in Prompt 03 needs a small update because integration changed exported props, that test file may also be modified:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
```

## Forbidden Files / Forbidden Scope

Do not modify:

```text
packages/**
backend/**
apps/project-control-center/src/api/**
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/**
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/useProjectHomeReadModel.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
apps/project-control-center/README.md
pnpm-lock.yaml
package.json
.github/**
*.json manifests
```

Do not import `HbcPriorityRail` or change shared priority models.

## Implementation Requirements

Update `PccPriorityActionsCard` to:

- continue accepting optional `actions?: readonly IPriorityAction[]`;
- continue accepting `state` from existing card props;
- build the local rail view-model from `actions ?? SAMPLE_PRIORITY_ACTIONS`;
- render `PccPriorityActionsRail` when `state === 'preview'`;
- render `PccPreviewState` for non-preview states using existing card-state semantics;
- preserve the card title and footprint unless tests or visual constraints show a narrow need to adjust the footprint;
- keep all controls non-executing/disabled;
- suppress `documents`, `health`, and `safety` in the visible rail;
- preserve current optional read-model data behavior from Wave 4.

Update tests to prove:

- Project Home still renders all 10 required card titles;
- every card remains a direct child of the bento grid;
- exactly one active-surface-panel marker exists;
- Priority Actions card renders the four Wave 5 rail groups;
- visible action rows exclude `documents`, `health`, and `safety` categories;
- disabled/non-executing action affordances render;
- no live `http(s)` hrefs exist on Project Home;
- default `<PccApp />` fixture path performs no fetch if that assertion exists in current tests.

## Guardrails to Preserve

- Fixture remains default.
- No backend route consumption in this prompt.
- No new `fetch(` callsites.
- No package/lockfile/manifest/workflow/deployment changes.
- No runtime/action execution.
- No shared model mutation.
- No direct UI-kit priority rail import.
- Preserve Project Home 10-card bento structure.
- Preserve single active-surface-panel invariant.

## Tests / Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHome
pnpm --filter @hbc/spfx-project-control-center test -- PccPriorityActionsRail
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

If targeted patterns do not work, run:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```

## Stop Conditions

Stop without editing if:

- Prompt 02 or Prompt 03 files are missing.
- Integration would require changing `PccProjectHome` card count or wrapping cards in a way that breaks bento direct-child invariants.
- Suppressed categories cannot be excluded without changing shared fixtures/models.
- Tests show default render now fetches.
- Any change requires backend, api, mount, app, shell, package, lockfile, or deployment edits.

## Required Closeout Response

End with:

- files changed;
- integration summary;
- fixture/default behavior;
- visible group/category behavior;
- suppressed category proof;
- bento/grid and active-surface-panel proof;
- validation results;
- lockfile md5 before/after;
- explicit confirmation of no backend wiring, no new fetch, no direct UI-kit rail import, no runtime/deployment changes.

## Recommended Commit Summary

```text
feat(spfx-pcc): integrate priority actions rail into project home
```

## Recommended Commit Description

```text
Integrates the Wave 5 PCC-local Priority Actions Rail into the existing Project Home Priority Actions card.

Preserves the 10-card direct-child bento dashboard, active-surface-panel invariant, fixture-default behavior, optional read-model action prop behavior, and non-executing action posture while rendering the four Wave 5 rail groups and suppressing documents/health/safety from the user-facing MVP rail.

No backend route consumption, new fetch callsite, shared model mutation, direct HbcPriorityRail import, tenant mutation, package/lockfile change, manifest change, workflow change, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```
