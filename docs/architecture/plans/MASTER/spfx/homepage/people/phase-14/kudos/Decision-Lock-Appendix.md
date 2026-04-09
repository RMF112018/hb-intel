# Decision Lock Appendix — HB Kudos + HR Approval Companion

This file is the governing decision register for the implementation prompts in this package.

## Governance / Authority Model

- Approval model: **mixed authority by action**
- Access to the HR approval companion webpart: **HR reviewers + Kudos admins only**
- Shared permission model across surfaces: **one shared role model** governs both the main HB Kudos webpart and the HR companion webpart
- Role assignment mechanism: **configurable webpart properties** managed by an existing SharePoint admin
- Role model should resolve to **real SharePoint principals/groups**, not loose text entries
- UI and action/mutation enforcement must both honor the same role model

## Admin-Only Actions

Admins only can:
- pin / unpin
- feature / unfeature
- edit published kudos
- remove published kudos
- schedule future publishing
- change or cancel a scheduled publish
- restore removed public items

## Core Workflow Model

Statuses / states required in the operating model include, at minimum:
- Pending
- Revision Requested
- Approved
- Rejected
- Withdrawn
- Approved / Scheduled
- Removed / Unpublished
- Flagged for Admin Review

### Approval
- HR approval publishes **immediately** by default
- HR can **Approve and flag for admin review**
- Submitter sees this simply as **Approved**
- Admin review flag is internal only

### Rejection / Revision
- HR can either:
  - reject outright
  - return for revision
- Reject requires a mandatory submitter-facing reason
- Revision request requires a mandatory submitter-facing guidance note
- Both can include optional internal moderator notes
- Revision keeps the **same record**
- Revision requested items remain visible to HR in a **separate revision queue**
- Submitter can edit everything except:
  - submitter identity
  - moderation history

### Reopening Rejected Items
- Rejected items are reopenable by **HR or admins**
- On reopen, reviewer chooses whether the item returns to:
  - Pending Review
  - Revision Requested

### Withdrawal
- Submitter can withdraw while the item is:
  - Pending
  - Revision Requested
- Withdrawal becomes a retained **Withdrawn** status
- Withdrawal is **final**
- Withdrawing does not hard-delete the record
- Withdrawn items leave active review queues

## Visibility Model

### Public Visibility
- Only currently public items appear on public Kudos surfaces
- Celebrate is allowed only on **currently publicly visible** items
- No public comments/replies in v1

### Associated-Party Visibility
- Submitter can view all their own submissions and statuses
- Submitter and recipient can still see items they are associated with after:
  - expiration
  - unpublish
  - removal from public view
- Recipients only ever see items that reached published visibility at least once
- Recipients do **not** see never-published rejected/withdrawn items
- Before publish, recipients should not see the item at all

### Detail Panel Access
- Public viewers can open detail panels for public items
- Submitter / recipients / HR-admin roles can open associated/governed items they are allowed to access
- HR/admin get an added governance section in the shared detail panel
- For associated no-longer-public items, submitter/recipient see a reduced history-safe view:
  - recognition content
  - recipient detail
  - high-level status
  - no internal governance / deeper workflow history

## Recipient Model

- Mixed recipient types are allowed in one submission
- Supported recipient buckets include:
  - individual
  - team
  - department
  - project group
- A mixed-recipient submission publishes as **one shared kudos item**
- Public cards use summarized recipient presentation
- Full recipient detail appears in the detail panel / flyout
- The plain text recipient entry model is not acceptable as the final implementation

## Employee Notifications

### Submitter Notifications
Notify submitter on:
- approve
- reject
- revision requested

### Recipient Notifications
- Notify recipients only **after** the item is actually live
- No recipient notification for later public removal/unpublish
- For scheduled items, submitter and recipient notifications fire only when the item actually goes live

## Scheduling

- Scheduling is admin-only
- Scheduled items remain in **Approved** with a distinct internal scheduled state/badge
- Dedicated filter/preset for scheduled items
- Editing a scheduled item does not change the schedule unless explicitly changed
- Scheduled items consume pinned/featured slots only when they actually go live

## Prominence Model

### Featured
- Max featured count: **1**
- Featured and pinned are mutually exclusive
- Featured requires an expiration date
- On featured expiration:
  - demote to standard approved
  - remain public only if still within the normal homepage window
- If a scheduled featured item goes live while featured slot is occupied:
  - publish as standard approved
  - no displacement
  - notify admins
  - auto-place into Flagged for Admin Review
- No automatic retry for missed prominence

### Pinned
- Max pinned count: **up to 3**
- Pinned default ordering: newest-first until manually reordered
- Explicit pin order model required
- Pinned are manual by default, with optional expiration
- Scheduled pinned items only surface if normal max-pin/order rules allow space

### Standard Approved Homepage Age
- Age-off duration is a **configurable webpart property**
- Standard approved items auto-age off public homepage visibility
- Aged-off items remain in archive/history as allowed by visibility rules

## Removed / Unpublished Handling

- Remove Published Kudos = **unpublish without destructive deletion**
- Only admins can restore removed public items
- Removed / Unpublished tab:
  - shows manual removals/unpublishes by default
  - optional filter can include routine expirations/age-offs

## Admin Review Flag

- HR can approve and flag for admin review
- Admin review flag can be cleared:
  - automatically by meaningful admin action
  - or manually by explicit clear/mark reviewed action
- Flagged queue visible to both HR and admins
- Only admins perform admin-only actions and final admin review closeout where needed
- Mark Reviewed:
  - internal-only acknowledgement
  - clears the admin-review flag
  - records reviewer + timestamp

## Queue / Workspace Model

Top-level companion tabs:
- Pending
- Revision Requested
- Flagged for Admin Review
- Approved
- Rejected
- Removed / Unpublished

Withdrawn is not a prime top-level tab; it may live in search/history.

### Queue Ordering
- Pending = oldest-first
- Revision Requested = oldest-first
- Flagged for Admin Review = newest-first
- Approved = newest-first
- Rejected = newest-first
- Removed / Unpublished = newest-first

### Overdue Model
- Operational overdue model, not just visual
- Overdue thresholds configurable by queue through webpart properties
- Overdue reminder notifications only, no heavier escalation chain
- Reminder ownership:
  - Pending / Revision Requested → HR reviewers
  - Flagged for Admin Review → Kudos admins
  - Approved / Rejected / Removed-Unpublished → no routine overdue reminders
- Reminder cadence configurable via webpart properties

### Work Ownership
- Claim + reassignment model required
- Claim ownership is soft, not exclusive
- Reassignment authority:
  - Pending / Revision Requested → HR reviewers and admins
  - Flagged for Admin Review → admins only
- Work-management views required:
  - Assigned to me
  - Unassigned
  - Assigned to others
- Include queue counts for workload distribution

## Search / Filters / Presets

Broader operational filter model required:
- keyword search
- recipient type
- submitter
- recipient
- current status / queue
- flagged for admin review
- overdue state
- published at least once / never published
- pinned / featured / standard
- date ranges for submitted, approved, and publish window

Saved views:
- shared operational presets only
- no personal saved views in v1

## Bulk Actions

Limited safe bulk actions only.
Default safe set:
- clear admin-review flag
- mark reviewed
- remove pin
- clear featured state
- move approved items out of prominence without deleting them

No risky batch approve/reject/revision workflow actions in v1.

## Detail Panel

- Fuller kudos detail experience = **detail panel / flyout**
- HR/admin can take only limited inline actions there:
  - mark reviewed
  - clear admin-review flag
  - claim / reassign
- Heavier workflow and prominence actions stay in the main companion workspace

## Engagement

### Celebrate
- Toggle behavior
- Count only; no public people list
- Celebrate counts persist across item lifecycle unless explicitly removed by admin policy later
