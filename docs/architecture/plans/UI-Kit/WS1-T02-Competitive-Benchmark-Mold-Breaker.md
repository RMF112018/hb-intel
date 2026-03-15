# WS1-T02 — Competitive Benchmark Matrix and Mold-Breaker Principles

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for competitive benchmarking and mold-breaker doctrine. Produces the directional authority that governs visual decision-making across T03–T08. Must be complete before T03 visual language work begins.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Sequencing:** Phase A (parallel with T01, no dependencies within the workstream)
**Depends On:** Uploaded market studies (Procore, ACC, InEight, CMiC competitive analysis)
**Unlocks:** T03 visual language direction; T04 hierarchy doctrine; T05 density/field doctrine; T06 data surface direction; T07 component quality bar
**Estimated Effort:** 1 working session

---

## Objective

Translate the market studies of leading construction-tech platforms into an actionable competitive benchmark matrix and a set of explicit mold-breaker principles that govern every visual decision in this workstream. These outputs serve as the standing directional authority — any design or implementation choice that conflicts with the mold-breaker principles requires a documented rationale.

---

## Why This Task Exists

Without a documented competitive position, this workstream risks producing a UI kit that merely meets a subjective quality bar set by internal preference. The market studies establish objective evidence that current category leaders share specific visual patterns — and specific visual weaknesses. T02 captures both so that HB Intel can deliberately target the weaknesses while matching or exceeding the strengths.

The mold-breaker principles are not aspirational. They are governing constraints. A component or composition that violates a mold-breaker principle must be revised before the workstream closes.

---

## Scope

T02 covers:

1. A structured benchmark matrix comparing HB Intel's target standard against leading construction-tech patterns across all major UI pattern categories
2. An explicit set of mold-breaker principles derived from the market studies
3. A summary of the specific weaknesses in current category leaders that HB Intel must not inherit

T02 does not cover:

- Implementing any visual changes (that is T03–T07)
- Defining specific token values, component specs, or spacing systems (that is T03)
- Auditing current HB Intel components against the benchmark (the maturity matrix in T01 serves this purpose at the component level; T08 serves it at the composition level)

---

## Benchmark Matrix Categories

The benchmark matrix must compare HB Intel's target standard against the leading construction-tech pattern for each of the following categories:

| Category | What to compare |
|----------|----------------|
| Shell layout | Navigation structure, sidebar behavior, breadcrumb patterns, surface separation |
| Headers and command bars | Page title placement, action density, command grouping, toolbar scroll behavior |
| Cards and dashboards | Card weight hierarchy, metric density, status communication, grid behavior |
| Tables and data surfaces | Column density, row height, action affordances, sort/group/filter patterns |
| Status systems | Semantic color usage, icon conventions, badge patterns, urgency communication |
| Filters and saved views | Filter placement, saved-view accessibility, active filter communication |
| Detail pages and side panels | Split-view patterns, context preservation, depth communication |
| Form layouts | Label placement, field density, validation communication, section grouping |
| Drawing and viewer surfaces | Full-canvas affordances, markup patterns, overlay controls |
| Responsive behavior | Breakpoint strategy, mobile/tablet adaptation, navigation collapse |
| Field usability | Touch target size, contrast in bright light, glove-friendly interaction |
| PWA readiness | Offline patterns, install affordances, native-feel navigation |

For each category the matrix must record:

- **Category leader pattern** (what Procore/ACC/etc. typically does)
- **Category leader strength** (what users praise)
- **Category leader weakness** (what users criticize per market studies)
- **HB Intel target** (what the kit must achieve or exceed)
- **HB Intel mold-break** (where HB Intel must specifically differ and why)

---

## Mold-Breaker Principles

The mold-breaker principles document must explicitly define HB Intel's points of deliberate differentiation from the category. Required principles to define:

1. **Lower cognitive load than the category** — what this means for shell design, information density, and progressive disclosure
2. **Stronger first-glance hierarchy** — what this means for type scale, weight contrast, and surface treatment
3. **Less shell fatigue** — how navigation and persistent chrome must behave differently
4. **Less reliance on horizontal scrolling** — what adaptive column behavior must look like
5. **More adaptive density** — how the kit must scale across desktop, tablet, and field contexts
6. **More deliberate depth** — how elevation and surface layering must communicate structure
7. **More field-usable contrast and touch patterns** — specific minimums for target size, contrast ratio, and spacing under field conditions
8. **No visual version-boundary seams** — how the kit must enforce visual consistency across newer and older surfaces

Each principle must include: the motivation (from market study evidence), the positive requirement (what the kit must do), and the anti-pattern (what the kit must avoid).

---

## Mandatory Outputs

### `UI-Kit-Competitive-Benchmark-Matrix.md`

Location: `docs/reference/ui-kit/UI-Kit-Competitive-Benchmark-Matrix.md`

A structured matrix table covering all 12 UI pattern categories above. Must include a summary section identifying the five highest-leverage opportunities — the category weaknesses where HB Intel differentiation would have the greatest user impact.

### `UI-Kit-Mold-Breaker-Principles.md`

Location: `docs/reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md`

The full set of mold-breaker principles, each with motivation, positive requirement, and anti-pattern. This document must be referenced explicitly in T03, T04, T05, T06, and T07 as the governing visual standard.

---

## Governing Constraints

- **Market study grounding:** Every mold-breaker principle must be traceable to specific evidence from the uploaded market studies. Principles that are merely aesthetic preferences without market evidence should be marked as HB Intel judgment calls, not mold-breaker mandates.
- **Measurability:** At least five mold-breaker principles must be expressed in terms that can be validated (e.g., "touch targets must be ≥44×44px in field density mode," not merely "touch targets must be large enough").
- **No aspirational inflation:** Principles should reflect what the kit can genuinely achieve in Wave 0. Principles that describe Wave 2+ ambitions should be labeled as future direction, not Wave 0 requirements.

---

## Acceptance Criteria

- [ ] Benchmark matrix covers all 12 UI pattern categories with category leader pattern, strength, weakness, HB Intel target, and HB Intel mold-break recorded for each
- [ ] Five highest-leverage differentiation opportunities are called out in the matrix summary
- [ ] Mold-breaker principles document defines all 8 required principles with motivation, positive requirement, and anti-pattern
- [ ] At least 5 principles are expressed in verifiable terms
- [ ] `UI-Kit-Competitive-Benchmark-Matrix.md` exists at the required location
- [ ] `UI-Kit-Mold-Breaker-Principles.md` exists at the required location
- [ ] Both documents are added to `current-state-map.md §2` as "Reference"
- [ ] T03 and T04 authors confirm the mold-breaker principles are sufficient directional authority to begin work

---

## Known Risks and Pitfalls

**Risk T02-R1: Principles too vague to govern decisions.** Mold-breaker principles expressed as "better hierarchy" or "cleaner design" cannot be applied consistently. Each principle must have a testable form.

**Risk T02-R2: Benchmark categories missing construction-specific patterns.** The matrix categories above are a starting set. Review of the actual market studies may surface additional category-specific patterns (e.g., drawing markup conventions, RFI threading UX) that belong in the matrix.

**Risk T02-R3: Treating category weaknesses as automatic wins.** Identifying a competitor weakness does not automatically mean HB Intel has solved it. The mold-breaker principles must describe the positive requirement, not merely assert that we will avoid the problem.

---

## Follow-On Consumers

- **T03:** Uses the benchmark matrix and mold-breaker principles as the directional authority for visual language refinement decisions
- **T04:** Uses the mold-breaker principles to define hierarchy rules that specifically address category flatness and cognitive load weaknesses
- **T05:** Uses the field-usability and adaptive density sections to set measurable density mode requirements
- **T06:** Uses the tables/data surface and horizontal-scroll mold-breaker principles to govern data surface patterns
- **T07:** References mold-breaker principles as the governing quality bar for each component's polish pass
- **T13:** References mold-breaker principles in the production-readiness scorecard's "mold-breaker differentiation" dimension

---

*End of WS1-T02 — Competitive Benchmark Matrix and Mold-Breaker Principles v1.0 (2026-03-15)*
