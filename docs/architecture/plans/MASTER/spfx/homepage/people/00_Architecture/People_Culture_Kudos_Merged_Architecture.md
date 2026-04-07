# People & Culture Webpart — Fully Merged Architecture with Kudos

## Objective

Build a premium SharePoint-hosted **People & Culture** webpart that combines:

- formal people/culture announcements
- a moderated Kudos recognition engine
- birthdays and anniversaries

into one coherent, elegant, engaging homepage surface.

## Final homepage structure

1. **Band A — Highlights / Announcements**
2. **Kudos Recognition Module**
3. **Band B — This Week**

This is the authoritative final homepage composition.

## Header Row

- Title: **Celebrating Our People**
- Optional supporting line:
  - `Birthdays, anniversaries, recognition, milestones, and team news`
- Optional global CTA posture:
  - `View all`
  - `Submit announcement`

## Band A — Highlights / Announcements

### Included item types
- promotions — persist **5 days**
- baby announcements — persist **3 days**
- wedding announcements — persist **3 days**
- special announcements — persist **3 days**

### Layout direction
- Desktop: **2-column editorial grid**
- Tablet: stacked or 2-up
- Mobile: stacked vertically

### Card direction
- photo
- person/family name
- announcement type badge
- headline
- summary
- optional CTA / whole-card interaction

### Display volume
- **2 to 4 visible items**
- collapse entirely when empty

## Kudos Recognition Module

### Purpose
Kudos is the recognition engine of the webpart.

It must:
- let employees submit Kudos
- route submissions through HR/admin approval
- spotlight the most recent approved Kudos item
- show recent approved Kudos headlines
- allow lightweight reactions
- link into a full dedicated Kudos experience/page

### Homepage structure

#### Local header row
- Title: **Kudos**
- Support line:
  - `Recognize great work, celebrate teammates, and spotlight wins across the company`
- Primary CTA:
  - `Give Kudos`
- Secondary CTA:
  - `View All Kudos`

#### Featured Kudos spotlight
The newest approved Kudos item becomes the featured recognition story.

Support:
- large image area
- fallback to avatar/user photo if no custom image exists
- headline
- recipient names or group labels
- submitted-by attribution
- short excerpt
- celebrate count
- click through to full page/detail

#### Recent Kudos headlines
Support:
- **3 to 6** recent approved Kudos headlines
- compact thumbnail/avatar
- headline
- short excerpt
- submitted-by attribution
- optional Celebrate action
- click through to full page/detail

### Submission model
Support both:
1. **Homepage quick submission**
2. **Dedicated page long-form submission**

### Approval model
All Kudos must go through **HR/admin review and approval** before visibility.

Reviewer/approver must be a **configurable webpart property**.

### Publishing rules
- approved Kudos visible to **everyone in the company**
- default homepage age-off after **14 calendar days**
- HR can **pin** Kudos to keep them visible longer
- no anonymous submissions
- support **multiple recipients**
- support recipients that are:
  - individuals
  - teams
  - departments
  - project groups

### Reactions
Single positive reaction type:
- **Celebrate**

### Recipient source
Use a controlled company directory / employee list pattern, based on SharePoint tenant directory / Person picker behavior.

### Media model
Support:
- employee photos
- team photos
- project imagery

Fallback:
- avatar/user photo

## Dedicated Kudos Page

The homepage module links into a full dedicated Kudos destination.

### Employee-facing experience
Support:
- archive browsing
- longer-form submission
- full Kudos detail views
- Celebrate reactions
- browse by:
  - person
  - team
  - department
  - project group

### HR/admin moderation workspace
Support:
- pending queue
- review detail
- approve
- reject
- pin / unpin
- publication management

## Band B — This Week

### Included item types
- birthdays within the next **7 days**
- anniversaries within the next **7 days**

### Layout
- Desktop: compact grid or rail
- Tablet: 2-column compact grid
- Mobile: compact stack or horizontal swipe rail

### Tile direction
- photo or avatar
- full name
- celebration type
- date or relative timing
- anniversary year count where relevant

### Display volume
- **4 to 8 visible items**

Band B must read as the most compact and least editorial of the three content regions.

## Global Rules

### Original celebration visibility rules
- birthdays: next 7 days
- anniversaries: next 7 days
- promotions: 5 days
- baby announcements: 3 days
- wedding announcements: 3 days
- special announcements: 3 days unless pinned

### Celebration editorial override fields
- `startDisplayDate`
- `endDisplayDate`
- `isPinned`
- `priorityOverride`
- `homepageEnabled`

### Kudos governance fields
- `status`
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

## Responsive principle

As width narrows:
- Band A remains the most editorial layer
- Kudos remains more prominent and engaging than Band B
- Band B remains the lightest and densest layer
- one-band and no-data states must still feel intentional
