# Prompt 09 — Tenant Validation, 56 Scorecard, and Closeout

## Role

You are the final Wave 15A validation and closeout agent.

## Objective

Validate the complete PCC Wave 15A remediation in tenant-hosted SharePoint, complete accessibility/keyboard evidence, finalize scorecard, and close out Wave 15A.

## Scope

Validation evidence, final screenshots, final scorecard, closeout docs, and regression verification. Runtime code changes only if required to fix blocking defects discovered during validation.

## Non-Scope

No new product features. No backend/API scope. No 56/56 claim unless all evidence supports it.

## Required Repo-Truth Inspection

Inspect all Prompt 01-08 closeouts, changed files, evidence folders, doctrine matrix, scorecard matrix, screenshots, tenant deployment/package docs, and current app behavior in tenant.

## Required Implementation Work

Run final validation. Fix only blocking defects if within Wave 15A UI scope. Produce final evidence docs and scorecard. Mark unresolved hard gates as blockers instead of claiming 56/56.

## Required Tests

Run full repo-appropriate PCC typecheck/test/build/package commands. Run accessibility/keyboard validation. Verify no unrelated worktree changes. Run prettier on docs.

## Required Screenshot / Evidence Output

Capture final tenant-hosted screenshots for every surface at required widths. Capture keyboard/accessibility evidence. Update screenshot index and final scorecard.

## Scorecard Impact

Only prompt authorized to claim 56/56, and only if every category is evidence-backed at target score.

## Closeout Requirements

Create final Wave 15A closeout with exact files changed, command results, tenant evidence, accessibility evidence, final scorecard, residual risks, and handoff to Phase 3 closeout.

## Stop Conditions

Stop and do not claim 56/56 if tenant validation, screenshots, accessibility/keyboard evidence, or tests are missing or failing.

## Standing Instruction

Do not re-read files still within your current context unless exact wording, line references, or changed repo state must be verified.

Begin with repo-truth inspection. Avoid unrelated changes. Avoid feature creep. Prefer shared primitives over one-off local styling. Update closeout documentation. Report exact files changed, commands run, validation results, residual issues, and any stop conditions.

