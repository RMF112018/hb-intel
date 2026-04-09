# Prompt 03 — HR Approval Companion Webpart

Implement the HR approval companion as a premium homepage-hosted governance / operational workspace using disciplined shared homepage-safe primitives and thin local business logic.

## Objective

Build or refactor the HR approval companion webpart so it supports:

- moderation queues
- approval / rejection / revision behavior
- admin-review handling
- queue ownership / claim / reassignment
- queue filters / presets / workload views
- safe bulk actions
- governance detail sections
- audit timeline visibility

The result must feel productized and operationally clear, not like a plain admin list with minor styling.

## Governing UI Rules

1. Use `@hbc/ui-kit/homepage` as the primary UI entry point.
2. Treat the HR companion as homepage-hosted governance UI, not as a separate shell app.
3. Reuse/create shared homepage-safe governance primitives for repeated patterns.
4. Do not create one-off local premium queue rows, toolbar bars, chips, or action bars if those patterns repeat.
5. Keep business rules, permission enforcement, and SharePoint writes local.

## Required Governance Surface Areas

### A. Queue workspace shell
Implement/refine the top-level moderation workspace with:
- top-level tabs / views
- work-management presets
- clear state grouping
- role-aware action availability
- queue empty/loading/error states

### B. Queue rows / cards
Implement/refine repeated queue item presentation for:
- current status
- aging/overdue signal
- ownership signal
- recipient summary
- prominence/scheduling flags
- quick action affordances

This pattern should be shared if reused across more than one queue.

### C. Governance toolbar / filters
Implement/refine a shared governance toolbar/filter treatment for:
- state tabs/views
- assigned-to-me / unassigned / assigned-to-others
- scheduled / flagged / removed filters
- search where applicable
- safe bulk-selection state if bulk actions are supported

### D. Governance detail sections
Implement/refine shared governance sections for:
- moderation status
- submission history
- recipient detail
- scheduling/prominence
- ownership/assignment
- admin-review metadata
- audit timeline/event stream

### E. Safe bulk actions
If bulk actions are implemented, ensure:
- safe eligibility filtering
- role checks
- clear disabled reasons
- no ambiguous destructive action behavior

## Tasks

1. Audit the current moderation/governance workspace seams in repo truth.
2. Identify repeated governance patterns that belong in shared homepage-safe primitives.
3. Create/extend shared governance primitives as needed:
   - queue row
   - toolbar/filter/preset shell
   - status/aging/ownership chips
   - governance detail sections
   - audit timeline blocks
   - inline action bar
4. Refactor the HR companion consumer to use those shared primitives.
5. Wire queue logic, claim/reassign, approval/reject/revision/admin-review actions to the typed contracts from Prompt 01.
6. Respect all role/authority locks from the decision appendix.

## Deliverables

Return:

1. changed-file summary
2. shared governance primitives created/extended
3. companion consumer/runtime files changed
4. queue/workspace behavior summary
5. bulk-action summary, if implemented
6. validation performed
7. remaining issues, if any

## Important Rules

- Do not let the governance workspace drift into raw table-first admin UI unless repo truth shows that is the only viable operating model.
- Do not build repeated governance patterns as local bespoke premium markup.
- Do not leak admin-only or HR-only governance details into employee/public views.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
