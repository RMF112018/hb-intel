# Estimating Workbench State Machines
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
    "initial": "draft",
    "terminal": [
      "archived"
    ],
    "states": [
      "draft",
      "internal-review",
      "lead-estimator-review",
      "submitted",
      "handoff-candidate",
      "frozen-handoff-baseline",
      "superseded",
      "archived"
    ],
    "transitions": [
      [
        "draft",
        "internal-review"
      ],
      [
        "internal-review",
        "draft"
      ],
      [
        "internal-review",
        "lead-estimator-review"
      ],
      [
        "lead-estimator-review",
        "draft"
      ],
      [
        "lead-estimator-review",
        "submitted"
      ],
      [
        "submitted",
        "handoff-candidate"
      ],
      [
        "handoff-candidate",
        "frozen-handoff-baseline"
      ],
      [
        "frozen-handoff-baseline",
        "superseded"
      ],
      [
        "superseded",
        "archived"
      ]
    ],
    "locks": {
      "frozen-handoff-baseline": "line items, bid leveling, cost summary, assumptions, alternates, allowances immutable except correction snapshot"
    }
  },
  "EstimateVersion": {
    "initial": "draft",
    "states": [
      "draft",
      "snapshot",
      "frozen",
      "superseded",
      "archived"
    ],
    "transitions": [
      [
        "draft",
        "snapshot"
      ],
      [
        "snapshot",
        "frozen"
      ],
      [
        "frozen",
        "superseded"
      ],
      [
        "superseded",
        "archived"
      ]
    ]
  },
  "BidPackage": {
    "initial": "planned",
    "states": [
      "planned",
      "bidding",
      "leveling",
      "award-recommended",
      "buyout-seeded",
      "deferred",
      "cancelled"
    ],
    "transitions": [
      [
        "planned",
        "bidding"
      ],
      [
        "bidding",
        "leveling"
      ],
      [
        "leveling",
        "award-recommended"
      ],
      [
        "award-recommended",
        "buyout-seeded"
      ],
      [
        "planned",
        "deferred"
      ],
      [
        "bidding",
        "cancelled"
      ],
      [
        "leveling",
        "deferred"
      ]
    ]
  },
  "VendorBid": {
    "initial": "invited",
    "states": [
      "invited",
      "received",
      "incomplete",
      "leveled",
      "excluded",
      "carried",
      "selected-for-award",
      "archived"
    ],
    "transitions": [
      [
        "invited",
        "received"
      ],
      [
        "received",
        "incomplete"
      ],
      [
        "received",
        "leveled"
      ],
      [
        "leveled",
        "excluded"
      ],
      [
        "leveled",
        "carried"
      ],
      [
        "carried",
        "selected-for-award"
      ],
      [
        "excluded",
        "archived"
      ]
    ]
  },
  "HandoffPackage": {
    "initial": "draft",
    "states": [
      "draft",
      "validation-failed",
      "ready-for-review",
      "operations-review",
      "accepted",
      "returned",
      "frozen",
      "archived"
    ],
    "transitions": [
      [
        "draft",
        "validation-failed"
      ],
      [
        "draft",
        "ready-for-review"
      ],
      [
        "validation-failed",
        "draft"
      ],
      [
        "ready-for-review",
        "operations-review"
      ],
      [
        "operations-review",
        "accepted"
      ],
      [
        "operations-review",
        "returned"
      ],
      [
        "returned",
        "draft"
      ],
      [
        "accepted",
        "frozen"
      ],
      [
        "frozen",
        "archived"
      ]
    ]
  },
  "EstimateTemplate": {
    "initial": "draft",
    "states": [
      "draft",
      "review",
      "approved",
      "active",
      "retired"
    ],
    "transitions": [
      [
        "draft",
        "review"
      ],
      [
        "review",
        "approved"
      ],
      [
        "approved",
        "active"
      ],
      [
        "active",
        "retired"
      ]
    ]
  },
  "EstimateScratchpad": {
    "initial": "private-working",
    "states": [
      "private-working",
      "shared-working",
      "promotion-candidate",
      "promoted-to-canonical",
      "reference-only",
      "discarded"
    ],
    "transitions": [
      [
        "private-working",
        "shared-working"
      ],
      [
        "shared-working",
        "promotion-candidate"
      ],
      [
        "promotion-candidate",
        "promoted-to-canonical"
      ],
      [
        "promotion-candidate",
        "reference-only"
      ],
      [
        "private-working",
        "discarded"
      ]
    ]
  }
}
```
