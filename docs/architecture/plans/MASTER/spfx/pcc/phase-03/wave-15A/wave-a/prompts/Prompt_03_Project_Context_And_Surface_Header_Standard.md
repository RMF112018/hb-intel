# Prompt 03 — Project Context and Surface Header Standard

## Role

You are the PCC project context and surface header standardization agent.

## Objective

Create and apply a consistent project context and surface header pattern across routed PCC surfaces.

## Scope

Shared project context component/header standard, surface header integration, active project identity/status/source-confidence/last-updated patterns.

## Non-Scope

No deep grid/card hierarchy remediation. No backend/API changes. No per-surface redesign beyond header/context adoption.

## Required Repo-Truth Inspection

Inspect Project Home, Team & Access, Documents, Project Readiness, Approvals, External Systems, Control Center Settings, Site Health, shared shell/header areas, view models, and related tests.

## Required Implementation Work

Define shared header/context primitive if absent or refactor existing shared pieces. Apply consistently to all primary surfaces. Explain preview/read-only context without developer-facing copy.

## Required Tests

Run typecheck, focused surface rendering tests, full PCC tests if feasible, and prettier. Add tests that each primary surface renders required context/header contract.

## Required Screenshot / Evidence Output

Capture before/after screenshots showing header/context consistency across all primary surfaces.

## Scorecard Impact

Targets project context, surface composition, command-center hierarchy, typography/spacing, and product confidence.

## Closeout Requirements

Create Prompt 03 closeout with files changed, screenshots, tests, and any surfaces deferred with reason.

## Stop Conditions

Stop if project context data source is ambiguous and would require backend changes, or if applying shared header breaks route/test assumptions.

## Standing Instruction

Do not re-read files still within your current context unless exact wording, line references, or changed repo state must be verified.

Begin with repo-truth inspection. Avoid unrelated changes. Avoid feature creep. Prefer shared primitives over one-off local styling. Update closeout documentation. Report exact files changed, commands run, validation results, residual issues, and any stop conditions.

