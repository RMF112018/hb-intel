# Prompt-04 — Rebuild Icon Semantics Around IconKey and Service Identity

## Objective

Replace severity-driven homepage launcher icon mapping with a governed service-identity-first icon strategy.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- any icon-governance helpers already adjacent to the Priority Actions data path
- `packages/ui-kit/src/HbcHomepageLauncher/*` where icon rendering assumptions must change

## Current problem to solve

The current launcher derives icons primarily from `badgeVariant`, which produces generic repeated icons and ignores the richer `iconKey` signal already preserved by normalization. That is a semantics failure and a launcher-persona failure.

## Required implementation work

1. Build a governed icon resolution strategy with this precedence unless repo truth justifies a stronger order:
   - explicit homepage launcher icon identity
   - normalized `iconKey`
   - governed service/tool mapping fallback
   - last-resort neutral fallback icon
2. Stop using badge severity as the primary homepage service identity source.
3. Keep badge/status semantics separate from launch-target identity.
4. Ensure icon usage remains paired with visible text labels in the launcher surface.
5. Add tests that prove:
   - `iconKey` wins when valid
   - fallback order is deterministic
   - invalid keys fall back safely
   - no regression to badge-variant-first behavior slips back in

## Required future state

Launcher icons should help users distinguish tools and services quickly, rather than repeating generic severity metaphors that belong to status treatment instead of launcher identity.

## Proof of closure required

- icon resolution is service-driven first
- tests prove deterministic precedence and safe fallback
- screenshots / review show materially stronger service differentiation across launcher items

## Prohibitions

- Do not invent whimsical or decorative icon choices.
- Do not overload one icon across unrelated tools when better governed choices exist.
- Do not reintroduce pseudo-icons or text initials.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
