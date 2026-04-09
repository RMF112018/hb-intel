# Prompt 02 — HB Kudos Employee Experience

## Objective

Build the dedicated employee-facing HB Kudos experience and remove the merged-surface dependence for recognition-specific runtime behavior.

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

1. Dedicated Kudos runtime/UI
2. Submission experience
3. Archive/feed behavior
4. Celebrate and detail panel behavior
5. Associated-item access rules

## Instructions for the Agent

1. Create or normalize the dedicated HB Kudos surface so it is not subordinate to the merged People & Culture composition.
2. Rework the submission experience to support the locked recipient model and approval-aware behavior.
3. Replace the plain text recipient entry path with the correct SharePoint-backed people/group/team/department/project-group selection model or the closest repo-appropriate adapter path.
4. Implement or update:
   - featured spotlight behavior
   - pinned / standard feed behavior
   - archive browsing
   - celebrate toggle
   - count-only celebrate presentation
   - detail panel / flyout
5. Ensure detail-panel access follows the locked visibility rules:
   - public users for public items
   - submitter / recipients / HR-admin for allowed associated/governed items
6. Ensure associated no-longer-public items show the reduced history-safe view.
7. Ensure mixed-recipient submissions publish as one shared kudos item with summarized card presentation and full detail in the panel.
8. Keep public engagement limited to Celebrate only.
9. Do not implement public comments/replies.
10. Preserve celebrate counts across lifecycle changes.

## Deliverables

- dedicated HB Kudos runtime surface
- corrected submission flow
- corrected recipient handling
- detail panel implementation/update
- celebrate behavior implementation/update
- archive/feed implementation/update

## Validation

- verify public vs associated-party visibility
- verify recipient summary vs full detail behavior
- verify celebrate toggle behavior
- verify no comments/replies were introduced
- verify mixed-recipient submissions remain one item

## Required Report Back

Return:
1. files changed
2. submission/runtime flows completed
3. visibility rules implemented
4. known remaining gaps
5. readiness for moderation workspace integration
