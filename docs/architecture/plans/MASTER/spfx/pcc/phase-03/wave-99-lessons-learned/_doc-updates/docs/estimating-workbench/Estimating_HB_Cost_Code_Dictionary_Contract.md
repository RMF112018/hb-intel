# Estimating HB Cost Code Dictionary Contract
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.

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
