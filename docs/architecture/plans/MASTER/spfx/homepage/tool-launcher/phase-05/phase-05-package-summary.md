# Phase 05 — Package Summary

## Phase Title

Workflow Shelves

## Objective

Implement the **curated workflow-shelf layer** for Tool Launcher / Work Hub so the launcher can expose secondary platforms through organized work-pattern shelves instead of falling back to generic grouped links or equal-weight icon grids.

## What has already been solved

- the overall launcher architecture and hierarchy direction have already been defined
- the SharePoint list already exists and should already be wired through the Phase 01 adapter seam
- the desktop composition skeleton should already exist from Phase 02
- the flagship featured stage should already exist from Phase 03
- the utility rail and support actions should already exist from Phase 04
- the homepage lane, Utility zone placement, and Signature Hero relationship are already established in repo truth

## What this phase must solve

- lock the workflow-shelf rendering contract
- group secondary platforms using normalized workflow shelf / category metadata
- create or refine the shelf-level local surface and secondary-card family
- render shelf ordering and card ordering from normalized launcher data
- suppress empty shelves and handle partial metadata gracefully
- preserve a clear hierarchy between flagship cards and secondary shelf cards

## Key repo constraints

- keep work within `apps/hb-webparts` unless shared extraction is clearly warranted
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package or mount/dispatch seam
- do not move business-specific workflow grouping logic into shared kit prematurely
- do not collapse shelves into the old grouped icon-tile pattern
- do not let the shelf layer compete with the Signature Hero or featured stage

## Required outputs

1. workflow-shelf rendering contract
2. shelf grouping and ordering logic
3. secondary shelf-card primitive or local surface family
4. live shelf binding from normalized launcher data
5. empty / partial / suppressed shelf behavior
6. composition proof and documentation updates

## Dependencies

Phase 01 should have established the normalized launcher seam, Phase 02 the desktop launcher skeleton, Phase 03 the flagship stage, and Phase 04 the utility rail and support actions.

## Primary risks

- reverting to generic grouped-tile thinking under the label of workflow shelves
- binding shelf rendering directly to raw SharePoint fields instead of the normalized launcher model
- making shelf cards too visually similar to flagship cards and flattening hierarchy
- over-hardcoding shelf buckets instead of using the normalized workflow/category metadata
- allowing partial metadata to produce awkward empty containers or weak authoring states
