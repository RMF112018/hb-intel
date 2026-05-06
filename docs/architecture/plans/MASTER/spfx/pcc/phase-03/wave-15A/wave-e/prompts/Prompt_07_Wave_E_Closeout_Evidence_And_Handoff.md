# Prompt 07 — Wave E Closeout Evidence and Handoff

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Produce the final Wave E closeout and handoff based on actual repo changes, tests, screenshots, accessibility notes, and residual risks.

## 3. Scope

- Documentation closeout only unless minor evidence-index corrections are needed.
- Summarize what Wave E changed or verified.
- Prepare next-wave handoff without claiming final 56/56.

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

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/`
- relevant prompt closeout folder for Wave E / Prompt 05 or local execution sequence
- generated evidence index
- scorecard impact template
- source file map
- package docs under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-E-state-model-product-language-remediation/` if committed.

## 7. Implementation Requirements

1. Collect Prompt 01-06 outputs.
2. Summarize final state taxonomy and source ownership.
3. Summarize user-facing language remediation.
4. Summarize disabled-action standard implementation.
5. Summarize surface adoption.
6. Include test and command evidence.
7. Include screenshot/accessibility evidence or operator-pending items.
8. Include residual risks and deferments.
9. State scorecard categories improved and categories not closed.
10. Recommend next local-agent prompt/wave.

## 8. Required Tests

Docs-only closeout:
- `pnpm exec prettier --check <closeout docs>`

If any runtime/test source changes are made by exception:
- rerun applicable PCC checks and report results.

## 9. Required Screenshot / Evidence Output

Evidence:
- Final source file map.
- Final scorecard impact table.
- Screenshot evidence index.
- Accessibility/keyboard notes.
- Test results.
- Lockfile MD5 before/after if any source changes were made.

## 10. Scorecard Impact

Improves validation and closure proof. It may support score movement in state-model completeness, interaction completeness, product confidence, and accessibility confidence. It cannot alone complete final 56/56.

## 11. Closeout Requirements

Closeout must include:
- concise objective summary;
- exact files inspected/changed;
- commands/results;
- evidence status;
- scorecard impact;
- residual risks/deferments;
- explicit statement that final 56/56 is not claimed unless all required Wave 15A evidence exists.

## 12. Stop Conditions

Stop and report before making further changes if:

- Runtime source still contains user-visible forbidden developer language.
- Disabled actions remain unexplained without documented exception.
- Tests fail for touched scope.
- Screenshot/evidence status is unknown.
- Someone asks you to claim tenant validation or 56/56 without evidence.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
