# Project Spotlight Webpart — Proposed Architecture and Layout

## Objective

Design the **Project Spotlight** webpart as a **visual project-storytelling surface**, not a status widget.

It should feel closer to a polished portfolio/gallery module on an external-facing construction website, while still supporting internal context such as:

- milestone
- freshness
- light project metadata
- click-through to deeper project content
- a **Project Team** section with avatar strip + flyout

The goal is to create a premium, image-led homepage module that communicates project pride, momentum, and quality.

---

## Core Architectural Recommendation

Use a **featured spotlight + supporting rail** architecture.

This webpart should not behave like a list of equal-weight cards.

The correct structure is:

1. **Primary region — Featured Project**
2. **Secondary region — Supporting Spotlights**
3. **Integrated Project Team section** inside the featured spotlight

---

## Primary Region — Featured Project

### Purpose

One project receives dominant treatment and becomes the visual anchor of the webpart.

### Required content

The featured project should include:

- strong hero image
- project name
- location
- market / sector
- short highlight headline
- 1–2 sentence summary
- milestone or status chip
- freshness / update indicator
- CTA such as:
  - `View Project`
  - `Read Update`
  - `See Gallery`

### Experience goal

This region should feel like:

- a mini case-study teaser
- a project gallery hero tile
- a polished portfolio feature

It should **not** feel like a dashboard card.

---

## Secondary Region — Supporting Spotlights

### Purpose

Support the featured project with a small number of lighter, image-led spotlights.

### Recommended count

- **3 to 5 supporting items**

### Supporting item structure

Each supporting tile should include:

- thumbnail image
- project name
- short metadata line
- optional milestone chip
- whole-card click target

### Experience goal

These should feel like **gallery navigation tiles**, not equal-weight mini-cards.

---

## Recommended Desktop Layout

## Preferred layout
Use a **70 / 30 split**:

- **70%** = featured spotlight
- **30%** = vertical supporting rail

This gives:

- strong visual hierarchy
- enough room for large photography
- premium portfolio behavior
- clear editorial balance

## Alternative layout
If the section width is tighter:

- featured project on top
- supporting spotlights below in a horizontal thumbnail strip

---

## Content Hierarchy

The webpart should prioritize information in this order:

1. image
2. project name
3. highlight headline
4. milestone / status
5. short narrative
6. metadata
7. **Project Team**
8. CTA

This is a spotlight surface, not an operational dashboard.

---

## Card Types

## A. Featured Spotlight Card

Use for the dominant project.

### Structure

- full-bleed or near-full-bleed image
- subtle overlay or lower content shelf
- project name as primary heading
- short headline or milestone statement
- concise summary
- supporting metadata row
- **Project Team strip**
- CTA

### Experience goal

This card should feel like a **premium project feature surface**.

---

## B. Supporting Spotlight Tile

Use for secondary projects.

### Structure

- image thumbnail
- project name
- compact metadata line
- optional milestone chip

### Experience goal

These should feel lightweight and highly scannable.

---

## Project Team Section — Option 3

## Architecture choice
Use **Option 3 — Avatar Strip + Flyout**

This gives the homepage:

- human context
- visual warmth
- recognition of the team behind the project
- minimal visual clutter

while still allowing richer team detail on demand.

---

## Data Model for Project Team

### Version 1 source
Use a SharePoint **Person or Group** column with:

- field name: `ProjectTeamMembers`
- allow multiple selections: **Yes**

This is appropriate when the immediate goal is:

- show project team members
- show their photos
- show their names in a polished secondary interaction

### Future upgrade path
If roles and ordering become important later, upgrade to a child list such as:

- `Project Team Assignments`

with:
- Project lookup
- Person
- Role
- Sort Order
- Show on Homepage

But for Version 1, the multi-select Person column is acceptable and efficient.

---

## Project Team Layout

### Placement
The **Project Team** section should live inside the **featured spotlight card**, below metadata and above the CTA.

### Structure
- label: `Project Team`
- compact avatar strip
- max **5 visible**
- then a `+N` overflow chip

### Visible presentation
Homepage view should show:

- circular headshots
- optional small initials fallback if photo is unavailable
- `+N` overflow indicator when more than 5 members exist

This should feel polished and premium, not like an org chart.

---

## Flyout Behavior

### Trigger
Clicking the avatar strip or overflow chip opens a **flyout / anchored overlay / side panel**.

### Flyout contents
The flyout should show the full team list with:

- headshot
- full name
- optional title / role if available later
- optional email/contact action if appropriate
- compact but elegant spacing

### Flyout experience goal
The flyout should feel like:

- a refined project-team detail layer
- lightweight
- human
- useful
- visually consistent with the premium homepage system

It should **not** feel like a crude modal dump of person records.

---

## Flyout Interaction Rules

- compact avatar strip is the teaser
- flyout is the detail layer
- whole strip can be clickable, or just `+N` can open it
- hover may show names, but the primary detail reveal should be the click/flyout
- use restrained motion and accessible focus management
- mobile fallback can be a bottom sheet or full-width panel instead of a small anchored flyout

---

## Filtering / Ranking Logic

The webpart should not show projects only by recency.

Recommended ranking inputs:

- `isFeatured`
- `featuredRank`
- `publishDate`
- `milestoneType`
- `sector`
- `location`
- `freshnessDate`
- `homepageEnabled`

This keeps editorial control while preserving automation.

---

## Suggested Display Modes

## Homepage flagship mode
- 1 featured project
- 3–5 supporting items
- strongest image treatment
- Project Team strip visible in featured card

## Gallery mode
- 2x2 or 3x2 image-led grid
- deeper project-news or portfolio page use

## Compact spotlight mode
- 1 medium feature
- 2–3 compact supporting items
- tighter homepage sections

---

## Responsive Behavior

### Desktop
- featured spotlight left
- supporting rail right
- project team strip visible inside featured card
- flyout anchored from avatar strip

### Tablet
- featured spotlight top
- supporting items below in 2 columns
- flyout may remain anchored or become wider

### Mobile
- featured spotlight first
- supporting items below in swipe rail or stacked list
- team detail opens as bottom sheet or full-width panel

The featured project must always remain first and dominant.

---

## Interaction Model

Use premium but restrained interaction:

- whole-card click target for spotlight surfaces
- subtle hover lift
- light image scale on hover
- clean CTA behavior
- elegant avatar-strip hover/click behavior
- polished flyout transition
- avoid heavy carousel gimmicks unless the photography quality is consistently excellent

---

## What This Webpart Should Not Become

Do not let it drift into:

- a KPI/status widget
- a project list
- a mini report card
- a dense operational grid
- equal-weight thumbnail clutter
- a team roster card detached from the project feature

The homepage version should remain a **project-pride and portfolio-style surface**.

---

## Recommended Final Pattern

Build **Project Spotlight** as:

- **one dominant featured project**
- **a supporting thumbnail rail**
- **image-led storytelling**
- **light internal metadata**
- **integrated Project Team avatar strip**
- **flyout team detail layer**

This gives you:

- premium project storytelling
- strong hierarchy
- a human layer without clutter
- a homepage module that feels much closer to your public website than to an internal dashboard widget

---

## Implementation Summary

### Layout model
- **Featured spotlight + supporting rail**

### Desktop proportion
- **70 / 30 split**

### Featured content
- one dominant project
- large photography
- concise milestone and summary
- integrated Project Team strip

### Team interaction
- **avatar strip + flyout**
- 5 visible members max
- `+N` overflow
- full team detail on click

### Supporting content
- 3–5 supporting spotlight tiles

### Required behavior
- image-led hierarchy
- editorial ranking logic
- compact metadata
- polished overlay behavior for team detail

---

## Recommended Next Step

Translate this architecture into:

1. a **SharePoint List / data schema**
2. a **Project Team field strategy**
3. a **webpart filtering + ranking ruleset**
4. a **component anatomy specification**
5. a **responsive layout and flyout interaction plan**
