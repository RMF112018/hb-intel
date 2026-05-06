# 00 — Wave D Repo-Truth Audit Findings

## Objective

Record the repo-truth baseline for PCC Phase 3 Wave 15A / Wave D and define what the local code agent must verify before implementation.

## Repo-Truth Baseline

- Repository: `RMF112018/hb-intel`
- Audited ref: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- PCC app root: `apps/project-control-center/`
- Recommended package placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Runtime implementation is **not** included in this package. This package is for a local code agent to execute in the repo.

## Non-Negotiables for the Local Agent

- Inspect repo truth before editing.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Preserve active routed-surface semantics: exactly one `[data-pcc-active-surface-panel]` per active route.
- Preserve the bento direct-child invariant unless a shared layout primitive explicitly replaces it.
- Prefer shared primitives and named contracts over one-off surface CSS.
- Do not introduce backend/API, Graph, PnP, Procore SDK, Document Crunch, Adobe Sign, CI, package-manager, or app-catalog scope.
- Do not claim final `56/56` readiness. Wave D can move layout/card/responsive/visual hierarchy categories, but final readiness requires Wave H-style tenant-hosted, screenshot, accessibility, keyboard, and regression evidence.

## Files / Areas Inspected During Package Preparation

- `Fresh_Session_Prompt_Wave15A_WaveD_Grid_Bento_Card_Layout(1).md`
- `apps/project-control-center/README.md`
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccShell.module.css`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.module.css`
- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `apps/project-control-center/src/layout/PccDashboardCard.module.css`
- `apps/project-control-center/src/layout/footprints.ts`
- `apps/project-control-center/src/layout/useContainerBreakpoint.ts`
- `apps/project-control-center/src/layout/useBentoRowSpan.ts`
- `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx`
- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`
- `apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.module.css`
- `apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`
- `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx`
- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx`
- `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/docs/00_WAVE_A_REPO_TRUTH_AUDIT_FINDINGS.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/docs/01_DOCTRINE_AUTHORITY_MATRIX.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/docs/02_CURRENT_PCC_UI_SYSTEM_INVENTORY.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-03/PROMPT_03_CLOSEOUT.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-04/PROMPT_04_CLOSEOUT.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-05/PROMPT_05_CLOSEOUT.md`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
- `docs/reference/ui-kit/AGENT-USAGE-GUIDE.md`
- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Host-Runtime-Validation-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`

## Confirmed Findings

1. **Shared bento/card primitives exist and are already partially remediated.** `PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, `useContainerBreakpoint`, and `useBentoRowSpan` exist under `apps/project-control-center/src/layout/`. Current code includes container-width modes, protected footprint spans, CSS grid variables, and row-span diagnostics.
2. **Wave 15A Prompt 04 has already changed the primitive layer.** The closeout records changes to `footprints.ts`, `PccBentoGrid`, `PccDashboardCard`, their CSS modules, `useBentoRowSpan`, and focused tests. Treat that closeout as baseline, not as final proof of product-grade surface composition.
3. **Card hierarchy is structurally shallow.** `PccDashboardCard` supports `hierarchy='primary' | 'standard' | 'supporting'` and `density='comfortable' | 'compact'`, but current surface usage generally relies on footprint names (`full`, `wide`, `standard`) rather than a doctrine-grade Tier 1 / Tier 2 / Tier 3 contract.
4. **Visual hierarchy remains dominated by footprint and card count.** Several routed surfaces render many peer `PccDashboardCard` children through fragments, with limited shared grouping semantics for command/operational/reference regions.
5. **Team & Access still needs explicit layout adoption.** The lane shell renders header, restricted-state card, Team Viewer, Permission Request, and Access Manager lanes as peer cards. A severe narrow-column collapse is a known evidence-backed issue from the Wave A baseline and Prompt 04 residual evidence, but current source now includes primitive fixes that must be verified against the specific Team & Access route.
6. **Project Readiness and Approvals are card-heavy surfaces.** Project Readiness combines framework, lifecycle, permit/inspection, responsibility matrix, constraints log, buyout log, Procore, and unified lifecycle regions. Approvals renders home, queue, my approvals, registry, escalation, admin verification, policy, module integration, decision history, lineage, and HBI boundary cards. Both require explicit command/operational/reference layout grouping.
7. **Documents, External Systems, Settings, and Site Health use meaningful cards but still need hierarchy normalization.** These surfaces expose header/summary/lane/queue/config/status cards; the package should standardize tiers and layout patterns without changing their read-model scope or command posture.
8. **Responsive proof exists at unit/component level but is not complete as product evidence.** Tests assert footprint spans, min spans, non-dense grid behavior, row span floor, and collapse resistance. Screenshot and tenant-hosted constrained-width proof remain incomplete/deferred.
9. **Accessibility heading structure is not currently enforced by the primitive contract.** `PccDashboardCard` emits an `h3` when given `title`. Surface-internal cards/subsections sometimes use `h4`. There is no explicit tier-aware heading-level contract in the primitive API.
10. **Shell host-fit and surface context dependencies are partially complete.** Prompt 03 introduced the shared `PccSurfaceContextHeader`; Prompt 04 remediated primitives; Prompt 05 remediated state/copy. This Wave D package must not undo those baselines and must document any remaining dependency on Wave B/C-style shell/context work.

## Confirmed Prior Wave Inputs

| Input | Repo-truth status | Effect on Wave D |
| --- | --- | --- |
| Wave A baseline / doctrine audit | Found under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/` | Establishes doctrine deviations, evidence gaps, and known layout issues. |
| Wave B shell/host fit package | Not confirmed as a discrete `wave-b` package by search. | Wave D must not assume final shell remediation; constrained-host screenshots remain required. |
| Wave C surface header/project context | Functionally represented by Wave 15A Prompt 03 closeout and shared `PccSurfaceContextHeader`. | Wave D should preserve this primitive and avoid replacing it with ad hoc headers. |
| Wave D primitive remediation | Prompt 04 closeout exists and changed layout primitives. | Treat as baseline to verify/harden/adopt; do not blindly repeat work. |
| Wave E state/copy remediation | Prompt 05 closeout exists and changed state/copy primitives. | Do not reintroduce developer-facing state language. |

## Current Source Summary

- `PccShell` wraps routed content in `PccBentoGrid`; canvas is `main[data-pcc-canvas]`.
- `PccBentoGrid` derives responsive mode from container width and passes context to cards.
- `PccDashboardCard` resolves footprint to column span and dynamic row span.
- Surface components generally return fragments of direct `PccDashboardCard` children.
- Many surfaces have header cards carrying `data-pcc-active-surface-panel`.
- Tests exist for grid footprints and row-span collapse resistance.

## Confirmed Gaps Needing Local Verification

1. No proof that every current routed surface uses a Tier 1 / Tier 2 / Tier 3 hierarchy.
2. No global contract for command/operational/reference region markers at the surface level.
3. No primitive-level heading-level API for `PccDashboardCard`.
4. No complete screenshot matrix for all surfaces across desktop, SharePoint-constrained, tablet, and narrow-container modes.
5. No tenant-hosted proof for final layout confidence.
6. No proof that Team & Access collapse is fully remediated in the actual route under current SharePoint-like constraints.
7. No final 56/56 claim is supportable from current evidence.

## Local Agent Required Update

The local agent must update this file with:

- local `git rev-parse HEAD`;
- local `git status --short` before and after each prompt;
- exact paths changed;
- tests and screenshots produced;
- unresolved residual issues;
- scorecard category movement that is supported by evidence.
