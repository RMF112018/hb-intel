# Prompt-03 — Phase 6: SharePoint Mapper and Persistence Hardening

## Objective

Harden the SharePoint mapping and repository implementation so Project Setup reads/writes the canonical request-record contract safely and deterministically.

## Required work

1. Update the SharePoint contract / mapper / repository implementation as needed to:
   - match the frozen canonical contract
   - remove unsafe ambiguity where possible
   - preserve production compatibility where necessary
   - make fallback behavior explicit rather than hidden

2. Validate and harden:
   - field selection lists
   - read mapping
   - write mapping
   - null/undefined handling
   - identifier persistence
   - lifecycle field persistence
   - site URL / completion field persistence
   - clarification-related persistence

3. Make sure the repository behavior does not:
   - alias `requestId` and `projectId` incorrectly
   - overwrite human identifiers unsafely
   - silently drop fields due to mapper mismatch
   - rely on undocumented imported column names

4. Add or update targeted tests for:
   - mapper correctness
   - identifier stability
   - legacy/internal-name compatibility
   - required field persistence

## Files likely in scope

- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- associated tests

## Documentation updates

Update the relevant docs to reflect the hardened mapping contract and note any compatibility behavior retained intentionally.
