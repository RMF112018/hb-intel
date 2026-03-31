# Prompt 13 — Phase 2 Production-Path Mapping and Backward Compatibility

## Objective
Finish the real production-path mapping work for Phase 2 so that the Project Setup request lifecycle no longer relies on partial persistence assumptions or legacy-only field coverage.

## Critical instructions
- Work from live repo truth.
- Do not duplicate field-mapping logic in multiple places.
- Keep the real SharePoint adapter as the production source of truth.
- Preserve compatibility for older rows that do not have the new field values populated.
- Do not widen into unrelated release or auth work.

## Context
The SharePoint `Projects` list schema has been updated. The remaining risk is now code-path completeness and backward compatibility, not merely missing list columns.

The prior audit correctly called out that Phase 2 had the right seam but incomplete production persistence. This prompt is meant to close the code-path side of that gap.

## Required work
1. Review the end-to-end production path for Project Setup persistence.
   - request submission
   - repository write
   - repository read
   - any state-transition updates
   - any controller/admin reads that assume the older field set

2. Ensure the new canonical persisted fields flow correctly through the live path.
   - write path must persist them
   - read path must restore them
   - partial/legacy rows must not break page rendering or workflow transitions

3. Introduce safe backward-compatible normalization.
   - If older rows lack newly added fields, normalize to safe empty / undefined values.
   - Avoid surprising coercions.
   - Avoid brittle assumptions that every row is fully upgraded.

4. Inspect whether any adjacent code still uses legacy aggregate fields in ways that conflict with the new canonical structure.
   - example: a legacy `projectLocation` string versus structured location fields
   - decide whether to preserve both, derive one from the other, or explicitly separate them
   - document the decision in code comments where useful

5. Ensure any request update / clarification / retry path continues to preserve the full canonical persisted object.
   - No silent field loss during partial updates
   - No accidental mapper regression on non-title fields

## Files likely in scope
Likely:
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/services/projects-list-mapper.ts`
- `backend/functions/src/services/projects-list-contract.ts`
- any state-transition handlers under project request / provisioning flows
- any controller/admin readers that deserialize request objects

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 2 progress note** specifically covering:
- production-path verification performed
- write-path coverage
- read-path coverage
- backward-compatibility decisions
- any legacy-field coexistence decisions

Add a **closure statement draft** for the specific sub-finding:
- “The production-path mapper/repository flow now preserves the canonical Project Setup persisted field set, including backward-compatible handling for legacy list rows.”

If any residual limitations remain, document them plainly instead of hiding them.

## Evidence requirements
The review doc update must include:
- exact files changed
- exact categories of persistence path verified
- any fields intentionally not backfilled for legacy rows
- any remaining migration or normalization follow-up

## Acceptance criteria
- Real production read/write flows persist the intended canonical field set.
- Legacy rows remain safe to read and render.
- No silent data loss remains for the newly supported fields.
- The review doc is updated with truthful progress notes, closure language, and evidence.
