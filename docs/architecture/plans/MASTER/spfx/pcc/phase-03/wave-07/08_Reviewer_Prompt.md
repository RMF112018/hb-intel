# 08 — Reviewer Prompt: Audit Completed Wave 7 Implementation

## Role

You are a fresh reviewer session acting as a senior software architecture and implementation-quality reviewer for the `hb-intel` repository.

Your task is to audit the completed **Project Control Center Phase 3 / Wave 7 — HB Document Control Center** implementation.

Do not implement new code unless the user explicitly asks you to generate a remediation prompt. Your job is to determine whether the implementation passes or fails against the approved scope.

## Repository

```text
https://github.com/RMF112018/hb-intel.git
Expected local path: /Users/bobbyfetting/hb-intel
```

## Objective

Conduct a repo-truth audit of the completed Wave 7 implementation and provide:

1. pass/fail finding;
2. evidence;
3. defects;
4. remediation recommendations;
5. if needed, a follow-up local-agent prompt package.

## Mandatory Preflight

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record:

- current branch;
- current HEAD;
- uncommitted changes;
- recent Wave 7 commits;
- lockfile checksum.

Do not re-read files that are still within current context or memory.

## Audit Areas

### 1. Governing Scope

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
```

Confirm:

- Wave 7 = HB Document Control Center.
- Responsibility Matrix remains Wave 11.
- Three-lane model is used:
  - Project Record
  - My Project Files
  - External Systems.
- Closeout docs accurately state implemented and excluded scope.

### 2. SPFx Fixture / Read-Model Parity

Inspect:

```text
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/DocumentControl.ts
```

Confirm:

- SPFx fixture `getDocumentControl()` includes additive Wave 7 fields.
- Legacy `sources` compatibility remains.
- No live HTTP/auth/API runtime introduced.
- Backend and SPFx fixture shape are materially aligned.

Required fields:

```text
sources
wave7LaneVocabulary
sourceRegistry
sourceHealth
sourceHealthStates
reviewStates
reviewTypes
hardNoRules
roleActionAvailability
actionCatalog
reviewQueueSample
```

### 3. Three-Lane UI

Inspect:

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
```

Confirm:

- Header renders HB Document Control Center.
- Project Record lane renders.
- My Project Files lane renders.
- External Systems lane renders.
- My Project Files warning renders.
- Root My Project Files browsing is not rendered.
- Other-project folders are not rendered.
- No live external launch links.
- No live file actions.
- Bento/grid invariants remain intact.

### 4. Permission / Action Guardrails

Confirm:

- Role/action availability renders from read-model data.
- R01–R23 vocabulary is respected where represented.
- PR/MP/SB/EX/WF families render or are otherwise visible.
- Project Coordinator is present.
- Project Engineer is absent.
- `EX04` is unavailable/forbidden/not allowed.
- Hard-no rules render.
- UI does not enforce runtime authorization locally.

### 5. Source / Degraded States

Confirm safe handling for:

- missing-config
- access-issue
- source-unavailable
- throttled
- partial-results
- pending-initialization
- folder-creation-failed
- disabled
- empty state

Confirm:

- no raw Graph/API errors leak;
- no live source repair/revalidation;
- no live OneDrive folder creation.

### 6. Reviews & Approvals Summary

Confirm:

- review types render from read model;
- review states render from read model;
- queue items render safely;
- assigned roles render safely;
- no live approve/reject/return/reassign behavior;
- no workflow mutation.

### 7. Import / Runtime Guardrails

Search for prohibited runtime additions in the Wave 7 touched areas:

```bash
rg -n "MSGraphClient|GraphServiceClient|@microsoft/microsoft-graph-client|sp\.web|_api/web|@pnp/sp|ProcoreClient|DocumentCrunchClient|AdobeSignClient|createUploadSession|createLink|driveItem|permissions" apps/project-control-center/src/surfaces/documents apps/project-control-center/src/api
```

Confirm no prohibited runtime imports or calls were introduced.

Product words in display copy are acceptable. Runtime SDK/import/call paths are not.

### 8. Package / Lockfile / Deployment Guardrails

Confirm:

- no dependency additions;
- no `pnpm-lock.yaml` change;
- no SPFx manifest/package-solution changes unless explicitly authorized;
- no `.sppkg`;
- no deployment/workflow changes;
- no secrets/app settings.

## Validation Commands

Run targeted validation:

```bash
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
git diff --check
md5 pnpm-lock.yaml
```

If a command fails due to pre-existing unrelated issues, isolate whether the failure is caused by Wave 7 changes.

## Pass Criteria

Wave 7 passes only if all are true:

- SPFx fixture/read-model parity is implemented.
- Three-lane UI renders from read-model data.
- My Project Files guardrails are proven by tests.
- External Systems remain launch/status only.
- Permission/action guardrails render.
- `EX04` is unavailable/forbidden.
- Project Coordinator is present.
- Project Engineer is absent.
- Reviews & Approvals summary renders without live workflow execution.
- Source/degraded states render safely.
- No live Graph/PnP/SharePoint REST/Procore/Adobe/Document Crunch runtime introduced.
- No package/lockfile/deployment/tenant/secrets changes.
- Closeout docs accurately describe scope and exclusions.
- Targeted tests and type checks pass, or failures are clearly unrelated and documented.

## Fail Criteria

Wave 7 fails if any are true:

- Documents surface remains primarily two-lane.
- SPFx fixture client still returns only legacy `sources`.
- Root My Project Files or other-project folders can render.
- External writeback/sync/mirror is enabled or implied.
- `EX04` appears enabled.
- Project Engineer is introduced as a Wave 7 role.
- Live file operations are added.
- Direct SPFx Graph/PnP/SharePoint REST runtime is added.
- Procore/Adobe/Document Crunch runtime is added.
- Lockfile/package/deployment/manifest changes occur without explicit authorization.
- Closeout docs omit major exclusions.

## Reviewer Output Format

Return:

```md
# Wave 7 Reviewer Findings

## Verdict

Pass / Fail / Conditional Pass

## Evidence Summary

- ...

## Defects

| Severity | Finding | Evidence | Required Fix |
|---|---|---|---|

## Guardrail Check

| Guardrail | Status | Evidence |
|---|---|---|

## Validation Results

- ...

## Recommended Remediation

- ...

## Suggested Next Prompt

- ...
```
