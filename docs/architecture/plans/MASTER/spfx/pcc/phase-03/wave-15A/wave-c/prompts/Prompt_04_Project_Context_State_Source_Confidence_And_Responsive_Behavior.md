# Prompt 04 — Project Context State, Source Confidence, and Responsive Behavior

## Role

You are the local code agent acting as the implementation executor for PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard.

## Objective

Harden the state/source confidence mapping, next-action language, and responsive behavior of the shared surface header across PCC.

## Scope

State/source/responsive/accessibility hardening only.

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
apps/project-control-center/src/ui/pccSurfacePostureCopy.ts
apps/project-control-center/src/ui/PccPreviewState.tsx
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/surfaces/*/**/*ViewModel*.ts
apps/project-control-center/src/tests/
```


## Implementation requirements

1. Map loading/error/unavailable/reference posture consistently.
2. Use `generatedAtUtc` only where available and label it accurately.
3. Use `Not listed` when freshness is unknown.
4. Add next-action/limitation fields to the shared header where feasible.
5. Ensure admin-managed or read-only workflows are explicit.
6. Update CSS so the context header wraps cleanly and remains useful in constrained widths.
7. Verify no color-only critical meaning.
8. Preserve `PccPreviewState` `role=alert` and `aria-busy` behavior.

## Required tests

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
```

If CSS/responsive changes are material, run existing shell/responsive tests and add or update context-specific responsive tests.

## Required screenshot/evidence output

Capture preliminary screenshots if possible for:

- one wide surface;
- one constrained surface;
- one loading/error state if easy to force in test harness.

Full screenshot matrix remains Prompt 05.

## Scorecard impact

Improves state-model completeness, data/contract seam rigor, responsive/container-fit quality, accessibility, and product confidence.

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

- source confidence cannot be represented truthfully from current data;
- responsive fix requires rewriting bento/grid primitives;
- a11y defects are found that require broader shell redesign.

## Next step

Proceed to `Prompt_05_Cross_Surface_Context_Tests_And_Screenshot_Evidence.md`.
