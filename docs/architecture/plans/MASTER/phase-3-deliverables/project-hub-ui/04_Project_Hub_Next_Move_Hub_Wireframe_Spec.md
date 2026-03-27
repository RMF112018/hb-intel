# Project Hub Wireframe Spec — Concept 3: Next Move Hub

## Concept Identity

- **Concept Name:** Next Move Hub
- **Positioning:** Work-first concept
- **Primary Intent:** Open Project Hub first to ownership, movement, and blockers rather than module taxonomy.

## Design Thesis

This concept assumes the default user question is not “Which module should I open?” but “What needs movement now?” Project Hub opens first to work, accountability, aging items, and blockers. Modules still exist, but they are not the dominant entry mechanism.

This is the strongest anti-module, action-first interpretation of the hub.

## Primary Users

- Project Manager
- Superintendent
- Field Engineer
- Project Executive
- Any user with daily operational workload

## Core UX Goals

- Start with accountability
- Surface stalled work and blockers early
- Reduce time spent navigating to module surfaces
- Use source modules as context, not as the main starting point

---

## Screen Identity

- **Screen Name:** Project Hub — Next Move Hub
- **Screen Type:** Work-first project operating surface
- **Primary Entry Modes:**
  - direct project route,
  - notification / work-item deep link,
  - project selection from portfolio

---

## Layout Model

### Region Map

1. **R1 — Project Header**
2. **R2 — Work Mode Tabs**
3. **R3 — Priority Queue**
4. **R4 — Context / Impact Rail**
5. **R5 — Modules Access Band**

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Project Header                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: Tabs [My Work] [Team Work] [Project Blockers] [Health] [Modules]       │
├───────────────────────────────────────────────┬──────────────────────────────┤
│ R3: Priority Queue                            │ R4: Context / Impact Rail    │
│ Item title                                    │ Source module                │
│ Owner | Aging | Blocker | Next action         │ Related records              │
│ Downstream impact                             │ Impacted milestones          │
│                                               │ Current posture              │
├───────────────────────────────────────────────┴──────────────────────────────┤
│ R5: Modules Access Band                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

## R1 — Project Header

### Purpose

- confirm project scope
- expose runtime truth
- allow search and switching

### Required Content

- project name/number
- phase
- health
- lane
- sync
- access
- search
- switcher

---

## R2 — Work Mode Tabs

### Purpose

- let users choose the work lens they need without leaving the hub

### Required Tabs

- My Work
- Team Work
- Project Blockers
- Health
- Modules

### Default Tab

- **My Work** for operational users
- governed role-based default may change for executive users

### Interaction Notes

- Tab changes update the queue content and context rail.
- Modules remain accessible but secondary.

---

## R3 — Priority Queue

### Purpose

- serve as the dominant operating region
- show what requires movement first

### Each Queue Item Must Include

- short title
- source module
- current owner
- due / aging state
- blocker severity
- downstream impact summary
- next action CTA

### Queue Modes

#### My Work
- directly assigned items
- acknowledgments
- overdue actions
- pending responses

#### Team Work
- work items across the project
- team bottlenecks
- critical owner gaps

#### Project Blockers
- high-severity blockers
- blocked downstream items
- stalled escalation paths

#### Health
- health-driven action recommendations
- strained areas mapped to work items

#### Modules
- module list becomes visible only in this mode or the access band

### Interaction Notes

- selecting an item updates the context rail
- queue should support sort by:
  - urgency,
  - due date,
  - blocker severity,
  - aging,
  - owner

---

## R4 — Context / Impact Rail

### Purpose

- provide the context necessary to act on the selected work item without losing flow

### Required Sections

- Source Module
- Related Records
- Impacted Milestones / Dates
- Current Project Posture
- Recent Related Events

### Interaction Notes

- this rail is item-context-sensitive
- if no item is selected, it shows project-wide major context
- it should support direct jumps to related records

---

## R5 — Modules Access Band

### Purpose

- preserve module discoverability without making modules the dominant page structure

### Format

- compact horizontal or low-height band
- may include posture chips and counts

### Each Module Entry Should Show

- module name
- posture
- optional action count
- lane behavior

### Interaction Notes

- open module summary or full surface
- not visually dominant
- secondary to work-first queue

---

## Queue Item Detail Spec

## Q1 — Standard Work Item

### Required Fields

- title
- source module
- owner
- due date
- aging state
- blocker flag
- next action label
- downstream impact summary

### CTAs

- open item
- take action
- open related record
- escalate if needed

---

## Q2 — Blocker Item

### Required Fields

- blocker title
- severity
- age
- owner
- impacted downstream items
- source module

### CTAs

- open blocker
- view impacted work
- escalate

---

## Q3 — Acknowledgment / Handoff Item

### Required Fields

- item title
- source workflow
- current owner
- response state
- due posture

### CTAs

- acknowledge
- respond
- open source context

---

## Interaction Model

## Primary Flow

1. User lands in project.
2. Work tab defaults based on role.
3. Queue shows highest-priority items.
4. User selects item.
5. Context rail provides impact and related records.
6. User acts directly or opens source module only when necessary.

## Important Behaviors

- module entry must be secondary to work item action.
- source module remains visible for orientation.
- queue filters must be lightweight and fast.

---

## Responsive / Device Notes

### Desktop

- full queue + context rail

### Tablet

- queue remains primary
- context rail may collapse beneath selected item

### Mobile

- this concept translates well to stacked work-list layouts
- compact detail drawer recommended

---

## Visual Hierarchy

- queue is primary
- tabs are secondary but important
- context rail is tertiary
- modules band is supportive, not dominant

---

## UX Success Criteria

Users should be able to:

- identify what they own next,
- see what is blocked,
- understand downstream impact,
- move work without first entering a module.

---

## Implementation Notes

- This concept depends strongly on mature work aggregation, ownership, and relationship primitives.
- It is highly differentiated from the category’s typical module-first pattern.
- Biggest risk: module discoverability must still remain easy for infrequent users.
