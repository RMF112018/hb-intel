# Estimating Workbench Error / Degraded State Matrix
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
  "states": [
    {
      "state": "no-estimate",
      "message": "No estimate exists for this project."
    },
    {
      "state": "template-unavailable",
      "message": "Approved Commercial/Multifamily template is unavailable."
    },
    {
      "state": "partial-load",
      "message": "Some sections could not be loaded; editing disabled until reload."
    },
    {
      "state": "validation-blocked",
      "message": "Handoff validation has blocking errors."
    },
    {
      "state": "locked-by-user",
      "message": "Section is currently locked by another user."
    },
    {
      "state": "frozen-readonly",
      "message": "This version is frozen and cannot be edited."
    },
    {
      "state": "permission-redacted",
      "message": "Some estimate data is hidden based on your role."
    },
    {
      "state": "sharepoint-threshold-risk",
      "message": "Query requires a narrower filter or indexed view."
    }
  ]
}
```
