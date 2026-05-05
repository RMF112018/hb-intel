# Prompt 04 — Grid, Bento, Card, and Layout Primitives

## Role

You are the PCC layout primitive remediation agent.

## Objective

Stabilize bento/grid/card hierarchy, prevent unusable layouts, and centralize card composition standards.

## Scope

`PccBentoGrid`, `PccDashboardCard`, `useBentoRowSpan`, layout CSS modules, card tests, footprint tests, and surface usage of layout primitives.

## Non-Scope

No surface-specific copy rewrites except where required to test card contracts. No backend/API scope.

## Required Repo-Truth Inspection

Inspect all layout primitives, usage sites across surfaces, footprint tests, doctrine bento/card standards, and current screenshots.

## Required Implementation Work

Implement shared footprint constraints, card hierarchy variants, minimum width/span protections, and density/token cleanup. Replace local one-off styling only when it violates doctrine and can be safely centralized.

## Required Tests

Run typecheck, layout/footprint tests, relevant surface tests, full PCC tests if feasible, and build. Add tests for narrow-column prevention and key card variants.

## Required Screenshot / Evidence Output

Capture before/after screenshots for grid-heavy surfaces and Team & Access at constrained widths.

## Scorecard Impact

Targets layout/grid/card system, responsive/container behavior, typography/spacing/tokens/color, surface composition, and product confidence.

## Closeout Requirements

Create Prompt 04 closeout with files changed, screenshot index updates, command results, and residual layout risks.

## Stop Conditions

Stop if remediation requires broad UI-kit changes outside PCC scope, or if layout constraints break critical surface content without a clear shared primitive path.

## Standing Instruction

Do not re-read files still within your current context unless exact wording, line references, or changed repo state must be verified.

Begin with repo-truth inspection. Avoid unrelated changes. Avoid feature creep. Prefer shared primitives over one-off local styling. Update closeout documentation. Report exact files changed, commands run, validation results, residual issues, and any stop conditions.

