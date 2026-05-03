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
- Automatic employment, vendor blacklist, legal, claim, entitlement, compensability, defect-liability, warranty-liability, or delay-damages determinations.
- Automatic publication of sensitive Lessons Learned content.
- Production rollout.

## Objective

Update governing PCC documentation so the Lessons Learned Center is consistently described as a future PCC lifecycle knowledge and continuous-improvement module.

## Required Alignment Language

Use:

> Lessons Learned Center is a future PCC workstream and Later work center that must be documented as a PCC-native lifecycle knowledge and continuous-improvement system. It captures, reviews, publishes, redacts, and routes project knowledge across the full project lifecycle while preserving Procore, Sage, SharePoint/HB Central, and PCC system-of-record boundaries.

## Likely Files

- `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `System_of_Record_Matrix.md`
- `05_Phase_3_Development_Roadmap_Updated.md` only if repo truth currently references Lessons Learned or work center tiers
- `07_Phase_3_Module_Implementation_Plan.md` only if repo truth currently references Lessons Learned or work center tiers
- `Register_Workflow_Module_Register.md` only if repo truth requires clarification between `post-bid-autopsy` and the larger Lessons Learned Center
- `Register_MVP_Scope.md` only if repo truth incorrectly implies MVP implementation scope

## Required Decisions

- Do not promote Lessons Learned into MVP scope.
- Do add/clarify system-of-record ownership.
- Do distinguish narrow `post-bid-autopsy`/closeout artifacts from the comprehensive Lessons Learned Center.
- Do preserve the module as future workstream architecture unless repo truth already proves formal promotion.

## Commit Summary

`docs(pcc): align lessons learned governance`

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
