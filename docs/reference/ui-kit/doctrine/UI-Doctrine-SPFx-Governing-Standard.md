# UI Doctrine — SPFx Governing Standard

> **Governing Status:** Primary governing doctrine for SPFx surfaces in HB Intel.
> **Scope:** SharePoint-hosted webparts, homepage surfaces, communication-site compositions, shell-adjacent extension surfaces, SharePoint-aware modules, authorable SPFx experiences.
> **Supersedes:** Any older UI-kit wording that assumes SPFx has no host-specific constraints or that SPFx should be governed identically to a fully owned PWA runtime.
> **Homepage overlay:** Homepage webparts follow the [SPFx Homepage Overlay](./UI-Doctrine-SPFx-Homepage-Overlay.md) which inherits from this standard and adds homepage-specific binding and directional rules.
> **Non-homepage overlay:** Full-page app/widget/PCC-style SPFx surfaces follow the [SPFx Full-Page App and Widget Overlay](./UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md), which inherits from this standard and excludes homepage-only inheritance by default.
> **Acceptance model:** SPFx closure and scoring enforcement is defined in [UI Doctrine — Acceptance and Scoring Model](./UI-Doctrine-Acceptance-and-Scoring-Model.md).
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
- exceptionally dynamic adaptation across multiple display conditions

This doctrine assumes that future SPFx work must be designed to perform credibly on:

- ultrawide external displays
- standard laptop and desktop browsers
- large and medium tablets in landscape and portrait
- phones in portrait and landscape
- constrained browser windows, split-screen states, and higher zoom conditions

The objective is not merely “responsive enough.”

The objective is an **exceptionally dynamic, compositionally stable, positive experience** across realistic display conditions.

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

## 6. Token, motion, layout, and breakpoint doctrine

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

### 6.4 Practical-usable-space doctrine — BINDING

Raw hardware resolution is **not** the governing layout input.

SPFx design and implementation must prioritize:

- practical usable content width
- practical usable content height
- SharePoint chrome
- browser chrome
- zoom and reflow conditions
- section width constraints
- nested slot width
- split-screen and constrained-window states
- safe-area and input ergonomics on touch devices

A layout decision justified only by raw device resolution is non-compliant if the rendered result fails in real browser conditions.

### 6.5 Breakpoint governance is mandatory — BINDING

All serious SPFx shells and premium SPFx applications must have explicit breakpoint behavior.

At minimum, implementation and validation must account for:

- ultrawide desktop
- standard laptop / desktop
- tablet landscape
- tablet portrait
- phone portrait
- phone landscape / short-height constrained state

Every surface does **not** need identical layouts at all breakpoints.

Every surface **does** need:

- deliberate breakpoint behavior
- meaningful degradation
- retained task clarity
- no accidental compression
- no reliance on “it technically still renders”

### 6.6 Shell-level breakpoint doctrine — BINDING

Any SPFx page shell, composed page section, or multi-surface operating layer must define shell-level breakpoint behavior.

That shell-level behavior must govern:

- first-screen priorities
- hero or entry-band height control
- action-layer density
- lane visibility above the fold where relevant
- row-sharing versus stacking decisions
- spacing compression
- overflow and “more tools” rules
- short-height fallback behavior

Shells must be **container-aware** and must not place surfaces side-by-side simply because the viewport is nominally wide enough.

If the actual slot width cannot support a premium nested experience, the shell must:

- stack,
- widen,
- reorder,
- or move the occupant into a more appropriate layout mode.

### 6.7 Application-level breakpoint doctrine — BINDING

Every premium SPFx application or webpart must define its own narrowest stable behavior.

That includes:

- the smallest supported nested width
- the layout modes it supports (for example: wide, medium, compact, minimal, or single-column)
- what content compresses, reflows, hides, or overflows at each mode
- whether metadata must reduce or collapse
- whether panels, toolbars, summary bars, or side companions must stack or suppress
- how tap targets and focus affordances remain credible on touch-sized layouts
- how the experience behaves in higher zoom and constrained-height conditions

Applications must not rely only on viewport-wide media queries when they can be nested inside shells or variable page sections.

Where nesting materially affects stability, the application must support **container-aware** layout behavior.

### 6.8 Conditional multi-column rule — BINDING

Two-column or multi-column layouts are allowed only when they remain:

- readable
- balanced
- premium-looking
- interaction-safe
- free from awkward internal compression
- reflow-safe

If not, the correct response is:

- single-column fallback,
- altered layout mode,
- or shell-level reordering.

Single-column fallback is not failure.
Forced multi-column fragility is failure.

### 6.9 Reflow and zoom safety — BINDING

SPFx surfaces must remain usable under constrained conditions.

Prohibited outcomes:

- horizontal scrolling required to access primary content or critical actions
- awkward two-dimensional scrolling for ordinary use
- hidden critical controls at common zoom levels
- hover-dependent access to primary actions or meaning
- dense action clusters that become untappable on touch devices

### 6.10 Breakpoint specs are now a required design artifact — BINDING

When a shell or application materially depends on layout behavior, its implementation package must include a breakpoint spec or equivalent breakpoint contract.

That artifact must define:

- target device/display classes
- practical usable-space targets when relevant
- entry-state or first-screen priorities when relevant
- supported layout modes
- stacking and overflow rules
- narrowest stable nested state
- acceptance criteria for closure

Do not treat breakpoint behavior as implicit.

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
- container-aware shell lanes
- application modes that can transition cleanly from wide to compact states

These are the safest and most effective places to create visually distinguished HB experiences.

---

## 8. Webpart and application quality doctrine — BINDING

Every premium webpart must behave well when:

- minimally configured
- partially configured
- moved between sections
- used in full-width and non-full-width contexts
- viewed in edit mode
- loaded with missing or stale data
- nested inside a composed shell
- rendered in constrained-width and constrained-height states

Every webpart should have:

- clear empty states
- professional partial-configuration states
- predictable section behavior
- author-safe defaults
- host-safe responsive behavior
- explicit compact-state behavior where needed

Premium webparts and applications must also have:

- real internal hierarchy
- credible iconography
- premium CTA behavior
- visibly distinct surface logic relative to their role
- shell-fit awareness where they may be nested
- no fragile “desktop-only” assumptions in early or critical entry states

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

Breakpoint behavior that depends on manifest or host placement assumptions must also be validated in the packaged result.

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
- dynamic adaptation across important display conditions

An exception is not acceptable when it:

- fights the host
- duplicates chrome
- relies on brittle shell behavior
- creates maintenance risk for cosmetic gain
- preserves a fragile breakpoint outcome for convenience

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
- exceptionally dynamic across multiple display conditions
- compositionally stable when nested or constrained
- intentionally adapted rather than accidentally compressed
