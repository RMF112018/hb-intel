# P3-E14: Project Warranty Module — Master Index

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification — T-File Master Index |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Specification — All T-files governing; **T10 Stage 1–2 implemented (v0.1.83)** |
| **Related contracts** | P3-E1 §3.x, P3-E2 §18, P3-D1, P3-D2, P3-D3, P3-D4, P3-E4 (back-charge advisory), P3-E10 (Closeout seam), P3-E11 (Startup seam), P3-E15 (upstream quality-basis seam), P3-G1, P3-G2, P3-H1 |

---

## T-File Index

This document is the master index for the P3-E14 Project Warranty Module T-file set. T-files govern where they conflict with any earlier prose, including the prior Stage 7.7 placeholder in the README implementation guide.

| T-File | Title | Authored | Key coverage |
|---|---|---|---|
| [T01](P3-E14-T01-Module-Scope-Operating-Model-and-Source-of-Truth-Boundaries.md) | Module Scope, Operating Model, and Source-of-Truth Boundaries | ✓ | Why this module exists; what "baseline-visible" was vs. what P3-E14 adds; operating model (coverage → case → routing → SLA → closure); two-layer architecture doctrine and Layer 2 seam contracts; SoT boundary matrix with Closeout, Startup, Financial, Reports, Work Queue, Health, and future external workspace; explicit Phase 3 out-of-scope list |
| [T02](P3-E14-T02-Record-Families-Identity-and-Authority-Model.md) | Record Families, Identity, and Authority Model | ✓ | 10 record families; full record family hierarchy; identity keying strategy; TypeScript interface definitions with key fields and types for all 10 families; complete enum catalog; role-based authority matrix (write + read); locked authority decisions; shared package consumption contracts (`@hbc/record-form`, `@hbc/saved-views`, `@hbc/activity-timeline`, `@hbc/publish-workflow`, `@hbc/bulk-actions`, `@hbc/acknowledgment`, `@hbc/notification-intelligence`, `@hbc/related-items`, `@hbc/auth`); provisional implementation notes |
| [T03](P3-E14-T03-Coverage-Registry-and-Turnover-Startup-Handoffs.md) | Coverage Registry, Turnover, and Startup Handoffs | ✓ | Three-layer coverage taxonomy (Product / Labor / System) with governed scope label catalog; asset, system, and location anchoring model with TypeScript ref interfaces; coverage item lifecycle and metadata completeness gates; Closeout turnover linkage model with `ICloseoutTurnoverRef`; Startup commissioning linkage model with `IStartupCommissioningRef`; manual registration path; how the registry avoids becoming a document repository; daily expiration sweep; expiration advisory model |
| [T04](P3-E14-T04-Warranty-Case-Lifecycle-States-and-SLA-Escalation-Model.md) | Warranty Case Lifecycle, States, and SLA / Escalation Model | ✓ | 16 canonical states with definitions and next-move ownership; complete state machine diagram and transition table with actor/guard columns; Next Move ownership model (Phase 3 PM-proxy vs. Layer 2 direct); two-tier SLA model (Standard / Expedited) with three windows (Response 5BD/2BD, Repair 30BD/10BD, Verification 5BD/2BD); SLA clock behavior (pause at `AwaitingOwner`); `computeSlaStatus` contract; escalation routing table (triggers, actions, recipients); blocking reason enum; verification gate model with failure path; re-open authority model (PX only) and dual resolution record behavior; duplicate handling rules; full auditability requirements; publication contracts for Activity, Work Queue, and Health spines |
| [T05](P3-E14-T05-Owner-Intake-Communications-and-Future-Workspace-Seams.md) | Owner Intake, Communications, and Future Workspace Seams | ✓ | PM-proxy model and rationale; `OwnerIntakeLog` as first-class record with PM entry field table; `IWarrantyCommunicationEvent` interface with `CommunicationDirection` enum; communication event prompts at 7 lifecycle transitions; Communications tab model; Owner Status Summary block; 16-row plain-language status mapping; denial/not-covered communication template; update cadence advisory (3-day Expedited / 7-day Standard); 5 named Layer 2 seam contracts (owner portal intake, notification, property manager role, owner auth, self-service status); no-duplicate-SoT binding invariant |
| [T06](P3-E14-T06-Subcontractor-Participation-Acknowledgment-and-Resolution-Declarations.md) | Subcontractor Participation, Acknowledgment, and Resolution Declarations | ✓ | PM-proxy model for sub interaction; `SubcontractorEntryChannel` seam discriminator (`PmOnBehalf` / `DirectSubcontractor`); Layer 2 sub participation capability table; `IWarrantyCaseAssignment` interface with supersede model; assignment-without-governed-sub path; `ISubcontractorAcknowledgment` interface with full state machine and transition table; acknowledgment SLA thresholds by tier; scope dispute entry requirements and 4 resolution outcomes; `IWarrantyCaseEvidence` interface with `WarrantyEvidenceType` enum; evidence at case and visit level; completion declaration path; `IWarrantyCaseResolutionRecord` interface with `WarrantyResolutionType` enum; immutability constraint; verification gate before closure; back-charge advisory model with boundary invariant; `@hbc/acknowledgment` and `@hbc/notification-intelligence` integration notes; Work Queue publication on sub events; 7-item external collaboration deferral table; no-duplicate-SoT invariant applied to sub records |
| [T07](P3-E14-T07-UX-Surface-Canvas-Saved-Views-Related-Items-and-Next-Move.md) | UX Surface, Canvas, Saved Views, Related Items, and Next Move | ✓ | UX philosophy (work-first, responsibility-visible, context-connected, complexity-managed, AI-embedded); three primary surfaces (Coverage Registry, Case Workspace, Canvas Tile); Coverage Registry entry state by role; smart empty states; coverage item row anatomy by complexity tier; Case Workspace three-zone layout (Identity/Status Bar, Work Area tabs, Next Move panel); Owner Status Summary block; Communications tab model; Next Move card anatomy (7 fields); full Next Move action catalog by case + acknowledgment state (15 rows); communication cadence advisory as nudge; saved views with 5 Coverage Registry system views and 8 Case Workspace system views; Related Items outbound publications (7 source/target pairs) and inbound consumption (3 modules); turnover/commissioning context inline in Case Workspace; complexity dial by surface and role (Essential/Standard/Expert); permission explainability with show/hide rule; 5 Phase 3 HBI assistive behaviors with governance rules; canvas tile content by tier and role visibility; Phase 3 vs. deferred surface boundary table |
| [T08](P3-E14-T08-Lane-Ownership-PWA-SPFx-Acceptance-and-External-Collaboration-Deferrals.md) | Lane Ownership, PWA / SPFx Acceptance, and External Collaboration Deferrals | ✓ | Lane ownership rationale (why full operational depth must not be forced into SPFx); full PWA capability table; SPFx capability table (14 rows) with "Launch to PWA" escalation rules; SPFx case list content model (Essential tier read-only); deep-link handoff parameter specification (projectId, module, action, recordId, returnTo); 4-reason explanation for why full SPFx case management is not built; 6-item external collaboration deferral list with per-item auth/architectural prerequisite notes; future workspace addition preconditions (7 items with T-file cross-references); Phase 3 acceptance boundary summary table (13 conditions) |
| [T09](P3-E14-T09-Reports-Health-Signals-Work-Queue-Publication-and-Telemetry.md) | Reports, Health Signals, Work Queue Publication, and Telemetry | ✓ | Governing publication principle (operational record → event → derived read model); shared package consumption table with gate stages; Activity Spine adapter: 24 events with trigger, actor, and key payload fields; Health Spine: 6 leading indicators with signal thresholds and color bands, 5 lagging indicators, 5 recurring failure signals, PER health band sanitization (Green/Yellow/Orange/Red); Work Queue: 20 rules (WQ-WAR-01 through WQ-WAR-20) with recipient, priority, and dismissibility; Reports: 8 designated reports (posture summary, SLA compliance, coverage expiration, owner experience risk, sub warranty burden, denial trend, back-charge advisory log, verification quality); subcontractor burden indicators (7 computed fields); owner experience risk indicators (4); denial/not-covered trend dimensions; aging and SLA metric definitions; telemetry: surface engagement (4 events), case management workflow (10 events), coverage registry (4 events), communications/intake (3 events), mold-breaker UX quality (9 events with measurement rationale); telemetry instrumentation rules (no PII, non-blocking, AI-tagged); publication boundary enforcement rules |
| [T10](P3-E14-T10-Implementation-Guide-and-Acceptance-Criteria.md) | Implementation Guide and Acceptance Criteria | ✓ | Pre-implementation hard no-go conditions (5 hard blockers with verification requirements); deferrable integrations table with maximum deferral stages; shared-first requirement with 10-row enforcement table; package enhancement dependencies (5 items); 5-stage implementation sequence (Stage 1: record model; Stage 2: state machine; Stage 3: shared package integration; Stage 3B: secondary integration; Stage 4: UX surfaces and lanes; Stage 4B: secondary UI; Stage 5: reports and telemetry) with gate checks per stage; 46 acceptance criteria (AC-WAR-01 through AC-WAR-46) across record model, state machine, shared packages, PWA surfaces, SPFx surfaces, reports/telemetry, boundary, and mold-breaker UX; 7 no-go criteria; phased rollout guidance (Alpha / Limited Beta / GA); validation checklist with 11 evidence artifacts; cross-reference update checklist (8 pending documents) |

---

## Module Overview

The Project Warranty Module is a **first-class Project Hub operating surface** for managing warranty coverage, tracking active warranty cases, routing responsibility to the correct subcontractor or manufacturer, aging open issues against SLA commitments, scheduling and verifying corrective visits, and closing cases with documented resolution evidence.

It replaces the email-thread-and-spreadsheet pattern that today produces no canonical case state, no SLA visibility, no systematic responsibility routing, and no structured evidence chain. When Phase 3 Warranty is live, a PM can answer in seconds: who is responsible for a given open issue, what the SLA posture is, what attempts have been made, what evidence has been collected, and whether a back-charge advisory is warranted.

---

## Two-Layer Architecture

The Warranty domain operates on a deliberate two-layer model. Both layers share one canonical record set. Layer 2 does not fork the data model.

| Layer | Scope | Phase | Key actors |
|---|---|---|---|
| **Layer 1 — Project Hub internal** | PM-driven coverage registry; case lifecycle; responsibility routing; SLA tracking; closure verification | **Phase 3** | PM, PX, APM/PA, Warranty Manager |
| **Layer 2 — External collaborative workspace** | Owner-facing intake; direct subcontractor participation; guided resolution workflow; external SLA visibility | **Future (deferred)** | Owner, Homeowner/Tenant, Subcontractor, PM |

**Canonical record invariant:** Layer 2 must write to the Phase 3 record model — not fork it. The Phase 3 interfaces include explicit Layer 2 seam fields (`sourceChannel`, `enteredBy`, `externalReferenceId`) that allow Layer 2 to write into the same records without a schema change.

---

## Project Hub Phase 3 Boundary

Phase 3 delivers Layer 1 in full:

- **Coverage registry:** Typed `WarrantyCoverageItem` records with governed layer taxonomy (Product / Labor / System), asset/system/location anchoring, Closeout turnover linkage (`ICloseoutTurnoverRef`), Startup commissioning linkage (`IStartupCommissioningRef`), metadata completeness gates, and daily expiration sweep.
- **Case lifecycle:** 16-state `WarrantyCase` model from `Open` through `Closed` / terminal states, including coverage decision states (`NotCovered`, `Denied`, `Duplicate`), coordination states (`AwaitingSubcontractor`, `AwaitingOwner`, `Scheduled`, `InProgress`, `Corrected`, `PendingVerification`, `Verified`), and exceptional states (`Reopened`, `Voided`).
- **Subcontractor routing:** `WarrantyCaseAssignment` with sequential history; `SubcontractorAcknowledgment` with scope-acceptance/dispute model; PM-on-behalf entry with Layer 2 `enteredBy` seam.
- **SLA and escalation:** Two-tier SLA model (Standard / Expedited) with three windows (Response, Repair, Verification); `computeSlaStatus` function; escalation routing via `@hbc/notification-intelligence`.
- **Visit and evidence:** `WarrantyVisit` (Diagnosis / Repair / Verification / Reinspection); `WarrantyCaseEvidence` (Photo / Video / InspectionNote / Document / LinkedArtifact).
- **Immutable resolution:** `WarrantyCaseResolutionRecord` with `ResolutionOutcome` enum; back-charge advisory published to Financial.
- **Owner intake log:** `OwnerIntakeLog` (PM-entered); `IWarrantyCommunicationEvent` timeline; plain-language status mapping; `sourceChannel` seam for Layer 2.
- **Spine publication:** Activity (24 events), Health (leading + lagging + failure signals), Work Queue (20 rules), and Related Items per T09.
- **Canvas tile and saved views:** Per T07.
- **Lane model:** PWA full depth; SPFx read-only + Launch-to-PWA per T08.

---

## Record Families Summary

| Record family | Interface | SoT owner | Notes |
|---|---|---|---|
| `WarrantyCoverageItem` | `IWarrantyCoverageItem` | Warranty module | 3-layer taxonomy; anchored; lifecycle: Draft → Active → Expired / Voided |
| `WarrantyCase` | `IWarrantyCase` | Warranty module | 16-state lifecycle; keyed by `projectId + caseNumber` |
| `WarrantyCoverageDecision` | `IWarrantyCoverageDecision` | Warranty module | 1 active per case; supersede-not-mutate pattern |
| `WarrantyCaseAssignment` | `IWarrantyCaseAssignment` | Warranty module | Sequential; only one active; history preserved |
| `WarrantyVisit` | `IWarrantyVisit` | Warranty module | 4 types (Diagnosis / Repair / Verification / Reinspection); linked to case and evidence |
| `WarrantyCaseEvidence` | `IWarrantyCaseEvidence` | Warranty module | 8 types; case- or visit-scoped; `enteredBy` seam for Layer 2 sub direct upload |
| `SubcontractorAcknowledgment` | `ISubcontractorAcknowledgment` | Warranty module | 1 per assignment; scope-acceptance/dispute model; Phase 3 PM-on-behalf |
| `OwnerIntakeLog` | `IOwnerIntakeLog` | Warranty module | PM-entered Phase 3; `sourceChannel` seam for Layer 2 |
| `WarrantyCommunicationEvent` | `IWarrantyCommunicationEvent` | Warranty module | PM-maintained communications timeline; direction-aware; cadence advisory integration |
| `WarrantyCaseResolutionRecord` | `IWarrantyCaseResolutionRecord` | Warranty module | Immutable from creation; 4-outcome enum; back-charge advisory |
| `WarrantyCoverageExpiration` | — | Warranty module | System-generated; read-only; immutable |

---

## Deferred Items (Layer 2 / Future)

| Item | Governing seam |
|---|---|
| Owner-facing intake portal | T05 §3, `sourceChannel` field on `IOwnerIntakeLog` and `IWarrantyCase` |
| Direct subcontractor access | T02 §7.1, `enteredBy` field on `ISubcontractorAcknowledgment` |
| External SLA reporting to owners | T08 §4 |
| Shared PM + owner + sub workspace | T05 §3.5, T08 §4.3 |
| Owner notification / outbound comms | T05 §3.4 |
| `EXT_OWNER` role in `@hbc/auth` | T02 §6.1 |
| `EXT_SUBCONTRACTOR` role in `@hbc/auth` | T02 §6.1 |

---

## Cross-Reference Map

| Concern | Governing source |
|---|---|
| Module classification | P3-E1 §3.8 |
| SoT and action boundary | P3-E2 §18 |
| Three-tier authority model | P3-A2 |
| Activity publication | P3-D1 + T09 §3 |
| Health publication | P3-D2 + T09 §4 |
| Work Queue publication | P3-D3 + T09 §5 |
| Related Items publication | P3-D4 + T07 §7 |
| Lane capability | P3-G1 + T08 §2 |
| Cross-lane escalation | P3-G2 + T08 §3 |
| Acceptance evidence | P3-H1 + T10 §4 (AC-WAR-01–AC-WAR-46) |
| Financial back-charge advisory | P3-E4 + T06 §7 |
| Closeout turnover seam | P3-E10 + T03 §5 |
| Startup commissioning seam | P3-E11 + T03 §6 |
| Upstream quality-basis seam | P3-E15 + T03/T06/T09 — Warranty reads accepted quality basis, approved deviations, evidence lineage, and responsible-organization quality history without mutating QC records |

---

## Implementation Read Order

1. **T01** — operating model, two-layer doctrine, and SoT boundary positions.
2. **T02** — implement record families, interfaces, enums, and authority matrix.
3. **T03** — implement coverage registry, layer taxonomy, anchoring, and turnover/startup seams.
4. **T04** — implement case lifecycle state machine, SLA model, and escalation routing.
5. **T05** — implement owner intake log; confirm Layer 2 seam field design.
6. **T06** — implement subcontractor acknowledgment, scope-dispute paths, and resolution declarations.
7. **T07** — implement UX surfaces, canvas tile, saved views, and related-items publications.
8. **T08** — wire lane depth, SPFx escalation, and confirm external collaboration defer list.
9. **T09** — implement Health spine adapter, Work Queue rules, Reports integration, and telemetry.
10. **T10** — verify blockers, run acceptance gates, and complete cross-reference update checklist.

---

*[T01 →](P3-E14-T01-Module-Scope-Operating-Model-and-Source-of-Truth-Boundaries.md)*
