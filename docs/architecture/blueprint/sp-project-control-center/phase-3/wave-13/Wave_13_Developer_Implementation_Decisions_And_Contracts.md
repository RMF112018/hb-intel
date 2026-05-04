# Wave 13 Developer Implementation Decisions And Contracts

Date: 2026-05-02
Wave: 13
Module: `Buyout Log` (`Buyout Control Center`)

## Purpose

Publish the canonical Wave 13 developer implementation contracts for Buyout Log under blueprint documentation, aligned to Prompt 03 architecture and Prompt 01 workbook truth.

## Closed Implementation Decisions

- Primary record: `BuyoutPackage`.
- Workbook role: source field inventory and seed taxonomy, not UX contract.
- Procore role: read-only operational financial source.
- Sage role: read-only accounting truth.
- SharePoint / OneDrive role: evidence/document storage owner.
- PCC role: workflow state, BIC, exceptions, reconciliation, source lineage, and Priority Action candidates.
- External integration posture: read-only / source-lineage only.

## Primary Record and Child Records

Primary record: `BuyoutPackage`

Required child records:

- `BuyoutScopeLine`
- `BudgetAllocation`
- `CommitmentLink`
- `ComplianceRequirement`
- `ProcurementMilestone`
- `EvidenceLink`
- `ReconciliationIssue`
- `AuditEvent`
- `PriorityActionCandidate`

## Workbook Truth Contract (Prompt 01)

Reference workbook: `docs/reference/example/financial/Buyout Log_Template 2025.xlsx`

- sheet: `Sheet1`
- used range: `A1:N88`
- header row: `6`
- candidate buyout rows: `8–85`
- summary rows: `86–88`
- no hidden rows/columns
- no data validations
- no conditional formatting
- no defined names

Workbook-derived structure is a traceability input and seed taxonomy only.

## Field Mutability Contract

Field mutability authority is defined in:

- `reference/field_mutability_matrix.json`

Core posture:

- PCC-owned workflow fields are editable with audit.
- Source-derived operational/accounting fields are read-only and source-labeled.
- Derived/calculated fields are read-only.
- Override/waiver operations require audit and authority.

## State Machine Contract

Lifecycle states, transitions, exception handling, and completion-gate conditions are defined in:

- `reference/buyout_state_machine.json`

Deterministic posture:

- primary path is explicit;
- exception transitions are explicit;
- terminal statuses are explicit;
- completion is gate-based, not label-based.

## Completion Gate Contract

A package cannot be marked `complete` without all required posture satisfied:

- vendor posture;
- amount posture;
- LOI/subcontract/PO posture;
- Procore commitment posture;
- required compliance posture;
- procurement-risk posture;
- reconciliation posture;
- source-lineage posture.

Any waiver must include:

- reason;
- approver;
- timestamp;
- evidence.

## Reconciliation Rules Contract

Deterministic matching order and mismatch handling are defined in:

- `reference/buyout_module_data_contract.json`
- `reference/procore_buyout_data_mapping_reference.json`

Reconciliation outcomes must preserve:

- explicit source labeling;
- mismatch categorization;
- auditability for manual resolution;
- no external mutation.

## Priority Action Payload Contract

Priority Actions are candidate-only records and must not execute external operations.

Candidate payload posture includes:

- action type/category;
- linked buyout package and exception identifiers;
- owner/BIC routing metadata;
- severity/urgency fields;
- due/aging posture;
- source-lineage references.

## Audit Event Contract

Audit events must capture, at minimum:

- event id/type;
- actor/role;
- timestamp;
- record id;
- old/new values when applicable;
- reason codes when applicable;
- lineage/evidence references when applicable.

## Fixture Scenario Contract

Fixture scenario definitions are canonicalized in:

- `reference/fixture_scenarios.json`

Scenarios must represent:

- happy path package completion;
- over/under budget variance;
- missing commitment link;
- compliance waiver path;
- reconciliation mismatch path;
- blocked/deferred exception handling.

## Exception Reason Codes Contract

Canonical exception reason codes are defined in:

- `reference/buyout_exception_reason_codes.json`

Reason codes must be stable and auditable across:

- completion gates;
- reconciliation outcomes;
- waiver decisions;
- priority action candidate generation.

## External Integration Guardrails

- No direct SPFx-to-Procore behavior.
- No Procore write-back.
- No Sage write-back or accounting postings.
- No external-system writeback/sync/mirror mutation.
- No automatic creation of commitments, POs, subcontracts, CCOs, invoices, or accounting entries.

## Canonical Reference Files

- `reference/buyout_module_data_contract.json`
- `reference/buyout_state_machine.json`
- `reference/field_mutability_matrix.json`
- `reference/buyout_exception_reason_codes.json`
- `reference/fixture_scenarios.json`
- `reference/procore_buyout_data_mapping_reference.json`
- `reference/source_research_urls.json`

## Cross-Reference: Procore Data-Layer Overlay Authority

Active machine-readable authority path:
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/`

Interpretation bridge:

- Apply this wave document with the Prompt 03 governing-doc bridge in:
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
  - `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
  - `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
  - `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`

Distinction lock:

- Wave 13 Buyout Log remains the active module wave.
- Wave 13A-13F is a cross-cutting Procore data-layer overlay.
- `wave-99-procore/_doc-updates` is prior planning context only.

Runtime guardrail lock:

- This cross-reference does not authorize Procore runtime, Procore sync, Procore write-back, Procore SDK adoption, or Procore file mirroring.
- Live Procore read behavior remains gated until 13A-13F completion and a separate approved live-read proof gate.
