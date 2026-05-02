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
- Automatic creation of commitments, POs, subcontracts, CCOs, invoices, or accounting entries.
- Automatic legal, claim, entitlement, compensability, or delay-damages determinations.
- Production rollout.



## Objective

Perform a read-only repo-truth audit for Wave 13 Buyout Log, verify the repo-resident workbook, and extract workbook source truth using `openpyxl`. Do not edit files in this prompt.

## Required Repo Truth Questions

1. How is Wave 13 named in governing docs?
2. Where is Buyout Log placed: Project Readiness, Procurement & Buyout, or both?
3. Does `buyout-log` exist in `WorkflowModules.ts`?
4. Does the repo contain a Wave 13 documentation directory?
5. Does the Buyout Log workbook exist at `docs/reference/example/financial/`?
6. What are the exact workbook sheet names, used ranges, headers, formulas, default line rows, summary rows, and excluded rows?

## Required Workbook Extraction

Use Python/openpyxl to extract workbook metadata, sheets, merged cells, hidden rows/columns, formulas, data validations, conditional formatting, project header fields, column headers, line items, summary rows, and excluded rows.

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
