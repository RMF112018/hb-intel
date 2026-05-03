# Fresh Session Reviewer Prompt — Lessons Learned Enhanced

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

Act as a reviewer for the completed Lessons Learned documentation update. Audit the final changes against repo truth, the enhanced target architecture, workbook extraction, source-of-record doctrine, security/redaction posture, and guardrails.

## Review Questions

1. Do governing docs consistently describe Lessons Learned Center as future PCC lifecycle knowledge architecture?
2. Is the future-workstream / Later-work-center posture preserved unless repo truth proves formal promotion?
3. Does every workbook field survive as a record field, taxonomy seed, review/approval field, metric seed, or explicit legacy/source-only field?
4. Does the package avoid cloning the workbook UI and avoid closeout-only framing?
5. Are Procore/Sage/SharePoint/PCC boundaries correct?
6. Are all external integrations read-only and backend-mediated in future posture?
7. Are permissions, redaction, and sensitivity classes explicit enough to implement?
8. Are HBI guardrails explicit enough to prevent unauthorized approval, publication, or sensitive disclosure?
9. Are JSON reference files valid and internally consistent?
10. Are prohibited scopes avoided?
11. Is the closeout evidence complete?

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
