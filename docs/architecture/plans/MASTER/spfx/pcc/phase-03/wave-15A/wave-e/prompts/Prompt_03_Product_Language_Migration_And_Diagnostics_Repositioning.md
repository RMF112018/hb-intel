# Prompt 03 — Product Language Migration and Diagnostics Repositioning

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Verify or complete migration of developer-facing preview/read-model/wave/fixture language out of primary PCC UI and into product-grade operational copy.

## 3. Scope

- Product-language strings in primary UI, aria text, labels, chips, card text, and headers.
- Diagnostics repositioning only where developer/build/wave/read-model language appears in primary hierarchy.
- Do not redesign layouts or change data contracts.

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

- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/surfaces/**`
- `apps/project-control-center/src/preview/projectPlaceholder.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- adapter constants under project readiness, lifecycle, responsibility matrix, constraints log, buyout log, approvals, external systems, documents, and team access.

## 7. Implementation Requirements

1. Run forbidden-token grep before edits.
2. Classify hits as user-visible, test-only, comment-only, admin diagnostics, or internal type literal.
3. Replace user-visible developer vocabulary with approved product language.
4. Keep product copy centralized where possible.
5. Move diagnostic/build/source implementation detail to admin/debug contexts or closeout docs.
6. Do not scrub useful internal comments unless they are visible in UI or aria text.
7. Keep product copy concise and business-user-readable.

## 8. Required Tests

Required if source changes:
- `pnpm --filter @hbc/spfx-project-control-center check-types`
- relevant component/surface tests
- full PCC test run if many surfaces change
- forbidden-token grep after edits
- Prettier check on touched files.

## 9. Required Screenshot / Evidence Output

Evidence:
- Before/after forbidden-token grep table.
- List of strings replaced.
- List of intentionally retained non-user-visible hits and rationale.
- Screenshots only if language changes materially affect layout or hierarchy.

## 10. Scorecard Impact

Improves product confidence, purpose-fit sophistication, state-model clarity, visual hierarchy, and validation proof. Does not by itself satisfy interaction completeness unless disabled controls are also addressed.

## 11. Closeout Requirements

Closeout must include:
- exact files changed;
- replacement language summary;
- grep results;
- tests run;
- residual copy review items;
- confirmation that no final 56/56 claim is made.

## 12. Stop Conditions

Stop and report before making further changes if:

- Language choice requires a business/product-owner decision that cannot be inferred.
- Developer vocabulary appears only in comments/tests/docs and no user-facing defect exists.
- Proposed copy change would alter workflow meaning.
- The surface requires missing data fields not available in current view models.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
