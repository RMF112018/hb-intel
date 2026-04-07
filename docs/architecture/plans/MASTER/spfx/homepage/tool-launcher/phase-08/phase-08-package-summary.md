# Phase 08 — Package Summary

## Phase Title

Search, Personalization, and Refinement

## Objective

Implement the **search, personalization, and refinement** pass for Tool Launcher / Work Hub so the launcher becomes faster to navigate, easier to discover, and more refined in daily use without exceeding the current homepage lane architecture.

## What has already been solved

- the launcher architecture and hierarchy direction have already been defined
- the SharePoint list already exists and should already be wired through the Phase 01 adapter seam
- the desktop composition skeleton should already exist from Phase 02
- the flagship featured stage should already exist from Phase 03
- the utility rail and support actions should already exist from Phase 04
- the workflow shelves should already exist from Phase 05
- the all-platforms overlay / index layer should already exist from Phase 06
- responsive and authoring-safe behavior should already exist from Phase 07
- the homepage lane, Utility zone placement, and Signature Hero relationship are already established in repo truth

## What this phase must solve

- lock the search contract for platform discovery
- implement command-band search behavior and suggestions grounded in live launcher metadata
- define a lightweight personalization posture for favorites and recents only if supportable in the current architecture
- refine affordances, microcopy, focus behavior, and interaction polish across launcher regions
- prove that search and personalization improve access speed without flattening the launcher hierarchy

## Key repo constraints

- keep work within `apps/hb-webparts` unless shared extraction is clearly warranted
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package or mount/dispatch seam
- do not build a speculative persistence or recommendation platform
- do not allow search results to replace the launcher’s flagship / rail / shelf hierarchy as the dominant experience
- keep command-band behavior host-aware and accessible

## Required outputs

1. search contract and discovery model
2. command-band search and suggestion behavior
3. practical favorites / recents posture and implementation or documented deferral
4. micro-interaction and copy refinement across launcher surfaces
5. refinement proof and documentation updates

## Dependencies

Phase 01 should have established the normalized launcher seam, Phase 02 the desktop launcher skeleton, Phase 03 the flagship stage, Phase 04 the utility rail and support actions, Phase 05 the workflow shelves, Phase 06 the overlay / index layer, and Phase 07 the responsive and authoring hardening.

## Primary risks

- overbuilding search into a pseudo shell or global nav system
- implementing favorites or recents with brittle persistence assumptions
- allowing search results to flatten the premium launcher hierarchy
- introducing inaccessible suggestion behavior or weak keyboard handling
- using refinement work to conceal unresolved data or state problems
