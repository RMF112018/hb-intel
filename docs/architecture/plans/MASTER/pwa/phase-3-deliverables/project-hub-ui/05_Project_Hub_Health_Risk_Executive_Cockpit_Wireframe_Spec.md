# Project Hub Wireframe Spec — Concept 4: Health / Risk Executive Cockpit

## Concept Identity

- **Concept Name:** Health / Risk Executive Cockpit
- **Positioning:** Executive / intervention-first concept
- **Primary Intent:** Give executives and project leadership a watchlist-driven cockpit that translates risk into intervention without forcing module-first navigation.

## Design Thesis

This concept assumes executive users do not need a dense module launcher or highly interactive working canvas as their default. They need:

- concentration of risk,
- change over time,
- intervention opportunities,
- visibility into ownership and unresolved bottlenecks.

The cockpit focuses on health, exposure, trend, and intervention.

## Primary Users

- Portfolio Executive
- Executive leadership
- Project Executive
- Senior reviewers
- Secondary: PMs needing a leadership-style watch view

## Core UX Goals

- surface risk quickly,
- prioritize projects needing intervention,
- support watchlist behavior,
- tie analytics directly to actions.

---

## Screen Identity

- **Screen Name:** Project Hub — Executive Cockpit
- **Screen Type:** Leadership watchlist and intervention surface
- **Primary Entry Modes:**
  - portfolio root,
  - project selection from risk list,
  - direct project cockpit route

---

## Layout Model

### Region Map

1. **R1 — Portfolio / Project Header**
2. **R2 — Watchlist Panel**
3. **R3 — Risk and Exposure Canvas**
4. **R4 — Intervention Rail**
5. **R5 — Trend / Timeline Zone**

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Executive Header                                                         │
│ Filters | Thresholds | Portfolio / Project Context | Search | Watchlists    │
├──────────────────────────────┬───────────────────────────────────────────────┤
│ R2: Watchlist Panel          │ R3: Risk and Exposure Canvas                 │
│ Projects needing attention   │ Health concentration                          │
│ Aging decisions              │ Cost exposure                                 │
│ Forecast drift               │ Schedule / milestone risk                     │
│ Closeout / turnover lag      │ Quality / safety posture                      │
├──────────────────────────────┴───────────────────────────────┬───────────────┤
│ R5: Trend / Timeline Zone                                    │ R4: Intervene │
│ Trend lines | movement | recent changes | triggered signals  │ Assign        │
│                                                              │ Escalate      │
│                                                              │ Open module   │
│                                                              │ Compare hist. │
└──────────────────────────────────────────────────────────────┴───────────────┘
```

---

## Region Specifications

## R1 — Executive Header

### Purpose

- establish portfolio or project context,
- set thresholds,
- support watchlist and filter behavior.

### Required Content

- current scope (portfolio or project)
- threshold presets
- health filter
- department / lifecycle filters
- search
- saved watchlist selector

---

## R2 — Watchlist Panel

### Purpose

- list the projects, risks, or signals requiring leadership attention

### Watchlist Categories

- Aging decisions
- Forecast drift
- Milestone risk
- Blocked readiness
- Closeout lag
- Quality / safety concern concentration

### Item Requirements

- project name
- signal type
- severity
- age / trend
- primary owner
- direct jump to cockpit focus

### Interaction Notes

- selecting a watch item updates the risk canvas and intervention rail
- watchlist can be filtered by type, severity, or owner

---

## R3 — Risk and Exposure Canvas

### Purpose

- visualize concentration of project strain and the biggest drivers

### Major Zones

- **Z1 — Overall Health Posture**
- **Z2 — Cost / Forecast Exposure**
- **Z3 — Schedule / Milestone Risk**
- **Z4 — Quality / Safety / Closeout Signals**
- **Z5 — Cross-Driver Correlation Summary**

### Behavior

- every zone must explain:
  - what changed,
  - why it matters,
  - who owns it,
  - what action is available.

### Notes

- analytics are allowed to be more prominent here than in other concepts,
- but they must remain intervention-oriented.

---

## R4 — Intervention Rail

### Purpose

- convert insight into action

### Required Actions

- assign
- escalate
- open underlying module
- request review
- compare history
- create follow-up work

### Each Intervention Card Should Show

- affected project or record
- signal source
- owner
- urgency
- next recommended action

### Interaction Notes

- intervention actions may generate work items or escalation routes
- users should not need to enter the source module just to route a leadership action

---

## R5 — Trend / Timeline Zone

### Purpose

- show whether the project is stabilizing or degrading

### Content Types

- trend lines
- major state changes
- recently crossed thresholds
- intervention history

### Interaction Notes

- selecting a trend point updates current context
- should support “compare current vs previous” type behavior

---

## Executive Canvas Components

## Z1 — Overall Health Posture

### Required Content

- project status band
- top 3 contributing dimensions
- trend over time
- current confidence / freshness

### CTAs

- open project control center
- review drivers
- create intervention

---

## Z2 — Cost / Forecast Exposure

### Required Content

- forecast drift
- unresolved financial exposure
- pending confirmations
- report / review posture

### CTAs

- open financial source
- request review
- assign follow-up

---

## Z3 — Schedule / Milestone Risk

### Required Content

- milestone drift count
- near-term risk
- stale update warning
- linked downstream readiness impact

### CTAs

- open schedule
- review constraints
- escalate if needed

---

## Z4 — Quality / Safety / Closeout Signals

### Required Content

- major health band summaries
- blocked gates
- unresolved corrective signals
- closeout or turnover concerns

### CTAs

- open source module
- assign intervention
- review related records

---

## Z5 — Cross-Driver Correlation Summary

### Required Content

- concise explanation of multi-domain strain
- example: schedule drift driving startup risk and forecast uncertainty

### CTAs

- open linked records
- review cross-module impacts

---

## Interaction Model

## Primary Flow

1. User lands on portfolio or project cockpit.
2. Watchlist indicates where attention is needed.
3. Selecting a watch item updates risk canvas.
4. Intervention rail surfaces possible actions.
5. User acts without needing to browse module taxonomy first.

## Important Behaviors

- analytics must lead to action.
- watchlist should feel alive, not static.
- project entry should be subordinate to issue entry.

---

## Responsive / Device Notes

### Desktop

- ideal layout with watchlist, canvas, and intervention rail

### Tablet

- watchlist may compress
- intervention rail may collapse into drawer

### Mobile

- possible but not ideal for full executive cockpit

---

## Visual Hierarchy

- risk/exposure canvas is dominant
- watchlist is second
- intervention rail is third but operationally important
- trends support, not dominate

---

## UX Success Criteria

Leadership should be able to:

- see where projects are drifting,
- understand why,
- know who owns the issue,
- intervene directly.

---

## Implementation Notes

- Strongest fit for leadership-facing roles.
- Less appropriate as the universal PM-first hub.
- Analytics must remain tightly tied to intervention workflows.
