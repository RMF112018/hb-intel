# Project Hub Wireframe Spec — Concept 5: Lifecycle Spine

## Concept Identity

- **Concept Name:** Lifecycle Spine
- **Positioning:** Long-term continuity-first concept
- **Primary Intent:** Replace module-first organization with a lifecycle-first project spine that shows how work, issues, decisions, and readiness move across the project lifecycle.

## Design Thesis

This concept assumes the project lifecycle is the best primary organizing structure. Users should experience the project as a continuous path instead of as isolated workspaces. The hub is centered on lifecycle phases, with each phase exposing:

- current condition,
- open work,
- blockers,
- linked records,
- next actions.

This is the strongest continuity expression among the concepts.

## Primary Users

- PM
- PE
- PX
- closeout / startup stakeholders
- cross-functional users tracking continuity across phases

## Core UX Goals

- reinforce lifecycle continuity,
- reduce module fragmentation,
- make upstream/downstream effects visible,
- align project state, blockers, and actions along one spine.

---

## Screen Identity

- **Screen Name:** Project Hub — Lifecycle Spine
- **Screen Type:** Lifecycle-centered operating surface
- **Primary Entry Modes:**
  - direct project route,
  - project selection from portfolio,
  - lifecycle deep link

---

## Layout Model

### Region Map

1. **R1 — Project Header**
2. **R2 — Lifecycle Spine**
3. **R3 — Active Phase Workspace**
4. **R4 — Continuity / Related Items Rail**
5. **R5 — Decision / Timeline Footer**

### Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: Project Header                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ R2: Lifecycle Spine                                                          │
│ Startup ─ Procurement ─ Execution ─ Controls ─ Closeout / Warranty          │
├───────────────────────────────────────────────┬──────────────────────────────┤
│ R3: Active Phase Workspace                    │ R4: Continuity Rail          │
│ Phase summary                                 │ Related records              │
│ Open work                                     │ Upstream dependencies        │
│ Blockers                                      │ Downstream impacts           │
│ Readiness / posture                           │ Cross-module links           │
├───────────────────────────────────────────────┴──────────────────────────────┤
│ R5: Decision / Timeline Footer                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Region Specifications

## R1 — Project Header

### Purpose

- establish project context
- show overall posture and current lifecycle focus
- provide search / switching / system truth

### Required Content

- project identity
- phase
- overall health
- lane / sync / access
- search
- switcher

---

## R2 — Lifecycle Spine

### Purpose

- organize the page by lifecycle progression, not module taxonomy

### Core Phase Nodes

- Startup
- Procurement / Preconstruction
- Execution
- Controls
- Closeout / Warranty

### Each Phase Node Must Show

- posture band
- open work count
- blocker count
- primary owner
- phase readiness signal

### Interaction Notes

- selecting a phase updates the active phase workspace
- spine should support quick phase comparison
- phases may show transitions or strain propagation indicators

---

## R3 — Active Phase Workspace

### Purpose

- provide the detailed operating view for the selected phase

### Required Sections

- phase summary
- current posture
- open work
- active blockers
- major decisions
- linked modules
- immediate CTAs

### Example by Phase

#### Startup
- readiness certifications
- launch blockers
- mobilization actions

#### Procurement
- buyout / readiness / permit dependencies
- critical approvals
- material / compliance strain

#### Execution
- daily operational blockers
- schedule drift
- quality / safety / issue concentration

#### Controls
- financial, schedule, reports, constraints posture
- decision and review concentration

#### Closeout / Warranty
- turnover readiness
- unresolved closeout tasks
- warranty coverage / cases

### Interaction Notes

- modules are entered through lifecycle context
- phase workspace explains which modules are most relevant now

---

## R4 — Continuity / Related Items Rail

### Purpose

- show upstream and downstream continuity across phases

### Required Sections

- Related Records
- Upstream Dependencies
- Downstream Impacts
- Cross-Module Links
- Continuity Notes

### Interaction Notes

- rail updates with selected phase
- selecting a related item may highlight both source and target phases
- emphasize project memory and chain-of-impact

---

## R5 — Decision / Timeline Footer

### Purpose

- keep major project movement visible along the lifecycle

### Content Types

- phase transitions
- milestone movement
- major approvals
- readiness changes
- handoffs
- published artifacts

---

## Phase Workspace Detail

## P1 — Phase Summary Panel

### Required Content

- current phase posture
- why this phase matters now
- near-term major concern
- owner summary

### CTAs

- open related work
- view blockers
- jump to associated module

---

## P2 — Open Work Panel

### Required Content

- items relevant to the phase
- owner
- due posture
- blocker relationship

### CTAs

- open work item
- view related record
- route / escalate

---

## P3 — Blockers Panel

### Required Content

- major blockers by severity
- age
- impact scope
- phase relevance

### CTAs

- open blocker
- view upstream dependency
- view downstream impact

---

## P4 — Linked Modules Panel

### Purpose

- make module relevance secondary to phase relevance

### Required Content

- modules most active in this phase
- module posture
- direct actions

---

## Interaction Model

## Primary Flow

1. User lands in project.
2. Lifecycle spine shows where the project is and where strain is concentrated.
3. User selects or remains in current phase.
4. Active phase workspace shows work, blockers, and decisions.
5. Continuity rail reveals upstream and downstream impacts.
6. User acts from phase context into modules only when needed.

## Important Behaviors

- lifecycle must remain visually legible and meaningful,
- module taxonomy should not take over the layout,
- phase transitions and continuity should be highly visible.

---

## Responsive / Device Notes

### Desktop

- full lifecycle spine visible
- active workspace + continuity rail

### Tablet

- spine may compress
- continuity rail may collapse

### Mobile

- vertical lifecycle stack may be needed
- not ideal as the first mobile implementation

---

## Visual Hierarchy

- lifecycle spine is the dominant conceptual anchor
- active phase workspace is the dominant content region
- continuity rail is secondary but important
- footer supports phase memory

---

## UX Success Criteria

Users should be able to:

- understand where the project sits in its lifecycle,
- see what is blocking movement to the next stage,
- understand upstream/downstream effects,
- act within phase context instead of module-first context.

---

## Implementation Notes

- Strongest conceptual fit for continuity-driven product strategy.
- Requires high-quality cross-module lifecycle mapping.
- More ambitious than incremental control-center evolution.
