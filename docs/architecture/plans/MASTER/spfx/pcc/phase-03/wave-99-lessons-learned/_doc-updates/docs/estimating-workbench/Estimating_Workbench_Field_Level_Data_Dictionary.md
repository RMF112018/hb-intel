# Estimating Workbench Field-Level Data Dictionary
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
  "Estimate": {
    "required": [
      "estimateId",
      "projectId",
      "projectNumber",
      "estimateName",
      "projectTypeTemplateId",
      "status",
      "createdBy",
      "createdAtUtc",
      "currentVersionId"
    ],
    "optional": [
      "ownerName",
      "clientName",
      "deliveryMethod",
      "contractType",
      "sourceNewProjectRequestId",
      "notes"
    ],
    "indexes": [
      "projectId",
      "projectNumber",
      "status",
      "projectTypeTemplateId",
      "currentVersionId"
    ]
  },
  "EstimateLineItem": {
    "required": [
      "lineItemId",
      "estimateId",
      "estimateVersionId",
      "sectionId",
      "sortKey",
      "description",
      "hbCostCode",
      "quantity",
      "unitOfMeasure",
      "unitCost",
      "extendedCost",
      "lineItemType",
      "sourceType"
    ],
    "optional": [
      "csiCode",
      "sageFutureCostCode",
      "bidPackageId",
      "scopePackageId",
      "formulaText",
      "formulaResult",
      "notes",
      "confidenceScore"
    ],
    "indexes": [
      "estimateId",
      "estimateVersionId",
      "sectionId",
      "hbCostCode",
      "bidPackageId"
    ]
  },
  "BidPackage": {
    "required": [
      "bidPackageId",
      "estimateId",
      "estimateVersionId",
      "packageName",
      "hbCostCodeFamily",
      "status",
      "ownerRole",
      "dueDate"
    ],
    "indexes": [
      "estimateId",
      "estimateVersionId",
      "status",
      "ownerRole"
    ]
  },
  "VendorBid": {
    "required": [
      "vendorBidId",
      "bidPackageId",
      "vendorName",
      "status",
      "baseBidAmount",
      "receivedDate",
      "scopeStatus"
    ],
    "sensitiveFields": [
      "baseBidAmount",
      "levelingAdjustments",
      "internalRecommendation",
      "estimatorNotes"
    ]
  },
  "BidLevelingAdjustment": {
    "required": [
      "adjustmentId",
      "bidPackageId",
      "vendorBidId",
      "adjustmentType",
      "amount",
      "reason",
      "createdBy",
      "createdAtUtc"
    ],
    "indexes": [
      "bidPackageId",
      "vendorBidId",
      "adjustmentType"
    ]
  },
  "AssumptionQualificationRecord": {
    "required": [
      "recordId",
      "estimateId",
      "estimateVersionId",
      "recordType",
      "text",
      "status",
      "ownerRole",
      "downstreamVisibility"
    ],
    "recordTypeValues": [
      "assumption",
      "inclusion",
      "exclusion",
      "qualification",
      "clarification",
      "risk-flag"
    ]
  },
  "HandoffPackage": {
    "required": [
      "handoffPackageId",
      "estimateId",
      "estimateVersionId",
      "snapshotId",
      "budgetSeedStatus",
      "buyoutSeedStatus",
      "validationStatus",
      "acceptedBy",
      "acceptedAtUtc"
    ],
    "indexes": [
      "estimateId",
      "estimateVersionId",
      "validationStatus"
    ]
  }
}
```
