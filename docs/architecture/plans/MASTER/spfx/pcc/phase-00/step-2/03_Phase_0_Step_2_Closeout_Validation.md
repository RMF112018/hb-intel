# Prompt 03 — Phase 0 Step 2 Closeout Validation

Run this prompt after Prompt 01, and after Prompt 02 only if Prompt 02 was required.

## Objective

Validate that Phase 0 Step 2 is complete, bounded, and ready for review.

This is a closeout-only prompt. Do not make additional substantive changes unless a required output is missing, malformed, or contradicts the Prompt 01 scope.

Do **not** modify code, schemas, SPFx files, backend files, manifests, tests, provisioning scripts, package versions, generated files, or implementation files.

Do **not** create `packages/project-site-template/`.

Do **not** create schemas.

Do **not** re-read files that are still within your current context or memory unless exact evidence is required.

---

## Required Files

Confirm these files exist:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
```

If Prompt 02 was required, also confirm:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Architecture_Gap_Escalation_Register.md
```

---

## Validation Checklist

Confirm:

| Check | Required Result |
|---|---|
| Four Step 2 planning files exist | Yes |
| Object Catalog Disposition covers every Contract Object Catalog row | Yes |
| Schema Family Taxonomy defines each proposed schema family | Yes |
| Validation Rule Table Plan includes all required rule categories | Yes |
| Phase 1 handoff is explicit | Yes |
| Phase 1 is prohibited from introducing new architecture decisions | Yes |
| Deprecated enum values are not reintroduced as active values | Yes |
| `active_construction` is not used as ProjectType | Yes |
| ProcoreCompanyId remains configuration, not secret | Yes |
| SPFx direct Procore calls remain prohibited | Yes |
| Procore secrets are not introduced | Yes |
| Sage Intacct remains accounting book of record | Yes |
| External users remain deferred from MVP | Yes |
| HBI Assistant remains deferred from MVP | Yes |
| Procore write-back remains deferred from MVP | Yes |
| No code files changed | Yes |
| No schema files changed | Yes |
| No `packages/project-site-template/` directory created | Yes |
| No SPFx files changed | Yes |
| No backend files changed | Yes |
| No manifests changed | Yes |
| No tests changed | Yes |
| No provisioning scripts changed | Yes |
| No package versions changed | Yes |

---

## Required Closeout Report

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Closeout Report

## Summary
## Files Created
## Files Modified
## Object Catalog Disposition Summary
## Schema Family Taxonomy Summary
## Validation Rule Plan Summary
## Phase 1 Readiness Decision
## Remaining Blockers
## Remaining Risks
## Validation Results
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

## Phase 1 Readiness Decision

Use one of:

```text
Ready to Open Phase 1
Ready to Open Phase 1 with Review Notes
Not Ready to Open Phase 1
```

Explain the decision in plain language.

## Recommended Next Prompt

If ready, recommend:

```text
Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton
```

If not ready, recommend the specific architecture stabilization or gap-resolution prompt needed first.

## Suggested Commit Message

```text
docs(sp-project-control-center): close phase 0 schema extraction planning
```
