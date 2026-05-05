# Prompt 06 — Surface Route Validation and Cross-Surface Smoke Tests

## Role

You are the PCC Wave B cross-surface validation agent.

## Objective

Prove the remediated shell/nav/host frame works across every current PCC surface without redesigning the surfaces.

## Scope

Routing, shell integration, all-surface smoke tests, screenshot index, evidence docs.

## Non-Scope

No new feature implementation, no backend/API, no surface content rewrite except fixing shell integration regressions caused by Wave B.

## Required Repo-Truth Inspection

Inspect Prompt 01–05 closeouts, `PccSurfaceRouter.tsx`, all surface entry components, existing surface tests, all shell/nav tests, and screenshot evidence plan.

## Exact or Best-Known Source Areas

Likely files: `PccSurfaceRouter.tsx`, surface tests under `src/tests/**`, evidence docs/templates.

## Implementation Requirements

Add or update tests to render each surface inside the updated shell, verify nav active state changes, verify project-context persistence, and detect route/render failures. Preserve read-model seam rules.

## Required Tests

Run all PCC tests, typecheck, and build. Include any no-runtime guard tests already present.

## Required Screenshot / Evidence Output

Capture/index one after screenshot per surface at desktop/constrained mode, plus any failure screenshots.

## Scorecard Impact

Targets validation/closure proof, host/runtime resilience, route confidence, and product confidence.

## Closeout Requirements

Create Prompt 06 closeout with test matrix, screenshot matrix, exact residual surface-level blockers for Wave C/F/G/H.

## Stop Conditions

Stop if any surface fails to render inside the updated shell; fix shell integration if in scope, otherwise log as surface-wave blocker.


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
