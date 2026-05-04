# 02 — Wave 13 Required Fields, Statuses, and Contracts

## Primary Record

`BuyoutPackage`

Required field families:

- identity: id, projectId, packageCode, csiCode, costCode, title, scopeDescription;
- source lineage: workbook row reference, source system refs, evidence links;
- governance: primarySurface, workCenterAffinity, readinessSignalBehavior;
- ownership: BIC, assigned personas, escalation personas;
- financial posture: budget amount, buyout forecast, commitment amount, variance, reconciliation status;
- procurement posture: package status, target award date, required-on-job date, lead-time exposure;
- source references: Procore commitment/subcontract/PO placeholder refs; Sage cost reference placeholders;
- compliance: SDI, bond, insurance, lien waiver, prequalification, contract documents;
- exceptions: scope gap, budget variance, missing commitment, missing evidence, compliance risk, schedule exposure;
- lifecycle contribution: readiness signal, memory refs, traceability edges, Priority Action candidates;
- audit: audit events, state transitions, evidence access.

## Child Collections

- `BuyoutScopeLine`
- `BudgetAllocation`
- `CommitmentLink`
- `ComplianceRequirement`
- `ProcurementMilestone`
- `EvidenceLink`
- `ReconciliationIssue`
- `AuditEvent`
- `PriorityActionCandidate`
- `ProjectMemoryContribution`
- `TraceabilityEdgeContribution`
- `HbiEligibilityMarker`

## Status Vocabularies

Package status:

- `seeded`
- `not-started`
- `scope-review`
- `bid-leveling`
- `negotiation`
- `pending-loi`
- `pending-contract`
- `committed`
- `partially-committed`
- `compliance-hold`
- `blocked`
- `closed`
- `not-applicable`

Reconciliation status:

- `not-linked`
- `linked-to-procore`
- `linked-to-sage-reference`
- `budget-under-buyout`
- `budget-over-buyout`
- `pending-review`
- `reconciled`
- `variance-exception`

Completion gate status:

- `not-ready`
- `ready-for-award`
- `ready-with-exceptions`
- `blocked`
- `complete`

## State Machine Rules

- No direct jump from `seeded` to `committed` unless explicit imported commitment lineage exists.
- `committed` requires commitment reference or documented waiver.
- `ready-for-award` requires scope review complete, budget allocation, vendor selection posture, compliance precheck, and evidence link.
- `compliance-hold` blocks completion gate.
- Budget variance above threshold creates Priority Action candidate.
- Missing source lineage blocks HBI eligibility.
- Warranty/claim/legal/accounting conclusions are prohibited.

## Unified Lifecycle Contributions

- Memory records: buyout decision, scope gap resolution, waiver rationale, vendor selection rationale.
- Traceability edges: cost code → buyout package → commitment ref → evidence ref → readiness gate.
- HBI citations: package summary, evidence link, source lineage only; no uncited answers.
- Audit events: state transition, evidence link viewed, source link launched, exception created, waiver recorded.
