# Estimating Workbench Role / Action Permission Matrix
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
  "roles": [
    "estimating-coordinator",
    "estimator",
    "lead-estimator",
    "chief-estimator",
    "director-of-preconstruction",
    "project-executive",
    "project-manager",
    "project-accountant",
    "buyout-procurement",
    "executive-oversight",
    "pcc-admin",
    "it-admin"
  ],
  "actions": {
    "create-estimate": [
      "estimating-coordinator",
      "lead-estimator",
      "chief-estimator",
      "director-of-preconstruction",
      "pcc-admin"
    ],
    "edit-draft-line-items": [
      "estimator",
      "lead-estimator",
      "chief-estimator"
    ],
    "edit-template": [
      "chief-estimator",
      "director-of-preconstruction",
      "pcc-admin"
    ],
    "create-custom-section": [
      "estimator",
      "lead-estimator",
      "chief-estimator"
    ],
    "promote-scratchpad-data": [
      "lead-estimator",
      "chief-estimator"
    ],
    "create-bid-package": [
      "estimator",
      "lead-estimator",
      "chief-estimator"
    ],
    "view-vendor-pricing": [
      "estimator",
      "lead-estimator",
      "chief-estimator",
      "director-of-preconstruction",
      "project-executive"
    ],
    "freeze-handoff-baseline": [
      "lead-estimator",
      "chief-estimator",
      "director-of-preconstruction"
    ],
    "accept-handoff": [
      "project-executive",
      "project-manager"
    ],
    "export-proposal": [
      "lead-estimator",
      "chief-estimator",
      "director-of-preconstruction"
    ],
    "admin-repair": [
      "pcc-admin",
      "it-admin"
    ]
  },
  "sensitiveFields": [
    "vendor pricing",
    "estimator notes",
    "internal recommendations",
    "fee/markup",
    "contingency",
    "owner strategy"
  ]
}
```
