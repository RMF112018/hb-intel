# PCC Phase 1 Step 5 Prompt Package

## Purpose

This package instructs a local code agent to execute:

```text
Phase 1 Step 5 — Schema Validation Harness and Contract Integrity Checks
```

Phase 1 Step 4 populated all 14 Project Site Template schema families. Step 5 creates the validation harness, representative instance set, integrity checks, and closeout gate required before the machine-readable contract can be treated as fully extracted.

## Current Phase 1 State

As of Phase 1 Step 4 closeout:

- all 14 schema families are populated;
- `template-contract.json` marks all 14 families `status: "populated"`;
- `status.fullExtractionComplete` remains `false`;
- no backend, SPFx, provisioning, CI, generated artifacts, deployment artifacts, or runtime consumers exist;
- Phase 1 Step 5 is the next required step.

## Prompt Files

| File | Use |
|---|---|
| `01_Phase_1_Step_5_Harness_Strategy_and_Scope.md` | Read first. Defines scope, harness design, allowed files, and validation gates. |
| `02_Phase_1_Step_5_Create_Validation_Harness.md` | Creates package-local validation harness, representative instances, and integrity checks. |
| `03_Phase_1_Step_5_Run_Harness_and_Remediate_Schema_Defects.md` | Runs the harness and allows narrowly scoped schema fixes if validation exposes mechanical schema defects. |
| `04_Phase_1_Step_5_Closeout_and_Full_Extraction_Gate.md` | Creates closeout report and flips `fullExtractionComplete` only if all harness checks pass. |
| `05_Phase_1_Step_5_Architecture_Gap_Escalation_If_Required.md` | Optional escalation if validation reveals a true architecture issue. |
| `06_Phase_1_Step_5_Final_Commit_Summary.md` | Final commit-summary helper. |
| `COMMIT_MESSAGE.md` | Suggested commit message. |

## Non-Negotiable Guardrail

Step 5 may add validation tooling and representative test instances **inside `packages/project-site-template/` only**. It must not implement backend provisioning, SPFx, SharePoint/Graph calls, Procore integration, runtime consumers, deployment, package publishing, or CI.

## Expected Next Step

After successful Step 5 closeout:

```text
Phase 1 Final Review / Phase 2 Entry Planning — Provisioning Foundation Readiness
```

Do not begin Phase 2 implementation in this package.
