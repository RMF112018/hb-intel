# 01 — Audit Summary

## Executive conclusion

The intended reaction capability is evident in the codebase, but it is not properly exposed on the public Kudos surface.

The current implementation supports reaction persistence and secondary-path execution, yet the primary homepage-facing module gives users no clear sign that reaction is available.

## Repo-truth summary

### What already exists

- `CelebrateCount` is part of the Kudos data shape and is passed through the read path.
- the governance writer has an explicit `celebrate` patch kind
- the employee-facing Kudos webpart already executes a celebrate action in the detail panel path
- the shared public surface already knows about `celebrateCount`

### What is missing on the public surface

- no obvious public reaction button or chip
- no zero-state affordance indicating likes/reactions are possible
- no direct callback-driven reaction seam on the main public card face
- no clear public reaction UX in the featured recognition presentation

## Correct diagnosis

This is **not** primarily a missing backend capability problem.
It is primarily a **UI contract + public interaction seam** problem.

## Ownership summary

### Shared owner
`packages/ui-kit/src/HbcPeopleCultureSurface/*`
should own:
- visible reaction affordance
- featured-card reaction control
- recent-row reaction indicator behavior if surfaced there
- shared visual states and button styling

### Public webpart owner
`apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
should own:
- reaction callback wiring
- optimistic or refreshed state handling
- cache refresh after celebrate writes

### Persistence owner
`apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
already owns:
- count updates through the celebrate patch/write path

## Required implementation posture

- add reaction visibly to the public surface
- use the existing persistence path
- do not bury the interaction in detail-only behavior
- do not implement the final fix as a local-only ad hoc button outside the shared surface
