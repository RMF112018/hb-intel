# Prompt 01 — Project Context Scope Lock and File Map

## Role

You are the local code agent acting as the implementation executor for PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard.

## Objective

Validate the current repo-truth state for Wave C, confirm whether the shared surface context/header implementation already exists, and produce a source-file map before any runtime changes.

## Scope

Docs and audit only unless a tiny file-map artifact is created. No runtime source changes in this prompt.

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

Likely changed/created docs only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/source-file-map.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/PROMPT_01_SCOPE_LOCK.md
```

Do not modify `apps/project-control-center/src` in Prompt 01.

## Implementation requirements

1. Confirm current branch commit and whether it includes Prompt 03 and Prompt 05.
2. Confirm whether `PccSurfaceContextHeader` exists and where it is used.
3. Confirm all eight `PCC_MVP_SURFACE_IDS` route through `PccSurfaceRouter`.
4. Identify project context source candidates:
   - `PCC_PROJECT_PLACEHOLDER`
   - `SAMPLE_PROJECT_PROFILE`
   - read-model envelopes
   - selected project state.
5. Document hard-coded project labels by file and line.
6. Document current tests that must be preserved.
7. Define whether Prompt 02 should implement or harden the shared primitive.

## Required tests

Run no full test suite unless local convention requires it for docs-only changes. At minimum run Prettier on changed markdown:

```bash
pnpm exec prettier --check "<changed markdown files>"
```

If no files are changed, report no validation required.

## Required screenshot/evidence output

Create a source-file map artifact that lists:

- current owner file;
- responsibility;
- whether it should change in Prompt 02/03/04;
- validation coverage;
- risk notes.

No screenshots required in Prompt 01.

## Scorecard impact

Prompt 01 has no direct score improvement. It protects doctrine compliance by preventing wrong-file edits and redundant implementation.

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

- repo state is not clean and changes are unrelated to Wave C;
- Prompt 03 implementation is missing and this package needs to switch from hardening to implementation mode;
- Wave B shell/nav is absent or broken;
- required source files cannot be found.

## Next step

Proceed to `Prompt_02_Shared_Project_Context_Model_And_Surface_Header_Component.md` after the file map is complete.
