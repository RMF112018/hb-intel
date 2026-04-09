# Prompt 05 — Permissions, Notifications, and Work Management

## Objective

Implement the shared role model, queue-specific notifications, admin review handoff behavior, and limited safe bulk administrative controls.

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

1. Shared permissions
2. Queue-specific reminders
3. Notification behavior
4. Safe bulk actions
5. Search/filter operations

## Instructions for the Agent

1. Wire the shared role model into both visibility and action authorization.
2. Ensure role assignments are configurable through webpart properties using SharePoint principal/group resolution.
3. Implement queue-specific overdue reminder behavior and configurable reminder cadence.
4. Implement submitter and recipient notification behavior exactly as locked.
5. Implement admin review flag behavior, including mark reviewed and clear flag semantics.
6. Implement the broader operational search/filter model:
   - keyword
   - recipient type
   - submitter
   - recipient
   - status/queue
   - flagged for admin review
   - overdue
   - published-once / never-published
   - pinned / featured / standard
   - submitted/approved/publish-window date ranges
7. Implement the limited safe bulk-action set only:
   - clear admin-review flag
   - mark reviewed
   - remove pin
   - clear featured state
   - move approved items out of prominence without deleting them
8. Do not implement risky batch approve/reject/revision actions.
9. Ensure the flagged queue is visible to both HR and admins but authority remains role-aware.

## Deliverables

- shared role enforcement
- configurable principal/group property handling
- queue reminder behavior
- notification behavior
- safe bulk actions
- operational filter model

## Validation

- verify role-aware visibility and actions
- verify reminders target the correct owning role by queue
- verify scheduled notification timing
- verify safe bulk actions only
- verify filter set works across the companion workspace

## Required Report Back

Return:
1. permissions model implemented
2. reminder/notification behavior implemented
3. bulk actions implemented
4. filter/search behavior implemented
5. unresolved constraints or schema gaps
