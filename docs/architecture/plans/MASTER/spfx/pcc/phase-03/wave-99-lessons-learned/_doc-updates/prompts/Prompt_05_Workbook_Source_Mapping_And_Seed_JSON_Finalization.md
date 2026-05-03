# Prompt 05 — Workbook Source Mapping and Seed JSON Finalization

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

Finalize workbook source mapping documentation and `default_lessons_learned_seed_structure.json` from the repo-resident workbook extraction.

## Required Docs

- `Lessons_Learned_Workbook_Source_Mapping.md`
- `reference/default_lessons_learned_seed_structure.json`
- `reference/workbook_field_mapping_reference.json`

## Required Rules

- Every workbook field must be mapped.
- Six lesson blocks are source layout only, not a target limit.
- Sample database rows are source examples only unless activated by a future governed import workflow.
- Reference Guide categories and impact magnitude thresholds become seed taxonomy.
- Summary/formula/header/blank rows must not be active records.
- Preserve exact source sheet, range, row, and field references from extraction.

## Commit Summary

`docs(pcc): map lessons learned workbook sources`

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
