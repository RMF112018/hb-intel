# Fresh Session Reviewer Prompt — Wave 13 Enhanced


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

Act as a reviewer for the completed Wave 13 Buyout Log documentation update. Audit the final changes against repo truth, the enhanced target architecture, workbook extraction, source-of-record doctrine, and guardrails.

## Review Questions

1. Do governing docs consistently describe Buyout Log and Buyout Control Center?
2. Is the Project Readiness MVP host / Procurement future affinity distinction clear?
3. Does every workbook column survive as a record field?
4. Does the package avoid cloning the workbook UI?
5. Are Procore and Sage boundaries correct?
6. Are all external integrations read-only and backend-mediated?
7. Are developer contracts sufficient to implement without inventing business logic?
8. Are JSON reference files valid and internally consistent?
9. Are prohibited scopes avoided?
10. Is the closeout evidence complete?

## Final Output

Provide pass/fail findings, required remediations, and whether the package is ready for implementation prompts.



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
