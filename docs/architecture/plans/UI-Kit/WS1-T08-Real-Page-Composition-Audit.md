# WS1-T08 — Real-Page Composition Audit

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for real-page composition validation. Proves the UI kit in assembled Wave 1 screens, not in isolation. Produces the composition review, Wave 1 page patterns, and visual hierarchy and depth standards that serve as canonical references for Wave 1 teams.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase D (after T07 reaches sufficient stability; may proceed concurrently with T09)
**Depends On:** T03 (visual language); T04 (hierarchy rules and 3-second read standard); T05 (density mode and field-readability standards); T06 (data surface pattern library); T07 (polished component set)
**Unlocks:** T10 (Storybook composition stories); T13 (composition quality dimension of production scorecard)
**Hard Standard:** Any Wave 1-critical page composition must communicate hierarchy within 3 seconds of first view.

---

## Objective

Validate that `@hbc/ui-kit`, when assembled into real Wave 1 page compositions, produces interfaces that are beautiful, legible, immediately understandable, and genuinely differentiated from the construction-tech category. A polished UI kit is not proven in isolation — it is proven in assembled screens. T08 is that proof.

---

## Why This Task Exists

It is possible for every individual component in a kit to be well-designed while the pages they compose still feel flat, cluttered, or weak in hierarchy. This happens when:

- Components are designed at the atomic level without considering their role in page-level hierarchy
- Surface roles and elevation are technically correct but visually subtle
- Page zone boundaries are implied but not expressed strongly enough
- No composition review catches the emergent weakness until Wave 1 teams build real screens

T08 prevents this outcome by requiring every major Wave 1 page pattern to be composed using only UI-kit primitives and reviewed against explicit quality criteria before T13 closes the workstream.

---

## Scope

T08 covers:

1. Assembly of all major Wave 1 page pattern compositions using only `@hbc/ui-kit` primitives
2. Structured review of each composition against defined quality criteria
3. Identification and remediation of any composition-level weaknesses (feeding back to T07 for component fixes if needed)
4. Production of three mandatory reference documents

T08 does not cover:

- Business-logic implementation within page patterns (feature package concern)
- Backend data wiring for composition prototypes (static or representative data is sufficient)
- Accessibility review of assembled screens (T09 owns that audit)

---

## Wave 1 Page Pattern Inventory

The following page patterns must be assembled and reviewed:

| Pattern | Surface | Priority |
|---------|---------|---------|
| Personal Work Hub — landing state (tasks, queue, notifications) | PWA | Critical |
| Personal Work Hub — empty state (new user or no active items) | PWA | Critical |
| Personal Work Hub — busy state (many items, multiple status types) | PWA | Critical |
| Dashboard-like summary page (project health, KPIs, statuses) | PWA / SPFx | Critical |
| Work queue / task list (list/table hybrid, with filter and saved views) | PWA / SPFx | Critical |
| Project summary / detail page (overview, metrics, recent activity) | SPFx | High |
| Setup or status flow (multi-step form with progress communication) | PWA / SPFx | High |
| Data-heavy list/detail page (dense table with side panel for detail) | PWA / SPFx | High |
| Drill-in / side-panel pattern (row selection opens detail context) | PWA / SPFx | High |
| Form page (structured input, validation, section grouping) | PWA / SPFx | High |

---

## Composition Review Criteria

Each assembled composition must be reviewed against all of the following criteria:

| Criterion | Evaluation question |
|-----------|-------------------|
| **Hierarchy** | Is important information visually more prominent than supporting information? Does the T04 zone distinction system work in practice? |
| **Depth** | Does the elevation system make the surface stack legible? Do cards, panels, and overlays feel correctly placed? |
| **Readability** | Can the primary content be read comfortably? Are font sizes and contrast ratios appropriate at actual screen size? |
| **Density balance** | Does the page feel appropriately dense — neither wasteful nor overwhelming? |
| **Scanability** | Can the primary content zone communicate its essence within the 3-second read standard? |
| **Executive-grade presentation** | Would a senior executive trust this interface as a finished product? |
| **Field readiness** | In field density mode, is the composition usable on a job site? |
| **Perceived quality** | Does the page feel premium, deliberate, and differentiated from current construction-tech? |
| **Flatness / sameness** | Are all sections and zones visually distinct, or does the page feel monotonous? |
| **Shell contribution** | Does the shell (navigation, header, chrome) support the content, or does it compete with it? |

Any composition that fails three or more criteria must be remediated before T13 closes. Any composition that fails "hierarchy," "scanability," or "perceived quality" must be remediated regardless of how many other criteria it passes.

---

## Remediation Process

When a composition review identifies a weakness:

1. Determine whether the issue is at the component level (fix in T07 — regression) or the composition level (fix in composition pattern and document in T08 outputs)
2. Component-level issues must be fixed in T07 and retested in T08
3. Composition-level issues are documented as design guidance in `UI-Kit-Wave1-Page-Patterns.md` so Wave 1 teams do not repeat them
4. Systematic weaknesses that affect multiple compositions (e.g., "page headers are consistently losing to content weight") must be elevated to T04 rule updates

---

## Mandatory Outputs

### `UI-Kit-Composition-Review.md`

Location: `docs/reference/ui-kit/UI-Kit-Composition-Review.md`

A structured review record for each of the ten Wave 1 page patterns, with all ten criteria evaluated and any remediation actions documented.

### `UI-Kit-Wave1-Page-Patterns.md`

Location: `docs/reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md`

A reference guide for Wave 1 development teams documenting:
- The approved composition pattern for each major page type
- Which UI kit components are used in each zone
- Design guidance for common composition decisions (how to use side panels, when to use summary strips, how to layer filters and toolbars)
- Known pitfalls to avoid

### `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`

Location: `docs/reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`

The consolidated reference document for visual hierarchy and depth, combining T04 rule definitions with the empirical evidence from T08 composition review:
- Hierarchy rule set (from T04)
- Zone distinction system (from T04)
- Card/panel weight differentiation rules (from T04)
- Depth/elevation system (from T04)
- 3-second read standard and how to evaluate it (from T04)
- Composition examples that pass and fail the standard (from T08 review)

---

## Governing Constraints

- **No app-local visual patching.** If a composition pattern requires a visual treatment that cannot be assembled from existing kit primitives, that is a kit gap, not a composition-level override. Gap must be resolved in T07 before T08 can pass.
- **Static or representative data is sufficient.** Compositions do not need real backend data to evaluate visual quality. Representative data that reflects realistic content length, status distribution, and density is sufficient.
- **Both PWA and SPFx surfaces must be reviewed.** The Wave 1 roadmap requires balanced progress on both surfaces. T08 must include at least one composition review of each critical pattern in both surface contexts where both are relevant.

---

## Acceptance Criteria

- [ ] All ten Wave 1 page patterns are assembled using only `@hbc/ui-kit` primitives
- [ ] All ten compositions are reviewed against all ten criteria
- [ ] No composition fails the "hierarchy," "scanability," or "perceived quality" criteria at workstream close
- [ ] No composition fails three or more criteria at workstream close
- [ ] All component-level weaknesses identified in T08 review are resolved in T07
- [ ] `UI-Kit-Composition-Review.md` exists with complete review records
- [ ] `UI-Kit-Wave1-Page-Patterns.md` exists with approved patterns and design guidance
- [ ] `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` exists as a consolidated reference
- [ ] All three documents added to `current-state-map.md §2` as "Reference"

---

## Known Risks and Pitfalls

**Risk T08-R1: Composition review finding kit gaps late in the workstream.** If T08 identifies significant component-level gaps after T07 has been marked complete, T07 must be reopened. Build in early composition spot-checks during T07 to reduce this risk — do not wait until T07 fully closes.

**Risk T08-R2: Representative data not representative.** Compositions reviewed with artificially short strings and perfectly uniform data will pass quality checks that real data would fail. Use realistic content: long project names, mixed status types, varying data density, and overflow conditions.

**Risk T08-R3: SPFx composition context ignored.** SPFx surfaces impose constraints (SharePoint chrome, webpart boundaries, page layout control) that can affect composition quality in ways that pure PWA compositions do not. SPFx variants must be reviewed in their actual hosting context, not just in isolation.

---

## Follow-On Consumers

- **T10:** Uses `UI-Kit-Wave1-Page-Patterns.md` and `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` to inform Storybook composition stories and the usage guide
- **T13:** Evaluates "composition quality," "scanability," "field readiness," and "perceived quality" dimensions of the production-readiness scorecard against T08 outputs
- **Wave 1 teams:** Use `UI-Kit-Wave1-Page-Patterns.md` as the governing composition reference when building Personal Work Hub and other Wave 1 surfaces

---

*End of WS1-T08 — Real-Page Composition Audit v1.0 (2026-03-15)*
