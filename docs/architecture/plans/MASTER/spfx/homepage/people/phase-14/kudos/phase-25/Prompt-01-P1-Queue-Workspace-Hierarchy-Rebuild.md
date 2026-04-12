# Prompt 01 — P1 Queue workspace hierarchy rebuild

## Objective

Rebuild the **HB Kudos Companion queue workspace hierarchy** so the rendered result reads as a **premium, productized, host-safe SharePoint governance surface** rather than a capable but still generic internal queue.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- respect the SharePoint host
- own the page canvas without duplicating shell chrome
- avoid timid enterprise card-grid outcomes
- prefer structural rebuild over decorative polish
- maintain authoring safety and runtime resilience

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`

Read for safe adjacency only if needed:

- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`

## Problem to solve

The Companion queue currently has the right functional controls, but the rendered workspace still reads too much like a flat internal queue assembly. It needs stronger hierarchy, clearer product structure, and more deliberate operational composition while remaining host-safe inside SharePoint.

## Required implementation direction

### 1. Rebuild the workspace composition
Restructure the queue-facing surface so it has clearer layers, such as:

- a stronger top workspace header/meta area
- a more intentional filter/control zone
- a more clearly defined queue list region
- better differentiation between browsing work and action work

This must still remain a single webpart canvas surface, not a fake app shell.

### 2. Improve queue row structure
Refactor the queue row presentation so rows have:

- clearer scan order
- stronger headline/metadata hierarchy
- more deliberate badge placement
- more stable anatomy
- clearer operator understanding of state, ownership, aging, and submission context

Do not just tweak spacing. Improve the structural reading order.

### 3. Preserve host-safe behavior
Do not create:

- fake nav bars
- shell-like subheaders
- chrome that fights the SharePoint host

The result should feel premium and productized on the page canvas, not like a standalone app forced into SharePoint.

### 4. Keep authoring/runtime resilience
Do not weaken empty/loading/error handling or role-gated access behavior while rebuilding hierarchy.

## Constraints

- Do not redesign the public `HbKudos` surface.
- Do not loosen typed governance logic.
- Do not rely on large new decorative slabs or empty hero-like treatments.
- Do not use timid card-grid repetition as the answer.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer structural composition changes over cosmetic styling-only edits.
- Keep the workspace clearly within homepage-family SPFx doctrine and host-aware SharePoint reality.

## Deliverable

Implement the hierarchy rebuild and report:

- what structural changes were made to the queue workspace
- how the new hierarchy improves scan order and product quality
- how the result remains host-safe and doctrine-aligned
