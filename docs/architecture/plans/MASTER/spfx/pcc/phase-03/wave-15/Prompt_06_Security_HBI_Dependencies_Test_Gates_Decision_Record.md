# Prompt 06 — Security/HBI/Dependency/Test-Gates Decision Record

## Decision

Prompt 06 promotes security/HBI/dependency governance docs and only the remaining Prompt-06 machine-readable artifacts while preserving Prompt-02/04 artifact provenance.

## Scope Lock

In scope:

- security/secrets/audit/HBI guardrail narrative,
- dependency and test-gate narrative,
- role/action visibility governance narrative,
- promotion of remaining Prompt-06 artifacts only.

Out of scope:

- runtime endpoint implementation,
- SharePoint or external-system writes,
- package/lockfile/manifest changes,
- tenant/live integration work,
- full Wave 15 package completion claim.

## Artifact Provenance Rule

Prompt 06 promotes only:

- `hbi_allowed_refused_behavior.json`
- `dependency_package_evaluation.json`
- `external_system_role_action_matrix.json`

Prompt 06 references existing canonical artifacts without re-promoting or replacing prior provenance:

- `validation_gates.json` (Prompt 04)
- `external_system_audit_event_taxonomy.json` (Prompt 04)
- `external_url_policy_contract.json` (Prompt 02)

## ADR Convention Handling

Prompt-06 decisions are recorded in the canonical Wave-15 plan path. ADR index cross-reference is optional and only used when repo convention clearly requires it.
