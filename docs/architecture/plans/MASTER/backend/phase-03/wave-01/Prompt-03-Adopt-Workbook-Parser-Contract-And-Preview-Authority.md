# Prompt-03-Adopt-Workbook-Parser-Contract-And-Preview-Authority

## Objective

Finish aligning the backend’s Safety upload flow with the stronger workbook parser contract.

The workbook now supplies:
- `ParserMeta`
- named ranges
- template/version markers
- parse-critical data validation
- cleaner key findings seam

The backend must treat that as governed parser authority.

## Governing authorities

- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

Use the uploaded workbook as the artifact of truth for current template shape.

## Required work

1. Verify the parser/preview path consistently prefers:
   - parser-meta
   - named ranges
   - legacy fallback only when markers are absent
2. Tighten preview diagnostics so the response clearly exposes:
   - template validity
   - detected template version
   - detected parser contract version
   - field authority by source
   - reporting-period fit
   - project resolution
   - duplicate risk
   - normalized key findings preview
3. Ensure marked templates cannot be silently treated as legacy when parser seams are invalid.
4. Preserve operator-entered context only as advisory or legacy fallback, not as an override of parser authority on marked templates.

## Required implementation outcome

- preview becomes the canonical pre-commit truth surface for Safety upload validation
- incompatible-template failures are explicit and actionable
- parser-authoritative fields are clearly surfaced

## Proof of closure required

- exact response-shape or behavior changes
- exact tests added/updated
- evidence that marked-template parser authority now governs the flow
- evidence that legacy fallback remains only for genuinely unmarked templates

## Prohibitions

- no workbook redesign
- no unrelated frontend redesign
- no weakening of parser-contract enforcement to keep old assumptions alive
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
