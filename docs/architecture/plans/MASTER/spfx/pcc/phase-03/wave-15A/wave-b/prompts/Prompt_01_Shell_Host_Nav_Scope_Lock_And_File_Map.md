# Prompt 01 — Shell / Host / Navigation Scope Lock and File Map

## Role

You are the PCC Wave 15A / Wave B scope-lock and file-map agent. You are not implementing runtime UI changes in this prompt.

## Objective

Validate Wave B scope, refresh repo truth locally, identify exact source ownership, confirm tests and screenshot requirements, and prepare the repo for shell frame and project-context implementation.

## Scope

Documentation and audit only: source inventory, current tests, visual evidence folders, command baseline, exact file map, stop conditions, and Prompt 02 readiness.

## Non-Scope

No runtime UI changes. No CSS changes. No component changes. No backend/API work. No package/manifest changes unless only documenting current truth.

## Required Repo-Truth Inspection

Inspect `apps/project-control-center/README.md`, `package.json`, `src/PccApp.tsx`, `src/state/usePccShellState.ts`, `src/preview/projectPlaceholder.ts`, `src/shell/**`, `src/layout/**`, `src/tests/**`, Wave 15A blueprint and MASTER plan docs, doctrine docs, SPFx scorecard/checklist/evidence docs, and any existing evidence folders.

## Exact or Best-Known Source Areas

Likely source ownership to confirm: `PccShell`, `PccNavigationRail`, `PccProjectIntelligenceHeader`, `PccCommandSearch`, `PccSurfaceRouter`, `PccBentoGrid`, project placeholder/state files, and shell/nav tests.

## Implementation Requirements

Produce a local source file map, current-state notes, exact test list, screenshot matrix, tenant evidence availability note, and a Prompt 02 go/no-go statement. Do not edit runtime source.

## Required Tests

Run `git status --short`, `md5 pnpm-lock.yaml`, and documentation formatting checks on any docs you change. Do not run full app checks unless needed; this prompt is audit-only.

## Required Screenshot / Evidence Output

Create or update an evidence plan/index, but do not require screenshots before Prompt 02 unless local process requires before captures. If before screenshots are available, index them.

## Scorecard Impact

Improves validation/closure proof and doctrine contract readiness; no runtime score increase may be claimed.

## Closeout Requirements

Create a Prompt 01 closeout under the Wave 15A blueprint path with file map, test map, evidence plan, command results, and explicit readiness for Prompt 02.

## Stop Conditions

Stop if Wave 15A docs conflict with this package, if local repo has uncommitted changes unrelated to Wave B, or if source ownership cannot be determined.


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
