# Phase 03 Risk Exposure — Homepage Composition and Template Hardening

## Purpose

Document the principal risks to control while executing Phase 03 of the homepage lane.

## Primary risks

### 1. Composition-layer ambiguity risk
Phase 01 defined the homepage as a product lane, but the package still carries a development/reference composition seam. Phase 03 can accidentally preserve ambiguity if it does not clearly define what is structural, what is preview-only, and what is authoritative.

**Control:** Make composition ownership explicit in docs and code. Do not leave “reference but still important” behavior undocumented.

### 2. Lane-boundary drift risk
As the homepage becomes more polished, there is a risk of reintroducing shell-like behavior into the page-canvas lane.

**Control:** Keep all work inside Lane A. No shell chrome, no top-ribbon mimicry, no footer rail behavior, no navigation-system duplication.

### 3. Over-abstraction risk
Phase 03 may tempt the agent to push homepage-local composition patterns into `@hbc/ui-kit` prematurely.

**Control:** Do not promote local homepage primitives to shared packages unless the non-homepage reuse threshold is genuinely met.

### 4. Interaction-state regression risk
Adding hover/focus-visible behavior through a new styling mechanism can easily cause visual regressions or import-discipline drift.

**Control:** Choose the lightest local mechanism that solves the problem, test it, and preserve homepage import discipline.

### 5. Accessibility regression risk
Improved visuals can degrade accessibility if focus, reduced motion, or semantic treatment are not handled carefully.

**Control:** Treat focus visibility, reduced-motion behavior, and semantic CTA choice as acceptance-gated items.

### 6. Preview-vs-production confusion risk
If the preview/template surface is not clearly documented, future work may treat it incorrectly as either disposable demo code or as the production rendering path.

**Control:** Explicitly document the preview/template posture and the relationship between preview composition and the production webpart lane.

### 7. Scope-creep risk
Phase 03 can easily balloon into property-pane work, async data integration, or shell-extension work.

**Control:** Keep those concerns explicitly deferred. Do not solve future-phase problems inside this package.

## Risk posture summary

Phase 03 is a **hardening and composition** phase, not a platform-expansion phase.

The safest successful outcome is:
- clearer composition architecture,
- stronger top-band and interaction behavior,
- better preview/template governance,
- and clean verification closure,
without changing the homepage lane’s ownership model.
