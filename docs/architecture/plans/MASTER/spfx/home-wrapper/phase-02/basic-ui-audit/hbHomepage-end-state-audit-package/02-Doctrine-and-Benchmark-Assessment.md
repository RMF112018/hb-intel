# 02 — Doctrine and Benchmark Assessment

## Assessment summary

The current `hbHomepage` implementation is **directionally aligned with several benchmark principles** but still **fails the flagship homepage standard** because the shell layer is too weak and one zone family materially drifts from the governed homepage system.

## A. Doctrine compliance

### What is strong

#### Import-discipline direction is mostly right
The homepage system is clearly attempting to route homepage presentation through `@hbc/ui-kit/homepage`, and Company Pulse, Leadership Message, and Project Spotlight are good examples of thin consumer posture above governed shared surfaces.

#### Host awareness is present
The shell does not duplicate SharePoint chrome. That part of the overlay is respected.

#### Full-width support is declared
The homepage manifest explicitly supports full bleed, which is correct for flagship homepage intent.

### Doctrine failures or material weaknesses

#### 1. No single flagship top-band object
The overlay requires the top band to read as one flagship product surface. The shell currently renders a straightforward zone stack with no commanding opening surface.

**Why it matters**
Without a top-band focal plane, the page reads as premium modules placed one after another, not as one authored homepage experience.

**Scale**
Structural redesign

#### 2. Error-state doctrine is not met at shell/zone boundaries
`ZoneErrorBoundary` returns `null` when a zone fails.

**Why it matters**
The doctrine requires graceful error behavior and author-safe defaults. A missing zone with only a console log is not professional runtime behavior.

**Scale**
Targeted refinement, but mandatory

#### 3. Token-discipline drift in People & Culture Public
`PeopleCulturePublicSurface.tsx` uses extensive inline styles, raw colors, raw spacing, and a local layout regime rather than a governed homepage surface family.

**Why it matters**
The homepage overlay explicitly prohibits ordinary homepage work from drifting into raw-value styling and local one-off surface logic when governed surface infrastructure should own the premium language.

**Scale**
Structural redesign

#### 4. Shared hero primitive is out of sync with current homepage doctrine
`HbcSignatureHeroSurface` still exposes editorial, CTA, context, and metadata slots and supports a gradient-wash background treatment. The overlay’s current hero rules are narrower and more specific.

**Why it matters**
Even though `hbHomepage` is not using the hero primitive today, the system does not yet have a doctrine-safe flagship hero primitive ready to adopt.

**Scale**
Structural redesign at shared-surface layer

## B. Benchmark conformance

### Strengths

#### Purpose-fit zone sophistication
- Company Pulse has strong newsroom persona expression.
- Leadership Message reads as executive editorial.
- Project Spotlight is strong, image-led, and confidence-building.
- HB Kudos remains the deepest runtime.

#### Shared primitive discipline in multiple zones
The move of durable presentation grammar into shared homepage surface families is benchmark-positive and should be preserved.

#### Contract/data rigor in Spotlight
Project Spotlight’s data seam is explicit and practical for SharePoint reality.

### Benchmark gaps

#### 1. Shell sophistication is below benchmark
The benchmark requires homepage-grade maturity equivalent to the strongest homepage work. The shell is currently too composition-light to meet that bar.

#### 2. State orchestration quality is below benchmark
There is no shell-level notion of:
- zone criticality
- zone fallback policy
- layout-role metadata
- shell-visible degradation state
- cross-zone hierarchy governance

#### 3. Validation and closure proof are below benchmark
This effort cannot be closed under the benchmark workflow without hosted runtime proof and a scorecard.

## C. Product and workflow UX

### What works
- Zones themselves have distinct personas.
- The page likely feels materially better than generic SharePoint module stacking.
- Users probably get useful, scanable sections.

### What does not yet work as flagship UX
- First read is not strong enough.
- There is no commanding opening hierarchy.
- Supporting vs primary relationships are implied only by vertical order.
- The page lacks a strong authorial gesture at the shell layer.

## D. React and UI-layer code quality

### Strong
- small zone wrappers
- reasonable separation between normalization and rendering in several zones
- shared surface promotion where it makes sense

### Weak
- shell ownership is too slight
- shell contract includes drift
- shell has no explicit zone registry/config model
- People & Culture Public is a local presentation island

## E. SPFx and host-fit quality

### Strong
- no fake shell duplication
- manifest correctly signals full-bleed intent

### Weak / incomplete
- no evidence of actual flagship full-width top-band usage
- no hosted validation proof for real SharePoint widths/zoom
- null-on-failure zone behavior is not credible host-safe degradation

## F. Styling architecture

### Strong
- mature shared zone families use premium stack patterns
- homepage entrypoint centralizes brand foundation and guardrails

### Weak
- shell layout is generic relative to flagship ambition
- People & Culture Public uses local inline-style composition
- shared hero primitive is not yet aligned with the latest overlay rules

## G. Accessibility and interaction

### Positive signals
- reduced-motion handling appears in multiple places
- some richer surfaces include keyboard and dialog handling
- Kudos in particular has a more credible interaction model

### Concerns
- zone failure becomes invisible
- no proof of shell-level focus order / runtime behavior
- no hosted validation evidence for zoom, width, or authoring mode

## H. Product advancement opportunities

### Highest-value upgrades
1. Create the real flagship top-band.
2. Give the shell explicit layout and fallback governance.
3. Promote a split-safe People & Culture Public family into the governed homepage system.
4. Close the gap between the shared hero primitive and current homepage doctrine.
5. Add proof-based hosted closure artifacts.

## Provisional scorecard

### Score (0–4 each)

| Category | Score | Notes |
|---|---:|---|
| Purpose-fit sophistication and persona expression | 3 | Strong zones, weak shell |
| Interaction completeness | 2 | Good depth in Kudos, thinner elsewhere, shell lacks cross-zone behavior |
| Shared primitive discipline | 2 | Strong in multiple zones, materially weak in People & Culture Public |
| Contract / data rigor | 3 | Spotlight is solid; shell contract shows drift |
| Backend seam quality | 3 | Spotlight and Kudos show credible seams |
| State orchestration | 2 | Shell is under-governed |
| UX completeness | 2 | Missing shell-level flagship behavior and graceful zone failure |
| Identity / media / attribution | 3 | Generally credible, especially Spotlight/Kudos |
| Accessibility / host behavior | 2 | Partial positive signals, insufficient proof, null error fallback hurts credibility |
| Validation / closure proof | 1 | No hosted proof package available here |

**Total: 23 / 40**

## Interpretation

- Below the 36+/40 flagship threshold
- Below a credible closure posture for `hbHomepage`
- Not a failure of the individual zones
- Primarily a failure of shell-level flagship composition and shared-surface closure
