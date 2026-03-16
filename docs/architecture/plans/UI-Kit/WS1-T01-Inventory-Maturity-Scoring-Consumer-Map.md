# WS1-T01 — UI Kit Inventory, Maturity Scoring, and Consumer Map

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for UI kit inventory and maturity assessment. Must be completed before any T03–T07 implementation begins; outputs govern prioritization across all subsequent tasks.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase A (parallel with T02, no dependencies within the workstream)
**Depends On:** None
**Unlocks:** T02–T13 prioritization; T07 component selection order; T12 consumer audit scope
**Estimated Effort:** 1–2 working sessions

---

## Objective

Produce a complete, accurate inventory of every UI component in the HB Intel application — both the shared surfaces exported from `@hbc/ui-kit` and the Wave 1-critical feature-specific UI components in consuming packages — classify each by production maturity, map each to its current context and consumers, and identify the gaps and risks that all subsequent tasks must address. This is the diagnostic baseline for the entire workstream.

---

## Why This Task Exists

Workstream I cannot be executed blindly with equal effort applied everywhere. Some components are production-ready; others are placeholder-grade. Some are heavily consumed by Wave 1 surfaces; others have no consumers yet. The inventory must cover both layers: the kit's shared exports and the feature-level UI components that will appear in Wave 1 compositions. Without a structured inventory of both layers:

- T07 (component polish) cannot sequence its work against real Wave 1 criticality — in either layer
- T08 (composition audit) cannot identify which page patterns are most at risk
- T11 (verification overhaul) cannot prioritize coverage against impact across the full application surface
- T12 (application-wide standards enforcement) cannot scope its audit
- T13 (production scorecard) has no baseline to measure against

T01 produces the facts that make the rest of the workstream purposeful rather than exhaustive.

---

## Scope

T01 covers two parallel inventories:

**Kit inventory:**
1. Enumeration of every exported component, primitive, token group, and composition utility from `@hbc/ui-kit`'s public entry points
2. Classification of each into a maturity tier (A–D, defined below) against the workstream's full visual standard
3. Mapping of each to its current consumers across Wave 1-relevant apps and packages

**Application-layer inventory:**
4. Enumeration of Wave 1-critical feature-specific UI components in PWA and SPFx feature packages (composition shells, page-level layouts, feature-local UI components that appear in the Wave 1 surface area)
5. Classification of each feature-level component into the same maturity tier system
6. Recording of Wave 1 criticality, visual maturity, hierarchy strength, field-readiness, accessibility status, testing status, documentation status, and composition quality — for both kit and app-layer components

**Cross-cutting:**
7. Identification of any feature-local component that is actually a duplicated kit primitive (ownership gap, not a quality concern — flagged for T12)
8. Identification of all components on the Wave 1 critical path that are not yet Tier A, across both layers

T01 does not cover:

- Fixing or improving any component (that is T03–T07)
- Resolving ownership gaps and anti-fork violations (that is T12)
- Creating Storybook stories (that is T10)

---

## Maturity Tier Definitions

| Tier | Label | Meaning |
|------|-------|---------|
| A | Production-ready | Visually polished, accessible, tested, documented, field-capable, and proven in real compositions. No known quality gaps. |
| B | Strong but needs polish | Functionally solid and visually close, but has identified gaps in polish, spacing rhythm, hierarchy expression, field readiness, or documentation. Addressable in T07. |
| C | Functional but incomplete | Works correctly but visually immature, underdocumented, undertested, or missing key states (empty, error, loading, overflow). Requires significant work in T07. |
| D | Placeholder / minimal / replace-or-harden | Minimal implementation that does not meet production quality. Must be upgraded to meet Wave 1 needs or removed from the critical path. |

---

## Required Classification Dimensions

For every exported component or surface, record:

| Dimension | What to capture |
|-----------|----------------|
| **Maturity tier** | A / B / C / D per definitions above |
| **Current consumers** | Which apps and packages import this component |
| **Wave 1 criticality** | Critical / High / Medium / Low — based on whether Personal Work Hub, Project Hub, or other Wave 1 surfaces depend on it |
| **Visual maturity** | Subjective rating: Premium / Acceptable / Weak / Placeholder |
| **Hierarchy strength** | Does the component contribute correctly to visual hierarchy in compositions? Strong / Adequate / Weak |
| **Field-readiness** | Is it usable in bright light, imprecise touch, and gloved conditions? Ready / Partial / Not ready |
| **Accessibility status** | Keyboard, ARIA, contrast: Pass / Partial / Unknown / Fail |
| **Theme readiness** | Works correctly in all active themes: Yes / Partial / No |
| **Testing status** | Has unit, interaction, or visual regression tests: Yes / Partial / None |
| **Documentation status** | Has Storybook stories and/or written usage guidance: Yes / Partial / None |
| **Composition quality** | When used in real screens, does it contribute to or detract from the overall composition? Elevates / Neutral / Weakens |

---

## Mandatory Outputs

### `UI-Kit-Component-Maturity-Matrix.md`

Location: `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md`

A structured table covering every surface in scope — both kit exports and Wave 1-critical application-layer components — with all classification dimensions completed. Must include a summary section listing:

- Total component count by tier, split into kit layer and application layer
- Count of Wave 1-critical components by tier (both layers)
- Highest-risk components (Wave 1-critical and Tier C or D) across both layers
- Components with failing or unknown accessibility status
- Components with no testing coverage
- Application-layer components flagged as possible kit ownership gaps (for T12)

### `UI-Kit-Wave1-Consumer-Map.md`

Location: `docs/reference/ui-kit/UI-Kit-Wave1-Consumer-Map.md`

A map from each Wave 1-relevant app or package to the UI kit components it consumes and the feature-specific UI components it owns. Must include:

- Consuming app/package name
- List of `@hbc/ui-kit` components it uses
- List of significant feature-specific UI components it owns (composition shells, page layouts, feature-local presentational components)
- Whether any kit component in its dependency set is Tier C or D
- Whether any feature-local component is a possible duplicated kit primitive (surface only — detail is T12's job)
- Whether any feature-local component fails the workstream's visual standard (surface only — detail is T07/T12)

---

## Governing Constraints

- **Both layers are required.** The inventory is incomplete without both the kit-level and application-layer assessments. T07 and T12 cannot scope their work from a kit-only inventory.
- **The same maturity tiers apply to both layers.** A feature-specific component that is Tier D is subject to the same obligation as a Tier D kit component: upgrade or remove from the Wave 1 critical path.
- **Package boundary for kit inventory:** Only `@hbc/ui-kit`'s public exports are in scope for the kit layer. Internal implementation files are not classified individually unless they surface a quality concern.
- **Scope boundary for application-layer inventory:** Only Wave 1-critical feature packages are in scope. Lower-criticality packages may be noted but do not require full classification.
- **Honesty standard:** Tier A is reserved for components that genuinely meet the full production standard described in the workstream. Do not classify optimistically. An over-optimistic maturity matrix wastes T07 effort and produces a false T13 baseline.
- **Wave 1 criticality is not effort-minimization:** Classifying a component as "Low" criticality does not exempt it from T07 polish. It sequences it later.

---

## Acceptance Criteria

- [x] Every exported component and entry point from `@hbc/ui-kit` is enumerated
- [x] Every Wave 1-critical feature-specific UI component in consuming packages is enumerated
- [x] Every component in both layers is assigned a maturity tier (A–D) with all classification dimensions completed
- [x] `UI-Kit-Component-Maturity-Matrix.md` exists with a complete component table covering both kit and application-layer surfaces, and a summary section
- [x] `UI-Kit-Wave1-Consumer-Map.md` exists with a complete consumer-to-component mapping for all Wave 1-relevant packages, covering both kit imports and feature-local component ownership
- [x] Highest-risk components (Wave 1-critical, Tier C or D) are explicitly called out across both layers
- [x] Application-layer components flagged as possible kit ownership gaps are listed separately
- [x] Both reference documents are added to `current-state-map.md §2` as "Reference"
- [x] T02–T07 and T12 leads can use this output to prioritize work without additional discovery across both layers

---

## Known Risks and Pitfalls

**Risk T01-R1: Over-optimistic tier assignment.** There is natural pressure to classify components charitably. Resist this. A Tier B component that should be Tier C will receive insufficient attention in T07 and will produce a weak T13 baseline.

**Risk T01-R2: Incomplete consumer discovery.** Some consumers may import from `@hbc/ui-kit` through indirect re-exports or via package aliases. The consumer map must reflect actual import paths, not assumed ones.

**Risk T01-R3: Stale exports missed.** `@hbc/ui-kit` may export components that are no longer actively consumed. These should be flagged for potential removal or demotion in T12, not omitted from the matrix.

---

## Follow-On Consumers

- **T02:** Uses the maturity matrix to ground the competitive benchmark comparison in real kit gaps
- **T07:** Uses the maturity matrix and consumer map to sequence the component polish sweep by Wave 1 criticality
- **T08:** Uses the consumer map to identify which page compositions are most at risk
- **T11:** Uses the matrix to prioritize test coverage by impact
- **T12:** Uses the consumer map and the flagged ownership gaps to scope both the anti-fork audit and the broader application-wide standards conformance audit
- **T13:** Uses the matrix as the before-state baseline for the production-readiness scorecard

---

*End of WS1-T01 — UI Kit Inventory, Maturity Scoring, and Consumer Map v1.1 (2026-03-16)*
