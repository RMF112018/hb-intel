# 04 — Prioritized End-State Enhancement Plan

## Priority 1 — Create a doctrine-safe flagship top-band

### Gap closed
- G-01
- G-06
- G-07
- G-08

### Product-grade solution
Replace the current “top of page is just the first zone” posture with an explicit flagship top-band object owned by `hbHomepage`.

This requires two coordinated changes:
1. realign the shared hero primitive to current homepage doctrine
2. compose that hero from the shell as the true opening plane of the homepage

### Outcome
The homepage gets:
- a real first read
- a focal plane
- immediate confidence and brand authority
- a clear primary-to-secondary hierarchy for the rest of the page

### Cross-layer implications
- `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx`
- `packages/ui-kit/src/homepage.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `HbHomepageShell.module.css`
- possibly adjacent homepage helper/config files for greeting/brand data

### Timing
Implement now

### Scale
Structural redesign

---

## Priority 2 — Give the shell explicit composition governance

### Gap closed
- G-02
- G-04
- G-10

### Product-grade solution
Introduce an explicit shell composition model:
- zone registry / ordered layout config
- zone role classification (`flagship`, `primary`, `supporting`, `anchoring`, `people`, `recognition`, etc.)
- per-zone fallback policy
- spacing and placement rules
- shell-level metadata for future governance and validation

The shell should stop being just a list of imports in JSX order.

### Outcome
- better maintainability
- stronger product authorship
- clearer seam contracts
- easier future evolution without ad hoc layout drift

### Cross-layer implications
- `hbHomepageContract.ts`
- `HbHomepageShell.tsx`
- potentially a new `zoneRegistry.ts` or `homepageComposition.ts`

### Timing
Implement now

### Scale
Structural redesign

---

## Priority 3 — Replace silent zone failures with visible premium degradation

### Gap closed
- G-03

### Product-grade solution
Upgrade `ZoneErrorBoundary` to render:
- a compact, premium, section-safe fallback surface
- zone-identifiable failure messaging suitable for authors/admins
- optional dev-only detail hooks without leaking noisy internals to normal viewers

### Outcome
- doctrine compliance
- better authoring safety
- easier operational diagnosis
- no invisible homepage collapse

### Cross-layer implications
- `ZoneErrorBoundary.tsx`
- shared homepage empty/error primitives if needed

### Timing
Implement now

### Scale
Targeted refinement

---

## Priority 4 — Promote a split-safe People & Culture Public surface into the governed homepage family

### Gap closed
- G-05

### Product-grade solution
Create a new split-safe shared People & Culture public surface family under `@hbc/ui-kit/homepage` rather than keeping the entire public surface local and inline-style driven.

The split-runtime boundary should remain hard. The presentation layer should still be governed.

### Outcome
- removes one-off styling drift
- improves repeatability
- preserves the split between recognition and non-recognition
- makes the homepage family more coherent

### Cross-layer implications
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
- `PeopleCulturePublicSurface.tsx`
- new or promoted shared surface files in `packages/ui-kit/src/`

### Timing
Implement now

### Scale
Structural redesign

---

## Priority 5 — Validate the homepage in hosted conditions and score closure explicitly

### Gap closed
- G-09

### Product-grade solution
Create a real validation package:
- hosted screenshots
- viewport/zoom checks
- keyboard/focus checks
- defect log
- conformance scorecard
- explicit pass/fail closure

### Outcome
- benchmark workflow compliance
- credible acceptance posture
- fewer false closures

### Cross-layer implications
- tests
- docs
- validation notes
- possibly Playwright/host harness coverage if available in repo

### Timing
Implement after structural changes land

### Scale
Refinement and closure proof
