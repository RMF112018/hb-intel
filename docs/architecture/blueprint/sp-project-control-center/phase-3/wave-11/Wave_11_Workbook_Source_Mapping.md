# Wave 11 Workbook Source Mapping

## 1. Workbook Inventory

- `docs/reference/example/Responsibility Matrix - Template.xlsx`
- `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx`

## 2. Extraction Methodology

- Read workbook sheets directly from repo source files.
- Classify rows into active default-item candidates vs ambiguous/schema-only rows.
- Preserve source workbook, sheet, and row references.
- Apply conservative normalization: only explicit `R/A/C/I` marks map directly; `X/Support/Review/Sign-Off` remain unresolved and require review.

## 3. Sheet Summary

- PM sheet: task-text responsibility candidates and role-mark columns.
- Field sheet: role-marked field responsibility rows.
- Owner-contract sheet: article/page/party/description scaffold with placeholder posture.

## 4. Used Ranges

- PM: `A1:I86`
- Field: `A1:H78`
- Owner-contract Template: `A1:F45`

## 5. Header and Role Columns

- PM header row: row `3`; role columns `C:I`
- Field header row: row `7`; role columns `D:H`
- Owner-contract header row: row `1`; structure columns `A:D`

## 6. Section/Grouping Rows

- PM includes section/category values in column `A`.
- Field includes category/group values in column `B`.
- Owner-contract includes title/legend rows and placeholder scaffold rows.

## 7. Responsibility Item Row Counts

- PM task-row candidates: `82`
- Field rows with assignment marks: `27`
- Workbook-derived task-row context total: `109`
- Strict marked assignment rows: `98` (`71` PM + `27` Field)

## 8. Ambiguous Row Treatment

- PM task rows without assignment marks are ambiguous and require review.
- Owner-contract placeholder rows are ambiguous/schema-only and excluded from active defaults.

## 9. Owner-Contract Workbook Interpretation

- Current posture is schema/placeholder only.
- Active owner-contract default obligations in this pass: `0`.
- Party legend remains mapping reference (`O`, `A/E`, `C`) and is not activated as obligation rows.

## 10. Assignment Mark Normalization

Locked rule:

- Do not convert workbook marks directly into final RACI unless explicit mapping rule exists.
- `X`, `Support`, `Review`, and `Sign-Off` remain unresolved in JSON normalization and set `requiresUserReview=true`.

## 11. Role Alias Mapping

- Preserve source role labels exactly (for example `PX`, `Sr. PM`, `PM2`, `Lead Super`).
- Canonical role mapping to PCC personas is deferred to governed review policy; source labels are not overwritten.

## 12. RACI Normalization Policy

- Explicit marks only: `R -> Responsible`, `A -> Accountable`, `C -> Consulted`, `I -> Informed`.
- Non-explicit source marks remain `Unknown` with review required.

## 13. Contract-Party Mapping Policy

- Contract-party mapping is separate from internal RACI.
- `C` in owner-contract legend means `Contractor`, not RACI `Consulted`.

## 14. Default Item JSON Structure

Top-level JSON structure:

- `metadata`
- `sources`
- `defaultItems`
- `ambiguousItems`

Each item includes stable ID, source location, source marks, normalization fields, classification, review flag, and mapping notes.

## 15. Source Traceability Fields

Per item:

- `id`
- `sourceWorkbookType`
- `sourceFile`
- `sourceSheet`
- `sourceRow`
- `sourceSection`
- `sourceTask`
- `sourceAssignments`
- `normalizedAssignments`
- `recommendedTargetClassification`
- `requiresUserReview`
- `mappingNotes`

## 16. Human Review Requirements

Human review is mandatory for:

- all unresolved non-explicit mark mappings
- PM rows without marks
- owner-contract placeholder/schema rows
- any row with semantic ambiguity

## 17. Items Excluded from Activation

- Owner-contract placeholder rows (`RM-OC-PLACEHOLDER-*`) are excluded from active `defaultItems`.
- PM unmarked task rows are not excluded from defaults, but flagged as ambiguous review-required records.

## 18. Validation Results

- JSON parse validation executed via `python -m json.tool`.
- Count checks executed from generated JSON.
- Output posture:
  - `defaultItems total = 109`
  - `defaultItems by workbook type = {'general-responsibility-matrix': 109}`
  - `defaultItems by sheet = {'PM': 82, 'Field': 27}`
  - `ambiguousItems total = 47`
  - `owner-contract active items = 0`
