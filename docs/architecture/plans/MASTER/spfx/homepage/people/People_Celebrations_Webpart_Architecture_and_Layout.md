# People / Celebrations Webpart — Locked Architecture and Layout with Kudos

> **Doctrine status:** LOCKED — Phase 00 doctrine lock applied.
> **Authoritative merged architecture:** `00_Architecture/People_Culture_Kudos_Merged_Architecture.md`
> **Phase sequence:** `01_Roadmap/Revised_Full_Phase_Map.md`
>
> This document defines the locked target architecture for the People & Culture webpart. The three-part composition (Band A, Kudos Module, Band B) is the sole valid implementation outcome. No alternative composition is accepted.

## Objective

Build the **People / Celebrations** webpart as a single integrated homepage surface that combines **formal announcements**, a **moderated Kudos recognition engine**, and **weekly celebrations** into a premium, editorial, participation-friendly experience.

This webpart must support:

- birthdays within the next **7 days**
- anniversaries within the next **7 days**
- promotion announcements persisting for **5 days**
- baby announcements persisting for **3 days**
- wedding announcements persisting for **3 days**
- special announcements persisting for **3 days**
- moderated, approved **Kudos** recognition with featured and recent display behavior

The goal is to create a surface that feels:

- warm
- human
- editorial
- engaging
- participation-friendly
- highly scannable

---

## Locked Target Architecture

The People & Culture webpart uses a **three-part composition** with Kudos as a distinct embedded recognition module between the two celebration bands.

This is the sole valid implementation path. The old two-band-only shell is retired.

### Locked composition

1. **Band A — Highlights / Announcements**
2. **Kudos Recognition Module**
3. **Band B — This Week**

### Why this composition is locked

- Announcements retain editorial authority in Band A
- Kudos operates as a distinct participation-driven recognition engine
- Birthdays and anniversaries remain compact and rhythmic in Band B
- The homepage gains a strong employee-engagement loop without muddying the original hierarchy
- Flattening Kudos into either band would weaken all three experiences

---

## Rejected Implementation Outcomes

The following implementation paths are explicitly rejected:

1. **Flattening Kudos into Band A or Band B** — Kudos is not an announcement and is not a weekly celebration. It must remain a distinct module.
2. **Retaining a disconnected standalone Kudos page model** — The Kudos homepage module and the dedicated Kudos page must be connected, not independent surfaces.
3. **Falling back to the old two-band-only shell** — The two-band model without the Kudos module is retired. All three regions are required.
4. **Treating Kudos as optional or deferrable** — Kudos is integral to the locked architecture. It is not an add-on or future enhancement.
5. **Blending Kudos content into the celebration ranking stack** — Kudos items must not be inserted into the celebration priority ranking. Kudos is governed by its own approval, visibility, and display rules.

---

## Why Kudos Is a Distinct Module

Kudos is not the same type of content as:

- announcements
- birthdays
- anniversaries

Kudos is a **participation-driven recognition feature** with:

- employee submission
- moderation / approval
- public recognition
- reactions
- archive browsing
- editorial spotlighting

Blending it into either celebration band would weaken all three experiences.

Kudos must be a **distinct recognition sub-surface** inside the same webpart.

---

## Locked Overall Webpart Anatomy

### Header row

- Title: **Celebrating Our People**
- Optional supporting line:
  - `Birthdays, anniversaries, milestones, recognition, and team news`
- Optional global CTA posture:
  - `View all`
  - `Submit announcement`

### Body structure

1. **Band A — Announcement grid**
2. **Kudos Recognition Module**
3. **Band B — Birthday / Anniversary rail or grid**

---

## Band A — Highlights / Announcements

### Purpose

This band is the editorial announcement layer for formal people/culture milestones.

### Included item types

- promotions — persist **5 days**
- baby announcements — persist **3 days**
- wedding announcements — persist **3 days**
- special announcements — persist **3 days**

### Required layout

Use a **2-column editorial grid** on desktop.

### Card style

Use **medium-format announcement cards** with:

- photo
- person or family name
- announcement type badge
- short headline
- 1–2 line summary
- publish date or "new" indicator
- whole-card click target or CTA

### Display volume

- **2 to 4 visible items max**

If there are no active announcement items, this band must collapse entirely.

---

## Kudos Recognition Module

### Purpose

This module is the employee-engagement and recognition engine of the webpart.

It must:

- let employees give Kudos from the homepage
- spotlight the most recent approved Kudos item
- surface recent approved Kudos in a headline-style format
- encourage lightweight engagement through a single positive reaction
- connect directly to a full dedicated Kudos page

This module must feel more **engaging and enticing** than a standalone Kudos page while remaining more curated and premium than a social feed.

---

## Kudos Homepage UX Model

Use a **hybrid editorial + feed model**.

### A. Featured Kudos Spotlight

The most recent approved Kudos item becomes the featured recognition "article."

#### Featured structure

- large photo/project image/recipient image area
- fallback to avatar or user photo if no image is provided
- recognition headline
- recipient names / team / department / project group
- submitted-by attribution
- short recognition excerpt
- optional project reference
- approval/publication freshness indicator if useful
- celebrate count
- whole-card click target to the full Kudos page / item detail

### B. Recent Approved Kudos Headlines

Below or beside the featured spotlight, show a compact recent-recognition list.

#### Headline structure

- small thumbnail/avatar
- recipient name(s) / group name
- short headline
- short excerpt
- submitted-by line
- optional celebrate affordance
- click through to full Kudos page / archive item

### Display volume

- **1 featured Kudos item**
- **3 to 6 recent approved headline items**

This keeps the homepage recognition surface lively without becoming noisy.

---

## Kudos Header Row

The Kudos module must have a local header row.

### Required local header content

- Title: **Kudos**
- Optional support line:
  - `Recognize great work, celebrate teammates, and spotlight wins across the company`
- Primary CTA:
  - `Give Kudos`
- Secondary CTA:
  - `View All Kudos`

---

## Kudos Submission Model

Kudos must support **both**:

1. **Homepage quick submission**
2. **Dedicated page longer-form submission**

### Homepage quick submission

The homepage must provide a polished quick-submit flow such as:

- modal
- slide-over
- anchored panel

This flow must be lightweight and inviting.

### Dedicated page submission

The dedicated Kudos page must support longer-form recognition with fuller context.

This is where users can take more time to write a stronger recognition post.

---

## Kudos Approval and Governance Model

All employee-submitted Kudos must go through an **HR/admin review and approval step** before becoming visible.

### Approval rule

- submissions are **not visible immediately**
- only **approved** Kudos can be published to the homepage module or dedicated archive

### Reviewer / approver requirement

The **reviewer / approver must be a configurable property of the webpart**.

Required property direction:

- configurable person
- or configurable group
- flexible enough to support HR/admin ownership patterns

### Editorial controls

HR/admin must be able to:

- approve
- reject
- pin
- manage published Kudos

---

## Kudos Visibility and Aging Rules

### Default visibility

Approved Kudos shown on the homepage age off after **14 calendar days**.

### Pinning

HR can **pin** approved Kudos to keep them visible longer than the default aging window.

### Audience

All approved Kudos are visible to **everyone in the company**.

### Anonymity

No anonymous option.

Every published Kudos item shows the employee who submitted it.

---

## Kudos Reactions

Encourage lightweight participation using a single positive reaction type.

### Supported reaction

- **Celebrate**

This must remain:

- simple
- positive
- low-friction
- visually lightweight

It must not become a full social-media reaction system.

---

## Kudos Recipient Model

Kudos must support:

- individual employees
- teams
- departments
- project groups

### Multiple recipients

A single Kudos submission must support **multiple recipients**.

### Recipient source

Recipients must come from a **controlled company directory / employee list**.

Use the SharePoint / tenant directory pattern as the basis:

- controlled selector
- real employee/team references
- no free-text manual recipient entry

This supports:

- trust
- data quality
- moderation
- photo/avatar fallback
- future reporting

---

## Kudos Media Model

Approved Kudos must support:

- employee photos
- team photos
- project imagery

### Fallback rule

If no custom image is provided:

- use avatar
- or user photo

This is important because the visual layer is a major part of what makes Kudos feel materially more engaging than a disconnected page.

---

## Dedicated Kudos Page

The homepage module must link into a **full dedicated Kudos experience/page**.

This page must serve two jobs:

1. **Employee-facing recognition destination**
2. **HR/admin moderation workspace**

### Employee-facing experience

Must support:

- archive browsing
- longer-form submission
- full Kudos detail views
- reactions
- browsing by person / team / department / project group

### HR/admin moderation workspace

Must support:

- pending queue
- review detail
- approve
- reject
- pin / unpin
- publish management

This workspace must feel administrative but still aligned with the premium People & Culture experience.

---

## Band B — This Week

### Purpose

This band is the higher-volume, lighter weekly celebration layer.

### Included item types

- birthdays in the next **7 days**
- anniversaries in the next **7 days**

### Required layout

Use a **dense compact people grid** or a **horizontally scrollable rail** below the Kudos module.

### Tile style

Use **compact celebration tiles** with:

- photo or avatar
- full name
- celebration type
- date or "in X days"
- anniversary year count where relevant

### Display volume

- **4 to 8 visible items**

Desktop target:
- 4-column compact grid
- or horizontal rail with 4–6 items visible at once

This band must read as the most compact and least editorial of the three content regions.

---

## Locked Hierarchy and Priority Logic

Do not mix all people/culture content into one equal-weight list.

### Surface hierarchy

1. **Band A — Highlights / Announcements**
2. **Kudos Recognition Module**
3. **Band B — This Week**

### Why this hierarchy is locked

- Band A handles formal editorial milestones
- Kudos handles participatory recognition and engagement
- Band B handles recurring weekly celebration signals

### Display priority inside celebration logic

1. special announcements
2. promotions
3. baby announcements
4. wedding announcements
5. anniversaries
6. birthdays

This applies **inside the celebrations content model**. Kudos is a distinct module and is not inserted into this ranking stack.

---

## Required Editorial Override Fields

To balance automation with control, people/celebration records must support:

- `startDisplayDate`
- `endDisplayDate`
- `isPinned`
- `priorityOverride`
- `homepageEnabled`

For Kudos, required publication/governance fields include:

- `status` (`pending`, `approved`, `rejected`)
- `submittedBy`
- `approvedBy`
- `approvedDate`
- `isPinned`
- `homepageEnabled`
- `publishStartDate`
- `publishEndDate`
- `recipientType`
- `recipientReferences`
- `celebrateCount`

---

## Responsive Layout Behavior

### Desktop

- Band A: **2-column announcement grid**
- Kudos: **featured spotlight + recent headlines**
- Band B: **4-column compact celebration grid**

### Tablet

- Band A: stacked 1-column cards or 2-up depending on width
- Kudos: featured spotlight stacked above recent headlines
- Band B: 2-column celebration grid

### Mobile

- Band A first, stacked vertically
- Kudos next, stacked with prominent featured recognition and compact recent list
- Band B as a horizontal swipe rail or single-column stack

### Responsive principle

As the width narrows:

- Band A must remain more editorial
- Kudos must remain more engaging and prominent than Band B
- Band B must remain the lighter, denser weekly layer

---

## Why This Architecture Is Correct

The requirement is to:

- celebrate milestones
- preserve hierarchy
- avoid clutter
- operate a real recognition feature
- improve employee engagement
- keep recognition visible
- support moderated participation
- connect the homepage to a deeper Kudos destination

The locked pattern is:

- Band A for formal editorial milestones
- Kudos as a distinct embedded recognition module
- Band B for compact weekly celebrations

This creates a stronger and more complete People & Culture experience than either the old standalone Kudos page or a flattened all-content-in-one-grid approach.

---

## Locked Final Pattern

Build **Celebrating Our People** as:

- **Top band:** editorial announcement grid
- **Middle module:** Kudos recognition spotlight + recent approved recognition headlines + Give Kudos CTA
- **Bottom band:** compact weekly celebration grid or rail

This delivers:

- support for multiple simultaneous celebration items
- a real employee-recognition engine
- clear hierarchy
- correct persistence behavior
- stronger editorial control
- better employee engagement
- a more enticing homepage experience
- a seamless bridge into a full dedicated Kudos destination

---

## Implementation Summary

### Layout model

- **Three-part composition: Band A + Kudos recognition module + Band B**

### Primary content band

- **Announcement grid**
- 2-column editorial layout
- 2–4 visible items

### Recognition module

- **Featured approved Kudos spotlight**
- **Recent approved Kudos headlines**
- homepage quick-submit entry point
- link to full dedicated Kudos page
- Celebrate reactions
- moderation and pinning support

### Secondary content band

- **Weekly celebration grid / rail**
- compact people tiles
- 4–8 visible items

### Required behavior

- date-based visibility
- type-specific persistence windows
- editorial override support
- Kudos approval workflow
- configurable reviewer/approver property
- 14-day age-off for unpinned Kudos
- companywide visibility for approved Kudos
- strong but lightweight visual hierarchy

---

## Locked Phase Sequence

Implementation follows the phase sequence defined in `01_Roadmap/Revised_Full_Phase_Map.md`:

1. Phase 00 — Doctrine Lock and Surface Reset
2. Phase 1A — Content Model and Source Strategy
3. Phase 1B — Visibility, Persistence, Approval, and Editorial Rules
4. Phase 2 — Adapter and Output Foundation
5. Phase 3 — Desktop Composition Skeleton
6. Phase 4 — Band A — Highlights / Announcements
7. Phase 5 — Kudos Homepage Module
8. Phase 6 — Dedicated Kudos Page + HR/Admin Moderation Workspace
9. Phase 7 — Band B — This Week
10. Phase 8A — Responsive Behavior
11. Phase 8B — Authoring / Loading / Empty / Partial-Data Hardening
12. Phase 9 — CTA, Editorial Controls, and Final Refinement
13. Phase 10 — Packaging, Runtime Proof, and Production Hardening
