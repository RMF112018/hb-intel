# Phase 1 — Production Data Plane and Integration Backbone Plan

**Document ID:** 02
**Classification:** Phase Master Plan
**Status:** Planning Complete — implementation pending upstream deliverables
**Primary Role:** Define the production data plane, integration backbone, and service contract layer for HB Intel
**Read With:** [`00_HB-Intel_Master-Development-Summary-Plan.md`](00_HB-Intel_Master-Development-Summary-Plan.md)

---

### Phase 1 Planning Completion Summary

Phase 1 planning established the complete production data plane and integration backbone design for HB Intel. Twenty-four planning artifacts across five workstreams define data ownership, canonical schemas, production adapter architecture, backend service contracts, write-safety patterns, and contract testing infrastructure. All design decisions are locked and transport-shape conventions are fully reconciled.

Implementation proceeds as upstream deliverables are satisfied. As of 2026-03-19: B1 proxy transport foundation and 10 of 11 domain repos are implemented (Auth remaining — blocked on A9); C1 backend domain routes, C2 auth middleware, and C3 telemetry instrumentation are not yet started; staging readiness is not achievable until these and external dependencies (IT permissions, PO schema approval) are resolved. The detailed deliverable index and readiness positioning are maintained in [`phase-1-deliverables/README.md`](phase-1-deliverables/README.md); the blocker ledger is in [`phase-1-deliverables/P1-CLOSEOUT-Pre-Phase-1-Contradiction-Register.md`](phase-1-deliverables/P1-CLOSEOUT-Pre-Phase-1-Contradiction-Register.md).

---

## 1. Purpose

Phase 1 defined how HB Intel transitions from a well-structured prototype to a real production platform. It completed the data and integration backbone design so the rest of the product can attach to trustworthy repositories, service contracts, and write-safe workflows.

## 2. Phase Objectives

Phase 1 planning addressed the following objectives:

- Defined the canonical source-of-record model by domain and data class (Workstream A).
- Designed production-capable data access adapters and backend service contracts (Workstreams B, C).
- Specified hardening for critical read/write paths with retry, idempotency, error handling, and observability (Workstream D).
- Established mock-isolation governance to remove placeholder service behavior from production paths (Workstream B).
- Created contract testing infrastructure and staging readiness criteria for downstream phases (Workstream E).

## 3. Delivered End State (Planning Level)

At the planning completion of Phase 1:
- critical production-facing flows have defined real adapter and service contract designs
- staging exercise paths are specified with real read/write behavior
- backend failure handling is designed to be visible and recoverable
- the platform has a stable contract layer specification for the hubs and domain modules to build on
- all transport-shape conventions (response envelopes, error formats, pagination, route paths) are locked

## 4. Phase 1 Scope Delivered

Phase 1 planning covered:

- Data ownership and source-of-record decisions across 15+ business domains
- Production adapter architecture (SharePoint, proxy, API) with TDD engineering plans
- Backend route/service contract catalog for critical workflows
- Identity and permission propagation through service boundaries
- Write safety, retry logic, idempotency, and operational error state design
- Observability and instrumentation requirements
- Contract, integration, and smoke testing infrastructure
- Staging readiness criteria and operational sign-off process

## 5. Phase 1 Boundary Conditions

The following were explicitly outside Phase 1 scope:

- Full UI completion of all domain modules (Phase 2+)
- Broad AI assistance activation (Phase 7)
- Final enterprise rollout and training (Phase 7)
- Search and connected-record indexing (Phase 5)
- Field-first mobile/tablet workflows (Phase 6)

## 6. Phase Workstreams

### 6.1 Workstream A — Data Ownership Model

**Outcome:** Defined who owns what data and where it lives across all HB Intel domains.

**What was accomplished:**
- Classified data by category: transactional, reference, document metadata, workflow state, audit history, field capture, search index inputs, AI context inputs.
- Decided which data remains in SharePoint, which is mediated by backend services, which stays in outside systems, and which HB Intel owns directly.
- Defined project identity and record identity strategy across systems.
- Created canonical schemas for 15 business domains with governed field definitions, lifecycle rules, and integration mappings.

**Deliverables (15):**
- P1-A1 — Data Ownership Matrix (governance-level data authority)
- P1-A2 — Source-of-Record Register (domain-by-domain authority and identity strategy)
- P1-A3 — SharePoint Lists & Libraries Schema Register (physical container definitions)
- P1-A4 — Schedule Ingestion & Normalization Schema
- P1-A5 — Reference Data Dictionary Schema
- P1-A6 — External Financial Data Ingestion Schema
- P1-A7 — Operational Register Schema
- P1-A8 — Estimating Kickoff Schema
- P1-A9 — Permits & Inspections Schema
- P1-A10 — Project Lifecycle Checklist Schema
- P1-A11 — Responsibility Matrix Schema
- P1-A12 — Subcontractor Scorecard Schema
- P1-A13 — Lessons Learned Schema
- P1-A14 — Leads Schema (business development pipeline)
- P1-A15 — Prime Contracts Schema (owner/client-facing contracts)

### 6.2 Workstream B — Adapter Completion

**Outcome:** Designed production-capable repository adapters with TDD engineering plans and mock-isolation governance.

**What was accomplished:**
- Created TDD engineering plan for ProxyHttpClient and all 11 domain proxy repositories.
- Established adapter completion tracking model with gate definitions and evidence expectations.
- Defined mock-isolation policy ensuring no mock adapters appear in production-facing data flows.

**Deliverables (3):**
- P1-B1 — Proxy Adapter Implementation Plan
- P1-B2 — Adapter Completion Backlog and Status Tracker
- P1-B3 — Mock Isolation Policy

### 6.3 Workstream C — Backend Contract Completion

**Outcome:** Defined the complete backend service contract layer with auth hardening and observability.

**What was accomplished:**
- Cataloged all Azure Function routes distinguishing implemented routes from Phase 1 targets.
- Designed centralized auth middleware and Zod request validation.
- Specified telemetry, health checks, monitoring, and alerting requirements for all production surfaces.
- Locked transport-shape conventions: `{ data: T }` single-item wrapper, `message` error field, 25-item page size, PUT-only in Phase 1, nested project-scoped paths, 204 No Content deletes.

**Deliverables (3):**
- P1-C1 — Backend Service Contract Catalog
- P1-C2 — Backend Auth and Validation Hardening Plan
- P1-C3 — Observability and Instrumentation Spec

### 6.4 Workstream D — Write Safety and Recovery

**Outcome:** Designed failure-survivable write operations with retry, idempotency, and recovery patterns.

**What was accomplished:**
- Specified retry policy, idempotency keys, and queue-safe behavior for critical writes.
- Defined user-visible failure and recovery states.
- Designed partial-failure handling across document, workflow, and notification actions.
- Specified audit and provenance recording for important transitions.

**Deliverables (1):**
- P1-D1 — Write Safety, Retry, and Recovery Plan

### 6.5 Workstream E — Test and Observability Baseline

**Outcome:** Created contract testing infrastructure with locked transport conventions and staging readiness criteria.

**What was accomplished:**
- Designed Zod contract schemas for all 11 domain types with compile-time conformance checks.
- Created MSW test infrastructure plan for frontend adapter contract testing.
- Defined route contract test and error contract test patterns for backend.
- Established smoke-test input policy (skip locally, fail in CI) and telemetry gate evidence model (three-table correlation: requests + dependencies + traces).
- Reconciled all 18 locked design decisions into code examples and test assertions.
- Created staging readiness checklist with acceptance gates and dependency matrix.

**Deliverables (2):**
- P1-E1 — Contract Test Suite Plan
- P1-E2 — Staging Readiness Checklist

## 7. Planning Milestones Achieved

### M1.1 — Data ownership model defined
The source-of-record and identity strategy is defined across all domains in P1-A1 and P1-A2.

### M1.2 — Adapter architecture specified
Production adapter engineering plan covers all 11 domain repositories with TDD approach in P1-B1.

### M1.3 — Backend contract baseline cataloged
Service contracts are defined and transport conventions are locked in P1-C1.

### M1.4 — Write safety patterns designed
Retry, idempotency, and recovery behaviors are specified in P1-D1.

### M1.5 — Test and readiness infrastructure planned
Contract test suite, smoke-test policy, and staging readiness checklist are complete in P1-E1 and P1-E2.

## 8. Mandatory Deliverables

Phase 1 produced 24 planning artifacts. The detailed index with per-document status is maintained in [`phase-1-deliverables/README.md`](phase-1-deliverables/README.md).

| Workstream | Count | Deliverables |
|---|---|---|
| A — Data Ownership | 15 | P1-A1 through P1-A15 (ownership matrix, source-of-record register, 13 canonical schemas) |
| B — Adapter Completion | 3 | P1-B1 (proxy adapter plan), P1-B2 (completion tracker), P1-B3 (mock isolation policy) |
| C — Backend Contracts | 3 | P1-C1 (contract catalog), P1-C2 (auth hardening), P1-C3 (observability spec) |
| D — Write Safety | 1 | P1-D1 (write safety, retry, and recovery) |
| E — Test Baseline | 2 | P1-E1 (contract test suite plan), P1-E2 (staging readiness checklist) |

## 9. Dependencies

### Incoming (Phase 1 depended on)
- Phase 0 completed — baseline governance and environment rules established
- Current-state map verified — repo truth confirmed before planning began
- Package relationship map — dependency direction and ownership boundaries defined

### Outgoing (later phases can now rely on)
Phase 1 planning enables:
- **Phase 2 (Personal Work Hub):** Stable contract layer and adapter architecture to build against
- **Phase 3 (Project Hub):** Source-of-record authority and project identity strategy defined
- **Phase 4 (Core Business Domains):** Canonical schemas for all 15+ domains ready for implementation
- **Phase 5 (Search and Connected Records):** Data ownership model defines what is indexable and where
- **Phase 6 (Field Experience):** Write-safety and recovery patterns designed for field-first use
- **Phase 7 (Enterprise Readiness):** Observability and telemetry requirements specified

## 10. Phase 1 Completion Criteria

Phase 1 implementation will be complete when all of the following are satisfied:

- Production-facing reads and writes do not depend on mock adapters
- The team can explain where each critical data class lives and why — grounded in P1-A1 and P1-A2
- Critical service paths are authenticated, validated, and observable per P1-C1, P1-C2, and P1-C3
- Failures are recoverable and visible to both users and support staff per P1-D1
- Downstream phase teams can build against stable contracts defined in P1-C1 and validated by P1-E1
- Telemetry signals (requests, dependencies, traces) are correlated and verifiable in staging
- P1-E2 staging readiness checklist is complete with all gates passed

## 11. Team Ownership

### Primary custodian
Platform / Core Services Team — owns the data plane, adapter architecture, backend contracts, and testing infrastructure defined in Phase 1.

### Supporting custodians
- **DevSecOps / Enterprise Enablement** — deployment, environment, and operational infrastructure
- **Business Domains** — domain-specific schema validation and data authority confirmation
- **Project / Documents** — project-scoped data and document domain expertise

### Required reviewers for implementation
- Architecture lead
- Security lead
- Operations / support lead

## 12. Resolved Decisions

These questions were identified at planning start and resolved through the deliverables:

| Question | Resolution | Reference |
|---|---|---|
| How much data should remain SharePoint-native versus service-mediated? | Defined per domain in data ownership matrix and source-of-record register | P1-A1, P1-A2 |
| What is the project identity strategy across HB systems? | Record identity and keying strategy defined in source-of-record register | P1-A2 |
| Which external systems are read-through only versus replacement candidates? | External system integration patterns defined per domain | P1-A2, P1-A6 |
| Transport shape conventions (response envelopes, error formats, routes) | All locked: `{ data: T }` wrapper, `message` error field, plural routes, nested paths, 25-item pages, PUT-only, 204 deletes | P1-E1 Locked Decisions |

## 13. Carry-Forward Architecture Questions

These questions were scoped out of Phase 1 or remain partially open for later phases:

- What is the acceptable latency and recovery target for critical writes? (partially addressed in P1-D1; final SLAs require production measurement)
- Which workflows require near-real-time behavior versus eventual consistency? (design patterns in P1-D1; runtime classification deferred to implementation)
- Full auth route catalog beyond `/api/auth/me` smoke utility (deferred to C2 delivery; see P1-E1 decision 12)

## 14. Risks Being Mitigated

Phase 1 planning explicitly mitigates the following risks. These remain relevant during implementation:

- **Unstable contracts:** Domain teams building against fake or shifting contracts — mitigated by P1-C1 locked contract catalog and P1-E1 contract test suite
- **Inconsistent data:** Search and project context built on unreliable data paths — mitigated by P1-A1/A2 source-of-record governance
- **Unpredictable failures:** Field workflows failing without recovery — mitigated by P1-D1 write-safety design
- **Operational blind spots:** Support burden spiking without telemetry — mitigated by P1-C3 observability spec and P1-E1 telemetry gate evidence
- **Foundational rework:** Later phases forced to re-open data ownership decisions — mitigated by completing all A-series schemas during planning

## 15. Phase 1 Execution Priorities

When implementation begins, the recommended sequencing is:

1. Finalize SharePoint list schema approvals (external dependency) to unblock P1-A3 physical deployment and P1-B1 adapter implementation.
2. Implement the proxy adapter (P1-B1) to unblock write-safety (P1-D1) and adapter contract tests (P1-E1 Tasks 4–5).
3. Implement backend route handlers (P1-C1) to unblock route contract tests (P1-E1 Tasks 6–7) and staging readiness.
4. Implement auth middleware (P1-C2) to unblock smoke test auth validation.
5. Deploy observability instrumentation (P1-C3) to unblock telemetry baseline verification.
6. Complete P1-E2 staging readiness checklist as the final sign-off gate.

**Implementation-entry gate:** The Phase 1 deliverables README defines a three-tier implementation-entry gate (Tier 1: proceed now, Tier 2: proceed after named prerequisite, Tier 3: blocked on external approval) with concrete conditions for narrow kickoff versus broad execution. See [`phase-1-deliverables/README.md`](phase-1-deliverables/README.md) §Phase 1 Implementation-Entry Gate for the current assessment.

## 16. Delivered Capability Summary (Planning Level)

| Capability | Coverage | Key Deliverables |
|---|---|---|
| Data ownership and source-of-record | All 15+ business domains classified | P1-A1, P1-A2 |
| Canonical schemas and data governance | 15 governed schema definitions | P1-A3 through P1-A15 |
| Adapter architecture | TDD proxy adapter plan for 11 repositories; mock-isolation governance | P1-B1, P1-B2, P1-B3 |
| Backend service contracts | Complete HTTP route catalog with locked transport conventions | P1-C1 |
| Auth and validation hardening | Centralized middleware design with Zod validation | P1-C2 |
| Observability and instrumentation | Telemetry, health, monitoring, alerting requirements | P1-C3 |
| Write safety and recovery | Retry, idempotency, audit, failure-handling patterns | P1-D1 |
| Contract testing infrastructure | Zod schemas, MSW handlers, smoke-test policy, locked conventions | P1-E1 |
| Staging readiness criteria | Operational checklist with dependency matrix and acceptance gates | P1-E2 |

## 17. How to Use This Plan Now

| Goal | Start Here |
|---|---|
| Understand what Phase 1 covers and why | Sections 1–3 (purpose, objectives, end state) |
| Check what was in and out of scope | Sections 4–5 (scope delivered, boundary conditions) |
| Understand a specific workstream | Section 6 (workstream summaries with deliverable lists) |
| Find the detailed deliverable index | [`phase-1-deliverables/README.md`](phase-1-deliverables/README.md) |
| Understand implementation sequencing | Section 15 (execution priorities) |
| Check completion criteria | Section 10 (what defines Phase 1 as done) |
| Understand what later phases can rely on | Section 9 (outgoing dependencies) |
| Check resolved vs carry-forward decisions | Sections 12–13 |
| Plan Phase 2+ work | Section 9 (outgoing) → Section 16 (capability summary) → deliverables README |

---

## Related Documents

- **Program Summary:** [`00_HB-Intel_Master-Development-Summary-Plan.md`](00_HB-Intel_Master-Development-Summary-Plan.md)
- **Phase 0 Plan:** [`01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`](01_Phase-0_Program-Control-and-Repo-Truth-Plan.md)
- **Phase 1 Deliverables Index:** [`phase-1-deliverables/README.md`](phase-1-deliverables/README.md)
- **Current-State Map:** [`../blueprint/current-state-map.md`](../blueprint/current-state-map.md)
- **Package Relationship Map:** [`../blueprint/package-relationship-map.md`](../blueprint/package-relationship-map.md)

---

**Last Updated:** 2026-03-18
**Governing Authority:** [`00_HB-Intel_Master-Development-Summary-Plan.md`](00_HB-Intel_Master-Development-Summary-Plan.md)
