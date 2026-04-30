# Prompt 02 — Wave 5 Priority Actions Rail Model and Adapter

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not reread files that are still available in your current context or memory. Do not implement Prompt 03, 04, 05, 06, or 07 early. Use repo truth only. If repo truth conflicts with the Wave 5 scope lock or closed decision register, stop and report the conflict.

## Objective

Create the PCC app-local Priority Actions Rail view-model and adapter that maps existing `@hbc/models/pcc` priority actions into the four closed Wave 5 MVP rail groups.

This prompt must not render the final rail UI inside Project Home and must not wire backend route consumption.

## Repo-Truth Basis

Inspect only what is needed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closed_Decisions.md
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/fixtures/priorityActions.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/src/surfaces/projectHome/shared.ts
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
```

## Allowed Files

Create only:

```text
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailViewModel.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.ts
apps/project-control-center/src/surfaces/projectHome/priorityActionsRailAdapter.test.ts
```

If an existing local test-placement convention clearly requires tests under `apps/project-control-center/src/tests/`, stop and report before choosing a different path.

## Forbidden Files / Forbidden Scope

Do not modify:

```text
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/fixtures/priorityActions.ts
packages/models/src/pcc/PccReadModels.ts
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

Do not import or reuse `packages/ui-kit/src/HbcPriorityRail/**` or `@hbc/ui-kit` priority rail exports.

## Implementation Requirements

Create an app-local view-model contract with at least:

```ts
export type PccPriorityRailGroupId =
  | 'access-requests'
  | 'readiness-blockers'
  | 'approval-checkpoints'
  | 'external-system-mapping';
```

Define group metadata locally for:

- Access Requests;
- Readiness Blockers;
- Approval / Checkpoint Prompts;
- External-System Mapping Prompts.

Create a pure adapter function, for example:

```ts
buildPccPriorityActionsRailViewModel(actions: readonly IPriorityAction[]): IPccPriorityActionsRailViewModel
```

The adapter must:

- accept existing `IPriorityAction[]` from `@hbc/models/pcc`;
- avoid mutating input arrays or action objects;
- group visible actions into the four Wave 5 groups;
- suppress `documents`, `health`, and `safety` from the user-facing MVP view-model;
- preserve suppressed counts or ignored metadata only if useful for tests/debugging, but do not expose suppressed items as visible user-facing actions;
- preserve original action ids, titles, summaries, due dates, `assigneePersona`, `relatedWorkCenter`, `relatedWorkflowItemId`, and severity where applicable;
- map severity through the existing `priorityToneForAction` helper or an equivalent local non-runtime helper if importing from `shared.ts` is repo-consistent;
- sort within groups deterministically, with urgent/high severity and due-date items ahead of lower-priority undated items;
- return empty groups with counts instead of omitting groups;
- include total visible count and suppressed/deferred count.

Suggested mapping baseline:

| Current signal | Wave 5 group |
|---|---|
| `category === 'approval'` | `approval-checkpoints` |
| `category === 'procore-sync'` | `external-system-mapping` |
| `relatedWorkCenter === 'team-and-access'` and not approval | `access-requests` |
| `workflow`, `compliance`, `inspection`, `permit`, `closeout` | `readiness-blockers` |
| `documents`, `health`, `safety` | suppressed / deferred |

If repo truth shows additional existing categories or work-center ids, extend the local mapping in the adapter and tests. Do not change shared model categories.

## Guardrails to Preserve

- Fixture remains default.
- No backend route consumption in this prompt.
- No new `fetch(` callsites.
- No mutation or execution behavior.
- No package, lockfile, manifest, workflow, deployment, or tenant changes.
- No Graph/PnP/SharePoint REST runtime.
- No Procore/Document Crunch/Adobe Sign runtime.
- No auth/persona derivation.
- No direct UI-kit priority rail import.
- No shared model category mutation.

## Tests / Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- priorityActionsRailAdapter
md5 pnpm-lock.yaml
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

If the targeted Vitest pattern does not work in this repo, run the full PCC test suite:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```

## Stop Conditions

Stop without editing if:

- Wave 5 scope lock or closed decision register is missing.
- Shared priority categories already changed to canonical four-lane categories, making the app-local adapter decision stale.
- `IPriorityAction` is absent or materially incompatible.
- Suppressing `documents`, `health`, and `safety` cannot be done without changing shared fixtures/models.
- Any change requires package/lockfile or backend edits.

## Required Closeout Response

End with:

- files changed;
- model/adapter behavior summary;
- final category mapping used;
- suppressed categories proof;
- validation results;
- lockfile md5 before/after;
- explicit confirmation of no shared model mutation, no backend wiring, no new fetch, no runtime/deployment changes.

## Recommended Commit Summary

```text
feat(spfx-pcc): add priority actions rail adapter
```

## Recommended Commit Description

```text
Adds the app-local Wave 5 Priority Actions Rail view-model and adapter for PCC Project Home.

Maps existing @hbc/models/pcc priority action fixtures into the four closed Wave 5 rail groups, suppresses documents/health/safety from the user-facing MVP rail, preserves deterministic read-only metadata, and validates grouping/suppression behavior with focused tests.

No shared priority category mutation, backend route consumption, new fetch callsite, runtime execution, tenant mutation, package/lockfile change, manifest change, workflow change, deployment, .sppkg, app catalog upload, hosted validation, or production rollout is introduced.
```
