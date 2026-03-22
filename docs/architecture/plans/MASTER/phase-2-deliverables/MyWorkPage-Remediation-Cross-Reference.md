# MyWorkPage Remediation — Audit Findings Cross-Reference

**Source audit:** `MyWorkPage-Audit-Report.md` (2026-03-22)
**Source remediation sequence:** Ordered remediation plan (2026-03-22)
**Purpose:** Each remediation step mapped to every audit finding it closes, partially closes, or provides gate evidence for.

Finding IDs follow the audit report's numbering: plan-reconciliation (`ARC-`, `STT-`, `FRS-`, `ROL-`, `CRD-`, `TM-`, `OPM-`, `PRS-`, `NAV-`), architecture (`ARC-F`), UX (`UX-F`), UI-Kit governance (`D-10`, `MB-08`, `Rule-6`), testing (`TST-F`), documentation (`DOC-`).

Severity codes: **C** = Critical, **H** = High, **M** = Medium, **L** = Low

---

## Phase 0 — Foundational Prerequisites

### 0-A: Correct the tile namespace ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-05 | **C** | Tile namespace `my-work.analytics.*` instead of `hub:*` (P2-D2 §6.1) | ✅ Closed (2026-03-22) |
| ARC-F2 | **C** | Wrong tile namespace prevents `HbcProjectCanvas` and `useRoleDefaultCanvas` lookup | ✅ Closed (2026-03-22) |
| ARC-09 | **C** | Gates 2–5 all failing — namespace is a prerequisite dependency for all gate evidence | ⚡ Partial — namespace prerequisite satisfied (2026-03-22); downstream gate work remains |

**Findings not yet addressed:** ARC-01 through ARC-04, ARC-06, ARC-07, ARC-F1 remain open. Namespace correction is a prerequisite, not a substitute.

---

### 0-B: Remove local role constants ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ROL-01 | **C** | `EXECUTIVE_ROLES = ['Executive']` and `ADMIN_ROLES` declared locally in violation of P2-D1 §11.1 | ✅ Closed (2026-03-22) |
| ARC-F3 | **C** | Local role constants duplicate `@hbc/auth` canonical strings; silent drift risk | ✅ Closed (2026-03-22) |

---

### 0-C: Apply all trivial patches ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| UX-F2 | **H** | `isLoadError={false}` hardcoded — error states permanently suppressed | ✅ Closed (2026-03-22) |
| D-10 (QuickActionsSheet) | **M** | `import { tokens } from '@fluentui/react-components'` direct Fluent import | ✅ Closed (2026-03-22) |
| D-10 (RecentActivityCard) | **M** | `import { tokens } from '@fluentui/react-components'` direct Fluent import | ✅ Closed (2026-03-22) |
| MB-08 (PersonalAnalyticsCard) | **M** | Hardcoded `backgroundColor: '#1E3A5F'` | ✅ Closed (2026-03-22) |
| MB-08 (MyWorkPage FAB) | **M** | Hardcoded `style={{ backgroundColor: '#F37021' }}` | ✅ Closed (2026-03-22) |
| Rule-6 (MyWorkPage) | **M** | Inline `<style>` block for responsive overrides instead of Griffel `makeStyles` | ✅ Closed (2026-03-22) |
| MB-08 (TeamPortfolioCard) | **M** | Raw CSS variable strings instead of named token constants | ✅ Closed (2026-03-22) |
| MB-08 (HubConnectivityBanner) | **M** | `HBC_STATUS_RAMP_AMBER[10]` ramp-index access instead of semantic token | ✅ Closed (2026-03-22) |
| Missing token (TeamPortfolioCard) | **M** | `<span>Loading...</span>` instead of `HbcSpinner` | ✅ Closed (2026-03-22) |
| ARC-F7 | **H** | `QuickActionsMenu.tsx` orphaned dead code — imported and rendered nowhere | ✅ Closed (2026-03-22) |
| FRS-02 / UX-F3 | **H** | `queued` trust state normalized to `live` — erases a distinct P2-B3 trust state | ✅ Closed (2026-03-22) |

---

## Phase 1 — State Contract Repairs

### 1-A: Implement split timestamp model ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| FRS-01 | **H** | Single `lastRefreshedIso` used; cannot distinguish failed refresh from successful one | ✅ Closed (2026-03-22) |
| UX-F5 | **L** | `_isLoading` parameter in `HubFreshnessIndicator` is dead code (leading underscore suppresses lint) | ✅ Closed (2026-03-22) — `isLoading` now used for stale-revalidate badge |
| FRS-03 | **M** | 3-minute auto-refresh scheduling not verified — confirm trigger wiring during freshness model rebuild | ⚡ Verified (2026-03-22) — no periodic timer; refresh is return-triggered only via `useHubFeedRefresh` |
| UIF-007 (via UX-F4) | **H** | Sync status bar unactionable; staleness display incorrect — partially depends on split timestamp to show correct age | ⚡ Partial — data model now correct; UIF-007 UI rendering addressed in 5-D |

---

### 1-B: Add `hbc-my-work-feed-cache` draft key and persistence ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| STT-01 | **H** | `hbc-my-work-feed-cache` key (P2-B2 §6) absent from `hubStateTypes.ts`; feed data not persisted for stale return | ✅ Closed (2026-03-22) |
| DOC-02 | — | `hubStateTypes.ts` has no reference comments pointing to P2-B2 | ⚡ Partial (2026-03-22) — P2-B2 §6 references added for feedCache; per-key comments for existing keys deferred to 6-E |

---

### 1-C: Wire return-state capture to route `onLeave` ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| STT-02 | **H** | Route `onLeave` is the required primary capture trigger (P2-B2 §4.2); only `visibilitychange` fires today | ✅ Closed (2026-03-22) |
| ARC-F10 | **H** | `myWorkRoute` has no `onLeave` hook; SPA navigation away from `/my-work` loses return state | ✅ Closed (2026-03-22) |

---

### 1-D: Consolidate dual role resolution ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ROL-02 | **H** | `MyWorkPage` uses `useCurrentUser()`; `HubTeamModeSelector` independently uses `useAuthStore` — two observation points | ✅ Closed (2026-03-22) |
| ARC-F4 | **H** | Dual role resolution sources in a single render tree; timing edge case risk | ✅ Closed (2026-03-22) |
| TM-03 | **M** | Team mode eligibility check uses two separate auth sources | ✅ Closed (2026-03-22) |

---

## Phase 2 — Canvas Integration (Core)

### 2-A: Implement missing pilot-required cards (`hub:lane-summary`, `hub:source-breakdown`) ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| CRD-01 | **H** | `pa-lane-summary` (pilot-REQUIRED, locked) absent — `PersonalAnalyticsTile` shows source counts, not 4 lane counts | ✅ Closed (2026-03-22) — `LaneSummaryCard` with E/S/X variants registered as `hub:lane-summary` |
| CRD-02 | **H** | `pa-source-breakdown` (pilot-REQUIRED) absent as a governed card | ✅ Closed (2026-03-22) — `SourceBreakdownCard` with E/S/X variants registered as `hub:source-breakdown` |
| UX-F6 | **H** | Two of four pilot-required cards missing | ⚡ Partial (2026-03-22) — `pa-lane-summary` and `pa-source-breakdown` implemented; `pa-recent-activity` addressed in 2-C; `ao-provisioning-health` in 6-B |
| CRD-05 | **L** | Expert variant is an alias of Standard — all new cards must provide genuine E/S/X variants | ✅ Closed for new tiles (2026-03-22) — existing tiles addressed in 6-A |
| ARC-08 | **M** | Custom Griffel grid not aligned to `CANVAS_GRID_COLUMNS = 12` — new tile `defaultColSpan` values must conform | ⚡ Partial (2026-03-22) — new tile registrations use correct column counts; existing grid replaced in 2-B/2-C |
| DOC-03 | — | `myWorkTileDefinitions.ts` has no reference to P2-D2 §6.1 namespace mandate | ⚡ Partial — namespace mandate doc comment added during 0-A (2026-03-22); full close in 6-E |

---

### 2-B: Replace `MyWorkCanvas` with `HbcProjectCanvas` — secondary zone ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-01 | **C** | `HbcProjectCanvas` absent in secondary zone; `MyWorkCanvas` custom renderer used | ✅ Closed — secondary zone (2026-03-22); tertiary in 2-C |
| ARC-F1 | **C** | `MyWorkCanvas` is a governance bypass — calls `getAll()` directly, no edit-mode, no mandatory enforcement | ✅ Closed — `MyWorkCanvas.tsx` deleted (2026-03-22) |
| ARC-09 | **C** | Gate 2 (canvas in secondary zone) failing | ✅ Gate 2 satisfied (2026-03-22) |
| ARC-08 | **M** | Custom Griffel grid not aligned to governed 12-column grid | ✅ Closed — tile colSpan converted to 12-column; HbcProjectCanvas manages grid (2026-03-22) |
| PRS-01 / ARC-F6 | **H** | `cardArrangement` computed and silently discarded — canvas now exists to receive it | ⚡ Partial — canvas mount point exists (2026-03-22); `cardArrangement` fully wired in 3-A |

---

### 2-C: Replace `RecentActivityCard` direct render with `HbcProjectCanvas` — tertiary zone ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-01 | **C** | `HbcProjectCanvas` absent in tertiary zone; `RecentActivityCard` rendered directly without governance | ✅ Closed — tertiary zone (2026-03-22); both zones now governed |
| ARC-F1 | **C** | Tertiary zone has no canvas governance at all | ✅ Closed (2026-03-22) — `HbcProjectCanvas` with `projectId="my-work-hub-tertiary"` |
| ARC-09 | **C** | Gate 2 (canvas in tertiary zone) fully satisfied (both zones) | ✅ Gates 2+3 complete (2026-03-22) — two isolated canvas instances |
| CRD-03 | **H** | `pa-recent-activity` stub rendered directly — tertiary zone now canvas-governed | ⚡ Partial (2026-03-22) — `hub:recent-context` tile registered; stub content (real data Phase 3+) |
| CRD-07 | **C** | Locked card enforcement impossible without canvas governance — `hub:quick-actions` must be mandatory in tertiary | ⚡ Partial — canvas exists (2026-03-22); mandatory enforcement wired in 2-E |
| Rule-6 (HubZoneLayout) | **M** | `hasRightPanelContent` triggers inline `style={{ gridTemplateColumns: '1fr' }}` override | ⚡ Partial — tertiary zone now canvas-governed; layout consolidation completed in 5-C |

---

### 2-D: Wire `useRoleDefaultCanvas` for both zones ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-04 | **C** | `useRoleDefaultCanvas` absent; tile order hard-coded by `getAll()` position | ✅ Closed (2026-03-22) — hub role defaults added to `ROLE_DEFAULT_TILES` |
| ROL-03 | **M** | Implementation defaults all roles to `personal`; Executive default layout not driven by role-default logic | ⚡ Partial (2026-03-22) — role-default layout seeded correctly; Executive `my-team` default resolved in 4-B |

---

### 2-E: Implement mandatory tile enforcement (`useCanvasMandatoryTiles`) ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-03 | **C** | `useCanvasMandatoryTiles` absent; `hub:lane-summary`, `hub:team-workload`, `hub:quick-actions` can be removed by users | ✅ Closed (2026-03-22) — enforcement wired via `useProjectCanvas`; `hub:lane-summary` mandatory; future tiles enforced when registered |
| CRD-07 | **C** | Locked cards from P2-D3 §2 have no enforcement mechanism | ✅ Closed (2026-03-22) — `isMandatory`/`isLocked` callbacks available to editor |
| ARC-09 | **C** | Gate 5 (mandatory tile enforcement evidence) | ✅ Gate 5 satisfied (2026-03-22) |
| TM-04 | **M** | `hub:team-workload` mandatory state must be dynamic — mandatory in `my-team`, configurable in `personal` | ⚡ Deferred — tile not yet registered; mechanism ready when tile is implemented |

---

### 2-F: Wire two isolated `useCanvasEditor` instances ✅ Completed (2026-03-22)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-06 | **H** | Two isolated `useCanvasEditor` instances required for zone boundary enforcement; none present | ✅ Closed (2026-03-22) — two HbcProjectCanvas instances with separate projectIds, editable enabled |
| ARC-09 | **C** | Gate 4 (edit-mode with isolated editors) | ✅ Gate 4 satisfied (2026-03-22) |

---

### 2-G: Wire `HbcCanvasEditor` and `HbcTileCatalog`

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-02 | **C** | `HbcCanvasEditor` and `useCanvasEditor` absent; no EditMode exists for secondary/tertiary zones | ✅ Full close |
| ARC-07 | **H** | `HbcTileCatalog` absent; no tile picker during EditMode | ✅ Full close |
| ARC-09 | **C** | Gate 4 (role eligibility filtering in catalog) | ✅ Gate 4 satisfied |

---

## Phase 3 — Personalization Completion

### 3-A: Wire `cardArrangement` into `HbcProjectCanvas`; wire `updateCardVisibility`

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| PRS-01 | **H** | `cardArrangement` (30-day persisted draft) computed by `useHubPersonalization`, passed to no one | ✅ Full close |
| ARC-F6 | **H** | `cardArrangement` destructured in `MyWorkPage` and immediately discarded | ✅ Full close |
| PRS-02 | **M** | `updateCardVisibility` exported by `useHubPersonalization`, consumed nowhere | ✅ Full close |

---

### 3-B: Config restore with role validation (`useCanvasConfig`)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-09 | **C** | Gate 5 (config restore and validation on return) | ✅ Gate 5 satisfied |
| TST-F2 | — | P2-E3 validation plan requires automated evidence of restore behavior | ⚡ Partial — unit tests for this path added in 7-B |

---

### 3-C: Replace `window.history.replaceState` with TanStack Router search params

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| STT-03 | **M** | `window.history.replaceState` used for URL sync instead of TanStack Router search params; URL not truly canonical | ✅ Full close |
| NAV-02 | **M** | No return-path state passed through handoff — router search params enable deep-link return path construction | ⚡ Partial — router state now linkable; full return path through `@hbc/workflow-handoff` completed in 4-A |
| STT-04 | **L** | Registry-driven bulk cleanup on session end not implemented — router lifecycle hooks now available | ⚡ Partial — unblocked; full implementation deferred per P2-B2 |

---

## Phase 4 — Action Vocabulary and Navigation

### 4-A: Implement PWA action vocabulary in `HubDetailPanel`; fix `RecentActivityCard` navigation

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| OPM-01 | **H** | Full PWA action vocabulary (P2-A1 §7.2) not implemented — only `open` via hard page reload | ✅ Full close |
| UX-F1 | **H** | `HubDetailPanel` routes every action to `window.location.href`; `RecentActivityCard` uses `window.location.href = '/projects'` | ✅ Full close |
| NAV-01 | **H** | No `@hbc/workflow-handoff` integration; `IHandoffPackage` never constructed; SPA session torn down on every item open | ✅ Full close |
| NAV-02 | **M** | No return-path state passed through handoff — `IHandoffPackage` now includes return context | ✅ Full close |

---

### 4-B: Resolve Executive default team mode conflict (ADR + plan update)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| PRS-03 | **H** | P2-D5 §3 (Executive defaults to `my-team`) conflicts with P2-B2 §4 (bare `/my-work` seeds personal-first) | ✅ Full close — ADR resolves which governs |
| ROL-03 | **M** | Implementation defaults all roles to `personal`; Executive role-default not applied | ✅ Full close — resolved behavior implemented |
| DOC-04 | — | Plan corpus contains an unresolved contradiction; superseded document must reference the ADR | ✅ Full close |

---

## Phase 5 — P2-F1 UI Quality

### 5-A: P2-F1 G1 — Remaining design token foundation

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| MB-08 (any remaining) | **M** | Any hardcoded colors/spacing not caught by Phase 0-C | ✅ Full close |
| D-10 (any remaining) | **M** | Any remaining direct Fluent imports not caught by Phase 0-C | ✅ Full close |
| Rule-6 (HubZoneLayout) | **M** | `hasRightPanelContent` inline style override — residual after 2-C | ✅ Full close |
| TabBadge inline styles (HubTeamModeSelector) | **L** | Local `TabBadge` subcomponent uses inline styles instead of governed tokens | ✅ Full close |

---

### 5-B: P2-F1 G2 — Feed visual structure (changes in `@hbc/my-work-feed`)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| UIF-001 (via UX-F4) | **C** | Lane headers render as OS-native gray rectangle buttons — `appearance: auto`, no design token treatment | ✅ Full close |
| UIF-003 (via UX-F4) | **C** | Work item title links in browser-default blue `rgb(0,0,238)` on dark shell | ✅ Full close |
| UIF-004 (via UX-F4) | **C** | Split-theme state — shell dark, work feed near-white; visual incoherence | ✅ Full close |
| UIF-005 (via UX-F4) | **H** | Collapsed lane state visually indistinguishable from expanded; no `aria-expanded`; no distinct treatment | ✅ Full close |
| UIF-006 (via UX-F4) | **H** | Work item rows: zero padding, zero separators, transparent background; no temporal metadata | ✅ Full close |

---

### 5-C: P2-F1 G3 — Layout (two-column persistent layout)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| UIF-002 (via UX-F4) | **C** | Single-column layout buries analytics 900px below fold; right viewport empty throughout feed scroll | ✅ Full close |
| ARC-08 | **M** | Grid not aligned to governed 12-column system — residual layout alignment after canvas integration | ✅ Full close (any remaining layout alignment concerns) |

---

### 5-D: Remaining open P2-F1 UIFs (UIF-007 through UIF-018)

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| UIF-007 (via UX-F4) | **H** | Connectivity bar unactionable — no retry, no named sources, color collision between PARTIAL and BLOCKED | ✅ Full close |
| UIF-008 (via UX-F4) | **H** | KPI cards static counts — not clickable/filterable; duplicate BLOCKED label; inconsistent card styles | ✅ Full close |
| UIF-009 (via UX-F4) | **H** | "Open" button 28px tall — below 44px WCAG touch target threshold | ✅ Full close |
| UIF-010 (via UX-F4) | **H** | Dev overlays (`HB-AUTH-DEV` bar, TanStack devtools) visible in production-accessible builds | ✅ Full close |
| UIF-011 (via UX-F4) | **H** | Empty-state heading same weight as page title — broken typographic hierarchy | ✅ Full close |
| UIF-012 (via UX-F4) | **H** | Two separate command rows (~80px overhead); filter buttons no active state; "Group by" not a dropdown | ✅ Full close |
| UIF-013 (via UX-F4) | **H** | Left nav rail shows only one destination — no other modules visible | ✅ Full close |
| UIF-014 through UIF-018 (via UX-F4) | **H** | CTA label specificity, project color coding, focus ring visibility, field-use touch targets | ✅ Full close |

---

## Phase 6 — Completeness and Technical Debt

### 6-A: Implement expert-tier tile variants

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| CRD-05 | **L** | All four existing tiles alias Standard as Expert — no expert-specific behavior or display | ✅ Full close |

---

### 6-B: Implement `AdminOversightCard`

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| CRD-04 | **H** | `ao-provisioning-health` is a stub with placeholder text — no data, no provisioning feed integration | ✅ Full close |
| ARC-F8 | **H** | `AdminOversightCard` stub renders to Administrator users — visible quality failure | ✅ Full close |
| UX-F6 | **H** | Pilot-required card set incomplete | ⚡ Partial close — closes the last remaining incomplete card (`ao-provisioning-health` is pilot-optional per P2-D3 §8) |

---

### 6-C: Resolve `HubTabBadgeBridge`

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| ARC-F9 | **M** | Null-rendering cross-boundary data bridge — invisible coupling with undocumented intent | ✅ Full close |

---

### 6-D: Add `README.md` to `apps/pwa/src/pages/my-work/`

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| DOC-05 | — | No README exists for the `my-work` page directory — complex state model and governing doc set undocumented | ✅ Full close |

---

### 6-E: Add governing doc references to `hubStateTypes.ts` and `myWorkTileDefinitions.ts`

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| DOC-02 | — | `hubStateTypes.ts` has no P2-B2 reference comments on draft key constants | ✅ Full close |
| DOC-03 | — | `myWorkTileDefinitions.ts` has no reference to P2-D2 §6.1 namespace mandate | ✅ Full close |

---

## Phase 7 — Test Coverage

### 7-A: Trust state and freshness tests

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| TST-F1 | **C** | Zero behavioral test coverage across all hooks and components | ✅ Partial close — trust state and freshness domain covered |
| FRS-01 | **H** | Split timestamp model — behavioral verification that derivation is correct | ✅ Gate evidence |
| FRS-02 / UX-F3 | **H** | `queued` state distinction — behavioral verification | ✅ Gate evidence |
| TST-F2 | — | P2-E3 validation plan requires automated evidence of freshness window behavior | ✅ Satisfied |

---

### 7-B: Canvas tile governance tests

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| TST-F1 | **C** | Zero behavioral test coverage | ✅ Partial close — canvas governance domain covered |
| TST-F3 | — | No integration or snapshot tests for zone composition | ✅ Full close |
| ARC-09 Gate 1 | **C** | Already passing — regression protection added | ✅ Regression guard |
| ARC-09 Gate 2 | **C** | Mandatory tile enforcement evidence: `removeTile('hub:lane-summary')` is a no-op | ✅ Gate 2 evidence |
| ARC-09 Gate 3 | **C** | Zone boundary evidence: secondary editor cannot produce tertiary tile key | ✅ Gate 3 evidence |
| ARC-09 Gate 4 | **C** | Role eligibility evidence: Member does not see `hub:team-workload` in catalog | ✅ Gate 4 evidence |
| ARC-09 Gate 5 | **C** | Config restore evidence: ineligible tiles removed after role change; fallback to role-default | ✅ Gate 5 evidence |
| TST-F2 | — | P2-E3 validation plan — restore behavior automated evidence | ✅ Satisfied |

---

### 7-C: State persistence and return-memory tests

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| TST-F1 | **C** | Zero behavioral test coverage | ✅ Partial close — state persistence domain covered |
| STT-01 | **H** | Feed cache key behavioral verification: draft key round-trip, stale-return seed | ✅ Gate evidence |
| STT-02 | **H** | Route `onLeave` capture behavioral verification | ✅ Gate evidence |

---

### 7-D: Action vocabulary tests

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| TST-F1 | **C** | Zero behavioral test coverage | ✅ Partial close — action dispatch domain covered |
| OPM-01 | **H** | Each action key dispatches to correct handler (not `window.location.href`) | ✅ Gate evidence |
| NAV-01 | **H** | `@hbc/workflow-handoff` called with correct `IHandoffPackage` for cross-domain actions | ✅ Gate evidence |

---

### 7-E: Role entitlement and team mode tests

| Finding ID | Severity | Finding Summary | Closure |
|---|---|---|---|
| TST-F1 | **C** | Zero behavioral test coverage | ✅ Partial close — role entitlement domain covered |
| ROL-01 | **C** | No local role constants survive in tile definitions — verification | ✅ Verification |
| ROL-02 | **H** | Single role resolution source behavioral verification | ✅ Verification |
| TM-01 | — | `my-team` role gate (already passing) — regression protection | ✅ Regression guard |
| TST-F2 | — | P2-E3 validation plan — role entitlement matrix automated evidence | ✅ Satisfied |

---

## Findings Coverage Summary

| Finding ID | Severity | Closed By |
|---|---|---|
| ARC-01 | C | 2-B (secondary), 2-C (tertiary) |
| ARC-02 | C | 2-G |
| ARC-03 | C | 2-E |
| ARC-04 | C | 2-D |
| ARC-05 | C | 0-A |
| ARC-06 | H | 2-F |
| ARC-07 | H | 2-G |
| ARC-08 | M | 2-A (registration), 2-B (grid), 5-C (residual) |
| ARC-09 Gate 1 | C | Already passing — regression guard in 7-B |
| ARC-09 Gate 2 | C | 2-B, 2-C, 2-E + evidence in 7-B |
| ARC-09 Gate 3 | C | 2-F + evidence in 7-B |
| ARC-09 Gate 4 | C | 2-G + evidence in 7-B |
| ARC-09 Gate 5 | C | 3-B + evidence in 7-B |
| ARC-F1 | C | 2-B, 2-C |
| ARC-F2 | C | 0-A |
| ARC-F3 | C | 0-B |
| ARC-F4 | H | 1-D |
| ARC-F6 | H | 3-A |
| ARC-F7 | H | 0-C |
| ARC-F8 | H | 6-B |
| ARC-F9 | M | 6-C |
| ARC-F10 | H | 1-C |
| CRD-01 | H | 2-A |
| CRD-02 | H | 2-A |
| CRD-03 | H | 2-C (governance); content tracked separately |
| CRD-04 | H | 6-B |
| CRD-05 | L | 2-A (new tiles), 6-A (existing tiles) |
| CRD-07 | C | 2-E |
| D-10 (QuickActionsSheet) | M | 0-C |
| D-10 (RecentActivityCard) | M | 0-C |
| DOC-02 | — | 1-B (partial), 6-E (full) |
| DOC-03 | — | 2-A (partial), 6-E (full) |
| DOC-04 | — | 4-B |
| DOC-05 | — | 6-D |
| FRS-01 | H | 1-A |
| FRS-02 / UX-F3 | H | 0-C |
| FRS-03 | M | Verify as sub-task of 1-A |
| MB-08 (PersonalAnalyticsCard) | M | 0-C |
| MB-08 (FAB) | M | 0-C |
| MB-08 (TeamPortfolioCard) | M | 0-C |
| MB-08 (HubConnectivityBanner) | M | 0-C |
| Missing token (TeamPortfolioCard) | M | 0-C |
| NAV-01 | H | 4-A |
| NAV-02 | M | 3-C (partial), 4-A (full) |
| OPM-01 | H | 4-A |
| PRS-01 | H | 3-A |
| PRS-02 | M | 3-A |
| PRS-03 | H | 4-B |
| ROL-01 | C | 0-B |
| ROL-02 | H | 1-D |
| ROL-03 | M | 2-D (partial), 4-B (full) |
| Rule-6 (MyWorkPage) | M | 0-C |
| Rule-6 (HubZoneLayout) | M | 5-A |
| STT-01 | H | 1-B |
| STT-02 | H | 1-C |
| STT-03 | M | 3-C |
| STT-04 | L | 3-C (partial); full implementation deferred per P2-B2 |
| TabBadge inline styles | L | 5-A |
| TM-03 | M | 1-D |
| TM-04 | M | 2-E |
| TST-F1 | C | 7-A through 7-E |
| TST-F2 | — | 7-A, 7-B, 7-E |
| TST-F3 | — | 7-B |
| UIF-001 | C | 5-B |
| UIF-002 | C | 5-C |
| UIF-003 | C | 5-B |
| UIF-004 | C | 5-B |
| UIF-005 | H | 5-B |
| UIF-006 | H | 5-B |
| UIF-007 | H | 1-A (data model), 5-D (UI) |
| UIF-008 | H | 5-D |
| UIF-009 | H | 5-D |
| UIF-010 | H | 5-D |
| UIF-011 | H | 5-D |
| UIF-012 | H | 5-D |
| UIF-013 | H | 5-D |
| UIF-014–018 | H | 5-D |
| UX-F1 | H | 4-A |
| UX-F2 | H | 0-C |
| UX-F3 | H | 0-C |
| UX-F4 | C | 5-B, 5-C, 5-D |
| UX-F5 | L | 1-A |
| UX-F6 | H | 2-A (pa-lane-summary, pa-source-breakdown), 6-B (ao-provisioning-health) |

---

*Cross-reference produced: 2026-03-22*
