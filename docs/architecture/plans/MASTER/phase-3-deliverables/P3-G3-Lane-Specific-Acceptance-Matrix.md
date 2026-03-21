# P3-G3: Lane-Specific Acceptance Matrix

| Field | Value |
|---|---|
| **Doc ID** | P3-G3 |
| **Phase** | Phase 3 |
| **Workstream** | G — Dual-lane capability and coexistence |
| **Document Type** | Specification |
| **Owner** | Architecture + Experience / Shell Team |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §18](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-G1](P3-G1-Lane-Capability-Matrix.md); [P3-G2](P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md); [P3-C3](P3-C3-Lane-Aware-Home-Canvas-Capability-Matrix.md); [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md) |

---

## Specification Statement

This specification operationalizes the Phase 3 acceptance gates (§18.1–§18.7) into a **lane-specific acceptance matrix** — defining what must pass in each lane (PWA and SPFx), what evidence is required, and which criteria are shared vs. lane-differentiated.

P3-G1 defined lane capability depth. P3-G2 defined cross-lane navigation and handoff patterns. This specification translates those governance documents into **testable acceptance criteria** organized by gate, with per-lane expectations and evidence requirements.

Phase 3 is complete only when all gates in §18.1–§18.7 pass with evidence. This matrix provides the structured acceptance framework that P3-H1 (Acceptance, Staging, and Release-Readiness Checklist) will use for execution tracking.

**Repo-truth audit — 2026-03-21.** All governing deliverables across Workstreams A–G are locked. Acceptance gates are defined in Phase 3 plan §18. No lane-specific acceptance matrix previously existed. This specification fills that gap.

---

## Specification Scope

### This specification governs

- Per-lane acceptance criteria for each Phase 3 gate (§18.1–§18.7)
- Evidence requirements per criterion
- Shared vs. lane-differentiated acceptance expectations
- Module-level per-lane acceptance criteria

### This specification does NOT govern

- Within-lane implementation details
- Acceptance checklist execution and tracking — see P3-H1
- Lane capability depth definitions — see [P3-G1](P3-G1-Lane-Capability-Matrix.md)
- Cross-lane navigation patterns — see [P3-G2](P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Acceptance gate** | A named category of pass/fail criteria from Phase 3 plan §18 |
| **Pass condition** | The specific testable condition that must be true for a gate criterion to pass |
| **Evidence** | The artifact, test result, or demonstration required to prove a pass condition is met |
| **Shared acceptance** | A criterion that must pass identically in both lanes |
| **Lane-specific acceptance** | A criterion where PWA and SPFx have different depth expectations |
| **Gate owner** | The team responsible for ensuring the gate criteria are met |

---

## 1. Current-State Reconciliation

| Artifact | Status | Relevance |
|---|---|---|
| Phase 3 plan §18 acceptance gates | **Locked** | 7 gate categories defined |
| P3-G1 lane capability matrix | **Locked** | Defines per-lane depth expectations |
| P3-G2 cross-lane navigation map | **Locked** | Defines handoff and escalation acceptance |
| P3-C3 canvas lane matrix | **Locked** | Defines per-lane canvas acceptance |
| P3-E1 module classification | **Locked** | Defines module depth classifications |
| Lane-specific acceptance matrix | **Gap** | Did not previously exist — this specification fills the gap |

---

## 2. Acceptance Gate Summary

| Gate | §18 ref | Scope | Lane differentiation |
|---|---|---|---|
| Cross-lane contracts | §18.1 | Identity, membership, switching, handoff | Shared semantics; lane-specific resolution mechanisms |
| Project activation | §18.2 | Activation, site association, partial rejection | Shared |
| Home/canvas | §18.3 | Canvas-first, mandatory core, governance, persistence | Shared governance; lane-specific persistence and admin depth |
| Shared spines | §18.4 | Health, activity, work queue, related items | Shared data; lane-specific rendering depth |
| Core modules | §18.5 | Financial through Reports; spreadsheet replacement | Shared authority; lane-specific capability depth |
| Reporting | §18.6 | PX Review, Owner Report lifecycle | Shared definitions; lane-specific interaction depth |
| Validation | §18.7 | Staging scenarios, defer list | Lane-specific scenario coverage |

---

## 3. Cross-Lane Contract Acceptance (§18.1)

**Gate owner:** Architecture + Experience / Shell

| # | Criterion | PWA pass condition | SPFx pass condition | Evidence |
|---|---|---|---|---|
| 1 | Same canonical project identity | Resolves `projectId` from URL route params | Resolves `projectId` from `siteUrl` (P3-B1 §2.3) | Identity resolution test: same project yields same `projectId`, `projectNumber`, `projectName` |
| 2 | Same membership validation | P3-A2 §6 access eligibility enforced | P3-A2 §6 access eligibility enforced | Access test: same user + project yields same module access in both lanes |
| 3 | Smart project switching | Full in-app switching (P3-B1 §2) | Host-aware fallbacks (P3-B1 §8.4) | Switching scenario: context header switch in PWA, launch-to-project in SPFx |
| 4 | Cross-lane handoff identity | Receives `projectId` from SPFx deep link | Sends `projectId` in deep-link URL | Handoff round-trip: SPFx→PWA→SPFx preserves project identity |
| 5 | No context loss during handoff | Deep-link handler (P3-B1 §6.1) processes arrival | `BackToProjectHub` pattern sends correct params | Post-handoff verification: correct project, module, and access after arrival |

---

## 4. Project Activation Acceptance (§18.2)

**Gate owner:** Platform / Core Services

| # | Criterion | Both lanes | Evidence |
|---|---|---|---|
| 1 | Valid activation transaction | Setup/handoff acknowledgment creates valid project record with `projectId`, `siteUrl`, status `active` | Activation flow test: registry entry created, site associated |
| 2 | Routeable context on landing | Activated project lands with valid route in PWA and valid site in SPFx | Navigation test: both lanes can reach the project after activation |
| 3 | No partial activation | Incomplete activation is rejected; partial records are not persisted | Error-path test: failed activation leaves no orphaned records |

---

## 5. Home/Canvas Acceptance (§18.3)

**Gate owner:** Experience / Shell + Project Hub platform owner

| # | Criterion | PWA pass condition | SPFx pass condition | Evidence |
|---|---|---|---|---|
| 1 | Canvas-first home | `@hbc/project-canvas` renders project home | `@hbc/project-canvas` renders project home | Canvas rendering: both lanes show canvas, not fixed dashboard |
| 2 | Mandatory operational core | Identity header + Health + Work Queue + Related Items + Activity tiles present | Same 5 mandatory surfaces present | Tile verification: all mandatory tiles registered and rendering |
| 3 | Governance tiers | Mandatory locked tiles cannot be removed/moved; role-default present; optional available | Same governance enforcement | Edit-mode test: locked tiles resist manipulation |
| 4 | Personalization | Full governed adaptive composition | Full governed adaptive composition | Canvas edit test: add/remove/reorder/resize non-mandatory tiles |
| 5 | Persistence | CanvasApi → IndexedDB + server sync | CanvasApi → localStorage + SharePoint list | Persistence test: layout survives session close and reopen |
| 6 | Reset to role-default | Reset returns to role-default layout | Reset returns to role-default layout | Reset test: mandatory tiles preserved after reset |
| 7 | Complexity tiers | Essential/standard/expert render per preference | Essential/standard/expert render per preference | Tier toggle: tiles re-render at each complexity level |
| 8 | Role-based visibility | Tiles hidden per P3-C2 §8 (e.g., Work Queue hidden for Viewer) | Same visibility rules | Role test: Viewer canvas omits Work Queue tile |

---

## 6. Shared Spine Acceptance (§18.4)

**Gate owner:** Platform / Core Services + Project Hub platform owner

| # | Criterion | PWA pass condition | SPFx pass condition | Evidence |
|---|---|---|---|---|
| 1 | Health spine | Full detail + explainability drawer + portfolio table | Full (shared `@hbc/features-project-hub` component) | Tile renders with score, dimensions, confidence, actions |
| 2 | Activity spine | Full timeline page with filtering | Tile with recent activity | Feed shows project-scoped activity events |
| 3 | Work Queue spine | Full feed + panel + team feed + reason drawer | Tile + panel; full feed launches to PWA | Feed shows project-filtered work items with counts |
| 4 | Related Items spine | Full panel + AI suggestions (Expert tier) | Compact panel (Standard tier) | Panel shows grouped relationships with role-gated visibility |
| 5 | Spine data consistency | Same data for same `projectId` | Same data for same `projectId` | Cross-lane test: identical spine data in both lanes |
| 6 | Module publications flowing | All module adapters registered and publishing | All module adapters registered and publishing | Spine data includes contributions from Financial through Reports |

---

## 7. Core Module Acceptance (§18.5)

**Gate owner:** Architecture + Project Hub platform owner

### 7.1 Financial

| # | Criterion | PWA | SPFx | Evidence |
|---|---|---|---|---|
| 1 | Budget import | Required (CSV upload) | Broad (supported) | Import test: CSV ingested, data normalized |
| 2 | Financial Summary editing | Required | Required | Edit test: working state saves and persists |
| 3 | GC/GR model | Required | Required | Model interaction test |
| 4 | Cash Flow model | Required | Required | Model interaction test |
| 5 | Exposure tracking | Required | Required | Tracking test |
| 6 | Buyout support | Required | Required | Buyout within Financial domain |
| 7 | Spreadsheet replacement notes | Financial includes replacement notes (P3-E3 §2) | Same | P3-E3 §2 evidence |

### 7.2 Schedule

| # | Criterion | PWA | SPFx | Evidence |
|---|---|---|---|---|
| 1 | Milestone tracking | Required | Required | CRUD test |
| 2 | Forecast overrides | Required | Required | Override with provenance test |
| 3 | File ingestion | Required | **Launch-to-PWA** | PWA: upload works; SPFx: escalation deep link opens PWA |
| 4 | Upload history/restore | Required | **Launch-to-PWA** | PWA: history browsable; SPFx: escalation works |

### 7.3 Constraints

| # | Criterion | PWA | SPFx | Evidence |
|---|---|---|---|---|
| 1 | Constraint CRUD | Required | Required | Create/update/close tests |
| 2 | Change Tracking | Required | Required | Entry management test |
| 3 | Delay Log | Required | Required | Delay quantification test |
| 4 | Spreadsheet replacement notes | Constraints includes replacement notes (P3-E3 §4) | Same | P3-E3 §4 evidence |

### 7.4 Permits

| # | Criterion | PWA | SPFx | Evidence |
|---|---|---|---|---|
| 1 | Permit log management | Required | Required | CRUD test |
| 2 | Linked inspections | Required | Required | Linkage test |
| 3 | Expiration tracking | Required | Required | Alert test |

### 7.5 Safety

| # | Criterion | PWA | SPFx | Evidence |
|---|---|---|---|---|
| 1 | Safety plan state | Required | Required | Plan management test |
| 2 | Orientations/acknowledgments | Required | Required | Record management test |
| 3 | Checklists/inspections | Required | Required | Aggregation test |
| 4 | JHA log records | Required | Required | CRUD test |
| 5 | Incident reports | Required | Required | Report + notification test |
| 6 | SSSP replacement notes | Safety includes SSSP replacement notes (P3-E3 §6) | Same | P3-E3 §6 evidence |
| 7 | Future toolbox-talk note | Documented (P3-E3 §6.4) | Same | P3-E3 §6.4 evidence |

### 7.6 Source-of-truth compliance

| # | Criterion | Both lanes | Evidence |
|---|---|---|---|
| 1 | Modules respect P3-E2 authority | Upstream authority honored; Project Hub owns operational state | Authority boundary tests per P3-E2 §3–§8 |
| 2 | Spine publication flowing | All modules publish to all 4 spines per P3-A3 §7 | Spine data verification |

---

## 8. Reporting Acceptance (§18.6)

**Gate owner:** Project Hub platform owner

| # | Criterion | PWA | SPFx | Evidence |
|---|---|---|---|---|
| 1 | PX Review family live | Full lifecycle (draft→generate→approve→release) | Generate + approve | PX Review generation and approval flow |
| 2 | Owner Report family live | Full lifecycle (draft→generate→release) | Generate + release | Owner Report generation and release flow |
| 3 | Draft refresh | Full refresh with timestamp tracking | Refresh supported | Draft shows refreshed data |
| 4 | Staleness warning | Full warning before export | Warning displayed | Stale draft triggers visual cue |
| 5 | Queued generation | Asynchronous generation pipeline | Generation supported | Report queued and produced |
| 6 | Run-ledger tracking | Full history browsing | **Launch-to-PWA** for history | Run-ledger entry created per generation |
| 7 | PX Review approval | Explicit approval gate enforced | Approval action available | Approval required before release |
| 8 | Owner Report non-gated | No approval step; governed release | Release without approval | Direct generate→release flow |
| 9 | PM narrative | Full editing with provenance | **Broad** — basic editing | Narrative override saved with PM identity/timestamp |
| 10 | Export | PDF artifact produced and stored | Export available | PDF in SharePoint document library |

---

## 9. Validation Acceptance (§18.7)

**Gate owner:** Architecture + Experience / Shell

| # | Scenario | PWA pass condition | SPFx pass condition | Evidence |
|---|---|---|---|---|
| 1 | Activation flow | Full activation produces valid project with routeable context | Same | End-to-end activation test |
| 2 | Project switching | In-app switching preserves context (P3-B1 §2) | Host-aware fallback (P3-B1 §8.4) | Multi-project switching test |
| 3 | Stale draft handling | Staleness warning shown; refresh available; export gated | Staleness warning shown | Stale draft scenario test |
| 4 | Cross-lane launch SPFx→PWA | Deep-link arrival resolves project and module | Launch-to-PWA constructs correct deep link | Round-trip test (P3-G2 §3) |
| 5 | Cross-lane launch PWA→SPFx | Opens SPFx site in new tab via `siteUrl` | Site opens with correct project | Navigation test (P3-G2 §4) |
| 6 | Module publication | All module adapters publish to all 4 spines | Same | Spine data includes module contributions |
| 7 | Defer list clear | Phase 3 has explicit defer list; no hidden scope | Same | Defer list review |
| 8 | QC/Warranty lifecycle-visible | Navigation present; deeper depth deferred | Same | Module appears in nav; deferred note documented |

---

## 10. Lane-Specific Evidence Matrix

Summary of all evidence artifacts organized by lane:

### 10.1 Shared evidence (must pass identically)

| Evidence category | Description | Governing deliverable |
|---|---|---|
| Project identity resolution | Same `projectId` for same project in both lanes | P3-A1, P3-B1 §8 |
| Membership validation | Same access rules in both lanes | P3-A2 |
| Mandatory tile presence | Same 5 mandatory surfaces in both lanes | P3-C2 |
| Canvas governance | Same 3-tier model enforced in both lanes | P3-C1 |
| Spine data consistency | Same spine data for same query in both lanes | P3-D1–D4 |
| Module source-of-truth | Same authority boundaries in both lanes | P3-E2 |
| Report definitions | Same family definitions in both lanes | P3-F1 |

### 10.2 PWA-specific evidence

| Evidence category | Description | Governing deliverable |
|---|---|---|
| Full feed/timeline pages | Work Queue feed, Activity timeline, Report history | P3-G1 §4 |
| Canvas persistence depth | IndexedDB + server sync with session recovery | P3-C3 §6.1 |
| In-app project switching | Full context-preserving switching | P3-B1 §2 |
| Return-memory | Per-project return-memory maintained | P3-B1 §8.5 |
| Deep-link handler | Processes SPFx-to-PWA arrivals | P3-B1 §6.1, P3-G2 §7 |
| Advanced canvas admin | Full admin panel access | P3-C3 §8 |
| Schedule file ingestion | XER/XML/CSV upload + parsing | P3-G1 §4.2 |
| Report run-ledger history | Rich timeline browsing | P3-G1 §4.6 |

### 10.3 SPFx-specific evidence

| Evidence category | Description | Governing deliverable |
|---|---|---|
| Launch-to-PWA escalation | Correct deep links for 10 escalation scenarios | P3-G2 §3 |
| Canvas persistence | localStorage + SharePoint list | P3-C3 §6.2 |
| Host-aware switching | Project switching with site-scoped fallbacks | P3-B1 §8.4 |
| Broad module pages | Substantial direct working capability | P3-G1 §4, §5.1 |
| BackToProjectHub pattern | Return navigation to PWA | P3-G2 §6 |

---

## 11. Repo-Truth Reconciliation Notes

1. **Governing deliverables — all locked**
   All deliverables across Workstreams A–G are locked. Acceptance criteria in this specification are derived from and consistent with those locked deliverables. Classified as **compliant**.

2. **Lane-specific acceptance matrix — gap filled**
   No lane-specific acceptance matrix previously existed. This specification fills the gap between the §18 acceptance gates and the execution-level checklist (P3-H1). Classified as **gap — now resolved**.

3. **Implementation evidence — pending**
   Acceptance criteria are defined but implementation evidence is pending Phase 3 execution. P3-H1 will track evidence collection against these criteria. Classified as **controlled evolution**.

4. **PWA project hub — controlled evolution**
   Current MVP scaffold must be upgraded to satisfy canvas-first and module-page acceptance criteria. Classified as **controlled evolution**.

5. **SPFx project hub — controlled evolution**
   Current 1 of 11+ pages must be expanded to satisfy broad operational companion acceptance criteria. Classified as **controlled evolution**.

---

## 12. Acceptance Gate Reference

**Gate:** Validation gates (Phase 3 plan §18.7)

| Field | Value |
|---|---|
| **Pass condition** | All §18.1–§18.7 gate criteria pass per the lane-specific matrix in this specification; staging scenarios pass; defer list is clear and explicit |
| **Evidence required** | P3-G3 (this document), per-criterion evidence artifacts from §3–§9, lane-specific evidence from §10 |
| **Primary owner** | Architecture + Experience / Shell |

---

## 13. Policy Precedence

This specification establishes the **lane-specific acceptance criteria** that P3-H1 must use for execution tracking:

| Deliverable | Relationship to P3-G3 |
|---|---|
| **Phase 3 Plan §18** | Provides the 7 acceptance gate categories that this specification operationalizes per lane |
| **P3-G1** — Lane Capability Matrix | Defines per-lane depth expectations that acceptance criteria must reflect |
| **P3-G2** — Cross-Lane Navigation Map | Defines handoff and escalation acceptance scenarios |
| **P3-C3** — Canvas Lane Matrix | Defines canvas-specific per-lane acceptance criteria |
| **P3-E1** — Module Classification | Defines module depth classifications that acceptance criteria must match |
| **P3-E2** — Source-of-Truth Matrix | Defines authority boundaries that acceptance must verify |
| **P3-F1** — Reports Contract | Defines reporting acceptance criteria |
| **P3-H1** — Acceptance Checklist | Must use this matrix as the basis for execution-level acceptance tracking |

If a downstream deliverable conflicts with this specification, this specification takes precedence for lane-specific acceptance criteria unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §18](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
