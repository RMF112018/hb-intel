# Prompt 12 — Phase 2 Canonical Contract and Schema Reconciliation

## Objective
Resolve the Phase 2 audit finding that the real Project Setup persistence contract is incomplete by reconciling the canonical setup-request model, the real SharePoint `Projects` list schema, and the production mapper/repository path.

This prompt assumes the exported SharePoint `Projects` list schema has now been updated to include the Phase 2 gap fields that were previously missing. Your job is to verify that in repo truth, then align the code to it.

## Architecture posture you must preserve
Treat the target architecture as:
- shared backend service patterns and libraries inside the monorepo
- thin domain-specific composition roots / backend hosts
- truthful, explicit domain boundaries
- no duplicated backend codebases
- no unrelated persistence assumptions leaking into Project Setup

For this prompt, focus on the **Phase 2 persistence contract** only.

## Critical instructions
- Use the live repo as the implementation source of truth.
- Treat the attached/exported SharePoint `Projects` list schema as the source of truth for available list fields.
- Do **not** assume the prior Phase 2 audit findings are still fully accurate; verify them against current repo truth before changing code.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not widen scope into unrelated domain work.
- Do not “paper over” the mismatch by only updating docs. The code, tests, and docs must all agree.

## Audit finding being addressed
Phase 2 was previously assessed as only partial because:
- `IProjectSetupRequest` contained fields not persisted by the real SharePoint adapter
- the mapper covered only the legacy `Projects` list contract
- the real persistence path could drop user-entered fields
- a mock-based test could overstate persistence completeness

The newly exported schema is intended to close the list-schema side of that gap. Verify that first.

## Required repo-truth verification
Before making implementation changes, verify and document whether the current SharePoint schema now includes all of the following fields, or their approved canonical equivalents:

- `officeDivision`
- `procoreProject`
- `clarificationRequestedAt`
- `requesterRetryUsed`
- `clarificationItems`
- `projectStreetAddress`
- `projectCity`
- `projectCounty`
- `projectState`
- `projectZip`
- `projectExecutiveUpn`
- `projectManagerUpn`
- `leadEstimatorUpn`
- `supportingEstimatorUpns`
- `additionalTeamMemberUpns`
- `timberscanApproverUpn`

Also verify whether any additional Project Setup fields now exist in the schema and should be treated as canonical persisted fields.

## Implementation tasks
1. Reconcile the canonical Project Setup request contract against the updated SharePoint schema.
   - Inspect the current live request shape in the canonical model(s).
   - Identify fields that are:
     - canonical and must persist
     - intentionally transient and should remain non-persisted
     - ambiguous and require explicit code comments / documentation
   - Produce a final persisted-field decision table in code comments or adjacent docs where appropriate.

2. Update the real SharePoint field contract.
   - Modify the real Project Setup / Projects list field contract so it reflects the updated SharePoint list schema.
   - Use stable, explicit field constants.
   - Eliminate any stale assumptions that those fields do not exist.

3. Update the mapper and normalization layer.
   - Ensure the real mapper now round-trips all canonical persisted Phase 2 fields.
   - Preserve backward compatibility for legacy rows that predate the new columns where reasonable.
   - Add safe defaults / undefined handling rather than creating brittle required assumptions too early.

4. Update repository read/write behavior.
   - Ensure the real repository adapter persists and rehydrates the full canonical persisted field set.
   - Keep the production path authoritative.
   - Do not rely on mock repositories as proof of production persistence.

5. Add explicit inline code comments where they materially reduce future ambiguity.
   - Especially for fields that remain intentionally transient.

## Files likely in scope
Adjust only what repo truth requires, but likely areas include:
- `packages/models/src/provisioning/IProvisioning.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- `backend/functions/src/services/project-requests-repository.ts`
- any nearby serialization / normalization helpers
- any Phase 2 plan or review docs that need truthful update after implementation

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 2 progress note** that:
- states the SharePoint schema was re-verified against repo truth
- lists which formerly missing fields are now present in the exported list schema
- states which fields are now persisted by the real adapter
- states which fields, if any, remain intentionally transient
- includes exact evidence references to changed repo files

Also add a **closure statement draft** for the specific prior finding:
- “The Phase 2 persistence gap was caused partly by list-schema absence and partly by code-path incompletion. The list schema now exposes the required fields, and the real mapper/repository path has been updated to persist the canonical Project Setup field set.”

Do **not** declare full Phase 2 closure unless the code and tests support it.

## Evidence requirements
When you finish, update the review doc with:
- progress notes
- closure statement status
- evidence bullets citing exact files changed
- remaining open questions, if any

## Acceptance criteria
- The updated schema is verified, not assumed.
- The real SharePoint field contract matches the updated list schema.
- The production mapper/repository path persists the canonical Phase 2 fields.
- Legacy-row handling is safe.
- The review doc is updated with truthful progress notes and evidence.
- No unsupported “complete” language is introduced.
