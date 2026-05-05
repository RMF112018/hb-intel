# Prompt 02 — Shared Shell, Host Fit, and Navigation

## Role

You are the PCC shared shell and navigation remediation agent.

## Objective

Remediate shell dominance, SharePoint host fit, navigation hierarchy, and workflow/status-aware surface selection.

## Scope

`PccApp`, `PccShell`, `PccSurfaceRouter`, app manifests/package configuration, shell CSS, navigation components, and tests that prove routing/host-fit behavior.

## Non-Scope

No surface-specific content redesign beyond seams required to support shell/nav contract. No backend/API work.

## Required Repo-Truth Inspection

Inspect `apps/project-control-center/src/PccApp.tsx`, `src/shell/**`, SPFx manifests/package config, shell CSS, routing tests, doctrine host-fit docs, and current evidence screenshots.

## Required Implementation Work

Adjust shared shell/nav structure to reduce visual dominance, improve host fit, communicate active surface and workflow/status, preserve router semantics, and avoid one-off styling. Add or update shell/nav docs as needed.

## Required Tests

Run typecheck, PCC test suite or focused shell/router tests, build if available, and prettier on changed files.

## Required Screenshot / Evidence Output

Capture before/after screenshots for shell/nav at desktop wide, SharePoint constrained, tablet, and narrow container. Update screenshot index.

## Scorecard Impact

Targets shell/host fit, navigation/IA, command-center hierarchy, responsive/container behavior, and product confidence categories.

## Closeout Requirements

Create Prompt 02 closeout with exact files changed, screenshots, command results, scorecard categories affected, and residual issues.

## Stop Conditions

Stop if route architecture conflicts with existing permissions/read-model contracts, if tenant-host fit cannot be validated locally and no fallback screenshot evidence can be captured, or if changes require backend/API work.

## Standing Instruction

Do not re-read files still within your current context unless exact wording, line references, or changed repo state must be verified.

Begin with repo-truth inspection. Avoid unrelated changes. Avoid feature creep. Prefer shared primitives over one-off local styling. Update closeout documentation. Report exact files changed, commands run, validation results, residual issues, and any stop conditions.
