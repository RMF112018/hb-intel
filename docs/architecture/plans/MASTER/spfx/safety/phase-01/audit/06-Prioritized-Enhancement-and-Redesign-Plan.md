# 06 — Prioritized Enhancement and Redesign Plan

## Implement now

### 1. Reclassify Safety in the shell
- **Gap closed:** 04, 05
- **Implementation direction:** Remove newsroom semantics, raise prominence, and move Safety out of the default row-2 passenger slot.
- **Expected UI/UX impact:** Immediate improvement in homepage meaning and module authority.
- **Doctrine relevance:** Homepage overlay first-lane / shell-fit doctrine.
- **Cross-layer implications:** `occupantRegistry`, default preset, preset library, shell validation.
- **Refinement vs redesign:** Redesign at shell-governance level.

### 2. Lock a new safety information architecture
- **Gap closed:** 02, 07
- **Implementation direction:** Define a stronger view-model for safety homepage use. At minimum include:
  - top-line status summary
  - primary spotlight item
  - bounded grouped secondary signals
  - explicit section-level CTA
  - richer metadata for scope/location/urgency
- **Expected UI/UX impact:** Users can understand current field condition faster and more confidently.
- **Doctrine relevance:** Structural rebuild over decorative polish.
- **Cross-layer implications:** contracts, normalization, manifest defaults, future live-data mapping.
- **Refinement vs redesign:** Redesign.

### 3. Replace or heavily re-found the safety surface family
- **Gap closed:** 01, 06, 07, 09
- **Implementation direction:** Either:
  - introduce a new safety-specific homepage surface in `@hbc/ui-kit/homepage`, or
  - fundamentally rebuild `HbcOperationalSurface` so Safety is not just a tighter card variant.
- **Expected UI/UX impact:** Safety reads as a productized operational module rather than a polished card.
- **Doctrine relevance:** Anti-generic-card rule, premium SPFx posture, application-level breakpoint doctrine.
- **Cross-layer implications:** ui-kit, consumer mapping, storybook proof, CSS/tokens.
- **Refinement vs redesign:** Redesign.

### 4. Define explicit application modes
- **Gap closed:** 06
- **Implementation direction:** Support documented modes such as:
  - `standard`
  - `compact`
  - `minimal`
  with rules for what remains visible, collapses, or moves behind interaction.
- **Expected UI/UX impact:** Compact behavior becomes positive prioritization, not stressed compression.
- **Doctrine relevance:** Application-level breakpoint doctrine.
- **Cross-layer implications:** shell-fit contract, UI-kit props, consumer, validation.
- **Refinement vs redesign:** Redesign.

## Implement next

### 5. Add runtime-maturity path
- **Gap closed:** 03, 08
- **Implementation direction:** Add a live-data seam or a governed adapter layer. At minimum, add a runtime error state distinct from authoring invalid/no-data.
- **Expected UI/UX impact:** Better production resilience and benchmark parity with stronger peers.
- **Doctrine relevance:** benchmark maturity, empty/loading/error state quality.
- **Cross-layer implications:** data hooks, authoring governance, error UI, QA.
- **Refinement vs redesign:** Redesign.

### 6. Add deeper action/disclosure strategy
- **Gap closed:** 07
- **Implementation direction:** Add:
  - section-level CTA
  - optional grouped “see all active items” behavior
  - bounded archive/history or safety center handoff
- **Expected UI/UX impact:** Better follow-through and less dead-end behavior.
- **Doctrine relevance:** premium CTA clarity, homepage utility.
- **Cross-layer implications:** consumer mapping, UI-kit, site routing.
- **Refinement vs redesign:** Refinement after redesign.

## Implement later / after rebuild stabilizes

### 7. Strengthen authoring governance language
- **Gap closed:** 02, 03
- **Implementation direction:** Expand governance messages and cadence rules to reflect the new safety hierarchy.
- **Expected UI/UX impact:** Better long-term content quality.
- **Doctrine relevance:** authoring safety.
- **Cross-layer implications:** governance registry, docs.
- **Refinement vs redesign:** Refinement.

### 8. Token cleanup and surface-family hardening
- **Gap closed:** 09
- **Implementation direction:** Replace ad hoc hardcoded style choices with cleaner local aliases or shared tokens where appropriate.
- **Expected UI/UX impact:** More maintainable premium variants.
- **Doctrine relevance:** token discipline.
- **Cross-layer implications:** ui-kit CSS architecture.
- **Refinement vs redesign:** Refinement.
