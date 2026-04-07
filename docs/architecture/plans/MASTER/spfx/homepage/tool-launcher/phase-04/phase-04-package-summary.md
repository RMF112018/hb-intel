# Phase 04 — Package Summary

## Phase Title

Utility Rail and Support Actions

## Objective

Implement the **secondary utility rail** for Tool Launcher / Work Hub so the launcher supports help, access-request, notice, and light operational support behaviors without competing with the flagship platform stage.

## What has already been solved

- the launcher hierarchy and composition target have already been defined
- the SharePoint-backed launcher seam should already exist from Phase 01
- the desktop launcher skeleton should already exist from Phase 02
- the flagship stage and featured platform hierarchy should already exist from Phase 03
- launcher asset governance for brand treatment should already be in place for flagship cards

## What this phase must solve

- lock the utility-rail rendering contract
- define what content belongs in the rail versus later overlay/search phases
- bind help, support-owner, and access-request destinations from the normalized launcher model
- render notice / maintenance / outage treatment in a way that remains secondary to the flagship stage
- provide clean degraded and suppression rules when support metadata is partial or absent
- prove that the utility rail strengthens the launcher instead of becoming a clutter source

## Key repo constraints

- keep work within `apps/hb-webparts` unless shared extraction is clearly warranted
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package or mount/dispatch seam
- do not push tenant-specific support business logic into shared kit prematurely
- do not let the utility rail become a second launcher or alerts dashboard
- do not undermine the flagship-stage hierarchy established in Phase 03

## Required outputs

1. utility-rail rendering contract
2. local utility-rail surface / composition layer
3. normalized support-action binding
4. notice / maintenance / degraded-state behavior
5. composition proof and documentation updates

## Dependencies

Phase 01 should have established the normalized launcher seam, Phase 02 should have established the desktop shell, and Phase 03 should have established the flagship stage.

## Primary risks

- allowing the utility rail to become visually equal to the flagship stage
- binding support actions directly to raw SharePoint fields instead of normalized launcher records
- filling the rail with generic cards instead of tightly scoped support actions
- overbuilding notices into a noisy alerts panel
- coupling support-owner or request-access behavior too tightly to current seeded data quirks
