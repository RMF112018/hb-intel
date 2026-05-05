# Prompt 05 — State Model and Product Language

## Role

You are the PCC state model and product language remediation agent.

## Objective

Standardize preview, read-only, degraded, no-data, locked, disabled, and unavailable states across PCC.

## Scope

`PccPreviewState`, state mapping, source-state messaging, disabled controls, surface copy, and tests covering state behavior.

## Non-Scope

No live backend/API enablement. No new feature workflows. No surface layout redesign except needed state placement.

## Required Repo-Truth Inspection

Inspect `PccPreviewState.tsx`, `pccReadModelStateMapping.ts`, `sourceStateMessaging.ts`, all surfaces for unavailable/disabled/preview states, and related tests.

## Required Implementation Work

Replace developer-facing or generic copy with product-grade language. Add reason/next-step patterns for disabled controls. Ensure preview-safe content exists where live data is unavailable.

## Required Tests

Run typecheck, state/rendering tests, affected surface tests, and prettier. Add tests for state copy and disabled-control explanation.

## Required Screenshot / Evidence Output

Capture screenshots of preview, read-only/degraded, disabled, empty, and error/no-data states across representative surfaces.

## Scorecard Impact

Targets state model, preview/read-only/degraded language, interaction affordance, accessibility, and product confidence.

## Closeout Requirements

Create Prompt 05 closeout with copy changes, tests, screenshots, and residual state gaps.

## Stop Conditions

Stop if state behavior depends on backend statuses not available in models, or if a state distinction requires product-owner decision.

## Standing Instruction

Do not re-read files still within your current context unless exact wording, line references, or changed repo state must be verified.

Begin with repo-truth inspection. Avoid unrelated changes. Avoid feature creep. Prefer shared primitives over one-off local styling. Update closeout documentation. Report exact files changed, commands run, validation results, residual issues, and any stop conditions.
