# Estimating Multifamily Template Contract
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

## Template ID

`ew-template-multifamily-v1`

## Required Sections

- Cost Summary
- Multifamily Area / Unit Metrics
- GC/GR
- SiteWorkPrices reference/scratch section
- UnitPrices reference/scratch section
- Allowances
- Alternates / VE
- Trade Bid Tabs by HB cost-code family
- Unit / RSF / building-area cost analysis
- Scope Package Builder
- Bid Leveling Workbench
- Assumptions / Inclusions / Exclusions / Qualifications
- Handoff Preview

## Default Metrics

- Total estimated cost
- Cost per unit
- Cost per RSF / GSF where available
- Cost by building/area if used
- Cost by HB cost-code family
- GC/GR subtotal
- Allowance subtotal
- Alternates carried/not-carried

## Customization Rules

Unit/area metrics can vary by project, but all downstream handoff values must map to HB cost codes and the canonical handoff schema.
