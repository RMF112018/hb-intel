# UI Doctrine — SPFx Governing Standard

> **Governing Status:** Primary governing doctrine for SPFx surfaces in HB Intel.
> **Scope:** SharePoint-hosted webparts, homepage surfaces, communication-site compositions, shell-adjacent extension surfaces, SharePoint-aware modules, authorable SPFx experiences.
> **Supersedes:** Any older UI-kit wording that assumes SPFx has no host-specific constraints or that SPFx should be governed identically to a fully owned PWA runtime.
> **Homepage overlay:** Homepage webparts follow the [SPFx Homepage Overlay](./UI-Doctrine-SPFx-Homepage-Overlay.md) which inherits from this standard and adds homepage-specific binding and directional rules.
>
> **Classification key:** Rules marked **BINDING** are mandatory. Rules marked **DIRECTIONAL** are strong guidance where justified deviation is acceptable.

---

## 1. Governing intent

SPFx runs inside a host-controlled environment.

That means HB does **not** fully own:
- the top Microsoft shell
- the SharePoint app bar
- all page chrome
- all page title and navigation behavior
- all layout rules

SPFx doctrine must therefore optimize for:

- host-aware polish
- page-canvas excellence
- elegant composition
- strong utility value
- authoring safety
- runtime resilience

The goal is not full shell domination.

The goal is a first-class HB experience inside supported SharePoint reality.

This standard now also locks a higher bar:

- premium authored composition
- visibly non-generic visual identity
- deliberate escape from the default enterprise card grid
- stronger webpart-specific product thinking
- a top-of-class stack for premium SPFx surfaces where justified

---

## 2. Shared obligations that still apply — BINDING

SPFx surfaces must still honor the shared HB language:

- semantic tokens
- typography and hierarchy standards
- accessibility
- component quality
- coherent card and status language
- disciplined motion
- reusable primitive strategy
- production-ready empty/loading/error states

These remain mandatory.

---

## 3. SPFx-specific doctrine

### 3.1 Respect the host — BINDING
Do not design SPFx as though HB owns:
- suite bar chrome
- SharePoint app bar behavior
- all top-level navigation
- all shell patterns

Design for coexistence, not conquest.

### 3.2 Own the page canvas — BINDING
The primary place to express premium HB UI in SPFx is:
- full-width hero composition
- top-band layout
- authorable announcement blocks
- premium launcher systems
- spotlight grids
- editorial homepage sections
- section-based intranet composition
- supported extension placeholders

### 3.3 Avoid shell duplication — BINDING
Do not create unnecessary fake shell layers inside page content.

Avoid:
- duplicate app-shell bars
- redundant nav systems
- heavy chrome inside already hosted content
- decorative shell mimicry that competes with SharePoint

### 3.4 Authoring mode matters — BINDING
Every SPFx doctrine decision must account for:
- page authors
- editors
- property panes
- partial configuration states
- section movement
- edit-mode readability
- composition predictability

A webpart that looks good only when fully configured is not production-ready.

---

## 4. Structural rebuild posture for premium SPFx surfaces

### 4.1 Default Fluent visual language is prohibited as the premium answer — BINDING
Fluent may remain in the technical stack for:
- accessibility alignment
- host-safe primitives
- interoperability
- token interoperability
- low-level utility use

Fluent must **not** define the dominant premium visual language of flagship SharePoint surfaces.

Prohibited as the dominant posture:
- generic Fluent-shaped cards
- default Fluent-feeling buttons and inputs
- safe enterprise panel styling used as the primary homepage language
- visual outcomes that still read as stock enterprise UI with a brand tint

### 4.2 Design-safety-zone outcomes are prohibited — BINDING
Premium SPFx surfaces must not settle into:
- thin-border white-card grids as the dominant page language
- timid hierarchy
- undersized modules floating in excessive empty canvas
- large empty hero slabs with minor copy changes
- pseudo-icons made from initials or Unicode symbols where a real icon system is expected
- subtle before/after deltas presented as a successful redesign

### 4.3 Structural rebuild is preferred over decorative refinement — BINDING
When a surface is materially underperforming, the default doctrine response is to:
- replace weak primitives
- replace weak composition models
- replace weak interaction patterns
- rebuild webpart architecture where needed

Do not preserve a weak system simply because it is already compiling.

---

## 5. Approved premium stack for advanced SPFx surfaces

### 5.1 Stack standard — BINDING for flagship homepage and premium communication surfaces
For flagship homepage and premium communication-site surfaces, the following stack is approved and expected where justified:

- `motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`

### 5.2 Stack usage intent — BINDING
These packages are not to be installed symbolically. They must be used deliberately.

#### `motion`
Use through `motion/react` for:
- reveal choreography
- premium hover and press states
- CTA response
- refined state transitions
- controlled depth and transform motion

#### `lucide-react`
Use as the canonical premium icon system for:
- launcher systems
- priority actions
- discovery/search affordances
- operational status cues
- editorial metadata accents where useful

Do not use Unicode icons or text initials as pseudo-icons when a premium icon system is expected.

#### `@floating-ui/react`
Use for:
- search suggestions
- anchored launcher flyouts
- command popovers
- contextual overlays
- premium tooltip positioning

#### `@radix-ui/react-slot`
Use for composable, reusable primitive shells.

#### `@radix-ui/react-tooltip`
Use for elegant micro-help and icon clarification.

#### `@radix-ui/react-separator`
Use for refined hierarchy and content rhythm.

#### `@radix-ui/react-scroll-area`
Use where polished overflow behavior is materially useful.

#### `class-variance-authority`
Use to define serious variant systems for:
- signature surfaces
- command surfaces
- launcher surfaces
- discovery surfaces
- editorial surfaces
- operational surfaces
- recognition surfaces

#### `clsx`
Use for readable class composition and variant orchestration.

### 5.3 Direct Fluent usage is allowed when justified — DIRECTIONAL
Default to `@hbc/ui-kit` exports where practical.

Direct Fluent usage is allowed when:
- SharePoint interoperability is easier directly
- a host-specific wrapper would be artificial
- the pattern is not yet broadly reusable
- platform ergonomics benefit from staying closer to Fluent

If the pattern becomes common and reusable, wrap and promote it.

This allowance does **not** override §4.1.

---

## 6. Token, motion, and layout doctrine

### 6.1 Token discipline remains strong, with host-aware overlays — BINDING (base), DIRECTIONAL (overlays)
Use shared semantic tokens by default.

Allowed when justified:
- SPFx-specific token aliases
- page-canvas-specific surface tokens
- host-aware spacing overlays
- property-pane-safe presentation constants
- homepage/editorial local tokens

The goal is disciplined adaptation, not forced sameness.

### 6.2 Motion should be lighter than in PWA but still premium — DIRECTIONAL
SPFx motion should generally be:
- lighter
- faster
- more restrained
- more page-composition-friendly

But “restrained” does not mean lifeless.

Premium SPFx motion should still be:
- clearly intentional
- visibly refined
- materially better than default enterprise hover states

Avoid shell-like motion behaviors that fight the host or degrade authoring/page performance.

### 6.3 Width and compositional authority matter — DIRECTIONAL
SPFx page-canvas work must not collapse into an overly narrow, timid content rail unless the content specifically justifies it.

Preferred patterns:
- strong asymmetric compositions
- confident width usage
- clear focal sequences
- deliberately authored negative space
- hierarchy that survives zoomed-out viewing

---

## 7. Recommended layout families — DIRECTIONAL

SPFx surfaces should favor:
- integrated signature heroes
- editorial top bands
- announcement and pulse strips
- premium launcher rails
- spotlight modules
- compact operational cards
- elegant section stacks
- full-width communication-site compositions where supported

These are the safest and most effective places to create visually distinguished HB experiences.

---

## 8. Webpart quality doctrine — BINDING

Every premium webpart must behave well when:
- minimally configured
- partially configured
- moved between sections
- used in full-width and non-full-width contexts
- viewed in edit mode
- loaded with missing or stale data

Every webpart should have:
- clear empty states
- professional partial-configuration states
- predictable section behavior
- author-safe defaults
- host-safe responsive behavior

Premium webparts must also have:
- real internal hierarchy
- credible iconography
- premium CTA behavior
- visibly distinct surface logic relative to their role

---

## 9. Manifest and packaging doctrine for premium homepage work

### 9.1 Manifest adjacency — BINDING
Every SPFx webpart must include the appropriate manifest adjacent to its webpart entry.

Do not treat manifest correctness as secondary to visual work.

### 9.2 Full-width support must be explicit where required — BINDING
Where a flagship hero or signature banner is intended to support SharePoint full-width placement, its manifest must explicitly declare full-bleed support.

This is not optional.

### 9.3 Structural intent must survive packaging — BINDING
Premium design work is not complete until:
- manifest intent is preserved into the package
- the `.sppkg` validates
- the rendered SharePoint-hosted output matches the intended structural upgrade

---

## 10. Exception standard

A doctrinal exception is acceptable when it materially improves:
- brand expression
- utility
- homepage quality
- communication clarity
- readability
- perceived polish
- host-safe tenant experience quality

An exception is not acceptable when it:
- fights the host
- duplicates chrome
- relies on brittle shell behavior
- creates maintenance risk for cosmetic gain

---

## 11. Definition of success

This doctrine succeeds when SPFx surfaces feel:
- premium
- branded
- elegant
- useful
- modern
- clearly better than default SharePoint
- visibly non-generic
- structurally productized rather than merely restyled
- compatible with SharePoint’s operating reality
