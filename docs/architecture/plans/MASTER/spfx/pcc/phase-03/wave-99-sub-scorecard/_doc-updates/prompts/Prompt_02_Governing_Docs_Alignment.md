# Prompt 02 — Governing Docs Alignment


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

Update governing PCC architecture docs to recognize the Subcontractor Scorecard as a closed future-workstream architecture without disrupting current Phase 3 MVP wave sequencing.

## Required Work


- Use `05_Documentation_Update_Map.md` as the allowed documentation map.
- Update the PCC target architecture blueprint with the locked module summary.
- Update the System of Record Matrix with explicit Subcontractor Scorecard rows.
- Update roadmap/register docs with future-workstream / post-MVP posture only.
- Do not mark the module as current MVP and do not insert it into Waves 8-14.
- Correct stale source workbook filename references to `docs/reference/example/06 20260307_SOP_SubScorecard-DRAFT.xlsx` where relevant.


## Commit Summary

`docs(pcc): align subcontractor scorecard governing docs`

## Final Output Requirements

Return:

- summary of files inspected;
- summary of files changed, if this prompt permits edits;
- validation results;
- staged-file proof before commit, if committing;
- commit summary and commit description, if committing;
- explicit guardrail confirmation.
