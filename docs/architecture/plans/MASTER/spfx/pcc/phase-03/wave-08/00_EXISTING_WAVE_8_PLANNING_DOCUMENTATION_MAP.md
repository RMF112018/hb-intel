# Existing Wave 8 Planning Documentation Map

Repository: `RMF112018/hb-intel`  
Local path: `/Users/bobbyfetting/hb-intel`  
Target: **PCC Phase 3 / Wave 8 — Project Readiness Module Framework**

## Purpose

This map tells the local code agent which existing planning, architecture, source, and test areas must be treated as repo truth before editing Wave 8 files.

Prompt 01 must verify this map against the current local repo before modifying files. Repo truth controls if anything below is stale.

## Core PCC architecture docs

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `docs/architecture/blueprint/sp-project-control-center/README.md` | Entry point and blueprint index. | Inspect/read-only unless Prompt 01 identifies a narrow index update. |
| `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Governing PCC target architecture. | Inspect; edit only if Wave 8 identity/scope is stale. |
| `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` | Project site/template governance and source-of-record assumptions. | Inspect; avoid edits unless Wave 8 source-of-record language is inconsistent. |
| `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md` | High-level phase/wave roadmap. | Inspect; edit only for Wave 8 authorization/scope consistency. |

## Phase 3 governing docs

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md` | Product journey, surface model, and readiness surface context. | Inspect; edit only if Wave 8 framework/shell language is stale. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` | Canonical wave alignment table and readiness wave grouping. | Inspect; edit only if Prompt 01 authorizes implementation scope clarification. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md` | Module sequencing and implementation posture. | Inspect; edit only for Wave 8 scope-lock clarification. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md` | Module registry language and downstream readiness module boundaries. | Inspect; edit only if Wave 8/Wave 9/Waves 10–14 references are contradictory. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md` | MVP scope reference and exclusions. | Inspect/read-only unless scope correction is required. |

## Wave 8 planning docs

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/` | Current-state Wave 8 blueprint folder. | Preferred location for Prompt 01 scope-lock and Prompt 07 closeout docs. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md` | Current Wave 8 scope lock. It correctly defines framework identity but currently contains implementation-exclusion language that Prompt 01 must reconcile. | Prompt 01 may update this file if repo truth confirms implementation is now authorized. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-08/` | Canonical plan-library source. | Inspect/read-only. Do not edit unless the prompt explicitly authorizes plan-library updates. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-08/_doc-updates/01_Repo_Truth_And_Scope_Lock.md` | Prior repo-truth/scope-lock planning prompt. | Inspect/read-only. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-08/_doc-updates/02_Wave_8_Documentation_Target_Definition.md` | Prior target definition prompt. | Inspect/read-only. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-08/_doc-updates/03_PCC_Persona_Set_Alignment.md` | Persona alignment context. | Inspect/read-only unless Prompt 02 updates models under `packages/models`. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-08/_doc-updates/04_Cross_Document_Consistency_And_Validation.md` | Cross-doc consistency guidance. | Inspect/read-only. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-08/_doc-updates/05_Fresh_Reviewer_Prompt.md` | Review posture. | Inspect/read-only. |

## Downstream Wave 9 docs and checklist sources

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md` | Defines downstream Wave 9 checklist/lifecycle module. | Inspect/read-only to prevent Wave 8 from absorbing Wave 9 scope. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md` | Wave 9 item-library crosswalk. | Inspect/read-only. Do not import/checklist-code Wave 9 items in Wave 8. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/` | Startup/Safety/Closeout definition sources for Wave 9. | Inspect/read-only for boundary clarity only. |
| `docs/reference/example/Project_Startup_Checklist.pdf` | Wave 9 default source. | Read-only; do not parse/implement in Wave 8. |
| `docs/reference/example/Project_Safety_Checklist.pdf` | Wave 9 default source. | Read-only; do not parse/implement in Wave 8. |
| `docs/reference/example/Project_Closeout_Checklist.pdf` | Wave 9 default source. | Read-only; do not parse/implement in Wave 8. |

## Shared model areas

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `packages/models/src/pcc/PccReadModels.ts` | Add readiness read-model envelope type and response map entry after Prompt 01 authorization. | Prompt 02 may edit. |
| `packages/models/src/pcc/index.ts` | Export new readiness framework types/fixtures. | Prompt 02 may edit. |
| `packages/models/src/pcc/PccMvpSurfaces.ts` | Existing `project-readiness` surface metadata. | Inspect; avoid broad renaming unless authorized. |
| `packages/models/src/pcc/PccUserRoles.ts` | Persona vocabulary. | Prompt 02 may update only if needed and tests prove consistency. |
| `packages/models/src/pcc/PccCapabilities.ts` | Capability vocabulary. | Prompt 02 may update only with minimal, read-model-safe capabilities. |
| `packages/models/src/pcc/fixtures/` | Deterministic fixture source area. | Prompt 02 may add readiness fixtures. |
| `packages/models/package.json` | Package scripts. | Inspect; do not edit unless repo truth requires. |

## Backend read-model areas

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` | Mock provider extension point. | Prompt 03 may edit after Prompt 02. |
| `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts` | Provider interface boundary if present. | Prompt 03 may edit after verifying repo truth. |
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` | GET-only route registration. | Prompt 03 may add a read-only readiness route if Prompt 01 authorizes. |
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` | Route guardrail tests. Existing test expects exactly eight routes; Prompt 03 should update to nine only with explicit readiness route addition. | Prompt 03 may edit. |
| `backend/functions/package.json` | Package scripts. | Inspect; do not edit unless repo truth requires. |

## SPFx PCC app areas

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `apps/project-control-center/src/api/pccReadModelClient.ts` | Inert/typed client boundary. | Prompt 04 may add readiness client method/path. |
| `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` | Fixture read-model client if present. | Prompt 04 may extend for readiness fixture parity. |
| `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` | Routes `project-readiness` surface. | Prompt 05 may update only as needed. |
| `apps/project-control-center/src/surfaces/projectReadiness/` | Current Project Readiness preview surface. | Prompts 05–06 may replace/enhance. |
| `apps/project-control-center/src/surfaces/projectHome/` | Pattern reference for card/bento composition. | Inspect/reuse patterns. |
| `apps/project-control-center/src/surfaces/teamAccess/` | Pattern reference for read-model client threading and guardrails. | Inspect/reuse patterns. |
| `apps/project-control-center/src/surfaces/documents/` | Pattern reference for degraded/source-state and multi-lane composition. | Inspect/reuse patterns. |
| `apps/project-control-center/src/tests/` | SPFx tests. | Prompts 04–06 may add/update targeted tests. |
| `apps/project-control-center/package.json` | Package scripts. | Inspect; do not edit unless repo truth requires. |

## UI / SPFx standards

| Path | Use in Wave 8 | Posture |
| --- | --- | --- |
| `docs/reference/ui-kit/` | UI doctrine and scoring. | Inspect/read-only unless Prompt 07 cites validation posture. |
| `docs/reference/ui-kit/doctrine/` | Doctrine precedence. | Inspect/read-only. |
| `docs/reference/spfx-surfaces/` | SPFx surface standards. | Inspect/read-only. |

## Local validation commands to verify before execution

Prompt 01 must verify package names and scripts before relying on them. Expected current commands are:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
```

## Plan-library guard

Treat `docs/architecture/plans/**` as a canonical plan library. Do not edit it casually. Prefer implementation/current-state documentation under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
```
