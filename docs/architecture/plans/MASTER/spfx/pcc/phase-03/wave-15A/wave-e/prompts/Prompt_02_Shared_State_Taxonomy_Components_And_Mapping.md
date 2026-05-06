# Prompt 02 — Shared State Taxonomy, Components, and Mapping

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Verify or implement the shared Wave E state taxonomy and mapping layer while preserving existing PCC primitives and tests.

## 3. Scope

- Shared state component/model work only.
- Map target taxonomy (`live`, `preview`, `readOnly`, `unavailable`, `setupRequired`, `degraded`, `blocked`, `error`, `empty`, `loading`) to existing display specs.
- Keep surface adoption for later prompts unless a shared primitive requires a narrow call-site adjustment.

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

- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/ui/PccPreviewState.module.css`
- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx`
- `apps/project-control-center/src/api/pccReadModelStateMapping.test.ts`
- Optional new files under `apps/project-control-center/src/ui/` if an operational wrapper/alias map is needed.

## 7. Implementation Requirements

1. Decide whether current `PccPreviewState` remains the display primitive.
2. If target taxonomy is not represented, add a narrow operational state alias/catalog without disrupting existing call sites.
3. Preserve product-grade copy and `reason` / `nextStep` support.
4. Add explicit mapping from read-model source statuses to operational state.
5. If retaining `unavailable-fixture`, document why; if aliasing, preserve backward compatibility.
6. Do not move UI copy into shared model packages.
7. Avoid broad surface migration in this prompt.

## 8. Required Tests

Required if code changes:
- `pnpm --filter @hbc/spfx-project-control-center check-types`
- `pnpm --filter @hbc/spfx-project-control-center test -- PccPreviewState`
- `pnpm --filter @hbc/spfx-project-control-center test -- pccReadModelStateMapping`
- Full PCC test run if shared exports or broad call sites change.
- Prettier check on touched files.

## 9. Required Screenshot / Evidence Output

Evidence:
- State taxonomy table before/after.
- Mapping table from source status to display state.
- Forbidden-token grep scoped to shared UI/API state files.
- No screenshots required unless shared visual output changes materially.

## 10. Scorecard Impact

Directly improves state-model completeness and contract/data seam rigor. May improve accessibility confidence if loading/error/disabled semantics are strengthened.

## 11. Closeout Requirements

Closeout must include:
- exact shared state files changed;
- state taxonomy/mapping decisions;
- test results;
- grep results;
- compatibility notes for existing selectors/tests;
- residual taxonomy gaps.

## 12. Stop Conditions

Stop and report before making further changes if:

- Any change requires modifying `@hbc/models`.
- Renaming state keys would break broad selectors without a migration plan.
- State copy requires unresolved product-owner judgment.
- Existing implementation already satisfies target taxonomy; in that case write a verification closeout and proceed.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
