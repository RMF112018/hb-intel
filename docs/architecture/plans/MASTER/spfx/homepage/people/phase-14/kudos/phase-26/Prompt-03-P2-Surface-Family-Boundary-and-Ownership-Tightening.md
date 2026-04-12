# Prompt 03 — P2 Surface-family boundary and ownership tightening

## Objective

Tighten **surface-family boundaries** and **runtime ownership clarity** between the public `HbKudos` runtime and the Companion runtime so shared seams remain intentional and runtime responsibilities are easier to reason about.

## Governing authority

Treat the following as binding:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Key doctrine implications for this prompt:

- homepage-local shared components are allowed when genuinely justified
- structural rebuild and product thinking matter more than arbitrary file deduplication
- shared logic and shared visual seams should be intentional, not muddy

## Files in scope

Primary targets:

- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

Adjacency if needed:

- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

## Problem to solve

The current runtime split is much better than earlier versions, but some boundaries are still more implicit than they should be.

There is still room to make it clearer:

- what is truly shared
- what is public-runtime-owned
- what is Companion-runtime-owned
- what should remain homepage-local shared infrastructure versus surface-specific implementation

## Required implementation direction

### 1. Audit and tighten shared seams
Review the current shared files and adjust only where a boundary is still muddy or unnecessarily mixed.

### 2. Reduce ownership ambiguity
Make it easier for future maintainers to understand which runtime owns which visual/interaction responsibilities.

### 3. Preserve justified sharing
Do not force-separate code that is genuinely shared and healthier that way.

### 4. Keep runtime contracts truthful
If the current ownership map or comments need refinement to match actual code truth after P0/P1/P2 changes, update them.

## Constraints

- Do not turn this into a public-surface redesign.
- Do not explode the file structure just for symbolism.
- Do not weaken maintainability by pursuing theoretical purity.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Prefer clearer ownership with low-risk changes.
- Preserve working shared seams where they are genuinely useful.

## Deliverable

Implement the boundary-tightening work and report:

- what ownership ambiguities were corrected
- what remains shared intentionally
- what runtime boundaries are now clearer than before
