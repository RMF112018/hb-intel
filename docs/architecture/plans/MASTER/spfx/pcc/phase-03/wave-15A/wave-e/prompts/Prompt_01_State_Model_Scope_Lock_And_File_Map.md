# Prompt 01 — State Model Scope Lock and File Map

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Validate Wave E scope, determine whether the local worktree already contains the Prompt 05 state/product-language implementation, and produce a source file map before any runtime changes.

## 3. Scope

- Documentation and source audit only unless a small docs-only file map/closeout is required.
- Identify all state, disabled action, posture, source-status, and diagnostics copy ownership points.
- Decide whether subsequent prompts should run in verification/hardening mode or implementation mode.

## 4. Non-Scope

- No backend/API contract expansion.
- No live Graph, PnP, Procore, Document Crunch, Adobe Sign, or SharePoint list operations.
- No router ID changes.
- No `@hbc/models` contract changes unless a hard repo-truth conflict requires escalation.
- No unrelated UI polish.
- No app-catalog upload, `.sppkg` generation, or tenant-hosted readiness claim unless this prompt explicitly asks for evidence collection and you actually perform it.
- No final 56/56 claim.

## 5. Required Repo-Truth Inspection

Before changing files, inspect the current branch and verify:

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/06_STATE_MODEL_AND_CONTENT_LANGUAGE_STANDARD.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-05/PROMPT_05_CLOSEOUT.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-06/PROMPT_06_CLOSEOUT.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/ui/PccDisabledAffordance.tsx`
- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- routed surfaces under `apps/project-control-center/src/surfaces/`
- relevant tests under `apps/project-control-center/src/tests/`

Do not re-read files still within your current context or memory unless exact wording, line references, or changed repo state must be verified.

## 6. Exact or Best-Known Source Areas to Change

Primary:
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/ui/PccDisabledAffordance.tsx`
- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/**`
- `apps/project-control-center/src/tests/**`

Documentation:
- Wave 15A top-level docs
- Prompt 05/06 closeouts
- this package's `docs/` files

## 7. Implementation Requirements

1. Capture branch name, HEAD SHA, and lockfile MD5.
2. Confirm whether Prompt 05 closeout exists locally.
3. Confirm whether `PccDisabledAffordance` and `pccSurfacePostureCopy` exist locally.
4. Create a source file map using `artifacts/source-file-map-template.md`.
5. Run forbidden-token grep in audit mode and classify hits.
6. Do not change runtime code in Prompt 01 unless a broken or missing docs closeout path blocks the file map.
7. Define the prompt execution mode:
   - verification/hardening; or
   - implementation.
8. Record dependencies on Wave B, Wave C, and Wave D primitives.

## 8. Required Tests

No runtime tests are required unless code changes are made.

Required checks:
- `pnpm exec prettier --check` for any docs you create/update.
- If you touch runtime source by exception, run `pnpm --filter @hbc/spfx-project-control-center check-types` and affected tests.

## 9. Required Screenshot / Evidence Output

Create or update an evidence note listing:
- branch/HEAD;
- lockfile MD5;
- files inspected;
- forbidden-token grep results;
- mode decision;
- unresolved dependencies;
- screenshots not captured in Prompt 01.

## 10. Scorecard Impact

Improves validation and closure proof, state-model completeness planning, and doctrine compliance traceability. Does not directly increase visual score until implementation/evidence prompts run.

## 11. Closeout Requirements

Produce a Prompt 01 closeout with:
- exact files inspected;
- exact files changed, if any;
- mode decision;
- source file map;
- grep command/results;
- next prompt recommendation;
- residual risks.

## 12. Stop Conditions

Stop and report before making further changes if:

- Prompt 05 implementation is absent and Wave B/C/D dependencies are also absent.
- Local repo has uncommitted user changes in state/surface files that you cannot safely distinguish.
- The source file map reveals required backend/model contract work.
- Required docs paths are blocked by repository guardrails.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
