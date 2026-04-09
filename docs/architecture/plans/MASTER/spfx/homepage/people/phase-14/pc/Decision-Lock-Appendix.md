# Decision Lock Appendix — People & Culture + HR Operating Companion

This file is the governing decision register for the implementation prompts in this package.

## Product Boundary

- The split remains hard:
  - **People & Culture** owns announcements, celebrations, milestones, and broader culture programming
  - **HB Kudos** owns recognition
- The People & Culture companion is a **full HR operating console**, not a moderation-only surface
- The companion is not a general employee-directory administration tool
- The companion must support the public People & Culture webpart but does not absorb Kudos ownership

## Companion Surface Map

The People & Culture companion must include, at minimum:

- **Overview**
- **Announcements**
- **Celebrations / Milestones**
- **Culture Programs / Events**
- **Approvals**
- **Homepage**
- shared **quick-edit drawer**
- richer **full editor**
- optional **calendar view**

## Content-Family Structure

The operating model is:

- top-level tabs by content family
- shared lifecycle views inside each tab

Content families required:

- Announcements
- Celebrations / Milestones
- Culture Programs / Events

The global Approvals inbox is cross-family.

## Lifecycle / State Model

Required lifecycle views inside each content-family tab:

- Draft
- Needs Approval
- Scheduled
- Live
- Expiring Soon
- Expired
- Archived
- Suppressed

### Meaning

- **Draft** = not submitted or not ready for workflow
- **Needs Approval** = requires approver action before it can go live
- **Scheduled** = approved and set for future publication
- **Live** = currently public to the allowed audience
- **Expiring Soon** = approaching rule-based or manual end date
- **Expired** = aged out by rule or end date
- **Archived** = intentionally retained history
- **Suppressed** = intentionally hidden/withheld without deletion

Expired and Archived are not interchangeable and must remain separate.

## Publishing / Approval Model

- Publishing model: **hybrid governance**
- Standard items can move through normal HR workflow without a second approval bottleneck
- A second approval path is required for:
  - enterprise-wide / high-visibility items
  - **anything pinned to the homepage**

### Approvals Surface Rules

- **Needs Approval** remains visible inside each content-family tab
- A dedicated global **Approvals** inbox is also required
- The global Approvals inbox must support cross-family triage
- Approval work supports **claim / reassignment**
- Claim/reassignment applies to **approval work only**

## Permission Model

Two roles are required:

### Editors
Can:
- create
- edit
- schedule
- submit for approval
- manage ordinary draft/live content within their allowed authority

### Approvers/Admins
Can:
- publish
- unpublish
- pin
- suppress
- manage homepage governance
- approve/reject qualifying items
- resolve cross-family approval work

The package does not require a separate third admin tier in v1.

## Audience Model

- Audience scope supports:
  - company-wide
  - targeted audiences
- Targeting can include groups such as office, department, region, role family, project team, or equivalent repo-supported dimensions
- The public webpart only surfaces items relevant to the current viewer
- Targeting alone does **not** automatically force the higher-governance path
- Pinned/high-visibility rules still apply independently

## Recurring Milestone Intake

Recurring milestones such as birthdays, anniversaries, and similar celebration items use a **hybrid intake** model:

- milestone candidates are auto-generated from a trusted people data source
- candidates land in an HR review queue / operating flow
- HR can:
  - edit
  - suppress
  - schedule
  - feature
  - publish

The model is not fully manual and not fully automatic publication.

## Main Working Surfaces

- Default working mode inside each content-family tab = **editorial list view**
- Optional **calendar view** exists for scheduled/live planning
- Calendar mode supports planning and timing
- Calendar mode does not replace the main operating grid/list

## Editing Model

- Quick edits happen in a **right-side drawer**
- Richer authoring happens in a **full editor**
- The full editor is used when content needs more room for:
  - richer body/content fields
  - media choices
  - targeting
  - scheduling
  - preview
  - homepage-governance implications

## Homepage Governance

Homepage placement remains **system-default with HR override**.

### Required behavior

- the system proposes default featured/supporting items by rules
- HR can override with:
  - pinning
  - feature flags
  - manual ordering / swap behavior as implemented
- the companion must include a dedicated lightweight **Homepage** surface that allows HR to:
  - see current homepage composition
  - identify conflicts
  - reorder / swap / override as allowed
  - validate what is featured vs supporting

The Homepage surface is lightweight governance, not a full newsroom drag-and-drop editorial board unless the repo already supports that safely.

## Media / Photo Model

For person-based announcements, celebrations, and milestone content:

- default media source = **profile photo first**
- HR can explicitly override with:
  - uploaded custom image
  - campaign artwork
  - event photography
  - no image, if allowed by the final schema
- the companion must show which media source is active
- non-person campaign/event items can use uploaded campaign/event artwork as the primary media model

This rule exists specifically to eliminate the current incomplete people-photo/avatar behavior.

## Preview Model

The companion requires **multi-context preview**.

Preview must support:

- item-level preview
- public-webpart-context preview
- key render variants such as:
  - featured vs supporting
  - desktop vs mobile, where practical in the implementation model

Preview is required because the public People & Culture surface depends on hierarchy, not just raw content fields.

## Overview Landing Page

The companion landing page is a **lightweight Overview** surface.

It should surface, at minimum:

- lifecycle counts
- pending approvals
- scheduled upcoming items
- expiring soon
- homepage conflicts / pinned conflicts
- quick links into work queues

This is an operational dashboard, not a heavy analytics command center.

## Notification Model

Notifications are:

- operators + content owner / submitter only

Required behavior:

- Editors / Approvers get workflow notifications appropriate to their queue/work role
- the internal content owner / submitter gets status updates such as:
  - approved
  - scheduled
  - published
  - rejected
  - revision requested, if that state exists in repo truth
  - expired
- featured people are **not** auto-notified by default

## Non-HR Intake Model

The companion supports **limited intake** from designated non-HR users.

Meaning:

- designated managers / leaders / business partners can submit People & Culture request items
- HR reviews, edits, and decides whether to publish
- outside users do **not** publish directly
- there is no open all-employee intake channel in v1

## Work Management

- claim / assignment / reassignment applies to approval work only
- no broad assignment/ticketing layer is required for every live or scheduled item
- the companion should stay operational, but not become a heavy ticketing system

## Implementation Bias

When repo truth leaves room for interpretation:

- choose the **best-practice SPFx / SharePoint implementation**
- preserve strong typing and package boundaries
- prefer narrow, explicit contracts over ad hoc runtime inference
- do not re-merge People & Culture and HB Kudos
