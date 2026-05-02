# Default Constraints Log Seed Structure Schema (Documentation Reference)

This schema describes the expected shape of `default_constraints_log_seed_structure.json` for Wave 12 documentation posture.

## Metadata

Required:

- `wave` (number)
- `module` (string)
- `title` (string)
- `posture` = `documentation-reference-only`
- `runtimeContract` = `false`
- `activeDefaultConstraints` = `false`
- `sourceWorkbook` (string path)

## Classification

Required groups:

- `sections[]`: row-indexed section descriptors with `type` classification.
- `fields[]`: normalized header field names.
- `sampleRows[]`: representative rows from workbook with `isDefault=false`.
- `placeholderRows`: template/hidden-row posture.
- `ambiguousItems[]`: explicitly documented interpretation ambiguities.

## Mapping Rules

Required booleans:

- `noWorkbookRowBecomesActiveDefaultConstraint`
- `projectSpecificVerificationRequiredForActivation`
- `changeTrackingAndDelayLogAreSourceContextOnly`

## Guardrail

This schema is a documentation-reference schema only and is not a runtime schema contract.
