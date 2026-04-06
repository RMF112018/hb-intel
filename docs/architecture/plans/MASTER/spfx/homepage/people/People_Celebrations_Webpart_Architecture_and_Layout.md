# People / Celebrations Webpart — Proposed Architecture and Layout

## Objective

Design the **People / Celebrations** webpart so it can display **multiple simultaneous celebrations** in a clean, premium, homepage-appropriate format without collapsing into a cluttered card wall.

This webpart should support:

- birthdays within the next **7 days**
- anniversaries within the next **7 days**
- promotion announcements persisting for **5 days**
- baby announcements persisting for **3 days**
- wedding announcements persisting for **3 days**
- special announcements persisting for **3 days**

The goal is to create a surface that feels warm, human, and editorial while remaining highly scannable.

---

## Core Architectural Recommendation

Use a **two-band architecture** instead of a single-featured-person design.

A single-featured-person model breaks down when multiple birthdays, anniversaries, and announcement-type items overlap.

The correct structure is:

1. **Band A — Highlights / Announcements**
2. **Band B — This Week**

This creates clear hierarchy while allowing multiple people and celebration types to display at the same time.

---

## Band A — Highlights / Announcements

### Purpose

This band is for more editorial, announcement-style items that deserve more visual weight.

### Included item types

- promotions — persist **5 days**
- baby announcements — persist **3 days**
- wedding announcements — persist **3 days**
- special announcements — persist **3 days**

### Recommended layout

Use a **2-column editorial grid** on desktop.

### Card style

Use **medium-format announcement cards** with:

- photo
- person or family name
- announcement type badge
- short headline
- 1–2 line summary
- publish date or “new” indicator
- whole-card click target or CTA

### Display volume

Recommended:
- **2 to 4 visible items max**

If there are no active announcement items, this band should collapse entirely.

---

## Band B — This Week

### Purpose

This band is for higher-volume, shorter-format weekly celebrations.

### Included item types

- birthdays in the next **7 days**
- anniversaries in the next **7 days**

### Recommended layout

Use a **dense compact people grid** or a **horizontally scrollable rail** below Band A.

### Tile style

Use **compact celebration tiles** with:

- photo or avatar
- full name
- celebration type
- date or “in X days”
- anniversary year count where relevant

### Display volume

Recommended:
- **4 to 8 visible items**

Desktop target:
- 4-column compact grid  
or
- horizontal rail with 4–6 items visible at once

This band should feel lighter and more rhythmic than Band A.

---

## Overall Webpart Anatomy

### Header row

- Title: **Celebrating Our People**
- Optional supporting line:
  - `Birthdays, anniversaries, milestones, and team news`
- Optional CTA:
  - `View all`
  - `Submit announcement`

### Body structure

1. **Band A — Announcement grid**
2. **Band B — Birthday / Anniversary rail or grid**

---

## Priority Logic

Do not mix all celebration types into a single equal-weight list.

Use this display priority:

1. special announcements
2. promotions
3. baby announcements
4. wedding announcements
5. anniversaries
6. birthdays

This is a **display hierarchy rule**, not a statement of cultural importance.

The purpose is to ensure the more editorial announcement items retain enough visual authority while the more frequent calendar-style celebrations remain compact and scannable.

---

## Visibility / Persistence Rules

### Birthdays
- show when event date is within next **7 days**

### Anniversaries
- show when event date is within next **7 days**

### Promotions
- show for **5 days** from publish or effective date

### Baby announcements
- show for **3 days**

### Wedding announcements
- show for **3 days**

### Special announcements
- show for **3 days** unless manually pinned

---

## Editorial Override Fields

To balance automation with control, each record should support:

- `startDisplayDate`
- `endDisplayDate`
- `isPinned`
- `priorityOverride`
- `homepageEnabled`

This allows:
- automatic time-based display behavior
- editorial exceptions when needed
- homepage inclusion/exclusion control
- pinned special items without breaking the automated logic

---

## Card Types

## A. Announcement Card

Use for:
- promotions
- baby announcements
- wedding announcements
- special announcements

### Structure

- image top or left
- badge
- headline
- short summary
- optional CTA or whole-card click

### Experience goal

This card should feel like a **mini editorial feature**, not a utility tile.

---

## B. Celebration Tile

Use for:
- birthdays
- anniversaries

### Structure

- avatar or photo
- name
- badge or label
- event date
- years at company if anniversary

### Experience goal

This tile should feel:
- fast
- warm
- scannable
- human
- lightweight

---

## Responsive Layout Behavior

### Desktop

- Band A: **2-column announcement grid**
- Band B: **4-column compact celebration grid**

### Tablet

- Band A: stacked 1-column cards or 2-up depending on width
- Band B: 2-column celebration grid

### Mobile

- Band A first, stacked vertically
- Band B as a horizontal swipe rail or single-column stack

---

## Why This Architecture Is Correct

Your requirement is not to feature one person elegantly.

Your real requirement is to:

- celebrate multiple people at once
- preserve hierarchy
- avoid clutter
- separate announcement-style content from calendar-style content
- keep the homepage emotionally warm without becoming visually noisy

That is why the **two-band architecture** is the right model.

---

## Recommended Final Pattern

Build **Celebrating Our People** as:

- **Top band:** editorial announcement grid
- **Bottom band:** compact weekly celebration grid or rail

This gives you:

- support for multiple simultaneous items
- clear hierarchy
- correct persistence behavior by item type
- a homepage surface that feels alive, warm, and premium
- stronger editorial control without sacrificing automation

---

## Implementation Summary

### Layout model
- **Two-band architecture**

### Primary content band
- **Announcement grid**
- 2-column editorial layout
- 2–4 visible items

### Secondary content band
- **Weekly celebration grid / rail**
- compact people tiles
- 4–8 visible items

### Required behavior
- date-based visibility
- type-specific persistence windows
- editorial override support
- strong but lightweight visual hierarchy

---

## Recommended Next Step

Translate this architecture into:

1. a **SharePoint List / data schema**
2. a **webpart filtering + ranking ruleset**
3. a **component anatomy specification**
4. a **responsive layout implementation plan**
