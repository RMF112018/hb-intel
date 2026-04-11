# Prompt 04 — Scheduling, Prominence, and Detail Panel

Implement the scheduling, prominence, and shared detail-panel/detail-surface behavior for HB Kudos and the HR companion.

## Objective

Build or refactor the logic and UI for:

- scheduled publishing
- pinning / featuring / expiration
- missed-prominence outcomes
- shared detail-panel rendering
- governance detail sections
- audit timeline / event rendering
- associated-item access after visibility changes

This prompt should unify the employee-facing and governance-facing detail experience into one coherent system with role-aware sections.

## Governing Rules

- Scheduling is admin-only.
- Featured and pinned are mutually exclusive.
- Featured max = 1.
- Pinned max = 3 with explicit order.
- Standard approved items age off public homepage visibility after the configured window.
- Scheduled items consume prominence only when actually live.
- Missed featured conflicts publish as standard, notify admins, and are flagged for admin review.
- Detail panels must stay role-safe:
  - public/publicly visible associated viewers get recognition-safe content
  - HR/admin get governance sections
  - internal-only governance details must not leak to ordinary viewers

## Required Shared UI Outcomes

Create/extend shared homepage-safe primitives where needed for:

- workflow state badges
- prominence badges/markers
- scheduling state treatment
- ownership/aging chips
- governance detail sections
- audit timeline / event list blocks
- inline governance action bars inside the detail experience

Do not implement these as scattered local one-off fragments if they repeat.

## Tasks

1. Audit the current scheduling/prominence/detail logic.
2. Normalize the final-state rules against the typed contracts from Prompt 01.
3. Implement scheduling behavior and schedule-change/cancel handling.
4. Implement featured/pinned/order/expiration behavior.
5. Implement missed-prominence handling and admin-review flagging.
6. Build/refine the shared detail experience:
   - recognition sections
   - recipient sections
   - high-level status sections
   - governance-only sections
   - audit timeline blocks
7. Ensure both the employee and HR/admin surfaces consume the same shared primitives where appropriate.

## Deliverables

Return:

1. changed-file summary
2. scheduling behavior summary
3. prominence behavior summary
4. shared detail/timeline primitives created or extended
5. employee vs governance detail-access summary
6. validation performed
7. remaining issues, if any

## Important Rules

- Do not create separate incompatible status/panel grammars for employee and governance surfaces.
- Do not reduce the detail experience to a weak generic drawer with local badge clutter.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
