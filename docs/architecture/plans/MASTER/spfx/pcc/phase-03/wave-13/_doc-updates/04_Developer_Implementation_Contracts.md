# 04 — Developer Implementation Contracts

## Non-Negotiable Contracts

1. Primary object is `BuyoutPackage`.
2. Every workbook column survives as a traceable field.
3. Workbook rows are not active records until activated.
4. PCC owns workflow state; Procore owns commitment facts; Sage owns accounting facts.
5. All external values require source lineage.
6. No Procore/Sage write-back exists.
7. Completion is gate-based, not status-text-based.
8. Reconciliation matching follows deterministic rules.
9. Priority Actions use stable reason codes and dedupe keys.
10. All waivers require reason, approver, timestamp, and evidence.
11. Many-to-many budget/commitment/SOV mappings are supported.
12. The module is exception-first and role-aware.

## Reference JSONs

- `reference/buyout_module_data_contract.json`
- `reference/buyout_state_machine.json`
- `reference/field_mutability_matrix.json`
- `reference/buyout_exception_reason_codes.json`
- `reference/fixture_scenarios.json`
- `reference/procore_buyout_data_mapping_reference.json`

## Required Read Models

```ts
BuyoutSummaryReadModel
BuyoutPackageReadModel
BuyoutBudgetCommitmentMatrixReadModel
BuyoutReconciliationReadModel
BuyoutComplianceReadModel
BuyoutProcurementRiskReadModel
BuyoutPriorityActionCandidate
BuyoutSourceLineage
```

## Required Tests in Future Implementation

- field mutability tests;
- state transition tests;
- completion gate tests;
- reconciliation matching tests;
- source lineage tests;
- Priority Action generation tests;
- fixture rendering tests;
- no external write-back tests;
- no direct SPFx-to-Procore tests;
- workbook source mapping JSON validation;
- accessibility and responsive layout checks.
