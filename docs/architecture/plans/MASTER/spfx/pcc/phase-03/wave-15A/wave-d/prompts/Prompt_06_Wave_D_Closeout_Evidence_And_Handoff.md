# Prompt 06 — Wave D Closeout Evidence and Handoff

## Role

You are the local code agent executing PCC Phase 3 Wave 15A / Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives.

## Objective

Finalize Wave D documentation, evidence, scorecard impact, residual risks, and handoff to the next Wave 15A remediation stage.

## Scope

- Documentation closeout and final validation summary.
- No runtime changes unless final doc/tests require small corrections.

## Non-Scope

- No new implementation scope.
- No retrospective code refactors.
- No final 56/56 claim without full evidence.

## Required Repo-Truth Inspection

- Inspect all Wave D changed files, tests, screenshot evidence, and git status.
- Re-check prior Wave 15A closeouts to avoid conflicting claims.
- Inspect scorecard/checklist docs before assigning category movement.

## Exact or Best-Known Source Areas to Change

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-D/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-D-grid-card-layout-remediation/`
- Markdown evidence/closeout files only unless a final broken link/path needs correction

## Implementation Requirements

- Write final closeout with exact evidence.
- Update package docs with actual files changed and test outputs.
- Record scorecard impact conservatively.
- Record residual issues and downstream wave dependencies.
- Confirm lockfile unchanged.
- Include first recommended next-wave prompt or handoff.

## Required Tests

- No new runtime tests unless final docs changed imports/paths.
- Re-run Prettier check on docs.
- Confirm prior test outputs are recorded exactly.

## Required Screenshot / Evidence Output

- Complete screenshot evidence index.
- Complete tenant evidence status.
- Complete scorecard impact template.
- Complete wave-agent closeout template.

## Scorecard Impact

Locks in supportable score movement only. Does not claim final score unless all final validation gates are actually complete.

## Closeout Requirements

Use the shared closeout format below and update/create Wave D evidence docs under the canonical Wave 15A paths.

## Stop Conditions

- Evidence index incomplete.
- Test outputs missing.
- Residual Team & Access failure unresolved.
- Lockfile drift unexplained.
- Claim language overstates readiness.

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

Wave D complete. Handoff to the next approved Wave 15A remediation prompt.
