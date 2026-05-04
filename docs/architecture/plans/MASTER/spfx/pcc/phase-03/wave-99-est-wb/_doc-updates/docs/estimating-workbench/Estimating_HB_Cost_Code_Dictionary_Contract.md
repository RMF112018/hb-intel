# Estimating HB Cost Code Dictionary Contract

## Closed Decision

MVP uses internal HB cost codes as the primary estimating cost-code hierarchy.

## Required Dictionary Fields

- `hbCostCode`
- `hbCostCodeDescription`
- `costCodeFamily`
- `tradePackageDefault`
- `defaultUnitOfMeasure`
- `activeFlag`
- `effectiveFromUtc`
- `effectiveToUtc`
- `commercialTemplateEnabled`
- `multifamilyTemplateEnabled`
- `futureSageCostCode`
- `futureSageTaskCode`
- `csiReference`
- `procoreWbsReference`
- `notes`

## Rules

- Every canonical line item requires an active HB cost code.
- Future Sage mapping fields may be blank in MVP but must exist.
- CSI/MasterFormat is reference-only in MVP.
- Procore WBS/budget references are future handoff references only; no writeback.
