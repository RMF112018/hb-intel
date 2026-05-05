# Prompt 05 — Cross-Surface Context Tests and Screenshot Evidence

## Role

You are the local code agent acting as the implementation executor for PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard.

## Objective

Prove the Wave C project context/header standard across every current PCC surface with tests and screenshot evidence.

## Scope

Testing, evidence, and small bug fixes only.

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
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccProjectContext.propagation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/evidence/
```

Only touch runtime source if tests or screenshots reveal Wave C defects.

## Implementation requirements

1. Add/extend semantic tests beyond marker presence.
2. Test project identity persistence after route changes.
3. Test one active panel per route.
4. Test source/posture/next-action fields.
5. Test accessible region naming.
6. Capture screenshot matrix for all surfaces and required breakpoints.
7. Document any harness limitations, especially non-home narrow mode.

## Required tests

Run final validation set:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check "<changed files>"
```


## Required screenshot/evidence output

Required evidence:

- screenshot evidence index;
- desktop wide screenshots for all eight surfaces;
- SharePoint constrained simulated screenshots for all eight surfaces;
- tablet screenshots for all eight surfaces;
- narrow screenshots where harness allows;
- notes for any missing evidence;
- test output summary.

## Scorecard impact

Improves validation and closure proof, responsive/container fit, accessibility/keyboard confidence, and product confidence. Does not close tenant-hosted proof unless tenant evidence is actually captured.

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

- any surface lacks context header;
- context values differ across route changes for the same project;
- screenshot evidence shows overflow or unusable context;
- full test suite fails due in-scope changes.

## Next step

Proceed to `Prompt_06_Wave_C_Closeout_Evidence_And_Handoff.md`.
