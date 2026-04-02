# Prompt-05 — Preview, Dry-Run, and Impact-Summary Pipeline

## Objective

Implement the reusable preview/dry-run/impact-summary pipeline that high-risk admin actions will use before actual execution.

## Important execution rules

- Reuse the shared contracts from Prompt-03.
- Use backend enforcement from Prompt-04.
- Design this as a reusable pattern, not as hard-coded provisioning-only logic.
- Dry-run should be used where technically possible; where not possible, expose a truthful preview/impact explanation instead of pretending a dry-run exists.

## Scope of work

Implement the minimal reusable end-to-end path for:

- generating preview metadata,
- generating dry-run results where available,
- generating impact summaries,
- returning “why preview is required” information,
- returning “why dry-run is unavailable” information where applicable,
- linking preview output to later execution evidence.

## Deliverables

1. Backend support for preview/dry-run/impact result generation
2. Frontend/admin-domain integration seam(s) for consuming those results
3. A new doc:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-preview-pipeline.md`

## Required behavior

A risky action should be able to surface at least:
- intended target(s),
- scope boundaries,
- likely writes/changes,
- likely side effects,
- high-level dependency impact,
- destructive or tenant-sensitive warnings,
- recommended follow-up validation checks,
- available recovery path or limitation warning.

## Truthfulness rule

If the system cannot calculate a certain preview element accurately:
- do not fake it,
- label the limitation explicitly,
- and return the limitation in a structured way so the UI can present it clearly.

## Validation

Run the smallest relevant checks for any touched packages:
- `@hbc/functions`
- `@hbc/features-admin`
- `@hbc/spfx-admin`
- `@hbc/models`

Use only the subset justified by the touched scope.

## Completion condition

Stop after the pipeline, docs, and validation are complete.
