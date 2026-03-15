# WS1-T10 — Storybook and Visual Reference Hardening

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for Storybook completion and visual reference documentation. Turns Storybook into a release-grade visual reference and produces the developer-facing documentation suite that Wave 1 teams depend on.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase E (after T08 and T09 complete; may proceed concurrently with T11 and T12)
**Depends On:** T07 (polished components); T08 (composition patterns and page pattern library); T09 (accessibility findings resolved)
**Unlocks:** T13 (documentation completeness dimension of production scorecard)

---

## Objective

Complete Storybook into a release-grade visual reference and composition library. Produce the developer documentation suite that enables Wave 1 teams to use `@hbc/ui-kit` correctly and confidently without reinventing composition decisions. Exit with four mandatory output documents and a complete Storybook baseline.

---

## Why This Task Exists

A polished component library with no documentation is a black box. Wave 1 developers cannot use the kit effectively if they must read source code to understand how to compose components, what states to account for, or how the density and hierarchy systems apply to their specific surface. Poor documentation leads to the exact outcomes this workstream is trying to prevent: app-local visual patching, inconsistent compositions, and missed states.

Storybook serves a dual role: it is both the visual reference for reviewers and the living documentation for developers. T10 makes it fit for both purposes.

---

## Scope

T10 covers:

1. Completing Storybook story coverage for all components (with production-realistic stories, not just isolated demos)
2. Adding stories for critical states, density variants, and composition patterns
3. Documenting the visual language guide
4. Documenting the usage and composition guide for Wave 1 teams
5. Documenting field-readability standards (using T05 outputs as source)
6. Producing before/after stories where major refinements occurred in T07

T10 does not cover:

- Component implementation changes (that is T07)
- Accessibility automation (that is T11)
- Business-logic documentation for feature packages

---

## Storybook Story Requirements

### Coverage requirements

Every exported component must have at minimum:

- Default story showing the standard usage at standard density
- All named variants and configurations
- All major states: default, hover, focus, active, disabled, loading, empty, error, success
- Long-text and overflow handling story
- Responsive story (if applicable)

### Required production-realistic stories

Stories must not be limited to isolated, minimally-configured demos. Each Wave 1-critical component family must have at least one production-realistic story showing the component in context with realistic data and density:

- Shell and navigation: full-shell story with sidebar open and collapsed, realistic navigation items, user profile populated
- Work queue / task list: populated queue with mixed status types, realistic project names, date labels, and assignment chips
- Data table: populated table with 15+ rows, mixed status values, active sort indicator, contextual toolbar with active filter
- Personal Work Hub landing: complete landing state with task list, notification list, and summary strip
- Project summary: complete project detail with KPI strip, status indicators, and activity feed

### Density variant stories

For every component that has density mode behavior, add stories for:

- Standard desktop density
- Tablet density
- Field-first touch density

These stories must show the component at actual size (not scaled down) so reviewers can evaluate touch target adequacy.

### Composition stories

Add composition stories for all ten Wave 1 page patterns from T08, showing:

- The full page composition using only UI-kit primitives
- The hierarchy zones labeled (for developer reference)
- The field density variant of the most important compositions

### Before/after stories

For components where T07 produced significant visual improvement (Tier C → B or Tier D → B), add before/after stories. These serve two purposes: they demonstrate the improvement for stakeholder review and they establish a record of intentional visual change for visual regression purposes.

---

## Mandatory Output Documents

### `UI-Kit-Usage-and-Composition-Guide.md`

Location: `docs/reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md`

A developer-facing guide for Wave 1 teams covering:
- How to install and import from `@hbc/ui-kit`
- The DensityProvider pattern and how to apply density modes
- How to compose the major Wave 1 page patterns using the kit
- When to use each adaptive data surface type (table vs. list/table hybrid vs. card view)
- How to use the zone system (page header, command area, content area, etc.) in practice
- Common composition mistakes and how to avoid them
- How to contribute a new reusable component back to the kit

### `UI-Kit-Visual-Language-Guide.md`

Location: `docs/reference/ui-kit/UI-Kit-Visual-Language-Guide.md`

A reference guide documenting the design decisions behind the visual language, for designers and developers who need to extend the kit or make visual decisions consistently:
- Color system: brand palette, semantic colors, status palette, interactive state colors
- Shape language: radius scale and intent model per component category
- Surface roles: all six surface types with token combinations
- Typography scale: size, weight, line height, and use cases for each level
- Spacing scale: scale values and application rules
- Motion patterns: what animates, timing conventions, reduced-motion equivalents
- Elevation/depth system: all levels with semantic meaning and usage

### `UI-Kit-Field-Readability-Standards.md`

Location: `docs/reference/ui-kit/UI-Kit-Field-Readability-Standards.md`

(This document is defined in T05; T10 is responsible for ensuring it is complete, accurate post-T07/T09, and properly cross-referenced from Storybook and the usage guide.)

### `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`

Location: `docs/reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`

(This document is defined in T08; T10 is responsible for ensuring it is complete and linked from Storybook.)

---

## Governing Constraints

- **Stories must be maintained with components.** T10 must document the expectation that new stories must be added when new components or states are introduced. This must be captured in the contribution rules in `UI-Kit-Usage-and-Composition-Guide.md`.
- **Production-realistic stories are required.** A Storybook that only shows components in isolation with minimal data does not serve the review or documentation purpose. Realistic data must be used.
- **Before/after stories are intentional communication.** They communicate to stakeholders what improved and why. They are not optional for components where significant visual change occurred.

---

## Acceptance Criteria

- [ ] All exported components have complete Storybook story coverage (default, variants, all states)
- [ ] All Wave 1-critical component families have at least one production-realistic story
- [ ] All components with density mode behavior have stories for all three density modes
- [ ] All ten Wave 1 page patterns have composition stories in Storybook
- [ ] Before/after stories exist for all components with significant T07 visual improvement
- [ ] `UI-Kit-Usage-and-Composition-Guide.md` exists and covers all six required topics
- [ ] `UI-Kit-Visual-Language-Guide.md` exists and covers all seven design system topics
- [ ] `UI-Kit-Field-Readability-Standards.md` is complete and accurate post-T07/T09
- [ ] `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` is complete and accurate
- [ ] All four documents added to `current-state-map.md §2` as "Reference" (or confirmed already added by T05/T08)
- [ ] T13 author confirms documentation is sufficient to close the workstream

---

## Known Risks and Pitfalls

**Risk T10-R1: Story coverage treated as checkbox exercise.** Stories added purely to satisfy coverage requirements without production-realistic content defeat the documentation purpose. Reviewers of stories should be able to evaluate component quality at production fidelity.

**Risk T10-R2: Visual language guide becomes stale immediately.** The guide must be structured for maintainability — reference token names rather than hardcoded values, and include instructions for keeping the guide current when tokens change.

**Risk T10-R3: Composition stories not built.** Composition stories require assembling multiple components, which is more effort than isolated component stories. They must not be deferred — they are required for T13 to confirm composition quality.

---

## Follow-On Consumers

- **T13:** Evaluates Storybook completeness and documentation quality as part of the production-readiness scorecard
- **Wave 1 teams:** Use `UI-Kit-Usage-and-Composition-Guide.md` and `UI-Kit-Wave1-Page-Patterns.md` (from T08) as the primary references when building Personal Work Hub and other Wave 1 surfaces

---

*End of WS1-T10 — Storybook and Visual Reference Hardening v1.0 (2026-03-15)*
