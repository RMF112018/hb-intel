# Prompt 05 — Tokenize and Premiumize Public and Admin Styling

## Objective

Complete token discipline and visual/doctrine closure for the shared rail and admin surfaces once the structural and behavioral model is correct.

## Current issue / future-state gap

The attached wave-02 package was right that styling closure is still open.

The current CSS still relies on many hardcoded values and still reads too much like:
- a tinted action list / card strip on the public side
- a polite enterprise panel stack on the admin side

There are also remaining styling shortcuts such as inline values and weak surface hierarchy that keep the implementation below the intended doctrine bar.

## Intended future state

The public rail and admin are both visibly premium, but purpose-fit:
- the public rail reads as an HB-owned command band, not a branded Quick Links strip
- the admin reads as a refined authoring product, not a generic settings wall
- token/alias discipline is materially improved
- focus, reduced-motion, and contrast requirements are preserved and measured
- styling reinforces the corrected runtime model instead of hiding unresolved drift

## Repo seams / files / symbols to inspect

Inspect at minimum:

- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/priority-actions-rail-admin.module.css`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- any token alias exports or homepage-specific token seams you add

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing files / doctrine / specs

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`

## Required implementation outcomes

1. Replace unjustified hardcoded values with governed tokens or deliberate homepage aliases.

2. Remove remaining safety-zone styling outcomes:
   - repetitive thin-border white-section language
   - timid hierarchy
   - low-energy separators / headers / action affordances

3. Ensure public/admin styling follows their distinct personas:
   - utility-first public command band
   - authoring-first admin product

4. Remove inline styling shortcuts from component code where they do not belong.

5. Preserve or improve:
   - visible focus
   - reduced-motion behavior
   - touch-sized interaction comfort
   - measured contrast compliance

6. Keep the visual language compact and operational rather than decorative.

## Supporting development concepts to apply materially

- semantic token discipline
- homepage-specific aliasing only where justified
- purpose-fit visual hierarchy
- measured accessibility proof instead of assumption

## Proof of closure

Return:

- the tokenization / aliasing approach
- the hardcoded-value reductions made
- before/after description of the public and admin visual posture
- contrast / focus / reduced-motion proof notes
- confirmation that unrelated homepage surfaces were not restyled

## Boundaries / anti-drift rules

- Do not let styling work mutate unrelated homepage components.
- Do not introduce a new generic card-grid language.
- Do not remove focus outlines without a stronger replacement.
- Do not weaken compact operational density in the name of decorative polish.
