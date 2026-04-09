# Prompt 04 — Scheduling, Prominence, and Detail-Panel Governance

## Objective

Implement admin-only scheduling, featured/pinned rules, prominence conflict handling, and the shared role-aware detail-panel governance model.

## Required Inputs

- live repo: `https://github.com/RMF112018/hb-intel`
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent homepage/data/contracts/helper seams
- `packages/ui-kit/`
- `docs/reference/ui-kit/`
- `Decision-Lock-Appendix.md`
- `Plan-Summary.md`

## Governing Rules

- Treat repo truth as authoritative.
- Implement the locked decisions exactly unless a hard repo-truth conflict prevents it.
- Do not preserve the current merged People & Culture architecture as the end-state for Kudos.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Prefer narrow, controlled edits over speculative rewrites unless a structural change is clearly required by the locked product shape.

## Scope

1. Scheduling
2. Featured/pinned prominence logic
3. Missed-prominence exception path
4. Detail-panel role-aware behavior

## Instructions for the Agent

1. Implement admin-only future scheduling.
2. Ensure internally scheduled items appear as Approved/Scheduled while submitters still see Approved.
3. Keep scheduled items in Approved with a clear badge/state and dedicated filter/preset.
4. Ensure scheduled items only consume featured/pinned slots at go-live.
5. Implement featured/pinned rules exactly as locked:
   - 1 featured max
   - up to 3 pinned
   - mutually exclusive
   - featured expiration required
   - pinned optional expiration
   - no automatic displacement
6. Implement missed-prominence handling:
   - publish as standard approved
   - notify admins
   - add to Flagged for Admin Review
   - no automatic retry
7. Implement detail-panel role-aware behavior:
   - public/associated normal recognition view
   - HR/admin governance section
   - reduced history-safe view for associated no-longer-public items
8. Ensure only limited inline actions are available in the panel governance section.

## Deliverables

- scheduling behavior
- prominence behavior
- conflict/fallback behavior
- role-aware detail panel updates
- admin-notification/flagged follow-up behavior for missed prominence

## Validation

- verify scheduling authority restrictions
- verify go-live slot consumption logic
- verify missed prominence fallback path
- verify featured expiration demotion path
- verify detail panel content by audience/role

## Required Report Back

Return:
1. scheduling implemented
2. prominence logic implemented
3. missed-prominence behavior implemented
4. detail-panel governance behavior implemented
5. remaining gaps if any
