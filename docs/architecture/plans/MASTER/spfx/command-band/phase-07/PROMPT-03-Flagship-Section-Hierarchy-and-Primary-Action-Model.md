# PROMPT 03 — Flagship Section Hierarchy and Primary-Action Model

## Implementation objective

Redesign section internals so grouping accelerates scanning and each section expresses a clearer primary-vs-secondary action hierarchy.

## Work classification

**Structural redesign**

## Exact repo files / seams / symbols to inspect

- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- any adjacent homepage-safe section/launcher primitives reused intentionally through `@hbc/ui-kit/homepage`

## Current weakness

The live surface does group actions, but the sections are still mostly containers for repeated rows. Category labels exist, counts exist, and order exists, yet section hierarchy does not do enough to speed recognition.

## Why the current condition is inadequate

A flagship homepage band should not merely sort links into buckets. Section treatment should reduce the amount of serial reading required to find a destination. Right now, the grouping is orderly but not scan-optimal enough.

## Required future state

Redesign section internals so sections do real product work. The future state must:

- make the section identity obvious
- create a more decisive primary action inside each section where appropriate
- keep supporting actions visible without making every action feel equal
- reduce the sameness of repeated row patterns
- keep density credible inside SharePoint constraints

Possible approaches include:
- one featured action with supporting compact actions
- a small hybrid cluster per section
- a stronger title/meta/action relationship that changes how the eye parses the surface

Choose the pattern that best improves scan speed while preserving compact utility.

## What done actually looks like

Done means:

- sections help users find destinations faster
- primary-vs-secondary hierarchy is obvious without relying on color alone
- counts/meta are only retained if they actively improve the section
- the flagship path no longer reads as “header + count + repeated rows” throughout

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Recommended dependencies / development concepts

- Use hierarchy, rhythm, icon anchoring, and repetition control intentionally.
- Prefer a limited number of repeatable flagship section patterns over many one-off section treatments.
- Keep semantic grouping and readable labels intact.

## Required implementation and validation expectations

- Validate desktop/laptop, tablet, and compact states.
- Ensure section structure remains accessible and understandable.
- Ensure grouping logic from data contracts still maps cleanly into the redesigned UI model.

## Prohibitions

- Do not solve this only with larger typography and more color.
- Do not preserve uniform action equality merely because it is simpler.
- Do not let section treatment become so heavy that density collapses.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
