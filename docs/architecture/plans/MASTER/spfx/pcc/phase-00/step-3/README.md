# PCC Phase 0 Step 2 Closeout Validation Prompt Package

## Purpose

This package instructs a local code agent to validate and close out:

```text
Phase 0 Step 2 — Schema Extraction Plan and Object Catalog Disposition
```

The closeout confirms whether the Step 2 deliverables are complete, bounded, internally consistent, and ready for review before Phase 1 begins.

This package is designed for the current PCC phase-0 sequence:

1. Phase 0 Step 1 — Architecture Stabilization Audit
2. Phase 0 Step 2 — Schema Extraction Plan and Object Catalog Disposition
3. Phase 0 Step 2 — Closeout Validation
4. Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton

## Prompt Files

| File | Use |
|---|---|
| `01_Phase_0_Step_2_Closeout_Validation.md` | Primary prompt. Validates the Step 2 deliverables and creates the closeout report. |
| `02_Phase_0_Step_2_Closeout_Remediation_If_Validation_Fails.md` | Optional prompt. Use only if Prompt 01 finds missing/malformed Step 2 documentation. |
| `03_Phase_0_Step_2_Final_Commit_Summary.md` | Helper prompt for final commit summary and description after closeout. |
| `COMMIT_MESSAGE.md` | Suggested commit message. |

## Expected Output Location

The closeout report should be created under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/
```

Expected file:

```text
Phase_0_Step_2_Closeout_Report.md
```

## Required Step 2 Inputs

Prompt 01 assumes these files exist:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

Prompt 01 should also reference the Step 1 deliverables:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
```

## Guardrail

This package is documentation-only. It must not create schemas, code, SPFx files, backend files, manifests, tests, provisioning scripts, generated artifacts, package-version changes, or `packages/project-site-template/`.

Phase 1 may create `packages/project-site-template/` only after review acceptance and a separate Phase 1 prompt.
