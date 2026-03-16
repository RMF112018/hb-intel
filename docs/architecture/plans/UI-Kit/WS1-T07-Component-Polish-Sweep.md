# WS1-T07 — Component-by-Component Polish Sweep

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for the component polish sweep. The largest implementation task in the workstream; upgrades every major component family to production quality against the standards established in T03–T06.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase C (begins after T03 and T04 complete; may proceed concurrently with T06; T05 and T06 outputs must be incorporated before the relevant component families are finalized)
**Depends On:** T01 (maturity matrix determines sequencing); T02 (mold-breaker quality bar); T03 (visual language baseline); T04 (hierarchy rules); T05 (density modes and field minimums); T06 (data surface patterns)
**Unlocks:** T08 (composition audit requires stable components); T10 (Storybook requires polished components); T11 (verification requires stable visual state)
**Special Rule:** Any component that is still minimal, stopgap, or visually underdeveloped must be upgraded or removed from the Wave 1 critical path.

---

## Objective

Perform a deep, systematic polish pass on every major component across the full HB Intel UI surface — shared primitives in `@hbc/ui-kit` and Wave 1-critical feature-specific UI components in consuming packages. Apply the visual language (T03), hierarchy system (T04), density modes (T05), and data surface patterns (T06) uniformly across both layers. Exit with a UI surface that is production-quality, visually cohesive, and capable of powering Wave 1 without downstream visual patching in either the kit or the application layer.

---

## Why This Task Exists

T03–T06 establish standards. T07 implements them across the full application UI — not only in the kit. Without a systematic sweep of both layers, the standards exist on paper but individual components retain their pre-workstream visual state regardless of which package they live in. The result is a UI surface that is governed in principle but inconsistent in practice.

T07 is the largest task in the workstream by implementation volume. It must be sequenced carefully: Wave 1-critical components first (in both kit and application layers), followed by supporting components, followed by lower-criticality surfaces. The T01 maturity matrix provides the sequencing input for both layers.

---

## Scope

T07 covers every major component family, with the following priority sequencing:

**Priority 1 — Wave 1 critical (Personal Work Hub dependencies)**
- Shell and navigation (app shell, sidebar, header, breadcrumb, user menu)
- Page shells and page headers
- Work-item, activity, and queue primitives needed for Personal Work Hub
- Badges, status chips, and notification surfaces
- Cards and summary blocks

**Priority 2 — Wave 1 high (Project Hub and shared surfaces)**
- Tables and list surfaces (using T06 pattern library)
- Forms and inputs
- Search and command surfaces
- Overlays, drawers, dialogs, and side panels

**Priority 3 — Wave 1 supporting**
- All remaining exported kit components

**Priority 4 — Application-layer Wave 1 critical (feature-specific UI)**
- Personal Work Hub composition shell and page-level layout components
- Wave 1 SPFx webpart composition shells
- Feature-specific UI components in Wave 1 packages that appear in Priority 1 or 2 page patterns and are not kit primitives

T07 covers two parallel sweeps:

**Kit sweep:** All component families exported from `@hbc/ui-kit`, prioritized by tier and Wave 1 criticality per T01.

**Application-layer sweep:** All Wave 1-critical feature-specific UI components in consuming packages (Priority 4), evaluated against the same twelve polish dimensions and brought to the same quality bar. These components remain in their feature packages — they are not being moved to the kit — but their visual quality must meet kit standards.

T07 does not cover:
- Business-logic composition or data-fetching code in feature packages
- Deciding whether a feature-local component belongs in the kit (that is T12)
- Creating new Storybook stories (that is T10, though T07 should flag story gaps)
- Accessibility auditing (that is T09, though T07 must not regress accessibility)

---

## Per-Component Polish Dimensions

For each component family, the polish sweep must address all of the following:

| Dimension | What to verify and fix |
|-----------|----------------------|
| **Visual quality** | Does the component meet the T03 visual language standard? Is it premium, restrained, and cohesive? |
| **Spacing rhythm** | Does the component's internal spacing align with the normalized spacing scale? |
| **Hierarchy expression** | Does the component correctly express its role in the T04 hierarchy and zone system? |
| **Hover / active / focus feel** | Are interactive states visually clear, consistent, and appropriately weighted? |
| **Loading / empty / error / stale** | Are all non-happy-path states designed and implemented, not just defaulted? |
| **Long-text behavior** | Does the component handle long strings gracefully (truncation, wrap, overflow)? |
| **Overflow handling** | Does the component behave correctly when its container is smaller than expected? |
| **Depth and surface treatment** | Is the component correctly placed in the T04 elevation system? |
| **Responsiveness** | Does the component adapt correctly across breakpoints? |
| **Field / touch usage** | Does the component meet T05 field density minimums in field mode? |
| **Accessibility** | No regressions from pre-workstream state; flag issues for T09 audit |
| **Production credibility** | Would a Wave 1 developer trust this component to use in a customer-facing screen? |

---

## Component Family Checklist

The sweep covers the following families. Within each family, use the T01 maturity tier to determine depth of work required:

**Shell and navigation**
- App shell (PWA and SPFx surface variants)
- Top navigation / header bar
- Left sidebar / collapsible navigation
- Breadcrumb
- User menu / profile dropdown
- Skip-navigation affordance

**Page shells and headers**
- Page header (title, subtitle, action area)
- Section header
- Empty page state
- Loading page state
- Error page state

**Cards and summary blocks**
- Standard content card (three weight classes per T04)
- Metric / KPI card
- Summary strip
- Status card
- List-item card (Personal Work Hub queue item)

**Tables and list surfaces**
- Dense analysis table (per T06 pattern)
- Responsive list/table hybrid (per T06 pattern)
- Card/list view (per T06 pattern)
- Contextual toolbar
- Filter panel and filter chips
- Saved view selector
- Row selection and bulk action toolbar
- Row action menu

**Forms and inputs**
- Text input
- Text area
- Select / dropdown
- Combobox / autocomplete
- Date picker
- Checkbox and checkbox group
- Radio and radio group
- Toggle / switch
- File input
- Form section and field group layout
- Inline validation messaging
- Form-level error summary

**Search and command surfaces**
- Global search
- Inline contextual search
- Command palette (if present)

**Overlays, drawers, dialogs, and side panels**
- Modal dialog (confirmation, form, informational)
- Side panel / drawer
- Popover
- Tooltip
- Context menu

**Badges, status chips, and notifications**
- Status badge
- Priority indicator
- Count badge / notification dot
- Toast / snack notification
- Inline alert
- Banner alert

**Work-item, activity, and queue primitives**
- Work item row (Personal Work Hub task surface)
- Activity item (feed/history entry)
- Assignment chip
- Due date indicator
- Queue group header

---

## Governing Constraints

- **T01 maturity tier governs depth — for both layers.** Tier A components (kit or app-layer) need only a verification pass. Tier B needs targeted polish. Tier C and D components must receive full redesign or replacement — they cannot be carried as-is into Wave 1 regardless of which package they live in.
- **T02 mold-breaker quality bar applies universally.** No component — kit or application-layer — should produce the anti-patterns listed in the workstream master plan (flatness, equal weight everywhere, field-hostile sizing).
- **Remove-or-harden rule.** Any kit component that cannot be brought to Tier B or better must either be removed from the public entry points or explicitly flagged as non-Wave-1-ready. Any application-layer component that cannot be brought to Tier B or better must be flagged in the T13 residual debt register with a remediation plan.

---

## Acceptance Criteria

- [x] All Priority 1 (Wave 1 critical) kit component families are Tier A or Tier B by end of T07
- [x] All Priority 2 (Wave 1 high) kit component families are Tier B or better by end of T07
- [x] All Priority 3 (Wave 1 supporting) kit components are either Tier B or explicitly flagged as out-of-Wave-1-scope
- [x] All Priority 4 (application-layer Wave 1 critical) feature-specific components are Tier B or better
- [x] All twelve per-component polish dimensions have been addressed for every component in both layers
- [x] No component remains at Tier D in the Wave 1 critical path — kit or application layer
- [x] T01 maturity matrix is updated to reflect post-T07 tier assignments for both layers
- [ ] T08 authors confirm both kit and application-layer components are stable enough to begin composition audit

---

## Known Risks and Pitfalls

**Risk T07-R1: Scope overrun.** The component family list is large. Strict priority sequencing (Priority 1 → 2 → 3) is required. If time pressure requires cuts, Priority 3 components are the first to defer — but Priority 1 and 2 components cannot be cut.

**Risk T07-R2: Visual regressions in Tier A components.** Polish work on adjacent components can produce unintended visual regressions in already-stable components. Maintain visual regression baselines throughout T07.

**Risk T07-R3: Loading/empty/error states skipped.** These states are consistently the most under-designed in enterprise kits. They are explicitly required — there is no "we'll add it later" for Wave 1-critical components.

**Risk T07-R4: Field mode not tested per component.** Each component must be validated in field density mode, not just in standard desktop mode. Field mode compliance is a T07 deliverable, not a T09 afterthought.

---

## Follow-On Consumers

- **T08:** Uses the polished component set to audit real-page composition quality
- **T09:** Audits the polished components for accessibility compliance
- **T10:** Uses the polished components as the basis for Storybook story completion and visual reference
- **T11:** Uses the stable component set as the baseline for visual regression coverage
- **T13:** Evaluates "interaction quality," "composition quality," and "Wave 1 readiness" scorecard dimensions against T07 outputs

---

*End of WS1-T07 — Component-by-Component Polish Sweep v1.0 (2026-03-15)*
