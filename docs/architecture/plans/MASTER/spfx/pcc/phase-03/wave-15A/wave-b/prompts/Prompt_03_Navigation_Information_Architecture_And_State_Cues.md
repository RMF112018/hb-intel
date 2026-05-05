# Prompt 03 — Navigation Information Architecture and State Cues

## Role

You are the PCC Wave B navigation IA and state-cue remediation agent.

## Objective

Convert flat module navigation into operationally grouped navigation with refined active/hover/focus states and preview-safe status cues.

## Scope

`PccNavigationRail`, nav model/data helper, nav CSS, nav tests, and minimal shell integration.

## Non-Scope

No surface content redesign, no backend status integration, no invented live health/risk values, no routing architecture rewrite unless required by existing tests.

## Required Repo-Truth Inspection

Inspect Prompt 01/02 closeouts, `PccNavigationRail.tsx/css`, `PCC_MVP_SURFACES` usage, route tests, responsive modes, and doctrine accessibility/container-fit docs.

## Exact or Best-Known Source Areas

Likely files: `src/shell/PccNavigationRail.tsx`, `PccNavigationRail.module.css`, optional `PccNavigationModel.ts`, tests under `src/tests/**` or `PccApp.test.tsx`.

## Implementation Requirements

Group navigation as Command, Controls, Governance, Connected Systems; preserve all eight surface routes; add text+visual state/risk cues only from current data or neutral preview labels; refine active/hover/focus-visible states; preserve keyboard operation.

## Required Tests

Tests must verify group order, item order, active `aria-current`, keyboard focus movement, Enter/Space activation, all routes reachable, and no nav loss in responsive modes.

## Required Screenshot / Evidence Output

Capture screenshots for expanded rail, icon-only rail, top-strip mode, and narrow mode. Include active state and at least one focus-visible screenshot.

## Scorecard Impact

Targets navigation/IA, accessibility, interaction completeness, token discipline, responsive behavior, and executive polish.

## Closeout Requirements

Create Prompt 03 closeout with source diff summary, tests, screenshots, residual issues, and whether Prompt 04 can proceed.

## Stop Conditions

Stop if narrow mode cannot preserve navigation access without broader shell changes; document exact blocker.


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
