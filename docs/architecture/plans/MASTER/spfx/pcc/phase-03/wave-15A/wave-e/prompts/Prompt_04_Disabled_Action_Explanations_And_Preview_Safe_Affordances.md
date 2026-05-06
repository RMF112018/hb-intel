# Prompt 04 — Disabled Action Explanations and Preview-Safe Affordances

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Ensure every disabled/inert PCC action is either removed, replaced with a useful reference action, or paired with visible and accessible product-grade explanation.

## 3. Scope

- Disabled and inert actions across all current PCC surfaces.
- `PccDisabledAffordance` use, tests, and exceptions.
- No live action enablement.

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

- `apps/project-control-center/src/ui/PccDisabledAffordance.tsx`
- `apps/project-control-center/src/ui/PccDisabledAffordance.module.css`
- `apps/project-control-center/src/ui/PccDisabledAffordance.test.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/**`
- `apps/project-control-center/src/surfaces/approvals/**`
- `apps/project-control-center/src/surfaces/documents/**`
- `apps/project-control-center/src/surfaces/externalSystems/**`
- `apps/project-control-center/src/surfaces/controlCenterSettings/**`
- `apps/project-control-center/src/surfaces/projectReadiness/**`
- `apps/project-control-center/src/surfaces/siteHealth/**`
- `apps/project-control-center/src/surfaces/projectHome/**`

## 7. Implementation Requirements

1. Inventory all `<button disabled>`, `aria-disabled`, inert chips, disabled menu items, and action-looking spans.
2. For each, choose: active, reference action, disabled with reason, removed, or setup-required.
3. Use `PccDisabledAffordance` for visible inert controls unless a surface-specific approved equivalent already exists.
4. Ensure visible reason and optional next step are present.
5. Ensure `aria-describedby` resolves to visible text.
6. Ensure inert actions cannot invoke handlers.
7. Avoid hover-only explanations.
8. Preserve existing visual hierarchy and card footprints.

## 8. Required Tests

Required:
- `pnpm --filter @hbc/spfx-project-control-center check-types`
- `pnpm --filter @hbc/spfx-project-control-center test -- PccDisabledAffordance`
- affected surface tests, especially Approvals, Team & Access, Documents, External Systems
- full PCC test run if multiple surfaces change
- Prettier check on touched files.

## 9. Required Screenshot / Evidence Output

Evidence:
- Disabled-action inventory count before/after.
- For each disabled action: label, reason, next step, surface, file.
- Accessibility assertions for `aria-disabled` / `aria-describedby`.
- Screenshot list for representative disabled actions at normal and constrained widths.

## 10. Scorecard Impact

Improves interaction completeness, accessibility and keyboard behavior, state-model clarity, and executive polish. Also reduces hard-stop risk for dead CTA/broken interaction path.

## 11. Closeout Requirements

Closeout must include:
- files changed;
- disabled-action inventory;
- tests and results;
- screenshots captured or operator-pending;
- any exceptions with rationale.

## 12. Stop Conditions

Stop and report before making further changes if:

- You find live action behavior that should be enabled but requires backend/API work.
- A disabled action cannot be explained without product-owner decision.
- The action is part of a shared component outside PCC and changing it would affect unrelated apps.
- You cannot preserve accessibility semantics with current layout.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
