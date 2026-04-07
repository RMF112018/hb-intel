# Phase 05 — Validation Checklist

Use this checklist to validate the Workflow Shelves phase before moving to Phase 06.

## Contract and grouping

- [x] workflow shelves render from the normalized launcher model, not raw SharePoint list fields
- [x] shelf grouping is driven by workflow/category metadata rather than hardcoded grouped-link logic
- [x] shelf ordering is deterministic and documented
- [x] card ordering inside each shelf is deterministic and documented

## Visual hierarchy

- [x] shelf cards are clearly subordinate to flagship cards
- [x] shelf visuals do not compete with the Signature Hero or featured stage
- [x] shelves do not read like a generic grouped-tile launcher box
- [x] shelf rhythm and separation feel deliberate in the Utility zone

## Data behavior

- [x] empty shelves suppress cleanly
- [x] audience filtering works without leaving broken containers
- [x] partial metadata degrades gracefully
- [x] missing logo or optional support metadata does not break shelf layout

## Homepage and repo safety

- [x] work remains inside the appropriate `apps/hb-webparts` homepage territory unless shared extraction was clearly justified
- [x] `@hbc/ui-kit/homepage` import discipline is preserved
- [x] no unnecessary shared-kit promotion occurred for tenant-specific shelf behavior
- [x] no cumulative package or mount/dispatch seam regressions were introduced

## Documentation and handoff

- [x] shelf contract and grouping rules are documented
- [x] live binding and suppression behavior are documented
- [x] composition proof is documented
- [x] Phase 06 handoff is documented clearly
