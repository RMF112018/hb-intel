# Phase 03 Implementation Summary — Homepage Composition and Template Hardening

## Objective

Use the executed Phase 02 implementation as the baseline for a **Phase 03 homepage composition package** that promotes the homepage lane from “premium individual surfaces” to “coherent homepage composition and governed preview/template delivery.”

## Repo-truth starting point from Phase 02

Phase 02 materially changed the homepage lane in three important ways:

### 1. Homepage-local design token system now exists
Phase 02 introduced `src/homepage/tokens.ts` as a homepage-local design-token layer with spacing, radius, border, text-opacity, image, layout, hero, zone, CTA, welcome, motion, and focus tokens, plus multiple shared style fragments.

This means Phase 03 should **compose from an existing local visual system**, not invent a new one.

### 2. Shared primitives and webparts are already visually upgraded
Phase 02 removed a significant amount of inline-style debt, upgraded shared primitives and multiple webparts to token-backed styling, and established editorial/top-band visual differentiation across the homepage lane.

This means Phase 03 should focus on:
- layout architecture,
- composition rules,
- preview/template promotion,
- interactive-state hardening,
- and homepage-level coherence.

It should **not** spend its energy repeating the token cleanup already completed.

### 3. Phase 02 already identified the next real gaps
The completion notes explicitly deferred the following:
- hover/focus pseudo-class implementation,
- broader reduced-motion gating,
- aspect-ratio/media enforcement,
- skeleton shimmer variant,
- CTA-as-button vs CTA-as-link audit,
- property pane work,
- async data integration.

Phase 03 should consume that deferred list intelligently:
- close the visual/composition-level items that belong in this phase,
- keep property-pane and async-data work deferred.

## Governing implementation stance for Phase 03

Phase 03 must remain within the homepage product boundary established in Phase 01:

- `apps/hb-webparts` remains Lane A (Homepage / Page-Canvas Product)
- no shell-extension work
- no navigation-governance work
- no drift into platform package redesign
- no cross-lane ownership confusion

## What Phase 03 should accomplish

### A. Promote composition from reference utility to governed product surface
`ReferenceHomepageComposition.tsx` currently acts as a development/integration utility and fallback render. Phase 03 should turn the composition layer into a more deliberate and governed asset:

- explicit zone architecture,
- clearer composition ownership,
- reusable preview/template behavior,
- better distinction between production webparts and homepage composition scaffolding.

### B. Implement the full-width homepage composition posture
Phase 02 created the token and top-band system, but Phase 03 should express the homepage more explicitly as a composed page-canvas experience:

- stronger full-width top-band behavior,
- clearer zone-to-zone rhythm,
- section composition standards,
- layout rules that feel like a homepage rather than a vertical stack of independent webparts.

### C. Close the remaining interaction/polish gaps that are composition-relevant
Phase 03 should handle:
- hover/focus-visible treatments,
- reduced-motion consistency,
- CTA treatment audit,
- media stability/aspect-ratio discipline,
- skeleton vs spinner evaluation where homepage composition benefits from it.

### D. Harden the preview/template/acceptance story
Phase 03 should end with:
- a governed homepage preview/template surface,
- updated documentation for the homepage composition architecture,
- acceptance criteria that prove the composition layer is production-ready within current scope.

## Recommended prompt structure

### Prompt 01
Define the homepage zone architecture and promote the reference composition into a governed composition/preview system.

### Prompt 02
Implement the full-width top-band and the missing interaction-state system (hover/focus-visible, motion gating, CTA audit, media/aspect-ratio discipline).

### Prompt 03
Harden the composition into a preview/template delivery surface with updated docs, stronger acceptance tests, and a clean closure package.

## Things Phase 03 must preserve

- current import discipline (`@hbc/ui-kit/homepage` primary)
- existing mount/dispatch seam behavior
- per-webpart contract stability
- authoring governance behavior
- current acceptance-test baseline
- independent rendering of all 10 webparts

## Things Phase 03 must not do

- introduce data fetching
- introduce property-pane implementation
- create shell-extension behavior
- replace the current product boundary model
- over-abstract local homepage patterns into shared packages without real reuse evidence
