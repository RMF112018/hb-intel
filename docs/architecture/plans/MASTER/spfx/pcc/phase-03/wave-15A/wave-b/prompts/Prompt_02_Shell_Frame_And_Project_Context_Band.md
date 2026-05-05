# Prompt 02 — Shell Frame and Project Context Band

## Role

You are the PCC Wave B shell-frame and project-context implementation agent.

## Objective

Reduce shell visual dominance and introduce/strengthen a compact persistent project-context band across all PCC surfaces.

## Scope

Shared shell/header/project context only. Preserve all routes and surface content except where minimal seams are needed to pass context through.

## Non-Scope

No surface redesign, backend/API work, live project data integration, Graph/PnP/SharePoint REST, or final 56/56 claim.

## Required Repo-Truth Inspection

Re-read only changed/current local versions of `PccApp.tsx`, `PccShell.tsx/css`, `PccProjectIntelligenceHeader.tsx/css`, `PccCommandSearch.tsx`, `projectPlaceholder.ts`, `usePccShellState.ts`, relevant tests, and Prompt 01 closeout.

## Exact or Best-Known Source Areas

`apps/project-control-center/src/shell/PccShell.*`, `PccProjectIntelligenceHeader.*`, possible new `PccProjectContextBand.*`, `PccApp.tsx`, `projectPlaceholder.ts`, tests.

## Implementation Requirements

Compact the primary header, subordinate diagnostic/preview text, establish a project-context band with project identity/status/source confidence/active surface, avoid duplicating Project Home detail, preserve stable data markers or migrate with tests, and ensure all surfaces render inside the updated shell.

## Required Tests

Run/update focused shell/header/app tests; then `pnpm --filter @hbc/spfx-project-control-center check-types` and focused/full test suite as appropriate.

## Required Screenshot / Evidence Output

Capture before/after screenshots for Project Home desktop wide and constrained mode. If screenshots cannot be captured, update the evidence gap log.

## Scorecard Impact

Targets shell/host fit, project context, hierarchy, token discipline, and product confidence categories.

## Closeout Requirements

Create Prompt 02 closeout with exact files changed, before/after evidence, command results, scorecard impact, and residual risks.

## Stop Conditions

Stop if implementation requires live read-model changes or breaks all-surface routing.


## Standing Instructions

- Inspect repo truth first.
- Do not rely on chat memory, assumptions, or prior summaries.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Avoid unrelated changes.
- Preserve architecture unless it conflicts with doctrine.
- Prefer shared primitives over one-off styling.
- Avoid backend/API scope creep.
- Update or create closeout documentation.
- Run repo-appropriate checks.
- Report exact files changed, command results, residual issues, and stop conditions.
- Never claim final 56/56 from Wave B alone.
