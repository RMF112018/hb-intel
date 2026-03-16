# WS1-T05 — Adaptive Density and Field-Readability Hardening

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for adaptive density modes and field-readability hardening. Establishes the density system and field-use constraints that T07 must implement and T08 must validate.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase B (parallel with T03 and T04, begins after T01 and T02 complete)
**Depends On:** T01 (identifies field-readiness gaps per component); T02 (mold-breaker field-usability principles)
**Unlocks:** T07 component polish (touch target, spacing, and density conformance); T08 composition audit (field-readiness evaluation)
**Hard Requirement:** The UI kit must be field-capable by design, not field-tolerable by accident.

---

## Objective

Define the density mode system for `@hbc/ui-kit` and establish explicit, measurable field-readability standards. Exit with density mode token definitions, field-use design constraints, and documented standards that T07 implements and T08 validates against. Construction software still skews office-first; HB Intel must break that pattern by treating sunlight readability and touch forgiveness as first-class design constraints.

---

## Why This Task Exists

The market studies confirm that construction software is heavily criticized for field-hostile behavior: dense tables that are unreadable on job sites, touch targets too small for gloves, contrast ratios that fail in bright light, and layouts that assume a desktop in a climate-controlled office. This is one of the clearest mold-breaker opportunities available to HB Intel.

T05 exists to make field capability an architectural commitment rather than a post-hoc adjustment. Without T05, T07's component polish will be tuned for desktop and field concerns will surface as separate follow-up work after Wave 1 launches — exactly the pattern the workstream is designed to prevent.

---

## Scope

T05 covers:

1. Defining density modes for desktop, tablet, and field-first touch usage
2. Specifying token adjustments per density mode (spacing, type, target size, contrast)
3. Establishing measurable field-readability minimums (touch target size, contrast ratios, minimum font size)
4. Defining how density modes are applied (system preference detection, manual toggle, component API)
5. Documenting field interaction assumptions (gloved touch, bright light, one-handed use, imprecise tap)
6. Producing `UI-Kit-Field-Readability-Standards.md` as a standing reference

T05 does not cover:

- Implementing density mode token changes in individual components (that is T07)
- Defining the general visual language token values (that is T03)
- Field-specific component design decisions not related to density or readability (those are handled per-component in T07)

---

## Density Mode Definitions

### Desktop density (default)

The standard mode for keyboard-and-pointer users on desktop screens. Information-rich but not overwhelming. Assumes good lighting and precise pointer input.

Governing rules:
- Row height, spacing, and font size optimized for sustained reading and scanning
- Touch targets are accessible but not over-sized for pointer use
- Full information density is available without scrolling degradation

### Tablet density

Intermediate mode for tablet users, hybrid keyboard/touch input, and users on larger-screen mobile devices. Slightly increased touch targets and spacing, slightly reduced information density per visible area.

Governing rules:
- Touch target minimums apply (see field-readability minimums below)
- Spacing increases modestly to prevent accidental taps
- Font size increases are minimal — information density must not collapse

### Field-first touch density

Maximum readability and touch forgiveness mode for field workers: job site, outdoor, bright light, gloved hands, one-handed use, bumpy or moving conditions.

Governing rules:
- Touch targets meet or exceed field minimums (defined below)
- Font size and weight optimized for bright light legibility
- Row height and spacing generous enough to prevent selection errors with imprecise touch
- Non-essential information may be hidden or collapsed to maintain core legibility
- Contrast ratios elevated above standard WCAG AA to account for bright-light degradation

---

## Measurable Field-Readability Minimums

The following minimums apply in field-first touch density mode and are hard requirements, not guidelines:

| Constraint | Standard density | Field density minimum |
|-----------|-----------------|----------------------|
| Touch target size | ≥24×24px (pointer-optimized) | ≥44×44px per WCAG 2.5.5 (AAA), aiming for 48×48px |
| Body text minimum | 13px | 15px |
| Label text minimum | 11px | 13px |
| Status/badge text minimum | 11px | 12px |
| Text contrast ratio | 4.5:1 (WCAG AA) | 7:1 (WCAG AAA) or higher for outdoor conditions |
| Interactive element contrast | 3:1 against background | 4.5:1 for outdoor legibility |
| Tap spacing between adjacent targets | 8px | 16px minimum |
| Row height in tables/lists | Standard compact | 48px minimum per row in field mode |

---

## Field Interaction Assumptions

Components must be designed and tested against these field use conditions:

- **Gloved touch:** Assume imprecise tap radius of ≥10px. Targets must tolerate touches that miss center by 10px without triggering adjacent actions.
- **Bright sunlight:** Assume ambient light washes out contrast by up to 30–40%. The contrast minimums above account for this.
- **One-handed use:** Common flows must be completable one-handed. Primary actions must be reachable without two-hand grip.
- **Motion and vibration:** Assume user is in a moving vehicle or on unstable footing. Micro-interactions must not require precision gestures.
- **Intermittent focus:** Field workers are interrupted frequently. State must be preserved clearly — the interface must communicate "where am I" unambiguously after a context switch.

---

## Density Mode Application Model

Define how density modes are applied across the kit:

1. **System-level preference:** Detect `prefers-reduced-motion` (already required) and extend detection to consider viewport size and user agent as density signals.
2. **User-controlled toggle:** Provide a density toggle in the app shell that switches between desktop and field modes. This must be accessible in one tap from any page.
3. **Component API:** Components must accept a `density` prop or inherit density context from a `DensityProvider`. Individual components must not require per-instance overrides to switch density.
4. **Persistence:** Density preference must persist across sessions per user.

---

## Governing Constraints

- **T02 mold-breaker principles govern this task.** "More adaptive density," "more field-usable contrast and touch patterns," and "lower cognitive load" are explicit mold-breaker requirements. The density system must satisfy all three.
- **Information richness must be preserved.** Density modes must scale the interface without collapsing the information model. A user switching to field mode should still have access to all critical information — hidden or collapsed content must be accessible on demand, not permanently removed.
- **Field minimums are hard floors, not recommendations.** If a component cannot meet field density minimums without a redesign, it must be redesigned in T07. Failing field minimums is a no-go condition for T13.

---

## Mandatory Output

### `UI-Kit-Field-Readability-Standards.md`

Location: `docs/reference/ui-kit/UI-Kit-Field-Readability-Standards.md`

Must include:
- Density mode definitions (desktop, tablet, field-first)
- Token tables per density mode (spacing, font size, target size, contrast)
- Field interaction assumption model
- Measurable field-readability minimums as a compliance checklist
- Density mode application model (component API, provider pattern, persistence)

---

## Acceptance Criteria

- [x] Three density modes are defined (desktop, tablet, field-first) with governing rules for each
- [x] Measurable field-readability minimums are defined for all eight constraint categories
- [x] Field interaction assumptions are documented (gloved touch, bright sunlight, one-handed use, motion, intermittent focus)
- [x] Density mode application model defines component API pattern, DensityProvider approach, and persistence model
- [x] `UI-Kit-Field-Readability-Standards.md` exists at the required location and is complete
- [x] Reference document added to `current-state-map.md §2` as "Reference"
- [ ] T07 authors confirm density mode definitions and field minimums are implementable per component
- [ ] T08 authors confirm field-readability standards are sufficient to evaluate composition quality

---

## Known Risks and Pitfalls

**Risk T05-R1: Density mode fragmentation.** If density mode token overrides proliferate without a clean provider architecture, each component will require manual density wiring. Enforce the `DensityProvider` pattern from the start.

**Risk T05-R2: Field mode collapsing information density.** Teams may over-simplify field mode to "just make everything bigger." This reduces information richness without improving usability. The goal is better readability of the same information, not fewer data points.

**Risk T05-R3: Desktop mode regressing due to touch target enlargement.** Increasing touch targets for field mode must not bleed into desktop mode and create a wasteful, over-spaced default experience.

---

## Follow-On Consumers

- **T07:** Implements density mode token usage and field minimums per component during the polish sweep
- **T08:** Evaluates composition readiness in field density mode during the composition audit
- **T09:** Cross-references field minimums against accessibility contrast and target size requirements
- **T10:** Documents field-readability standards in `UI-Kit-Field-Readability-Standards.md`
- **T13:** Evaluates "field readability" and "adaptive density" dimensions of the production-readiness scorecard

---

*End of WS1-T05 — Adaptive Density and Field-Readability Hardening v1.0 (2026-03-15)*
