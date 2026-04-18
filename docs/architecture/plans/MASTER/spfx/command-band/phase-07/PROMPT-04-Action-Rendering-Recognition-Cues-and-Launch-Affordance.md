# PROMPT 04 — Action Rendering, Recognition Cues, and Launch Affordance

## Implementation objective

Rebuild the individual action grammar so actions are faster to recognize, clearer to launch, and less dependent on row-by-row reading.

## Work classification

**Structural redesign**

## Exact repo files / seams / symbols to inspect

- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- any adjacent homepage-safe action-row / launcher-item primitives

## Current weakness

Icons are present in the live rail, but they still behave more like decorative row markers than strong recognition anchors. Titles, descriptions, badges, arrows, and icons are all competent, but too visually uniform.

## Why the current condition is inadequate

A quick-launch surface succeeds when destinations are recognized quickly. The current action grammar still asks the eye to read repeated lines. That is too expensive for a flagship homepage band whose job is fast launch, not polite cataloging.

## Required future state

Redesign the action item grammar so it supports faster destination recognition. The future state must:

- give icons more authority when they are meaningful
- make primary actions feel more launch-oriented
- make directional affordance and external-link cues clearer
- keep labels legible and concise
- reduce row sameness
- support a stronger flagship action pattern without breaking default/admin behavior

If the flagship path needs a different internal action subcomponent than the default path, build it deliberately.

## What done actually looks like

Done means:

- actions are easier to recognize at a glance
- launch affordance is obvious
- icon treatment feels intentional and useful
- descriptions, badges, and arrows help rather than flattening the action hierarchy
- the flagship path is materially more launch-first than the old implementation

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Recommended dependencies / development concepts

- Use `lucide-react` only where icon meaning is credible and labeled.
- Treat icon framing, title anchoring, and directional affordance as recognition tools, not decoration.
- Preserve semantic links for destinations; do not over-ARIA a simple link-launch pattern.

## Required implementation and validation expectations

- Validate title truncation behavior deliberately.
- Validate icon/text alignment across density states.
- Validate external-link signaling and arrow treatment.
- Add tests or assertions if the flagship action structure materially changes.

## Prohibitions

- Do not strip labels and rely on icons alone.
- Do not create ambiguous pseudo-buttons from plain links without clear role/function alignment.
- Do not let badges dominate action identity.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
