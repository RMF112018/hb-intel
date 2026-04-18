# PROMPT 08 — Shared Variant Contracts and Default-vs-Flagship Isolation

## Implementation objective

Refactor the shared rail family so the homepage flagship path can become materially stronger without contaminating generic/default/admin-preview behavior.

## Work classification

**Structural redesign**

## Exact repo files / seams / symbols to inspect

- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailPreviewSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- homepage export seams under `@hbc/ui-kit/homepage`

## Current weakness

The attached package pair calls for a stronger flagship path, but it does not isolate that contract problem sharply enough. Right now, the risk is either an underpowered flagship path or an overreaching redesign that pollutes default/admin-preview consumers.

## Why the current condition is inadequate

This is one of the most important unaddressed package weaknesses. A serious shared family needs to make it explicit which behaviors are flagship-only, which remain generic, and which contracts all consumers share.

## Required future state

Refactor the shared contract/variant system so:

- the flagship path can become materially stronger
- the default path remains viable and generic
- admin preview remains trustworthy
- shared type contracts remain coherent
- context-specific layout and overflow decisions are explicit rather than accidental

If the flagship path needs dedicated internal subcomponents or a more expressive variant API, build that cleanly.

## What done actually looks like

Done means:

- there is no ambiguity about what is flagship-only
- default/admin behavior does not collapse or become over-styled
- the shared family is easier to reason about after the redesign
- test coverage can assert default-vs-flagship differences intentionally

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/blueprint/current-state-map.md`

## Recommended dependencies / development concepts

- Use CVA/typed context contracts intentionally rather than piling on CSS exceptions.
- Prefer explicit component/API branching over mysterious style-only divergence.
- Keep the homepage-safe export seam coherent.

## Required implementation and validation expectations

- Revalidate preview/default consumers.
- Add tests for flagship-vs-default differentiation where appropriate.
- Keep loading/empty/error states compatible across contexts.

## Prohibitions

- Do not let the flagship redesign break generic/default mounts.
- Do not hide key behavior in CSS hacks only.
- Do not widen the API surface without keeping it intelligible.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
