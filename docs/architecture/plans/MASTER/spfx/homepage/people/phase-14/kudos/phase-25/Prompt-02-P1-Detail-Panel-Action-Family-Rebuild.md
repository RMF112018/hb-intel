# Prompt 02 — P1 Detail panel action-family rebuild

## Objective

Rebuild the **HB Kudos Companion detail-panel action experience** so governance actions are grouped into safer, clearer operator-oriented families rather than a flat wall of wrapped controls.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- structural rebuild is preferred over decorative refinement
- premium SPFx surfaces must feel productized and visibly non-generic
- the webpart must remain host-safe and must not fight SharePoint
- operator clarity matters more than ornamental styling

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

Adjacency if needed:

- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`

## Problem to solve

The detail panel currently exposes many governance actions in a single wrapped action band. That makes the surface functionally complete, but it is still interaction-poor, visually flat, and less safe than it should be for high-trust moderation work.

## Required implementation direction

### 1. Group actions into clear families
Restructure actions into meaningful operator groups such as:

- review decisions
- publication / scheduling / prominence
- ownership / assignment
- administrative maintenance / destructive actions

You do not need to use these exact labels, but the grouping logic must be clear and intentional.

### 2. Improve destructive-action handling
Destructive or high-risk actions must feel more deliberate and visually distinct.

Do not leave “remove”, “reject”, or similarly consequential actions buried in a generic flat action strip.

### 3. Improve panel flow
The detail panel should guide the operator through the item, then the relevant decision areas, rather than forcing them to parse a broad action cluster.

### 4. Preserve capability gating
Role/capability gating must remain intact. Do not expose actions to unauthorized roles just because the panel structure changes.

## Constraints

- Do not remove supported actions.
- Do not weaken current governance logic.
- Do not turn the panel into a fake modal app or full-page workflow.
- Do not introduce brittle DOM hacks.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer clear operator flow over visual novelty.
- Maintain host-safe SharePoint coexistence.

## Deliverable

Implement the detail-panel action-family rebuild and report:

- how actions are now grouped
- how destructive actions were made safer
- how the new panel flow improves moderation usability
- confirmation that role/capability gating still works
