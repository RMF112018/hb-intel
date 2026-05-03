# Prompt 01 — Repo Audit, Workbook Extraction, and Source Truth

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

Perform a read-only repo-truth audit for the Lessons Learned Center target architecture, verify the repo-resident workbook, and extract workbook source truth using `openpyxl`. Do not edit files in this prompt.

## Required Repo Truth Questions

1. Does `lessons-learned` exist in `PccWorkCenters.ts`, and what is its current MVP tier?
2. Does `WorkflowModules.ts` contain any lessons-related module such as `post-bid-autopsy`?
3. Do current governing docs mention Lessons Learned, Post-Bid Autopsy, project closeout lessons, or continuous improvement?
4. Is there already a future-workstreams directory or similar architecture location for non-MVP PCC modules?
5. Does the workbook exist at `docs/reference/example/07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx`?
6. What are the exact workbook sheet names, used ranges, headers, formulas, default/sample rows, reference taxonomy rows, summary rows, and excluded rows?

## Required Workbook Extraction

Use Python/openpyxl to extract workbook metadata, sheets, merged cells, hidden rows/columns, formulas, data validations, conditional formatting, project header fields, lesson block fields, database headers, sample rows, reference guide categories, impact magnitude guide, writing standards, approval fields, summary/formula rows, and blank rows.

## Final Output

Return an audit summary and exact workbook extraction summary. Do not commit.

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
