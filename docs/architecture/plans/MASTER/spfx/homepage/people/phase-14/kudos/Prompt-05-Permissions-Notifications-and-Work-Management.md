# Prompt 05 — Permissions, Notifications, and Work Management

Implement the role model, notification behavior, overdue/reminder logic, and work-management behaviors for HB Kudos and the HR companion.

## Objective

Complete the non-visual operating logic for:

- shared role/permission enforcement
- employee submitter/recipient visibility rules
- notification triggers
- overdue/reminder targeting
- claim / assignment / reassignment behavior
- work-management views
- safe operational presets and filter behavior

The result should align tightly to the decision lock and the live schema.

## Governing Rules

### Roles
- One shared role model governs both surfaces.
- Role assignment comes from configurable webpart properties resolving to real SharePoint principals/groups.
- UI gating and mutation authorization must use the same authority model.

### Notifications
Notify submitter on:
- approve
- reject
- revision requested

Notify recipients:
- only after the item is actually live
- not for later public removal/unpublish
- for scheduled items only when the item actually publishes

### Overdue/reminders
- Pending / Revision Requested reminders → HR reviewers
- Flagged for Admin Review reminders → Kudos admins
- Approved / Rejected / Removed-Unpublished → no routine overdue reminders
- thresholds and cadence are configurable through webpart properties

### Work ownership
- claim model is soft, not exclusive
- reassignment authority varies by queue/state per the decision lock
- work-management views required:
  - Assigned to me
  - Unassigned
  - Assigned to others

## Required UI / Shared Primitive Outcomes

If operational views expose repeated preset/filter/toggle patterns, ensure those patterns use shared homepage-safe governance toolbar/filter primitives rather than one-off local controls.

If overdue/state/owner indicators repeat, ensure they use shared status/aging/ownership chips rather than local badge duplication.

## Tasks

1. Audit the current role model and authorization seams.
2. Implement/refine the shared permission model for both surfaces.
3. Implement/refine notification triggers and delivery hooks/call sites.
4. Implement overdue/reminder logic and configuration use.
5. Implement/refine claim / assignment / reassignment logic.
6. Implement/refine work-management views and preset/filter behavior.
7. Ensure the UI uses shared governance toolbar/chip patterns where repeated.

## Deliverables

Return:

1. changed-file summary
2. role-model implementation summary
3. notification summary
4. overdue/reminder summary
5. work-management summary
6. validation performed
7. remaining issues, if any

## Important Rules

- Do not let UI gating diverge from mutation authorization.
- Do not leak associated/private/governance views to unauthorized users.
- Do not implement repeated work-management controls as one-off local UI if shared primitives already exist or should exist.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
