# P1-A1: Data Ownership Matrix

**Document ID:** P1-A1
**Phase:** 1 (Foundation)
**Classification:** Internal — Architecture
**Status:** Draft
**Date:** 2026-03-16
**Read With:** [P1-A2-Source-of-Record-Register.md](./P1-A2-Source-of-Record-Register.md), [current-state-map.md](../../blueprint/current-state-map.md)

---

## Purpose

Define which data categories belong in which storage platforms and establish the ownership model for each domain's data. This matrix governs Phase 1 adapter design and data provisioning strategy, ensuring HB Intel respects SharePoint as the primary business data store while using Azure Table Storage for operational state.

---

## Data Category Taxonomy

HB Intel data falls into these categories, each with different storage and sync requirements:

| Category | Definition | Typical Lifetime | Primary Consumer |
|----------|-----------|-----------------|-----------------|
| **Transactional** | Business events, state changes, and commitments | Months to years | Domain repositories |
| **Reference** | Lookup tables, enumerations, configurations | Months to years (stable) | Dropdowns, filters, UI bindings |
| **Document Metadata** | SharePoint file attributes (name, modified, author, version) | Tied to document lifecycle | Search, audit, UI display |
| **Workflow State** | Provisioning status, approval workflow, transitional state | Hours to weeks | Platform orchestration, UI status |
| **Audit History** | Change logs, transition records, decision trails | Years (immutable) | Compliance, traceability, forensics |
| **Field Capture** | Measurements, observations, photos, time-series telemetry | Project duration | Domain-specific queries, analytics |
| **Search Index Inputs** | Denormalized or tokenized data fed to search service | Hours (eventual consistency) | Full-text search, discovery |
| **AI Context Inputs** | Data prepared for ML/AI inference (risk scoring, cost prediction) | Hours to days | AI/ML pipeline, recommendations |

---

## Storage Platform Decision Table

Each platform in the HB Intel stack owns specific data categories:

| Platform | Owns | Does NOT Own | Notes |
|----------|------|--------------|-------|
| **SharePoint Lists** | Transactional, reference, document metadata, workflow state (list items with status fields) | Operational ephemeral state, audit history, time-series telemetry | Single source of truth for business data; schema provisioned per project site |
| **SharePoint Document Libraries** | Document content, document metadata, version history | Data embedded in documents (must be extracted and versioned separately) | Content versioning and permissions tied to site/library; not used for bulk transactional state |
| **Azure Table Storage** | Workflow state (provisioning, approval queues), audit history, operational ephemeral state, cache invalidation signals | Authoritative business data, user identity, reference lookups | Append-only logs, high-throughput state transitions; GDPR-safe retention policy |
| **Redis Cache** | Ephemeral query results, session tokens, rate-limiting counters | Persistent state, audit trails, identity data | Non-authoritative; loss does not corrupt business data; sub-minute TTL typical |
| **External Systems** | Domain-specific data (Procore timesheets, Sage accounting, Autodesk schedules) | HB-provisioned site identity, project portfolio hierarchy | Federated identity; write-back through adapters only; Phase 4+ scope |
| **Microsoft Graph / Entra ID** | User identity (UPN, display name, group membership, email) | Project business data, domain-specific reference | Source of truth for authentication and RBAC; read-only in Phase 1 |
| **Azure SQL** | Long-term data warehouse, analytics, complex cross-project queries | Transactional writes (read-mostly copy), real-time state | Phase 7+ target; not in scope for Phase 1 |

---

## Domain Data Classification Table

This table maps each HB Intel domain to its primary store, read/write paths, and sync strategy:

| Domain | Primary Store | Write Path | Read Path | Sync Strategy | Phase |
|--------|---------------|-----------|-----------|---------------|-------|
| **leads** | SharePoint List (Sales site) | Proxy adapter → AF → PnPjs → List item POST | Proxy adapter → AF → PnPjs → List query | Real-time on write; list view polling for external changes | 1 |
| **project** | SharePoint Hub site + List | Proxy adapter → AF → PnPjs → Hub site provision + list item | Proxy adapter → AF → PnPjs → Hub list query | Provisioning event writes to Table Storage; then propagates to SharePoint | 1 |
| **estimating** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item POST/PATCH | Proxy adapter → AF → PnPjs → List query | Real-time; uses numeric item ID as stability anchor | 1 |
| **schedule** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item (structured as event records) | Proxy adapter → AF → PnPjs → List query + date filtering | Real-time; supports milestone grouping | 1 |
| **buyout** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item with PO metadata | Proxy adapter → AF → PnPjs → List query | Real-time; PO state tracked in list columns | 1 |
| **compliance** | SharePoint List + Document Library | Proxy adapter → AF → PnPjs → List item + doc upload | Proxy adapter → AF → PnPjs → List query + doc retrieval | Real-time; compliance records immutable after closure | 1 |
| **contracts** | SharePoint Document Library + List (contract metadata) | Proxy adapter → AF → PnPjs → Doc upload + metadata item | Proxy adapter → AF → PnPjs → Lib query + metadata join | Real-time; contract amendments tracked via doc versions | 1 |
| **risk** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item with risk attributes | Proxy adapter → AF → PnPjs → List query | Real-time; risk status and mitigation tracked in list columns | 1 |
| **scorecard** | SharePoint List (project site) | Proxy adapter → AF → PnPjs → List item (bid performance data) | Proxy adapter → AF → PnPjs → List query | Real-time; scorecards tied to lead and project context | 1 |
| **pmp** | SharePoint Document Library + List | Proxy adapter → AF → PnPjs → Doc upload + index item | Proxy adapter → AF → PnPjs → Lib query + metadata | Real-time; PMP is versioned document with structured outline | 1 |
| **auth** | Microsoft Graph / Entra ID | N/A (read-only; MSAL OBO) | MSAL OBO flow → AF → Graph query (users, roles, groups) | Cache in Azure Table Storage (eventual consistency, <5 min TTL) | 1 |

### Provisioning and Operational State

| Data | Primary Store | Write Path | Read Path | Sync Strategy | Phase |
|------|---------------|-----------|-----------|---------------|-------|
| **Provisioning state** | Azure Table Storage (partition by project ID) | Provisioning orchestrator → AF → Table insert/update | Status service → AF → Table query | Real-time; triggers downstream SharePoint site provisioning | 1 |
| **Audit log** | Azure Table Storage (append-only partition) | Adapter → AF → Table append | Audit service → AF → Table query (time range) | Eventual consistency; immutable; GDPR-safe retention | 1 |
| **Project identity mapping** | Azure Table Storage + SharePoint hub site ID | Provisioner → AF → Table + SharePoint site correlation | Cache + on-demand lookup | Real-time on provisioning; cached for reads | 1 |

---

## Storage Platform Capability Alignment

### SharePoint Lists
- **Best for:** Transactional domain data, reference data, structured workflow state
- **Limits:** Row size (5000 items soft limit per view; use incremental load), query latency (200-500ms typical), no aggregation queries
- **Consistency:** Strong consistency within list; eventual consistency across farms
- **Phase 1 Strategy:** All domain business data lives here; AF adapters use PnPjs for CRUD

### Azure Table Storage
- **Best for:** Operational state, audit trails, high-throughput writes, project identity mapping
- **Limits:** Partition key strategy critical (partition by project ID); 1 MB row size limit
- **Consistency:** Strong consistency within partition; eventual across partitions
- **Phase 1 Strategy:** Provisioning state, audit logs, project ID mapping; no business data

### Redis
- **Best for:** Session tokens, query result caching, rate limiting, ephemeral coordination
- **Limits:** No persistence; loss is acceptable
- **Consistency:** N/A (non-authoritative)
- **Phase 1 Strategy:** Optional; not required for MVP; future optimization

### External Systems
- **Phase 1 Role:** None (stub adapters only)
- **Phase 4+ Strategy:** Federated reads via adapters; write-back for time entries, cost actuals

---

## Open Decisions and Unknowns

| Decision | Scope | Owner | Target Phase |
|----------|-------|-------|--------------|
| **SharePoint list schema per domain** | Define columns, lookup relationships, calculated fields for leads, project, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp | Platform architecture | Phase 1 (early) |
| **Identity key stability** | Decide whether to expose SharePoint numeric item IDs or wrap with domain prefix (e.g., `est-12345` for estimating item 12345) | Platform architecture | Phase 1 |
| **Audit log retention policy** | GDPR retention windows, PII masking rules, archive strategy | Legal + platform ops | Phase 1 (late) |
| **Cache invalidation strategy** | When does AF invalidate Redis/in-memory caches on writes? Publish-subscribe or polling? | Platform architecture | Phase 2+ |
| **Cross-domain data joins** | Estimating items linked to project; buyout linked to estimating; how are these relationships stored? (List lookups, manifest in Table Storage, or redundant in both?) | Domain modeling | Phase 1 |
| **Workflow approval state location** | SharePoint list columns (simple) vs Table Storage (complex state machines)? | Platform architecture | Phase 1 |
| **Search and analytics data pipeline** | Does Phase 1 include search/analytics, or is that Phase 3+? If Phase 3+, where does denormalized data live in the interim? | Product roadmap | Phase 3+ |

---

## Data Ownership: Clear Boundaries

### Boundary 1: SharePoint is Authoritative for Business Data
- All transactional domain data (leads, project, estimating, schedule, buyout, compliance, contracts, risk, scorecard, pmp) originates and lives in SharePoint.
- AF adapters act as read-write bridges; they do not transform or filter domain data arbitrarily.
- If a conflict arises between SharePoint and cache/local copies, SharePoint wins.

### Boundary 2: Azure Table Storage Owns Operational State and Audit
- Provisioning state, approval workflow queues, audit logs, project identity mapping are Table Storage authority.
- SharePoint never contains "how we got here"; audit trails are immutable in Table Storage.
- AF services read from both layers and correlate data.

### Boundary 3: Microsoft Graph is Read-Only Identity Authority
- User identity (UPN, email, groups, roles) is read-only from Entra ID via Graph API.
- RBAC decisions are made client-side (after AF returns Graph user/group data) or server-side (AF checks roles before allowing writes).
- Phase 1 caches user/group data in Table Storage or Redis for performance; this cache is not authoritative.

### Boundary 4: External Systems Are Federated (Phase 4+)
- In Phase 1, external systems are not integrated; only stub adapters exist.
- When Phase 4+ integrates Procore, Sage, Autodesk, write-back is always through adapters, never direct.

---

## Decision Owners and Approval

| Role | Name | Approval Date |
|------|------|----------------|
| Platform Architecture Lead | — | — |
| Security and Compliance Lead | — | — |
| SharePoint Infrastructure Owner | — | — |

**Approval Status:** Pending
**Comments:** Document ready for stakeholder review. Decisions on audit retention, cache strategy, and identity wrapping are critical for Phase 1 readiness.

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-16 | Architecture | Initial draft; foundation for P1-A2 and adapter design |
