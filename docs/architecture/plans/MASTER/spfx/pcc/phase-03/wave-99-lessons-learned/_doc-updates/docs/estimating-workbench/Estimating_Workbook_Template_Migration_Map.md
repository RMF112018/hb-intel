# Estimating Workbook Template Migration Map
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

## Scope

Template migration only. Active project workbook import is not MVP.

## Mapping Rules

| Legacy Workbook Area | Future Treatment |
|---|---|
| Cost Summary | Canonical template section + summary records |
| Trade bid tabs | BidPackage + VendorBid + BidLevelingMatrix section |
| GC/GR | Canonical GC/GR section with scratchpad support |
| Allowances | Canonical Allowance records |
| Alternates / VE | Canonical Alternate records |
| SiteWorkPrices / UnitPrices | Reference/scratch/historical reference seed, human review required |
| Word C&A / RFI / Documents | Reference-only unless promoted into clarification/qualification records |
| Hidden unused trade tabs | Template optional sections, inactive by default |
| External links | Blocked from canonical migration; preserve source workbook only |
| Unsupported formulas | Static snapshot or human review; not authoritative |

## Confidence Scoring

- 90–100: map into candidate template automatically.
- 70–89: map with required human review.
- 40–69: unresolved mapping queue.
- below 40: reference-only.
