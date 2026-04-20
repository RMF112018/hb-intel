# Project Hub Wireframe Spec — Concept 2: Control Center + Posture-Aware Command Rail

## Concept Identity

- **Concept Name:** Control Center + Posture-Aware Command Rail
- **Positioning:** Strong near-term concept
- **Primary Intent:** Keep the Control Center as the canonical project root, but replace passive navigation with a posture-aware command rail and an action-oriented center workspace.

## Design Thesis

This concept treats the project root as a command surface. The left rail is not just a module list; it is a live board showing where the project is healthy, strained, blocked, or review-only. The center area remains the active control center. The right side remains a focused action rail.

This concept is the most incremental evolution from a traditional project dashboard while still materially changing how users enter and understand modules.

## Primary Users

- Project Manager
- Project Executive
- Portfolio Executive
- Superintendent in governed companion mode

## Core UX Goals

- Improve discoverability without increasing clicks
- Expose module posture before entry
- Preserve a central control-center surface
- Support incremental adoption from current hub patterns

---

## Screen Identity

- **Screen Name:** Project Hub — Control Center
- **Screen Type:** Command-oriented project landing surface
- **Primary Entry Modes:**
  - Direct project route
  - Project selection from portfolio
  - Return from module / report / work item

---

## Layout Model

### Region Map

1. **R1 — Project Header**
2. **R2 — Posture-Aware Command Rail**
3. **R3 — Control Center Core**
4. **R4 — Action Rail**
5. **R5 — Timeline / Continuity Footer**

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Project Header                                                           │
├───────────────────┬──────────────────────────────────────────────┬───────────┤
│ R2: Command Rail  │ R3: Control Center Core                      │ R4: Action│
│ Health            │ Top project narrative                        │ My Work   │
│ Financial         │ Primary KPI stack with direct actions        │ Bottlenecks│
│ Schedule          │ Open decision summary                        │ Escalations│
│ Constraints       │ Risk and blocker concentration               │ Related   │
│ Permits           │ Module preview / selected module posture     │ Last touched│
│ Safety            │                                              │           │
│ Reports           │                                              │           │
│ QC                │                                              │           │
│ Closeout          │                                              │           │
│ Startup           │                                              │           │
│ Warranty          │                                              │           │
├───────────────────┴──────────────────────────────────────────────┴───────────┤
│ R5: Timeline / Continuity Footer                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

## R1 — Project Header

### Purpose

- Establish project context and runtime truth
- Provide search, switching, and status posture

### Required Content

- project name / number
- phase
- overall health
- lane and access truth
- search
- switcher
- back action

---

## R2 — Posture-Aware Command Rail

### Purpose

- act as navigation plus operational status board

### Each Row Must Show

- module name,
- posture state,
- issue/action count,
- lane posture,
- owner bottleneck or review state.

### Interaction Notes

- Clicking a row updates the center core.
- Hover or expansion reveals key posture drivers.
- Rows may support:
  - preview,
  - open summary,
  - open full surface.

### Supported Posture States

- Healthy
- Watch
- At Risk
- Critical
- No Data
- Read Only
- Review Only
- Escalates to PWA

---

## R3 — Control Center Core

### Purpose

- remain the canonical project command area
- present core project condition and module-aware operational summaries

### Core Sections

- **C1 — Project Summary Narrative**
- **C2 — KPI / Posture Stack**
- **C3 — Open Decisions**
- **C4 — Major Risks / Blockers**
- **C5 — Selected Module Preview**

### Behavior

- default state shows project-wide summary
- selected module from R2 swaps or overlays module-specific summary
- the center does not become a full module surface by default; it previews and routes

---

## R4 — Action Rail

### Purpose

- hold active work, escalation, and related-item continuity

### Sections

- My Work
- Team Bottlenecks
- Escalations
- Related Records
- Recently Touched Items

### Interaction Notes

- Rail reacts to selected module or selected decision
- Can be filtered by urgency and ownership
- Never hidden on desktop

---

## R5 — Timeline / Continuity Footer

### Purpose

- provide project movement awareness
- anchor major events and transitions

### Content Types

- decisions
- milestone changes
- published artifacts
- escalations
- major work state changes

---

## Control Center Core Detail

## C1 — Project Summary Narrative

### Required Content

- project phase summary
- top operating concern
- top near-term focus
- major dependencies

### CTAs

- open affected module
- view next moves
- open related records

---

## C2 — KPI / Posture Stack

### Required Content

- limited, action-tied KPI set
- no decorative metrics
- each KPI maps to a decision or action

### Example Elements

- cost exposure,
- milestone drift,
- blocker volume,
- overdue decisions.

---

## C3 — Open Decisions

### Required Content

- pending decision count
- most critical decision
- aging decisions
- decision owner

### CTAs

- review decision
- assign / escalate
- open related module

---

## C4 — Major Risks / Blockers

### Required Content

- top blockers,
- severity,
- age,
- impacted modules or milestones.

### CTAs

- open blocker,
- view linked work,
- escalate.

---

## C5 — Selected Module Preview

### Purpose

- preview selected module in-place without full module transition

### Required Content

- module posture summary
- critical counts
- lane behavior
- top available actions

### CTAs

- open in current lane
- escalate to PWA
- review-only open

---

## Interaction Model

## Primary Flow

1. User lands on project control center.
2. Header confirms context and truth.
3. Command rail shows module posture.
4. Center shows project-wide or selected-module control summary.
5. Action rail keeps work visible.
6. User opens deeper surface only when necessary.

## Important Behaviors

- Center workspace should update quickly with low cognitive cost.
- Command rail must reduce navigation uncertainty.
- The page should still feel like a control center, not a dashboard mosaic.

---

## Responsive / Device Notes

### Desktop

- Full left rail, center control area, right action rail

### Tablet

- Center remains primary
- Left rail may become collapsible
- Right rail may become a slide panel

### Mobile

- Not the ideal primary form for this concept
- Requires simplified stacked mode

---

## Visual Hierarchy

- Center core is dominant
- Command rail is always legible
- Action rail is persistent and secondary in visual weight but high in functional value
- Footer timeline is subdued

---

## UX Success Criteria

Users should be able to:

- see where the project is strained,
- understand which module matters next,
- preview a module before full entry,
- find work and escalation paths immediately.

---

## Implementation Notes

- This concept is the strongest incremental evolution from existing route-based control-center behavior.
- It avoids a radical replatforming of the experience.
- It depends heavily on strong module posture contracts.
