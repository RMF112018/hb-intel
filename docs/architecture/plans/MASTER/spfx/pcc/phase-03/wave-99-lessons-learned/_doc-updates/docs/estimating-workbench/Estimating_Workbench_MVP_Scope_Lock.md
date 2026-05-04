# Estimating Workbench MVP Scope Lock
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
  "featureId": "estimating-workbench",
  "status": "mvp_amendment_locked",
  "implementationVehicle": "SharePoint/SPFx-first",
  "topLevelRouteDecision": "no_new_top_level_pcc_shell_route_in_mvp",
  "mountingSurface": "project-readiness",
  "primaryWorkCenterId": "startup",
  "secondaryAffinities": [
    "procurement-and-buyout",
    "project-controls",
    "document-control",
    "lessons-learned"
  ],
  "mvpTemplates": [
    "commercial",
    "multifamily"
  ],
  "costCodeHierarchy": {
    "mvpPrimary": "HB internal cost codes",
    "futureMapping": [
      "Sage cost codes",
      "CSI/MasterFormat references",
      "Procore WBS/budget code references"
    ]
  },
  "workbookImportScope": "template_migration_only",
  "explicitlyDeferred": [
    "active project workbook import",
    "Sage writeback",
    "Procore writeback",
    "full Excel formula parity",
    "automated pricing recommendations",
    "award recommendations by HBI",
    "cross-project historical cost analytics beyond curated references"
  ],
  "dayOneCapabilities": [
    "estimate home",
    "template selector",
    "estimate builder",
    "cost summary",
    "GC/GR",
    "allowances",
    "alternates",
    "bid leveling workbench",
    "assumptions/inclusions/exclusions/qualifications register",
    "handoff preview",
    "snapshot/freeze",
    "Excel/PDF export",
    "template admin"
  ]
}
```
