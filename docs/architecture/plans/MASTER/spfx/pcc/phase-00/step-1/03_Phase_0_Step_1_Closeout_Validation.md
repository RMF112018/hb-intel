# Prompt 03 — Phase 0 Step 1 Closeout Validation

Run this prompt after Prompt 01 and, if applicable, Prompt 02.

## Objective

Validate that Phase 0 Step 1 is complete, bounded, and ready for review.

This is a closeout-only prompt. Do not make additional substantive changes unless a required output is missing or malformed.

Do **not** modify code, schemas, SPFx files, backend files, manifests, tests, provisioning scripts, package versions, generated files, or implementation files.

Do **not** re-read files that are still within your current context or memory unless you need to verify exact edit locations, resolve a contradiction, or confirm repo truth.

---

## Required Files

Confirm these files exist:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
```

If Prompt 02 was run, also confirm any governing documentation updates are reflected in the audit closeout.

---

## Validation Checklist

Confirm:

| Check | Required Result |
|---|---|
| Required Phase 0 Step 1 files exist | Yes |
| Audit references `Standard_Project_Site_Template_Contract.md` | Yes |
| Audit references `HB_Project_Control_Center_Target_Architecture_Blueprint.md` | Yes |
| Audit evaluates README if present | Yes |
| Audit evaluates roadmap if present | Yes |
| Audit evaluates Procore model package README if present | Yes |
| Consistency register includes ProjectType checks | Yes |
| Consistency register includes ProjectStage checks | Yes |
| Consistency register includes ProjectStatus checks | Yes |
| Consistency register includes Procore checks | Yes |
| Consistency register includes Team & Access checks | Yes |
| Consistency register includes Decision Closure Register checks | Yes |
| Backlog distinguishes required work types | Yes |
| Backlog defines Phase 1 entry criteria | Yes |
| Obsolete active enum values are not reintroduced | Yes |
| `active_construction` is not used as ProjectType | Yes |
| ProcoreCompanyId remains configuration, not secret | Yes |
| No Procore secrets introduced | Yes |
| SPFx direct Procore calls remain prohibited | Yes |
| Sage Intacct remains accounting book of record | Yes |
| No code files changed | Yes |
| No schema files changed | Yes |
| No SPFx files changed | Yes |
| No backend files changed | Yes |
| No manifests changed | Yes |
| No tests changed | Yes |
| No provisioning scripts changed | Yes |

---

## Required Closeout Report

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Closeout_Report.md
```

Required sections:

```markdown
# Phase 0 Step 1 — Closeout Report

## Summary
## Files Created
## Files Modified
## Validation Results
## Schema Extraction Readiness Decision
## Remaining Blockers
## Remaining Risks
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

## Schema Extraction Readiness Decision

Use one of:

```text
Ready for Phase 1
Ready for Phase 1 with Non-Blocking Notes
Not Ready for Phase 1
```

Explain the decision in plain language.

## Recommended Next Prompt

If ready, recommend the next prompt as:

```text
Phase 0 Step 2 — Schema Extraction Plan and Object Catalog Disposition
```

If not ready, recommend the specific architecture stabilization prompt needed first.

## Suggested Commit Message

```text
docs(sp-project-control-center): close phase 0 architecture stabilization audit
```
