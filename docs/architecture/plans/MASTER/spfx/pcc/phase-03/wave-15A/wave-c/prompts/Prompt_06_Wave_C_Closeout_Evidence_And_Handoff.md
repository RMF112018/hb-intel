# Prompt 06 — Wave C Closeout Evidence and Handoff

## Role

You are the local code agent acting as the implementation executor for PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard.

## Objective

Create the Wave C closeout and handoff record with evidence, scorecard impact, residual risks, and next-wave recommendations.

## Scope

Documentation and closeout only unless a validation rerun identifies minor doc formatting issues.

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
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/PROMPT_06_CLOSEOUT.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/evidence/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/
```


## Implementation requirements

1. Summarize what changed by prompt.
2. List exact changed files.
3. Include command evidence.
4. Include screenshot/evidence index.
5. State scorecard categories improved without overclaiming.
6. State tenant-hosted evidence status.
7. State residual risks and deferments.
8. Identify the next Wave 15A prompt/wave.
9. If package files should be moved/copied into canonical docs, specify exact paths.

## Required tests

Run markdown formatting validation:

```bash
pnpm exec prettier --check "<changed markdown files>"
```

If final closeout references runtime validation, confirm the commands were already run in Prompt 05 or rerun them.

## Required screenshot/evidence output

Update the evidence index and closeout. Do not fabricate screenshots or tenant proof.

## Scorecard impact

Improves validation and closure proof. Does not itself change runtime score unless it records evidence from prior prompts.

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

- evidence is missing but closeout claims it exists;
- validation failed without clear residual-risk disclosure;
- closeout implies final `56/56`;
- tenant evidence is represented as complete when only simulated screenshots exist.

## Next step

Wave C is complete after closeout. Handoff remaining evidence gaps to the later Wave 15A final validation wave.
