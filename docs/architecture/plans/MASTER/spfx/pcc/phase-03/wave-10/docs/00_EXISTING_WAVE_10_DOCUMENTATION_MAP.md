# Existing Wave 10 Documentation Map

## Authoritative Wave 10 Documentation Package

These files form the current Wave 10 planning and documentation authority:

| File | Purpose | Implementation Relevance |
| --- | --- | --- |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md` | Primary Wave 10 target architecture | Source for models, lanes, statuses, transition rules, guardrails, acceptance criteria |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Permit_Inspection_Control_Center_Scope_Lock.md` | Scope lock | Confirms architecture-to-implementation boundaries and out-of-scope runtime behavior |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Resolved_Decisions_Register.md` | Resolved decisions | Locks module name, internal families, target-added fields, AHJ/Procore posture |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md` | Workbook mapping appendix | Maps permit and inspection workbook columns to target model fields |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md` | Documentation closeout | Confirms documentation-only prior state and no runtime implementation |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` | Phase 3 roadmap | Confirms Wave 10 identity and dependencies |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md` | Module implementation plan | Confirms Wave 10 implementation sequence and Wave 8 dependency |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md` | Workflow module register | Must be checked for stale Permit Log references |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md` | MVP scope register | Must be checked for Wave 10 scope consistency |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md` | Product architecture / user journey | Must remain aligned with unified command-center posture |
| `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Governing PCC architecture | Must not contradict Wave 10 scope and external-system boundaries |

## Repo-Resident Workbook References

The local code agent must inspect these if import/mapping details need verification:

| File | Purpose |
| --- | --- |
| `docs/reference/example/Permit_Log_Template.xlsx` | Current company permit log template |
| `docs/reference/example/Inspection-Log-Template.xlsx` | Current company inspection log template |

Do not edit these source workbook files.

## Current Implementation Scaffolding to Audit

| Area | Paths |
| --- | --- |
| Models | `packages/models/src/pcc/` |
| Backend read model | `backend/functions/src/hosts/pcc-read-model/` |
| Backend tests | `backend/functions/src/services/__tests__/`, `backend/functions/src/hosts/pcc-read-model/*.test.ts` |
| SPFx surfaces | `apps/project-control-center/src/surfaces/` |
| SPFx API clients | `apps/project-control-center/src/api/` |
| SPFx fixtures | `apps/project-control-center/src/fixtures/` if present |
| SPFx components | `apps/project-control-center/src/components/`, `src/layout/`, `src/ui/`, `src/shell/` |
| Package scripts | `apps/project-control-center/package.json`, `packages/models/package.json`, `backend/functions/package.json`, `package.json` |

## Known Repo-Truth Issues to Verify Locally

These were identified during remote audit and must be verified in local repo before edits:

1. `packages/models/src/pcc/WorkflowModules.ts` may still expose `permits.displayName` as `Permit Log`.
2. `packages/models/src/pcc/ProjectReadinessFramework.ts` may still use `permit-log` as the Project Readiness source module ID.
3. `packages/models/src/pcc/PccReadModels.ts` may not yet include a Wave 10 read-model key.
4. `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts` may not yet include a Wave 10 provider method.
5. `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` may not yet include a Wave 10 GET route.
6. `apps/project-control-center/src/api/pccReadModelClient.ts` may not yet include a Wave 10 route/client method.
7. `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` may still be a placeholder surface.
