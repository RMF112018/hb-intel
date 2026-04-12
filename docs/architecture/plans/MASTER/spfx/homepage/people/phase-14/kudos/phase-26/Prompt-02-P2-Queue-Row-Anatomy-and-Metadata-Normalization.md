# Prompt 02 — P2 Queue-row anatomy and metadata normalization

## Objective

Normalize **queue-row anatomy** in the HB Kudos Companion so the rows maintain a stable, predictable structure and metadata presentation regardless of recipient count or content combinations.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- premium SPFx surfaces must be structurally productized
- ordinary workflow surfaces must not feel inconsistent or accidental
- runtime resilience includes stable rendering across varied data shapes

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

Adjacency if needed:

- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

## Problem to solve

The queue-row rendering still has anatomy inconsistencies, including metadata treatment that can disappear or shift too much depending on recipient presence and row-content shape.

The row should feel like a stable productized list item, not a conditional pile of inline render fragments.

## Required implementation direction

### 1. Stabilize row zones
Give each row a clearer, more stable anatomy for:

- state/badge region
- headline/excerpt region
- recipient region
- submission/metadata region
- date or secondary status region

### 2. Decouple metadata from recipient presence
Submission metadata should not vanish or become structurally dependent on whether recipients render.

### 3. Preserve scan speed
Do not overcomplicate the row. The result should be more stable and easier to scan, not heavier.

### 4. Keep data logic honest
Do not fake missing data. Where data is missing, handle it gracefully without destabilizing the row structure.

## Constraints

- Do not redesign the entire queue workspace.
- Do not loosen typed contracts or patch behavior.
- Do not add noisy filler just to make rows look fuller.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer stable anatomy and predictable metadata rhythm over decorative complexity.
- Keep rows performant and readable.

## Deliverable

Implement the row-anatomy normalization and report:

- what row-structure problems were corrected
- how metadata rendering is now more stable
- how the result improves consistency without reducing scan speed
