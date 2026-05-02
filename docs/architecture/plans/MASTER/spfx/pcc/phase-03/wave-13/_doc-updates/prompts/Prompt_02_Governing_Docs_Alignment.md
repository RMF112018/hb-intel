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
- Microsoft Graph runtime integration.
- SharePoint REST/PnP runtime operations.
- External-system writeback/sync/mirror.
- Evidence file upload/sync/storage behavior.
- Automatic creation of commitments, POs, subcontracts, CCOs, invoices, or accounting entries.
- Automatic legal, claim, entitlement, compensability, or delay-damages determinations.
- Production rollout.



## Objective

Update governing Phase 3 docs so Wave 13 is consistently described as **Buyout Log** with subtitle **Buyout Control Center**.

## Required Alignment Language

Use:

> Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

## Likely Files

- `05_Phase_3_Development_Roadmap_Updated.md`
- `07_Phase_3_Module_Implementation_Plan.md`
- `Register_Workflow_Module_Register.md`
- `Register_MVP_Scope.md`
- `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `System_of_Record_Matrix.md` only if repo truth requires a Wave 13-specific clarification.

## Commit Summary

`docs(pcc): align wave 13 buyout log governance`



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
