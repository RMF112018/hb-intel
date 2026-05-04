# Estimating Workbench Read Model and Command Contract

```json
{
  "dataAccessDecision": "SharePoint-first through SPFx; use SPHttpClient for no-new-dependency baseline and evaluate PnPjs @pnp/sp for typed fluent batching after dependency gate",
  "readModels": [
    "EstimateHomeReadModel",
    "EstimateBuilderReadModel",
    "BidLevelingReadModel",
    "AssumptionsQualificationsReadModel",
    "TemplateAdminReadModel",
    "HandoffPreviewReadModel"
  ],
  "commands": [
    "CreateEstimate",
    "CreateEstimateVersion",
    "UpsertLineItemsBatch",
    "CreateBidPackage",
    "UpsertVendorBid",
    "CreateBidLevelingAdjustment",
    "PromoteScratchpadToCanonical",
    "RunHandoffValidation",
    "CreateHandoffSnapshot",
    "FreezeHandoffBaseline",
    "ExportEstimateSummary"
  ],
  "conflictPolicy": "optimistic concurrency using SharePoint eTag/version when available; section-level soft locks for editor experience; frozen versions immutable"
}
```
