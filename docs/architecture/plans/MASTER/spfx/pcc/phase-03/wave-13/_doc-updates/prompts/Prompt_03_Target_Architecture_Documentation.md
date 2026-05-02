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
- Microsoft Graph runtime integration.
- SharePoint REST/PnP runtime operations.
- External-system writeback/sync/mirror.
- Evidence file upload/sync/storage behavior.
- Automatic creation of commitments, POs, subcontracts, CCOs, invoices, or accounting entries.
- Automatic legal, claim, entitlement, compensability, or delay-damages determinations.
- Production rollout.



## Objective

Create the Wave 13 documentation target architecture under:

`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/`

## Required Docs

- `Buyout_Log_Target_Architecture.md`
- `Wave_13_Buyout_Log_Scope_Lock.md`
- `Wave_13_System_Of_Record_And_Integration_Model.md`

## Required Content

Use the enhanced closed target architecture. The docs must define Buyout Log as an exception-first PCC-native Buyout Control Center and must preserve all Procore/Sage/PCC/SharePoint system-of-record boundaries.

## Commit Summary

`docs(pcc): define wave 13 buyout log architecture`



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
