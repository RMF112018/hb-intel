# 04 — Prompt: Count, State, and Feedback Refinement

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Refine the public reaction experience so the count, visual state, and interaction feedback feel intentional and production-ready.

## Mandatory scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

## Required outcomes

- zero-state reaction is visible and understandable
- non-zero count is visually clear
- loading / pressed / completed states are understandable
- the control feels premium and consistent with the Kudos public surface
- count treatment does not overpower the recognition content
- the reaction component is visible enough that users understand the feature exists

## Required implementation direction

Review and refine:

- reaction label or icon treatment
- count placement
- whether the featured card alone gets the interactive reaction, or whether recent rows also get a lightweight signal
- hover/focus/active feedback
- disabled or in-flight behavior
- visual consistency with the existing premium public surface

## Explicit prohibitions

Do not:
- make the reaction control visually louder than the recognition headline
- hide the feature until count > 0
- implement a vague control with no understandable affordance
- add noisy animation that cheapens the surface

## Deliverables

Return:
- files changed
- final public reaction UX summary
- summary of count/state behavior
- note on whether recent rows also expose any reaction signal
