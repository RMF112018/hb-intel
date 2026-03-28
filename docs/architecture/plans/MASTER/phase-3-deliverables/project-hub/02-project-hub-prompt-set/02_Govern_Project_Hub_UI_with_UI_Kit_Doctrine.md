# Prompt 02 — Govern Project Hub UI with `@hbc/ui-kit` and UI Doctrine

```text
You are acting as a senior UI architecture, design-system, con-tech operating workspace, UX-governance, repo-truth, and implementation-quality reviewer for HB Intel.

## Objective
Bring the Project Hub UI fully under `@hbc/ui-kit` governance and the doctrine defined in `docs/reference/ui-kit/UI-Kit-*.md`, without degrading existing working behavior.

## Critical Instruction
Do not re-read files that are already in your active context window or memory. Only open additional files when needed to close a concrete evidence gap.

## Required Context
Assume Prompt 01 has already been completed.
Use its validated findings as the starting point.
If Prompt 01 uncovered corrections, honor repo truth rather than stale prior assumptions.

## Authority Order
1. live implementation,
2. `@hbc/ui-kit` package reality,
3. `docs/reference/ui-kit/UI-Kit-*.md`,
4. current-state-map / Phase 3 plan docs,
5. your recommendation.

## Scope
Review and update the Project Hub surfaces that are part of the live experience or are directly required for the new governed home implementation, including:
- Project Hub shell / header / rails / canvas host / panels / strips
- tile/card composition surfaces used by the live home
- role/device default-view shell regions
- any Project Hub-specific navigation / posture / queue / activity visual surfaces

## Required Outcomes
1. Eliminate ad hoc styling, ad hoc spacing systems, and UI drift where Project Hub should be using `@hbc/ui-kit` tokens, components, patterns, and doctrine.
2. Ensure the Project Hub home is visually and behaviorally aligned to UI doctrine:
   - operational, not decorative
   - hierarchy-first
   - density controlled
   - theme-aware
   - responsive without collapse into chaos
   - runtime honesty visible
3. Ensure the Project Hub shell profiles can be expressed through `@hbc/ui-kit` patterns rather than one-off UI code.
4. Preserve strong differentiation between:
   - Hybrid operating layer
   - Canvas-first operating layer
   - Next move hub
   - Executive cockpit
   - Field tablet split-pane
   while still feeling like one coherent product.

## Specific Instructions
- Audit all Project Hub UI surfaces for divergence from `@hbc/ui-kit`.
- Replace bespoke or inconsistent composition primitives with `@hbc/ui-kit` equivalents where appropriate.
- If a required Project Hub shell pattern is not yet represented cleanly in `@hbc/ui-kit`, extend the kit in a maintainable way rather than hardcoding Project Hub-specific hacks.
- Honor the doctrine in `docs/reference/ui-kit/UI-Kit-*.md` over local convenience.
- Ensure dark/light theme awareness and responsive behavior are explicit, not incidental.
- Ensure the visual system supports the intended operating posture:
  - header as truth surface
  - rails as operational surfaces
  - canvas as governed runtime
  - queues/panels as action surfaces
  - activity/timeline as continuity support

## Deliverables
Produce and implement:

### 1. UI Governance Audit Summary
- current divergences
- what was changed
- any `@hbc/ui-kit` extensions required
- any doctrine clarifications required

### 2. Project Hub UI Governance Changes
Make the code changes necessary to align the Project Hub home and supporting shell surfaces to `@hbc/ui-kit` and doctrine.

### 3. Evidence
Show:
- exact files changed
- exact UI-kit dependencies used or introduced
- before/after reasoning for any nontrivial adjustments

## Constraints
- Do not bypass `@hbc/ui-kit` because it is faster.
- Do not create a parallel design system inside Project Hub.
- Do not accept visual polish without operational clarity.
- Do not change architecture unrelated to Project Hub unless required to keep the UI system coherent.

## Acceptance Criteria
This prompt is complete only when:
- Project Hub UI surfaces are governed by `@hbc/ui-kit` and doctrine,
- theme-aware rendering is verified,
- the role/device shell profiles have a coherent shared visual language,
- any remaining deviations are explicitly documented as intentional and justified.
```
