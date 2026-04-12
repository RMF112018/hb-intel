# Prompt 03 — P1 Task-specific governance input controls

## Objective

Replace generic or operator-hostile governance input patterns in the **HB Kudos Companion** with **task-specific controls** that are materially more production-grade for SharePoint-hosted moderation work.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- premium SPFx surfaces must be structurally productized, not merely restyled
- stronger stack adoption is allowed and expected where it materially improves the surface
- the result must remain host-safe, accessible, and authoring-safe

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`

Adjacency if needed:

- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`

## Problem to solve

The current governance input flow still uses overly generic input patterns for actions that should have task-specific controls.

Examples of current quality gaps include:

- schedule flow expecting raw date/time text behavior rather than a clearer scheduling interaction
- reassignment flow depending on raw SharePoint user-id entry rather than a human-usable assignment interaction
- generic text-input treatment where better structured controls should exist

## Required implementation direction

### 1. Replace generic schedule input
Implement a scheduling input experience that is meaningfully better than raw free-text entry.

### 2. Replace raw reassignment input
Implement a human-usable reassignment flow appropriate for this runtime.

Use the strongest practical local/shared solution that fits current repo architecture and doctrine.

### 3. Keep generic dialog only where appropriate
It is acceptable to retain a generic dialog shell where the action truly only needs simple note text, but not where structured task-specific interaction is clearly warranted.

### 4. Keep writer contracts intact
Do not weaken the typed governance patch model or writer seam. Improve the input UX while preserving the typed patch-dispatch model.

## Stack posture

Use the approved premium stack where it materially improves the result.

This prompt is one of the areas where relevant use of:

- `@floating-ui/react`
- `@radix-ui/react-tooltip`
- `class-variance-authority`
- `clsx`

may be appropriate if they improve usability and polish without fighting SharePoint.

Do not add symbolic dependencies or superficial wrappers.

## Constraints

- Do not turn this into a broad public people-picker redesign.
- Do not redesign unrelated public Kudos composition.
- Do not break current audit-event or patch-dispatch logic.
- Do not use fake shell or host-fighting overlay behavior.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer task-specific usability over generic “one dialog fits all” reuse.
- Keep accessibility and keyboard behavior intact.

## Deliverable

Implement the task-specific governance input upgrades and report:

- which actions were upgraded
- what new controls or flows replaced the generic versions
- how the new experience remains typed, host-safe, and doctrine-aligned
