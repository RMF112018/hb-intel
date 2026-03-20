# P2-B4: Cross-Device Shell Behavior Note

| Field | Value |
|---|---|
| **Doc ID** | P2-B4 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Note |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §5, §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [P2-B3](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md); `@hbc/ui-kit` breakpoints |

---

## Note Statement

The Personal Work Hub and PWA shell must remain stable and credible on desktop and tablet devices. This note documents the behavioral stability guarantees, shell layout transformations, and cross-device continuity expectations for Phase 2. It references the existing responsive infrastructure rather than re-defining it. Mobile-first workflow design is explicitly out of Phase 2 scope.

---

## Note Scope

### This note covers

- Device category definitions and canonical breakpoints
- What shell behavior remains invariant across desktop and tablet
- What layout transformations occur at breakpoint boundaries
- Cross-device continuity for routing, state, and freshness
- PWA installability behavior
- Phase 2 device scope boundary (what is out of scope)
- Test evidence expectations for the cross-device acceptance gate

### This note does NOT cover

- Mobile-first workflow design — explicitly out of Phase 2 scope (§5)
- Field-specialized interface design — out of Phase 2 scope (§5)
- Device-specific business logic or navigation branches
- Responsive component implementation details (governed by `@hbc/ui-kit`)

---

## Definitions

| Term | Meaning |
|---|---|
| **Device category** | A viewport-width classification: Desktop, Tablet, or Mobile, determined by canonical breakpoint constants |
| **Breakpoint** | A viewport width threshold where shell layout or component behavior changes. Defined in `@hbc/ui-kit/src/theme/breakpoints.ts` |
| **Shell transformation** | A change in navigation layout at a breakpoint boundary (e.g., sidebar → bottom navigation) |
| **Viewport stability** | The guarantee that all hub features function correctly across the desktop and tablet viewport range |

---

## 1. Device Category Definitions

Phase 2 uses the canonical breakpoints defined in `packages/ui-kit/src/theme/breakpoints.ts`:

| Category | Viewport Width | Breakpoint Constant | Phase 2 Status |
|---|---|---|---|
| **Desktop** | ≥ 1024px | `HBC_BREAKPOINT_SIDEBAR` | Fully supported — primary design target |
| **Tablet** | 768–1023px | `HBC_BREAKPOINT_TABLET` | Fully supported — shell transforms, hub remains functional |
| **Mobile** | ≤ 767px | `HBC_BREAKPOINT_MOBILE` | Receives responsive layout; no Phase 2 optimization |

### Additional Layout Breakpoints

| Breakpoint | Width | Purpose |
|---|---|---|
| `HBC_BREAKPOINT_CONTENT_MEDIUM` | 1199px | Dashboard and tool landing grid reflow |
| `HBC_BREAKPOINT_COMPACT_DENSITY` | 1440px | Compact density threshold |

### Detection Hooks

- `useIsTablet()` — returns `true` when viewport ≤ 1023px
- `useIsMobile()` — returns `true` when viewport ≤ 767px

These hooks use the canonical shared constants and are the authoritative way to detect device category in component code.

---

## 2. Shell Behavior Stability

The following behaviors are **invariant** across desktop and tablet:

| Behavior | Guarantee |
|---|---|
| **Landing precedence** | Same 3-priority chain (P2-B1 §2) on all devices |
| **Role-based landing** | `resolveRoleLandingPath()` returns the same path regardless of device |
| **Route structure** | All routes (`/my-work`, `/project-hub`, `/admin`, etc.) resolve identically |
| **Responsibility lanes** | Same 4-lane structure (`do-now`, `watch`, `waiting-blocked`, `deferred`) — no device-specific lanes |
| **Ranking algorithm** | Same scoring and tie-breaking (P2-A2) on all devices |
| **Feed content** | Same `IMyWorkFeedResult` data on all devices |
| **Team mode** | Same 3 modes (`personal`, `delegated-by-me`, `my-team`) available on all devices |
| **Redirect memory** | Same capture/restore mechanism on all devices |
| **Auth flow** | Same MSAL auth on all devices |
| **Freshness indicators** | Same sync status vocabulary and trust invariant (P2-B3) |
| **Offline behavior** | Same cached feed, mutation queueing, and reconciliation |

### Stability Invariant

No Phase 2 feature may introduce **device-specific business logic** — features that work on desktop must work on tablet using the same data, the same routes, and the same lane structure. Layout may adapt; behavior must not diverge.

---

## 3. Shell Layout Transformations

The following layout changes occur at breakpoint boundaries. These are **presentation adaptations**, not behavioral changes.

### 3.1 Navigation Shell

| Desktop (≥ 1024px) | Tablet (768–1023px) |
|---|---|
| Sidebar navigation (left rail) | Bottom navigation bar |
| Sidebar collapses/expands | Bottom nav is fixed |
| Shell header with full controls | Shell header with compact controls |

### 3.2 Feed Layout

| Desktop (≥ 1024px) | Tablet (768–1023px) |
|---|---|
| Full-width feed with side panel capability | Full-width feed, panel as overlay |
| Reasoning drawer as side panel | Reasoning drawer as bottom sheet or overlay |
| Multi-column secondary zone (when `@hbc/project-canvas` is active) | Single-column secondary zone |

### 3.3 Card and Grid Reflow

| Desktop (≥ 1200px) | Compact Desktop (1024–1199px) | Tablet (768–1023px) |
|---|---|---|
| Multi-column card grid | Reduced columns | Single-column stack |
| Standard density | Standard density | Touch-friendly density |

### 3.4 Transformation Rules

- Layout transformations are governed by `@hbc/ui-kit` breakpoints and responsive primitives.
- Transformations MUST NOT change the information available — only how it is arranged.
- Touch targets on tablet MUST meet accessibility minimums (44×44px per WCAG).
- The primary zone (personal work runway) MUST remain the dominant element at all breakpoints.

---

## 4. Cross-Device Continuity

All B-series contracts work consistently across desktop and tablet:

| Contract | Cross-Device Behavior |
|---|---|
| **Redirect memory** (P2-B1 §5) | Same `sessionStorage` + in-memory mechanism; same TTL; works on all devices |
| **Deep links** | Same URL structure; same `context.href` resolution; device does not affect link target |
| **State persistence** (P2-B2) | Same IndexedDB drafts; same TTLs; scoped to browser session, not device type |
| **Freshness** (P2-B3) | Same thresholds, same auto-refresh interval, same staleness display |
| **Connectivity detection** | Same `navigator.onLine` + probe mechanism; same `HbcConnectivityBar` |
| **Offline mutations** | Same `@hbc/session-state` queue; same replay on reconnect |

### Window Resize and Orientation Change

- When a user resizes the browser window across a breakpoint boundary, the shell layout transforms but application state is preserved.
- Tablet orientation changes (portrait ↔ landscape) trigger layout reflow but do not reset feed state, team mode, or scroll position.
- Session-state drafts (P2-B2) survive resize and orientation changes.

---

## 5. PWA Installability

| Aspect | Behavior |
|---|---|
| **Display mode** | `standalone` — fullscreen app experience without browser chrome |
| **Orientation** | No orientation lock — works in portrait and landscape |
| **Service worker** | Registered on load; same caching and offline behavior on all devices |
| **Install prompts** | Platform-specific (Chrome, Edge, Safari add-to-homescreen); Phase 2 does not add custom install UI |
| **Viewport** | `width=device-width, initial-scale=1.0` — responsive by default |
| **App icons** | 192×192 and 512×512 with maskable icon support |

### PWA Invariants

- The same service worker serves all device categories — no device-specific SW logic.
- Installation does not change shell behavior — installed and browser experiences are identical.
- Offline capability is the same whether installed or running in browser.

---

## 6. Phase 2 Device Scope Boundary

### In Scope (Phase 2)

- Desktop (≥ 1024px): full optimization and testing
- Tablet (768–1023px): responsive adaptation with confirmed stability

### Out of Scope (Phase 2)

Per Phase 2 Plan §5 (Boundary Conditions):

> "Broad field-specialized/mobile-first workflow design beyond shared shell, continuity, and degraded-state expectations"

This means:
- **Mobile (≤ 767px)** receives the responsive layout produced by existing breakpoint logic, but Phase 2 does NOT invest in:
  - Mobile-specific navigation patterns
  - Mobile-optimized feed layouts
  - Mobile-specific touch gestures
  - Mobile-specific offline behavior
  - Field-worker-oriented mobile workflows
- Mobile is not broken — it receives `@hbc/ui-kit` responsive treatment — but it is not optimized or acceptance-tested as part of Phase 2.

### Scope Boundary Rationale

Phase 2 establishes the Personal Work Hub as a credible daily operating surface. Desktop and tablet are the primary usage contexts for the first-release cohort. Mobile optimization requires separate investment in touch ergonomics, reduced-viewport information architecture, and field-workflow design that is beyond Phase 2's operating-layer scope.

---

## 7. Test Evidence Expectations

The cross-device acceptance gate requires test evidence across the following scenarios:

### 7.1 Viewport Tests

| Scenario | Breakpoint | Expected Behavior |
|---|---|---|
| Desktop landing | 1440px | Sidebar nav, full feed, multi-column secondary |
| Compact desktop | 1100px | Sidebar nav, full feed, reflowed grid |
| Tablet landscape | 1024px | Sidebar nav (boundary) |
| Tablet portrait | 800px | Bottom nav, single-column feed, overlay panels |
| Breakpoint transition | 1024px → 1023px resize | Sidebar → bottom nav transition; state preserved |

### 7.2 Continuity Tests

| Scenario | Expected Behavior |
|---|---|
| Resize during active feed | Feed state, team mode, and filters preserved |
| Orientation change on tablet | Layout reflows; feed state preserved |
| Deep link on tablet | Same route, same content as desktop |
| Offline on tablet | Same cached feed behavior as desktop |

### 7.3 PWA Tests

| Scenario | Expected Behavior |
|---|---|
| Installed PWA on desktop | Standalone mode; same behavior as browser |
| Installed PWA on tablet | Standalone mode; responsive layout; same behavior |
| Service worker on all devices | Same caching, same offline behavior |

---

## 8. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Cross-device gate |
| **Pass condition** | Desktop and tablet shell behavior remains stable and credible |
| **Evidence required** | Cross-device behavior note (this document), test evidence (§7) |
| **Primary owner** | Experience / QA |

---

## 9. Policy Precedence

| Deliverable | Relationship to P2-B4 |
|---|---|
| **P2-B0** — Lane Ownership | No device-specific lane divergence permitted. Same PWA/SPFx coexistence rules on all devices |
| **P2-B1** — Root Routing | Routing is device-agnostic. Same landing precedence chain on desktop and tablet |
| **P2-B2** — State Persistence | Session state is scoped to browser, not device type. Same draft keys and TTLs on all devices |
| **P2-B3** — Freshness Trust | Same freshness thresholds, refresh intervals, and staleness display on all devices |
| **P2-D2** — Adaptive Layout | P2-D2 defines zone governance; P2-B4 confirms zones adapt responsively without behavioral change |

P2-B4 does not introduce new constraints — it documents the cross-device stability guarantee that all B-series deliverables already imply. If any B-series contract is found to behave differently on tablet vs desktop, that is a bug, not a feature.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §5, §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
