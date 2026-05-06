# Prompt 05 — Apply State Model to All Current PCC Surfaces

## 1. Role

You are the local code agent for HB Intel PCC Phase 3 Wave 15A / Wave E — State Model and Product Language. You are acting as a repo-truth-first implementation and verification agent.

## 2. Objective

Verify or apply the Wave E state model across every routed PCC surface and the router fallback.

## 3. Scope

- Surface adoption only.
- Ensure state copy explains availability, disabled capability, reason, next action, and owner where relevant.
- Keep layout and data contracts stable unless a state model defect requires narrow adjustment.

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

- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/surfaces/teamAccess/**`
- `apps/project-control-center/src/surfaces/documents/**`
- `apps/project-control-center/src/surfaces/projectReadiness/**`
- `apps/project-control-center/src/surfaces/approvals/**`
- `apps/project-control-center/src/surfaces/externalSystems/**`
- `apps/project-control-center/src/surfaces/controlCenterSettings/**`
- `apps/project-control-center/src/surfaces/siteHealth/**`
- related adapters/view models/tests.

## 7. Implementation Requirements

1. Work surface-by-surface in the order listed in `docs/03_SURFACE_STATE_USAGE_INVENTORY.md`.
2. For each surface, verify loading, empty, error, unavailable/setup, degraded/blocked, read-only/preview, and authorization states where relevant.
3. Replace generic placeholders with operational state copy.
4. Ensure fallback states do not dominate the surface where useful records exist.
5. Ensure state severity is visible and meaningful.
6. Keep Project Home and other first-scan surfaces focused on operational priorities, not banners.
7. Update tests as you migrate each surface.
8. Record any not-applicable state with rationale.

## 8. Required Tests

Required:
- affected surface tests
- `pnpm --filter @hbc/spfx-project-control-center check-types`
- `pnpm --filter @hbc/spfx-project-control-center test`
- `pnpm --filter @hbc/spfx-project-control-center build` if runtime source changes
- Prettier check on touched files.

## 9. Required Screenshot / Evidence Output

Evidence:
- Surface-by-surface state matrix.
- Before/after screenshot requirements for surfaces changed.
- Screenshot index entries even when operator-pending.
- Forbidden-token grep after surface adoption.

## 10. Scorecard Impact

Improves state-model completeness, surface composition/hierarchy, purpose-fit sophistication, contract/data seam rigor, interaction completeness, and product confidence. Does not close tenant evidence.

## 11. Closeout Requirements

Closeout must include:
- per-surface findings;
- files changed;
- tests run;
- screenshots/evidence status;
- residual surface risks;
- next prompt recommendation.

## 12. Stop Conditions

Stop and report before making further changes if:

- A surface requires missing data fields or backend changes.
- Surface has unresolved architecture from prior wave.
- State model change would require route ID or model package change.
- Screenshots reveal a layout issue that belongs to another wave; document and defer if outside scope.

## 13. Context Efficiency Instruction

Do not re-read files that are still within your current context or memory. Re-open a file only when you need exact wording, line references, or proof that repo state changed after your last inspection.
