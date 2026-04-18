# Prompt 05 — Harden Breakpoint Presentation and Regression Coverage

## Objective

Protect the redesigned flagship rail from silent regression by hardening breakpoint presentation logic, visible-action budgeting proof, diagnostics, and automated or semi-automated regression coverage.

## Current condition

The repo already has strong infrastructure:
- shell entry-state resolution
- entry-stack policy budgets
- first-lane resolution
- shell conformance reporting
- priority-actions presentation normalization

The previous package acknowledged this, but did not require enough concrete proof that the redesigned rail continues to honor those budgets and postures.

## Why the current condition is inadequate

Visual redesigns often fail through subtle breakpoint drift, not obvious runtime errors. Without stronger proof, the rail could look good on one desktop view and quietly violate mobile, tablet, or short-height expectations.

## Intended future state

The codebase should make it difficult to regress the flagship rail into:
- flat directory behavior
- weak visible-action discipline
- poor short-height behavior
- accidental desktop-only assumptions

## What done looks like

- visible primary actions remain capped by governed budgets
- overflow posture remains consistent with entry-stack policy
- short-height compact behavior remains intact
- compact / tablet / standard desktop states are proven
- diagnostics or test hooks make review easier

## Exact repo seams to inspect

- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/firstLaneResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- related tests and harnesses under homepage / shell / rail scopes

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

## Required implementation tasks

1. Review budget enforcement paths relative to the redesigned flagship surface.
2. Add or update regression coverage for key breakpoint and overflow cases.
3. Add or refine diagnostics / data attributes if they materially improve black-box validation.
4. Confirm no regression in first-lane visibility expectations.

## Constraints and anti-patterns

### Do not do these things
- do not loosen budgets just to make screenshots easier
- do not remove short-height compact behavior
- do not push shell concerns into the rail or vice versa
- do not skip tests/proof on the assumption that visual inspection is enough

## Proof of closure

Provide:
- tests added or updated
- breakpoint matrix reviewed
- explicit note on short-height and compact states
- explanation of how regression resistance improved

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
