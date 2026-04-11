# Prompt 03 — HR Operating Companion Webpart

## Objective

Implement the dedicated People & Culture HR operating companion webpart and its full content-operations workspace behavior.

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
- Preserve the hard split between People & Culture and HB Kudos.
- Do not re-read files that are still within your current context window or memory unless you need to verify a specific uncertain detail.
- Preserve SPFx packaging discipline and shared import discipline.
- Do not ship the companion as a minimal review queue; it must function as a real operating console.

## Scope

1. Overview landing page
2. Content-family workspaces
3. Global approvals inbox
4. Quick-edit drawer
5. Full editor
6. Calendar mode
7. Homepage governance view

## Instructions for the Agent

1. Create or update the People & Culture HR companion webpart as a separate, production-ready operating surface.
2. Implement required top-level surfaces:
   - Overview
   - Announcements
   - Celebrations / Milestones
   - Culture Programs / Events
   - Approvals
   - Homepage
3. Inside the content-family tabs, support the required lifecycle views:
   - Draft
   - Needs Approval
   - Scheduled
   - Live
   - Expiring Soon
   - Expired
   - Archived
   - Suppressed
4. Implement default editorial list view.
5. Add optional calendar view for scheduled/live planning.
6. Implement quick-edit drawer for fast operational edits.
7. Implement richer full editor for deeper authoring.
8. Implement a global Approvals inbox that works across all content families.
9. Support claim/reassignment behavior for approval work only.
10. Implement the lightweight Homepage governance surface so HR can inspect and manage current homepage composition and conflicts.
11. Ensure the companion remains content-oriented and does not become a general employee-directory administration tool.

## Deliverables

- dedicated HR operating companion runtime
- Overview surface
- content-family tabs and lifecycle views
- Approvals inbox
- Homepage governance surface
- quick-edit drawer
- full editor
- optional calendar mode

## Validation

- verify required surfaces exist
- verify lifecycle views and counts work correctly
- verify quick-edit vs full-editor division is real
- verify approval-work assignment behavior is limited to approval work
- verify Homepage governance is lightweight but functional

## Required Report Back

Return:
1. surfaces and tabs implemented
2. lifecycle views implemented
3. editing model implemented
4. approvals/homepage surfaces implemented
5. known remaining integration items
