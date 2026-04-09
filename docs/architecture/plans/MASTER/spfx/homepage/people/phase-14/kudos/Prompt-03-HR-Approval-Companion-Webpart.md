# Prompt 03 — HR Approval Companion Webpart

## Objective

Implement the dedicated HR approval companion webpart and the full queue/workspace behavior locked in the decision register.

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

1. Dedicated moderation/governance surface
2. Full queue model
3. Work ownership
4. Overdue views
5. Limited inline detail-panel actions

## Instructions for the Agent

1. Create or update the HR approval companion webpart as a separate, production-ready moderation surface.
2. Implement top-level tabs:
   - Pending
   - Revision Requested
   - Flagged for Admin Review
   - Approved
   - Rejected
   - Removed / Unpublished
3. Implement queue ordering exactly as locked.
4. Add work-management views:
   - Assigned to me
   - Unassigned
   - Assigned to others
   - queue counts
5. Implement soft claim ownership.
6. Implement reassignment authority rules by queue.
7. Implement overdue filters/views and queue-specific overdue behavior.
8. Add shared operational presets only; no personal saved views.
9. Implement the full read-only audit timeline.
10. Add limited inline actions in the detail-panel governance section only for:
   - mark reviewed
   - clear admin-review flag
   - claim / reassign
11. Keep heavier workflow/prominence actions in the companion workspace proper.
12. Do not ship the workspace as a minimal pending/approved/rejected-only queue surface; extend it to the locked operating model.

## Deliverables

- dedicated HR companion webpart runtime
- queue tabs and queue counts
- work-management views
- audit timeline
- claim/reassignment behavior
- limited governance-inline actions
- shared operational presets

## Validation

- verify tab counts
- verify ordering rules
- verify claim/reassign authority by queue
- verify flagged admin-review closeout behavior
- verify removed/unpublished filter behavior
- verify audit timeline captures the required event classes

## Required Report Back

Return:
1. workspace tabs and views implemented
2. ownership model implemented
3. audit/history features implemented
4. queue/action validation performed
5. known remaining integration items
