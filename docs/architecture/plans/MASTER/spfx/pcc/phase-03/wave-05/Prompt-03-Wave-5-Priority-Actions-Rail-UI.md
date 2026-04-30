# Prompt 03 — Wave 5 Priority Actions Rail UI

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not reread files that are still available in your current context or memory. Do not implement Prompt 04, 05, 06, or 07 early. Use repo truth only. If repo truth conflicts with the Wave 5 scope lock, closed decision register, or Prompt 02 output, stop and report the conflict.

## Objective

Create a PCC-local Priority Actions Rail UI component that renders the Prompt 02 view-model.

This prompt must not integrate the component into the existing Project Home card yet and must not wire backend consumption.

## Repo-Truth Basis

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closed_Decisions.md
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/ui/PccPreviewState.tsx
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md
```

## Allowed Files

Create only:

```text
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.module.css
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx
```

If repo test conventions require the test under `apps/project-control-center/src/tests/`, stop and report before changing the file path.

## Forbidden Files / Forbidden Scope

Do not modify:

```text
packages/**
backend/**
apps/project-control-center/src/api/**
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/**
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/README.md
pnpm-lock.yaml
package.json
.github/**
*.json manifests
```

Do not import or reuse `packages/ui-kit/src/HbcPriorityRail/**` or any `HbcPriorityRail` export. Existing UI-kit theme tokens may be used only if already standard in PCC components.

## Implementation Requirements

Create `PccPriorityActionsRail` as a local presentational component.

Minimum behavior:

- accepts the Prompt 02 rail view-model;
- renders all four group lanes even when one or more groups are empty;
- shows visible action count per group;
- renders empty state text for groups with no visible actions;
- shows due dates, assignee/persona labels, severity/tone indicators, and related work-center metadata where available;
- renders disabled/non-executing controls only, for example disabled buttons or non-clickable chips;
- no `<a href="http...">` launch links;
- no `onClick` behavior that performs workflow/action/navigation execution;
- no hover-only critical meaning;
- accessible labels for group summaries and action rows;
- compact enough to live inside the existing Project Home bento card;
- responsive/container-safe in narrow card widths;
- visually aligned with PCC command-center style and SPFx full-page/widget doctrine.

The component should expose stable test selectors, such as:

```text
data-pcc-priority-rail
data-pcc-priority-rail-group
data-pcc-priority-rail-action-id
data-pcc-priority-rail-action-tone
data-pcc-priority-rail-disabled-action
```

Use `PccPreviewState` or consistent local state rendering for empty/error/preview states if the view-model state requires it. Do not create a new global state catalog.

## Guardrails to Preserve

- Fixture remains default.
- No backend wiring in this prompt.
- No new `fetch(` callsites.
- No mutation or action execution.
- No direct `HbcPriorityRail` import.
- No shared model mutation.
- No package/lockfile/manifest/workflow/deployment changes.
- No tenant mutation or hosted validation.
- No auth/persona derivation.

## Tests / Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccPriorityActionsRail
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

If the targeted test pattern does not work, run:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```

## Stop Conditions

Stop without editing if:

- Prompt 02 adapter/view-model files are missing.
- The view-model does not expose enough information to render the required four lanes without changing shared models.
- The UI cannot be built locally without adding dependencies or changing lockfile/package files.
- Existing PCC CSS/module conventions conflict with adding a local component CSS module.
- Direct `HbcPriorityRail` import appears necessary.

## Required Closeout Response

End with:

- files changed;
- UI behavior summary;
- accessibility/state behavior summary;
- proof that controls are non-executing;
- proof that `HbcPriorityRail` was not imported;
- validation results;
- lockfile md5 before/after;
- explicit confirmation of no backend wiring, no new fetch, no model mutation, no runtime/deployment changes.

## Recommended Commit Summary

```text
feat(spfx-pcc): add priority actions rail UI
```

## Recommended Commit Description

```text
Adds a PCC-local Priority Actions Rail UI component for Wave 5.

Renders the app-local four-group rail view-model with accessible group summaries, action metadata, due/persona/tone cues, empty group states, and disabled non-executing action affordances while preserving PCC bento/card constraints.

No direct HbcPriorityRail reuse, shared model mutation, backend wiring, new fetch callsite, action execution, tenant mutation, package/lockfile change, manifest change, workflow change, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```
