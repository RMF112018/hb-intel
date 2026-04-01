# Prompt 4 — Reconcile Deployment Docs and `apiAudience` Narrative

## Objective

Update the relevant review and deployment documentation so it reflects the implemented Gap 1 truth and resolves the current contradiction regarding whether `apiAudience` is injected by the shell.

## Scope

This prompt is limited to documentation reconciliation directly related to:
- Gap 1 permission declaration implementation
- SharePoint API access approval sequence
- `apiAudience` current-state narrative consistency

Do not broaden into unrelated doc cleanup.

## Working rules

- Use current repo truth and Prompt 3 verification results as the deciding evidence.
- Do not preserve stale language for the sake of consistency with older reports.
- Reconcile contradictions explicitly; do not leave them implied.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or capture exact wording.

## Files to inspect first

1. `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md`
2. `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`
3. Any deployment runbook or operator doc that currently mentions:
   - API approval
   - App Catalog upload
   - SharePoint API access
   - `apiAudience`
4. Prompt 3 verification notes

## Tasks

1. Update the Gap 1 validation report so it reflects implemented truth instead of pre-implementation recommendation language.
2. Update the relevant Phase 8 or deployment docs so they correctly describe the actual order of operations:
   - package declares permission request
   - package uploaded to App Catalog
   - request appears in SharePoint API access
   - admin approval occurs
   - production token acquisition can succeed
3. Compare current repo truth to the current Phase 8 `apiAudience` language and determine which narrative is stale.
4. Update the stale document(s) so the repo/docs story is internally consistent.
5. Keep the doc edits tightly scoped to Gap 1 truth reconciliation.

## Required output

Update the relevant review/deployment docs and provide a concise summary of:
- which docs changed
- what contradiction was resolved
- what the final documented `apiAudience` posture now states
- what the final documented API approval sequence now states

## Acceptance criteria

- The docs no longer describe SharePoint API approval as a disconnected prerequisite.
- The `apiAudience` narrative is consistent with current repo truth.
- The Gap 1 implementation story is now internally consistent across the updated docs.
