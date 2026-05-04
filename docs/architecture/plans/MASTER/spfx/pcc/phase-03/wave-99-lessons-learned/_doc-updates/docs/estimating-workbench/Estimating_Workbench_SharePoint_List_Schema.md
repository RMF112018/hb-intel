# Estimating Workbench SharePoint List Schema
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
{
  "storageDecision": "central SharePoint/PCC estimating data site lists with PCC project-site projection; do not create isolated departmental workspace",
  "siteCollection": "HB Central / PCC Estimating Workbench data site (exact URL resolved by tenant implementation, not by this doc package)",
  "lists": [
    {
      "name": "EW_Estimates",
      "purpose": "estimate header registry",
      "indexedColumns": [
        "ProjectId",
        "ProjectNumber",
        "Status",
        "ProjectTypeTemplateId",
        "CurrentVersionId"
      ]
    },
    {
      "name": "EW_EstimateVersions",
      "purpose": "version and milestone state",
      "indexedColumns": [
        "EstimateId",
        "Status",
        "VersionNumber",
        "SnapshotId"
      ]
    },
    {
      "name": "EW_EstimateSections",
      "purpose": "section registry and display order",
      "indexedColumns": [
        "EstimateId",
        "EstimateVersionId",
        "SectionType",
        "TemplateId"
      ]
    },
    {
      "name": "EW_EstimateLineItems",
      "purpose": "canonical line items",
      "indexedColumns": [
        "EstimateId",
        "EstimateVersionId",
        "SectionId",
        "HbCostCode",
        "BidPackageId"
      ]
    },
    {
      "name": "EW_BidPackages",
      "purpose": "scope/bid package registry",
      "indexedColumns": [
        "EstimateId",
        "EstimateVersionId",
        "Status",
        "OwnerRole"
      ]
    },
    {
      "name": "EW_VendorBids",
      "purpose": "vendor/subcontractor bid responses",
      "indexedColumns": [
        "BidPackageId",
        "Status",
        "VendorName"
      ]
    },
    {
      "name": "EW_BidLevelingAdjustments",
      "purpose": "apples-to-apples leveling adjustments",
      "indexedColumns": [
        "BidPackageId",
        "VendorBidId",
        "AdjustmentType"
      ]
    },
    {
      "name": "EW_AssumptionsQualifications",
      "purpose": "assumptions inclusions exclusions qualifications clarifications risk flags",
      "indexedColumns": [
        "EstimateId",
        "EstimateVersionId",
        "RecordType",
        "Status"
      ]
    },
    {
      "name": "EW_HandoffPackages",
      "purpose": "frozen handoff package metadata",
      "indexedColumns": [
        "EstimateId",
        "EstimateVersionId",
        "ValidationStatus",
        "AcceptedAtUtc"
      ]
    },
    {
      "name": "EW_TemplateDefinitions",
      "purpose": "Commercial and Multifamily template definitions",
      "indexedColumns": [
        "TemplateId",
        "TemplateType",
        "Status",
        "Version"
      ]
    },
    {
      "name": "EW_AuditEvents",
      "purpose": "business audit trail",
      "indexedColumns": [
        "EstimateId",
        "EntityType",
        "EntityId",
        "ActorUpn",
        "CreatedAtUtc"
      ]
    }
  ],
  "libraries": [
    {
      "name": "EW_SourceWorkbooks",
      "purpose": "template migration source workbooks only; preserve originals"
    },
    {
      "name": "EW_SnapshotsAndExports",
      "purpose": "PDF/XLSX/export snapshots; metadata linked to EstimateSnapshot"
    }
  ],
  "thresholdGuardrails": [
    "all list queries must include indexed ProjectId or EstimateId filter",
    "no unfiltered all-items views",
    "line-item views must paginate/virtualize",
    "bulk reads/writes require batching strategy"
  ]
}
```

## View/Threshold Guardrails

Every list view and query must filter by an indexed project/estimate/version field. No unfiltered all-items operational view is allowed.
