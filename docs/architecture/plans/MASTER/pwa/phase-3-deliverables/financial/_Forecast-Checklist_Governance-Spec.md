# Forecast Checklist Governance Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The Forecast Checklist tool is a governed readiness engine inside the Financial module. It is not a passive signoff sheet, not a static status register, and not merely a review-stage form. Its purpose is to continuously evaluate forecast readiness, aggregate required evidence from across the application, identify missing or conflicting items, assign and surface ownership, block formal submittal until governance requirements are met, and guide users directly into the correct next action.

## 2. Runtime Doctrine Summary

The Forecast Checklist tool is governed by the following runtime doctrines:

- **Guided readiness doctrine**  
  Forecast Checklist behaves as an intelligent readiness engine. It actively evaluates forecast completeness, identifies missing evidence, points users to exact blocked sections/tools, assigns ownership, and drives the version toward internal readiness.

- **Readiness command-center doctrine**  
  The tool behaves as a live readiness hub. It continuously surfaces blocked items, stale evidence, missing ownership, unresolved upstream dependencies, downstream impacts, and the best next action to move the forecast version toward readiness.

- **PM-owned completion / acknowledgment doctrine**  
  The Project Manager must acknowledge each checklist item by annotation or attached document, and formal submittal is blocked until the PM completes the full checklist.

- **Evidence-and-acknowledgment doctrine**  
  Each item has explicit runtime states that distinguish evidence presence from PM acknowledgment.

- **Bulk-with-review doctrine**  
  The PM may acknowledge multiple ready items in bulk, but only after review. Acknowledgment is intentional, never automatic.

- **Guided exception doctrine**  
  Exceptions must be classified and operationalized. The tool must identify missing/conflicting evidence, current owner, reason not ready, and the correct next action.

- **Controlled exception doctrine**  
  Checklist items may be waived only through a governed exception path with required reason, named approver authority, and full audit history.

- **Recommend-and-route doctrine**  
  The tool continuously recommends the next best readiness action, highlights the shortest safe path to submittal readiness, tells each user what they own, tells the PM what still blocks formal submittal, and routes users directly into the correct source tool / annotation / upload / exception workflow.

## 3. Tool Posture

Forecast Checklist is:

- an **always-on operational readiness tool**
- a **forecast submittal gating surface**
- a **cross-tool evidence aggregator**
- a **PM acknowledgment control layer**
- a **governed exception and waiver surface**
- a **command-center for readiness work**

Forecast Checklist is **not**:

- a passive checklist
- a simple signoff page
- a manually maintained status spreadsheet
- a discretionary PM-only formality

## 4. Structural Governance Model

### 4.1 Global baseline governance
The following default H2 categories and LIST items are the governed global baseline.

Only the **Manager of Operational Excellence (MOE)** may modify these checklist items at a **global** level.

### 4.2 Project-level structural extension
At the **project** level, the **Project Executive (PE)** may:
- add additional checklist items within an existing category
- add additional categories if necessary

Any **project-created** category or item is editable/modifiable **only by the Project Executive**.

### 4.3 Item annotation rights
Each checklist item must support **multiple annotations**.

Annotations may be created by both:
- **Project Executive**
- **Project Manager**

Multiple annotations by each are allowed per checklist item.

## 5. Primary Actors and Authority Model

### Primary actors
- Project Manager (PM)
- Project Executive (PE)
- Manager of Operational Excellence (MOE)
- Contributors / source-tool owners as applicable
- Approver authority for governed waivers/exceptions

### Authority rules
- **MOE** governs the global baseline taxonomy.
- **PE** governs project-specific structural additions.
- **PM** governs runtime acknowledgment/completion of checklist items for formal forecast submittal.
- **PE** and **PM** may annotate checklist items.
- Waiver authority is governed and must not default to PM discretion alone.

## 6. Core Runtime Rule

The **Project Manager must acknowledge each checklist item with either annotation or attached document where required by the item’s fulfillment posture, and formal submittal of the forecast for each period is blocked until the PM completes the full checklist.**

This applies even when underlying evidence is already satisfied by source-tool data or app-completed workflow state. Evidence satisfaction and PM acknowledgment are distinct.

## 7. Canonical Runtime States

Each checklist item must use explicit item-level runtime states. The governing model is:

- **Missing**
- **Source/Data Satisfied**
- **Annotation/Attachment Provided**
- **Ready for PM Acknowledgment**
- **PM Acknowledged**
- **Blocked / Exception**
- **Waived** (only through controlled exception governance)

The exact path to those states depends on the item’s fulfillment mode.

## 8. PM Acknowledgment Behavior

### Bulk-with-review doctrine
- The PM must review ready items before acknowledgment.
- The PM may acknowledge multiple ready items in bulk.
- System/data-satisfied items are **not** auto-acknowledged.
- Bulk acknowledgment must preserve:
  - who acknowledged
  - when
  - which items were included
  - any note or reason entered at the time

### Formal submittal gate
Forecast submittal for the period/version is blocked until:
- all required items are satisfied or waived through governed exception
- PM acknowledgment is complete across the required checklist set

## 9. Exception and Waiver Model

### Guided exception doctrine
When an item is not satisfied, stale, conflicting, or challenged, the tool must:
- classify the issue type
- identify missing or conflicting evidence
- identify the current owner
- explain why the item is not ready
- guide the user to the correct next action:
  - source tool
  - annotation path
  - upload path
  - PM review step
  - waiver/exception path if permitted

### Controlled exception doctrine
Checklist items may be waived only through a governed exception path requiring:
- stated reason
- named approver authority
- full audit history

Waiver must never be a casual PM override.

## 10. Default Governed Categories and Items

## Required Documents (printed)
- **Procore Budget – Updated and reconciled**  
  Fulfillment mode: **Complete in App - Budget Import**

- **Forecast Summary Sheet – Reflecting current and projected financials**  
  Fulfillment mode: **Complete in App - Forecast Summary**

- **GC/GR Log – Aligned with current schedule. Matches Summary sheet and Procore.**  
  Fulfillment mode: **Complete in App - GC GR Forecast**

- **Cash Flow Schedule – Accurate through current PA #**  
  Fulfillment mode: **Complete in App - Cash Flow Forecast**

- **SDI Tracking Log (also included in buyout log)**  
  Fulfillment mode: **Complete in App - Buyout Log**

- **Buyout Log – With % bought out and lead time issues noted**  
  Fulfillment mode: **Complete in App - Buyout Log**

## Profit Forecast Summary
- **Explain any changes in current profit and any negative values in the Procore budget.**  
  Fulfillment mode: **Complete in App - Forecast Summary**

- **Explain any changes in potential profit, including GC savings and buyout savings from the previous month.**  
  Fulfillment mode: **Complete in App - Forecast Summary**

- **Identify any projected items/events that may affect profit (e.g., staffing changes, scope changes).**  
  Fulfillment mode: **Complete in App - Forecast Summary**

## Schedule
- **Brief summary of schedule status**  
  Fulfillment mode: **Complete in App - Forecast Summary**

- **Note anything brewing or actively affecting the schedule**  
  Fulfillment mode: **Complete in App - Forecast Summary**

- **Confirm GC/GRs match current schedule**  
  Fulfillment mode: **Annotation**

- **List any delay notices issued or pending (include count)**  
  Fulfillment mode: **Complete in App - Constraints Module**

- **Indicate if additional time is being requested via change order and why**  
  Fulfillment mode: **Annotation**

## Budget
- **Identify any budget-related problems or exposures**  
  Fulfillment mode: **Complete in App - Constraints Module**

- **Review Job Cost History Report**  
  Fulfillment mode: **Attachment via Upload**

## Payment
- **Confirm payments received through [PA # / date]**  
  Fulfillment mode: **Annotation**

- **Are payments on time?**  
  Fulfillment mode: **Annotation**

- **Note any payment-related problems or exposures**  
  Fulfillment mode: **Annotation**

## Safety
- **Count of open safety observations in Procore**  
  Fulfillment mode: **Data from App - Safety Module**

- **Note any safety-related problems or exposures**  
  Fulfillment mode: **Annotation**

## RFI Log
- **List open RFIs that could affect budget and/or schedule**  
  Fulfillment mode: **Annotation**

## Submittal Log
- **List open submittals that could affect budget and/or schedule**  
  Fulfillment mode: **Annotation**

## Buyout Log
- **Confirm current % bought out.**  
  Fulfillment mode: **Complete in App - Buyout Log**

- **Date expected to be 100% bought.**  
  Fulfillment mode: **Complete in App - Buyout Schedule (annotation override)**

- **Note any issues with lead times.**  
  Fulfillment mode: **Annotation**  
  _Note: carried as the default assumption pending explicit override._

## Risk Management
- **Confirm subcontractor compliance is up to date**  
  Fulfillment mode: **Complete in App - Risk Management Module**

- **List non-compliant subcontractors**  
  Fulfillment mode: **Complete in App - Risk Management Module**

- **Confirm % of SDI enrolled subcontractors**  
  Fulfillment mode: **Complete in App - Risk Management Module**

- **Note any risk-related problems or exposures**  
  Fulfillment mode: **Annotation**

## Change Orders
- **List pending change orders, including time extensions and amounts**  
  Fulfillment mode: **Complete in App - Constraints Module**

- **Confirm PCCO approvals**  
  Fulfillment mode: **Complete in App - Constraints Module**

## Permits
- **Provide status of permits and inspections with issue and/or delay.**  
  Fulfillment mode: **Complete in App - Permits Module**

## Rolling Punch List
- **Provide status of Procore Observations (rolling punch)**  
  Fulfillment mode: **Complete in App - Quality Control Module**

## Project Checklists
- **Provide status of Job Start Up Checklist**  
  Fulfillment mode: **Complete in App - Startup Module**

- **Provide status of Pre-Certificate of Occupancy Checklist**  
  Fulfillment mode: **Complete in App - Closeout Module**

- **Provide status of Project Close-out Checklist**  
  Fulfillment mode: **Complete in App - Closeout Module**

## Critical Issues
- **Identify any current critical issues affecting the project**  
  Fulfillment mode: **Complete in App - Constraints Module**

## 11. Fulfillment Mode Semantics

Each item must be governed by one of the following fulfillment modes:

- **Complete in App**  
  The required evidence is satisfied by governed runtime state in a named source tool/workflow.

- **Data from App**  
  The item is satisfied by sourced application data rather than manual authored completion.

- **Annotation**  
  The item requires authored annotation content.

- **Attachment via Upload**  
  The item requires uploaded supporting documentation.

- **Complete in App with annotation override**  
  The source tool provides the default satisfaction state, but an annotation path exists for governed override/explanation.

The tool must make the fulfillment mode visible and actionable.

## 12. Session Orchestration Model

Forecast Checklist must behave as a **live readiness hub**. It must continuously surface:

- blocked items
- stale evidence
- missing ownership
- unresolved upstream dependencies
- downstream impacts
- best next action to move the forecast version toward readiness

The tool must not behave like a passive status register.

## 13. Ownership Model

### Structural ownership
- Global baseline taxonomy: **MOE**
- Project structural additions: **PE**

### Runtime completion ownership
- PM owns runtime acknowledgment/completion control for formal submittal readiness.

### Item accountability
Each checklist item must still surface:
- current evidence source
- current runtime owner / action owner where relevant
- whether PM action is still required

## 14. PM Acknowledgment vs Evidence Satisfaction

The tool must clearly distinguish between:

### Evidence satisfied
The required source data, annotation, upload, or app-completed state exists.

### PM acknowledged
The PM has reviewed and acknowledged the item for submittal readiness.

An item may be evidence-satisfied but still not submittal-ready until PM acknowledgment occurs.

## 15. Guided Exception Handling

When an item is not satisfied, stale, conflicting, challenged, or otherwise not ready, the tool must:

- classify the issue
- explain why the item is not ready
- identify the missing or conflicting evidence
- identify the responsible next actor
- recommend the next best action
- route directly into the correct workflow:
  - source module
  - annotation workflow
  - attachment/upload path
  - PM acknowledgment path
  - controlled exception path

Exceptions must be actionable, not merely visible.

## 16. Mold-Breaker UX Requirements

Forecast Checklist must embody the application’s mold-breaker philosophy. It should:

- act as a readiness operating system, not a static checklist
- continuously recommend the next best readiness action
- surface the shortest safe path to formal submittal
- show each user exactly what they own
- show the PM exactly what still blocks submittal
- distinguish evidence present from PM acknowledgment complete
- make stale/conflicting items obvious immediately
- reduce navigation distance into source tools, annotation paths, upload flows, and exception workflows
- preserve strong governance without feeling bureaucratic

## 17. Acceptance Criteria

Forecast Checklist is not implementation-complete unless the developer delivers all of the following:

- governed default category and item baseline
- MOE-only global structural modification rights
- PE-only project-level structural addition/modification rights for project-created items/categories
- multiple annotations per item for both PE and PM
- PM acknowledgment gate that blocks formal forecast submittal until completion
- item-level runtime states separating evidence from acknowledgment
- visibility of fulfillment mode per item
- support for all locked fulfillment modes
- bulk-with-review PM acknowledgment behavior
- guided exception handling with direct routing to the correct next workflow
- controlled exception/waiver path with named approver authority and full audit history
- readiness command-center behavior rather than passive checklist behavior
- recommend-and-route mold-breaker guidance behavior

## 18. Developer Note

The developer should not implement Forecast Checklist as a simple completion matrix. This is a runtime governance doctrine for a live readiness control system. The tool must aggregate evidence across modules, expose item posture precisely, require PM acknowledgment as a formal gate, handle governed exceptions, and actively route users into the correct next action until the forecast package is truly ready for submittal.
