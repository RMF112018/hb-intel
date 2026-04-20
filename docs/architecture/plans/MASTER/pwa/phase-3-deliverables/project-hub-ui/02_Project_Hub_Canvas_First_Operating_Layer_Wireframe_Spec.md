# Project Hub Wireframe Spec — Concept 1: Canvas-First Operating Layer

## Concept Identity

- **Concept Name:** Canvas-First Operating Layer
- **Positioning:** Standalone concept
- **Primary Intent:** Make the project home canvas the primary Project Hub experience so the user starts with a role-shaped operational surface instead of a fixed dashboard or module menu.

## Design Thesis

This concept assumes the canvas should be the center of gravity for Project Hub. Rather than routing users into a generic summary page and then into modules, the project canvas becomes the place where:

- major risks are visible,
- role-specific priorities are composed,
- tile layout is persistent,
- actions emerge from the tile structure.

The canvas is not a decorative dashboard. It is the project’s working surface.

## Primary Users

- Project Manager
- Project Executive
- Superintendent
- Executive / reviewer roles using alternate tile defaults

## Core UX Goals

- Let the page feel project-specific and role-specific
- Use configurable tiles without sacrificing governance
- Keep project condition, work, and priorities in one center surface
- Reduce launcher-page behavior

---

## Screen Identity

- **Screen Name:** Project Hub — Canvas-First Operating Layer
- **Screen Type:** Dashboard-like project operating surface
- **Primary Entry Modes:**
  - Direct project route
  - Project selection from portfolio view
  - Return from module or work item

---

## Layout Model

### Region Map

1. **R1 — Project Header**
2. **R2 — Canvas Tile Grid**
3. **R3 — Supporting Context Rail**
4. **R4 — Activity / Timeline Strip**

### Structural Intent

- The canvas dominates the page.
- Context is secondary and sits in a supporting rail.
- Navigation to deeper modules occurs through tiles, not separate launcher cards.

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Project Header                                                           │
│ Project | Phase | Health | Search | Switcher | Lane / Sync                  │
├───────────────────────────────────────────────────────┬──────────────────────┤
│ R2: Canvas Tile Grid                                  │ R3: Context Rail     │
│ [Primary Health Tile]                                 │ Next Moves           │
│ [Financial Tile] [Schedule Tile]                      │ Related Records      │
│ [Constraints Tile] [Operational Priorities Tile]      │ Open Decisions       │
│ [Reports Tile] [QC / Closeout / Startup / Warranty]   │ Major Blockers       │
├───────────────────────────────────────────────────────┴──────────────────────┤
│ R4: Activity / Timeline Strip                                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

## R1 — Project Header

### Purpose

- Confirm context
- Show top-level project posture
- Provide search and switching

### Required Content

- Project name and number
- Lifecycle phase
- Overall health indicator
- Lane indicator
- Sync / freshness indicator
- Search
- Project switcher
- Back to Portfolio

### Interaction Notes

- Header must remain fixed or sticky on longer canvases.
- Search results should be context-aware to the active project.

---

## R2 — Canvas Tile Grid

### Purpose

- Serve as the primary operating layer
- Present the project through governed tiles
- Provide immediate drill paths into major work zones

### Canvas Rules

- Role-based defaults required
- Mandatory tiles fixed
- Recommended tiles movable
- Optional tiles addable/removable
- Layout persisted by user + role + project
- Tile size governed by layout rules

### Default Tile Categories

- **Primary:** Health / Risk
- **Operational:** Financial, Schedule, Constraints
- **Decision / Action:** Priorities, Decisions
- **Continuity:** Reports posture, related items, recent changes
- **Lifecycle-specific optional:** QC, Startup, Closeout, Warranty

### Tile Behavior

Every tile must provide:

- posture
- short explanation of why it matters
- current owner / source of action
- direct CTA(s)

### Tile Selection Behavior

- tile selection may expand inline,
- open a side panel,
- or launch a full module surface,
- depending on tile depth and lane behavior.

---

## R3 — Supporting Context Rail

### Purpose

- Provide supporting context without reducing canvas dominance
- Surface the most important non-tile signals

### Suggested Sections

- My Next Moves
- Related Records
- Open Decisions
- Major Blockers

### Interaction Notes

- R3 should react to selected tile context.
- If no tile is selected, it should show project-wide priority context.
- It must not become a full secondary workspace.

---

## R4 — Activity / Timeline Strip

### Purpose

- Preserve continuity and recent movement
- Support project memory without requiring a timeline page

### Event Types

- Decisions
- Milestones
- Escalations
- Publications
- Opened/closed blockers
- Handoffs

### Interaction Notes

- Event click opens source tile or full module.
- Timeline remains visually subordinate.

---

## Tile Definitions

## T1 — Health / Risk Tile

### Role

Primary tile. Anchors the page.

### Required Content

- overall posture,
- top 3 risk drivers,
- recent trend,
- owner/escalation signal.

### CTAs

- View health details
- Open related modules
- Review linked blockers

---

## T2 — Financial Tile

### Required Content

- forecast posture,
- pending confirmation / review,
- largest exposure,
- related report posture.

### CTAs

- Open financial surface
- Review exposure
- View linked work

---

## T3 — Schedule Tile

### Required Content

- milestone drift count,
- near-term milestone posture,
- update freshness,
- linked downstream impacts.

### CTAs

- Open schedule
- Review milestone risk
- Open related constraints

---

## T4 — Constraints Tile

### Required Content

- open blocker count,
- high severity blockers,
- aging blockers,
- major impacted area.

### CTAs

- Open constraints
- View blocked work
- View downstream impact

---

## T5 — Operational Priorities Tile

### Required Content

- top 3 priorities,
- owners,
- due posture,
- impacted modules.

### CTAs

- Open item
- Route or assign
- View blockers

---

## T6 — Reports / Review Tile

### Required Content

- report family posture,
- ready/pending reviews,
- freshness warnings,
- release/approval state.

### CTAs

- Open reports
- Open ready review
- Escalate if deeper action required

---

## Interaction Model

## Primary Flow

1. User lands in project.
2. Canvas presents role-based operational picture.
3. User sees priority tile(s) first.
4. User acts directly from tile.
5. Supporting context updates in the right rail.
6. Timeline supports continuity.

## Important Behaviors

- Tile hierarchy must be obvious.
- Not all modules need a visible tile at once.
- Canvas should avoid becoming a dense, equal-weight grid.

---

## Responsive / Device Notes

### Desktop

- Full canvas width with right context rail
- Multi-column tile grid

### Tablet

- Canvas remains dominant
- Right rail may collapse
- Tile sizes may become more vertical

### Mobile

- Stack tiles by priority
- Show only primary/supporting tile hierarchy
- Preserve next move summary

---

## Visual Hierarchy

- The health/risk tile is primary.
- Financial and schedule are standard.
- Lifecycle or lower-volume surfaces are supporting.
- Avoid visual equality across all tiles.

---

## UX Success Criteria

The page succeeds if users can quickly:

- understand the project’s operating condition,
- identify the top risks,
- find the right action path from a tile,
- avoid hunting through modules first.

---

## Implementation Notes

- This concept best leverages an existing governed project-canvas runtime.
- It works best when tile contracts are strong and action-oriented.
- The major risk is drifting into “pretty dashboard” behavior instead of operational behavior.
