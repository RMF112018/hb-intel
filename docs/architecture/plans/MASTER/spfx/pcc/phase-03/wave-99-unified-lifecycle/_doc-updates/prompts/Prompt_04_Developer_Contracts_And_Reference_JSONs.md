# Prompt 04 — Developer Contracts and Reference JSONs


## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This is a documentation-only task. Do not make runtime/source-code changes unless the prompt explicitly allows them. This package does not allow runtime/source-code changes.

## Prohibited Scope

- Editing `docs/architecture/plans/**` unless separately authorized.
- Broad repo formatting.
- Source/runtime code changes.
- Backend route changes.
- SPFx surface, hook, client, adapter, component, shell, router, mount, or CSS changes.
- TypeScript model/package changes.
- Package/dependency changes.
- Lockfile changes.
- Manifest changes.
- Workflow/CI changes.
- SPFx packaging/deployment.
- Tenant mutation.
- Microsoft Graph runtime integration.
- SharePoint REST/PnP runtime operations.
- Procore/Sage/Autodesk/Document Crunch/Adobe/DocuSign/CRM runtime integration.
- Source-system writeback, sync, mirror, mutation, or bulk export.
- Live HBI/vector/search/LLM integration.
- Automatic legal, warranty-responsibility, claim, entitlement, compensability, or delay-damages determinations.
- Production rollout.

## Required Validation

Run repo-correct equivalents of:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
```

For JSON files touched, run:

```bash
python3 -m json.tool <each touched json file>
```

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed;
- validation results;
- lockfile MD5 before/after;
- explicit no-runtime/no-tenant/no-source-system-mutation guardrail confirmation;
- commit summary and commit description if committing.


## Objective

Create the machine-readable reference JSON files that support the developer contract docs.


## Required Target Directory

```text
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/reference/
```

## Required JSON Files

Create:

```text
bounded_context_ownership_map.json
route_taxonomy_and_forbidden_routes.json
record_state_machines.json
field_level_data_dictionary.json
permission_redaction_resolution_algorithm.json
hbi_retrieval_citation_refusal_contract.json
source_system_integration_contracts.json
audit_event_model.json
error_degraded_state_matrix.json
module_onboarding_template.json
validation_acceptance_gates.json
source_research_urls.json
```

## Source Content

Use this package's `reference/` JSON files as the content basis. Validate each JSON with `python3 -m json.tool`.

## Required Consistency Checks

- Route docs and route JSON must match.
- State-machine docs and JSON must match.
- Field dictionary docs and JSON must match.
- HBI refusal taxonomy must align with repo model truth.
- Source integration docs and JSON must not authorize live integration.


## Commit Summary

`docs(pcc): add unified lifecycle developer contract references`
