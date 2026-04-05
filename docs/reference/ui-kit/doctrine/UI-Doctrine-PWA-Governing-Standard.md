# UI Doctrine — PWA Governing Standard

> **Governing Status:** Primary governing doctrine for PWA surfaces in HB Intel.  
> **Scope:** PWA routes, immersive product pages, work hubs, dashboards, wizard flows, presentation surfaces, deeply customized operational experiences.  
> **Supersedes:** Any older UI-kit wording that assumes one universal shell, one universal wrapper, or one universal interpretation of density, layout, and host behavior across all runtimes.

---

## 1. Governing intent

The PWA is a fully owned product runtime.

That means the design system should protect:
- coherence
- accessibility
- maintainability
- quality

while still allowing:
- bespoke composition
- premium dashboard design
- authored hero moments
- refined motion
- strong visual hierarchy
- immersive workflow-specific layouts

The PWA doctrine is intentionally written to preserve **disciplined creative freedom**.

Consistency is required. Sameness is not.

---

## 2. Shared obligations that still apply

PWA surfaces must still honor the HB shared design language:

- semantic color system
- typography family and hierarchy
- accessibility compliance
- token-first design discipline
- reusable component promotion discipline
- strong information hierarchy
- production-quality interaction states
- reduced-motion support
- performance awareness

These remain mandatory.

---

## 3. PWA freedoms explicitly allowed

## 3.1 Shell freedom
The PWA may use different shell treatments by:
- route type
- user role
- workflow
- device
- mode
- page purpose

A single shell pattern is not required across all PWA surfaces.

## 3.2 Layout freedom
PWA surfaces may use:
- dashboard layouts
- asymmetrical layouts
- immersive landing pages
- wizard and step-flow layouts
- split-pane work surfaces
- executive presentation surfaces
- canvas-style hubs
- storytelling or orientation experiences
- specialized tool layouts

## 3.3 Composition freedom
Teams may create:
- bespoke hero compositions
- executive-grade cards
- premium chart or spotlight surfaces
- authored top bands
- unique dashboard grids
- route-specific layout primitives

without first forcing every composition into a shared primitive.

## 3.4 Motion freedom
PWA surfaces may use richer motion and transition behavior when it improves:
- clarity
- continuity
- perceived quality
- state change legibility
- executive-grade polish

---

## 4. Doctrine corrections to prior over-restrictions

## 4.1 `WorkspacePageShell` is default, not universal law
`WorkspacePageShell` should be the default wrapper for standard operational pages.

It is **not mandatory** for:
- homepages
- presentation routes
- premium landing pages
- specialized dashboards
- custom work hubs
- mold-breaker surfaces
- onboarding/tour experiences

## 4.2 Direct Fluent usage is allowed when justified
Default to `@hbc/ui-kit` exports.

Direct Fluent usage is allowed when:
- a wrapper does not yet exist
- the surface is experimental or incubating
- platform ergonomics are better served directly
- the work is too specialized to promote yet

If the pattern becomes reusable, wrap and promote it.

## 4.3 Token discipline remains strong, but not absolutist
Use shared semantic tokens by default.

Allowed in PWA surfaces when justified:
- local CSS variables
- feature-level aliases
- surface-specific spacing or motion values
- temporary local tokens
- layout-level design constants

provided they are:
- intentional
- clearly scoped
- named meaningfully
- promotable if reuse emerges

## 4.4 Horizontal scroll is disfavored, not banned
Avoid horizontal scroll for ordinary list and dashboard surfaces.

Allowed when the surface is genuinely wide and analytical, including:
- forecasting grids
- schedule matrices
- financial comparisons
- expert-mode analytical tables

Use disciplined mitigation where appropriate:
- sticky headers
- frozen key columns
- prioritization of key fields
- compact/mobile fallback patterns where feasible

## 4.5 Field doctrine is mode-aware, not universally dominant
Field-readability standards remain important.

But field assumptions must not flatten all desktop or executive-grade experiences.

Use field doctrine where it is appropriate to:
- field workflows
- touch contexts
- outdoor conditions
- device-driven density changes

not as a universal override for every PWA surface.

---

## 5. Reuse and kit-promotion doctrine

## 5.1 Default rule
Use `@hbc/ui-kit` for reusable primitives whenever possible.

## 5.2 Promotion threshold
Promote a pattern into the kit when it is:
- used in 2+ meaningful surfaces
- clearly reusable
- visually aligned with the HB language
- not tightly coupled to one business workflow

## 5.3 Local ownership is acceptable
Keep a component local when:
- it is highly specialized
- it is route- or workflow-specific
- it is still evolving
- promotion would be premature

---

## 6. Quality bar

PWA design freedom does **not** weaken the quality bar.

All PWA surfaces must still meet:
- accessibility standards
- strong focus states
- reduced-motion support
- robust empty/loading/error states
- touch support when relevant
- performance discipline
- visual clarity under real usage conditions

Premium UI is not an excuse for ornamental excess or weak usability.

---

## 7. Exception standard

A doctrinal exception is acceptable when it produces a materially better result in:
- comprehension
- hierarchy
- route purpose
- product distinctiveness
- workflow efficiency
- executive presentation quality
- user delight without confusion

An exception is not acceptable when it merely creates novelty, drift, or style inconsistency.

---

## 8. Definition of success

This doctrine succeeds when the PWA feels:
- premium
- powerful
- flexible
- unmistakably HB
- coherent
- refined
- modern
- product-grade
- not over-governed into blandness
