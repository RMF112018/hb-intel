# WS1-T09 — Accessibility and Implementation Trust

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for accessibility audit and implementation trust hardening. Visual excellence cannot come at the expense of usability or trust. Must be complete before T13 closes the workstream.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Sequencing:** Phase D (after T07 stabilizes; may proceed concurrently with T08)
**Depends On:** T07 (polished component set as the audit target); T05 (field-readability contrast and target size minimums)
**Unlocks:** T11 (accessibility automation coverage); T13 (accessibility dimension of production scorecard)

---

## Objective

Conduct a complete accessibility and implementation trust audit across all `@hbc/ui-kit` components. Ensure that every interactive component has correct keyboard behavior, ARIA semantics, focus management, and contrast compliance. Ensure that users can always understand what is primary, what is actionable, what is waiting, what changed, and what requires their attention.

---

## Why This Task Exists

Visual polish that is inaccessible is not production-ready. The blueprint emphasizes clarity, trust, and explainability; the market benchmark assumes WCAG-aware systems; and SPFx surfaces in SharePoint are subject to Microsoft's accessibility requirements for enterprise software.

More practically: enterprise construction software users include people with visual, motor, and cognitive differences. Field workers may use screen magnification. Keyboard-only navigation matters in office contexts. Focus management matters in complex overlay-heavy workflows. T09 ensures these requirements are met systematically rather than incidentally.

---

## Scope

T09 covers:

1. Keyboard audit: every interactive component must be fully operable by keyboard alone
2. ARIA audit: dialogs, menus, tables, search, tabs, live regions, and status messaging
3. Focus ring and focus order consistency across the kit
4. Contrast validation in all active themes (including field density mode per T05 requirements)
5. Reduced-motion review
6. Screen-reader validation for key flows
7. Implementation trust audit: ensuring users can always understand system state

T09 does not cover:

- Fixing business-logic-level accessibility issues in feature packages (those are Wave 1 feature team responsibilities)
- Accessibility of SPFx webpart host pages outside `@hbc/ui-kit` control
- Creating automated test coverage (that is T11; T09 identifies gaps that T11 must cover)

---

## Keyboard Audit Requirements

Every interactive component must pass the following keyboard behaviors:

| Component type | Required keyboard behavior |
|---------------|--------------------------|
| Buttons and links | Activated by Enter and/or Space; focused via Tab |
| Menus and dropdowns | Arrow key navigation; Escape closes; Home/End jump to first/last |
| Dialogs and modals | Focus trapped inside on open; Escape closes; focus returns to trigger on close |
| Tables | Tab navigates to/from table; Arrow keys navigate within; Row action triggers accessible by keyboard |
| Tabs | Arrow keys navigate between tabs; Enter/Space activates; Tab moves to tab panel content |
| Combobox / autocomplete | Arrow keys navigate suggestions; Escape closes; Enter selects |
| Date picker | Full keyboard navigation within calendar; Escape closes |
| Forms | Tab order follows visual order; no focus traps; all actions reachable by keyboard |
| Drawers / side panels | Focus moves to panel on open; Escape closes; focus returns to trigger on close |
| Search | Escape clears; Enter submits; suggestions navigable by arrow keys |

---

## ARIA Audit Requirements

Each complex interaction pattern must have correct ARIA implementation:

| Pattern | ARIA requirements |
|---------|-----------------|
| Dialogs | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to dialog title |
| Menus and dropdowns | `role="menu"`, `role="menuitem"`, `aria-expanded` on trigger, `aria-haspopup` |
| Tables | `role="table"` or native `<table>`; `scope="col"` on headers; row actions have accessible names |
| Search | `role="combobox"` for autocomplete search; `aria-live` for result count updates |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Live regions | `aria-live="polite"` for non-critical updates; `aria-live="assertive"` only for urgent alerts |
| Status messaging | `role="status"` or `role="alert"` as appropriate; message is announced on change |
| Loading states | `aria-busy="true"` during loading; accessible text communicates loading state |
| Badges and counts | Accessible name communicates value and context (not just "5") |
| Notifications / toasts | `role="alert"` or `aria-live` region; sufficient display duration for screen reader users |

---

## Focus Management Requirements

- Every interactive component must have a visible focus ring that meets 3:1 contrast ratio against adjacent colors (WCAG 2.4.11)
- Focus rings must use the kit's standardized focus style — no per-component custom focus ring that diverges from the system
- Focus order must follow the visual reading order (left-to-right, top-to-bottom in LTR layouts)
- Keyboard focus must never become trapped unintentionally (except inside dialogs, where trapping is correct)
- After closing a dialog, drawer, or popover, focus must return to the element that triggered it

---

## Contrast Validation Requirements

Contrast must be validated in both standard and field density modes:

| Context | Text contrast requirement | Interactive element contrast requirement |
|---------|--------------------------|----------------------------------------|
| Standard density, standard theme | 4.5:1 (WCAG AA) | 3:1 |
| Field density mode | 7:1 (WCAG AAA target, per T05) | 4.5:1 |
| Disabled states | 3:1 (WCAG minimum; disabled should look disabled, not broken) | — |
| Focus ring | 3:1 against adjacent colors | — |
| Status indicators | 3:1 against background (non-text) | — |

---

## Reduced-Motion Compliance

- All animations must respect `prefers-reduced-motion: reduce`
- In reduced-motion mode: transitions must be instant or near-instant; no sliding, bouncing, or scale animations
- Loading animations must use opacity fade rather than spinners when reduced-motion is active
- Review all animation-heavy components (page transitions, drawer open/close, notification entry) in reduced-motion mode

---

## Screen-Reader Validation

Validate the following key flows with a screen reader (NVDA on Windows or VoiceOver on macOS):

1. Personal Work Hub page load: page title, content zone landmarks, and primary action announced correctly
2. Table navigation: column headers and row content read in correct order; row actions accessible
3. Form completion: labels associated with inputs; validation errors announced on submit
4. Dialog open/close: dialog title announced on open; focus management correct; close confirmed
5. Status change notification: toast or live region announced in time for screen reader to capture
6. Sidebar navigation: navigation landmarks present; current page indicated; all links accessible

---

## Implementation Trust Audit

Users must always be able to answer these questions from any screen in the kit:

| Question | Implementation requirement |
|----------|--------------------------|
| What is the primary action on this page? | One clear primary call to action; not multiple equally weighted actions |
| What content requires my attention? | Urgency and status indicators are semantically distinct and scannable |
| What is currently loading or unavailable? | Loading and disabled states are clearly communicated; not silently absent |
| What just changed? | State changes are communicated via live regions, status messages, or visual confirmation |
| What went wrong? | Error states are explicit, specific, and actionable — not generic or dismissive |

---

## Governing Constraints

- **T05 contrast minimums are binding.** Field density mode contrast requirements from T05 are not optional enhancements — they are T09 compliance requirements.
- **Visual excellence does not override accessibility.** If a visual design choice (e.g., low-contrast placeholder text, subtle focus rings) fails accessibility requirements, the visual choice must change.
- **T11 owns automation, T09 owns audit findings.** T09 identifies what must be automated; T11 creates the automation. T09 must produce a findings list that T11 can act on.

---

## Acceptance Criteria

- [ ] All interactive components pass the keyboard audit requirements
- [ ] All complex interaction patterns have correct ARIA implementation
- [ ] Focus rings meet contrast requirements and are consistent across the kit
- [ ] Focus order follows visual reading order throughout
- [ ] Contrast validation passes in both standard and field density modes
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Six key flows validated with a screen reader
- [ ] Implementation trust audit confirms all five user questions are answerable on all Wave 1-critical screens
- [ ] Accessibility findings list produced for T11 (items requiring automated coverage)
- [ ] No Wave 1-critical component has an unresolved WCAG AA failure at workstream close

---

## Known Risks and Pitfalls

**Risk T09-R1: Accessibility debt from pre-workstream components.** Some Tier C and D components may have deep accessibility gaps. T09 must flag these; T07 must have addressed them before T09 reviews. If T09 finds a gap T07 should have fixed, feed it back to T07 immediately.

**Risk T09-R2: Screen-reader validation environment variability.** Screen reader + browser combinations produce different results. Test on at least two combinations (NVDA + Chrome; VoiceOver + Safari) for key flows.

**Risk T09-R3: ARIA added without testing.** ARIA attributes added without screen-reader testing can make components worse, not better. Every ARIA change must be validated with a screen reader, not just with an automated checker.

---

## Follow-On Consumers

- **T11:** Uses T09 findings list to create automated accessibility coverage in the verification overhaul
- **T13:** Evaluates "accessibility" dimension of the production-readiness scorecard against T09 findings and resolution status

---

*End of WS1-T09 — Accessibility and Implementation Trust v1.0 (2026-03-15)*
