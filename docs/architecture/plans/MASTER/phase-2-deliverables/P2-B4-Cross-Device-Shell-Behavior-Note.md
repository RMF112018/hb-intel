# P2-B4: Cross-Device Shell Behavior Note

| Field | Value |
|---|---|
| **Doc ID** | P2-B4 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Note |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §5, §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [P2-B3](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md); [P2-D2](P2-D2-Adaptive-Layout-and-Zone-Governance-Note.md); `@hbc/ui-kit`; `@hbc/session-state` |

---

## Note Statement

The Personal Work Hub and PWA shell must remain stable and credible on desktop and tablet devices.

This note governs **cross-device continuity guarantees** for Phase 2. It locks what must remain behaviorally consistent across supported device classes and what adaptive shell behavior is allowed as viewport width changes. It does **not** lock exact tablet component choices, exact panel treatments, or exact navigation primitives; those remain implementation-governed by shared responsive infrastructure and adaptive layout work.

Phase 2 explicitly prioritizes **desktop and tablet credibility**. Broad mobile-first workflow design remains out of scope.

---

## Note Scope

### This note governs

- Device-category scope for Phase 2
- Cross-device continuity requirements for routing, state, trust, and offline-safe behavior
- Allowed adaptive shell behavior as viewport width changes
- PWA runtime-mode invariants across browser and installed experiences
- Acceptance evidence required for the cross-device gate

### This note does NOT govern

- Exact tablet component selections such as bottom navigation, bottom sheets, or specific panel choreography
- Mobile-first workflow design or field-specialized interface design
- Responsive implementation details already owned by `@hbc/ui-kit` and adaptive layout implementation work
- Device-specific business logic branches
- New entitlement rules for team/direct-report surfaces

---

## Definitions

| Term | Meaning |
|---|---|
| **Device category** | A viewport-classification used for Phase 2 planning and acceptance: Desktop, Tablet, or Mobile |
| **Adaptive shell behavior** | Viewport-driven presentation changes that preserve the same routes, data, permissions, and continuity contracts |
| **Cross-device continuity** | The requirement that supported devices use the same behavioral contracts even when layout adapts |
| **Viewport stability** | The guarantee that the shell remains usable, state-preserving, and trustworthy across supported desktop and tablet widths |
| **Installed mode** | Running the PWA through the platform’s installed app container or standalone display mode |
| **Browser mode** | Running the PWA through a normal browser tab/window |

---

## 1. Device Category Definitions

Phase 2 uses the canonical breakpoint system owned by `@hbc/ui-kit`. This note does **not** re-declare or fork that breakpoint source of truth.

| Category | Planning Range | Phase 2 Status |
|---|---|---|
| **Desktop** | ≥ 1024px | Fully supported — primary design and acceptance target |
| **Tablet** | 768–1023px | Fully supported — adaptive shell behavior required; continuity must remain intact |
| **Mobile** | ≤ 767px | Receives responsive treatment only; no dedicated Phase 2 optimization commitment |

### Breakpoint Governance Rules

- Canonical breakpoint constants and responsive primitives remain owned by `@hbc/ui-kit`.
- P2-B4 may define **behavioral expectations by device class**, but must not become a duplicate breakpoint spec.
- If implementation breakpoints evolve inside shared UI infrastructure, this note remains valid so long as the supported device classes and continuity guarantees remain satisfied.

---

## 2. Cross-Device Capability Invariants

The following behaviors are invariant across supported desktop and tablet experiences.

| Behavior | Required Invariant |
|---|---|
| **Landing precedence** | Same root-routing and landing-precedence contract on all supported devices |
| **Role-based landing** | Same role-resolution outcome regardless of device category |
| **Route structure** | Same route map, path semantics, and deep-link destinations |
| **Responsibility lanes** | Same canonical lane structure; no device-specific lanes |
| **Ranking behavior** | Same ranking logic, scoring, and tie-breaking |
| **Feed content contract** | Same work-item/feed data semantics on all supported devices |
| **Redirect memory** | Same capture/restore rules and same return-memory behavior |
| **Authentication flow** | Same auth model and same protected-route behavior |
| **Freshness semantics** | Same freshness vocabulary and trust composition defined by P2-B3 |
| **Local queued changes** | Same queued-local-change semantics defined by P2-B3 |
| **Connectivity handling** | Same resolved connectivity signal from `@hbc/session-state`; no raw browser-only trust model |
| **Offline-safe mutation behavior** | Same queue/replay/reconciliation behavior |
| **Entitlement-governed team surfaces** | Same entitlement rules on supported devices when enabled |

### Invariant Rule

No Phase 2 feature may introduce **device-specific business logic** for supported desktop and tablet experiences.

Layout may adapt. Presentation density may adapt. Secondary surfaces may adapt. **Behavior must not diverge.**

### Team / Delegated Surface Qualification

P2-B4 does **not** freeze a hard count of first-release team modes.

Instead:

- team/delegated surfaces are **entitlement-governed and device-agnostic when enabled**
- any `my-team` / direct-report surface remains **provisional** until org-chart and entitlement plumbing are complete
- supported devices must not diverge in what an enabled entitlement means

---

## 3. Adaptive Shell Requirements

P2-B4 governs **what adaptive behavior must achieve**, not the exact component form that implementation must use.

### 3.1 Primary Navigation

| Requirement | Meaning |
|---|---|
| **Navigation remains discoverable** | Supported users must always be able to reach the same primary destinations on desktop and tablet |
| **Tablet navigation may become more compact** | Tablet may use a more space-efficient primary navigation treatment than desktop |
| **No route divergence** | Compact navigation must not hide or redefine route meaning |
| **No alternate information architecture** | Tablet must not become a separate app model |

### 3.2 Primary Work Runway Dominance

| Requirement | Meaning |
|---|---|
| **Primary runway remains dominant** | The personal work runway remains the main focus area across supported breakpoints |
| **Core work stays visible without hunting** | Adaptive layout must not bury the main work surface behind secondary chrome |
| **Task context remains recoverable** | A user resizing the shell must not lose the active work context |

### 3.3 Secondary Surfaces

| Requirement | Meaning |
|---|---|
| **Secondary surfaces may adapt** | Panels, drawers, inspectors, reasoning surfaces, and related-context regions may render inline, overlay, modal, sheet-like, or otherwise adapt to viewport constraints |
| **No exact presentation promise here** | This note does not lock side panel vs overlay vs sheet behavior |
| **No information loss** | Adaptive presentation must preserve the same information and action availability appropriate to entitlement and breakpoint constraints |
| **Dismiss / return must be stable** | Users must be able to close secondary context and return to the primary runway without state loss |

### 3.4 Density and Reflow

| Requirement | Meaning |
|---|---|
| **Grids and cards may reflow** | Column counts, spacing, and stacking may adapt by viewport width |
| **Adaptive density may increase touch safety** | Tablet may use roomier interactive spacing than desktop |
| **Data semantics do not change** | Reflow must not change route destinations, record identity, or decision meaning |

### 3.5 Interaction and Accessibility

| Requirement | Meaning |
|---|---|
| **WCAG minimums must be met** | Interactive targets must satisfy applicable WCAG requirements |
| **HB touch target standard** | For tablet-first touch comfort, HB should target **44×44 CSS px** minimum for primary interactive elements where practical |
| **Keyboard and assistive-tech continuity** | Supported cross-device shell behavior must remain keyboard-accessible and screen-reader coherent |

### 3.6 Resize and Orientation Rules

- Crossing a breakpoint boundary must trigger **layout adaptation**, not route or state reset.
- Tablet orientation changes may reflow layout, but must not silently clear active state, filters, drafts, or work context.
- Adaptive shell behavior must preserve the same active-session continuity contracts defined by P2-B1 and P2-B2.

---

## 4. Cross-Device Continuity Contracts

All B-series contracts apply consistently across supported desktop and tablet experiences.

| Contract | Cross-Device Requirement |
|---|---|
| **Redirect memory** (P2-B1) | Same capture/restore semantics on supported devices |
| **Deep links** | Same URL meaning and same destination behavior |
| **State persistence** (P2-B2) | Same browser-session persistence rules; not device-type dependent |
| **Freshness / trust** (P2-B3) | Same freshness vocabulary, trusted timestamp rules, and stale-data treatment |
| **Queued local changes** (P2-B3) | Same local-queue labeling and replay expectations |
| **Connectivity handling** | Same resolved connectivity model from `@hbc/session-state`; no direct dependence on raw `navigator.onLine` semantics in policy wording |
| **Offline mutations** | Same queue / replay / reconciliation model |
| **Error and degraded state treatment** | Same trust posture and same no-silent-failure expectation |

### Continuity Rule

A user who moves between desktop and tablet should experience:

- the same routes
- the same data semantics
- the same trust indicators
- the same persistence behavior
- the same offline-safe behavior
- the same entitlement meaning when a surface is enabled

Only the **presentation form** may adapt.

### Browser Session Qualification

Cross-device continuity does **not** imply live multi-device session handoff. P2-B2 persistence remains scoped to the active browser/session context unless a separate synchronization contract explicitly says otherwise.

---

## 5. PWA Runtime-Mode and Installability Invariants

P2-B4 governs behavioral consistency between browser and installed PWA experiences.

| Aspect | Required Invariant |
|---|---|
| **Business logic** | Same application logic in browser mode and installed mode |
| **Routes and data contracts** | Same route semantics and same data/trust contracts |
| **Offline capability** | Same offline-safe behavior model and same service-worker-backed caching strategy |
| **Connectivity / trust indicators** | Same user-facing trust meanings |
| **Display chrome** | Platform/browser chrome may differ between installed and browser modes |
| **Install prompts** | Platform-specific behavior is acceptable; no custom Phase 2 install-UI requirement |
| **Orientation handling** | No separate installed-only route model or orientation-only logic branch |

### Runtime-Mode Rule

Installation must **not** introduce intentional divergence in routes, lane behavior, trust semantics, offline-safe behavior, or entitlement meaning.

However, P2-B4 does **not** require the installed and browser shells to be literally pixel-identical. Platform display mode, browser chrome, and container affordances may differ.

### Service Worker Rule

- The same service worker strategy applies across supported device categories and runtime modes.
- No device-specific service-worker branching is introduced by this note.

---

## 6. Phase 2 Device Scope Boundary

### In Scope (Phase 2)

- **Desktop:** full optimization and acceptance testing
- **Tablet:** adaptive shell behavior with confirmed continuity and stability

### Out of Scope (Phase 2)

Per the Phase 2 plan boundary conditions, Phase 2 does **not** commit to broad mobile-first or field-specialized workflow design.

This means Phase 2 does **not** guarantee:

- mobile-specific navigation patterns
- mobile-optimized information architecture
- mobile-specific gesture models
- field-optimized reduced-viewport workflows
- a separate mobile shell strategy beyond safe responsive treatment

### Mobile Qualification

Mobile should receive responsive treatment from shared UI infrastructure, but mobile optimization is **not** part of the Phase 2 acceptance bar.

Responsive survival is expected. Mobile-first operating-model excellence is not promised by this phase.

---

## 7. Test Evidence Expectations

The cross-device acceptance gate requires evidence that supported desktop and tablet experiences preserve the same behavioral contracts while layout adapts.

### 7.1 Viewport Coverage Expectations

| Scenario | Evidence Required |
|---|---|
| **Desktop wide** | Stable shell, full work runway, no continuity regression |
| **Desktop compact** | Layout reflow without route or state loss |
| **Tablet landscape** | Adaptive shell remains credible and discoverable |
| **Tablet portrait** | Adaptive shell remains usable with preserved work context |
| **Breakpoint crossing** | Resize across supported breakpoints preserves active state |

### 7.2 Continuity Expectations

| Scenario | Expected Result |
|---|---|
| Resize during active work | Filters, drafts, active work context, and route remain intact |
| Orientation change on tablet | Layout reflows; active context remains intact |
| Deep link opened on tablet | Same destination semantics as desktop |
| Freshness indicator on tablet | Same vocabulary and timestamp rules as desktop |
| Queued local changes on tablet | Same queued-local-change meaning as desktop |
| Degraded / offline state on tablet | Same trust posture and no silent failure |
| Entitlement-governed surface enabled | Same device-agnostic behavior for supported devices |

### 7.3 Runtime-Mode Expectations

| Scenario | Expected Result |
|---|---|
| Installed PWA on desktop | Same routes, trust semantics, and offline-safe behavior as browser mode |
| Installed PWA on tablet | Same business logic and continuity guarantees as browser mode |
| Service worker active | Same caching/offline model across supported devices and runtime modes |

### 7.4 Failure Conditions

The cross-device gate fails if any of the following occur on supported devices:

- a supported route behaves differently by device class
- freshness or queued-local-change vocabulary diverges across devices
- resize/orientation change clears protected state unexpectedly
- installed mode changes business logic rather than only presentation/container chrome
- supported entitlement meaning differs between desktop and tablet

---

## 8. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Cross-device gate |
| **Pass condition** | Desktop and tablet shell behavior remains stable, credible, and behaviorally consistent |
| **Evidence required** | This note plus cross-device test evidence demonstrating continuity across supported breakpoints and runtime modes |
| **Primary owner** | Experience / QA |

---

## 9. Policy Precedence

| Deliverable | Relationship to P2-B4 |
|---|---|
| **P2-B0** — Lane Ownership | No device-specific lane divergence permitted |
| **P2-B1** — Root Routing | Routing and landing precedence remain device-agnostic |
| **P2-B2** — State Persistence | State continuity and return-memory behavior remain the same across supported devices |
| **P2-B3** — Freshness Trust | Freshness, trusted timestamps, connectivity, and queued-local-change semantics are inherited from P2-B3 |
| **P2-D2** — Adaptive Layout | P2-D2 governs zone/layout implementation; P2-B4 governs the cross-device behavioral invariant those implementations must preserve |

### Precedence Rule

If a future implementation detail or responsive component decision conflicts with this note, the implementation must be revised to preserve the continuity guarantees defined here.

If a future design decision requires a real behavioral fork between desktop and tablet, that fork must be explicitly justified and documented in a superseding governance artifact; it may not appear implicitly through responsive implementation drift.

---

## 10. Repo-Truth Reconciliation Notes

This tightened note intentionally corrects several overstatements that should not persist in the execution version:

- It no longer hard-locks exact tablet shell transformations such as bottom navigation, bottom-sheet reasoning, or single-column secondary treatment.
- It no longer states a fixed first-release count of team modes across devices.
- It aligns trust/connectivity wording with P2-B3 and `@hbc/session-state` rather than raw browser-only connectivity language.
- It distinguishes WCAG minimum requirements from HB’s stronger 44×44 touch-target standard.
- It prohibits intentional installed-vs-browser business-logic divergence without claiming literal shell-identical rendering in every platform container.

---

P2-B4 does not create a separate tablet app model. It locks the requirement that supported desktop and tablet experiences remain part of **one behavioral shell**.

If any B-series contract behaves differently on supported desktop vs tablet surfaces, that is a defect unless a later governance artifact explicitly authorizes the divergence.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §5, §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
