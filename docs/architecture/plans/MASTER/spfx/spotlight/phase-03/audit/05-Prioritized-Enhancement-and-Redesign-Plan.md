# Prioritized Enhancement and Redesign Plan

## Priority 1 — Close media truth and missing-media posture

### Enhancement
Prove whether the hosted runtime is failing because:
- image data is missing,
- image mapping is wrong,
- URLs are invalid,
- permissions / media-host differences exist,
- or the surface simply degrades badly when media is absent.

### Exact gaps closed
- Missing-media billboard
- Weak first-view value
- Identity / media quality failure

### Implementation direction
- inspect the live list mapping and actual image URL outputs
- add proof logs or story/test fixtures for each image-shape case
- add a dedicated no-image / image-error layout that compresses the media zone and promotes title, signal, summary, and CTA upward
- remove or substantially quiet the “Project Image” placeholder treatment

### Impact
Very high. This is the single largest visible improvement.

### Timing
Implement now.

### Nature
Redesign.

## Priority 2 — Rebuild first-view hierarchy for the major shell slot

### Enhancement
Make the featured project unmistakably readable within the first desktop and tablet view.

### Exact gaps closed
- Weak first-view value in dominant slot
- Over-height featured composition
- Poor row parity against HB Kudos

### Implementation direction
- reduce wide / medium media height in row-sharing contexts
- consider letting title / headline / primary signal live within or immediately adjacent to the hero
- tighten masthead-to-featured spacing
- ensure the featured story begins earlier in the viewport

### Impact
Very high.

### Timing
Implement now.

### Nature
Redesign.

## Priority 3 — Make compact and minimal modes truly selective

### Enhancement
Change constrained modes from “compressed wide design” to “fast-read compact design.”

### Exact gaps closed
- Compact / minimal still too image-led
- Constrained-state value weakness

### Implementation direction
- reduce minimal hero height materially
- let missing-media minimal mode become title-first
- guarantee one strong project signal is visible before details open
- ensure buttons remain clear without letting context dominate

### Impact
High.

### Timing
Implement now.

### Nature
Redesign.

## Priority 4 — Rework history so it never competes with the featured story

### Enhancement
Keep past spotlights available, but subordinate them more aggressively.

### Exact gaps closed
- History rail visually too heavy
- Excessive vertical growth

### Implementation direction
- reconsider wide / medium default-open policy
- use a preview-row or lighter reveal pattern
- reduce border, padding, and visual mass
- retain accessibility and explicit disclosure

### Impact
Medium-high.

### Timing
Implement after first-view hierarchy is repaired.

### Nature
Refinement.

## Priority 5 — Harden CTA logic

### Enhancement
Guarantee the featured story has a credible next step.

### Exact gaps closed
- Featured CTA fragility

### Implementation direction
- define fallback CTA rules
- backfill with section-level destination when authored CTA is absent
- preserve truthful labeling

### Impact
Medium.

### Timing
Implement after or alongside hierarchy work.

### Nature
Refinement.

## Priority 6 — Bring the surface back under doctrine-clean styling control

### Enhancement
Replace the freehand styling posture with a governed local token seam and stronger primitive discipline.

### Exact gaps closed
- Token discipline breach
- Primitive underuse

### Implementation direction
- introduce local Spotlight tokens / CSS var bridge
- replace raw literals where reasonable
- use governed separators and, where justified, stronger overlay primitives
- keep the surface family modular and readable

### Impact
Medium.

### Timing
After runtime visual posture is corrected.

### Nature
Refinement.

## Priority 7 — Prove hosted closure

### Enhancement
Do not accept Storybook-only closure.

### Exact gaps closed
- Hosted proof gap

### Implementation direction
- capture hosted screenshots across the same device classes used in this audit
- add automated checks where reasonable
- document console status, dead-control status, and no-regression proof
- explicitly compare against the target acceptance criteria

### Impact
High as a closure discipline.

### Timing
Final wave.

### Nature
Refinement / hardening.
