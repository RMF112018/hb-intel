# PCC Phase 1 Step 2 Prompt Package

## Purpose

This package instructs a local code agent to execute:

```text
Phase 1 Step 2 — Enum and Validation Rule Extraction
```

Phase 1 Step 1 created the `@hbc/project-site-template` scaffold. Phase 1 Step 2 populates only the two cross-cutting schema families that must be resolved before broader object-family extraction:

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
```

It may also update the root scaffold contract and documentation notes to reflect Step 2 completion.

## Prompt Files

| File | Use |
|---|---|
| `01_Phase_1_Step_2_Enum_and_Validation_Rule_Extraction.md` | Primary execution prompt. Populates the enums and validation-rules family schemas. |
| `02_Phase_1_Step_2_Status_Naming_Reconciliation_If_Required.md` | Optional prompt if scaffold-local `mvp_status` naming conflicts with Phase 0 Decision Closure status taxonomy. |
| `03_Phase_1_Step_2_Architecture_Gap_Escalation_If_Required.md` | Optional prompt if extraction exposes a true undecided architecture point. |
| `04_Phase_1_Step_2_Closeout_Validation.md` | Closeout validation prompt. |
| `05_Phase_1_Step_2_Final_Commit_Summary.md` | Final commit-summary helper prompt. |
| `COMMIT_MESSAGE.md` | Suggested commit message. |

## Key Guardrail

Phase 1 Step 2 may populate enum and validation-rule schemas only. It must not populate the remaining 12 family schemas, implement provisioning, implement backend code, implement SPFx code, add Procore integration code, add CI/tooling, or create generated artifacts.

## Expected Next Step

After successful closeout:

```text
Phase 1 Step 3 — Object Family Field Consolidation
```
