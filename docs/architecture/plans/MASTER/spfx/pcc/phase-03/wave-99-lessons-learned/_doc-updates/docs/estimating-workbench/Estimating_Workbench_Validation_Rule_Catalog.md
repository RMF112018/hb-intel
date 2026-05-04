# Estimating Workbench Validation Rule Catalog
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

```json
[
  {
    "id": "EW-V001",
    "rule": "Every canonical line item must carry an active HB internal cost code.",
    "severity": "error",
    "appliesTo": "EstimateLineItem",
    "blocksHandoff": true
  },
  {
    "id": "EW-V002",
    "rule": "Every estimate must use exactly one approved Commercial or Multifamily template in MVP.",
    "severity": "error",
    "appliesTo": "Estimate",
    "blocksHandoff": true
  },
  {
    "id": "EW-V003",
    "rule": "Every bid package must have at least one scope definition and one owner role.",
    "severity": "error",
    "appliesTo": "BidPackage",
    "blocksHandoff": true
  },
  {
    "id": "EW-V004",
    "rule": "Every carried VendorBid must have bid amount, scope status, qualification summary, and leveling status.",
    "severity": "error",
    "appliesTo": "VendorBid",
    "blocksHandoff": true
  },
  {
    "id": "EW-V005",
    "rule": "Alternates must state carried/not-carried status and link to affected scope/cost code where applicable.",
    "severity": "error",
    "appliesTo": "Alternate",
    "blocksHandoff": true
  },
  {
    "id": "EW-V006",
    "rule": "Allowances must state owner, amount, scope basis, and included/excluded downstream behavior.",
    "severity": "error",
    "appliesTo": "Allowance",
    "blocksHandoff": true
  },
  {
    "id": "EW-V007",
    "rule": "Custom sections must be classified as canonical, template-optional, scratchpad, or reference-only.",
    "severity": "warning",
    "appliesTo": "EstimateCustomSection",
    "blocksHandoff": false
  },
  {
    "id": "EW-V008",
    "rule": "External workbook formulas are not authoritative in MVP and require static value snapshot or human review.",
    "severity": "warning",
    "appliesTo": "WorkbookTemplateMigration",
    "blocksHandoff": false
  },
  {
    "id": "EW-V009",
    "rule": "Frozen handoff baseline cannot be edited; corrections require a new correction snapshot.",
    "severity": "error",
    "appliesTo": "EstimateVersion",
    "blocksHandoff": true
  },
  {
    "id": "EW-V010",
    "rule": "HBI summaries require source row/document lineage and may not price work or recommend award without human review.",
    "severity": "error",
    "appliesTo": "HbiReview",
    "blocksHandoff": false
  }
]
```
