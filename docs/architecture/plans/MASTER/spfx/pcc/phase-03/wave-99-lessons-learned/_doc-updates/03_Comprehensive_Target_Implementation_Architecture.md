# Comprehensive Target Implementation Architecture — Estimating Workbench
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

## Wave 13G Target Paths

| Artifact Family | Required Repo Path |
| --- | --- |
| Wave authority root | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/` |
| Wireframes | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/` |
| Developer contracts | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/` |
| Machine-readable references | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/reference/` |
| Prompt closeouts | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/closeouts/` |

All generated documentation and implementation prompts must use these paths. Do not create a parallel `wave-99-estimating-workbench`, top-level `estimating-workbench-developer-contracts`, or separate future wave for Estimating Workbench unless a later approved authority update supersedes Wave 13G.


## Architecture Thesis

Estimating Workbench is a SharePoint/SPFx-first PCC MVP module that replaces the legacy estimating workbook process with an estimator-friendly grid experience backed by canonical structured data.

It is not a spreadsheet clone. It is not a Procore/Sage/Autodesk replacement. It is not a separate department portal. It is a PCC lifecycle continuity feature that captures estimating intent, bid leveling, assumptions, exclusions, qualifications, alternates, allowances, GC/GR, and handoff data in a way downstream operations can consume.

## Runtime Shape

```text
PCC Project Readiness Surface
  └── Estimating Workbench lens/module
        ├── Estimate Home
        ├── Template Selector
        ├── Estimate Builder Grid
        ├── Cost Summary
        ├── GC/GR
        ├── Bid Leveling Workbench
        ├── Assumptions / Inclusions / Exclusions / Qualifications
        ├── Alternates / Allowances / Contingency
        ├── Handoff Preview
        └── Template Admin

SharePoint/PCC Estimating Data Site
  ├── EW_Estimates
  ├── EW_EstimateVersions
  ├── EW_EstimateSections
  ├── EW_EstimateLineItems
  ├── EW_BidPackages
  ├── EW_VendorBids
  ├── EW_BidLevelingAdjustments
  ├── EW_AssumptionsQualifications
  ├── EW_HandoffPackages
  ├── EW_TemplateDefinitions
  ├── EW_AuditEvents
  ├── EW_SourceWorkbooks library
  └── EW_SnapshotsAndExports library
```

## Implementation Priorities

1. Documentation lock and schema definitions.
2. Central SharePoint list/library schema contract.
3. Commercial and Multifamily template seed contracts.
4. HB internal cost-code dictionary contract.
5. SPFx surface contract under Project Readiness.
6. Grid/formula behavior lock.
7. Handoff schema and downstream mapping.
8. Dependency evaluation, but no install until approved implementation gate.

## MVP Cutline

MVP includes estimate creation, Commercial/Multifamily template selection, grid line-item editing, GC/GR, allowances, alternates, bid leveling, assumptions/inclusions/exclusions/qualifications, validation, snapshot/freeze, export, and handoff preview.

MVP excludes active workbook import, live Sage/Procore writeback, full formula parity, automated pricing, automated award recommendation, and broad historical-cost analytics.
