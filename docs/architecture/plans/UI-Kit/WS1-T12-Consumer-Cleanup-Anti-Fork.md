# WS1-T12 — Application-Wide UI Standards Enforcement

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for application-wide UI standards enforcement. Ensures that the visual quality standard established in T03–T07 governs all UI components across the entire HB Intel application — not only those within `@hbc/ui-kit`. Must complete before T13 issues the production-readiness scorecard.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase E (after T07 and T09 complete; may proceed concurrently with T11 and T10)
**Depends On:** T01 (consumer map and ownership gap flags); T07 (polished kit and application-layer components as the standard reference); T09 (accessibility findings for non-kit components)
**Unlocks:** T13 (application-wide standards conformance dimension of the production scorecard)

---

## Objective

Confirm that every UI component appearing in the HB Intel application — in `@hbc/ui-kit` or in any feature package — meets the visual quality, accessibility, and ownership standards established by this workstream. Resolve or formally flag all deviations. Establish post-workstream contribution governance to prevent standards drift.

---

## Why This Task Exists

T03–T09 establish the visual and accessibility standard and apply it to the kit layer. But HB Intel's UI is not delivered entirely through `@hbc/ui-kit`. Feature packages own composition shells, page-level layouts, and feature-specific presentational components that appear directly in Wave 1 surfaces. If these components do not meet the same standard, the overall application experience remains fragmented — visually inconsistent, accessibility-incomplete, and not production-grade — even after the kit has been polished.

T12 exists to close that gap. It does three things:

1. **Part 1 — Visual Standards Conformance Audit:** Audits every Wave 1-critical feature-specific UI component against the full workstream standard and resolves violations.
2. **Part 2 — Kit Ownership Enforcement:** Resolves kit ownership gaps — feature-local duplicates of kit primitives — and ensures `@hbc/ui-kit` entry points remain intentional and lean.
3. **Part 3 — Contribution Governance:** Establishes the rules that prevent standards drift after the workstream closes.

---

## Scope

T12 covers:

1. Visual standards conformance audit of all Wave 1-critical feature-specific UI components (from T01 inventory)
2. Resolution of flagged kit ownership gaps (feature-local components that duplicate kit primitives)
3. Audit and cleanup of `@hbc/ui-kit` stale or accidental exports
4. Creation and documentation of post-workstream contribution governance rules

T12 does not cover:

- Re-polishing components that were adequately addressed in T07 (if T07 left a component Tier B or better, T12 does not re-audit it)
- Feature package business logic or data concerns
- Non-Wave-1 packages (may be noted but are not required to be fully resolved)

---

## Part 1 — Visual Standards Conformance Audit

### Conformance dimensions

For every Wave 1-critical feature-specific UI component identified in T01's application-layer inventory, assess and resolve:

| Dimension | Conformance requirement |
|-----------|------------------------|
| **Visual hierarchy** | Component contributes correctly to the composition's 3-second read. Primary content is immediately scannable. No visual noise at the wrong weight. |
| **Anti-flatness** | Component uses appropriate surface elevation, border treatment, or hierarchy expression. Not a flat grey box in a flat grey context. |
| **Density compliance** | Component responds correctly to the DensityProvider context. Spacing, type size, and touch targets adjust to desktop, tablet, and field density modes. |
| **Field readability** | In field density mode: touch targets ≥ 44×44px, text ≥ 14px, contrast ≥ 7:1 for critical text, ≥ 4.5:1 for secondary. |
| **Status and state expressiveness** | Loading, empty, error, and success states are visually distinct, semantically explicit, and styled with kit status tokens — not ad hoc colors. |
| **Typography consistency** | All type sizes, weights, and line heights are drawn from the kit's type scale. No ad hoc font-size or font-weight values. |
| **Color and token compliance** | All color values reference kit design tokens. No hardcoded color values. |

### Resolution rule

For each conformance violation found:

- If the violation is a polish gap (spacing, token, type scale): resolve it in T12 or feed it back to T07.
- If the violation is an ownership gap (feature-local duplicate of a kit primitive): resolve via Part 2.
- If the violation cannot be resolved before workstream close: log it in the `UI-Kit-Application-Standards-Conformance-Report.md` as a known exception with a resolution plan and owner.

No Wave 1-critical component may remain at Tier C or D at workstream close without a documented exception and owner.

---

## Part 2 — Kit Ownership Enforcement

### Identifying ownership gaps

Using T01's flagged ownership gaps (feature-local components that appear to duplicate kit primitives), apply the following decision rule:

| Scenario | Action |
|----------|--------|
| Feature-local component is functionally identical to a kit primitive and adds no feature-specific behavior | Migrate feature usage to the kit primitive; remove the local duplicate |
| Feature-local component extends a kit primitive with feature-specific behavior | Evaluate: if the extension is reusable across features, promote it to the kit; if truly feature-local, document the boundary and leave it in the feature package |
| Feature-local component is unique to the feature context and has no kit analog | Leave in feature package; document it as intentionally feature-local in T12 output |

### Kit entry-point hygiene

Audit `@hbc/ui-kit`'s public entry points for:

- Stale exports (components no longer actively consumed by any package): flag for removal or explicit retention decision
- Accidental exports (implementation files exposed through re-export chains): remove from public surface
- Undocumented exports (components with no Storybook story and no README entry): flag for T10 coverage or removal

---

## Part 3 — Contribution Governance

### Post-workstream contribution rules

Establish and document the following governance rules in `@hbc/ui-kit`'s README and in a developer-facing reference document:

1. **New reusable UI primitives belong in `@hbc/ui-kit`.** Any component intended for use in more than one feature package must be proposed as a kit addition, not created as a local duplicate in each feature package.

2. **Visual standards apply to all application UI.** Every new feature-specific UI component — regardless of package — must meet the density compliance, field readability, accessibility, and token compliance standards established by this workstream.

3. **Kit additions require review.** New kit components must include: Storybook story, accessibility review, density compliance, token compliance, and a README entry before merge.

4. **Feature packages do not own reusable primitives.** When a feature-local component becomes a candidate for kit promotion (used in two or more features, or clearly reusable), it must be promoted via a kit PR, not copied across feature packages.

5. **No hardcoded visual values.** No feature-specific UI component may use hardcoded color values, font sizes, or spacing values. All visual values must reference kit design tokens.

6. **Accessibility is not optional in any layer.** New components — kit or feature-local — must meet the WCAG AA keyboard and ARIA requirements established in T09 before merge.

---

## Mandatory Outputs

### `UI-Kit-Application-Standards-Conformance-Report.md`

Location: `docs/reference/ui-kit/UI-Kit-Application-Standards-Conformance-Report.md`

A structured report covering:

- Summary counts: total Wave 1-critical feature-specific components audited; count by conformance tier after remediation; count of exceptions
- Per-component conformance results: package, component name, dimensions assessed, final tier, exception flag if applicable
- Resolved ownership gaps: kit ownership gaps resolved (migrated to kit or documented as intentionally local)
- Kit entry-point changes: stale or accidental exports removed; undocumented exports flagged
- Contribution governance: confirmation that governance rules are documented in `@hbc/ui-kit` README and developer reference

---

## Governing Constraints

- **Both layers are subject to the same standard.** A feature-local component at Tier C or D is a workstream defect just as a kit component at Tier C or D is.
- **Governance documentation is a T12 deliverable.** The workstream is not closed until the post-workstream contribution rules are written down and linked from the kit README.
- **Exceptions must be owned.** Any component that cannot meet Tier B before workstream close must be logged as an exception with a named owner and a resolution timeline. Silent exceptions are not acceptable.

---

## Acceptance Criteria

- [ ] All Wave 1-critical feature-specific UI components assessed against the seven conformance dimensions
- [ ] All conformance violations either resolved or logged as named exceptions with owners
- [ ] No Wave 1-critical feature-specific component remains at Tier C or D without a logged exception
- [ ] Kit ownership gaps from T01 resolved: either migrated to kit, documented as intentionally local, or flagged for post-workstream
- [ ] `@hbc/ui-kit` entry points audited; stale and accidental exports removed or formally retained
- [ ] `UI-Kit-Application-Standards-Conformance-Report.md` exists with complete per-component results
- [ ] Post-workstream contribution governance rules documented in `@hbc/ui-kit` README and developer reference
- [ ] T13 author confirms T12 output is sufficient to assess the "application-wide standards conformance" scorecard dimension

---

## Known Risks and Pitfalls

**Risk T12-R1: Scope expansion during conformance audit.** The conformance audit may uncover more violations than T01 anticipated. Prioritize Wave 1-critical components first; log lower-priority violations as post-workstream items rather than expanding T12's scope indefinitely.

**Risk T12-R2: Ownership migration breaking feature packages.** Migrating a feature-local duplicate to the kit requires updating all import paths in feature packages. Ensure migration includes a coordinated update across all affected packages before removing the local copy.

**Risk T12-R3: Governance rules ignored post-workstream.** Rules documented in README do not enforce themselves. Consider adding a lint rule or PR checklist item to the `@hbc/ui-kit` contribution workflow to make governance active rather than advisory.

---

## Follow-On Consumers

- **T13:** Evaluates the "application-wide standards conformance" and "kit ownership hygiene" dimensions of the production-readiness scorecard against T12 outputs

---

*End of WS1-T12 — Application-Wide UI Standards Enforcement v1.1 (2026-03-16)*
