# Estimating Commercial Template Contract
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

`ew-template-commercial-v1`

## Required Sections

- Cost Summary
- GC/GR
- SiteWorkPrices reference/scratch section
- UnitPrices reference/scratch section
- Allowances
- Alternates / VE
- Trade Bid Tabs by HB cost-code family
- Scope Package Builder
- Bid Leveling Workbench
- Assumptions / Inclusions / Exclusions / Qualifications
- Handoff Preview

## Default Metrics

- Total estimated cost
- Cost by HB cost-code family
- Cost by bid package
- GC/GR subtotal
- Allowance subtotal
- Alternate carried/not-carried totals
- Fee/markup/contingency summary where authorized

## Customization Rules

Custom sections are allowed only when classified as canonical, template-optional, scratchpad, or reference-only. Unclassified sections block template approval.
