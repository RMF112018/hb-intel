# Prompt 01 — Repo Audit, Workbook Extraction, And Source Truth


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

Verify repo truth for the PCC Subcontractor Scorecard documentation update and extract the live source workbook at `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx` before any documentation edits.

## Required Work


- Confirm current branch, clean status, HEAD, recent commits, and lockfile MD5.
- Inspect PCC work center, surface, workflow module, read-model, route, blueprint, system-of-record, roadmap, and register docs listed in `00_Repo_Truth_Context.md`.
- Extract all sheets, field labels, formulas, validations, scoring categories, score criteria, narrative fields, approval fields, and aggregation dashboard columns from `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx`.
- Confirm whether stale `(1)` workbook filename references exist in target docs.
- Produce a repo-truth and workbook-truth summary. Do not edit docs in this prompt unless explicitly directed by Bobby.


## Commit Summary

`docs(pcc): audit subcontractor scorecard source truth`

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if this prompt permits edits;
- validation results;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit guardrail confirmation.
