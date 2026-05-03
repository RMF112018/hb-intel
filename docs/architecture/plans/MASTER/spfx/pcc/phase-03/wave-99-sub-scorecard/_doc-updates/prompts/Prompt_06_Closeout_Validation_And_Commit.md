# Prompt 06 — Closeout Validation And Commit


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

Validate the completed documentation update and commit the final documentation-only package.

## Required Work


- Complete `Subcontractor_Scorecard_Documentation_Closeout_Template.md` or equivalent closeout doc in the target folder.
- Re-run all validation commands.
- Confirm lockfile MD5 unchanged.
- Confirm no runtime/source-code/package/manifest/workflow/CI changes.
- Confirm no prohibited external integration or mutation scope.
- Confirm JSON validity.
- Commit with the recommended summary if all checks pass.


## Commit Summary

`docs(pcc): close subcontractor scorecard documentation`

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if this prompt permits edits;
- validation results;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit guardrail confirmation.
