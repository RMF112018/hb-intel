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

This standard now also locks a higher expectation:

- top-of-class product quality
- visibly non-generic interface design
- deliberate escape from the default AI-enterprise UI mold
- stronger route-specific authorship
- a premium modern stack when it materially improves the outcome

---

## 2. Shared obligations that still apply — BINDING

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

## 3. Premium PWA freedoms explicitly allowed

### 3.1 Shell freedom — BINDING
The PWA may use different shell treatments by:
- route type
- user role
- workflow
- device
- mode
- page purpose

A single shell pattern is not required across all PWA surfaces.

### 3.2 Layout freedom — BINDING
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

### 3.3 Composition freedom — BINDING
Teams may create:
- bespoke hero compositions
- executive-grade cards
- premium chart or spotlight surfaces
- authored top bands
- unique dashboard grids
- route-specific layout primitives

without first forcing every composition into a shared primitive.

### 3.4 Motion freedom — DIRECTIONAL
PWA surfaces may use richer motion and transition behavior when it improves:
- clarity
- continuity
- perceived quality
- state change legibility
- executive-grade polish

Motion freedom is real, but it must remain product-grade and disciplined.

---

## 4. Anti-safety-zone doctrine for PWA

### 4.1 Generic AI-enterprise outcomes are prohibited — BINDING
PWA surfaces must not settle into:
- thin-border white-card grids as the dominant product language
- timid hierarchy
- default “dashboard starter kit” layouts
- generic hero strips
- visually interchangeable modules
- subtle before/after changes presented as premium redesign

### 4.2 Default Fluent visual language is prohibited as the premium answer — BINDING
Fluent may remain in the stack for:
- technical interoperability
- accessibility alignment
- low-level primitives
- host-compatible utility behavior where relevant

Fluent must **not** define the dominant premium visual language of flagship PWA routes.

Prohibited as the dominant posture:
- generic Fluent-shaped cards
- default Fluent-feeling buttons and inputs
- safe enterprise panels as the primary route language
- barely customized stock enterprise layouts

### 4.3 Structural rebuild is preferred over decorative refinement — BINDING
When a route or module is materially underperforming, the default doctrine response is to:
- replace weak primitives
- replace weak composition models
- replace weak interaction systems
- rebuild route architecture where needed

Do not preserve a weak design model simply because it already works.

---

## 5. Doctrine corrections to prior over-restrictions

### 5.1 `WorkspacePageShell` is default, not universal law — DIRECTIONAL
`WorkspacePageShell` should be the default wrapper for standard operational pages.

It is **not mandatory** for:
- homepages
- presentation routes
- premium landing pages
- specialized dashboards
- custom work hubs
- mold-breaker surfaces
- onboarding or tour experiences

### 5.2 Direct Fluent usage is allowed when justified — DIRECTIONAL
Default to `@hbc/ui-kit` exports.

Direct Fluent usage is allowed when:
- a wrapper does not yet exist
- the surface is experimental or incubating
- platform ergonomics are better served directly
- the work is too specialized to promote yet

If the pattern becomes reusable, wrap and promote it.

This allowance does **not** override §4.2.

### 5.3 Token discipline remains strong, but not absolutist — BINDING (base), DIRECTIONAL (local overlays)
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

### 5.4 Horizontal scroll is disfavored, not banned — DIRECTIONAL
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

### 5.5 Field doctrine is mode-aware, not universally dominant — DIRECTIONAL
Field-readability standards remain important.

But field assumptions must not flatten all desktop or executive-grade experiences.

Use field doctrine where it is appropriate to:
- field workflows
- touch contexts
- outdoor conditions
- device-driven density changes

not as a universal override for every PWA surface.

---

## 6. Approved premium stack for advanced PWA surfaces

### 6.1 Stack standard — BINDING for flagship, dashboard, immersive, and presentation routes
For flagship, dashboard, immersive, and presentation-grade PWA surfaces, the following stack is approved and expected where justified:

- `motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`

### 6.2 Stack usage intent — BINDING
These packages are not to be added symbolically. They must be used deliberately.

#### `motion`
Use through `motion/react` for:
- route transitions
- reveal choreography
- premium hover and press states
- modal/panel transitions
- state change legibility
- executive presentation polish

#### `lucide-react`
Use as the canonical premium icon system for:
- command surfaces
- launcher systems
- navigation affordances
- search and discovery affordances
- operational cues
- editorial metadata accents

Do not use Unicode icons or text initials as pseudo-icons when a premium icon system is expected.

#### `@floating-ui/react`
Use for:
- anchored overlays
- search suggestions
- advanced popovers
- command menus
- contextual panels
- premium tooltip positioning

#### `@radix-ui/react-slot`
Use for composable shells and reusable CTA/link/button patterns.

#### `@radix-ui/react-tooltip`
Use for elegant micro-help and compact affordance clarification.

#### `@radix-ui/react-separator`
Use for refined hierarchy and content rhythm.

#### `@radix-ui/react-scroll-area`
Use for polished overflow in panels, rails, complex lists, and discovery surfaces where needed.

#### `class-variance-authority`
Use to define serious variant systems for:
- flagship surfaces
- command surfaces
- dashboard tiles
- launcher systems
- editorial surfaces
- operational surfaces
- recognition or presentation surfaces

#### `clsx`
Use for readable class composition and variant orchestration.

---

## 7. Reuse and kit-promotion doctrine

### 7.1 Default rule — BINDING
Use `@hbc/ui-kit` for reusable primitives whenever possible.

### 7.2 Promotion threshold — BINDING
Promote a pattern into the kit when it is:
- used in 2+ meaningful surfaces
- clearly reusable
- visually aligned with the HB language
- not tightly coupled to one business workflow

### 7.3 Local ownership is acceptable — DIRECTIONAL
Keep a component local when:
- it is highly specialized
- it is route- or workflow-specific
- it is still evolving
- promotion would be premature

### 7.4 Promotion expectation for premium primitives — DIRECTIONAL
When a route develops strong, reusable premium primitives for:
- hero systems
- command systems
- launcher surfaces
- discovery panels
- presentation-grade content blocks

those primitives should be considered for promotion rather than left fragmented across feature code.

---

## 8. Quality bar — BINDING

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

Premium PWA surfaces must also have:
- real internal hierarchy
- confident scale
- deliberate width usage
- credible iconography
- strong CTA behavior
- distinctly authored composition relative to route purpose

---

## 9. Layout, width, and composition doctrine — DIRECTIONAL

PWA surfaces should use the owned runtime to its advantage.

Preferred patterns:
- confident width usage
- asymmetric but coherent layouts
- strong focal sequencing
- deliberate negative space
- clear route-specific hierarchy
- premium top bands and flagship openings when appropriate

Avoid:
- timid centered rails
- weak undersized modules
- dashboard sameness
- layout systems that collapse every route into the same safe pattern

---

## 10. Exception standard

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

## 11. Definition of success

This doctrine succeeds when the PWA feels:
- premium
- powerful
- flexible
- unmistakably HB
- coherent
- refined
- modern
- product-grade
- visibly non-generic
- structurally authored rather than merely restyled
- not over-governed into blandness
