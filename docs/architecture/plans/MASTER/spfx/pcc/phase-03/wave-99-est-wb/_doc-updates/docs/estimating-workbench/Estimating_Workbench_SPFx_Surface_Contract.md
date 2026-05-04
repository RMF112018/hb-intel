# Estimating Workbench SPFx Surface Contract

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
