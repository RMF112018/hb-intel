# Wave 13 — Developer Implementation Decisions and Contracts

## Closed Decisions

1. Primary record is `BuyoutPackage`.
2. Workbook rows are not active records until activated.
3. Every workbook column survives as a traceable field.
4. PCC owns workflow state and exceptions.
5. Procore owns operational commitment/budget records.
6. Sage owns accounting truth.
7. External integration is read-only.
8. Completion is gate-based.
9. Reconciliation uses deterministic matching.
10. Priority Actions are candidate records only.

## Data Contracts

See reference JSON files:

- `buyout_module_data_contract.json`
- `buyout_state_machine.json`
- `field_mutability_matrix.json`
- `buyout_exception_reason_codes.json`
- `fixture_scenarios.json`
- `procore_buyout_data_mapping_reference.json`

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

## Reconciliation Matching Order

1. Explicit manual link.
2. Procore commitment ID.
3. Procore commitment number.
4. Vendor + cost code + budget code.
5. Vendor + amount within tolerance.
6. Budget line + SOV allocation.
7. Manual review.

## Amount Tolerance

- Accounting-facing values require exact match.
- Operational warning threshold is `$500` or `0.5%`, whichever is lower.
