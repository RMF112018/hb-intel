# Prompt 03 — Bento Grid Span Responsive and Host-Fit Primitives

## Role

You are the local code agent executing PCC Phase 3 Wave 15A / Wave D — Grid, Bento, Card Hierarchy, and Layout Primitives.

## Objective

Verify and harden bento/grid/span behavior against narrow-column, dead-canvas, and SharePoint host-fit failures.

## Scope

- `PccBentoGrid`, `footprints.ts`, `useContainerBreakpoint`, `useBentoRowSpan`, shell/canvas CSS only where layout-host interaction requires it.
- Tests for modes, spans, row spans, and constrained containers.

## Non-Scope

- No surface-specific business restructuring.
- No brute-force all-card full-width changes.
- No local-dev-only media-query fixes that ignore container measurement.

## Required Repo-Truth Inspection

- Inspect Prompt 04 closeout and current primitive code.
- Inspect `PccShell` and canvas padding/flex behavior.
- Inspect tests for footprints and row-span collapse resistance.
- Inspect screenshot evidence gaps from Prompt 03/04 closeouts.

## Exact or Best-Known Source Areas to Change

- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.module.css`
- `apps/project-control-center/src/layout/footprints.ts`
- `apps/project-control-center/src/layout/useContainerBreakpoint.ts`
- `apps/project-control-center/src/layout/useBentoRowSpan.ts`
- `apps/project-control-center/src/shell/PccShell.module.css` only if needed
- Existing layout tests and any new focused tests

## Implementation Requirements

- Preserve container-based breakpoints.
- Preserve row-span floor and `scrollHeight` loop-break behavior.
- Confirm protected minimum spans are enough for Team & Access and card-heavy surfaces.
- Avoid `grid-auto-flow: dense` unless doctrine is explicitly changed.
- Ensure canvas uses available width without causing horizontal overflow.
- Keep phone mode single-column.

## Required Tests

- `PccBentoGrid.footprints.test.tsx` remains green.
- `useBentoRowSpan.test.tsx` remains green.
- Add tests for safe min-column CSS vars and/or shell/canvas mode if gaps exist.
- Run focused layout tests and full app tests.

## Required Screenshot / Evidence Output

- Capture preliminary before/after screenshots for Team & Access in constrained mode if runtime harness is available.
- Update screenshot evidence index with any captures or state why capture is deferred to Prompt 05.

## Scorecard Impact

Improves layout/grid composition and responsive/container behavior. Surface-level hierarchy score requires Prompt 04.

## Closeout Requirements

Use the shared closeout format below and update/create Wave D evidence docs under the canonical Wave 15A paths.

## Stop Conditions

- Fix requires changing router/surface read-model behavior.
- ResizeObserver changes cause test instability.
- Horizontal overflow remains unresolved in simulated constrained mode.

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

Proceed to `Prompt_04_Apply_Layout_Patterns_To_All_Current_PCC_Surfaces.md`.
