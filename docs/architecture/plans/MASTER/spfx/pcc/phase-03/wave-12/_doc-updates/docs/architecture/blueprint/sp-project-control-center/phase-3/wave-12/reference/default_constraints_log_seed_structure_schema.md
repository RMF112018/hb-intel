# Default Constraints Log Seed Structure Schema

This schema describes `default_constraints_log_seed_structure.json`.

## Top-Level Fields

| Field | Type | Required |
|---|---|---:|
| metadata | object | yes |
| sources | array | yes |
| seedCategories | array | yes |
| defaultFields | array | yes |
| sampleRows | array | yes |
| placeholderRows | array | yes |
| excludedRows | array | yes |
| ambiguousItems | array | yes |

## `metadata`

- `module`
- `phase`
- `wave`
- `generatedFrom`
- `generatedAt`
- `sourceFiles`
- `classificationPolicy`
- `activationPolicy`

## `seedCategories`

Each category must include:

- `id`
- `sourceFile`
- `sourceSheet`
- `sourceRow`
- `sourceLabel`
- `normalizedCategory`
- `recommendedTargetDomain`
- `activationPosture`
- `mappingNotes`

## `defaultFields`

Each field must include:

- `id`
- `sourceColumn`
- `sourceLabel`
- `sourceSection`
- `normalizedField`
- `fieldPurpose`
- `requiredForMvp`
- `targetFieldType`
- `mappingNotes`

## Activation Rule

No workbook row may be treated as an active default constraint without project-specific verification.
