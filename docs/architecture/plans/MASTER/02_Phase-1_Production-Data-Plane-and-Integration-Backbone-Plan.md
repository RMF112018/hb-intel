# Phase 1 — Production Data Plane and Integration Backbone Plan

**Document ID:** 02  
**Classification:** Phase Master Plan  
**Status:** Draft for working use  
**Primary Role:** Replace mock-first behavior with real production-backed data, service, and integration paths
**Read With** docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md

## 1. Purpose

Phase 1 is where HB Intel stops behaving like a well-structured prototype and starts behaving like a real production platform. Its job is to complete the data and integration backbone so the rest of the product can attach to trustworthy repositories, service contracts, and write-safe workflows.

## 2. Phase Objectives

- Define and implement the canonical source-of-record model by domain and data class.
- Complete production-capable data access adapters and backend service contracts.
- Harden critical read/write paths with retry, idempotency, error handling, and observability.
- Remove mock adapters and placeholder service behavior from production paths.
- Establish contract tests and operational confidence for downstream phases.

## 3. Desired End State

At the end of Phase 1:
- critical production-facing flows use real adapters and service contracts
- staging can exercise real read/write behavior
- backend failure handling is visible and recoverable
- the platform has a stable contract layer for the hubs and domain modules to build on

## 4. In Scope

- Data ownership and source-of-record decisions
- Production adapter completion (SharePoint, proxy, API, and any other required real adapters)
- Backend route/service completion for critical workflows
- Identity and permission propagation through service boundaries
- Write safety, queue behavior, retry logic, and operational error states
- Contract, integration, and smoke testing of core data paths

## 5. Out of Scope

- Full UI completion of all domain modules
- Broad AI assistance activation
- Final enterprise rollout and training

## 6. Phase Workstreams

### 6.1 Workstream A — Data Ownership Model
**Goal:** define who owns what data and where it lives.

**Activities**
- Classify data by category: transactional, reference, document metadata, workflow state, audit history, field capture, search index inputs, AI context inputs.
- Decide which data remains in SharePoint, which is mediated by backend services, which stays in outside systems, and which HB Intel owns directly.
- Define project identity and record identity strategy across systems.

**Deliverables**
- Data ownership matrix (governance-level field ownership and authority)
- Identity and key strategy note
- Domain-by-domain source-of-record register
- SharePoint lists & libraries schema register (physical container definitions)
- Schedule ingestion & normalization schema (canonical model for heterogeneous schedule file imports)
- Reference data dictionary schema (cost codes and governed reference dictionaries)
- External financial data ingestion schema (Procore Budget and external cost-control imports)
- Operational register schema (hybrid issue/action/risk/constraint tracking)

### 6.2 Workstream B — Adapter Completion
**Goal:** complete production-capable repository adapters.

**Activities**
- Finish real adapters for targeted storage and service backends.
- Normalize repository interfaces so feature packages consume stable contracts.
- Remove implicit mock fallbacks from staging/prod paths.
- Add feature flags only where intentionally needed.

**Deliverables**
- Completed adapter backlog
- Repository contract definitions
- Mock-isolation policy for non-production paths

### 6.3 Workstream C — Backend Contract Completion
**Goal:** move the backend from helpful foundation to production-grade service layer.

**Activities**
- Complete required Azure Function routes/services for critical workflows.
- Standardize request/response shapes, validation, authentication, and authorization enforcement.
- Add durable logging, failure reporting, and operational visibility.
- Define integration boundaries for notifications, provisioning, and service-mediated workflows.

**Deliverables**
- Service contract catalog
- Validation and auth policy notes
- Backend operational checklist

### 6.4 Workstream D — Write Safety and Recovery
**Goal:** make failures survivable and explainable.

**Activities**
- Implement retry, idempotency, and queue-safe behavior for critical writes.
- Define user-visible failure and recovery states.
- Handle partial-failure scenarios across document, workflow, and notification actions.
- Record audit and provenance data for important transitions.

**Deliverables**
- Error / retry / recovery design
- Idempotency policy
- Failure-state UX requirements for consuming apps

### 6.5 Workstream E — Test and Observability Baseline
**Goal:** make the backbone measurable and trusted.

**Activities**
- Create contract tests for adapter and backend boundaries.
- Add staging smoke tests for critical flows.
- Confirm telemetry expectations for reads, writes, retries, failures, and latency.
- Create an early warning list for operational failure patterns.

**Deliverables**
- Contract test suite plan
- Critical flow smoke test list
- Telemetry baseline requirements

## 7. Key Milestones

### M1.1 — Data ownership model approved
The source-of-record and identity strategy is defined.

### M1.2 — Production adapters materially complete
Critical repository interfaces resolve to real adapters.

### M1.3 — Backend contract baseline complete
Critical service contracts are stable enough for staging.

### M1.4 — Write safety baseline live
Retry and recovery behaviors exist for the most important operations.

### M1.5 — Staging proves real backbone behavior
End-to-end staging tests confirm the backbone is usable.

## 8. Deliverables

Mandatory deliverables for Phase 1:
- Data Ownership Matrix (governance-level data authority)
- Source-of-Record Register
- SharePoint Lists & Libraries Schema Register (physical container definitions)
- Schedule Ingestion & Normalization Schema (canonical model for CSV/XML/XER schedule imports)
- Reference Data Dictionary Schema (cost codes and governed reference dictionaries)
- External Financial Data Ingestion Schema (Procore Budget and external cost-control imports)
- Operational Register Schema (hybrid issue/action/risk/constraint tracking)
- Adapter Completion Backlog and Status Tracker
- Service Contract Catalog
- Error / Retry / Recovery Design Note
- Contract Test Suite Plan
- Staging Readiness Checklist

## 9. Dependencies

### Incoming dependencies
- Phase 0 completed
- Baseline governance and environment rules in place

### Outgoing dependencies
Phase 1 enables:
- Personal Work Hub completion
- Project Hub completion
- real domain workflow completion
- search and connected-record indexing
- reliable field workflows

## 10. Acceptance Gates

Phase 1 is complete only when:
- production-facing reads and writes do not depend on mock adapters
- the team can explain where each critical data class lives and why
- critical service paths are authenticated, validated, and observable
- failures are recoverable and visible to both users and support staff
- downstream phase teams can build without inventing their own data contracts

## 11. Recommended Team Ownership

### Primary owner
Platform / Core Services Team

### Supporting owners
- DevSecOps / Enterprise Enablement
- Business Domains
- Project / Documents

### Required reviewers
- Architecture lead
- Security lead
- Operations / support lead

## 12. Decisions / Idea Curation Required

- How much data should remain SharePoint-native versus service-mediated?
- What is the long-term project identity strategy across HB systems?
- Which external systems are read-through only versus candidates for replacement?
- What is the acceptable latency and recovery target for critical writes?
- Which workflows require near-real-time behavior versus eventual consistency?

## 13. Risks if Under-executed

- domain teams will build against unstable or fake contracts
- search and project context will be inconsistent
- field workflows will fail unpredictably in real usage
- operational support burden will spike later
- later phases will be forced to re-open foundational data decisions

## 14. Recommended First Actions

1. Finalize the data ownership matrix before broad adapter implementation.
2. Identify the top 5 production-critical read/write flows and complete them first.
3. Lock the repository interfaces early so feature teams are not chasing moving targets.
4. Make failure behavior a first-class design item, not a cleanup task.
