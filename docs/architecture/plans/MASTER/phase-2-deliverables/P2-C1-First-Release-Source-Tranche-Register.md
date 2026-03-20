# P2-C1: First-Release Source Tranche Register

| Field | Value |
|---|---|
| **Doc ID** | P2-C1 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Active Reference |
| **Owner** | Platform / Core Services + Domain Owners |
| **Update Authority** | Platform lead; domain owners update readiness status for their sources |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §9.2, §10.3, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [publication-model](../../../reference/work-hub/publication-model.md); [P2-A1 §7](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); `bic-registration.ts` |

---

## Register Statement

This register governs which work-item sources publish into the Personal Work Hub for the Phase 2 first release. Each source is classified by launch criticality and readiness status. No source may publish into the hub outside this register without Platform-lead approval. This is a living document — readiness status is updated as implementation progresses.

---

## Register Scope

### This register governs

- Classification of each first-release source (required / optional / blocked / deferred)
- Readiness status and implementation gaps for each source
- Publication channel mapping (BIC, handoff, notification adapters)
- Readiness gate checklist per source
- Deduplication key registry
- Priority-to-lane mapping per source

### This register does NOT govern

- Ranking coefficients or scoring logic — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Work-item navigation behavior per item type — see P2-C3
- Handoff criteria to Project Hub vs domain surfaces — see P2-C4
- Notification-to-work signal transformation rules — see P2-C2
- Pilot rollout readiness and launch checklist — see P2-C5

---

## Definitions

| Term | Meaning |
|---|---|
| **Source tranche** | The governed set of work-item sources approved to publish into the Personal Work Hub for a specific release |
| **Publication channel** | One of three adapters through which sources publish: BIC (0.9 weight), handoff (0.8), notification (0.5) |
| **Readiness gate** | A checklist of implementation requirements that must be satisfied before a source can publish in production |
| **Pilot-launch blocker** | A source classified as "required" whose readiness gates are not yet met — blocks pilot launch approval |

---

## 1. Source Classification Matrix

| Source | Module Key | Classification | Readiness | Pilot-Launch Blocker? | Primary Channel |
|---|---|---|---|---|---|
| **Provisioning** | `provisioning` | Required | **Ready** | No — gates met | BIC + Notification + Handoff |
| **Estimating Bid Readiness** | `estimating-bid-readiness` | Required | **Blocked** — registration not wired | Yes — until wired | BIC |
| **BD Score Benchmark** | `bd-score-benchmark` | Required | **Blocked** — registration not wired | Yes — until wired | BIC |
| **BD Strategic Intelligence** | `bd-strategic-intelligence` | Required | **Blocked** — registration not wired | Yes — until wired | BIC |
| **Project Hub Health Pulse** | `project-hub-health-pulse` | Required | **Blocked** — registration not wired | Yes — until wired | BIC |
| **Admin Escalations** | `admin` | Optional | **Ready** — via Provisioning BIC (failed state) | No | BIC (via Provisioning) |

### Classification Definitions

| Classification | Meaning |
|---|---|
| **Required** | Source must be publishing correctly before pilot launch can be approved |
| **Optional** | Source is beneficial but its absence does not block pilot launch |
| **Blocked** | Source is required but has unmet implementation prerequisites |
| **Deferred** | Source is explicitly deferred beyond Phase 2 first release |

---

## 2. Source Readiness Detail

### 2.1 Provisioning — Ready

| Artifact | Status | Location |
|---|---|---|
| BIC adapter projection | ✅ Complete | `packages/provisioning/src/bic-config.ts` |
| BIC registration factory | ✅ Complete | `packages/provisioning/src/bic-registration.ts` |
| App bootstrap wiring | ✅ Complete | Wired at provisioning module bootstrap |
| Notification registrations | ✅ Complete (15 events) | `packages/provisioning/src/notification-registrations.ts` |
| Notification templates | ✅ Complete | `packages/provisioning/src/notification-templates.ts` |
| Handoff config | ✅ Complete | `packages/provisioning/src/handoff-config.ts` |
| Deduplication key | ✅ `provisioning::request::{recordId}` | Per publication-model.md §5 |

**Provisioning is the reference implementation.** All other sources should follow its patterns for BIC registration, notification registration, and handoff config.

### 2.2 Estimating Bid Readiness — Blocked on Wiring

| Artifact | Status | Location / Action Required |
|---|---|---|
| BIC adapter projection | ✅ Complete | `packages/features/estimating/src/bid-readiness/integrations/bicNextMoveAdapter.ts` |
| BIC registration factory | ❌ Not created | Create `createEstimatingBidReadinessBicRegistration(queryFn)` following Provisioning pattern |
| App bootstrap wiring | ❌ Not wired | Wire `registerBicModule()` call at Estimating app bootstrap |
| Notification registrations | ❌ Not defined | Define via `BidReadinessNotificationType` (noted as "To be defined in Wave 1") |
| Deduplication key | ✅ Defined | `estimating-bid-readiness::pursuit::{recordId}` |

### 2.3 BD Score Benchmark — Blocked on Wiring

| Artifact | Status | Location / Action Required |
|---|---|---|
| BIC adapter projection | ✅ Complete | `packages/features/business-development/src/score-benchmark/integrations/bicNextMoveAdapter.ts` |
| BIC registration factory | ❌ Not created | Create `createScoreBenchmarkBicRegistration(queryFn)` |
| App bootstrap wiring | ❌ Not wired | Wire at Business Development app bootstrap |
| Notification registrations | ❌ Not defined | "To be defined in Wave 1" |
| Deduplication key | ✅ Defined | `bd-score-benchmark::pursuit::{recordId}` |

### 2.4 BD Strategic Intelligence — Blocked on Wiring

| Artifact | Status | Location / Action Required |
|---|---|---|
| BIC adapter projection | ✅ Complete | `packages/features/business-development/src/strategic-intelligence/integrations/bicNextMoveAdapter.ts` |
| BIC registration factory | ❌ Not created | Create `createStrategicIntelligenceBicRegistration(queryFn)` |
| App bootstrap wiring | ❌ Not wired | Wire at Business Development app bootstrap |
| Notification registrations | ❌ Not defined | "To be defined in Wave 1" |
| Deduplication key | ✅ Defined | `bd-strategic-intelligence::entry::{recordId}` |

### 2.5 Project Hub Health Pulse — Blocked on Wiring

| Artifact | Status | Location / Action Required |
|---|---|---|
| BIC adapter projection | ✅ Complete | `packages/features/project-hub/src/health-pulse/integrations/bicNextMoveAdapter.ts` |
| BIC registration factory | ❌ Not created | Create `createProjectHealthPulseBicRegistration(queryFn)` |
| App bootstrap wiring | ❌ Not wired | Wire at Project Hub app bootstrap |
| Notification registrations | ❌ Not defined | "To be defined in Wave 1" |
| Deduplication key | ✅ Defined | `project-hub-health-pulse::project::{recordId}` |

### 2.6 Admin Escalations — Ready (via Provisioning)

| Artifact | Status | Notes |
|---|---|---|
| Publication mechanism | ✅ Ready | Flows through Provisioning BIC in failed state |
| Separate module | Not required | Admin escalations are provisioning items in failed/blocked state |
| Alert events | ✅ Available | Via `AlertPollingService` |

---

## 3. Publication Channel Mapping

All first-release sources MUST publish through the three existing `@hbc/my-work-feed` adapters. No parallel publication path is permitted (P2-B0 Anti-Drift Rule 5).

| Source | BIC Adapter (0.9) | Handoff Adapter (0.8) | Notification Adapter (0.5) |
|---|---|---|---|
| **Provisioning** | ✅ Primary — active requests where user is BIC owner | ✅ Completion handoff (setup → Project Hub) | ✅ 15 lifecycle events |
| **Estimating Bid Readiness** | ✅ Primary — bid readiness items where user is BIC owner | — | ❌ To be defined |
| **BD Score Benchmark** | ✅ Primary — criterion ownership items | — | ❌ To be defined |
| **BD Strategic Intelligence** | ✅ Primary — intelligence entry items | — | ❌ To be defined |
| **Project Hub Health Pulse** | ✅ Primary — project health items | — | ❌ To be defined |
| **Admin Escalations** | ✅ Via Provisioning (failed state) | — | ✅ Alert events |

See [publication-model §1](../../../reference/work-hub/publication-model.md) for adapter architecture details.

---

## 4. Readiness Gate Checklist

Each source must satisfy all 6 gates before pilot-launch publication is approved:

| # | Gate | Provisioning | Estimating | BD Score | BD Strategic | Project Hub Health |
|---|---|---|---|---|---|---|
| 1 | BIC adapter projection function exists | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | BIC registration factory created with module key and label constants | ✅ | ❌ | ❌ | ❌ | ❌ |
| 3 | App bootstrap wires `registerBicModule()` | ✅ | ❌ | ❌ | ❌ | ❌ |
| 4 | Notification registrations defined (if part of publication model) | ✅ (15 events) | ❌ | ❌ | ❌ | ❌ |
| 5 | Deduplication key format follows `{moduleKey}::{recordType}::{recordId}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | Priority mapping to feed priority and lane assignment defined | ✅ | ✅ | ✅ | ✅ | ✅ |

### Gate Status Summary

- **Provisioning:** 6/6 gates met — **launch-ready**
- **Estimating, BD Score, BD Strategic, Project Hub Health:** 3/6 gates met — **blocked on gates 2, 3, 4**

### Reference Implementation

All blocked sources should follow the Provisioning reference implementation:
- Registration factory pattern: `packages/provisioning/src/bic-registration.ts`
- Notification registration pattern: `packages/provisioning/src/notification-registrations.ts`
- BIC config pattern: `packages/provisioning/src/bic-config.ts`

See [publication-model §3](../../../reference/work-hub/publication-model.md) for the complete BIC registration contract.

---

## 5. Deduplication Key Registry

All sources use the canonical key format: `{moduleKey}::{recordType}::{recordId}`

| Source | Module Key | Record Type | Example Key |
|---|---|---|---|
| Provisioning | `provisioning` | `request` | `provisioning::request::req-abc123` |
| Estimating Bid Readiness | `estimating-bid-readiness` | `pursuit` | `estimating-bid-readiness::pursuit::pur-def456` |
| BD Score Benchmark | `bd-score-benchmark` | `pursuit` | `bd-score-benchmark::pursuit::pur-ghi789` |
| BD Strategic Intelligence | `bd-strategic-intelligence` | `entry` | `bd-strategic-intelligence::entry::ent-jkl012` |
| Project Hub Health Pulse | `project-hub-health-pulse` | `project` | `project-hub-health-pulse::project::proj-mno345` |

When the same record produces items through multiple channels, the higher-weight source survives (P2-A2 §4). See [publication-model §5](../../../reference/work-hub/publication-model.md).

---

## 6. Priority Mapping by Source

Each source adapter maps its urgency model to the canonical feed priority, which determines lane assignment per P2-A2 §3.

### BIC Adapter Mapping (All Sources)

| BIC Urgency | Feed Priority | Lane |
|---|---|---|
| `immediate` | `now` | `do-now` |
| `watch` | `soon` | `watch` |
| `upcoming` | `watch` | `watch` |
| Any, with `isBlocked: true` | (original) | `waiting-blocked` |

### Notification Adapter Mapping (Provisioning)

| Notification Tier | Feed Priority | Lane |
|---|---|---|
| `immediate` | `now` | `do-now` |
| `watch` | `soon` | `watch` |
| `digest` | `watch` | `watch` |

### Handoff Adapter Mapping (Provisioning)

| Handoff Age | Feed Priority | Lane |
|---|---|---|
| > 48 hours | `now` | `do-now` |
| > 24 hours | `soon` | `do-now` |
| ≤ 24 hours | `watch` | `watch` |

See [publication-model §6](../../../reference/work-hub/publication-model.md) for the complete priority mapping reference.

---

## 7. Anti-Drift Compliance

Per [P2-B0 Anti-Drift Rule 5](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

> "Bypassing `@hbc/my-work-feed` and `@hbc/notification-intelligence` for first-release publication patterns where those shared primitives already cover the need is prohibited."

### Compliance Requirements

| Requirement | Status |
|---|---|
| All sources publish through `@hbc/my-work-feed` BIC adapter | ✅ All adapters target BIC registration |
| Notifications route through `@hbc/notification-intelligence` | ✅ Provisioning complete; others to be defined |
| No direct domain-to-hub coupling | ✅ All publication goes through shared adapter registry |
| No source-specific publication channels | ✅ Three canonical channels only |

### Compliance Invariant

Any new source added to the tranche MUST publish through the existing adapter infrastructure. Creating a source-specific publication path is prohibited without Architecture-lead exception approval.

---

## 8. Acceptance Gate Reference

P2-C1 is primary evidence for the Publication gate:

| Field | Value |
|---|---|
| **Gate** | Publication gate |
| **Pass condition** | First-release required sources are classified and launch-critical sources publish correctly |
| **Evidence required** | Source tranche register (this document), publication readiness register (P2-C5), integration validation |
| **Primary owner** | Platform + Domain owners |

### Current Gate Status

- **Classification:** ✅ Complete — all 6 sources classified
- **Publication readiness:** ❌ Blocked — 4 of 5 required sources have unmet readiness gates
- **Integration validation:** ❌ Cannot proceed until readiness gates are met

---

## 9. Locked Decisions

| Decision | Locked Resolution | P2-C1 Consequence |
|---|---|---|
| First-release source scope | **Wave 1 business-core scope: Estimating, Business Development, Project Hub handoff signals, approvals, provisioning/admin exceptions** | These 5 sources (6 entries) are the governed first-release tranche |
| Notification relationship | **Notifications feed the hub via `@hbc/notification-intelligence`** | All sources with notification channels must register via notification-intelligence |

---

## 10. Register Precedence

| Deliverable | Relationship to P2-C1 |
|---|---|
| **P2-A1** — Operating Model Register | P2-C1 sources must publish through the aggregation invariants defined in P2-A1 §7 |
| **P2-A2** — Ranking Policy | P2-C1 priority mappings feed into P2-A2 scoring and lane assignment |
| **P2-B0** — Lane Ownership | P2-C1 sources must comply with anti-drift Rule 5 (shared primitive binding) |
| **P2-C2** — Notification-to-Work Mapping | P2-C2 defines how notification channels from P2-C1 sources transform into work items |
| **P2-C3** — Work-Item Navigation Matrix | P2-C3 defines per-source navigation behavior (deep link, preview, handoff) |
| **P2-C4** — Handoff Criteria Matrix | P2-C4 defines which P2-C1 sources route to Project Hub vs remain in hub |
| **P2-C5** — Pilot Publication Readiness | P2-C5 tracks integration testing readiness against P2-C1 readiness gates |

This register is updated as sources progress through readiness gates. Gate status changes require domain-owner confirmation and Platform-lead review.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §9.2, §10.3](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
