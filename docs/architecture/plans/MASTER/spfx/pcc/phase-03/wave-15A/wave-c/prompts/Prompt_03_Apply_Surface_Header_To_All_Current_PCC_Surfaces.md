# Prompt 03 — Apply Surface Header to All Current PCC Surfaces

## Role

You are the local code agent acting as the implementation executor for PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard.

## Objective

Apply the shared project context/header contract to all eight primary PCC surfaces and remove surface-level hard-coded project context drift.

## Scope

Surface integration only. No broad card redesign.

## Non-scope

- Do not build backend/API routes.
- Do not add Graph, PnP, Procore, Document Crunch, Adobe Sign, or live integration behavior.
- Do not change PCC surface ids or route ids unless repo truth proves a defect.
- Do not redesign the full UI beyond the context/header standard.
- Do not replace the Wave B shell/nav architecture.
- Do not claim final `56/56`.

## Required repo-truth inspection

Before changes, inspect:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx
apps/project-control-center/src/shell/PccNavigationRail.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
apps/project-control-center/src/ui/PccPreviewState.tsx
apps/project-control-center/src/ui/pccSurfacePostureCopy.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/tests/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/
```

Do not re-read files that are still within your current context or memory unless exact wording, line references, or changed repo state must be verified.

## Exact or best-known source areas to change

Likely source areas:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```


## Implementation requirements

1. Replace repeated labels such as `Project 26-000-00 · ...` with centralized helper/view model output.
2. Ensure every routed surface has exactly one primary surface context header.
3. Preserve exactly one `data-pcc-active-surface-panel` per route.
4. Keep the bento direct-child invariant.
5. Ensure every surface displays project identity, surface name/purpose, posture, source/freshness, and limitation/next action.
6. Do not change router ids or nav labels unless repo truth requires it.
7. Avoid duplicate hierarchy between shell active-surface context, surface context header, and card title.

## Required tests

Required focused tests:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center exec vitest run --config vitest.config.ts src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Also run impacted surface tests identified in the source map, then full PCC test suite before closeout if runtime changes are broad.

## Required screenshot/evidence output

Prepare screenshot targets for Prompt 05. If screenshots are captured now, place them under the Wave C evidence path and update the screenshot index.

## Scorecard impact

Materially improves project context, surface composition, command-center hierarchy, and product confidence. Does not close tenant evidence.

## Closeout requirements

At completion, report:

- exact files changed;
- exact tests/commands run and results;
- screenshot/evidence paths;
- residual risks;
- scorecard categories improved;
- whether tenant evidence exists or remains deferred;
- whether any stop condition occurred;
- next recommended prompt.

## Stop conditions

Stop if:

- any surface requires backend data to satisfy the header contract;
- applying the header breaks active-panel uniqueness;
- surface purpose cannot be shortened without product-owner decision;
- layout becomes visibly worse in constrained mode.

## Next step

Proceed to `Prompt_04_Project_Context_State_Source_Confidence_And_Responsive_Behavior.md`.
