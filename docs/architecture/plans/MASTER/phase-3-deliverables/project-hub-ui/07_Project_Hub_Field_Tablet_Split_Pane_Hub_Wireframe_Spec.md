# Project Hub Wireframe Spec — Concept 6: Field Tablet Split-Pane Hub

## Concept Identity

- **Concept Name:** Field Tablet Split-Pane Hub
- **Positioning:** Field-first concept
- **Primary Intent:** Create a tablet-native Project Hub surface for field users that prioritizes area context, quick actions, and work execution over desktop-style module navigation.

## Design Thesis

This concept assumes field users operate under different physical and cognitive conditions than office users. A responsive desktop hub is not enough. The hub should adapt to tablet field workflows by emphasizing:

- area or location context,
- quick capture,
- split-pane action,
- large targets,
- today-focused work.

Modules remain present, but they are hidden behind location and action context.

## Primary Users

- Superintendent
- Field Engineer
- QA/QC
- Safety leadership in field context
- secondary: PM reviewing field state on tablet

## Core UX Goals

- make tablet a primary work surface,
- support quick movement between area and action,
- reduce module friction,
- support photo / issue / checklist / markup patterns.

---

## Screen Identity

- **Screen Name:** Project Hub — Field Tablet Mode
- **Screen Type:** Split-pane field operating surface
- **Primary Entry Modes:**
  - direct field route,
  - project + area selection,
  - field work-item deep link

---

## Layout Model

### Region Map

1. **R1 — Field Header**
2. **R2 — Area / Sheet Pane**
3. **R3 — Action Stack Pane**
4. **R4 — Quick Action Bar**
5. **R5 — Sync / Capture Status Zone**

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Field Header                                                            │
│ Project | Area | Date | Sync | Weather? | Search                            │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ R2: Area / Sheet Pane         │ R3: Action Stack Pane                       │
│ Active location               │ Open observations                           │
│ Sheet / area context          │ Inspections due                             │
│ Linked pins / overlays        │ Punch / QC / safety items                   │
│                               │ Next moves / owners                         │
├───────────────────────────────┴──────────────────────────────────────────────┤
│ R4: Quick Action Bar                                                         │
│ Capture | Markup | Issue | Checklist | Review | Open Full Surface           │
├──────────────────────────────────────────────────────────────────────────────┤
│ R5: Sync / Capture Status                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

## R1 — Field Header

### Purpose

- confirm project and area
- expose sync state visibly
- keep field context short and fast to read

### Required Content

- project name
- active area / location
- current date
- sync state
- optional weather or shift context
- search

### Interaction Notes

- area selection should be easy to change
- sync state must be highly visible
- avoid dense header content

---

## R2 — Area / Sheet Pane

### Purpose

- anchor the user in location or drawing context

### Required Content

- active area / zone
- sheet or location indicator
- linked pins / overlays
- active issue markers
- quick area summary

### Interaction Notes

- selecting a pin or area item updates the action stack
- pane should support:
  - zoom / pan,
  - simple overlays,
  - context switching between area and sheet

---

## R3 — Action Stack Pane

### Purpose

- present work relevant to the active area

### Required Stacks

- Open Observations
- Inspections Due
- Punch / QC / Safety Items
- Next Moves / Owners

### Each Action Card Must Show

- title
- area relevance
- source module
- owner
- due / aging state
- quick CTA

### Interaction Notes

- stack updates when area or pin changes
- action cards should be large enough for field use
- minimal text; direct CTAs

---

## R4 — Quick Action Bar

### Purpose

- provide immediate, high-frequency field actions

### Required Actions

- Capture
- Markup
- Issue
- Checklist
- Review
- Open Full Surface

### Interaction Notes

- always visible on tablet
- large touch targets required
- should support one-handed or quick tap use

---

## R5 — Sync / Capture Status

### Purpose

- make offline / capture posture obvious
- preserve trust in field conditions

### Required Content

- sync state
- pending uploads
- failed uploads / needs attention
- last successful sync

### Interaction Notes

- field users should never wonder whether a photo or issue was captured
- allow retry or inspect pending items

---

## Field Action Definitions

## A1 — Open Observation Card

### Required Content

- issue title
- location
- owner
- severity
- due posture

### CTAs

- open
- add evidence
- mark reviewed

---

## A2 — Inspection Due Card

### Required Content

- inspection title
- location
- due now / soon
- source workflow

### CTAs

- start checklist
- defer with reason
- view related issue

---

## A3 — Punch / QC / Safety Item Card

### Required Content

- item title
- area
- status
- owner
- source type

### CTAs

- open
- attach photo
- update status

---

## Interaction Model

## Primary Flow

1. User lands in project + area.
2. Area pane anchors location.
3. Action stack shows area-relevant work.
4. Quick action bar supports capture and execution.
5. Sync status preserves trust.

## Important Behaviors

- location drives content,
- not module-first,
- quick actions stay persistent,
- minimal transition friction.

---

## Responsive / Device Notes

### Tablet

- primary target device
- split-pane required

### Desktop

- may be usable in a wider adaptation
- not the intended primary mode

### Mobile

- would require a separate stacked field design

---

## Visual Hierarchy

- action stack and area pane are peers
- quick action bar is always present
- sync posture is visible but secondary

---

## UX Success Criteria

Field users should be able to:

- understand where they are working,
- see what is open in that area,
- capture new evidence quickly,
- trust sync / upload behavior,
- avoid navigating module menus.

---

## Implementation Notes

- This is the strongest field-first concept.
- Best as a dedicated tablet mode, not just a responsive desktop variant.
- Requires strong area/location and quick-capture support.
