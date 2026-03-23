# P3-E5: Schedule Module — Field and Data Model Specification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Document Type** | Module Field Specification |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |
| **Related Contracts** | P3-E1 §3.2 and §13, P3-E2 §4, P3-G1 §4.2, P3-H1 §18.5 |
| **Source Examples** | docs/reference/example/ |

---


---

> **This specification is split across multiple files.** This master file contains the module overview, operating model, and ownership maturity model. All data model, workflow, analytics, field execution, integration, business rules, and implementation details live in the numbered T-files listed below.

---

## Purpose

This specification defines the complete data model, field definitions, record contracts, status enumerations, business rules, lifecycle authority rules, and required workflows for the Schedule module implementation. Every field and rule described here **MUST** be implemented as specified. A developer reading this specification must have no ambiguity about what to build.

The Schedule module is a **governed schedule intelligence and collaborative execution operating model**. It is not a read-only tracker, not a milestone-only surface, and not a simple forecast-override mechanism. It delivers three integrated layers:

- **Governed master-schedule layer** — manages the authoritative imported CPM schedule source, frozen update snapshots, formal baselines, and canonical activity identity across schedule versions.
- **Managed operating layer** — manages PM-owned commitments, reconciliation state between imported source truth and managed forecasts, scenario branches, publication workflow, and activity-level planning.
- **Field execution layer** — manages work-package decomposition, look-ahead/short-interval planning, commitment-based execution, blocker and readiness tracking, acknowledgement, progress verification, and PPC-style execution metrics. This is a first-class collaborative execution layer, not a note-taking surface.

Milestones and deep schedule analytics serve as the executive, summary, and publication lens. Activity-level planning and reconciliation are first-class in the operating layer. The field layer supports offline-first participation, governed multi-party collaboration, and structured evidence capture.

**Upstream CPM tools remain authoritative for formal network authorship and baseline CPM data.** HB Intel owns managed commitments, scenarios, field planning, analytics, publication workflows, and collaborative execution records. Approved changes may be packaged for governed export or selective sync-back to upstream tools.

**Governance rule:** All threshold values, visibility policies, grading rules, causation taxonomies, confidence factor weights, roll-up rules, classification mappings, calendar rules, and workflow routing tables described as "Governed" in this document are managed and configurable exclusively by the Manager of Operational Excellence or an authorized Admin unless otherwise stated.

### Source Files (Reference Examples)

- `docs/reference/example/Project_Schedule.csv` — Primavera P6 CSV export (24 columns)
- `docs/reference/example/Project_Schedule.xer` — Primavera P6 XER native format
- `docs/reference/example/Project_Schedule.xml` — Primavera P6 XML export format

---


## Operating Model: Layer Summary

| Layer | Primary Records | Authority | Consumer |
|-------|----------------|-----------|----------|
| **Master Schedule** | CanonicalScheduleSource, ScheduleVersionRecord, BaselineRecord, ImportedActivitySnapshot | Imported CPM tool (upstream) | All layers |
| **Operating** | ManagedCommitmentRecord, ReconciliationRecord, ScenarioBranch | PM (current-state); PE (future-state) | Publication, Analytics |
| **Field Execution** | FieldWorkPackage, CommitmentRecord, BlockerRecord, ReadinessRecord, AcknowledgementRecord | Field superintendent, trade foreman, PM | Operating layer, Analytics |
| **Published Forecast** | PublicationRecord, PublishedActivitySnapshot | PM publish + PE approval | Health spine, executive review, reports |
| **Analytics / Intelligence** | ScheduleQualityGrade, ConfidenceRecord, FloatPathSnapshot, MilestoneSlippageTrend, RecommendationRecord | System-computed, governed rules | All consumers |
| **Scenario** | ScenarioBranch, ScenarioLogicRecord | PM draft; PE promotion | Operating layer, Published Forecast |
| **Artifact / Workflow** | LinkedArtifact, WorkflowHandoff, AcknowledgementRecord | Shared platform packages | Cross-module |
| **Policy / Config** | GovernedPolicySet, CalendarRule, ThresholdRule, CausationTaxonomy | Manager of Operational Excellence / Admin | All layers |

---


## Ownership Maturity Model

The module is designed to support a current-state-to-future-state ownership transition without requiring structural changes to the data model. Both states use the same record types; the difference is in role assignments on `CanonicalScheduleSource` and `PublicationRecord`.

| Ownership Dimension | Current State | Future State |
|--------------------|---------------|--------------|
| Imported source truth | PM | Scheduler |
| Working commitments | PM | PM |
| Scenario drafts | PM | PM |
| Project-level approval before publication | Project Executive (PE) | Project Executive (PE) |
| Publication authority | PM (with PE approval gate) | PE (with PM as initiator) |
| Leadership Executive involvement | Threshold-triggered only | Threshold-triggered only |

**Implementation requirement:** `CanonicalScheduleSource.sourceOwnerRole` and `PublicationRecord.initiatedByRole` must carry this ownership state explicitly. Role assignment is governed configuration, not hard-coded behavior. The platform must function correctly under either ownership model without code changes; only governed role assignments differ.

---


---

## File Index

| File | Contents |
|------|---------|
| [P3-E5-Schedule-Module-Field-Specification.md](P3-E5-Schedule-Module-Field-Specification.md) | Master index — Purpose, Operating Model Layer Summary, Ownership Maturity Model |
| [P3-E5-T01-Source-Identity-and-Versioning.md](P3-E5-T01-Source-Identity-and-Versioning.md) | §1 Identity/Versioning/Import, §17 Dual-Calendar Model |
| [P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md](P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md) | §2 Dual-Truth/Operating Layer, §4 Milestone Working Model |
| [P3-E5-T03-Publication-Layer.md](P3-E5-T03-Publication-Layer.md) | §3 Published Forecast Layer, §19 Schedule Summary Projection |
| [P3-E5-T04-Scenario-Branch-Model.md](P3-E5-T04-Scenario-Branch-Model.md) | §5 Scenario Branch Model |
| [P3-E5-T05-Field-Execution-Layer.md](P3-E5-T05-Field-Execution-Layer.md) | §6 Field Execution, §7 Acknowledgement, §8 Progress/Verification, §9 Roll-Up |
| [P3-E5-T06-Logic-Dependencies-and-Propagation.md](P3-E5-T06-Logic-Dependencies-and-Propagation.md) | §10 Logic Layers and Dependency Model |
| [P3-E5-T07-Analytics-Intelligence-and-Grading.md](P3-E5-T07-Analytics-Intelligence-and-Grading.md) | §11 Analytics/Grading/Confidence, §12 Recommendations, §13 Causation Taxonomy |
| [P3-E5-T08-Classification-Metadata-Offline-and-Sync.md](P3-E5-T08-Classification-Metadata-Offline-and-Sync.md) | §14 Classification/Metadata, §15 Offline/Sync, §16 Visibility/Participation |
| [P3-E5-T09-Platform-Integration-and-Governance.md](P3-E5-T09-Platform-Integration-and-Governance.md) | §18 Cross-Platform Workflow/Shared Packages, §20 Governance/Policy, §23 Executive Review |
| [P3-E5-T10-Business-Rules-Capabilities-and-Reference.md](P3-E5-T10-Business-Rules-Capabilities-and-Reference.md) | §21 Business Rules, §22 Required Capabilities, §27 Status Enumerations, §28 Field Index |
| [P3-E5-T11-Implementation-and-Acceptance.md](P3-E5-T11-Implementation-and-Acceptance.md) | §24 Implementation Guide, §25 Acceptance Gate, §26 Remaining Blockers |

### Reading order by concern

| Concern | Start here |
|---------|-----------|
| Schedule data model, import, identity | T01 |
| Dual-truth working model, milestones, commitments | T02 |
| Publication, health spine, canvas | T03 |
| Scenario branches and promotion | T04 |
| Field execution: work packages, commitments, blockers, readiness, progress | T05 |
| Logic layers, dependency model, impact propagation | T06 |
| Analytics, grading, confidence, recommendations, causation taxonomy | T07 |
| Classification, metadata, offline sync, visibility | T08 |
| Shared platform packages, workflow integration, governance policy | T09 |
| Business rules, required capabilities, status enums, field index | T10 |
| Implementation guide, acceptance gate, package blockers | T11 |
