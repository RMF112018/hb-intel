# Tool Launcher / Work Hub Webpart — Proposed Architecture and Layout

## Objective

Redesign the **Tool Launcher / Work Hub** webpart as a **premium digital workplace gateway** for third-party platforms and internal systems.

This webpart should provide access to platforms such as:

- BambooHR
- hh2
- ADP
- Cornerstone Training
- Procore
- other approved company systems

The goal is to create a launcher that feels like a **curated internal app marketplace**, not a grid of equal-weight tiles.

This surface should be:

- premium
- highly intentional
- easy to scan
- brand-aware
- organized by real work patterns
- clearly superior to a standard grouped tile launcher

---

## Core Architectural Recommendation

Use a **3-zone launcher architecture**:

1. **Top Command Band**
2. **Primary Platforms Stage**
3. **Secondary Workflow Shelves**

This structure creates hierarchy, improves recognition, and prevents the launcher from collapsing into a cluttered box of links.

---

## Zone 1 — Top Command Band

### Purpose

Provide the webpart with a premium “gateway” identity and lightweight command controls.

### Layout

Use a single horizontal top band inside the webpart.

### Left region

- Title: **Work Hub** or **Platform Gateway**
- Optional supporting line:
  - `Launch the systems your team uses every day`
  - `People, payroll, field, training, project, and finance systems`

### Center region

- **Search / command entry**
- Placeholder example:
  - `Search platforms, workflows, or support`

This should support:
- platform names
- aliases
- workflow keywords
- help/support terms

### Right region

Optional utility controls:
- `All Platforms`
- `Favorites`
- `Need Help`
- `Request Access`

### Experience goal

This band should make the launcher feel like a product, not a card.

---

## Zone 2 — Primary Platforms Stage

### Purpose

Feature the most important third-party platforms with the strongest visual treatment.

### Recommended layout

Use an **8 / 4 desktop split**:

- **8-column primary stage**
- **4-column utility rail**

### Primary stage content

Show the most important daily-use platforms as **large brand-led launch cards**.

### Recommended flagship platforms

- BambooHR
- Procore
- ADP
- hh2
- Cornerstone Training
- any other truly daily critical platform

### Card structure

Each flagship launch card should include:

- official platform logo
- platform name
- one-line purpose statement
- launch CTA
- optional audience / role tag
- optional status or notice badge

### Example content style

- **BambooHR**  
  `People records, time off, and employee information`

- **Procore**  
  `Project delivery, field coordination, and construction management`

- **ADP**  
  `Payroll, pay statements, and tax documents`

### Experience goal

These cards should feel like **premium launch destinations**, not utility tiles.

### Important rule

For major third-party platforms, **brand recognition is part of the UX**.  
Do not reduce major systems to generic icons only.

---

## Zone 3 — Side Utility Rail

### Purpose

Support the primary stage with quieter, personalized, or utility-driven content.

### Recommended content

- **Favorites**
  - user-pinned systems
- **Recently Used**
  - last 3–5 launches
- **Need Help**
  - support and access request links
- **Platform Notices**
  - outages
  - maintenance windows
  - temporary alerts

### Experience goal

This rail should feel useful and polished, but clearly secondary to the flagship launch stage.

---

## Zone 4 — Secondary Workflow Shelves

### Purpose

Organize the remaining platforms by actual work patterns rather than by vague groups.

### Recommended shelves

- **People & Payroll**
  - BambooHR
  - ADP
  - benefits / employee resources

- **Field & Operations**
  - Procore
  - hh2
  - safety / field reporting tools

- **Training & Compliance**
  - Cornerstone
  - certification / policy systems

- **Finance & Admin**
  - finance, AP, procurement, reporting, admin tools

### Shelf style

Each shelf should be a row of **medium launch cards** with:

- logo
- name
- short descriptor
- optional category or audience tag

### Experience goal

These shelves should feel like curated workflow entry points, not generic grouped lists.

---

## “All Platforms” Layer

### Purpose

Support a broader application inventory without crowding the homepage.

### Recommended behavior

Use an **overlay / drawer / panel** for `All Platforms`.

### Contents

- searchable platform index
- alphabetic or category grouping
- logo + name + short descriptor
- optional audience / role visibility tag

### Why it matters

This lets the homepage stay clean and curated while still supporting a larger platform inventory.

---

## Visual Hierarchy

Use a **3-tier card hierarchy**:

### Tier 1 — Flagship Launch Cards
Use for the most important daily-use systems.

### Tier 2 — Workflow Cards
Use for grouped systems in the secondary shelves.

### Tier 3 — Index Rows
Use inside the `All Platforms` layer.

This hierarchy is critical.
Do not let every platform render at equal weight.

---

## Card Types

## A. Flagship Launch Card

Use for:
- BambooHR
- Procore
- ADP
- hh2
- Cornerstone
- other top-tier daily systems

### Structure

- logo
- name
- one-line descriptor
- optional status badge
- clear launch CTA

### Experience goal

This should feel like a **primary app gateway card**.

---

## B. Workflow Shelf Card

Use for:
- supporting systems in category shelves

### Structure

- smaller logo
- name
- short descriptor
- whole-card click target

### Experience goal

This should feel compact, elegant, and useful.

---

## C. All Platforms Row

Use inside:
- searchable full platform index

### Structure

- logo
- name
- short descriptor
- optional role tag
- quick launch action

### Experience goal

This should feel like a premium indexed system directory.

---

## Search / Command Behavior

### Search entry goals

The search surface should allow users to find:

- platform names
- platform aliases
- workflow names
- support actions
- related destinations

### Recommended outcomes

Results should support:
- direct launch
- help destination
- request access
- recent/favorite matching

### Experience goal

The search should behave like a lightweight command layer, not a plain filter box.

---

## Responsive Behavior

### Desktop

- top command band
- 8 / 4 hero-stage split
- workflow shelves below

### Tablet

- flagship platform cards become a 2-column grid
- side utility rail collapses below the primary stage
- shelves remain horizontal or 2-column

### Mobile

- search band first
- flagship cards in swipeable or stacked format
- workflow shelves collapse into accordions or compact sections
- `All Platforms` opens as full-screen sheet

### Responsive priority rule

Search and flagship platforms must remain first on all breakpoints.

---

## Interaction Model

Use premium but restrained interaction:

- subtle hover lift
- clean CTA emphasis
- logo clarity
- optional launch confirmation states if useful
- refined overlay transitions
- clear keyboard focus

Do not use:
- gimmicky carousel behavior
- noisy hover animation
- excessive motion
- dashboard-style click clutter

---

## Content Model

Each platform entry should support:

- platform name
- platform logo
- launch URL
- short descriptor
- category
- audience / role visibility
- featured flag
- favorite-eligible
- status badge
- support owner / help link
- sort order

This content model supports both premium presentation and long-term governance.

---

## What This Webpart Should Not Become

Do not let it become:

- a grouped list of text links
- an equal-weight icon grid
- a generic utility card
- a dashboard box full of tiny launch tiles
- a Lucide-icon substitute for major third-party brands
- a homepage clutter source

This webpart should feel like a **high-end platform gateway**.

---

## Recommended Final Pattern

Build **Tool Launcher / Work Hub** as:

- **Top command band**
  - title
  - smart search
  - `All Platforms`
  - `Favorites`
  - `Need Help`

- **Primary platforms stage**
  - 5–6 large brand-led launch cards
  - BambooHR, Procore, ADP, hh2, Cornerstone as likely anchors

- **Right utility rail**
  - favorites
  - recently used
  - help / request access
  - platform notices

- **Workflow shelves below**
  - People & Payroll
  - Field & Operations
  - Training & Compliance
  - Finance & Admin

This creates a launcher that feels like a curated premium internal app marketplace rather than a standard SharePoint launcher.

---

## Implementation Summary

### Layout model
- **3-zone launcher architecture**

### Primary stage
- **8 / 4 split**

### Top band
- title
- supporting line
- smart search
- utility actions

### Main content
- brand-led flagship platform cards
- secondary utility rail
- workflow-organized shelves

### Required behavior
- real platform logos
- strong hierarchy
- searchable platform access
- premium but restrained interaction
- support for broader “All Platforms” inventory without homepage clutter

---

## Recommended Next Step

Translate this architecture into:

1. a **platform data schema**
2. a **search/result behavior spec**
3. a **component anatomy specification**
4. a **responsive interaction plan**
5. an **authoring and governance model** for featured vs secondary platform entries
