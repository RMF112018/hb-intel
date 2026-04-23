# Prompt 03 — Add Preview And Commit-Readiness Gates

## Objective
Introduce a bounded preview/validation contract for Safety workbook ingestion so operators get a clear pre-commit view of parse validity, reporting-period resolution, project resolution, template compatibility, and commit readiness before the backend attempts authoritative writes.

## Governing authorities
- Repo truth in the Safety ingestion route/service/parser/repository seam.
- The current audit conclusion that the workbook now supports stronger pre-commit diagnostics and that the write lane should not rely on blind commit attempts.

## Files / seams / symbols to inspect
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- Safety parser files under `packages/features/safety/src/parser/**`
- Safety domain/result types under `packages/features/safety/src/domain/**`

## Current gap to close
The current backend jumps from upload payload receipt to commit attempt after internal validation. That is no longer good enough. The system needs a first-class preview/validation result that can fail clearly and stop before writes.

## Required implementation outcome
1. Add a preview/validation response shape or endpoint for the Safety ingestion lane.
2. Include at minimum:
   - template identity status,
   - parser contract version status,
   - parsed inspection metadata,
   - reporting-period resolution,
   - project resolution,
   - warnings,
   - blocking errors,
   - normalized key findings preview,
   - duplicate/supersession risk,
   - final commit-readiness flag.
3. Keep the route family tight and do not introduce unrelated UX or frontend drift.
4. Ensure the commit path can only proceed when commit-readiness passes.

## Proof of closure required
- Show a valid workbook preview response.
- Show an invalid/incompatible workbook preview response.
- Show that the commit path is gated correctly.
- Show that end-to-end ingest still works after the preview layer is introduced.

## Hard prohibitions
- Do not make this a generic workflow engine.
- Do not hide commit-blocking errors behind warnings.
- Do not introduce unrelated route families.

## Important working rule
Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
