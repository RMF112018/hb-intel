# Prompt-01 — Phase 6: Repo-Truth Data Contract and SharePoint Schema Audit

## Objective

Conduct a comprehensive repo-truth audit of the Project Setup request-record contract and the SharePoint `Projects` list schema usage. The purpose of this prompt is to establish exactly what the live repo currently persists, maps, reads, and assumes.

## Required working approach

1. Audit the live repo implementation with emphasis on:
   - `backend/functions/src/services/project-requests-repository.ts`
   - `backend/functions/src/services/projects-list-contract.ts`
   - `backend/functions/src/services/projects-list-mapper.ts`
   - `backend/functions/src/functions/projectRequests/index.ts`
   - `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
   - `packages/models/src/provisioning/IProvisioning.ts`
   - `packages/provisioning/src/api-client.ts`
   - `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
   - `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
   - `apps/accounting/src/router/routes.ts`
   - any current repo docs defining `Projects` list fields, request lifecycle persistence, or SharePoint schema posture

2. Identify:
   - every Project Setup request field currently persisted
   - every SharePoint list field currently read or written
   - all internal-name vs display-name assumptions
   - all identifier fields and how they are actually used
   - lifecycle, clarification, completion, and provisioning-linkage fields
   - all mixed mapping strategies
   - any ambiguous, legacy, or fallback mapping behavior
   - any stale code comments or repo docs that misdescribe the live contract

3. Determine explicitly whether the current implementation depends on:
   - imported generic fields such as `field_*`
   - explicit named columns such as `viewerUPNs`, `projectStreetAddress`, `submittedByOid`
   - mixed mapping strategies
   - optional compatibility handling
   - undocumented assumptions

4. Produce or update the audit report saved to:
   - `docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

If the file does not exist yet, create it. Treat that as an expected deliverable, not a repository defect.

## Required questions to answer

1. What exact Project Setup fields are currently persisted in SharePoint?
2. What exact SharePoint internal names does the repo currently depend on?
3. Does the repo currently implement a truly separate persisted `requestId` and `projectId` model, or an aliased one?
4. What field currently acts as the durable persisted system key?
5. How is `projectNumber` treated relative to the system key?
6. Which fields are required by code, and which are only conditionally present?
7. Which parts of the SharePoint contract are legacy/import-derived?
8. Which parts of the SharePoint contract are newer named fields?
9. What consumers depend on the current identifier and schema meaning?
10. What documentation or code comments are materially out of sync with repo truth?

## Required report structure

- Executive summary
- Confirmed repo implementation facts
- Confirmed field inventory
- Confirmed identifier usage model
- Confirmed SharePoint internal-name / display-name mapping behavior
- Mixed-schema posture inventory
- Schema ambiguity and drift risks
- Missing or under-documented contract areas
- Recommended correction priorities
- Explicit unresolved questions
- Exact files inspected

## Rules

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not propose fixes yet beyond clearly labeled recommended priorities.
- Use direct repo evidence throughout.
- Do not assume a normalized or dual-key persistence contract unless the audited repo proves it.
