# P3-E14-T10 — Implementation Guide and Acceptance Criteria

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T10 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T10 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Pre-Implementation: Hard No-Go Conditions

Do not write any Warranty module application code inside `@hbc/features-project-hub` until the hard blocker shared packages below are confirmed available and callable. These dependencies are not workaround-able — local substitutes violate architecture invariants and create extraction debt.

| Shared package | Blocker level | Verification required before Stage 3 |
|---|---|---|
| `@hbc/my-work-feed` | **Hard blocker** | Work Queue item creation API accepts Warranty source module and all rule IDs in T09 §5.2 |
| `@hbc/activity-timeline` (SF28) | **Hard blocker** | Activity Spine publication accepts Warranty event type keys defined in T09 §3.2 |
| P3-D2 Health Spine publication contract | **Hard blocker** | Health Spine adapter accepts all Warranty metric keys in T09 §4 and exposes them to Project Health Pulse and canvas tile consumers |
| `@hbc/record-form` (SF23) | **Hard blocker** | Module adapter interface accepts Warranty coverage item and case entity shapes |
| `@hbc/saved-views` (SF26) | **Hard blocker** | Module mapper interface accepts Warranty system view definitions per T09 §2 (carried from T07 §6.5) |

**If any hard blocker is unavailable:** raise the blocker with the shared package owner; do not work around it with local storage, local counters, or local event buses. Spine publication and form adapter contracts are enforced at the API boundary — local substitutes create hidden coupling that cannot be cleanly extracted.

High-value integrations that are required but do not block core Warranty implementation:

| Integration | Impact if deferred | Deferral maximum |
|---|---|---|
| `@hbc/notification-intelligence` | SLA escalation emails not dispatched; Work Queue is the fallback | May defer to Stage 3B; do not defer past Stage 4 |
| `@hbc/related-items` (P3-D4) | Related Items panel empty; cross-module linkage not visible | May defer to Stage 4; do not defer past Stage 5 |
| `@hbc/acknowledgment` | PM-to-PM Work Queue nudge pattern is the interim; no hard block | May defer to Stage 3B with documented interim |
| `@hbc/bulk-actions` (SF27) | Bulk operations unavailable | May defer to Stage 4B |
| `@hbc/publish-workflow` (SF25) | Resolution record publication lifecycle limited | May defer to Stage 5 |
| `@hbc/field-annotations` | Annotation on warranty fields unavailable for PER | May defer to Stage 4B |

---

## 2. Shared-First Requirement

Before writing any feature-local logic, confirm whether an existing shared package already owns the concern:

| Concern | Must use | Do not reinvent |
|---|---|---|
| List with filter + sort + column selection | `@hbc/saved-views` (SF26) | Local list component with filter state |
| Coverage item / case create or edit forms | `@hbc/record-form` (SF23) | Local modal or drawer with inline validation |
| Activity event emission | `@hbc/activity-timeline` (SF28) adapter | Local audit log writes |
| Work Queue item routing | `@hbc/my-work-feed` | Local timer or polling scheduler |
| Escalation notification dispatch | `@hbc/notification-intelligence` | Local email send or ad-hoc notification |
| Related Items publication | `@hbc/related-items` (P3-D4) | Local "linked records" list component |
| Reusable status badge | `@hbc/ui-kit` status badge component | Feature-local badge or inline style |
| Reusable SLA indicator | `@hbc/ui-kit` (if available) | Feature-local countdown component |
| File upload (evidence) | Platform file attachment primitive | Local file input without platform storage |

The package-first rule is not optional: `@hbc/ui-kit` owns reusable visual primitives, and `@hbc/features-project-hub` composes them. Creating duplicates in the feature package violates the `03-package-boundaries` invariant.

### 2.1 Package enhancement requirement

If a shared package does not yet support a capability the Warranty module requires, the enhancement must be made to the shared package — not worked around locally. Identified enhancement dependencies:

| Package | Required enhancement | Impact |
|---|---|---|
| `@hbc/ui-kit` | SLA time-remaining indicator component (colored, relative time, overdue state) | Needed for Case Workspace status bar and Work Queue items |
| `@hbc/ui-kit` | Next Move card component (owner badge, action label, due-date, urgency, blocking reason) | Needed for Case Workspace Zone C (T07 §4.1) |
| `@hbc/my-work-feed` | Support for `Advisory` priority tier (below `Normal`) | Needed for WQ-WAR-15, WQ-WAR-18, WQ-WAR-20 |
| `@hbc/activity-timeline` | Module-scoped adapter scaffolding (if not already available) | Needed for T09 §3 event emission |
| `@hbc/acknowledgment` | Phase 3 readiness verification (provisional at authoring time; verify before Stage 3B) | Needed for subcontractor acknowledgment workflow (T06 §8.1) |

Enhancement work on shared packages must be coordinated with the shared-package owner, tracked in their work queue, and not blocked by the Warranty module build timeline. Where an enhancement is not available, use the documented interim pattern (§1 above) and flag it as pre-production-ready.

---

## 3. Implementation Sequence

Implement in the order below. Each stage has a gate check before proceeding. Do not skip stages. Spine publication requirements are bundled per stage — do not defer them to a final spine phase.

### Stage 1 — Record Model and Identity Foundation

**Implements:** All record interfaces, enum definitions, identity model, authority matrix, and Layer 2 seam fields.

- `IWarrantyCoverageItem` + `WarrantyCoverageType`, `WarrantyCoverageStatus`, `WarrantyCoverageScope` enums (T02 §4.1, T03 §1)
- `IWarrantyCase` + `WarrantyCaseStatus` enum (16 values — T04 §2.1, T02 §4.2)
- `IWarrantyCoverageDecision` + `WarrantyCoverageDecisionOutcome` enum (T02)
- `IWarrantyCaseAssignment` with supersede model (T06 §2.1)
- `ISubcontractorAcknowledgment` + `SubcontractorAcknowledgmentStatus`, `AcknowledgmentDisputeOutcome`, `SubcontractorEntryChannel` enums (T06 §3.1)
- `IWarrantyVisit` + `WarrantyVisitType`, `WarrantyVisitStatus` enums (T02)
- `IWarrantyCaseEvidence` + `WarrantyEvidenceType` enum (T06 §5.1)
- `IOwnerIntakeLog` + `OwnerReportChannel`, `OwnerIntakeSourceChannel` enums (T05 §1.1)
- `IWarrantyCommunicationEvent` + `CommunicationDirection` enum (T05 §3.2)
- `IWarrantyCaseResolutionRecord` + `WarrantyResolutionType` enum (T06 §6.2)
- `ICloseoutTurnoverRef`, `IStartupCommissioningRef` (T03 §5.1, T03 §6.1)
- `IWarrantyLocationRef`, `IWarrantySystemRef`, `IWarrantyAssetRef` (T03 §2)
- Role-based authority matrix functions (T02 §5)
- Layer 2 seam fields confirmed present: `sourceChannel`, `enteredBy`, `externalReferenceId` (T02 §6.1, T05 §5, T06 §1.2)

**Stage 1 gate check:**
- All interfaces compile with no TypeScript errors
- Enum values match exactly with T02, T04, T05, T06 canonical definitions
- Authority matrix function correctly gates all 8 roles × 9 actions per T02 §5
- Layer 2 seam fields are present, typed, and not marked required (they are optional discriminators)
- `IWarrantyCaseResolutionRecord` cannot be mutated after creation (enforced at type layer)
- No UI code, no API handlers, no publication adapters at this stage

### Stage 2 — State Machine and Business Rules

**Implements:** All lifecycle state machines, SLA computation functions, and escalation threshold evaluation.

- Coverage item lifecycle transitions: `Draft → Active → Expired / Voided` (T03 §3)
- Warranty case state machine: all 16 states and 30+ transition rules (T04 §2, §3)
- Subcontractor acknowledgment state machine (T06 §3.2)
- SLA tier assignment at case creation (T04 §3.2)
- `computeSlaStatus` function with business-day computation (T04 §4)
- `businessDaysBetween` utility — verify this exists in a shared utility package; if not, implement in `@hbc/date-utils` or equivalent shared location (do not implement in feature package)
- SLA pause behavior at `AwaitingOwner` entry/exit (T04 §4.3)
- Escalation threshold evaluation for acknowledgment and SLA rules (T09 §5.2)
- Daily coverage expiration sweep (T03 §4): `warrantyEndDate < today → Expired`; advisory window 30d; open-case-at-expiration behavior (do not auto-close cases)

**Stage 2 gate check:**
- All 16 case state transitions implemented and unit-tested against T04 §3 transition table
- Invalid transitions return HTTP 409 or equivalent domain error
- `computeSlaStatus` produces correct deadline for Standard and Expedited tiers across all three windows (Response, Repair, Verification)
- SLA clock pauses correctly at `AwaitingOwner` entry and resumes at exit; elapsed pause time is not counted against the repair window
- Coverage expiration sweep correctly transitions items; open cases against expired items remain open with `warranty.signal.coverageExpiredWithOpenCases` emitted
- `businessDaysBetween` utility is in a shared package — confirmed, not a local copy

### Stage 3 — Shared Package Integrations

**Hard blocker verification required before this stage begins (§1 above).**

- Activity Spine adapter: all 24 events in T09 §3.2 wired to their trigger conditions
- Health Spine adapter: all leading indicators (T09 §4.2), lagging indicators (T09 §4.3), and recurring failure signals (T09 §4.4) computed and published
- Work Queue emission: all 20 rules in T09 §5.2 implemented with correct trigger conditions, recipients, and priority tiers
- `@hbc/saved-views` adapter: Coverage Registry and Case Workspace system view definitions registered (T07 §6.3, §6.4)
- `@hbc/record-form` adapter: coverage item and case create/edit lifecycle wired

**Stage 3 gate check:**
- All Activity Spine events emitted on their trigger; verified via integration test
- Health Spine correctly publishes leading and lagging metrics; health band computation (§4.5) produces correct bands for test scenarios covering each color
- All 20 Work Queue rules trigger at the correct conditions; Work Queue items carry correct deep-link paths back to the case or coverage item
- System views are registered and return correct filtered results for each view definition
- No local substitutes for any shared package contract

### Stage 3B — Secondary Integration (Non-Blocking)

- `@hbc/notification-intelligence`: SLA escalation notification routing for WQ-WAR-04, WQ-WAR-05, WQ-WAR-09, WQ-WAR-11, WQ-WAR-14
- `@hbc/acknowledgment`: subcontractor acknowledgment workflow (T06 §8.1); interim PM-to-PM Work Queue nudge pattern remains active until this is confirmed production-ready

### Stage 4 — UX Surfaces and Lane Implementation

**Implements:** All PWA surfaces and SPFx read-only surfaces.

- Coverage Registry surface (PWA): list, filter, complexity dial, saved views, smart empty states, expiration advisory treatment (T07 §3)
- Warranty Case Workspace (PWA): full three-zone layout — status bar, tabbed work area (Overview, Timeline, Evidence, Assignment, Related Items), Next Move panel (T07 §4)
- Owner Status Summary block: visible on cases with associated `OwnerIntakeLog` (T07 §4.2)
- Communications tab: `IWarrantyCommunicationEvent` timeline; visible only on owner-originated cases (T07 §4.3)
- Next Move card: full 7-field anatomy with 15-entry action catalog (T07 §5.2, §5.3)
- Complexity dial: Essential / Standard / Expert per T07 §8; default by role per T07 §8.4
- Permission explainability: show-vs-hide rules and `Why is this disabled?` affordance (T07 §9)
- HBI assistive behaviors: 5 in-context behaviors per T07 §10.2; implement as hooks if `@hbc/hbi` not yet production-ready
- Canvas tile (PWA + SPFx): Health-derived metrics, role visibility per T07 §11
- Related Items publications: all 7 outbound pairs per T07 §7.1 via `@hbc/related-items`
- SPFx coverage list (read-only, Essential tier): T08 §3.2
- SPFx case list (read-only, Essential tier): T08 §3.2
- SPFx Launch-to-PWA escalation CTAs: all mutating actions; deep-link parameters per T08 §3.3

**Stage 4 gate check (PWA):**
- Coverage Registry renders all system views; filter and sort functional; complexity dial changes visual density correctly
- Case Workspace renders all tabs; each tab populates correctly from case data
- Next Move card displays correct action for each of the 15 row catalog states (T07 §5.3)
- Complexity dial defaults are correct by role; user override persists
- Permission explainability fires on all disabled actions listed in T07 §9.1
- HBI suggestions appear in-context and carry accept/dismiss affordance; no HBI UI in a sidecar panel
- Smart empty states are not bare "No records found" messages

**Stage 4 gate check (SPFx):**
- Coverage list and case list render read-only in SPFx web part
- All mutating actions show Launch-to-PWA CTA; none execute within SPFx
- Canvas tile renders with Health-derived metrics
- Deep-link from SPFx carries all required parameters (T08 §3.3) and lands PM on the correct surface in PWA

### Stage 4B — Secondary UI Integrations (Non-Blocking)

- `@hbc/bulk-actions` (SF27): bulk assign, bulk close
- `@hbc/field-annotations`: PER annotation on warranty fields
- `@hbc/publish-workflow` (SF25): resolution record publication lifecycle

### Stage 5 — Reports, Telemetry, and Back-Charge Advisory

- Reports module integration: all 8 report-candidate designations per T09 §6.2
- Telemetry event instrumentation: all events in T09 §7.2–§7.6
- Back-charge advisory publication to Financial: `isBackChargeAdvisory = true` trigger from resolution record

**Stage 5 gate check:**
- Reports module receives Warranty publication events and can assemble the 8 designated reports
- All telemetry events fire at the documented trigger points; no PII in payloads (T09 §7.7)
- Back-charge advisory event delivered to Financial on resolution record creation with `isBackChargeAdvisory = true`; no Financial records written by Warranty

---

## 4. Acceptance Criteria

Full acceptance is issued per stage gate above. Individual criteria are identified below with AC-WAR-## identifiers.

### 4.1 Record model (Stage 1)

| AC | Criterion |
|---|---|
| AC-WAR-01 | All TypeScript interfaces in T02, T05, T06 compile without errors |
| AC-WAR-02 | All enum values match canonical definitions in T02 exactly — no additions, no renames |
| AC-WAR-03 | Authority matrix correctly rejects unauthorized role/action combinations with HTTP 403 |
| AC-WAR-04 | Layer 2 seam fields (`sourceChannel`, `enteredBy`, `externalReferenceId`) are present on all specified records |
| AC-WAR-05 | `IWarrantyCaseResolutionRecord` is immutable after creation: any mutation attempt returns an error |
| AC-WAR-06 | `IWarrantyCoverageDecision` follows supersede-not-mutate: prior decision is preserved on supersession |

### 4.2 State machine (Stage 2)

| AC | Criterion |
|---|---|
| AC-WAR-07 | All 16 case states are reachable via the transition paths defined in T04 §3 |
| AC-WAR-08 | All invalid case transitions return HTTP 409 or equivalent domain error |
| AC-WAR-09 | `computeSlaStatus` returns correct deadline for Standard and Expedited tiers across all three SLA windows |
| AC-WAR-10 | SLA clock pauses when case enters `AwaitingOwner`; elapsed pause days are excluded from SLA computation |
| AC-WAR-11 | Coverage expiration sweep runs daily; items with `warrantyEndDate < today` transition to `Expired` |
| AC-WAR-12 | Open cases against expired coverage items are not auto-closed; `coverageExpiredWithOpenCases` signal is emitted |
| AC-WAR-13 | Verification gate is enforced: `WarrantyCaseResolutionRecord` of type `Corrected` cannot be created without prior `Verified` state |
| AC-WAR-14 | `businessDaysBetween` utility is in a shared package, not a feature-local copy |

### 4.3 Shared package integration (Stage 3)

| AC | Criterion |
|---|---|
| AC-WAR-15 | All 24 Activity Spine events in T09 §3.2 are emitted on their documented triggers |
| AC-WAR-16 | Activity Spine emission failure is logged and retried; it does not roll back the underlying record mutation |
| AC-WAR-17 | All 20 Work Queue rules in T09 §5.2 trigger at correct conditions and carry deep-link paths to the correct surface |
| AC-WAR-18 | All leading and lagging Health Spine metrics in T09 §4 are published correctly; health band computation matches T09 §4.5 |
| AC-WAR-19 | All 8 Case Workspace and 5 Coverage Registry system views are registered and return correct filtered results |
| AC-WAR-20 | No local substitutes exist for any shared package contract (activity, work queue, record form, saved views) |

### 4.4 PWA surface (Stage 4)

| AC | Criterion |
|---|---|
| AC-WAR-21 | Coverage Registry renders all system views; filter, sort, and complexity dial are functional |
| AC-WAR-22 | Case Workspace renders all 5 tabs; each tab populates from live case data |
| AC-WAR-23 | Next Move card displays the correct action for each of the 15 catalog states (T07 §5.3) |
| AC-WAR-24 | Complexity dial defaults are correct by role; user override persists per-user |
| AC-WAR-25 | `Why is this disabled?` affordance fires for all disabled actions in T07 §9.1 |
| AC-WAR-26 | HBI assistive behaviors appear in-context; no HBI UI exists outside the working surface |
| AC-WAR-27 | Smart empty states carry PM-directed action links; no bare "No records found" messages |
| AC-WAR-28 | Communications tab is visible only on cases with an associated `OwnerIntakeLog` |
| AC-WAR-29 | Owner Status Summary block appears on the Overview tab for owner-originated cases and is above the fold |
| AC-WAR-30 | Related Items tab populates from `@hbc/related-items` publications; turnover and commissioning links open the correct cross-module surfaces |

### 4.5 SPFx surface (Stage 4)

| AC | Criterion |
|---|---|
| AC-WAR-31 | Coverage list and case list render read-only in SPFx; no edit affordance is present |
| AC-WAR-32 | All mutating warranty actions from SPFx display a Launch-to-PWA CTA; none execute within SPFx |
| AC-WAR-33 | Canvas tile renders Health-derived metrics in SPFx and PWA |
| AC-WAR-34 | SPFx deep-link carries `projectId`, `module`, `action`, `recordId`, and `returnTo`; PWA lands PM on the correct surface |

### 4.6 Reports, telemetry, and boundary (Stage 5)

| AC | Criterion |
|---|---|
| AC-WAR-35 | Reports module can assemble all 8 designated report types from Warranty publication events |
| AC-WAR-36 | All telemetry events in T09 §7.2–§7.6 fire at documented trigger points |
| AC-WAR-37 | No telemetry payload contains `subcontractorId` or `userId` |
| AC-WAR-38 | Back-charge advisory event is delivered to Financial on resolution record creation; no Financial records are written by Warranty |

### 4.7 External collaboration boundary

| AC | Criterion |
|---|---|
| AC-WAR-39 | No owner-facing routes, views, or authentication flows exist in any lane |
| AC-WAR-40 | No subcontractor direct-access surfaces exist in any lane |
| AC-WAR-41 | `EXT_OWNER` and `EXT_SUB` roles are absent from `@hbc/auth` Phase 3 configuration |

### 4.8 Mold-breaker UX acceptance

| AC | Criterion |
|---|---|
| AC-WAR-42 | A PM can move a case from `Open` to `Closed` without leaving the Case Workspace (no required navigation away) |
| AC-WAR-43 | The Next Move card is visible without scrolling on the Case Workspace in both Essential and Standard complexity tiers |
| AC-WAR-44 | A PM can see the owner intake summary, SLA state, and responsible party identity in a single view without tab-switching |
| AC-WAR-45 | Communications timeline displays all `IWarrantyCommunicationEvent` records in reverse chronological order; new event entry is accessible from the same tab without a separate navigation step |
| AC-WAR-46 | Turnover and commissioning context is visible inline in the Case Workspace without the PM navigating to Closeout or Startup modules |

---

## 5. No-Go Criteria

Implementation must stop and architectural review must be requested if any of the following conditions are met:

| No-Go condition | Reason |
|---|---|
| A local timer or event bus is used to substitute for `@hbc/my-work-feed` Work Queue routing | Violates shared-package contract; creates hidden coupling |
| A coverage-item record is stored outside `@hbc/features-project-hub` | Violates SoT ownership |
| An owner-facing route or auth flow is added for Phase 3 delivery | Premature Layer 2 work; violates explicit deferral |
| A financial record is written by Warranty module code | Warranty must not own Financial records; back-charge advisory is a signal only |
| `businessDaysBetween` is implemented as a local feature-package utility | Must be in a shared package per architecture invariants |
| A reusable visual component (status badge, SLA indicator, Next Move card) is created inside `@hbc/features-project-hub` without a corresponding `@hbc/ui-kit` entry | Violates UI ownership invariant |
| Warranty data is duplicated into a Reports-owned record without a published event as the source | Violates the operational-record-to-derived-read-model boundary |

---

## 6. Phased Rollout Guidance

When the Warranty module is ready for project-level enablement:

| Phase | Rollout scope | Condition |
|---|---|---|
| Internal / Alpha | Single pilot project; PM and PX roles only | Stage 4 gate checks passing; telemetry instrumented |
| Limited Beta | 3–5 projects across 2 PMs | Stage 5 gate checks passing; Health Spine and Work Queue verified in production |
| General Availability | All active projects | AC-WAR-01 through AC-WAR-41 verified; AC-WAR-42 through AC-WAR-46 reviewed in PM session |

No Layer 2 capability (owner portal, sub direct access) may be enabled during General Availability rollout. Layer 2 requires a separate activation decision.

---

## 7. Validation Checklist (Evidence Artifacts)

Before claiming Stage 4 or 5 complete, the following evidence artifacts must exist:

| Artifact | Stage | Evidence format |
|---|---|---|
| TypeScript compilation clean (no errors, no `any` suppression) | 1 | CI build output |
| Unit test coverage for all 30+ state machine transition paths | 2 | Test run output |
| `computeSlaStatus` unit tests for Standard and Expedited across all three windows | 2 | Test run output |
| Integration test: Activity Spine events for 10 representative case transitions | 3 | Integration test output |
| Integration test: Work Queue rules for WQ-WAR-01, WQ-WAR-08, WQ-WAR-12, WQ-WAR-14 | 3 | Integration test output |
| Health Spine band computation test for Green / Yellow / Orange / Red scenarios | 3 | Unit test output |
| PWA walkthrough: case from `Open` to `Closed` with all required steps documented | 4 | PM walkthrough recording or documented session |
| SPFx read-only test: coverage list and case list render without mutation affordance | 4 | Screenshot or recorded walkthrough |
| SPFx Launch-to-PWA test: at least 3 mutating actions tested with deep-link | 4 | Recorded walkthrough |
| No-owner-UI confirmation: route audit for `EXT_OWNER` paths returns no results | 4 | Route audit output |
| Telemetry: mold-breaker events firing in staging environment | 5 | Analytics event log |

---

## 8. Cross-Reference Update Checklist

When T-files are fully authored and implementation is complete, update the following documents:

| Document | Update required |
|---|---|
| `phase-3-deliverables/README.md` | P3-E14 row in Workstream E table; Stage 7.7 summary ✓ (completed at T-file creation) |
| `P3-E1` | Add warranty module classification row (§3.x) — **pending** |
| `P3-E2` | Add warranty SoT and action-boundary section (§17) — **pending** |
| `P3-H1` | Add Warranty module to acceptance checklist with AC-WAR-01 through AC-WAR-46 reference — **pending** |
| `P3-E4` | Add back-charge advisory consumption note from Warranty — **pending** |
| `P3-E10` | Add warranty posture seam reference in Closeout (T07 §3 or T08 §3) — **pending** |
| `P3-E11` | Add warranty coverage handoff reference in Startup (T03 or T06) — **pending** |
| `docs/architecture/blueprint/current-state-map.md` | Add Warranty module to Project Hub feature surface list when Stage 4 is live — **pending** |

---

*← [T09](P3-E14-T09-Reports-Health-Signals-Work-Queue-Publication-and-Telemetry.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md)*
