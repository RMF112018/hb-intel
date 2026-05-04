# Estimating Workbench SPFx Surface Contract
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

## Mounting Decision

- Top-level PCC surface: `project-readiness`
- Feature module id: `estimating-workbench`
- Primary work center id: `startup`
- No new top-level route in MVP.
- Add a Project Readiness tab/card/region labelled `Estimating Workbench`.

## Proposed Source Layout For Later Implementation

```text
apps/project-control-center/src/surfaces/estimatingWorkbench/
  EstimatingWorkbenchSurface.tsx
  EstimatingWorkbenchRegions.tsx
  estimatingWorkbenchAdapter.ts
  estimatingWorkbenchViewModel.ts
  useEstimatingWorkbenchReadModel.ts
  EstimatingWorkbench.module.css
apps/project-control-center/src/tests/estimatingWorkbench*.test.tsx
```

## State Requirements

- no-estimate
- loading
- partial-load
- error
- unauthorized
- permission-redacted
- frozen-readonly
- validation-blocked
- template-unavailable

## Data Access

MVP documentation may specify SharePoint-first read models. Later runtime implementation must choose between SPHttpClient baseline and gated PnPjs `@pnp/sp` adoption. Do not add direct Graph/Procore/Sage access from SPFx.
