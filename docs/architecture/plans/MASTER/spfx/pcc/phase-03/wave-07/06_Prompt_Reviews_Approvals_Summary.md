# 06 — Prompt: Reviews & Approvals Summary Rendering

## Role

You are a local code agent working in:

```text
/Users/bobbyfetting/hb-intel
```

You are implementing the Reviews & Approvals summary slice for **Project Control Center Phase 3 / Wave 7 — HB Document Control Center**.

## Objective

Render document review metadata and a review queue summary from the Wave 7 document-control read model.

This is summary rendering only. Do not implement live approval, rejection, return, reassignment, routing, workflow mutation, SharePoint approval execution, or backend workflow writes.

## Preconditions

Complete before starting:

1. `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md`
2. `03B_Prompt_SPFX_Three_Lane_UI.md`
3. `04_Prompt_Permission_Action_Rendering.md`
4. `05_Prompt_Source_Degraded_States.md`

## Mandatory Preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

Protect unrelated working-tree changes.

Do not re-read files that are still within current context or memory.

## Files to Inspect

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
```

## Files You May Modify

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

Only modify fixture data if needed to add deterministic state coverage.

## Required Implementation

Render a Reviews & Approvals summary using:

```ts
reviewTypes
reviewStates
reviewQueueSample
roleActionAvailability
```

## Required Review Type Coverage

Use read-model values as the active source. Where labels are rendered, convert machine ids to safe labels.

Expected target review types include, depending on current model/fixture state:

- PM Review
- PX Review
- Operations Review
- Accounting / Admin Review
- Lead Estimator Review
- Chief Estimator Review
- Legal Review
- Compliance Review
- Leadership Review
- Custom Internal Review
- current fixture review types such as chief-estimator-review, legal-review, compliance-review, leadership-review, project-execution-review

Do not invent live routing behavior for review types that are not present in current read-model data.

## Required Review State Coverage

Render safe state labels for:

- Draft / not required, if represented
- Submitted / pending
- Under Review / in-review
- Approved
- Rejected
- Returned for Revision, if represented
- Waived, if represented
- Superseded / archived, if represented

Do not implement state transitions.

## Required Queue Rendering

For each review queue item, render:

- file name;
- review type label;
- review state label;
- assigned role code and safe role label if available.

Do not render:

- approve button;
- reject button;
- return button;
- reassign button;
- workflow mutation control;
- live SharePoint approval/check-in/check-out action.

Preview-only disabled controls may appear only if clearly marked as non-operational and tests prove they have no executable handler.

## Required Tests

Tests must prove:

1. Reviews & Approvals summary renders.
2. Review types render from read model.
3. Review states render from read model.
4. Queue items render deterministic file names.
5. Assigned role code/label renders safely.
6. Approved/rejected/pending/in-review states render safely where present.
7. No live approve/reject/return/reassign execution controls exist.
8. No button has an executable handler for workflow actions.
9. No live Graph/PnP/SharePoint REST imports are introduced.
10. Backend-unavailable/source-unavailable state remains safe.

## Forbidden Changes

Do not:

- implement approval execution;
- implement workflow mutation;
- implement backend write routes;
- call Graph/PnP/SharePoint REST;
- call Procore/Adobe Sign/Document Crunch;
- add dependencies;
- change lockfile;
- package/deploy SPFx;
- mutate tenant/external systems;
- edit `docs/architecture/plans/**`.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDocumentsSurface
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
```

## Closeout Requirements

Include:

- files changed;
- tests run and results;
- lockfile checksum before/after;
- review summary behavior implemented;
- confirmation no live approval/workflow execution;
- confirmation no live Graph/PnP/SharePoint REST/external system runtime;
- recommended next prompt: `07_Prompt_Closeout_Validation.md`.

## Suggested Commit Summary

```text
feat(pcc): add document control review summary
```

## Suggested Commit Description

```text
Adds HB Document Control Center Reviews & Approvals summary rendering from the document-control read model, including review types, review states, queue items, and assigned role display.

No live approval execution, workflow mutation, backend write routes, Graph/PnP/SharePoint REST calls, external system runtime, package changes, lockfile changes, SPFx packaging, or deployment behavior is introduced.
```
