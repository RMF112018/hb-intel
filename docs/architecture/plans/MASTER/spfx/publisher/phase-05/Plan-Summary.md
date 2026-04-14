# Plan Summary

## Objective

Close the remaining Publisher implementation defects in the correct dependency order so the app becomes internally coherent across:

- persisted master-record contract
- template resolution
- publish back-sync
- archive / withdraw lifecycle sync
- workflow history accuracy
- promotion-rule behavior clarity
- repo narrative clarity

## Prompt order

1. Resolve the `TemplateKey` contract contradiction
2. Persist authoritative `TargetSiteUrl` back to `HB Articles` after successful publish
3. Realign archive / withdraw master-record page-sync metadata with the downgraded binding row
4. Correct workflow-history actor attribution
5. Complete or narrow promotion-rule override behavior
6. Clean stale comments and drifted narrative

## Standard of completion

Each prompt must:
- scrub the full affected code path
- make only bounded changes
- validate against the tenant schema report
- leave closure proof behind before the next prompt starts
