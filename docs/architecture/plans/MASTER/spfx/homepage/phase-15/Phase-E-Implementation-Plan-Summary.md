# Phase E Implementation Plan Summary — Homepage Composition Pass

## Objective

Implement the **homepage composition corrections and upgrades** required to make the HB Central homepage read like a cohesive premium homepage rather than a sequence of individually improved surfaces with insufficient full-page rhythm.

This phase exists to solve the remaining composition problem identified in the audit:

> the homepage can have stronger individual surfaces and still feel under-authored if the zone sequence, section intros, spacing rhythm, and inter-zone hierarchy do not read as one composed experience.

Phase E must substantially improve the page-level composition while staying inside the current SharePoint/SPFx lane boundaries and without pretending the governed composition preview is the literal production rendering path.

---

## Why Phase E Matters

A homepage does not become premium only because its constituent webparts are better.

It becomes premium when:

- the top band feels like the start of a page story
- utility, communications, operational, and discovery zones have clear rhythm and relative weight
- section intros and spacing create momentum instead of visual fatigue
- the page feels deliberately composed at full-page scale
- transitions between zones feel authored instead of merely stacked

Without that final composition pass, the homepage risks feeling like “good modules arranged competently” rather than a truly polished front door.

---

## Phase E Scope

### Core target
Upgrade the homepage composition layer so it becomes:

- more intentional
- more rhythmic
- more premium
- more narratively structured
- more clearly sequenced from top band through discovery
- less dependent on generic section wrappers and neutral stacking behavior

### Intended outputs
- stronger zone rhythm and spacing cadence
- stronger section shell / section-intro treatment
- stronger inter-zone hierarchy and ordering logic
- improved full-page posture in `ReferenceHomepageComposition`
- cleaner background / tint / grouping logic
- better consistency across zone headers and section intros
- validation/docs/closeout

---

## Process Overview

1. establish the final Phase E composition model against current repo truth
2. refine zone rhythm and section narrative rules
3. redesign `ReferenceHomepageComposition` and inter-zone hierarchy
4. polish composition shells, spacing, and page-level consistency
5. validate build, lint, tests, docs, and packaging-sensitive seams

---

## Risk Exposure

### 1. Reference-vs-production confusion risk
`ReferenceHomepageComposition` is a governed composition reference and development surface. It is not the production rendering path. The phase must improve real composition truth without falsely implying a monolithic production homepage runtime.

### 2. Over-styling risk
There is a risk of solving composition weakness with decorative wrappers, large tints, or overly theatrical section treatments. The goal is premium composition, not visual noise.

### 3. Local-only drift risk
There is a risk of making improvements that only benefit the composition preview and do not improve the real shared composition layer. Any reusable value should be pushed into the correct shared homepage-safe primitives.

### 4. Boundary confusion risk
Phase E should not drift into shell customization, SharePoint DOM takeover, or other Lane B / host-level behavior.

### 5. Inconsistent hierarchy risk
If zone intros, section headings, tints, and spacing are only partially rationalized, the page can feel even more inconsistent than before.

---

## Standards / Best Practices

- keep repo truth authoritative
- preserve the current independent-webpart production model
- improve composition truth at the correct seam
- prefer strong hierarchy and rhythm over decorative surface changes
- preserve visible focus and reduced-motion behavior
- keep token discipline intact
- make zone differentiation deliberate but restrained
- validate both visual-system correctness and packaging-sensitive safety

---

## Suggested Acceptance Criteria

Phase E should not be considered complete until all of the following are true:

1. `ReferenceHomepageComposition` reads as a clearly stronger governed homepage reference.
2. The five zones have clearer sequencing, rhythm, and relative emphasis.
3. Section shells and intros no longer feel like generic semantic wrappers with little authored presence.
4. The page reads as one premium experience rather than a stack of isolated cards and sections.
5. Any shared composition-layer extensions are justified, documented, and correctly owned.
6. Homepage import doctrine, token discipline, accessibility, reduced motion, and authoring-safe behavior remain intact.
7. Story/test/doc/build validation has been completed and documented.
8. The completion note clearly separates:
   - what was improved in composition truth
   - what was improved in shared wrappers/tokens
   - what remains constrained by the current production model

---

## Deliverables

- updated code
- updated docs/stories/tests as needed
- Phase E completion note
- concise list of remaining later-phase follow-ons
