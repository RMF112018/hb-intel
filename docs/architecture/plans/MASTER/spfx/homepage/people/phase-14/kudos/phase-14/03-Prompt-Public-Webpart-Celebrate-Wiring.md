# 03 — Prompt: Public Webpart Celebrate Wiring

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Wire the new shared reaction affordance into the public HB Kudos webpart so reacting from the primary surface performs the actual celebrate write and updates the UI correctly.

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- any cache-refresh or state-refresh seams touched by public celebrate interaction

## Required outcomes

- clicking the public reaction control executes the existing celebrate action path
- celebrate count updates are persisted correctly
- the public UI refreshes correctly after the action
- repeated clicks are guarded appropriately if required
- no regression is introduced to the detail-panel celebrate path

## Required implementation direction

1. Audit how `HbKudos.tsx` currently wires celebrate behavior in the detail panel.
2. Reuse the existing governance writer path instead of creating a new persistence mechanism.
3. Add public-surface celebrate wiring through the new shared contract.
4. Handle loading / in-flight state so the UI does not double-fire or feel broken.
5. Ensure cache invalidation or refresh behavior keeps the public surface accurate after the action.

## Strong architecture rule

The public interaction must reuse the existing celebrate write seam.
Do not create a second celebrate persistence path.

## Explicit prohibitions

Do not:
- hardcode count increments in UI without persistence
- create a separate “public like” API path when celebrate already exists
- break the current detail-panel celebrate flow
- leave the UI requiring a manual page refresh to reflect the new count if a cleaner refresh path already exists

## Deliverables

Return:
- files changed
- summary of public reaction wiring
- summary of persistence seam reused
- summary of refresh / optimistic / loading behavior
