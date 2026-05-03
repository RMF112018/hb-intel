# Prompt 04 — Developer Contracts and Reference JSONs

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
- Microsoft Graph runtime integration.
- SharePoint REST/PnP runtime operations.
- External-system writeback/sync/mirror.
- Evidence file upload/sync/storage behavior.
- Automatic employment, vendor blacklist, legal, claim, entitlement, compensability, defect-liability, warranty-liability, or delay-damages determinations.
- Automatic publication of sensitive Lessons Learned content.
- Production rollout.

## Objective

Create developer implementation contracts and reference JSON files for the Lessons Learned Center.

## Required Docs

- `Lessons_Learned_Developer_Implementation_Decisions_And_Contracts.md`

## Required Reference Files

- `lessons_learned_module_data_contract.json`
- `lessons_learned_state_machine.json`
- `field_permission_and_redaction_matrix.json`
- `lessons_learned_validation_rules.json`
- `hbi_lessons_learned_contracts.json`
- `metric_dictionary.json`
- `fixture_scenarios.json`
- `source_research_urls.json`

## Required Contract Topics

- primary record and child records;
- enums;
- read-model envelopes;
- state machine;
- action/field-level permission matrix;
- redaction shapes and reason codes;
- validation rules by workflow state;
- source-lineage contract;
- HBI request/response contracts;
- improvement action contract;
- audit events;
- metric formulas;
- fixture scenarios;
- external integration guardrails.

## Commit Summary

`docs(pcc): add lessons learned implementation contracts`

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

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if this prompt permits edits;
- validation results;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit guardrail confirmation.
