# Phase 02 — Package Summary

## Phase Title

Desktop Composition Skeleton

## Objective

Implement the **desktop-first structural composition** for Tool Launcher / Work Hub using the Phase 01 live-data seam so the launcher proves the premium marketplace hierarchy at the page-canvas level.

## What has already been solved

- the overall launcher architecture and hierarchy direction have been defined
- the SharePoint list already exists and is the intended content source
- the homepage lane and Utility zone placement are already established in repo truth
- the current Tool Launcher webpart location and grouped local-config seam are identifiable
- the asset-manifest direction for platform logos and fallback strategy already exists

## What this phase must solve

- define the desktop anatomy and structural regions of the launcher
- establish a command band shell that can later host search and launcher actions
- establish a flagship stage shell that can render featured platforms at greater visual weight
- establish a quieter utility rail for support/access/notice content
- establish workflow shelf scaffolds for secondary platform organization
- prove that the launcher composition fits the homepage Utility zone cleanly

## Key repo constraints

- keep work within `apps/hb-webparts`
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package or mount/dispatch seam
- do not move business-specific list logic into shared kit prematurely
- do not let the launcher become a second hero or faux application shell

## Required outputs

1. launcher anatomy / region contract
2. desktop command-band shell
3. flagship stage shell
4. utility rail shell
5. workflow shelf scaffolds
6. reference-composition proof and implementation notes

## Dependencies

Phase 01 should be complete enough that a normalized launcher model or adapter seam exists, even if later phases will refine it further.

## Primary risks

- retaining the old grouped-tile mental model beneath a more decorative wrapper
- coupling composition directly to raw SharePoint field names instead of the normalized launcher contract
- overpromoting unfinished launcher business logic into shared primitives
- creating structural patterns that do not fit the Utility zone and homepage doctrine
- skipping authoring-safe empty or partial states during skeleton work
