# Prompt 03 — Notifications, Scheduling, and Work Management

You are working in the live repo at:
`https://github.com/RMF112018/hb-intel`

Branch: `main`

Treat live repo truth as authoritative.

## Objective

Finish the operating logic that still prevents HB Kudos from being truly production-ready:

- notification triggers
- overdue/reminder behavior
- claim / assignment / reassignment authority behavior
- full scheduling and prominence rule enforcement

## Governing files

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-05-Permissions-Notifications-and-Work-Management.md`

## Primary files in scope

- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- any new notification/reminder/scheduling helpers you need under `apps/hb-webparts/src/homepage/data/` or `helpers/`

## Repo-truth defects this prompt must fix

1. Notification behavior required by Prompt 05 is not actually implemented.
2. Overdue/reminder targeting and cadence hooks are absent.
3. Work-management behavior is not fully aligned to queue/state-specific authority.
4. Scheduling/prominence actions exist but do not fully enforce the locked business rules.

## Required outcomes

### A. Notifications

Implement the required notification behavior:

Notify submitter on:
- approve
- reject
- revision requested

Notify recipients:
- only after the item is actually live
- not for later public removal/unpublish
- for scheduled items only when the item actually publishes

If the repo does not yet have a final delivery provider, create a clean, explicit seam and wire the event triggers to it. Do not fake completion with comments only.

### B. Overdue/reminder logic

Implement overdue/reminder behavior aligned to the decision lock:
- Pending / Revision Requested reminders → HR reviewers
- Flagged for Admin Review reminders → Kudos admins
- Approved / Rejected / Removed-Unpublished → no routine reminders

Thresholds and cadence must be configurable through the webpart/runtime configuration model.

### C. Work management

Finish claim / assignment / reassignment behavior so it is actually state-aware and authority-aware.

Enforce:
- claim is soft, not exclusive
- Pending / Revision Requested reassignment → reviewers and admins
- Flagged for Admin Review reassignment → admins only

### D. Scheduling and prominence

Enforce the locked rules, not just field writes:
- scheduling is admin-only
- featured max count = 1
- pinned max count = up to 3
- featured and pinned are mutually exclusive
- featured requires expiration date
- missed prominence handling for scheduled featured items
- slot-collision handling
- admin-review consequence where required
- scheduled items consume slots only when they actually go live

## Implementation rules

- Keep field writes aligned to the live schema.
- Keep rule enforcement centralized enough that UI drift cannot bypass it.
- Do not rely on UI copy as proof of behavior.
- Do not re-read files that are still within your current context or memory unless a detail is genuinely uncertain.

## Deliverables

Return:

1. changed-file summary
2. notification implementation summary
3. overdue/reminder implementation summary
4. work-management implementation summary
5. scheduling/prominence rule-enforcement summary
6. configuration points added or updated
7. validation performed
8. remaining issues, if any

## Important rules

- Do not claim completion if notifications are still implied rather than implemented.
- Do not claim completion if overdue/reminder behavior is still absent.
- Do not claim completion if scheduling/prominence remains field-write-only without real rule enforcement.
