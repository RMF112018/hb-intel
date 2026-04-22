# 05 — Gap Register

## Gap 01 — Surface identity is still card-oriented
- **Category:** UI / visual language
- **Current condition:** White elevated root card with internal featured card and signal tiles.
- **Why it underperforms:** Reads as a premium card stack, not a flagship safety homepage application.
- **Severity:** High
- **Recommended direction:** Replace or heavily re-found the shared surface family with a safety-specific homepage product grammar.
- **Affected seams:** `HbcOperationalSurface/index.tsx`, `operational-surface.module.css`, `SafetyFieldExcellence.tsx`
- **Refinement vs redesign:** Redesign

## Gap 02 — Safety content model is too shallow
- **Category:** Information architecture / data contract
- **Current condition:** Event-type driven items with title/summary/indicator/freshness/CTA.
- **Why it underperforms:** Cannot express enterprise safety posture, grouped urgency, site attribution, escalation, or command clarity.
- **Severity:** High
- **Recommended direction:** Expand contract to support top-line status, grouped signals, stronger action model, and contextual metadata.
- **Affected seams:** `operationalAwarenessContracts.ts`, `operationalAwarenessConfig.ts`, manifest defaults
- **Refinement vs redesign:** Redesign

## Gap 03 — No live-data or runtime-failure maturity
- **Category:** Runtime maturity
- **Current condition:** Standalone manifest-config fallback only; no fetch seam; no explicit error state.
- **Why it underperforms:** Benchmark maturity lags peer surfaces and runtime truth cannot be differentiated from authoring gaps.
- **Severity:** High
- **Recommended direction:** Introduce a disciplined live-data seam or explicitly govern why this surface remains curated-only; in either case add runtime error-state handling.
- **Affected seams:** `SafetyFieldExcellence.tsx`, homepage data layer, authoring governance
- **Refinement vs redesign:** Redesign

## Gap 04 — Safety is shell-governed as a supporting passenger
- **Category:** Homepage integration
- **Current condition:** `prominenceCeiling: 'supporting'`, `firstLaneEligible: false`, default row-2 minor slot next to Company Pulse.
- **Why it underperforms:** Undercuts operational importance and softens the safety story.
- **Severity:** High
- **Recommended direction:** Reclassify Safety in the shell and change the default preset.
- **Affected seams:** `occupantRegistry.ts`, `defaultPreset.ts`, `presetLibrary.ts`
- **Refinement vs redesign:** Redesign

## Gap 05 — Wrong semantic band allowance
- **Category:** Shell semantics
- **Current condition:** Safety is allowed in `communications-newsroom`.
- **Why it underperforms:** Confuses module identity and invites the wrong visual/semantic neighborhood.
- **Severity:** Medium-high
- **Recommended direction:** Restrict Safety to operational semantics unless a deliberate exception is strongly justified.
- **Affected seams:** `occupantRegistry.ts`
- **Refinement vs redesign:** Refinement with strategic impact

## Gap 06 — Compact mode is under-specified
- **Category:** Responsive behavior
- **Current condition:** Shell says compact is supported; surface only tightens spacing.
- **Why it underperforms:** Compression is being mistaken for true compact behavior.
- **Severity:** High
- **Recommended direction:** Define explicit application modes (`standard`, `compact`, `minimal`) and corresponding content rules.
- **Affected seams:** shell contract, shared surface API, consumer mapping
- **Refinement vs redesign:** Redesign

## Gap 07 — UX does not answer “what matters now?” strongly enough
- **Category:** UX / hierarchy
- **Current condition:** One featured signal + secondary rows.
- **Why it underperforms:** Too little triage logic; users must infer importance.
- **Severity:** High
- **Recommended direction:** Introduce a stronger primary summary/triage layer and more explicit action posture.
- **Affected seams:** data contract, normalization, shared surface, consumer mapping
- **Refinement vs redesign:** Redesign

## Gap 08 — Benchmark maturity lags ProjectPortfolioSpotlight
- **Category:** Benchmark quality
- **Current condition:** Spotlight has live fetch, runtime error state, richer surface model, and stronger domain richness; Safety does not.
- **Why it underperforms:** Repo-local benchmark comparison exposes Safety as materially less mature.
- **Severity:** Medium-high
- **Recommended direction:** Raise Safety to the same maturity class, without cloning Spotlight’s visual identity.
- **Affected seams:** consumer, data layer, shared surface, proof workflow
- **Refinement vs redesign:** Redesign

## Gap 09 — Hardcoded styling remains too heavy in the shared surface
- **Category:** Styling / maintainability
- **Current condition:** Many hardcoded colors, shadows, and fixed paddings remain in CSS.
- **Why it underperforms:** Weakens token discipline and makes future variants more brittle.
- **Severity:** Medium
- **Recommended direction:** Introduce clearer token/alias usage for the rebuilt safety surface family.
- **Affected seams:** `operational-surface.module.css`
- **Refinement vs redesign:** Refinement as part of redesign

## Gap 10 — Proof discipline is incomplete for this target-state ask
- **Category:** Validation / closure
- **Current condition:** Storybook proof exists for current narrow variant, but no fresh hosted proof was part of this audit run.
- **Why it underperforms:** World-class closure requires tenant-aware visual, breakpoint, accessibility, and package validation.
- **Severity:** Medium
- **Recommended direction:** Require hosted proof, keyboard/focus proof, reduced-motion proof, and package/build proof in the implementation waves.
- **Affected seams:** Storybook, visual-proof scripts, build/package workflow
- **Refinement vs redesign:** Refinement
