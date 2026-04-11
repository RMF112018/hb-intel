# Prompt 02 — Architecture and Ownership Audit

You are working in the live HB Intel repo.

Your task is to complete a **repo-truth architecture and ownership audit** for the HB Kudos people-picker path and lock the correct shared ownership decision before any implementation change proceeds.

## Read First

Read only the smallest authoritative set needed.

Do **not** reread files already in current context unless they changed, the context is stale, or scope expanded.

Start with these files:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcPeoplePicker/index.tsx`
- `packages/ui-kit/src/HbcPeoplePicker/types.ts`
- `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/README.md`
- `docs/reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md`
- `CLAUDE.md`

Read additional files only if needed to resolve a concrete boundary or consumer issue.

## Primary Goal

Produce a locked architecture decision for where the shared people picker belongs, what logic must move into it, what logic must stay local, and what exports must exist for HB Kudos to consume it correctly.

## Mandatory Findings

Answer all of the following explicitly in your working notes and final audit summary:

1. What file currently owns query input behavior?
2. What file currently owns search dispatch?
3. What file currently owns response parsing?
4. What file currently owns ranking/filtering?
5. What file currently owns result rendering?
6. What file currently owns chip/token selection?
7. What file currently owns avatar rendering?
8. What parts are Kudos-specific and what parts are durable reusable UI?
9. What is the correct durable package boundary?
10. What is the correct export boundary for homepage/SPFx consumers?

## Decision Locks

Lock the following decisions unless repo truth proves they are impossible:

- Durable reusable picker UI must not remain inside `HbcKudosComposer`.
- Durable reusable picker UI must not be implemented under `apps/hb-webparts`.
- The existing `packages/ui-kit/src/HbcPeoplePicker/` lane is the default target unless repo truth reveals a stronger already-existing shared lane.
- HB Kudos homepage consumers must use the governed homepage export surface where appropriate.
- The agent must not create a second shared picker implementation.

## Deliverable

Create a concise audit note in the repo’s appropriate local docs/worklog location or in your execution notes that includes:

- current-state ownership matrix
- recommended target-state ownership matrix
- locked package destination
- locked homepage export decision
- identified migration seam for HB Kudos
- list of files that will be modified in later prompts

Do not implement the extraction yet.

Stop after the architecture decision is unambiguous.
