# PCC Field-Level Data Dictionary

## Purpose

Define field-level semantics so model, backend, SPFx, HBI, and documentation behavior remain consistent.

## Required Field Metadata

Every future PCC unified lifecycle field must declare:

- record family;
- field name;
- type;
- required/optional;
- owner;
- mutability;
- HBI readability;
- redaction behavior;
- audit requirement;
- notes / implementation constraints.

## Contract Rules

- `sourceLineage` is required for source-derived or derived records.
- `security` is required for PCC-native and PCC-derived records.
- `redactionLevel` is evaluated at read time.
- `citations` are required for grounded HBI answers.
- `recommendation` on warranty trace records is optional and blocked unless evidence threshold is met.
- `allowedPersonas` must use `PccPersona` values, not lens type values.
- Cross-project references must include security and reuse posture.

## Reference JSON

Use `reference/field_level_data_dictionary.json` as machine-readable source.
