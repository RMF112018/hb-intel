# Prioritized Spotlight Enhancement Plan

## Priority 1 — Add a real Spotlight layout-mode contract
**Gap closed:** Gaps 01, 02, 05  
**Implementation direction:**  
Create an explicit mode system inside the shared surface, driven by practical usable width and optionally height pressure.

Recommended shape:
- `type SpotlightLayoutMode = 'wide' | 'medium' | 'compact' | 'minimal'`
- a resolver/hook that maps container measurements into one of those modes
- a visibility matrix that defines what is shown by default in each mode

**Expected impact**
- Converts the surface from breakpoint styling to behavior governance
- Creates a stable foundation for all remaining compactness work

**Cross-layer implications**
- shared surface code
- CSS module
- storybook
- README / closure docs

**Timing:** Implement now  
**Work class:** Structural redesign

---

## Priority 2 — Split featured content into essentials vs details
**Gap closed:** Gaps 03, 05, 10  
**Implementation direction:**  
Refactor featured rendering into two zones:
1. **Essentials** — image, title, maybe one compact signal
2. **Details** — headline, summary, milestones, freshness, team strip, CTA (or most of these)

Introduce an explicit disclosure control:
- `Show spotlight details`
- or stronger premium equivalent language

Recommended default behavior:
- wide: details may be open by default
- medium: details partially open or summarized
- compact/minimal: details closed by default

**Expected impact**
- immediately reduces story burden in tight states
- aligns with the locked target behavior

**Cross-layer implications**
- shared surface component tree
- a11y/focus management
- interaction tests
- CSS states

**Timing:** Implement now  
**Work class:** Structural redesign

---

## Priority 3 — Convert the rail into governed secondary disclosure
**Gap closed:** Gap 04  
**Implementation direction:**  
Give the supporting rail an explicit, mode-aware reveal control. The rail today
carries the `secondary[]` partition — additional projects plus stale-demoted
items — so the canonical framing is secondary/exploration disclosure. "Show past
spotlights" is an acceptable label when the authored content clearly reads as
historical; otherwise use `Show more projects` or an equivalent neutral label.

Recommended default behavior:
- wide: rail visible or lightly expanded
- medium: rail may remain visible if space supports it
- compact/minimal: rail hidden behind a reveal control (`Show more projects` /
  `Show past spotlights`, chosen to match authored content)

Possible render patterns:
- inline accordion block
- bottom sheet on handheld
- stacked expandable section below essentials

**Expected impact**
- protects primary hierarchy
- removes persistent secondary noise from tight states

**Cross-layer implications**
- shared surface
- a11y semantics
- storybook validation
- mobile interaction pattern selection

**Timing:** Implement now  
**Work class:** Structural redesign

---

## Priority 4 — Re-tune media scale and vertical footprint by mode
**Gap closed:** Gap 06  
**Implementation direction:**  
Replace static breakpoint-only media heights with mode-based media rules.

Suggested direction:
- wide: strong but not bloated image presence
- medium: moderate image presence
- compact: smaller hero with retained recognizability
- minimal: image still present, but subordinate to fast recognition and disclosure controls

Also consider using `contentCompleteness` to adjust the media/body balance when authored content is sparse.

**Expected impact**
- improves first-screen credibility
- reduces wasted vertical space
- keeps the surface premium without oversizing it

**Cross-layer implications**
- CSS module
- optional model field promotion
- stories

**Timing:** Implement now  
**Work class:** Refinement with structural dependency

---

## Priority 5 — Promote normalized content-completeness into the surface contract
**Gap closed:** Gap 07  
**Implementation direction:**  
Carry `contentCompleteness` through to the shared surface model so rendering decisions can be content-aware.

Use it to adjust:
- whether headline appears in a given mode
- whether summary is shown inline
- whether milestones appear inline or only in details
- whether CTA stays above or inside the details region

**Expected impact**
- better fallback behavior
- less rigid rendering
- cleaner authoring resilience

**Cross-layer implications**
- normalization
- webpart mapping
- shared model types
- shared surface rendering

**Timing:** Implement now  
**Work class:** Targeted refinement

---

## Priority 6 — Add proof-grade story/test coverage and documentation sync
**Gap closed:** Gaps 08, 09  
**Implementation direction:**  
After behavior changes land, add closure-grade validation.

Required additions:
- stories for each mode
- collapsed vs expanded details
- collapsed vs expanded history
- sparse-content variants
- narrowest stable nested mode
- README update
- migration/closure note update if relevant

**Expected impact**
- prevents regression
- aligns repo truth with actual implementation
- makes future audit work faster

**Cross-layer implications**
- storybook
- docs
- tests
- README

**Timing:** Implement now, immediately after the redesign  
**Work class:** Refinement / closure

## Defer until after the core redesign

These items can wait:
- advanced motion polish beyond existing reduced-motion-safe interactions
- authoring analytics / telemetry
- additional decorative status treatments
- optional editorial flourishes that do not materially affect compactness or disclosure
