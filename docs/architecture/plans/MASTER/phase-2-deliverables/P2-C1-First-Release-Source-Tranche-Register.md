# P2-C1: First-Release Source Tranche Register

| Field | Value |
|---|---|
| **Doc ID** | P2-C1 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Active Reference |
| **Owner** | Platform / Core Services + Domain Owners |
| **Update Authority** | Platform lead maintains tranche structure and readiness bands; domain owners update source-specific readiness evidence |
| **Last Reviewed Against Repo Truth** | 2026-03-20 (readiness matrix updated: 4 sources → Wired: Ready; Provisioning → Publishing: Ready) |
| **References** | [Phase 2 Plan §9.2, §10.3, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1 §7](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md); [P2-C4](P2-C4-Handoff-Criteria-Matrix.md); [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md); [@hbc/bic-next-move README](../../../../packages/bic-next-move/README.md); [@hbc/workflow-handoff README](../../../../packages/workflow-handoff/README.md); [@hbc/acknowledgment README](../../../../packages/acknowledgment/README.md); [@hbc/step-wizard README](../../../../packages/step-wizard/README.md); [@hbc/field-annotations README](../../../../packages/field-annotations/README.md); [@hbc/notification-intelligence README](../../../../packages/notification-intelligence/README.md) |

---

## Register Statement

This register governs which first-release work sources are allowed to publish into the Personal Work Hub for the Phase 2 pilot and how mature each source is across four distinct readiness bands: **contract/design**, **wired**, **publishing**, and **tested / launch-validated**.

This document deliberately separates source intent from implementation maturity. A source may be structurally part of the Wave 1 tranche while still being blocked on wiring, publication, or validation. No source may publish into the hub outside this register without Platform-lead approval.

**Repo-truth audit — 2026-03-20:** All 17 repo anchor files confirmed present. All 6 primitive packages (`@hbc/bic-next-move`, `@hbc/workflow-handoff`, `@hbc/acknowledgment`, `@hbc/step-wizard`, `@hbc/field-annotations`, `@hbc/notification-intelligence`) confirmed in the workspace. Blocked source rows (Estimating, BD Score Benchmark, BD Strategic Intelligence, Health Pulse, Approvals) correctly assessed — their `bicNextMoveAdapter.ts` files are projection helpers with no registration or bootstrap wiring. `acknowledgment/contextTypes.ts` confirms `ADMIN_PROVISIONING: 'admin-provisioning'`, grounding the §5 Wave 1 Approvals proving example. `ProjectSetupPage.tsx` uses `HbcStepWizard`, confirming primitive readiness without My Work publication. One material inaccuracy found: **§3.1 Provisioning "Publishing: Ready" overstates live state.** `MyWorkRegistry.register()` is never called in any production source file across the workspace — the full adapter stack (`bicAdapter`, `notificationAdapter`, `handoffAdapter`, `acknowledgmentAdapter`) exists and is exported from `packages/my-work-feed/src/adapters/` but is never assembled into `MyWorkRegistry` in production code. `useMyWork` hooks are defined but not consumed in any PWA route (no `/my-work` route exists). By this register's own band definition, "emits real hub items into `@hbc/my-work-feed` on at least one real route" is not yet satisfied. The "already publishing" language in §3.1 should be revised. See §3.1 reconciliation note below.

---

## Register Scope

### This register governs

- The governed Wave 1 source tranche for Personal Work Hub publication
- Source classification (`Required`, `Optional`, `Deferred`)
- Per-source readiness across four distinct maturity bands
- The primary channel / primitive combination each source uses to reach the hub
- Source-level identity / deduplication rules
- Source-specific blocking notes that matter for pilot launch posture

### This register does NOT govern

- Full ranking coefficients, scoring weights, or tie-break rules — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Full notification-to-work signal transformation behavior — see [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md)
- Item-type navigation and deep-link behavior — see P2-C3
- Project-significance handoff criteria — see [P2-C4](P2-C4-Handoff-Criteria-Matrix.md)
- Pilot launch checklist and rollout gate closure — see [P2-C5](P2-C5-Pilot-Publication-and-Rollout-Readiness-Register.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Source tranche** | The governed set of sources approved to publish work into the Personal Work Hub for a specific release |
| **Source row** | A Wave 1 publication source tracked in this register; a source row may be backed by one feature package, one shared primitive, or a governed combination of both |
| **Contract / design ready** | The source has a stable source identity, primitive choice, channel strategy, and publication shape defined clearly enough that implementation can proceed without inventing new source semantics |
| **Wired** | Source-specific registration, bootstrap, configuration, or route-level integration exists in the repo |
| **Publishing** | The source emits real hub items into `@hbc/my-work-feed` on at least one real route, not just through a design contract or helper function |
| **Tested / launch-validated** | Source-specific test coverage and pilot-readiness evidence exist at a level that supports launch review; final pilot validation is tracked in P2-C5 |
| **Pilot-launch blocker** | A `Required` source row whose maturity is insufficient for the locked Wave 1 publication posture |

---

## 1. Wave 1 Source Classification Matrix

### 1.1 Source Matrix

| Source | Source Key | Classification | Contract / Design | Wired | Publishing | Tested / Launch-Validated | Pilot-Launch Blocker? | Primary Channel(s) |
|---|---|---|---|---|---|---|---|---|
| **Provisioning** | `provisioning` | Required | **Ready** | **Ready** | **Ready** | **Partial** | No | BIC + Notification + Handoff |
| **Estimating Bid Readiness** | `estimating-bid-readiness` | Required | **Ready** | **Ready** | **Partial** | **Blocked** | Yes | BIC |
| **BD Score Benchmark** | `bd-score-benchmark` | Required | **Ready** | **Ready** | **Partial** | **Blocked** | Yes | BIC |
| **BD Strategic Intelligence** | `bd-strategic-intelligence` | Required | **Ready** | **Ready** | **Partial** | **Blocked** | Yes | BIC |
| **Project Hub Handoff Signals** | `project-hub-handoff-signals` | Required | **Ready** | **Ready** | **Partial** | **Blocked** | Yes | Handoff + Notification |
| **Project Hub Health Pulse** | `project-health-pulse` | Required | **Ready** | **Ready** | **Partial** | **Blocked** | Yes | BIC |
| **Approvals** | `approvals` | Required | **Ready** | **Blocked** | **Blocked** | **Blocked** | Yes | BIC + Notification |
| **Admin Escalations** | `admin` | Optional | **Ready** | **Ready** | **Ready** | **Partial** | No | BIC (via Provisioning) + Notification |

### 1.2 Classification Definitions

| Classification | Meaning |
|---|---|
| **Required** | Must be represented correctly in the Wave 1 publication model before pilot launch can be approved |
| **Optional** | Useful in first release, but absence does not by itself block pilot launch |
| **Deferred** | Explicitly out of first-release scope |

### 1.3 Readiness Status Meanings

| Status | Meaning |
|---|---|
| **Ready** | Repo evidence exists for this maturity band |
| **Partial** | Some real repo evidence exists, but the source row is not yet fully closed for that band |
| **Blocked** | The source row does not yet meet the band's minimum requirement |

---

## 2. Locked Wave 1 Source Decisions

This tightened register incorporates the following locked decisions:

| Decision | Locked Resolution | Consequence in P2-C1 |
|---|---|---|
| Project Hub representation | **Split into two separate source rows** | `Project Hub Handoff Signals` and `Project Hub Health Pulse` are tracked independently |
| Approvals representation | **Add an explicit Approvals row** | Approvals are no longer buried inside other rows |
| Approvals implementation posture | **Use existing shared primitives** | `@hbc/acknowledgment`, `@hbc/step-wizard`, `@hbc/workflow-handoff`, `@hbc/notification-intelligence`, `@hbc/field-annotations`, and `@hbc/bic-next-move` form the approved Wave 1 primitive stack |
| Approval readiness standard | **At least one real end-to-end approval route must publish into My Work** | Shared-package availability alone is not enough to mark Approvals as publishing-ready |
| Wave 1 approval proof path | **Admin provisioning sign-off first** | Wave 1 approval proof is explicitly limited to admin provisioning until broader approval routes are wired |
| Readiness model | **Split readiness into separate bands** | This register no longer uses a single mixed `x/6 gates met` maturity signal |

---

## 3. Source Detail and Current Gaps

### 3.1 Provisioning — Reference Implementation

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Canonical source identity, channel mix, and publication posture are established |
| Wired | Ready | Provisioning BIC registration factory (`createProjectSetupBicRegistration`), notification registrations/templates, and handoff configuration all exist as ready-to-assemble artifacts |
| Publishing | Ready | `MyWorkRegistry.register()` is called in `apps/pwa/src/sources/sourceAssembly.ts` with all 4 adapters (BIC 0.9, handoff 0.8, acknowledgment 0.7, notification 0.5). The `/my-work` PWA route consumes `useMyWork` via `HbcMyWorkFeed`. Domain queryFns emit representative items via `domainQueryFns.ts`. |
| Tested / Launch-Validated | Partial | Provisioning is the reference implementation, but final cross-source pilot validation still belongs to P2-C5 |

**Reference artifacts**
- `packages/provisioning/src/bic-registration.ts`
- `packages/provisioning/src/notification-registrations.ts`
- `packages/provisioning/src/notification-templates.ts`
- `packages/provisioning/src/handoff-config.ts`

**Repo-truth reconciliation note (updated 2026-03-20)**
The assembly step is now complete. `apps/pwa/src/sources/sourceAssembly.ts` calls `MyWorkRegistry.register()` with all 4 adapters at bootstrap. The `/my-work` route exists and renders `HbcMyWorkFeed` which consumes `useMyWork()`. All 5 BIC modules are registered via `registerBicModule()`, all 28 notification events are registered via `NotificationRegistry.register()`, and domain queryFns in `domainQueryFns.ts` emit representative items. Publishing is Ready.

**Register consequence**
- Provisioning is the reference pattern. All 4 remaining required sources follow the same factory + registration + notification pattern established here.

### 3.2 Estimating Bid Readiness — Wired; Publishing Partial

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Bid-readiness projection shape is real; source identity and BIC-first publication posture are defined |
| Wired | Ready | BIC registration factory (`createEstimatingBidReadinessBicRegistration`) created and wired in `sourceAssembly.ts`; 3 notification events registered (`ESTIMATING_NOTIFICATION_REGISTRATIONS`) |
| Publishing | Partial | Domain queryFn emits representative mock items via `domainQueryFns.ts`; real domain API client integration pending |
| Tested / Launch-Validated | Blocked | Source-specific publication validation is not closed |

**Repo anchors**
- `packages/features/estimating/src/bid-readiness/bic-registration.ts`
- `packages/features/estimating/src/bid-readiness/notification-registrations.ts`
- `packages/features/estimating/src/bid-readiness/integrations/bicNextMoveAdapter.ts`
- `apps/pwa/src/sources/sourceAssembly.ts`

**Remaining work**
- Connect real domain API client to queryFn (replace mock data in `domainQueryFns.ts`)

### 3.3 BD Score Benchmark — Wired; Publishing Partial

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Score-benchmark projection shape exists and fits the tranche model |
| Wired | Ready | BIC registration factory (`createBdScoreBenchmarkBicRegistration`) created and wired in `sourceAssembly.ts`; 3 notification events registered (`BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS`) |
| Publishing | Partial | Domain queryFn emits representative mock items via `domainQueryFns.ts`; real domain API client integration pending |
| Tested / Launch-Validated | Blocked | No launch-grade validation closure |

**Repo anchors**
- `packages/features/business-development/src/score-benchmark/bic-registration.ts`
- `packages/features/business-development/src/score-benchmark/notification-registrations.ts`
- `apps/pwa/src/sources/sourceAssembly.ts`

**Remaining work**
- Connect real domain API client to queryFn

### 3.4 BD Strategic Intelligence — Wired; Publishing Partial

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Strategic-intelligence projection shape exists and belongs in the tranche |
| Wired | Ready | BIC registration factory (`createBdStrategicIntelligenceBicRegistration`) created and wired in `sourceAssembly.ts`; 3 notification events registered (`BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS`) |
| Publishing | Partial | Domain queryFn emits representative mock items via `domainQueryFns.ts`; real domain API client integration pending |
| Tested / Launch-Validated | Blocked | No launch-grade validation closure |

**Repo anchors**
- `packages/features/business-development/src/strategic-intelligence/bic-registration.ts`
- `packages/features/business-development/src/strategic-intelligence/notification-registrations.ts`
- `apps/pwa/src/sources/sourceAssembly.ts`

**Remaining work**
- Connect real domain API client to queryFn

### 3.5 Project Hub Handoff Signals — Wired; Publishing Partial

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Project-significant handoff signals are explicitly part of the Wave 1 source model and are backed by the workflow-handoff primitive |
| Wired | Ready | Handoff adapter registered in `sourceAssembly.ts` (weight 0.8); provisioning handoff config has implemented `onAcknowledged` callback generating seed record IDs; `resolveHealthPulseActionUrl` provides Project Hub navigation |
| Publishing | Partial | Handoff adapter produces items from `HandoffApi.inbox()`; provisioning completion → Project Hub seed creation works; row-level publication proof narrower than final tranche intent |
| Tested / Launch-Validated | Blocked | Source-specific validation for the tranche row is not yet closed |

**Repo anchors**
- `packages/workflow-handoff/README.md`
- `packages/provisioning/src/handoff-config.ts`
- `docs/reference/workflow-experience/setup-handoff-routes.md`

**Wave 1 note**
- This source row is no longer collapsed into Health Pulse. It represents Project Hub-directed handoff traffic and must remain distinct from Project Hub monitoring / health surfacing.

### 3.6 Project Hub Health Pulse — Wired; Publishing Partial

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Health Pulse belongs to the first-release tranche by locked decision and is modeled as its own row |
| Wired | Ready | BIC registration factory (`createProjectHealthPulseBicRegistration`) created and wired in `sourceAssembly.ts`; 4 notification events registered (`PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS`); navigation URL helper (`resolveHealthPulseActionUrl`) created |
| Publishing | Partial | Domain queryFn emits representative mock items via `domainQueryFns.ts`; real domain API client integration pending |
| Tested / Launch-Validated | Blocked | No launch-grade validation closure |

**Repo anchors**
- `packages/features/project-hub/src/health-pulse/bic-registration.ts`
- `packages/features/project-hub/src/health-pulse/notification-registrations.ts`
- `packages/features/project-hub/src/health-pulse/resolveHealthPulseActionUrl.ts`
- `apps/pwa/src/sources/sourceAssembly.ts`

**Critical correction**
- The canonical source key for this row is **`project-health-pulse`**, not `project-hub-health-pulse`.

**Remaining work**
- Connect real domain API client to queryFn

### 3.7 Approvals — Explicit Required Row, but Wave 1 Proof is Narrower than Full Scope

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | The shared-primitive stack is real and the Approvals row is now explicitly governed |
| Wired | Blocked | No end-to-end approval source row is closed yet |
| Publishing | Blocked | The row cannot be marked ready until at least one real approval route publishes into My Work |
| Tested / Launch-Validated | Blocked | Launch-grade validation depends on a real route |

**Approved Wave 1 primitive stack**
- `@hbc/acknowledgment`
- `@hbc/step-wizard`
- `@hbc/workflow-handoff`
- `@hbc/notification-intelligence`
- `@hbc/field-annotations`
- `@hbc/bic-next-move`

**Wave 1 proof-path rule**
- The first proving route for this row is **Admin provisioning sign-off**.
- The row remains broad and `Required`, but current Wave 1 proof is explicitly limited to admin provisioning until additional approval routes are wired.

**Repo anchors**
- `packages/acknowledgment/src/config/contextTypes.ts`
- `apps/pwa/src/routes/project-setup/ProjectSetupPage.tsx`
- `packages/step-wizard/README.md`
- `packages/field-annotations/README.md`

### 3.8 Admin Escalations — Optional Companion Row via Provisioning Failure / Alert Paths

| Band | Status | Evidence / Notes |
|---|---|---|
| Contract / Design | Ready | Admin escalations are a governed companion row tied to provisioning failures / alerts |
| Wired | Ready | Existing provisioning failure / alert posture supports the row |
| Publishing | Ready | This row is already represented through provisioning-derived failure / alert semantics |
| Tested / Launch-Validated | Partial | Final launch validation remains part of broader pilot readiness |

**Repo anchors**
- `packages/provisioning/src/failure-modes.ts`
- `packages/provisioning/src/notification-registrations.ts`

**Row boundary rule**
- Admin escalations do **not** justify a parallel publication system. They remain subordinate to the provisioning/admin-exception posture.

---

## 4. Channel and Primitive Mapping

This register now treats source rows and platform primitives as related but distinct concerns. A row may be backed by one primitive or a governed primitive combination.

| Source | Primary Channel(s) | Governing Primitive(s) | Current Wave 1 Proof / Note |
|---|---|---|---|
| Provisioning | BIC + Notification + Handoff | `@hbc/bic-next-move`, `@hbc/notification-intelligence`, `@hbc/workflow-handoff` | Reference implementation |
| Estimating Bid Readiness | BIC | `@hbc/bic-next-move` | Projection helper exists; registration/bootstrap still open |
| BD Score Benchmark | BIC | `@hbc/bic-next-move` | Projection helper exists; registration/bootstrap still open |
| BD Strategic Intelligence | BIC | `@hbc/bic-next-move` | Projection helper exists; registration/bootstrap still open |
| Project Hub Handoff Signals | Handoff + Notification | `@hbc/workflow-handoff`, `@hbc/notification-intelligence` | Proven only through narrower provisioning completion-handoff posture so far |
| Project Hub Health Pulse | BIC | `@hbc/bic-next-move` | Projection helper exists; row not yet wired |
| Approvals | BIC + Notification (+ Handoff where route-specific) | `@hbc/acknowledgment`, `@hbc/step-wizard`, `@hbc/workflow-handoff`, `@hbc/notification-intelligence`, `@hbc/field-annotations`, `@hbc/bic-next-move` | Wave 1 proof path locked to admin provisioning sign-off |
| Admin Escalations | BIC (via Provisioning) + Notification | Provisioning + `@hbc/notification-intelligence` | Derived companion row, not a separate publication system |

### Channel Invariant

No first-release source may bypass the existing shared primitive stack when those primitives already cover the need. Source-specific publication paths are prohibited unless Architecture explicitly approves an exception.

---

## 5. Identity and Deduplication Registry

All source rows must resolve to stable deduplication identities using the canonical format:

```text
{sourceKey-or-moduleKey}::{recordType-or-contextType}::{recordId-or-contextId}
```

| Source | Canonical Identity Pattern | Notes |
|---|---|---|
| Provisioning | `provisioning::request::{recordId}` | Reference implementation |
| Estimating Bid Readiness | `estimating-bid-readiness::pursuit::{recordId}` | Existing source-row contract |
| BD Score Benchmark | `bd-score-benchmark::pursuit::{recordId}` | Existing source-row contract |
| BD Strategic Intelligence | `bd-strategic-intelligence::entry::{recordId}` | Existing source-row contract |
| Project Hub Handoff Signals | `workflow-handoff::package::{handoffId}` | Source row is implemented through workflow-handoff rather than a standalone domain module |
| Project Hub Health Pulse | `project-health-pulse::project::{recordId}` | Corrected source key |
| Approvals | `approvals::{contextType}::{contextId}` | Wave 1 proving example: `approvals::admin-provisioning::{contextId}` |
| Admin Escalations | `admin::alert::{alertId}` **or** canonical provisioning key when derived from a failed provisioning item | Avoid duplicate namespaces when the escalation is only a provisioning failure view |

### Identity Rule for Approvals

The broad `Approvals` row does **not** erase route-level context. Approval items must preserve route context through `contextType` (for example `admin-provisioning`, `bd-scorecard`, or `project-hub-pmp`) even while rolling up to the governed tranche row.

---

## 6. Lane / Priority Contract Reference

This register does **not** redefine the canonical ranking model. Instead, it binds each source row to the existing Phase 2 lane contract:

- Direct BIC ownership items follow [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Notification-intelligence signals follow [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md)
- Handoff-directed items follow the Project-significance and handoff rules in [P2-C4](P2-C4-Handoff-Criteria-Matrix.md)

### Non-Override Rule

No source row in this register may invent its own lane model, urgency vocabulary, or ranking vocabulary outside the canonical Phase 2 policy stack.

---

## 7. Publication Gate Posture

P2-C1 is the source-tranche evidence artifact for the Phase 2 publication gate.

| Field | Value |
|---|---|
| **Gate** | Publication gate |
| **Pass condition** | First-release required sources are correctly classified and the required Wave 1 sources publish through the governed shared primitive stack |
| **Evidence required** | Source tranche register (this document), P2-C5 readiness register, source-specific implementation evidence, and launch validation |
| **Primary owner** | Platform + Domain owners |

### Current Gate Reading

- **Classification model:** Ready
- **Readiness-band discipline:** Ready after this tightening pass
- **Required-source publication posture:** Blocked
- **Why blocked:** No source row has a complete end-to-end My Work publication path in live code. `MyWorkRegistry.register()` is not called in any production source file; no `/my-work` PWA route exists. Required rows beyond Provisioning remain partially wired or unpublished; the Approvals row lacks a real end-to-end published route. Provisioning's publishing status has been corrected from Ready to Partial (2026-03-20 audit).

---

## 8. Register Precedence

| Deliverable | Relationship to P2-C1 |
|---|---|
| **P2-A1** — Operating Model Register | P2-C1 source rows publish into the Personal Work Hub operating model defined in P2-A1 |
| **P2-A2** — Ranking Policy | P2-C1 does not redefine ranking; it binds source rows to the canonical ranking contract |
| **P2-B0** — Lane Ownership | P2-C1 source rows must follow shared-primitive anti-drift rules |
| **P2-C2** — Notification-to-Work Mapping | P2-C2 governs how signal-tier events become work items |
| **P2-C4** — Handoff Criteria Matrix | P2-C4 governs Project Hub handoff routing and return behavior |
| **P2-C5** — Pilot Publication and Readiness Register | P2-C5 uses this register's tranche structure and maturity posture when assessing launch readiness |

If a downstream artifact collapses source rows back into single mixed maturity signals, this tightened register takes precedence unless Platform lead explicitly revises it.

---

## 9. Operating Notes for Future Updates

When this register is updated:

1. Do **not** merge `Project Hub Handoff Signals` back into `Project Hub Health Pulse`.
2. Do **not** collapse `Approvals` back into domain rows.
3. Do **not** mark `Approvals` as publishing-ready until at least one real end-to-end approval route publishes into My Work.
4. Do **not** change `project-health-pulse` back to `project-hub-health-pulse`.
5. Do **not** use a single mixed `x/6 gates met` signal in place of the split readiness bands.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §9.2, §10.3, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
