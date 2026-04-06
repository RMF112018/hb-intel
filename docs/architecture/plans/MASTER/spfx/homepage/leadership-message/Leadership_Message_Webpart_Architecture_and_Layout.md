# Leadership Message Webpart — Proposed Architecture and Layout

## Objective

Design the **Leadership Message** webpart as a premium executive communication surface that feels more like a signed leadership note than a generic content card.

The webpart should:

- communicate executive voice clearly
- feel human and authoritative
- remain concise and homepage-appropriate
- support one dominant featured message
- support a small number of archived messages without turning into a news digest
- remain visually distinct from Company Pulse and other editorial surfaces

The goal is to create a webpart that feels calm, deliberate, and executive-grade.

---

## Core Architectural Recommendation

Use a **portrait-led executive note layout**.

This should not be a stacked article card with image attached below the copy.

The correct structural model is:

1. **Primary region — Featured Leadership Note**
2. **Secondary region — Archived Leadership Notes**

The featured note should dominate.
Archived notes should remain present, but secondary.

---

## Primary Region — Featured Leadership Note

### Purpose

One leadership message receives primary emphasis and establishes the tone of the webpart.

### Required content

The featured message should include:

- eyebrow: `From Leadership`
- message title
- concise leadership note / excerpt
- leader name
- leader role
- portrait or branded leadership image
- CTA such as:
  - `Read full note`
  - `View leadership updates`

### Experience goal

This should feel like:

- a signed executive note
- a premium editorial communication
- a calm and authoritative leadership surface

It should **not** feel like a news card or generic article tile.

---

## Recommended Desktop Layout

## Preferred layout
Use a **60 / 40 split**:

- **40% column** = executive portrait / branded leadership image
- **60% column** = message content

This creates:

- stronger human presence
- better executive tone
- clearer visual structure
- stronger distinction from list-based editorial modules

## Alternative layout
If the container width is tighter:

- portrait/image on top
- message content below
- archived strip below that

This should only be the fallback for narrower page sections.

---

## Featured Message Content Hierarchy

The content column should prioritize information in this order:

1. eyebrow
2. message title
3. leadership note / excerpt
4. signature block
5. CTA

This keeps the note elegant and avoids overloading the surface.

---

## Signature Block

The signature block should appear immediately beneath the message body and include:

- leader name
- leader role

Optional:
- very small icon or accent
- subtle divider above signature block

The signature block should feel like a deliberate executive sign-off, not metadata.

---

## Media Treatment

### Preferred treatment
Use one **portrait-led image** or a refined branded leadership image treatment.

### Guidelines
- image should be clean and high quality
- portrait should feel formal but warm
- aspect ratio should be consistent
- image should support the surface, not overpower it

### Avoid
- image as a small thumbnail
- image placed awkwardly below the message
- oversized decorative media that competes with the message

---

## Secondary Region — Archived Leadership Notes

### Purpose

Support the featured note with a small number of prior or related leadership messages.

### Recommended count

- **1 to 2 archived notes** on homepage
- no more than **3** if there is a strong reason

### Recommended layout

Use a **quiet lower strip** or **compact side rail**.

Each archived item should include:

- note title
- leader name
- optional short date or metadata
- subtle CTA or whole-row click target

### Experience goal

Archived messages should feel:

- supportive
- secondary
- quiet
- editorially related

They must not compete with the featured note.

---

## Overall Webpart Anatomy

### Header row

- Title: **Leadership Message**

Optional supporting line:
- `Executive priorities, updates, and company direction`

### Body structure

1. **Featured leadership note**
2. **Archived note strip / rail**

---

## Card Types

## A. Featured Leadership Note Surface

Use for the dominant message.

### Structure

- portrait/image region
- message title
- note excerpt
- signature block
- CTA

### Experience goal

This should feel like a **premium executive communication surface**, not a card template.

---

## B. Archived Note Row / Tile

Use for secondary leadership notes.

### Structure

- title
- leader name
- optional date or short metadata
- subtle click affordance

### Experience goal

These should feel like **quiet supporting links**, not additional featured cards.

---

## Responsive Behavior

### Desktop

- portrait/image left
- message right
- archived note strip below

### Tablet

- portrait/image top-left or full-width top
- message below or beside depending on width
- archived strip below

### Mobile

- image first
- message body second
- signature block third
- CTA fourth
- archived notes as compact stacked rows

The featured message must always remain dominant.

---

## Interaction Model

Use premium but restrained interaction:

- subtle hover behavior for CTA and archived notes
- no heavy motion
- no carousel behavior
- no aggressive transitions

The surface should feel composed and stable.

---

## What This Webpart Should Not Become

Do not let it drift into:

- a news digest
- a rotating carousel of leadership notes
- a large text wall
- a generic article card
- a list of announcements with a leadership label
- an image-below-copy content card

This webpart should remain clearly distinct from Company Pulse.

---

## Recommended Final Pattern

Build **Leadership Message** as:

- **one portrait-led featured leadership note**
- **one quiet archived-note strip**
- **formal but human signature treatment**
- **strong editorial hierarchy**
- **clear visual distinction from other editorial modules**

This gives you:

- stronger executive presence
- more human connection
- cleaner message hierarchy
- a more premium, top-of-class leadership communication surface

---

## Implementation Summary

### Layout model
- **Portrait-led executive note**

### Desktop proportion
- **60 / 40 split**

### Featured content
- one dominant leadership note
- portrait/image region
- concise message
- signature block
- CTA

### Secondary content
- 1 to 2 archived note rows or tiles

### Required behavior
- strong but calm hierarchy
- concise editorial treatment
- formal executive tone
- distinct from Company Pulse

---

## Recommended Next Step

Translate this architecture into:

1. a **component anatomy specification**
2. a **responsive behavior spec**
3. a **content-length and image-ratio rule set**
4. a **visual distinction ruleset** separating Leadership Message from Company Pulse
