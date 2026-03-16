# WS1-T04 — Visual Hierarchy and Anti-Flatness Overhaul

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for visual hierarchy system and anti-flatness overhaul. Establishes the hierarchy rules and depth system that governs every major composition in Wave 1.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase B (parallel with T03 and T05, begins after T01 and T02 complete)
**Depends On:** T01 (maturity matrix surfaces current hierarchy weaknesses); T02 (mold-breaker principles govern anti-flatness requirements); T03 (refined visual language provides tools)
**Unlocks:** T07 component polish (hierarchy expression per component); T08 composition audit (hierarchy evaluation standard)
**Hard Requirement:** Any Wave 1-critical page composition must communicate hierarchy within 3 seconds of first view.

---

## Objective

Establish a comprehensive visual hierarchy system for `@hbc/ui-kit` that eliminates the flatness problem — the tendency of enterprise pages to render all content zones, cards, data blocks, and metadata at too-similar visual weight. Exit with documented hierarchy rules, a depth/elevation system, and clear distinctions between every major content zone type so that T07 can implement them and T08 can validate them.

---

## Why This Task Exists

Many current enterprise construction-tech pages read as visually flat. Headers, sections, cards, data zones, and metadata carry similar weight because no deliberate hierarchy system governs their relative importance. The result is pages that require significant cognitive effort to scan — the user must read nearly everything to find what matters.

The market benchmark (T02) confirms this is a category-wide weakness. HB Intel has the opportunity to solve this as a core architectural choice rather than a per-page afterthought. T04 makes the solution an architectural choice by encoding hierarchy rules in the UI kit.

Without T04, T07 (component polish) will make individual components more beautiful but the pages they compose will still feel flat. T04's output is what prevents that outcome.

---

## Scope

T04 covers:

1. Defining a complete hierarchy rule set for all text, content, and action levels
2. Defining clear zone distinctions for all major page areas
3. Establishing rules for card and panel weight differentiation
4. Defining the depth and elevation system
5. Establishing the 3-second read standard as a testable threshold for Wave 1-critical compositions
6. Producing `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` as a standing reference (this document is primarily produced by T08, but T04 defines its content foundations)

T04 does not cover:

- Implementing hierarchy changes in individual components (that is T07)
- Validating compositions (that is T08)
- Defining field-specific density adaptations (that is T05)

---

## Required Actions

### Hierarchy rule set

Define hierarchy rules for every content level that appears in HB Intel interfaces:

| Content level | Visual treatment requirements |
|--------------|-------------------------------|
| Page title | Largest treatment on the page; unambiguous top-level landmark |
| Section title | Clearly subordinate to page title; clearly superior to body content |
| Summary metrics / KPIs | High visual weight; scannable at distance; value more prominent than label |
| Body content | Standard weight; comfortable reading density |
| Metadata | Reduced weight; not competing with body content |
| Secondary annotations | Further reduced; supporting role only |
| Helper text | Smallest readable size; no visual competition |
| Status indicators | Semantic color treatment; consistent positioning |
| Urgency indicators | Must stand out from status; not overused |
| Primary calls to action | Visually prominent; obvious without shouting |
| Secondary calls to action | Clearly subordinate to primary; not competing |
| Destructive actions | Distinguishable from primary; not casually placed |

### Zone distinction system

Define clear visual treatment rules for all major page zones:

| Zone | Role | Required visual treatment |
|------|------|--------------------------|
| Page header | Identity and orientation | Highest-weight zone on page; distinct from command area |
| Command area | Primary action affordances | Clear separation from header and content |
| Filter area | Scoping controls | Visually contained; does not compete with content |
| Summary area | KPI and metric strip | Elevated above content zone; scannable first |
| Primary content area | Main work content | Maximum reading clarity; appropriate density |
| Secondary / detail area | Supporting detail, related context | Lower weight than primary content |
| Activity / history area | Temporal stream | Least weight; supporting role |

### Card and panel weight differentiation

Establish rules that prevent all cards and panels from reading as equally important:

- Define at least three visual weight classes for card/panel treatment: primary, standard, and supporting
- Primary cards carry the user's most important current-context information
- Standard cards are the default; they must not compete with primary cards
- Supporting cards recede — metadata, history, secondary context
- Panels within a layout must not all share the same elevation or border treatment

### Depth and elevation system

Define a deliberate depth system with clear semantic meaning:

| Elevation level | Semantic meaning | Usage |
|----------------|-----------------|-------|
| 0 — base | Page background | Base canvas only |
| 1 — raised | Separated content surface | Cards, list items, data rows |
| 2 — floating | Content above the page surface | Sticky headers, toolbars, filter bars |
| 3 — overlay | Temporary surface above all content | Drawers, side panels, dropdowns |
| 4 — modal | Blocking surface | Dialogs, confirmation overlays |

Each elevation level must have defined shadow, border, and backdrop token combinations so components can self-place correctly in the depth stack.

### 3-second read standard

Define what "communicates hierarchy within 3 seconds" means operationally:

- The page title is identifiable within 1 second
- The primary content zone is distinguishable from metadata and supporting zones within 2 seconds
- The primary call to action is obvious within 3 seconds
- No critical information is buried in visually equivalent treatment

This standard applies to all Wave 1-critical compositions and must be used as the evaluation criterion in T08's composition audit.

---

## Governing Constraints

- **T02 mold-breaker principles govern this task.** "Stronger first-glance hierarchy" and "more deliberate depth" are explicit mold-breaker requirements. Every decision in T04 must satisfy them.
- **Hierarchy must be expressed through multiple dimensions.** Scale alone is not hierarchy. Weight contrast, spacing, color, containment, and depth must all contribute. Flat pages that merely vary font size are not compliant with this task's requirements.
- **Hierarchy rules must be implementable.** Rules that require subjective per-page judgment are insufficient — they must translate into component properties, token choices, or composition patterns that T07 and T08 can apply consistently.

---

## Acceptance Criteria

- [x] Hierarchy rule set covers all content levels with explicit visual treatment requirements
- [x] Zone distinction system covers all seven major page zones with required visual treatment rules
- [x] Card/panel weight differentiation defines at least three weight classes with clear usage rules
- [x] Depth/elevation system defines at least five levels with semantic meaning and token combinations
- [x] 3-second read standard is defined in testable operational terms
- [ ] T07 authors confirm the hierarchy rules are implementable at the component level
- [ ] T08 authors confirm the hierarchy rules are sufficient to evaluate composition quality
- [x] All T04 outputs are documented — either as a standalone reference section or as foundational content for `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` (completed in T08)

---

## Known Risks and Pitfalls

**Risk T04-R1: Hierarchy rules that are too abstract.** Rules like "important things should look important" cannot be implemented. Every rule must be specific enough to translate to a token value, a spacing decision, or a component property.

**Risk T04-R2: Depth system that requires per-component shadow tuning.** If each component defines its own shadow values rather than drawing from the elevation token system, the depth system will fragment. Enforce the elevation token system during T07.

**Risk T04-R3: Over-engineering weight differentiation.** Three card weight classes is likely sufficient for Wave 1. Adding more weight classes increases implementation complexity without proportional visual benefit.

---

## Follow-On Consumers

- **T07:** Implements hierarchy expression per component during the polish sweep, using T04 rules as the governing standard
- **T08:** Uses the hierarchy rules, zone distinctions, and 3-second read standard as evaluation criteria for the composition audit
- **T10:** Documents the hierarchy and depth system in `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`
- **T13:** Evaluates "visual hierarchy," "anti-flatness/depth," and "scanability" dimensions of the production-readiness scorecard against T04 outputs

---

*End of WS1-T04 — Visual Hierarchy and Anti-Flatness Overhaul v1.0 (2026-03-15)*
