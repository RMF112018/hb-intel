# Wave 13 Required Fields, Statuses, and Contracts

## Workbook Header Fields to Preserve as Record Fields

1. `DIVISION # / DESCRIPTION` -> `scopeDescription`
2. `SUBCONTRACTOR / VENDOR` -> `selectedVendorName`
3. `CONTRACT AMOUNT` -> `pccAwardAmount`
4. `ORIGINAL BUDGET` -> `originalBudgetAmount`
5. `OVER/UNDER` -> `overUnderOriginalBudget`
6. `LOI DATE TO BE SENT` -> `loiSendTargetDate`
7. `LOI Returned Executed` -> `loiExecutedDate`
8. `Submittal Dates` -> `submittalDateSummary`
9. `Lead Times` -> `leadTimeDays`
10. `Sub Name` -> `derivedSubName`
11. `BALL IN COURT` -> `ballInCourtPersonOrRole`
12. `Enrolled in SDI [Yes/No]` -> `sdiEnrollmentStatus`
13. `Bond Required [Yes/No]` -> `bondRequirementStatus`
14. `COMMENTS` -> `comments`

## Required Primary and Child Records

Primary record:

- `BuyoutPackage`

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

## Required State / Status Categories

The local agent must inspect `buyout_state_machine.json` and implement exact repo-compatible status literals from that JSON where possible. If converting to TypeScript literals, preserve stable values and add tests.

At minimum, support these status families:

- buyout lifecycle status;
- package activation posture;
- commitment linkage posture;
- LOI/subcontract/PO posture;
- compliance posture;
- procurement risk posture;
- reconciliation posture;
- exception/deferred/waived posture;
- completion posture.

## Field Mutability Requirements

Use `field_mutability_matrix.json` as the source contract.

Core posture:

- PCC-owned workflow fields may be editable with audit.
- Source-derived Procore/Sage/accounting/operational fields are read-only and source-labeled.
- Calculated fields are read-only.
- Override/waiver operations require reason, approver, timestamp, and evidence.

## Completion Gate Requirements

A package cannot be marked complete without all required posture satisfied:

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

## Reconciliation Requirements

- Deterministic matching order.
- Explicit source labeling.
- Mismatch categorization.
- Manual-resolution auditability.
- No external mutation.
- No source-of-record overwrite.

## Priority Action Candidate Requirements

Priority Actions are candidate-only.

Payload should include:

- action type/category;
- linked buyout package id;
- linked exception/reconciliation id where applicable;
- owner/BIC metadata;
- severity/urgency;
- due/aging posture;
- source-lineage references;
- read-only/candidate semantics.

## Fixture Scenario Requirements

Implement deterministic scenarios representing:

- happy path package completion;
- over/under budget variance;
- missing commitment link;
- compliance waiver path;
- reconciliation mismatch path;
- blocked/deferred exception handling.

## Audit Event Requirements

Audit events must capture:

- event id/type;
- actor/role;
- timestamp;
- record id;
- old/new values when applicable;
- reason code when applicable;
- lineage/evidence references when applicable.
