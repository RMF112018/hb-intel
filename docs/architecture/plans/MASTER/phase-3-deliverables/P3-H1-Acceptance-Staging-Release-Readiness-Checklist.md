# P3-H1: Acceptance, Staging, and Release-Readiness Checklist

| Field | Value |
|---|---|
| **Doc ID** | P3-H1 |
| **Phase** | Phase 3 |
| **Workstream** | H — Validation, staging, and acceptance |
| **Document Type** | Active Reference |
| **Owner** | Architecture + Project Hub platform owner |
| **Update Authority** | Architecture lead; updated as implementation progresses and evidence is collected |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-G3](P3-G3-Lane-Specific-Acceptance-Matrix.md); all Phase 3 deliverables (P3-A1 through P3-G3) |

---

## Checklist Statement

This is the **execution-ready acceptance checklist** for Phase 3 Project Hub. It operationalizes every acceptance gate from §18.1–§18.7 into trackable checklist items, defines staging scenarios for validation, establishes release-readiness criteria, and incorporates the explicit Phase 3 defer list from §22.

This is an **Active Reference** — a living document updated as implementation progresses and evidence is collected. Unlike the locked contracts and specifications in Workstreams A–G, this checklist evolves during Phase 3 execution.

Phase 3 is complete only when all §18 gates pass with evidence (Phase 3 plan §18). P3-G3 provides the lane-specific acceptance criteria that this checklist tracks.

---

## Scope

### This checklist governs

- Acceptance gate tracking (pass/fail status per criterion)
- Staging scenario definitions and execution tracking
- Release-readiness criteria
- Phase 3 defer list (explicit future-scope items)
- Evidence collection tracking

### This checklist does NOT govern

- Gate definitions — see [Phase 3 Plan §18](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
- Lane-specific acceptance criteria — see [P3-G3](P3-G3-Lane-Specific-Acceptance-Matrix.md)
- Individual deliverable content — see respective deliverables

---

## 1. Acceptance Gate Checklist — Summary

| Gate | §18 ref | Items | Status | Owner |
|---|---|---|---|---|
| Cross-lane contracts | §18.1 | 5 | Not Started | Architecture + Experience / Shell |
| Project activation | §18.2 | 3 | Not Started | Platform / Core Services |
| Home/canvas | §18.3 | 8 | Not Started | Experience / Shell + Project Hub |
| Shared spines | §18.4 | 6 | Not Started | Platform / Core Services + Project Hub |
| Core modules | §18.5 | 27 | Not Started | Architecture + Project Hub |
| Reporting | §18.6 | 10 | Not Started | Project Hub |
| Validation | §18.7 | 8 | Not Started | Architecture + Experience / Shell |
| **Total** | | **67** | | |

---

## 2. Cross-Lane Contract Checklist (§18.1)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 2.1 | Same canonical project identity — PWA resolves from route, SPFx from siteUrl | Not Started | | P3-B1 §2, P3-G3 §3.1 |
| 2.2 | Same membership validation — P3-A2 rules enforced in both lanes | Not Started | | P3-A2 §6, P3-G3 §3.2 |
| 2.3 | Smart project switching — PWA in-app, SPFx host-aware fallbacks | Not Started | | P3-B1 §2, P3-G3 §3.3 |
| 2.4 | Cross-lane handoff identity — projectId preserved during SPFx↔PWA | Not Started | | P3-G2 §5, P3-G3 §3.4 |
| 2.5 | No context loss during handoff — deep-link handler processes arrival | Not Started | | P3-B1 §6.1, P3-G3 §3.5 |

---

## 3. Project Activation Checklist (§18.2)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 3.1 | Valid activation transaction — setup/handoff creates valid project record | Not Started | | P3-A1, P3-G3 §4.1 |
| 3.2 | Routeable context — activated project has valid route in PWA and site in SPFx | Not Started | | P3-A1, P3-G3 §4.2 |
| 3.3 | No partial activation — incomplete activation rejected, no orphaned records | Not Started | | P3-A1, P3-G3 §4.3 |

---

## 4. Home/Canvas Checklist (§18.3)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 4.1 | Canvas-first home — `@hbc/project-canvas` renders in both lanes | Not Started | | P3-C1, P3-C3, P3-G3 §5.1 |
| 4.2 | Mandatory operational core — all 5 surfaces present in both lanes | Not Started | | P3-C2, P3-G3 §5.2 |
| 4.3 | Governance tiers — locked/role-default/optional enforced | Not Started | | P3-C1, P3-G3 §5.3 |
| 4.4 | Personalization — governed adaptive composition works in both lanes | Not Started | | P3-C3, P3-G3 §5.4 |
| 4.5 | Persistence — PWA IndexedDB+server; SPFx localStorage+SharePoint | Not Started | | P3-C3 §6, P3-G3 §5.5 |
| 4.6 | Reset to role-default — works in both lanes; mandatory tiles preserved | Not Started | | P3-C1, P3-G3 §5.6 |
| 4.7 | Complexity tiers — essential/standard/expert render per preference | Not Started | | P3-C1, P3-G3 §5.7 |
| 4.8 | Role-based visibility — tiles hidden per P3-C2 §8 (no empty placeholders) | Not Started | | P3-C2 §8, P3-G3 §5.8 |

---

## 5. Shared Spine Checklist (§18.4)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 5.1 | Health spine — PWA full detail + explainability; SPFx shared component | Not Started | | P3-D2, P3-G3 §6.1 |
| 5.2 | Activity spine — PWA full timeline; SPFx tile view | Not Started | | P3-D1, P3-G3 §6.2 |
| 5.3 | Work Queue spine — PWA full feed+panel+team; SPFx tile+panel | Not Started | | P3-D3, P3-G3 §6.3 |
| 5.4 | Related Items spine — PWA full panel+AI; SPFx compact panel | Not Started | | P3-D4, P3-G3 §6.4 |
| 5.5 | Spine data consistency — same data for same projectId in both lanes | Not Started | | P3-A3, P3-G3 §6.5 |
| 5.6 | Module publications flowing — all adapters registered and publishing | Not Started | | P3-A3 §7, P3-G3 §6.6 |

---

## 6. Core Module Checklist (§18.5)

### 6.1 Financial

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.1.1 | Budget import (CSV) — PWA Required, SPFx Broad | Not Started | | P3-E1, P3-G3 §7.1 |
| 6.1.2 | Financial Summary editing — Required both lanes | Not Started | | P3-E2 §3 |
| 6.1.3 | GC/GR model — Required both lanes | Not Started | | P3-E2 §3 |
| 6.1.4 | Cash Flow model — Required both lanes | Not Started | | P3-E2 §3 |
| 6.1.5 | Exposure tracking — Required both lanes | Not Started | | P3-E2 §3 |
| 6.1.6 | Buyout support — Required both lanes (within Financial domain) | Not Started | | P3-E1 §4.1 |
| 6.1.7 | Spreadsheet replacement notes included | Not Started | | P3-E3 §2 |

### 6.2 Schedule

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.2.1 | Milestone tracking — Required both lanes | Not Started | | P3-E1, P3-G3 §7.2 |
| 6.2.2 | Forecast overrides — Required both lanes (governed w/ provenance) | Not Started | | P3-E2 §4, §12.2 |
| 6.2.3 | File ingestion — PWA Required, SPFx Launch-to-PWA | Not Started | | P3-G1 §4.2, P3-G2 §8.2 |
| 6.2.4 | Upload history/restore — PWA Required, SPFx Launch-to-PWA | Not Started | | P3-G1 §4.2, P3-G2 §8.2 |

### 6.3 Constraints

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.3.1 | Constraint CRUD — Required both lanes | Not Started | | P3-E1, P3-G3 §7.3 |
| 6.3.2 | Change Tracking — Required both lanes | Not Started | | P3-E2 §5 |
| 6.3.3 | Delay Log with quantified impact — Required both lanes | Not Started | | P3-E2 §5 |
| 6.3.4 | Spreadsheet replacement notes included | Not Started | | P3-E3 §4 |

### 6.4 Permits

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.4.1 | Permit log management — Required both lanes | Not Started | | P3-E1, P3-G3 §7.4 |
| 6.4.2 | Linked inspections — Required both lanes | Not Started | | P3-E2 §6 |
| 6.4.3 | Expiration tracking — Required both lanes | Not Started | | P3-E2 §6 |

### 6.5 Safety

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.5.1 | Safety plan state — Required both lanes | Not Started | | P3-E1, P3-G3 §7.5 |
| 6.5.2 | Orientations/acknowledgments — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.3 | Checklists/inspection aggregation — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.4 | JHA log records — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.5 | Incident reports with notifications — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.6 | SSSP replacement notes included | Not Started | | P3-E3 §6 |
| 6.5.7 | Future toolbox-talk note documented | Not Started | | P3-E3 §6.4 |

### 6.6 Source-of-Truth Compliance

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.6.1 | Modules respect P3-E2 authority boundaries | Not Started | | P3-E2 |
| 6.6.2 | All modules publish to all 4 spines per P3-A3 §7 | Not Started | | P3-A3 §7 |

---

## 7. Reporting Checklist (§18.6)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 7.1 | PX Review family live — PWA full lifecycle, SPFx generate+approve | Not Started | | P3-F1, P3-G3 §8.1 |
| 7.2 | Owner Report family live — PWA full lifecycle, SPFx generate+release | Not Started | | P3-F1, P3-G3 §8.2 |
| 7.3 | Draft refresh — full handling PWA, refresh supported SPFx | Not Started | | P3-F1 §4, P3-G3 §8.3 |
| 7.4 | Staleness warning — shown before export in both lanes | Not Started | | P3-F1 §5, P3-G3 §8.4 |
| 7.5 | Queued generation — asynchronous pipeline works | Not Started | | P3-F1 §6, P3-G3 §8.5 |
| 7.6 | Run-ledger tracking — PWA full browsing, SPFx Launch-to-PWA | Not Started | | P3-F1 §7, P3-G3 §8.6 |
| 7.7 | PX Review approval gate enforced | Not Started | | P3-F1 §8.1, P3-G3 §8.7 |
| 7.8 | Owner Report non-gated release works | Not Started | | P3-F1 §8.2, P3-G3 §8.8 |
| 7.9 | PM narrative overrides with provenance | Not Started | | P3-F1 §11, P3-G3 §8.9 |
| 7.10 | Export produces PDF stored in SharePoint | Not Started | | P3-F1 §9, P3-G3 §8.10 |

---

## 8. Validation Checklist (§18.7)

| # | Scenario | Status | Evidence | Notes |
|---|---|---|---|---|
| 8.1 | Activation flow — full end-to-end in both lanes | Not Started | | §9.1 staging scenario |
| 8.2 | Project switching — PWA in-app, SPFx host-aware | Not Started | | §9.2 staging scenario |
| 8.3 | Stale draft handling — warning + refresh flow | Not Started | | §9.3 staging scenario |
| 8.4 | Cross-lane launch SPFx→PWA — deep link round-trip | Not Started | | §9.4 staging scenario |
| 8.5 | Cross-lane launch PWA→SPFx — siteUrl navigation | Not Started | | §9.5 staging scenario |
| 8.6 | Module spine publication — all modules contributing | Not Started | | §9.6 staging scenario |
| 8.7 | Canvas governance — edit-mode enforcement | Not Started | | §9.7 staging scenario |
| 8.8 | Report lifecycle — PX Review and Owner Report full cycle | Not Started | | §9.8 staging scenario |

---

## 9. Staging Scenario Definitions

### 9.1 Activation flow

| Aspect | Definition |
|---|---|
| **Preconditions** | Setup/handoff seam available; project data prepared |
| **Steps** | 1. Initiate project activation. 2. Verify registry entry created (P3-A1). 3. Navigate to project in PWA. 4. Navigate to project in SPFx. |
| **Expected outcome** | Valid project record with `projectId`, `siteUrl`, status `active`; routeable in both lanes |
| **Pass criteria** | Both lanes resolve the project; membership rules applied; no partial activation artifacts |

### 9.2 Project switching

| Aspect | Definition |
|---|---|
| **Preconditions** | Two or more activated projects accessible to the user |
| **Steps** | 1. Open Project A in PWA. 2. Switch to Project B via context header. 3. Verify context updates. 4. In SPFx, navigate to Project B site. |
| **Expected outcome** | PWA switches cleanly; return-memory preserved; SPFx resolves correct project |
| **Pass criteria** | No stale context; correct projectId after switch; module state reflects new project |

### 9.3 Stale draft handling

| Aspect | Definition |
|---|---|
| **Preconditions** | Report draft exists; draft age exceeds staleness threshold |
| **Steps** | 1. Open report draft. 2. Observe staleness warning. 3. Attempt export — verify warning gate. 4. Refresh draft. 5. Verify refreshed timestamp. |
| **Expected outcome** | Staleness cue visible; export gated until confirmed; refresh pulls latest data |
| **Pass criteria** | Warning shown in both lanes; export blocked on stale draft; refresh works |

### 9.4 Cross-lane launch SPFx→PWA

| Aspect | Definition |
|---|---|
| **Preconditions** | User in SPFx project site; interaction requires PWA escalation |
| **Steps** | 1. Trigger launch-to-PWA action (e.g., Schedule file ingestion). 2. Verify deep-link URL construction. 3. Land in PWA. 4. Verify project identity preserved. |
| **Expected outcome** | PWA opens with correct project, module, and context |
| **Pass criteria** | projectId matches; module page loads; no identity loss; returnTo parameter present if applicable |

### 9.5 Cross-lane launch PWA→SPFx

| Aspect | Definition |
|---|---|
| **Preconditions** | User in PWA; wants SharePoint context for the project |
| **Steps** | 1. Click "Open in SharePoint" or equivalent. 2. Verify siteUrl from registry used. 3. SPFx site opens in new tab. |
| **Expected outcome** | SPFx project site opens with correct project |
| **Pass criteria** | Correct siteUrl used; project resolves in SPFx; new tab opens |

### 9.6 Module spine publication

| Aspect | Definition |
|---|---|
| **Preconditions** | At least one module with data (e.g., Financial with budget imported) |
| **Steps** | 1. Perform module action (e.g., create constraint). 2. Verify Activity spine receives event. 3. Verify Health spine receives metric. 4. Verify Work Queue item created if applicable. 5. Verify Related Items relationship registered if applicable. |
| **Expected outcome** | Module publications flow to all 4 spines per P3-A3 §7 |
| **Pass criteria** | Spine data includes module contributions; canvas tiles reflect changes |

### 9.7 Canvas governance enforcement

| Aspect | Definition |
|---|---|
| **Preconditions** | Canvas with mandatory and optional tiles |
| **Steps** | 1. Enter edit mode. 2. Attempt to remove mandatory locked tile — verify blocked. 3. Attempt to move locked tile — verify blocked. 4. Add optional tile from catalog — verify success. 5. Remove optional tile — verify success. 6. Reset canvas — verify role-default restored with mandatory tiles. |
| **Expected outcome** | Governance tiers enforced; mandatory/locked tiles protected; optional tiles manageable |
| **Pass criteria** | Same behavior in both lanes; no governance bypass |

### 9.8 Report lifecycle

| Aspect | Definition |
|---|---|
| **Preconditions** | Module data available for report assembly; PX Review and Owner Report definitions registered |
| **Steps** | 1. Refresh PX Review draft. 2. Add PM narrative override. 3. Confirm and generate. 4. Verify run-ledger entry. 5. Approve PX Review. 6. Release. 7. Repeat for Owner Report (skip approval). |
| **Expected outcome** | Full lifecycle works for both families; approval gated for PX Review; non-gated for Owner Report |
| **Pass criteria** | PDF artifacts produced; run-ledger tracks all runs; approval enforcement correct |

---

## 10. Release-Readiness Criteria

Phase 3 is release-ready when:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 10.1 | All §18.1–§18.7 gate items pass (§2–§8 above) | Not Started | Gate checklist complete |
| 10.2 | All 8 staging scenarios pass (§9) | Not Started | Staging scenario results |
| 10.3 | Defer list is explicit and documented (§11) | Not Started | §11 reviewed and confirmed |
| 10.4 | No hidden future scope inside Phase 3 acceptance | Not Started | Defer list review |
| 10.5 | Documentation current — all 19 deliverables reflect implementation state | Not Started | Deliverable review |
| 10.6 | Cross-lane evidence complete — shared, PWA-specific, and SPFx-specific (P3-G3 §10) | Not Started | Evidence matrix filled |
| 10.7 | Module source-of-truth boundaries respected (P3-E2) | Not Started | Authority boundary verification |
| 10.8 | Spreadsheet/document replacement notes aligned with implementation (P3-E3) | Not Started | Replacement verification |

---

## 11. Phase 3 Defer List

The following items are **explicitly deferred** from Phase 3 and MUST NOT be silently treated as committed Phase 3 scope (Phase 3 plan §22):

| # | Deferred item | Rationale | Target |
|---|---|---|---|
| 11.1 | Direct Procore API replacement of interim CSV budget upload | Requires Procore API integration work beyond Phase 3 scope | Future phase |
| 11.2 | Smart toolbox-talk topic generation linked to high-risk schedule activities | Requires AI/schedule correlation intelligence not yet built | Future phase |
| 11.3 | Full CPM authoring inside Project Hub | Project Hub is an operational schedule surface, not a CPM tool | Out of scope |
| 11.4 | Full ERP/accounting behavior inside Project Hub | Project Hub is an operational financial surface, not an ERP | Out of scope |
| 11.5 | Full claims/legal/contract-admin behavior inside Constraints | Exceeds operational constraints ledger scope | Future phase |
| 11.6 | Full jurisdiction-facing permitting package/submission management | Exceeds operational permit ledger scope | Future phase |
| 11.7 | Deeper field-first execution depth for Quality Control | QC is baseline-visible lifecycle in Phase 3 (P3-E1 §3.7) | Phase 6 |
| 11.8 | Deeper field-first execution depth for Warranty | Warranty is baseline-visible lifecycle in Phase 3 (P3-E1 §3.8) | Phase 6 |
| 11.9 | Any field-first expansion exceeding baseline-visible lifecycle for QC/Warranty | Must not leak into Phase 3 acceptance | Future phase |

---

## 12. Deliverable Completion Status

| Doc ID | Title | Workstream | Status |
|---|---|---|---|
| P3-A1 | Project Registry and Activation Contract | A | Contract |
| P3-A2 | Membership / Role Authority Contract | A | Contract |
| P3-A3 | Shared Spine Publication Contract Set | A | Contract |
| P3-B1 | Project Context Continuity and Switching Contract | B | Contract |
| P3-C1 | Project Canvas Governance Note | C | Note |
| P3-C2 | Mandatory Core Tile Family Definition | C | Specification |
| P3-C3 | Lane-Aware Home/Canvas Capability Matrix | C | Specification |
| P3-D1 | Project Activity Contract | D | Contract |
| P3-D2 | Project Health Contract | D | Contract |
| P3-D3 | Project Work Queue Contract | D | Contract |
| P3-D4 | Related-Items Registry / Presentation Contract | D | Contract |
| P3-E1 | Phase 3 Module Classification Matrix | E | Specification |
| P3-E2 | Module Source-of-Truth / Action-Boundary Matrix | E | Specification |
| P3-E3 | Spreadsheet/Document Replacement Reference Note Set | E | Note |
| P3-F1 | Reports Workspace / Definition / Run / Release Contract Package | F | Contract |
| P3-G1 | Lane Capability Matrix (PWA / SPFx) | G | Specification |
| P3-G2 | Cross-Lane Navigation and Handoff Map | G | Specification |
| P3-G3 | Lane-Specific Acceptance Matrix | G | Specification |
| **P3-H1** | **Acceptance, Staging, and Release-Readiness Checklist** | **H** | **Active Reference** |

**Total:** 19 deliverables. 18 locked (Contract/Specification/Note). 1 Active Reference (this document).

---

## 13. Evidence Collection Log

_This section is populated during Phase 3 implementation as evidence is collected._

| Date | Gate | Criterion # | Evidence artifact | Collector |
|---|---|---|---|---|
| — | — | — | — | — |

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
