# Decision Lock Appendix — HB Kudos + HR Approval Companion v4

This file is the governing decision register for the implementation prompts in this package.

This revision updates the appendix for the locked production deployment model:

- the **HB Kudos public-facing surface** is hosted on `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- the **HB Kudos Approval Companion** is hosted on `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`
- the canonical HB Kudos lists remain on **HBCentral**
- production permissions must resolve from **real group membership**, not simulated roles

---

## Production Deployment Locks

### Site topology

- Public-facing HB Kudos webpart host site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Admin / reviewer companion host site: `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`
- These are intentionally separate surfaces with separate hosting contexts
- The admin/reviewer companion must **not** assume that its current host web is the same web that stores the HB Kudos lists

### Canonical data location

The source-of-truth HB Kudos lists remain on **HBCentral**:

- `People Culture Kudos`  
  `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People%20Culture%20Kudos/Compact.aspx`
- `Kudos Audit Events`  
  `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Kudos%20Audit%20Events/AllItems.aspx`

Locks:

- Public and admin surfaces must both read from the same canonical list set on **HBCentral**
- The approval companion must write governance mutations and audit events to the canonical lists on **HBCentral**
- No duplicate or shadow HB Kudos lists are to be provisioned on `HBKudosAdminReview`
- Cross-site list access from the companion is part of the intentional production architecture and must be treated as first-class, not as a temporary workaround

### Production mode vs dev mode

- `simulatedRole` is **dev-only** and is not an acceptable production authorization mechanism
- Production behavior must not be driven by loose text role simulation
- In production mode, the companion must resolve real user access from configured principals/groups and deny governance access when resolution fails
- Dev-mode fallback must not remain active in normal production runtime

---

## UI Governance Locks

- Homepage webparts in this implementation use `@hbc/ui-kit/homepage` as the primary UI entry point
- Employee-facing HB Kudos must read as a premium recognition product surface, not a timid enterprise card grid
- The HR approval companion must read as a premium governance workspace, not a plain admin table with cosmetic styling
- Repeated premium recognition/governance patterns must be promoted into shared homepage-safe primitives before local duplication
- Plain-text comma-delimited recipients are not an acceptable final-state UI model
- Shared surface extensions are explicitly allowed and expected where the current homepage entry lacks the required recognition/governance primitives
- Local inline premium styling is prohibited except for isolated, documented micro-layout shims that do not create a reusable visual pattern

---

## Governance / Authority Model

- Approval model: **mixed authority by action**
- Access to the HR approval companion webpart: **HR reviewers + Kudos admins only**
- Shared permission model across surfaces: **one shared role model** governs both the main HB Kudos webpart and the HR companion
- Role assignment mechanism: **real group/principal resolution in production**
- Role model must resolve to **real SharePoint-accessible principals/groups**, not loose text entries
- UI and action/mutation enforcement must both honor the same role model

### Locked production groups

The production deployment has the following locked group model:

- `HB Kudos Admins`
- `HB Kudos Reviewers`

Current locked deployment facts:

- `HB Kudos Admins` security group has been assigned as the communication site **Admin** on `HBKudosAdminReview`
- `HB Kudos Reviewers` security group has been assigned as the communication site **Owners** on `HBKudosAdminReview`

Implementation locks:

- The companion must resolve the current user against these production groups/principals
- `kudosAdminsGroup` and `kudosReviewersGroup` must map to real production principals, not simulated labels
- If the runtime cannot positively resolve the current user into an allowed admin/reviewer principal, the companion must fail closed and render an access-restricted state
- Governance actions must never rely solely on client-visible tab access or hidden buttons; the same role result must govern mutation eligibility

### Property model locks

- `simulatedRole` must be retired from production runtime behavior
- If kept for local development, it must be explicitly gated to non-production/dev mode only
- Production defaults should point to the locked principal names:
  - `kudosAdminsGroup = HB Kudos Admins`
  - `kudosReviewersGroup = HB Kudos Reviewers`
- The implementation must support an explicit data-site/list-host configuration so the companion hosted on `HBKudosAdminReview` can target the canonical lists on `HBCentral`

---

## Admin-Only Actions

Admins only can:
- pin / unpin
- feature / unfeature
- edit published kudos
- remove published kudos
- schedule future publishing
- change or cancel a scheduled publish
- restore removed public items
- perform final admin-review closeout where required

---

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

---

## Visibility Model

### Public Visibility
- Only currently public items appear on public HB Kudos surfaces
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

---

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

---

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

---

## Scheduling

- Scheduling is admin-only
- Scheduled items remain in **Approved** with a distinct internal scheduled state/badge
- Dedicated filter/preset for scheduled items
- Editing a scheduled item does not change the schedule unless explicitly changed
- Scheduled items consume pinned/featured slots only when they actually go live

---

## Prominence Model

### Featured
- Max featured count: **1**
- Featured and pinned are mutually exclusive
- Featured requires an expiration date
- On featured expiration:
  - demote to standard approved
  - remain public only if still within the normal homepage window
- If a scheduled featured item goes live while the featured slot is occupied:
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
- Age-off duration is a **configurable webpart property** on the public-facing HB Kudos surface
- Standard approved items auto-age off public homepage visibility
- Aged-off items remain in archive/history as allowed by visibility rules

---

## Removed / Unpublished Handling

- Remove Published Kudos = **unpublish without destructive deletion**
- Only admins can restore removed public items
- Removed / Unpublished tab:
  - shows manual removals/unpublishes by default
  - optional filter can include routine expirations/age-offs

---

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

---

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

---

## Cross-Site Runtime and Security Locks

- The public HB Kudos surface on `HBCentral` and the approval companion on `HBKudosAdminReview` must share one canonical data model and one canonical workflow source of truth
- The companion must not silently degrade to local-site list discovery when it is hosted on `HBKudosAdminReview`
- Cross-site read/write targeting of the HBCentral lists must be explicit, validated, and observable in code
- Production runtime must log or surface actionable error states when list-host configuration is missing or inaccessible
- The system must fail closed for governance access and fail loudly for missing cross-site data configuration

---

## Packaging / Release Locks

- Production manifests, preconfigured entries, and user-facing descriptions must no longer describe the implementation as dev-mode or simulated-role driven
- The final production `.sppkg` must be rebuilt fresh from `main` after:
  - simulated-role runtime dependence is removed or dev-gated
  - real group-based resolution is active
  - cross-site list-host wiring is validated
  - public/admin site split is validated
- Production closure is not complete until the packaged output is proven fresh and aligned with source truth
