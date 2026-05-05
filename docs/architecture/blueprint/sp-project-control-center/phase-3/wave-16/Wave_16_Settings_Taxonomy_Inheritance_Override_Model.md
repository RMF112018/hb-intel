# Wave 16 Settings Taxonomy Inheritance Override Model

## Scope Taxonomy

- `tenant-global`
- `hbcentral-global`
- `project-site`
- `project-module`
- `project-role`
- `user-preference`
- `feature-flag`
- `integration-policy`
- `security-sensitive`
- `read-only-derived`

## Inheritance Order

1. hard security policy
2. tenant/global policy
3. HBCentral default
4. environment policy
5. project approved override
6. module approved override
7. role/persona filter
8. user preference when policy allows
9. source-derived state

## Override Rules

- Overrides are explicit, effective-dated, and auditable.
- Overrides requiring authority elevation must be approval-routed.
- Expired overrides are ignored by effective-value resolution.
- Invalid or policy-prohibited overrides are blocked and surfaced with validation state.

## Resolution Semantics

- Resolution computes effective value and effective source lineage.
- Resolution output is redaction-aware and role-filtered.
- Secret-backed settings resolve to references, never raw secret values.
