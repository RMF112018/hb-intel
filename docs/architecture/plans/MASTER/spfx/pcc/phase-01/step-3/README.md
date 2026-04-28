# PCC Phase 1 Step 3 Prompt Package

## Purpose

This package instructs a local code agent to execute:

```text
Phase 1 Step 3 — Object Family Field Consolidation
```

Phase 1 Step 2 populated the enum and validation-rule families. Phase 1 Step 3 consolidates field maps for the remaining object families before those family schemas are populated.

This is a schema-planning and field-consolidation step. It prepares structured field inventories and disposition maps, but it must **not** populate the remaining 12 family schemas yet.

## Prompt Files

| File | Use |
|---|---|
| `01_Phase_1_Step_3_Object_Family_Field_Consolidation.md` | Primary execution prompt. Creates field-consolidation artifacts. |
| `02_Phase_1_Step_3_Status_Shorthand_Reconciliation_Plan.md` | Optional/narrow prompt if the 12 remaining family skeleton status shorthand must be planned before Step 4. |
| `03_Phase_1_Step_3_Architecture_Gap_Escalation_If_Required.md` | Optional prompt if field consolidation exposes a true undecided architecture point. |
| `04_Phase_1_Step_3_Closeout_Validation.md` | Closeout validation prompt. |
| `05_Phase_1_Step_3_Final_Commit_Summary.md` | Final commit-summary helper prompt. |
| `COMMIT_MESSAGE.md` | Suggested commit message. |

## Key Guardrail

Phase 1 Step 3 may create field inventories, field maps, extraction ledgers, and documentation. It must not populate the 12 remaining family schema files, implement runtime code, create provisioning logic, or add validation tooling.

## Expected Next Step

After successful closeout:

```text
Phase 1 Step 4 — Per-Family Schema Population
```
