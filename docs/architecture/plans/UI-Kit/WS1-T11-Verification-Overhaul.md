# WS1-T11 — Verification Overhaul

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for verification overhaul. Establishes automated test coverage sufficient to release `@hbc/ui-kit` and all Wave 1-critical application-layer UI with confidence. Release confidence must be driven by automated verification, not only visual inspection.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase E (after T08 and T09 complete; may proceed concurrently with T10 and T12)
**Depends On:** T07 (stable component set as the test target); T09 (accessibility findings list for automation coverage)
**Unlocks:** T13 (verification coverage dimension of production scorecard)
**Hard Requirement:** Release confidence must be driven by automated verification, not only visual inspection.

---

## Objective

Establish a standard, reliable `test` pathway for `@hbc/ui-kit` and Wave 1-critical application-layer UI components that covers unit contracts, interaction behavior, visual regression, accessibility automation, and composition smoke tests. Exit with automated coverage sufficient that a future visual regression or behavior regression in either layer cannot ship undetected.

---

## Why This Task Exists

`@hbc/ui-kit` is the visual operating layer of HB Intel. Every Wave 1 surface depends on it. A regression in a core component — a broken focus trap, a status color that fails contrast, a table that renders incorrectly at a specific breakpoint — will manifest across every consuming surface simultaneously. Without automated verification, these regressions are discovered by users, not by CI.

T11 exists to change that. The workstream cannot close with a core platform package whose release confidence relies on manual review alone.

---

## Scope

T11 covers:

1. Establishing a standard `test` pathway (test runner, configuration, commands) for `@hbc/ui-kit`
2. Unit tests for key component contracts in the kit
3. Interaction tests for complex interaction patterns — both kit and application-layer
4. Visual regression coverage for critical components, application-layer Priority 4 components, and page patterns
5. Accessibility automation for the accessibility requirements identified in T09 across all UI in scope
6. Composition smoke tests for Wave 1 layouts — covering both kit-only compositions and feature-package compositions

T11 does not cover:

- End-to-end tests requiring live backend data (feature package concern)
- Performance benchmarking
- Manual visual review processes (those are T08's domain)

---

## Test Pathway Requirements

### Standard test command

`@hbc/ui-kit` must have a runnable `pnpm test` command that:
- Executes all unit and interaction tests
- Reports results with pass/fail counts and failure details
- Is suitable for CI execution without manual intervention

### Visual regression command

A separate `pnpm test:visual` command (or equivalent) that:
- Runs visual regression comparisons against stored baselines
- Produces a diff report for any visual change
- Fails CI when visual changes are detected outside of an intentional baseline update workflow

### Accessibility automation command

Either integrated into the main test suite or as a separate command:
- Runs automated accessibility checks against all interactive components
- Reports WCAG AA violations with element-level detail

---

## Unit Test Requirements

Unit tests must cover key component contracts — the behaviors that, if broken, would indicate a functional regression:

| Component category | Required unit test coverage |
|-------------------|---------------------------|
| Tokens and theme | Token values are valid; theme switching produces expected variable assignments |
| Status system | Each status variant produces the correct semantic color token |
| Density context | DensityProvider propagates density correctly to consumers |
| Component props | Required props enforce their constraints; optional props produce correct defaults |
| Controlled components | State changes propagate correctly in controlled mode; callbacks fire on expected events |
| Validation state | Error, warning, and success states apply correct visual and ARIA attributes |

---

## Interaction Test Requirements

Interaction tests (using a testing library that simulates user events, not end-to-end browser automation) must cover:

| Component | Required interaction test coverage |
|-----------|-----------------------------------|
| Modal dialog | Opens on trigger; closes on Escape; focus trapped inside; focus returns to trigger on close |
| Drawer / side panel | Opens on trigger; closes on Escape and close button; focus managed correctly |
| Dropdown / popover | Opens on trigger; closes on Escape and outside click; keyboard navigation works |
| Combobox / autocomplete | Keyboard navigation through suggestions; selection via Enter; Escape clears |
| Table with row selection | Checkbox selects row; select-all selects visible rows; bulk action toolbar appears |
| Form with validation | Submit without required fields shows errors; field-level error messages appear |
| Tab component | Arrow keys navigate tabs; selected tab panel is visible; non-selected panels are hidden |
| Toast notification | Notification appears on trigger; auto-dismisses after timeout; dismisses on manual close |
| Search | Keyboard activation; result list navigation; selection; Escape clears |
| Contextual toolbar bulk actions | Hidden when no selection; visible with count when rows selected; action fires on trigger |

---

## Visual Regression Requirements

Visual regression testing must use a pixel-comparison or snapshot-comparison approach against stored baselines.

Coverage requirements:
- All Priority 1 components (from T07) must have visual regression baselines
- All density mode variants of Priority 1 components must have baselines
- All Priority 4 application-layer Wave 1-critical feature components (from T07) must have visual regression baselines
- All Wave 1 page pattern compositions from T08 must have baselines — including full page compositions that combine kit and application-layer components
- Before/after story baselines from T10 must be set to the "after" state

Baseline management rules:
- Baselines are updated intentionally via a documented command (not automatically)
- An unintentional visual change must cause CI to fail
- Visual changes introduced by token refinements (T03) are intentional and must update baselines in T03 scope, not silently pass

---

## Accessibility Automation Requirements

Using the T09 findings list as the prioritized coverage guide:

- Run automated WCAG AA checks on all interactive components using an axe-based checker or equivalent
- Minimum coverage: all components where T09 identified ARIA requirements (see T09 audit)
- Automation covers what is automatable (ARIA attributes, contrast ratios, focus ring visibility); it does not replace manual screen-reader testing
- Failures produce element-level diagnostic output that identifies the specific violation

---

## Composition Smoke Tests

Wave 1 layout smoke tests must prove that the major Wave 1 page patterns render correctly using only UI-kit primitives, without runtime errors or critical rendering failures:

- Personal Work Hub landing state renders without errors
- Data table with contextual toolbar renders without errors
- Form with validation state renders without errors
- Modal dialog composition renders without errors
- Page shell with sidebar renders without errors

Smoke tests must run in a test renderer environment (not a browser) and must not require backend data.

---

## Governing Constraints

- **This is a core platform package.** The verification standard for `@hbc/ui-kit` must be higher than for a feature package. Every consumer in Wave 1 depends on it; every regression has multiplied impact. Application-layer Wave 1-critical components warrant equivalent verification rigor because they appear directly in Wave 1 surfaces.
- **Automated coverage does not eliminate code review or manual testing.** It provides a regression safety net. It does not replace the judgment applied in T07, T08, and T09.
- **Test infrastructure must be maintainable.** A test suite that is fragile, slow, or difficult to update will be abandoned. Prefer targeted, stable tests over comprehensive but brittle coverage.

---

## Acceptance Criteria

- [x] `pnpm test` runs successfully and covers unit and interaction tests
- [x] `pnpm test:visual` or equivalent runs visual regression comparisons with stored baselines
- [x] Accessibility automation runs and reports WCAG AA violations
- [x] All Priority 1 components have unit test coverage for key contracts
- [x] All ten interaction patterns have interaction tests
- [x] All Priority 1 components and density variants have visual regression baselines
- [x] All Priority 4 application-layer Wave 1-critical feature components have visual regression baselines
- [x] All ten Wave 1 page pattern compositions have visual regression baselines — including compositions that combine kit and application-layer components
- [x] Five composition smoke tests pass
- [x] CI integration confirmed — test suite runs without manual intervention
- [ ] T13 author confirms verification coverage is sufficient to support the production-readiness claim

---

## Known Risks and Pitfalls

**Risk T11-R1: Visual regression flakiness.** Pixel-comparison tests are sensitive to font rendering, anti-aliasing, and timing differences across environments. Use a tolerance threshold and a consistent rendering environment (e.g., Docker container or locked browser version) to reduce noise.

**Risk T11-R2: Interaction tests over-specifying implementation details.** Tests that assert specific DOM structure rather than observable behavior become brittle when the implementation changes. Test user-observable outcomes, not internal rendering details.

**Risk T11-R3: Accessibility automation giving false confidence.** Automated checkers catch many WCAG violations but miss others (focus order, meaningful accessible names, screen reader behavior). T11 automation is a floor, not a ceiling — it does not replace T09's manual audit.

---

## Follow-On Consumers

- **T13:** Evaluates the "verification coverage" dimension of the production-readiness scorecard against T11 outputs

---

*End of WS1-T11 — Verification Overhaul v1.0 (2026-03-15)*
