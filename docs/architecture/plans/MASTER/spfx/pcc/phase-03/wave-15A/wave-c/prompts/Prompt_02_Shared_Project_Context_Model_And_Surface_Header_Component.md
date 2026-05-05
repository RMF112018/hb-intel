# Prompt 02 — Shared Project Context Model and Surface Header Component

## Role

You are the local code agent acting as the implementation executor for PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard.

## Objective

Create or harden the shared project context model and surface header component so every routed PCC surface can consume the same normalized context contract.

## Scope

Shared model/helper/component work only. Do not yet touch every surface unless required to preserve compilation.

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
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx
apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.module.css
apps/project-control-center/src/surfaces/shared/pccSurfaceHeaderViewModel.ts
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Only create `pccSurfaceHeaderViewModel.ts` if no existing equivalent exists.

## Implementation requirements

1. Preserve existing `PccSurfaceContextHeader` markers.
2. Add a normalized header view model or equivalent helper.
3. Centralize project label construction.
4. Centralize posture/source/freshness display rules.
5. Add optional fields for lifecycle/status, next action, and limitation.
6. Add accessible region name.
7. Preserve backward compatibility where needed so Prompt 03 can migrate surfaces incrementally.
8. Do not imply live source confidence when only fixture/reference data exists.
9. If runtime files change, bump SPFx package/webpart version according to current repo convention.

## Required tests

Run focused tests first:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center exec vitest run --config vitest.config.ts src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Then run broader app tests if source changes are material:

```bash
pnpm --filter @hbc/spfx-project-control-center test
```


## Required screenshot/evidence output

No screenshots required yet unless component CSS changes materially affect layout. Document any screenshot deferment for Prompt 05.

## Scorecard impact

Can improve state-model clarity, contract/data seam rigor, accessibility baseline, and shared-system consistency. Do not claim full visual or surface score movement yet.

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

- the existing component has unknown downstream consumers that would break from a prop change;
- no reliable project context source exists and a design decision is needed;
- type changes require `@hbc/models` export changes outside this prompt's intended scope.

## Next step

Proceed to `Prompt_03_Apply_Surface_Header_To_All_Current_PCC_Surfaces.md`.
