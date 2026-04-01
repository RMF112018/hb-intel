# Prompt-01 — Phase 6: Repo-Truth Data Contract and SharePoint Schema Audit

## Objective

Conduct a comprehensive repo-truth audit of the Project Setup request-record contract and the SharePoint `Projects` list schema usage. The purpose of this prompt is to establish exactly what the live repo currently persists, maps, reads, and assumes.

## Required working approach

1. Audit the live repo implementation with emphasis on:
   - `backend/functions/src/services/project-requests-repository.ts`
   - `backend/functions/src/services/projects-list-contract.ts`
   - `backend/functions/src/services/projects-list-mapper.ts`
   - `backend/functions/src/functions/projectRequests/*`
   - any Project Setup model interfaces in `@hbc/models`
   - any related repo docs defining `Projects` list fields or request lifecycle persistence

2. Identify:
   - every Project Setup request field currently persisted
   - every SharePoint list field currently read or written
   - all internal-name vs display-name assumptions
   - all identifier fields and how they are used
   - lifecycle, clarification, completion, and provisioning-linkage fields
   - any ambiguous, legacy, or fallback mapping behavior

3. Determine whether the current implementation depends on:
   - imported generic fields such as `field_*`
   - explicit internal names such as `ProjectId`, `ProjectNumber`, etc.
   - mixed mapping strategies
   - optional compatibility handling
   - undocumented assumptions

4. Produce an audit report saved to:
   - `docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

## Required report structure

- Executive summary
- Confirmed repo implementation facts
- Confirmed field inventory
- Confirmed identifier usage model
- Confirmed SharePoint internal-name / display-name mapping behavior
- Schema ambiguity and drift risks
- Missing or under-documented contract areas
- Recommended correction priorities
- Explicit unresolved questions

## Rules

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not propose fixes yet beyond clearly labeled recommended priorities.
- Use direct repo evidence throughout.
