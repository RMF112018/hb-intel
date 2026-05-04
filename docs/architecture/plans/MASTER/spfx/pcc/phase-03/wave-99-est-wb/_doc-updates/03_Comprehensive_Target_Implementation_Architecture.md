# Comprehensive Target Implementation Architecture — Estimating Workbench

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
