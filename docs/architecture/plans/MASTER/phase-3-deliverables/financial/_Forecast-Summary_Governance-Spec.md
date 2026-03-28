# Forecast Summary Governance Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The Forecast Summary tool is a governed forecasting operating surface inside the Financial module. It is not a spreadsheet replacement, not a passive executive report, and not merely a text narrative attached to derived values. Its purpose is to present a period-aware, read-only derived operating snapshot, enable structured user-authored period narrative, continuously evaluate readiness posture, and guide contributors and the Project Manager toward a clean, reviewable forecast version.

## 2. Runtime Doctrine Summary

The Forecast Summary tool is governed by the following runtime doctrines:

- **Guided forecasting command-center doctrine**  
  Forecast Summary behaves as an intelligent forecasting operating surface. It must actively highlight variance drivers, unresolved assumptions, version posture, downstream impacts, checklist readiness, and the next best action.

- **Forecast command-center doctrine**  
  The tool behaves as a live forecasting hub. It continuously surfaces current version posture, unresolved forecast drivers, checklist gaps, review status, assumption changes, downstream impacts, and the best next action to move the version forward.

- **Section-owner doctrine**  
  Different users may own different narrative sections at the same time. Ownership must be visible by section, with controlled handoff and collision prevention.

- **Annotated split doctrine**  
  The derived snapshot remains read-only, but users may attach inline commentary, flags, or challenge notes to specific derived values.

- **Integrated readiness doctrine**  
  Readiness depends on more than narrative completion. It must evaluate the combined posture of narrative completeness, derived signals, unresolved forecast drivers, checklist status, version posture, and downstream concerns.

- **Guided drill-through doctrine**  
  The tool provides intelligent drill-through from derived values, flags, and challenge notes into the owning source workflow, preserving project and version/reporting-period context.

- **Shared contributor, PM-consolidation doctrine**  
  Multiple contributors may own sections, but the PM is the consolidating authority for the overall Forecast Summary period/version and advances it toward internal readiness and submission.

- **Recommend-and-consolidate doctrine**  
  The tool continuously recommends the next best action, tells contributors what their sections need, tells the PM what still prevents consolidation, and actively guides drill-through into source workflows when needed.

## 3. Tool Posture

Forecast Summary is:

- an **always-on operational Financial tool**
- a **forecasting command-center surface**
- a **period- and version-aware working experience**
- a **hybrid surface** made of:
  - a read-only derived operating snapshot
  - a period-specific authored management narrative
  - version / review / readiness posture
- a **guided consolidation surface** for PM-led forecast readiness

Forecast Summary is **not**:

- a flat worksheet
- a passive report header with text boxes
- a hidden write-back layer for source-owned values
- a viewer-first executive dashboard

## 4. Primary Actors and Authority Model

### Primary actors
- Project Manager (PM)
- Section contributors / Financial editors
- Reviewers / approvers
- View-only users with limited narrative or transparency access depending on permissions

### Consolidation authority
- Multiple contributors may actively own different narrative sections.
- The **PM is the consolidating authority** for the overall Forecast Summary period/version.
- The PM is responsible for advancing the overall Forecast Summary/version toward internal readiness and submission.

### Ownership model
- Ownership must be visible **by section**.
- The runtime must make it obvious who owns which narrative section right now.
- Section-level collaboration is allowed, but accountability cannot be ambiguous.

## 5. Canonical Runtime Layers

Forecast Summary is divided into three runtime layers:

### A. Derived Snapshot Zone
A period-aware, read-only operating picture composed of authoritative values from other tools and database records.

### B. Period Narrative Zone
User-authored reporting-period content, including Profit Forecast Summary and Problems/Exposures categories.

### C. Version / Review / Readiness Zone
The layer that evaluates whether the current period/version is complete, reviewable, and ready to advance.

## 6. Derived Snapshot Zone — Definition

The **read-only derived snapshot** is the authoritative, period-scoped, non-editable Forecast Summary dataset composed of project, schedule, financial, contingency, and general conditions values sourced or calculated from other governed tools and records.

It is displayed in Forecast Summary for:
- interpretation
- commentary
- comparison
- guided action
- drill-through into source workflows

It is **not** displayed for direct mutation.

### Derived snapshot behavior
The snapshot must be:

- **period-aware**  
  tied to the selected reporting period / forecast version

- **source-aware**  
  each value should know where it came from

- **change-aware**  
  the UI should surface what changed since prior period/version

- **navigation-aware**  
  users should be able to jump to the owning source tool/workflow where appropriate

- **not silently stale**  
  if a source value is outdated, delayed, or awaiting refresh, that posture should be visible

## 7. Locked Read-Only Derived Fields

All of the following values are locked as **read-only, system-derived, non-editable in Forecast Summary**.

### Project Identity / Header
- Project Name
- Project No.
- PM
- Super
- Contract Type
- Project Type
- Builders Risk Date
- NOC Exp. Date
- Damage Clause / LDs

### Schedule
- Original Contract Completion
- Current Schedule Data Date
- Approved Days
- Current Completion Date
- Revised Contract Completion
- Current Damage Costs

### Financial Status
- Original Contract Value
- Current Approved Value
- Original Cost
- Current Cost to Complete
- Original Profit
- Current Profit
- Original Buyout Savings
- Last Month Profit
- Buyout Savings
- Buyout Savings Split
- Contingency Savings
- Potential Total Profit
- Previous Month Potential Profit

### Contingencies
- Original Contingency
- Current Contingency
- Expected Contingency at Completion
- Expected Contingency Use

### General Conditions Period Ending
- Original Estimate
- Estimate at Completion
- Variance from Original

## 8. Period Narrative Zone — Locked User Inputs

The following are locked as **user-entered, reporting-period-specific narrative inputs**:

### Profit Forecast Summary
- Profit Forecast Summary

### Problems / Exposures
- Schedule
- Budget
- Payment
- Safety
- RFI Log
- Submittal Log
- Buyout Log
- Risk Mgmt
- Change Orders
- Permits
- Critical Issues

These sections are authored uniquely per reporting period/version.

## 9. Editing Posture

### Derived snapshot editing posture
- Derived values are **read-only**
- Users may not type over them
- Users may not manually override them from within Forecast Summary
- Source-of-truth corrections must route to the owning source tool

### Allowed interaction with derived values
Users may:
- view the value
- compare it to prior period/version
- see what changed
- attach inline commentary, flags, or challenge notes
- drill through to the owning source workflow

### Narrative editing posture
- Narrative sections are editable according to role and section ownership
- Different users may own different narrative sections simultaneously
- Ownership must be visible by section
- Collision prevention and handoff rules must exist at the section level

## 10. Session Orchestration Model

Forecast Summary must behave as a **live forecasting hub** with continuous visibility into:

- current version posture
- unresolved forecast drivers
- checklist gaps
- review status
- assumption changes
- downstream impacts
- best next action to move the version forward

The tool must not behave like a flat form. Derived snapshot, authored narrative, and version posture must stay actively connected.

## 11. Readiness Model

Readiness is governed by the **Integrated Readiness Doctrine**.

A Forecast Summary period/version is **not** ready merely because all narrative fields are populated.

Readiness must evaluate the combined posture of:

- narrative completeness
- derived snapshot signals
- unresolved forecast drivers
- checklist status
- version posture
- flagged downstream concerns

The runtime must make clear:
- what is still preventing readiness
- who owns the next action
- what the fastest safe path to readiness is

## 12. Interaction with Source Tools

Forecast Summary must provide **guided drill-through** into the source tools that own derived snapshot values.

### Drill-through requirements
- Derived values, flags, and challenge notes should support intelligent drill-through
- Project context must be preserved
- Version/reporting-period context must be preserved where applicable
- Users should not have to hunt for the owning workflow

Forecast Summary remains a command-center surface and must not become a hidden correction layer.

## 13. Review and Approval Posture

The PM is the consolidating authority for the overall Forecast Summary period/version.

### Runtime expectations
- Multiple contributors may own different sections
- The PM must be able to see:
  - which sections are complete
  - which sections are still owned by others
  - what unresolved readiness blockers remain
  - what still prevents consolidation and submission

### Contributor expectations
Contributors must be able to see:
- what their section needs
- what is blocking their section from completion
- how their section affects overall readiness
- when drill-through to a source workflow is required

## 14. Mold-Breaker UX Requirements

Forecast Summary must embody the application’s mold-breaker philosophy. It should:

- behave as an active forecasting operating surface, not a dressed-up worksheet
- continuously recommend the next best action
- highlight variance drivers and unresolved assumptions
- show which derived values matter most right now
- let users surface and annotate issues at the point of concern
- shorten navigation distance into source workflows
- make ownership and consolidation posture unmistakable
- tie narrative completeness to true version readiness rather than cosmetic completion
- help the PM consolidate without hunting through disconnected tools and notes

## 15. Acceptance Criteria

Forecast Summary is not implementation-complete unless the developer delivers all of the following:

- command-center runtime behavior rather than worksheet behavior
- clearly separated runtime layers:
  - Derived Snapshot Zone
  - Period Narrative Zone
  - Version / Review / Readiness Zone
- all locked derived fields rendered as read-only system-derived values
- all locked narrative fields rendered as period-specific authored inputs
- visible section ownership for narrative inputs
- section-level collaboration with collision prevention/handoff behavior
- annotated split behavior for derived values
- no hidden override path for source-owned values
- guided drill-through into source workflows with preserved project/version context
- integrated readiness evaluation combining narrative, derived signals, checklist state, version posture, and downstream concerns
- PM consolidation visibility and control
- contributor-specific next-action guidance
- recommend-and-consolidate mold-breaker runtime behavior

## 16. Developer Note

The developer should not implement Forecast Summary as a report with editable text blocks. This is a runtime governance doctrine for a forecasting command-center surface. The tool must actively connect authoritative operating data, authored management narrative, version readiness, and PM-led consolidation into one guided working experience.
