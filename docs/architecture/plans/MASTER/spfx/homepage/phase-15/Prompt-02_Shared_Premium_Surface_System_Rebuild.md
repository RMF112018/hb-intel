# Prompt 02 — Shared Premium Surface System Rebuild

## Objective

Rebuild the shared homepage surface system so that the homepage is no longer trapped inside the current weak, generic card language.

## Primary Scope

- `packages/ui-kit`
- `packages/ui-kit/src/homepage.ts`
- homepage primitives currently exported through `@hbc/ui-kit/homepage`
- any shared tokens, radii, spacing, elevation, section-shell, CTA, metadata, and iconography surfaces used by `apps/hb-webparts`

## Hard Instructions

- Do not reread files already in current context or memory.
- Assume the current surface system is insufficient until proven otherwise.
- Do not stop at token nudges.
- If a primitive is too weak, replace it.
- If a primitive is too generic, split it into stronger surface-specific variants.
- Do not let bundle discipline become an excuse for weak visual primitives.

## Required Work

1. Audit the current shared homepage primitives and identify exactly which ones are suppressing premium quality.
2. Rebuild the homepage surface system into intentional categories such as:
   - signature / flagship
   - command / utility
   - editorial
   - recognition / people
   - operational intelligence
   - discovery
3. Replace or redesign the current surface-card logic so surface differentiation is materially stronger than:
   - minor border differences
   - small padding changes
   - light tint shifts
4. Introduce stronger shared primitives where needed, for example:
   - premium signature band/container
   - command tile / command row
   - discovery shelf
   - operational status rail
   - authored editorial feature card
   - recognition card
   - premium CTA/link treatment
   - stronger section header treatment
5. Replace placeholder-grade icon handling with a real iconography strategy.
6. Rework spacing, depth, radius, edge treatment, and typography so the primitives can support premium product styling.
7. Update any doctrine or entrypoint exports needed to support the new shared model.

## Required Validation

- Show how each new primitive materially differs in perceived quality from the old one.
- Confirm that the rebuilt system can support the later homepage redesign prompts without local hack styling.
- Confirm that accessibility and reduced-motion behavior remain intact.

## Deliverables

- shared primitive code changes
- export updates
- token / styling updates
- documentation updates
- a phase closure note explaining how the surface model changed in perception, not just in code
