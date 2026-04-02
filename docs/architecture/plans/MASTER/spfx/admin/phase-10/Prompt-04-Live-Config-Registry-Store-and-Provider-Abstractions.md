# Prompt-04 — Live Config Registry Store and Provider Abstractions

## Objective

Implement the backend foundations for the live admin-maintained standards/configuration store.

This prompt establishes the provider abstraction and persistence implementation for non-secret live overrides and version metadata.

## Important execution rules

- Preserve current repo-native persistence patterns where they are already healthy.
- Do not force a new cloud dependency into the repo unless the codebase already clearly supports it and the change is justified.
- Do not store secrets in the live store.
- Keep the design future-compatible with alternate providers.

## Inputs

Use:
- the Prompt-01 audit
- the Prompt-02 baseline
- the Prompt-03 catalog model
- current backend persistence/service seams, especially:
  - `backend/functions/src/services/table-storage-service.ts`
  - `backend/functions/src/services/service-factory.ts`
  - relevant run/audit patterns already present in backend functions

## Required implementation work

Implement:

1. a provider abstraction for live config persistence
2. a default repo-native provider implementation
3. typed models for:
   - live config record
   - draft/published version
   - metadata/provenance anchors
4. service-factory registration / composition wiring
5. minimal tests for persistence round-trips and basic invariants

## Required design constraints

- separate “catalog definition” from “stored override value”
- support draft vs published distinction if the baseline calls for it
- support environment / scope fields where required
- support future history retrieval without redesign
- never store secret values in this store
- distinguish raw value payload from version/audit metadata

## Suggested output areas

Use repo-truth-consistent locations such as:
- `backend/functions/src/config/**`
- `backend/functions/src/services/**`
- `backend/functions/src/types/**`
- `backend/functions/test/**` or equivalent

## Documentation requirement

Update or create phase-10 implementation notes documenting:
- chosen provider abstraction
- storage shape
- why this implementation fits current repo truth

## Validation requirement

Run focused tests only for the touched config persistence/service surfaces.

## Completion condition

Stop when the live store/provider layer is in place, typed, wired, and test-covered enough for later prompts to build on.
