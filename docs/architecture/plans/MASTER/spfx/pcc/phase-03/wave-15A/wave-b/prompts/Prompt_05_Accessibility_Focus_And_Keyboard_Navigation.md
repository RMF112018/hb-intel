# Prompt 05 — Accessibility, Focus, and Keyboard Navigation

## Role

You are the PCC Wave B accessibility and keyboard remediation agent.

## Objective

Harden shell/nav/command accessibility, focus-visible behavior, keyboard traversal, semantic grouping, and disabled/inert affordance explanations.

## Scope

Nav, shell, command/search, project context, focus styles, and accessibility tests.

## Non-Scope

No visual redesign beyond accessibility/supporting state refinements. No backend/API scope.

## Required Repo-Truth Inspection

Inspect Prompt 01–04 closeouts, `PccNavigationRail.*`, `PccCommandSearch.tsx`, header/context components, disabled affordance helper if present, state language standards, and existing accessibility tests.

## Exact or Best-Known Source Areas

Likely files: nav/header/search components and CSS, tests. Reuse existing `PccDisabledAffordance` if present; otherwise create a narrow shell-local helper only if needed.

## Implementation Requirements

Ensure semantic nav/group labels; active route uses `aria-current`; focus-visible styles are clear; keyboard traversal works; disabled/read-only controls explain reason/next step; status cues are not color-only.

## Required Tests

Testing Library tests for focus traversal, activation, semantic labels, disabled/read-only semantics, status cue text, and active states. Run typecheck/tests/build.

## Required Screenshot / Evidence Output

Capture focus-visible screenshot and reduced/narrow mode keyboard evidence if feasible. Log any screen-reader-only assumptions.

## Scorecard Impact

Targets accessibility/keyboard behavior, interaction completeness, state clarity, and hard-stop risk reduction.

## Closeout Requirements

Create Prompt 05 closeout with accessibility assertions, tests, screenshots, and residual risks.

## Stop Conditions

Stop if critical accessibility behavior cannot be proven with current test tools; document required tool or manual validation.


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
