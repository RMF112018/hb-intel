# Prompt 02 — Adopt Parse-First Workbook Contract

## Objective
Bring the Safety workbook parser up to the level of the workbook that now exists. The parser must stop treating the visible sheet layout as the only source of truth when `ParserMeta`, named ranges, and workbook contract/version markers are available.

## Governing authorities
- Repo truth in:
  - `packages/features/safety/src/parser/xlsxWorkbookView.ts`
  - `packages/features/safety/src/parser/extractMetadata.ts`
  - `packages/features/safety/src/parser/validateTemplate.ts`
  - `packages/features/safety/src/parser/parseChecklist.ts`
  - `packages/features/safety/src/domain/templateContract.ts`
- Uploaded workbook contract inspected in-session:
  - hidden `ParserMeta`
  - named ranges for inspection metadata, totals, score, key findings
  - `TemplateVersion`
  - `ParserContractVersion`
  - date / whole-number validation on key entry cells

## Files / seams / symbols to inspect
- `packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `packages/features/safety/src/parser/workbookView.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/parser/parseChecklist.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- any new parser helper files you introduce

## Current gap to close
The current parser:
- reads only visible cells,
- ignores workbook names,
- ignores `ParserMeta`,
- ignores parser contract/version markers,
- and uses a stale key-findings seam.

That is now below repo/user artifact truth.

## Required implementation outcome
1. Extend the workbook abstraction so it can read:
   - hidden-sheet cells,
   - named ranges,
   - workbook-defined template/version markers.
2. Adopt parse precedence:
   - `ParserMeta`
   - named ranges
   - legacy visible-cell fallback
3. Validate:
   - template identity,
   - parser contract version,
   - inspection date,
   - inspection number,
   - reporting period derivation inputs,
   - key findings seam.
4. Update metadata extraction to use the new precedence.
5. Update findings extraction to support the improved multi-line seam.
6. Preserve backward compatibility only where deliberate and explicitly fail closed when contract markers are invalid or unsupported.

## Proof of closure required
- Show parser output on the uploaded workbook proving it consumed `ParserMeta` / named ranges.
- Show targeted diagnostics for incompatible template/version cases.
- Show that visible-cell fallback still works only as intended.
- Show that current scoring/checklist parsing was not broken.

## Hard prohibitions
- Do not redesign the user-facing workbook.
- Do not silently ignore invalid contract markers.
- Do not keep the old visible-cell path as the default authority when richer parser targets are present.

## Important working rule
Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
