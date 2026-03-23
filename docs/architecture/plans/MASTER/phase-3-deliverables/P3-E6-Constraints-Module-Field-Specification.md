# P3-E6: Constraints Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.3 and §13, P3-E2 §5, P3-G1 §4.3, P3-H1 §6.3 |
| **Source Examples** | docs/reference/example/ |

---

> **This specification is split across multiple files.** This master file contains the module overview, operating model, and workspace authority model. All ledger data models, workflows, lineage rules, publication model, shared package integration, and implementation details live in the numbered T-files listed below.

---

## Purpose

This specification defines the complete data model, field definitions, record contracts, status enumerations, business rules, lifecycle authority rules, and required workflows for the Constraints module implementation. Every field and rule described here **MUST** be implemented as specified. A developer reading this specification must have no ambiguity about what to build.

The Constraints module is a **governed project-controls workspace** containing four peer operational ledgers. It is not a single-record constraint tracker, not a spreadsheet log replacement with one primary record type, and not a surface where risk, constraint, delay, and change are subordinated into a single record hierarchy. It delivers four integrated, independently governed ledgers:

- **Risk Ledger** — forward-looking risk identification, probability/impact assessment, mitigation tracking, and risk-to-constraint promotion. Risks are future possibilities, not active blockers.
- **Constraint Ledger** — active blockers and issues requiring management action. Constraints are present-state impediments, not the parent record type for delays or change events.
- **Delay Ledger** — contemporaneous delay event records, structured for claims-readiness and contemporaneous documentation. B+/C-ready evidence orientation with separation of time impact from cost/commercial impact.
- **Change Ledger** — change event management. Manual-native today; Procore-integrated in future phases. Shaped now for clean Procore mapping without requiring redesign at integration time.

Ledgers share a common module shell, governance framework, publication model, lineage model, and shared platform package integrations. They are operationally independent with governed spawn/promotion relationships between them.

**Governance rule:** All threshold values, taxonomy values, BIC team registries, probability/impact scales, stage-gate requirements, escalation timers, age buckets, confidence levels, and classification systems described as "Governed" in this document are managed and configurable exclusively by the Manager of Operational Excellence or an authorized Admin unless otherwise stated. Structural architecture (record schemas, lifecycle state machines, lineage model, publication model) is locked in code and spec.

---

## Operating Model: Layer Summary

| Layer | Primary Records | Authority | Consumer |
|-------|----------------|-----------|----------|
| **Risk Ledger** | `RiskRecord` | PM / Risk Owner | Constraint Ledger (spawn), Analytics, Review |
| **Constraint Ledger** | `ConstraintRecord` | PM | Delay Ledger (spawn), Change Ledger (spawn), Analytics, Review |
| **Delay Ledger** | `DelayRecord`, `DelayEvidenceAttachment` | PM / Project Controls | Change Ledger (link), Analytics, Claims packaging, Review |
| **Change Ledger** | `ChangeEventRecord`, `ChangeLineItem` | PM / Project Controls | Financial spine, Analytics, Review; Procore (integrated path) |
| **Lineage** | `LineageRecord`, `CrossLedgerLink` | System-managed | All ledgers, reporting |
| **Publication** | `LedgerPublishRecord`, `ReviewPackage` | PM (publish); Designated Approver | Executive review, Health spine, Reports |
| **Policy / Config** | `GovernedTaxonomy`, `ThresholdRule`, `StageGateRule`, `EscalationRule` | Manager of Operational Excellence / Admin | All layers |

---

## Workspace Authority Model

### Native vs integrated authority

| Ledger | Authority model | Notes |
|--------|----------------|-------|
| Risk | **HB Intel native** | No external system integration; HB Intel originates and owns all risk records |
| Constraint | **HB Intel native** | No external system integration; HB Intel originates and owns all constraint records |
| Delay | **HB Intel native** (with schedule reference integration) | Delay records are HB Intel-native; may consume governed schedule references from integrated schedule systems (P3-E5) |
| Change — manual mode | **HB Intel native** | Before Procore integration; HB Intel originates and owns all change event records |
| Change — integrated mode | **Dual authority** | HB Intel retains canonical identity and normalized status; Procore is the system of transaction for integrated change-event fields; authoritative transactional writes execute through Procore API paths |

### Live operational state vs published state

| Consumer | State used |
|----------|-----------|
| PM / Project controls dashboards | Live operational state (current ledger records) |
| Escalation queues and action queues | Live operational state |
| Native controls views | Live operational state |
| Executive / review-facing surfaces | Published state (published record snapshots or published review packages) |
| Health spine | Configurable: live counts for operational surfaces; published package counts for review surfaces |
| Work Queue | Live state (overdue, at-risk, escalation triggers from current ledger state) |
| Reports | Published package state (for review-bound reports); optionally live for operational reports |

### Delete / archive model

No hard delete after create/save. Users may abandon drafts before first save. After save:

- Records can only be **Voided** (user error, duplicates), **Cancelled** (deliberate withdrawal), **Superseded** (replaced by a newer record), or **Archived** (end-of-project or administrative closure).
- All terminal state transitions require: reason, actor, timestamp, and audit entry.
- Integrated Change records in Procore-integrated mode map external Procore cancellation/void states through the sync model rather than deleting the canonical HB Intel record.

---

## File Index

| File | Contents |
|------|---------|
| [P3-E6-Constraints-Module-Field-Specification.md](P3-E6-Constraints-Module-Field-Specification.md) | Master index — Purpose, Operating Model, Workspace Authority Model |
| [P3-E6-T01-Risk-Ledger.md](P3-E6-T01-Risk-Ledger.md) | §1 Risk record model, fields, lifecycle, categorization, governance |
| [P3-E6-T02-Constraint-Ledger.md](P3-E6-T02-Constraint-Ledger.md) | §2 Constraint record model, fields, lifecycle, categorization, governance |
| [P3-E6-T03-Delay-Ledger.md](P3-E6-T03-Delay-Ledger.md) | §3 Delay record model, schedule reference model, time/cost separation, evidence gates, claims-readiness |
| [P3-E6-T04-Change-Ledger.md](P3-E6-T04-Change-Ledger.md) | §4 Change event model, line items, Procore mapping, manual-to-integrated promotion |
| [P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md) | §5 Spawn/promotion rules, lineage metadata, related items, cross-ledger links |
| [P3-E6-T06-Publication-Review-and-Governance.md](P3-E6-T06-Publication-Review-and-Governance.md) | §6 Publication model, review packages, annotation scope, approval authority, governance framework |
| [P3-E6-T07-Platform-Integration-and-Shared-Packages.md](P3-E6-T07-Platform-Integration-and-Shared-Packages.md) | §7 Shared package reuse, spine events, Health/Work Queue/Reports downstream contracts |
| [P3-E6-T08-Implementation-and-Acceptance.md](P3-E6-T08-Implementation-and-Acceptance.md) | §8 Implementation Guide, acceptance gate, package blockers |

### Reading order by concern

| Concern | Start here |
|---------|-----------|
| Risk identification and assessment | T01 |
| Active blocker and issue management | T02 |
| Delay event records, schedule reference, claims-readiness | T03 |
| Change event management, Procore integration readiness | T04 |
| Cross-ledger spawn/promotion, lineage model, related items | T05 |
| Publication model, review packages, annotation, governance | T06 |
| Shared packages, spine events, downstream Health/Work Queue/Reports | T07 |
| Implementation guide, acceptance gate, blockers | T08 |
