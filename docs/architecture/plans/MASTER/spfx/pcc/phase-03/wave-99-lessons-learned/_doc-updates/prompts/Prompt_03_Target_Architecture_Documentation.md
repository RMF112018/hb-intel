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
- Automatic employment, vendor blacklist, legal, claim, entitlement, compensability, defect-liability, warranty-liability, or delay-damages determinations.
- Automatic publication of sensitive Lessons Learned content.
- Production rollout.

## Objective

Create the Lessons Learned documentation target architecture under:

`docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/`

## Required Docs

- `Lessons_Learned_Target_Architecture.md`
- `Lessons_Learned_Scope_Lock.md`
- `Lessons_Learned_System_Of_Record_And_Integration_Model.md`

## Required Content

Use the enhanced closed target architecture. The docs must define Lessons Learned as a PCC-native lifecycle knowledge and continuous-improvement system with closed decisions for system-of-record boundaries, lifecycle states, permissions, redaction, source lineage, cross-module reuse, HBI guardrails, search/retrieval, analytics, and non-goals.

## Commit Summary

`docs(pcc): define lessons learned target architecture`

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
