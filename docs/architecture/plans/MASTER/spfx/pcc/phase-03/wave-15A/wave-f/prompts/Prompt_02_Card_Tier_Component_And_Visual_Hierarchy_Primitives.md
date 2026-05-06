# Prompt 02 — Card Tier Component and Visual Hierarchy Primitives

## Role

You are the local code agent executing PCC Phase 3 Wave 15A / Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives.

## Objective

Implement or finalize a shared Tier 1 / Tier 2 / Tier 3 card contract without breaking existing PCC card, bento, active-panel, or read-model behavior.

## Scope

- `PccDashboardCard` API/markers/styles.
- Shared tier/region/headings contract.
- Tests for primitive tier/region/headings behavior.
- Minimal documentation updates to record decisions.

## Non-Scope

- No per-surface layout adoption except a small smoke fixture if needed.
- No bento span redesign unless necessary to support tier contract.
- No data/read-model changes.

## Required Repo-Truth Inspection

- Re-read `PccDashboardCard.tsx`, `PccDashboardCard.module.css`, `PccBentoGrid.tsx`, `footprints.ts`, and existing tests.
- Inspect current usages of `hierarchy`, `density`, `footprint`, and `title`.
- Confirm whether any surface already passes `hierarchy` intentionally.

## Exact or Best-Known Source Areas to Change

- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `apps/project-control-center/src/layout/PccDashboardCard.module.css`
- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx` or new colocated primitive tests
- Wave D docs/evidence decision log

## Implementation Requirements

- Add `tier` and `region` props or a documented equivalent.
- Preserve existing `hierarchy` and `density` compatibility.
- Emit stable markers such as `data-pcc-card-tier` and `data-pcc-card-region`.
- Add or document heading-level control.
- Map visual hierarchy so Tier 1 > Tier 2 > Tier 3 without decorative noise.
- Keep active-panel marker on the card article when provided.

## Required Tests

- Primitive render tests for tier/region markers.
- Existing footprint tests still pass.
- Heading-level tests if heading API is added.
- No regression of active-panel marker.

## Required Screenshot / Evidence Output

- No full screenshot matrix required.
- Optional primitive story/harness screenshot if available.
- Update decision log with chosen tier API shape.

## Scorecard Impact

Improves card hierarchy, visual scan path, typography/heading discipline, and product confidence. Does not close surface composition until Prompt 04.

## Closeout Requirements

Use the shared closeout format below and update/create Wave D evidence docs under the canonical Wave 15A paths.

## Stop Conditions

- Type changes require broad model/package exports.
- Existing tests fail in unrelated areas.
- The primitive cannot support heading/tier without breaking active-panel invariants.

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

Proceed to `Prompt_03_Bento_Grid_Span_Responsive_And_Host_Fit_Primitives.md`.
