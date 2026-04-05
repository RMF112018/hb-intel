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

## 3.1 Respect the host — BINDING
Do not design SPFx as though HB owns:
- suite bar chrome
- SharePoint app bar behavior
- all top-level navigation
- all shell patterns

Design for coexistence, not conquest.

## 3.2 Own the page canvas — BINDING
The primary place to express premium HB UI in SPFx is:
- full-width hero composition
- top-band layout
- authorable announcement blocks
- premium launcher systems
- spotlight grids
- editorial homepage sections
- section-based intranet composition
- supported extension placeholders

## 3.3 Avoid shell duplication — BINDING
Do not create unnecessary fake shell layers inside page content.

Avoid:
- duplicate app-shell bars
- redundant nav systems
- heavy chrome inside already hosted content
- decorative shell mimicry that competes with SharePoint

## 3.4 Authoring mode matters — BINDING
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

## 4. Doctrine corrections to prior over-restrictions

## 4.1 `HbcAppShell` and `WorkspacePageShell` are not universal SPFx defaults — DIRECTIONAL
These patterns may be used selectively, but they are not the default doctrine for SharePoint-hosted surfaces.

SPFx should generally favor:
- webpart-first composition
- section-aware layout
- host-cooperative rendering
- page-band composition

## 4.2 Direct Fluent usage is allowed when justified — DIRECTIONAL
Default to `@hbc/ui-kit` exports where practical.

Direct Fluent usage is allowed when:
- SharePoint interoperability is easier directly
- a host-specific wrapper would be artificial
- the pattern is not yet broadly reusable
- platform ergonomics benefit from staying closer to Fluent

If the pattern becomes common and reusable, wrap and promote it.

## 4.3 Token discipline remains strong, with host-aware overlays — BINDING (base), DIRECTIONAL (overlays)
Use shared semantic tokens by default.

Allowed when justified:
- SPFx-specific token aliases
- page-canvas-specific surface tokens
- host-aware spacing overlays
- property-pane-safe presentation constants
- homepage/editorial local tokens

The goal is disciplined adaptation, not forced sameness.

## 4.4 Horizontal scroll is discouraged, not absolutely banned — DIRECTIONAL
Avoid horizontal scrolling in ordinary webparts.

Allow it only when:
- the data is genuinely wide
- expert workflows justify it
- alternate presentation would meaningfully reduce utility

Use mitigation where appropriate:
- sticky headers
- key-column persistence
- responsive degradation
- compact fallback strategies where feasible

## 4.5 Motion should be lighter than in PWA — DIRECTIONAL
SPFx motion may still be refined, but it should generally be:
- lighter
- faster
- less theatrical
- more restrained
- more page-composition-friendly

Avoid shell-like motion behaviors that fight the host or degrade authoring/page performance.

---

## 5. Recommended layout families — DIRECTIONAL

SPFx surfaces should favor:
- hero + welcome pairings
- editorial top bands
- announcement and pulse strips
- premium launcher rails
- spotlight modules
- compact operational cards
- elegant section stacks
- full-width communication-site compositions where supported

These are the safest and most effective places to create visually distinguished HB experiences.

---

## 6. Webpart quality doctrine — BINDING

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

---

## 7. Exception standard

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

## 8. Definition of success

This doctrine succeeds when SPFx surfaces feel:
- premium
- branded
- elegant
- useful
- modern
- clearly better than default SharePoint
- but still compatible with SharePoint’s operating reality
