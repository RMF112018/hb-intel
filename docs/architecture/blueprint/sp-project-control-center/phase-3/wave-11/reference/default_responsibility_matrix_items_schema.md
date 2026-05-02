# Default Responsibility Matrix Items Schema (Human-Readable)

This file documents the expected structure and field semantics for:

- `default_responsibility_matrix_items.json`

## Root Structure

```json
{
  "metadata": {},
  "sources": [],
  "defaultItems": [],
  "ambiguousItems": []
}
```

## metadata

Required fields:

- `module` (string; expected `Responsibility Matrix`)
- `phase` (string; expected `Phase 3`)
- `wave` (string; expected `Wave 11`)
- `generatedFrom` (string)
- `sourceFiles` (string[])
- `classificationPolicy` (string[])

## sources[]

Per source workbook:

- `sourceWorkbookType` (string enum):
  - `general-responsibility-matrix`
  - `owner-contract-responsibility-matrix`
- `file` (string)
- `sheets` (array of sheet summaries)

Sheet summary supports fields such as:

- `name`
- `usedRange`
- `taskTextRows`
- `strictMarkedRows`
- `headerRow`
- `roleColumns`
- owner-contract-only fields:
  - `activeDefaultObligationRows`
  - `placeholderRows`
  - `legendRows`

## defaultItems[]

Stable IDs:

- `RM-PM-0001...`
- `RM-FLD-0001...`

Required fields:

- `id` (string)
- `sourceWorkbookType` (string)
- `sourceFile` (string)
- `sourceSheet` (string)
- `sourceRow` (integer)
- `sourceSection` (string|null)
- `sourceTask` (string)
- `sourceAssignments` (array)
- `normalizedAssignments` (array)
- `recommendedTargetClassification` (string)
- `requiresUserReview` (boolean)
- `mappingNotes` (string)

Normalization rule lock:

- Only explicit marks (`R/A/C/I`) map directly to RACI values.
- Non-explicit marks (`X/Support/Review/Sign-Off`) must remain unresolved (`Unknown`) and require review.

## ambiguousItems[]

Stable IDs include:

- `RM-PM-AMB-0001...`
- `RM-OC-PLACEHOLDER-0001...`

Required fields:

- `id`
- `sourceWorkbookType`
- `sourceFile`
- `sourceSheet`
- `sourceRow`
- `recommendedTargetClassification`
- `requiresUserReview`
- `mappingNotes`

May include:

- `sourceTask` (nullable)

## Count Posture Constraints

Expected repository posture for this dataset:

- `defaultItems total = 109`
- `defaultItems by sheet = PM: 82, Field: 27`
- `strict marked assignment rows = 98`
- `owner-contract active default obligations = 0`
- owner-contract placeholders tracked outside active defaults
