# Prompt 06 — State Model Tests, Screenshots, and Accessibility Evidence

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Produce the test, screenshot, and accessibility evidence required to close Wave E without overclaiming final 56/56 readiness.

## 3. Scope

- Validation and evidence only, unless a small source fix is required to make tests/evidence truthful.
- Tests, grep results, screenshots, keyboard/accessibility notes, and evidence index.

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

- `apps/project-control-center/src/tests/**`
- surface-local `*.test.tsx` / `*.test.ts`
- `apps/project-control-center/src/ui/*.test.tsx`
- evidence folders under the relevant Wave 15A closeout path
- this package's artifact templates.

## 7. Implementation Requirements

1. Run the required state-model, surface, disabled-action, and full PCC tests.
2. Add or update missing tests for state taxonomy, source-status mapping, disabled actions, and surface adoption.
3. Run forbidden-token grep and classify all remaining hits.
4. Capture screenshots where the local harness supports it.
5. If screenshots cannot be captured, create an operator-pending screenshot evidence index with exact filenames and capture instructions.
6. Validate loading/error accessibility semantics and disabled affordance reason chains.
7. Record keyboard behavior notes for disabled/inert controls.
8. Do not perform tenant-hosted validation unless explicitly authorized and environment is available.

## 8. Required Tests

Required:
- `pnpm --filter @hbc/spfx-project-control-center check-types`
- `pnpm --filter @hbc/spfx-project-control-center test`
- `pnpm --filter @hbc/spfx-project-control-center build`
- forbidden-token grep
- Prettier check on touched docs/test/source files.

## 9. Required Screenshot / Evidence Output

Evidence:
- `artifacts/screenshot-evidence-index-template.md` populated or equivalent closeout file.
- test command transcript/results.
- accessibility/keyboard notes.
- screenshot file list or operator-pending list.
- scorecard impact draft.

## 10. Scorecard Impact

Improves validation and closure proof, accessibility/keyboard confidence, state-model completeness, host-runtime resilience evidence, and hard-stop risk reduction.

## 11. Closeout Requirements

Closeout must include:
- tests/commands/results;
- screenshot files or operator-pending index;
- accessibility notes;
- grep results;
- exact files changed;
- residual risks and evidence gaps.

## 12. Stop Conditions

Stop and report before making further changes if:

- Test environment is broken for reasons unrelated to Wave E.
- Screenshot capture is impossible in the agent environment.
- A validation failure points to backend/model/shell scope outside Wave E.
- Evidence would imply tenant validation that was not actually performed.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
