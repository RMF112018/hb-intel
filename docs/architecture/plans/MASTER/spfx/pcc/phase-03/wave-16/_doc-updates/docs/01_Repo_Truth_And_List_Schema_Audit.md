# 01 — Repo-Truth and List-Schema Audit

## Required audit paths
```text
docs/reference/sharepoint/list-schemas/hbcentral/
docs/reference/sharepoint/list-schemas/pcc/
```

## HBCentral findings
`HB Platform Configuration Registry` already establishes a global non-secret configuration registry pattern:
- logical key: `ApplicationKey + EnvironmentKey + ScopeKey + ConfigKey + IsActive`;
- secret-backed rows store reference names only;
- value, JSON value, value type, validation status, effective dates, and owner metadata are represented;
- attachments are disabled;
- indexes exist for high-value query fields.

## PCC findings
`pcc/List-Map.md` identifies 110 PCC required list schemas. For Wave 16, the relevant current group includes:
- `PCC Configuration Registry`;
- `PCC Feature Flags`;
- `PCC Module Flags`;
- `PCC Schema Version Registry`;
- `PCC Sync Ingestion Runs`;
- `PCC Business Audit Events`.

## Schema defects / corrections to verify locally
- `PCC Configuration Registry`: `ConfigValue` must not be Number-only.
- `PCC Configuration Registry`: `LastUpdatedByUpn` must not be DateTime.
- `PCC Configuration Registry`: `SecretReferenceName` must be optional and required only when `IsSecretReference=true`.
- `PCC Configuration Registry`: `ConfigValueJson` cannot be universally required.
- `PCC Feature Flags`: `DefaultEnabled` should be Boolean, not Text.
- `PCC Module Flags`: `DefaultEnabled` should be Boolean, not Text.
- Project-specific override values should not be mixed into a global/default registry without explicit override semantics.

## Conclusion
Do not implement Wave 16 as a generic extension of `PCC Configuration Registry`. Add an explicit Wave 16 schema family and update the list maps.
