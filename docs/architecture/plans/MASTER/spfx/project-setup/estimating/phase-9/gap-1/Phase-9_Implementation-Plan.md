# Phase 9 — Implementation Plan for Gap 1 SPFx Permission Declaration Resolution

## Objective

Resolve the confirmed SPFx permission declaration gap for Project Setup Requests in the smallest truthful implementation sequence possible.

## Plan overview

### Stage 1 — Freeze implementation inputs
Determine and document the exact custom API permission request values required for the SPFx package:
- API `resource`
- delegated `scope`

This stage exists to prevent a bad manifest entry based on assumption or partial repo memory.

### Stage 2 — Apply the authoritative source change
Add the `solution.webApiPermissionRequests` declaration to the authoritative estimating `package-solution.json`, preserving single-source-of-truth behavior.

### Stage 3 — Verify package-path truth
Rebuild the Project Setup SPFx package and confirm the declaration survives through:
- source config
- shell-side copied/generated config
- packaged artifact truth

### Stage 4 — Reconcile documentation truth
Update the validation/deployment documents so they accurately describe:
- the manifest declaration
- the SharePoint API access approval flow
- any remaining operator-executed prerequisites
- the true current `apiAudience` posture

### Stage 5 — Publish closure record
Produce a concise but decision-grade closure record documenting:
- exact implementation values used
- files changed
- verification performed
- unresolved external prerequisites, if any

## Dependency logic

This work must occur in order.

- **Prompt 1** must happen first because downstream implementation depends on the exact `resource` and `scope`.
- **Prompt 2** depends on Prompt 1 because the manifest entry must use frozen, evidence-backed values.
- **Prompt 3** depends on Prompt 2 because there is nothing meaningful to verify until the manifest has changed.
- **Prompt 4** depends on Prompt 3 because documentation should reflect implemented and verified truth, not planned changes.
- **Prompt 5** depends on everything before it because the final closure record must summarize actual implementation and actual verification.

## Planned prompt map

### Prompt 1
**File:** `Prompt-1-Resolve-Api-Permission-Inputs-and-Freeze-Decision.md`

Purpose:
- resolve the exact permission request inputs
- freeze the implementation decision in writing
- surface blockers if the values cannot be determined truthfully

### Prompt 2
**File:** `Prompt-2-Implement-SPFx-Permission-Declaration.md`

Purpose:
- implement the manifest declaration in the authoritative source file only
- avoid duplicated or overwritten config edits

### Prompt 3
**File:** `Prompt-3-Build-and-Verify-Package-Propagation.md`

Purpose:
- rebuild the package
- verify declaration propagation through the build/package path
- confirm no regression or stripping occurs

### Prompt 4
**File:** `Prompt-4-Reconcile-Deployment-Docs-and-apiAudience-Narrative.md`

Purpose:
- update deployment/operator docs to reflect the real approval flow
- reconcile the `apiAudience` contradiction against current repo truth

### Prompt 5
**File:** `Prompt-5-Close-Gap-1-and-Issue-Final-Implementation-Record.md`

Purpose:
- issue the final closure record
- summarize implementation, verification, and any remaining external dependencies

## Acceptance standard for the phase

Phase 9 is complete only when:
- the authoritative config is updated
- the package path is verified
- the docs are truthful and internally consistent
- the final closure record is written
- any residual operator prerequisites are explicitly separated from code completion

## Stop conditions

The agent must stop and document a blocker if:
- the exact `resource` cannot be determined truthfully
- the exact delegated `scope` cannot be determined truthfully
- the authoritative package source is not the file currently believed to be authoritative
- the packaging pipeline strips or rewrites the declaration in an unresolved way
- the `apiAudience` contradiction cannot be reconciled from current repo truth
