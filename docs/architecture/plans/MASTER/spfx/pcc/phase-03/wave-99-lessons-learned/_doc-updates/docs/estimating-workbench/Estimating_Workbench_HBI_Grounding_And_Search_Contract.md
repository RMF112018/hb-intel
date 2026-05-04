# Estimating Workbench HBI Grounding and Search Contract
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
  "allowedUseCases": [
    "missing-scope review",
    "similar-project reference summary",
    "bid-leveling delta explanation",
    "handoff risk summary",
    "assumption/exclusion extraction summary"
  ],
  "blockedUseCases": [
    "authoritative pricing",
    "award recommendation without human review",
    "legal entitlement or claims determination",
    "uncited cost assertion"
  ],
  "citationRequirement": "every HBI statement must cite estimate row, document, workbook source, or downstream source lineage",
  "refusalReasons": [
    "insufficient-evidence",
    "permission-redacted",
    "pricing-authority-blocked",
    "award-authority-blocked",
    "legal-claims-blocked",
    "source-lineage-missing"
  ]
}
```
