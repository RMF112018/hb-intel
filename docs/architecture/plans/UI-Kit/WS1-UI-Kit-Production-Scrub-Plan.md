# Workstream I — UI Kit Production Scrub, Market-Benchmarking, Visual Hierarchy, and 10X Polish

> **Doc Classification:** Canonical Normative Plan — master plan for Workstream I (UI Kit Production Scrub). Governs `WS1-T01` through `WS1-T13`. Must be read before any Workstream I task plan is executed.

**Version:** 1.0
**Date:** 2026-03-15
**Status:** Active
**Governs:** `WS1-T01` through `WS1-T13`
**Read with:** `CLAUDE.md` → `current-state-map.md` → `HB-Intel-Blueprint-V4.md` → `HB-Intel-Wave-0-Buildout-Plan.md` → this document → individual T01–T13 plans
**Blueprint reference:** `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`
**Package authority:** `docs/architecture/blueprint/package-relationship-map.md`

---

## 1. Purpose

Workstream I establishes and enforces the production visual standard across the entire HB Intel UI surface — both the shared component layer and every feature-specific UI component throughout the application. `@hbc/ui-kit` is hardened as the production visual operating layer that owns all reusable, shared primitives. But the standards established here — visual hierarchy, anti-flatness, adaptive density, field readability, accessibility, and premium feel — govern every component rendered by HB Intel, regardless of which package owns it.

The blueprint establishes that `@hbc/ui-kit` owns reusable visual components and that the Personal Work Hub is the primary UX orientation for Wave 1. This workstream ensures both the shared kit and all application-level UI are genuinely production-ready before Wave 1 broadens.

### The two-layer scope

**Layer 1 — `@hbc/ui-kit` (shared primitives):** The kit is hardened as the single canonical source for all reusable visual components. Buttons, tables, forms, cards, shell, navigation, overlays, status indicators — any component used across more than one feature package lives here and must meet the full production standard.

**Layer 2 — Application UI (feature-specific components):** Feature packages and app packages own composition shells and feature-specific UI logic that does not belong in the kit. These components are not subject to kit ownership rules, but they are fully subject to the same visual standards. Hierarchy, accessibility, density, field readability, and anti-flatness apply regardless of package location.

The standard is uniform. The ownership boundary is preserved.

### What Workstream I is not

Workstream I does not invent business workflows. It does not produce decorative experimentation with no product value. It does not dilute `@hbc/ui-kit` as the single reusable visual layer. It does not mandate that all UI live in the kit — only that all UI meets the same standard.

---

## 2. Market Benchmark and Mold-Breaker Doctrine

HB Intel must treat current construction-tech leaders as the floor, not the ceiling.

Market analysis of leading platforms (Procore, ACC, InEight, CMiC) reveals a consistent enterprise pattern: persistent shell, collapsible navigation, dashboard cards, configurable tables, contextual toolbars, semantic status systems, and specialized full-canvas viewers. These platforms earn praise for professionalism and configurability. They earn recurring criticism for steep learning curves, information overload, excessive clicks, visual fatigue, field-hostile density, and interfaces more complex than necessary.

### Mold-breaker position

- HB Intel must meet or exceed the category benchmark in professionalism, consistency, responsiveness, component quality, and enterprise readiness — across both kit components and all application UI.
- HB Intel must surpass the category in visual hierarchy, anti-flatness, cognitive clarity, field readability, adaptive density, contextual focus, and PWA-native polish — across every surface, not only where the kit is used directly.
- The goal is not to resemble Procore, ACC, InEight, or CMiC. The goal is to make those products feel visually older, more cluttered, and less intuitive by comparison.

---

## 3. Visual Excellence Standard

HB Intel must emerge from this workstream with a visual language that is modern but restrained, premium but not flashy, dense but breathable, highly legible, clearly hierarchical, purposeful in depth, coherent across all surfaces, immediately scannable, field-capable in poor lighting and touch-imprecise conditions, and strong enough for both installed PWA and SharePoint-hosted contexts. This standard applies to the shared kit components and to every feature-specific UI component in the application.

This workstream owns: color, shape, spacing, typography, depth/elevation, motion, surface treatment, page composition, visual hierarchy, anti-flatness, adaptive density, field readability, and overall premium feel — as a universal application standard, not merely as kit-package rules.

### Non-negotiable visual outcomes

When complete, HB Intel's full UI surface must produce interfaces where:

- primary actions are obvious without shouting
- important information stands out immediately
- supporting information recedes appropriately
- cards, panels, tables, headers, and overlays do not all carry equal visual weight
- layouts no longer feel flat or monotonous
- dashboards and work queues are readable within seconds
- field users can parse the interface in bright light and under imperfect touch conditions
- the kit creates attractive real pages, not only attractive isolated component demos

---

## 4. Why This Is a Wave 0 Closeout Item

Wave 0 must not hand off to Wave 1 with a UI kit that is broad but uneven, technically governed but aesthetically incomplete, or consistent in theory but flat in real page compositions. The roadmap treats shared UI/system patterns as a real Wave 1 dependency and requires balanced SPFx/PWA progress. The PWA must also prove a credible personal starting point early. The kit must be production-ready before Wave 1 broadens.

---

## 5. Governing Principles

All task plans in this workstream are bound by:

- **Blueprint package ownership:** `@hbc/ui-kit` owns all reusable visual components. Feature packages compose it; they do not duplicate it.
- **Universal visual standards:** The visual standards established by this workstream — hierarchy, anti-flatness, density, field readability, accessibility, and premium quality — apply to every UI component in the application, not only to components inside `@hbc/ui-kit`. Package location does not exempt a component from the standard.
- **Anti-fork rule:** No Wave 1 consumer may create a local visual system that substitutes for kit primitives. Feature-specific components that are genuinely not reusable are acceptable; local duplicates of kit primitives are not.
- **Field-first design constraint:** Sunlight readability and touch forgiveness are first-class design constraints for all UI in the application, not afterthoughts.
- **Visual excellence is required:** Tokenization compliance without aesthetic quality is not acceptance — whether the component lives in the kit or in a feature package.
- **3-second read standard:** Any Wave 1-critical page composition must communicate hierarchy within 3 seconds of first view, regardless of which packages supply its components.

---

## 6. Workstream Scope

**In scope — shared layer:**
- All exported `@hbc/ui-kit` components and entry points
- All design tokens, themes, semantic colors, spacing scales, radii, typography scales, elevation/shadow rules, borders, motion patterns, and surface treatments
- Page-shell and composition primitives
- Storybook and visual reference documentation
- Migration or replacement of weak, placeholder-grade, or visually immature kit components

**In scope — application layer:**
- All Wave 1-critical feature-specific UI components in PWA and SPFx feature packages
- App shell and surface-level composition components outside the kit
- Accessibility, field-readability, and responsive behavior for all application UI
- Standards conformance audit of feature-package UI components against the workstream's visual standards
- Consumer-boundary audit ensuring reusable primitives live in the kit and feature-local UI meets the same quality bar
- Visual regression, interaction testing, and composition validation across the full application surface

**Out of scope:**
- Business workflow invention unrelated to UI quality
- Decorative experimentation with no product value
- Dilution of `@hbc/ui-kit` as the single reusable visual layer
- Non-UI code in feature packages (data fetching, state management, API adapters)

---

## 7. Task Summary

| Task | Name | Primary Output | Unlocks |
|------|------|----------------|---------|
| T01 | Inventory, Maturity Scoring, and Consumer Map | Component maturity matrix; Wave 1 consumer map | T02–T13 prioritization |
| T02 | Competitive Benchmark Matrix and Mold-Breaker Principles | Benchmark matrix; mold-breaker doctrine doc | T03–T08 directional authority |
| T03 | Visual Language Refinement | Refined token system; normalized visual language | T04–T07 implementation baseline |
| T04 | Visual Hierarchy and Anti-Flatness Overhaul | Hierarchy rules; depth system | T07–T08 composition quality |
| T05 | Adaptive Density and Field-Readability Hardening | Density mode definitions; field-readability standards | T07–T08 touch/field conformance |
| T06 | Data-Surface Modernization | Adaptive data surface pattern library | T07, T08, Wave 1 data surfaces |
| T07 | Component-by-Component Polish Sweep | Production-quality component set | T08, T10, T11 |
| T08 | Real-Page Composition Audit | Composition review; Wave 1 page patterns; hierarchy/depth standards | T10, T13 acceptance |
| T09 | Accessibility and Implementation Trust | Full keyboard, ARIA, contrast, and screen-reader audit | T11, T13 acceptance |
| T10 | Storybook and Visual Reference Hardening | Release-grade Storybook; usage guide; visual language guide; field standards | T12, T13 acceptance |
| T11 | Verification Overhaul | Automated test suite; visual regression coverage; a11y automation | T13 acceptance |
| T12 | Application-Wide UI Standards Enforcement | Standards conformance report; migrated local patterns; contribution governance | T13 acceptance |
| T13 | Visual Excellence Scorecard and Production Acceptance | Production-readiness scorecard; release notes; residual debt register | Wave 1 entry gate |

---

## 8. Mandatory Output Artifacts

| Artifact | Produced By | Location |
|----------|-------------|----------|
| `UI-Kit-Component-Maturity-Matrix.md` | T01 | `docs/reference/ui-kit/` |
| `UI-Kit-Wave1-Consumer-Map.md` | T01 | `docs/reference/ui-kit/` |
| `UI-Kit-Competitive-Benchmark-Matrix.md` | T02 | `docs/reference/ui-kit/` |
| `UI-Kit-Mold-Breaker-Principles.md` | T02 | `docs/reference/ui-kit/` |
| `UI-Kit-Adaptive-Data-Surface-Patterns.md` | T06 | `docs/reference/ui-kit/` |
| `UI-Kit-Composition-Review.md` | T08 | `docs/reference/ui-kit/` |
| `UI-Kit-Wave1-Page-Patterns.md` | T08 | `docs/reference/ui-kit/` |
| `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` | T08 | `docs/reference/ui-kit/` |
| `UI-Kit-Usage-and-Composition-Guide.md` | T10 | `docs/reference/ui-kit/` |
| `UI-Kit-Visual-Language-Guide.md` | T10 | `docs/reference/ui-kit/` |
| `UI-Kit-Field-Readability-Standards.md` | T10 | `docs/reference/ui-kit/` |
| `UI-Kit-Application-Standards-Conformance-Report.md` | T12 | `docs/reference/ui-kit/` |
| `UI-Kit-Production-Readiness-Scorecard.md` | T13 | `docs/reference/ui-kit/` |
| `UI-Kit-Release-Notes.md` | T13 | `docs/reference/ui-kit/` |
| `UI-Kit-Residual-Debt-Register.md` | T13 | `docs/reference/ui-kit/` |

All reference documents must be registered in `current-state-map.md §2` upon creation under document class "Reference."

---

## 9. Task Dependency Sequencing

### Phase A — Discovery (T01, T02 in parallel)

T01 and T02 have no dependencies on each other and may proceed in parallel. T01 produces the maturity baseline; T02 produces the competitive and directional standard. Both are inputs to all subsequent work. Neither writes production code; both produce decision-governing documents.

### Phase B — Visual foundation (T03, T04, T05 in parallel, after T01 and T02 complete)

T03, T04, and T05 each consume the outputs of T01 and T02 as directional authority. They may proceed concurrently once Phase A is complete:
- T03 refines the visual language (tokens, color, shape, typography)
- T04 establishes the hierarchy and depth system
- T05 establishes density modes and field-readability standards

These three tasks set the constraints that T06 and T07 must implement against.

### Phase C — Implementation (T06, T07 sequenced after Phase B)

T06 (data surfaces) and T07 (component polish) both consume T03–T05 outputs as their governing visual standard. T06 and T07 may proceed concurrently once Phase B outputs are stable. T07 is the largest task in the workstream; it should begin as soon as T03 and T04 outputs are confident, even if T05 is still finalizing.

### Phase D — Composition and integration verification (T08, T09 in parallel, after T07 stabilizes)

T08 (real-page composition audit) and T09 (accessibility and implementation trust) may proceed in parallel once T07 reaches sufficient stability. T08 validates that the kit works in real screen compositions; T09 validates that it meets usability and trust thresholds.

### Phase E — Reference, testing, and cleanup (T10, T11, T12 in parallel, after T08/T09)

T10 (Storybook and visual reference), T11 (verification overhaul), and T12 (consumer cleanup) may proceed in parallel once T08 and T09 are complete. These tasks do not block each other.

### Phase F — Acceptance (T13, after T10–T12 complete)

T13 (production scorecard and sign-off) may not begin until T10, T11, and T12 are all complete. T13 is the Wave 1 entry gate.

---

## 10. Anti-Patterns This Workstream Must Eliminate

The following outcomes are explicitly unacceptable at workstream close:

- Flat pages with weak hierarchy
- Every card or panel carrying equal visual weight
- Cluttered shells that compete with content
- Horizontal scrolling as the normal answer for complex data
- Field-hostile contrast, spacing, and target sizing
- Too many clicks for common actions
- Dense pages that require hunting to understand
- Visible seams between newer and older visual treatments
- Premium-looking components that collapse into weak full-page compositions
- App-level visual patching outside the kit

---

## 11. Definition of Done

Workstream I is complete only when all of the following are true:

- `@hbc/ui-kit` is visually cohesive and production-grade across the board
- All Wave 1-critical feature-specific UI components meet the same visual standards as the kit
- The full application UI expresses clear visual hierarchy and no longer produces flat-feeling Wave 1 pages
- Color, shape, spacing, typography, depth, and motion are normalized and intentional across the entire UI surface
- Field-readability and adaptive density are proven across both kit and application components
- Major page compositions are beautiful, legible, and immediately understandable — whether composed entirely from the kit or from a mix of kit and feature components
- HB Intel matches category leaders in professionalism and exceeds them in clarity, focus, and usability
- Personal Work Hub can launch without downstream visual compensation in either kit or feature-level components
- Residual visual debt is explicit, small, and non-blocking
- All mandatory output artifacts exist and are registered in `current-state-map.md`
- T13 scorecard passes both system compliance and visual excellence thresholds across the full application UI

---

## 12. Hard No-Go Gates Before Wave 1

Wave 1 must not proceed if any of these remain true across any part of the application UI — whether the issue originates in `@hbc/ui-kit` or in a feature package:

- Wave 1-critical screens still feel flat, cluttered, or weak in hierarchy
- Primary vs. secondary information is not obvious at a glance
- Field users cannot comfortably parse and act from the interface
- Key components remain visually immature or placeholder-grade — in the kit or in feature packages
- Critical page patterns still rely on visual patching of any kind (kit or app-level)
- Visual regression and accessibility coverage remain too thin for the Wave 1 surface area
- Any Wave 1-critical feature-specific component fails the same visual standards required of kit components
- The application does not yet create a credible premium personal starting point for the PWA

---

## 13. Acceptance Gate

Workstream I is complete when all T01–T13 acceptance criteria are satisfied and T13 issues a passing production-readiness scorecard covering both system compliance and visual excellence.

---

*End of Workstream I — UI Kit Production Scrub Plan v1.0 (2026-03-15)*
