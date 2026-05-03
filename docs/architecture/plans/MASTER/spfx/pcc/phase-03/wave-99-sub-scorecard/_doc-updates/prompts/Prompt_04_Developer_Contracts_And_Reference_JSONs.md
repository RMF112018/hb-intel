# Prompt 04 — Developer Contracts And Reference JSONs


## Universal Instructions

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

This is a documentation-only task. Do not make runtime/source-code changes unless the prompt explicitly allows them.

## Prohibited Scope

- Editing `docs/architecture/plans/**` unless separately authorized.
- Broad repo formatting.
- Source/runtime code changes.
- Backend route changes.
- SPFx surface changes.
- Package/dependency changes.
- Lockfile changes.
- Manifest changes.
- Workflow/CI changes.
- SPFx packaging/deployment.
- Tenant mutation.
- Procore API/runtime integration.
- Direct SPFx-to-Procore behavior.
- Procore write-back.
- Procore full mirror.
- Sage write-back or accounting postings.
- Compass/Bespoke Metrics mutation.
- Microsoft Graph runtime integration.
- SharePoint REST/PnP runtime operations.
- External-system writeback/sync/mirror.
- Evidence file upload/sync/storage behavior.
- Automatic vendor exclusion, blacklist, default, debarment, termination, legal, claim, entitlement, or damages determinations.
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
git diff --cached --name-only
git diff --name-only
```

For JSON files touched, run `python3 -m json.tool` against each file.


## Objective

Create developer-ready implementation contracts and machine-readable reference JSONs for the Subcontractor Scorecard future implementation.

## Required Work


Required docs/reference files:

- `Subcontractor_Scorecard_Developer_Implementation_Decisions_And_Contracts.md`
- `reference/subcontractor_scorecard_module_data_contract.json`
- `reference/subcontractor_scorecard_state_machine.json`
- `reference/field_mutability_matrix.json`
- `reference/scorecard_validation_rules.json`
- `reference/scorecard_exception_reason_codes.json`
- `reference/fixture_scenarios.json`
- `reference/procore_vendor_performance_data_mapping_reference.json`
- `reference/analytics_definitions.json`
- `reference/permission_matrix.json`
- `reference/source_research_urls.json`

All JSON files must validate with `python3 -m json.tool`.


## Commit Summary

`docs(pcc): add subcontractor scorecard developer contracts`

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if this prompt permits edits;
- validation results;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit guardrail confirmation.
