# Estimating Workbook Template Migration Map

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
