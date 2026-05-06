# Prompt 05 — Layout Tests Responsive Smoke and Screenshot Evidence

## Role

You are the local code agent executing PCC Phase 3 Wave 15A / Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives.

## Objective

Run full Wave D validation, add missing smoke tests, and capture screenshot evidence across all routed surfaces and required modes.

## Scope

- Tests, screenshot capture, evidence docs, and small test-only adjustments.
- Minor implementation fixes only when validation finds Wave D regressions.

## Non-Scope

- No new feature work.
- No subjective visual polish outside acceptance failures.
- No tenant final readiness claim unless tenant evidence is actually captured and documented.

## Required Repo-Truth Inspection

- Inspect all changed files from Prompts 02–04.
- Inspect existing screenshot harness / Playwright / dev harness commands if present.
- Inspect Prompt 03/04 screenshot limitations and resolve non-home narrow route capture if possible.

## Exact or Best-Known Source Areas to Change

- `apps/project-control-center/src/tests/**`
- Relevant colocated tests
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/evidence/**`
- Any existing screenshot harness files if repo truth locates them

## Implementation Requirements

- Add missing tests for all required surface/tier/responsive assertions.
- Capture screenshots for all surfaces/modes.
- Document acceptance pass/fail per screenshot.
- Fix only Wave D regressions found during validation.

## Required Tests

- `pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit`
- `pnpm --filter @hbc/spfx-project-control-center test`
- `pnpm --filter @hbc/spfx-project-control-center build`
- `pnpm exec prettier --check <changed files>`

## Required Screenshot / Evidence Output

- Populate screenshot evidence index.
- Store before/after captures where available.
- Identify missing tenant-hosted evidence separately from local/simulated evidence.

## Scorecard Impact

Provides evidence for layout/grid, responsive behavior, card hierarchy, scan path, and product confidence movement. Does not complete tenant/final accessibility gates alone.

## Closeout Requirements

Use the shared closeout format below and update/create Wave D evidence docs under the canonical Wave 15A paths.

## Stop Conditions

- Required tests fail and cannot be resolved within Wave D.
- Screenshot harness cannot capture non-home routes and no workaround is documented.
- Team & Access constrained screenshot still fails acceptance.

## Instruction on Context Reuse

Do not re-read files that are still within your current context unless exact wording, line references, or changed repo state must be verified.

## Shared Instructions

## Repo-Truth Baseline

- Repository: `RMF112018/hb-intel`
- Audited ref: `a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- PCC app root: `apps/project-control-center/`
- Recommended package placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Runtime implementation is **not** included in this package. This package is for a local code agent to execute in the repo.

## Non-Negotiables for the Local Agent

- Inspect repo truth before editing.
- Do not re-read files still within current context unless exact wording, line references, or changed repo state must be verified.
- Preserve active routed-surface semantics: exactly one `[data-pcc-active-surface-panel]` per active route.
- Preserve the bento direct-child invariant unless a shared layout primitive explicitly replaces it.
- Prefer shared primitives and named contracts over one-off surface CSS.
- Do not introduce backend/API, Graph, PnP, Procore SDK, Document Crunch, Adobe Sign, CI, package-manager, or app-catalog scope.
- Do not claim final `56/56` readiness. Wave D can move layout/card/responsive/visual hierarchy categories, but final readiness requires Wave H-style tenant-hosted, screenshot, accessibility, keyboard, and regression evidence.

## Required Closeout Format

At the end of this prompt, report:

- exact files inspected;
- exact files changed;
- tests run and results;
- screenshots/evidence produced;
- lockfile MD5 before/after if any source/docs changed;
- residual issues;
- stop conditions encountered;
- next prompt to execute.

## Next Prompt

Proceed to `Prompt_06_Wave_D_Closeout_Evidence_And_Handoff.md`.
