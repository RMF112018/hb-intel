# Project Hub Wireframe Spec — Hybrid Operating Layer

## Concept Identity

- **Concept Name:** Hybrid Operating Layer
- **Positioning:** Best overall concept
- **Source Blend:**  
  - Canvas-first shell from **Concept 1**  
  - Posture-aware command rail from **Concept 2**  
  - Persistent next-move / work queue rail from **Concept 3**
- **Primary Intent:** Turn Project Hub into a project operating layer that starts with context, posture, ownership, and action instead of a launcher grid or static dashboard.

## Design Thesis

This concept assumes that the strongest Project Hub is not purely dashboard-first, module-first, or work-list-first. It combines all three into a single operating surface:

- the **canvas** provides role-based flexibility and project-specific composition,
- the **command rail** makes module posture visible before entry,
- the **next-move rail** keeps accountability and work progression visible at all times.

The result should feel like a control cockpit: users can understand the project’s condition, see where strain exists, know what they own next, and move work without losing context.

## Primary Users

- Project Manager
- Project Executive
- Portfolio Executive / Executive Reviewer
- Superintendent
- Field Engineer
- Secondary: cross-functional support roles consuming project health, decisions, and priorities

## Core UX Goals

- Reduce blind clicking into modules
- Make ownership and next action visible before deep navigation
- Preserve project context across every move
- Surface runtime truth honestly: lane behavior, sync/freshness, access posture, escalation depth
- Support role-based layouts without becoming a passive dashboard

---

## Screen Identity

- **Screen Name:** Project Hub — Hybrid Operating Layer
- **Screen Type:** Persistent project operating shell
- **Primary Entry Modes:**
  - Portfolio root → select project
  - Direct project route
  - Deep link from work item, module, report, review artifact, or related record
- **Canonical Outcome:** User lands on a project-scoped operating surface, not a module launcher

---

## Layout Model

The layout uses five persistent regions:

1. **R1 — Global Project Header**
2. **R2 — Posture-Aware Command Rail**
3. **R3 — Operating Canvas**
4. **R4 — Persistent Next-Move / Work Queue Rail**
5. **R5 — Activity / Timeline Strip**

### Structural Intent

- The header is full width and anchors truth, context, and system posture.
- The main body is a three-column operating layout:
  - left = module posture,
  - center = dynamic operating canvas,
  - right = accountability and queue.
- The bottom strip preserves continuity and movement without dominating the page.

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ R1: Project Header                                                                  │
│ Project | Phase | Health | Lane | Sync | Access | Search | Project Switcher        │
├───────────────────┬───────────────────────────────────────────────┬──────────────────┤
│ R2: Command Rail  │ R3: Operating Canvas                          │ R4: Next-Move    │
│ Health            │ [Health / Risk Tile]                          │ My Next Moves    │
│ Financial         │ [Financial Exposure Tile]                     │ Team Queue       │
│ Schedule          │ [Schedule / Milestones Tile]                  │ Aging Items      │
│ Constraints       │ [Constraints / Blockers Tile]                 │ Open Blockers    │
│ Permits           │ [Decision Queue Tile]                         │ Handoffs         │
│ Safety            │ [Operational Priorities Tile]                 │ Waiting on Me    │
│ Reports           │ [Related Items Tile]                          │ Waiting on Others│
│ QC                │ [Reports / Review Posture Tile]               │ Related Records  │
│ Closeout          │ [Role-based additional tiles]                 │                  │
│ Startup           │                                               │                  │
│ Warranty          │                                               │                  │
├───────────────────┴───────────────────────────────────────────────┴──────────────────┤
│ R5: Activity / Timeline Strip                                                       │
│ Recent decisions | Milestone movement | Published artifacts | Escalations           │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

## R1 — Global Project Header

### Purpose

- Confirm project context immediately
- Expose runtime posture before any deeper interaction
- Provide top-level search and switching

### Required Content

- Project name and number
- Project lifecycle phase
- Overall health status
- Lane indicator:
  - PWA Full
  - SPFx Companion
  - Read Only
  - Escalates for deeper action
- Sync / freshness indicator:
  - Live
  - Stale
  - Offline-resilient
  - Needs refresh
- Access / permission posture
- Global search
- Project switcher
- Back to Portfolio action

### Interaction Notes

- Search should resolve modules, records, work items, related records, and likely actions.
- Project switching should preserve section continuity when valid and fallback gracefully when invalid.
- Lane, sync, and access truth must be visible without opening a secondary info panel.

---

## R2 — Posture-Aware Command Rail

### Purpose

- Replace passive module navigation with a live module status board
- Help users understand where the project is healthy, strained, or blocked before opening a module

### Module Inventory

- Health
- Financial
- Schedule
- Constraints
- Permits
- Safety
- Reports
- QC
- Closeout
- Startup
- Warranty

### Each Module Row Must Show

- Module name
- Posture badge
- Open action count
- Critical issue / blocker count
- Lane behavior
- Primary owner or bottleneck signal

### Supported Posture States

- Healthy
- Watch
- At Risk
- Critical
- No Data
- Read Only
- Escalates to PWA
- Baseline / Limited

### Interaction Notes

- Selecting a module row updates the focus of the center canvas and filters the right rail context.
- Hover or expand reveals a quick posture summary and major issue drivers.
- The command rail should support “preview,” “open summary,” and “open full surface.”
- The rail is always visible on desktop and compresses to an expandable drawer on narrower layouts.

---

## R3 — Operating Canvas

### Purpose

- Serve as the main project operating surface
- Provide role-based, persistent composition of high-value operational tiles
- Keep the center of the page action-oriented, not decorative

### Canvas Rules

- Role-based defaults are required.
- Mandatory tiles cannot be removed.
- Recommended tiles may be moved.
- Optional tiles may be added or removed.
- Layout persists by user + role + project.
- Tile content must present posture, why it matters, current owner, and a meaningful CTA.

### Default Tile Set

1. **T1 — Project Health / Risk**
2. **T2 — Financial Exposure / Forecast**
3. **T3 — Schedule Drift / Milestones**
4. **T4 — Constraints / Blockers**
5. **T5 — Decision Queue**
6. **T6 — Cross-Module Related Items**
7. **T7 — Operational Priorities**
8. **T8 — Reports / Review Posture**

### Tile Interaction Rules

- Selecting a tile updates the next-move rail with related items.
- Each tile should support:
  - open details,
  - direct action,
  - related records,
  - escalation when deeper workflow is required.
- Tiles should never present static KPIs without an obvious next step.

---

## R4 — Persistent Next-Move / Work Queue Rail

### Purpose

- Keep responsibility and movement visible at all times
- Preserve a work-first orientation even while users move through modules and tiles

### Required Sections

- My Next Moves
- Team Queue
- Aging Items
- Open Blockers
- Handoffs / Acknowledgments
- Related Records

### Each Work Item Must Include

- Short title
- Source module
- Current owner
- Due / aging state
- Blocker severity if applicable
- Downstream impact summary
- Primary CTA

### Interaction Notes

- Selecting a work item should highlight its source tile and related module posture.
- Rail filters should include:
  - Mine
  - Team
  - Blocked
  - Overdue
  - Waiting on Me
  - Waiting on Others
- Rail context should change with tile/module selection, but the rail itself should remain visible and stable.

---

## R5 — Activity / Timeline Strip

### Purpose

- Preserve continuity across actions and module changes
- Keep movement visible without requiring a full timeline workspace

### Event Types

- Decisions
- Milestone movement
- Published artifacts
- Escalations
- Handoffs
- Opened / resolved blockers
- Lifecycle events

### Interaction Notes

- Event click opens source context.
- Filtering may include:
  - decisions
  - schedule
  - financial
  - quality
  - closeout
- The strip should remain visually secondary to the center canvas and right rail.

---

## Tile Definitions

## T1 — Project Health / Risk

### Purpose

Show the overall condition of the project and the top drivers of strain.

### Required Content

- Overall health posture
- Top 3 risk drivers
- Trend direction
- Owner / escalation indicator

### CTAs

- View health details
- Open contributing modules
- View related work items

---

## T2 — Financial Exposure / Forecast

### Purpose

Surface current financial risk and pending financial action.

### Required Content

- Forecast posture
- Exposure amount or count
- Pending reviews / confirmations
- Major exception or risk driver

### CTAs

- Open financial surface
- Review forecast actions
- View related reports posture

---

## T3 — Schedule Drift / Milestones

### Purpose

Surface schedule movement and time risk.

### Required Content

- Drift count
- Near-term milestone posture
- Freshness / confidence warning if applicable
- Downstream impacts

### CTAs

- Open schedule surface
- Review milestone impacts
- View related constraints

---

## T4 — Constraints / Blockers

### Purpose

Show what is actively preventing project flow.

### Required Content

- Open blocker count
- High severity count
- Aging blockers
- Most impacted module / milestone

### CTAs

- Open constraints surface
- View blocked work items
- View downstream impacts

---

## T5 — Decision Queue

### Purpose

Surface decisions awaiting review, action, or escalation.

### Required Content

- Pending decision count
- Aging decision count
- Highest-priority decision
- Responsible reviewer / owner

### CTAs

- Open decisions
- Review approvals
- Escalate if needed

---

## T6 — Cross-Module Related Items

### Purpose

Preserve continuity between modules through linked records and work graph visibility.

### Required Content

- Related record count
- Highest-value linked records
- Cross-module relationship summary
- Recent linked changes

### CTAs

- Open related items panel
- Jump to linked record
- View source module

---

## T7 — Operational Priorities

### Purpose

Show the highest-value actions for the current role.

### Required Content

- Top 3 priorities
- Current owner
- Due posture
- Impacted module(s)

### CTAs

- Open item
- Route / assign if allowed
- View related blockers

---

## T8 — Reports / Review Posture

### Purpose

Show what report and review workflows are actually operational right now.

### Required Content

- Report family posture
- Pending run / review counts
- Freshness warning
- Approval / release state

### CTAs

- Open reports
- Open ready actions
- Escalate to deeper review surface

---

## Interaction Model

## Primary Flow

1. User lands in project-scoped context.
2. Header confirms truth: project, lane, sync, and permissions.
3. Left rail shows module posture.
4. Center canvas highlights the most important operational summaries.
5. Right rail shows ownership and work movement.
6. User acts directly from a tile or work item.
7. Deeper workflows open in-lane or escalate clearly.

## Cross-Region Rules

- Selecting a module in R2 updates:
  - tile focus in R3
  - queue context in R4
  - optional event filtering in R5
- Selecting a work item in R4 updates:
  - source module highlight in R2
  - related tile focus in R3
  - related events in R5
- No action should silently cross lanes or silently enter read-only depth.

---

## Responsive / Device Notes

### Desktop

- Full five-region model active
- Persistent rails visible
- Bottom strip visible

### Tablet

- Left rail may become expandable
- Right rail may collapse to a panel but remain one tap away
- Canvas remains dominant

### Narrow / Field Context

- This concept is not the dedicated field-first layout
- If adapted, preserve:
  - next moves,
  - posture,
  - quick action continuity,
  - simplified context switching

---

## Visual Hierarchy

- Center canvas is dominant.
- Right rail is operationally critical and must never feel secondary in function.
- Left rail is always legible and status-oriented.
- Bottom strip is supportive.
- Tile/card weights must differentiate:
  - primary,
  - standard,
  - supporting.
- Avoid equal-weight grids and decorative metrics.

---

## UX Success Criteria

The concept succeeds if a user can quickly:

- identify the project and operating context,
- understand lane/sync/access posture,
- see which modules are healthy or strained,
- find what they own next,
- understand where the project is blocked,
- move directly into the correct action path.

---

## Implementation Notes

- Treat the header as a truth surface, not just project branding.
- Treat the command rail as a posture registry plus navigation layer.
- Treat the canvas as a governed tile runtime, not a static dashboard.
- Treat the next-move rail as a persistent accountability spine.
- Treat the timeline strip as continuity support, not a destination workspace.
