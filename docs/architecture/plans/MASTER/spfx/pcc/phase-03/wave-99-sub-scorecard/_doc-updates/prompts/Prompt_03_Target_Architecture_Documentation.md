# Prompt 03 — Target Architecture Documentation


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

Create the complete target architecture documentation under `docs/architecture/blueprint/sp-project-control-center/future-workstreams/subcontractor-scorecard/`.

## Required Work


Required docs:

- `Subcontractor_Scorecard_Target_Architecture.md`
- `Subcontractor_Scorecard_Scope_Lock.md`
- `Subcontractor_Scorecard_System_Of_Record_And_Integration_Model.md`

Required content:

- Closed module placement and naming.
- PCC-native ownership model.
- Source-system boundaries.
- Workbook scoring conversion.
- State model summary.
- Scoring algorithm.
- Role and publication model.
- Source-lineage model.
- HBI guardrails.
- Deferred capabilities.
- Success criteria.


## Commit Summary

`docs(pcc): define subcontractor scorecard target architecture`

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if this prompt permits edits;
- validation results;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit guardrail confirmation.
