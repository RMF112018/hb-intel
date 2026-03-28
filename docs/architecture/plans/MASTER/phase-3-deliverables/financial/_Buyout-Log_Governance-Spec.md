# Buyout Log Governance Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The Buyout Log tool is a governed, worksheet-shaped operating surface inside the Financial module. It must mirror the current Buyout Log template in a refined, modernized, and enhanced manner without losing the familiar operational structure. Its purpose is to drive the project toward full buyout readiness by making ownership, posture, qualification/bond status, lead-time exposure, schedule risk, and next-best-action unmistakable at runtime.

## 2. Runtime Doctrine Summary

The Buyout Log tool is governed by the following runtime doctrines:

- **Guided buyout command-center doctrine**  
  Buyout Log behaves as an intelligent operating surface that actively highlights percent bought out, outstanding scopes, lead-time exposure, SDI / Bond Status, subcontractor gaps, schedule risk, and the next best action needed to move the project toward full buyout readiness.

- **Buyout readiness command-center doctrine**  
  The tool behaves as a live operational hub. It continuously surfaces what remains to be bought out, what is blocked, what is late, what is waiting on someone else, what poses lead-time risk, what poses SDI / Bond Status risk, and the best next action to move the project toward 100% buyout.

- **Single-owner doctrine**  
  Each buyout line item has one clearly accountable current owner at a time. Other users may comment, review, or support, but ownership cannot be ambiguous.

- **Operational posture doctrine**  
  Each line item uses a governed runtime status model that distinguishes lifecycle posture, owner posture, and risk posture.

- **Gated readiness doctrine for SDI / Bond Status**  
  SDI / Bond Status must directly affect buyout readiness. Certain statuses block or constrain progression into award / buyout-complete states until resolved.

- **Guided lead-time risk doctrine**  
  The tool actively evaluates lead-time exposure against schedule needs, highlights items at risk of affecting procurement or installation timing, explains why the risk matters, and guides the user to the exact line item needing action.

- **Guided schedule-coupling doctrine**  
  The tool actively evaluates buyout posture against the buyout schedule / project schedule, surfaces items whose procurement timing threatens downstream work, shows expected path-to-100%-bought status, and guides the user to the exact item driving schedule risk.

- **Recommend-and-steer doctrine**  
  The tool continuously recommends the next best action, highlights the highest-risk and most schedule-critical buyout items, explains why they matter, flags blocked-vs-ready posture clearly, and guides the user into the fastest safe path toward full buyout readiness.

## 3. Tool Posture

Buyout Log is:

- an **always-on operational Financial tool**
- a **worksheet-shaped buyout command center**
- a **buyout readiness control surface**
- a **schedule-aware procurement posture tool**
- a **qualification / bond / lead-time risk surface**
- a **path-to-100%-bought operating workspace**

Buyout Log is **not**:

- a passive procurement ledger
- a static reporting worksheet
- a status-only table
- a review-only artifact

## 4. Structural Baseline

The attached Buyout Log template and Buyout Schedule template are the governing structural references for the runtime design.

### 4.1 Worksheet-shaped operating surface
The tool should preserve a familiar worksheet/log form while being refined, modernized, and operationally enhanced.

### 4.2 Baseline field model
The current template establishes a strong baseline field model around:

- division / description
- subcontractor / vendor
- contract amount
- original budget
- over / under
- LOI timing
- submittal timing
- lead times
- ball in court
- SDI / Bond Status
- bond requirement
- comments

### 4.3 Operational rollups
The runtime must surface at least:
- **subcontracts & material bought out totals**
- **overall buyout percent complete**
- **path to 100% bought**
- **risk / blocked posture affecting buyout completion**

## 5. SDI / Bond Status — Locked Governing Field

Replace any prior **SDI Enrollment** concept with the governed field:

## SDI / Bond Status

Allowed status values are:

- **Not Started**
- **Compass - In Progress**
- **Compass - Qualified**
- **Compass - Not Qualified**
- **SDI Enrolled**
- **Bond Required**
- **Bond Received**

### Governance implication
SDI / Bond Status is a **governed status field**, not freeform text.

The tool must treat it as a real readiness control capable of surfacing:
- subcontractor risk posture
- unresolved qualification status
- bond requirement gaps
- readiness-to-award implications

## 6. Ownership and Accountability Model

### Single-owner doctrine
Each buyout line item has one clearly accountable current owner at a time.

Other users may:
- comment
- review
- support
- assist with follow-up

But ownership cannot be ambiguous.

### Ball in Court
**Ball in Court** must be implemented as a **governed owner-state control**, not merely a note field. The runtime must always make it obvious who owns the next move for each line item.

## 7. Line-Item Status Model

Each buyout line item uses a governed operational posture model. Supported states should include at least:

- **Not Started**
- **Scoping**
- **Pricing / Bidding**
- **Leveling / Review**
- **Award Pending**
- **Buyout Complete**
- **Submittal Pending**
- **Long-Lead Risk**
- **Blocked / Exception**
- **Closed**

### Runtime expectation
The status model must distinguish:
- lifecycle posture
- owner posture
- risk posture

**Ball in Court** complements the lifecycle status but does not replace it.

## 8. SDI / Bond Status Gating Rules

### Gated readiness doctrine
SDI / Bond Status must directly affect buyout readiness.

Certain statuses must block or constrain progression into later buyout states such as:
- **Award Pending**
- **Buyout Complete**

### Runtime behavior
The tool must make clear:
- what status is blocking progression
- why it is blocking progression
- what the required next action is to clear the gate

### Practical posture examples
Statuses such as:
- **Compass - In Progress**
- **Compass - Not Qualified**
- **Bond Required**

may create different readiness constraints than:
- **Compass - Qualified**
- **SDI Enrolled**
- **Bond Received**

## 9. Lead-Time Risk Model

### Guided lead-time risk doctrine
The tool must actively evaluate lead-time exposure against schedule needs.

It must:
- highlight items at risk of affecting procurement or installation timing
- explain why the risk matters
- guide the user directly to the exact line item needing action

Lead-time risk is an operational posture, not just a reporting field.

### Blocking nuance
Lead-time risk does not automatically block every item by itself unless the line is driven into:
- **Long-Lead Risk**
- **Blocked / Exception**
or another governed blocked posture

## 10. Schedule Interaction Model

### Guided schedule-coupling doctrine
The tool must actively evaluate buyout posture against the buyout schedule / project schedule.

It must:
- surface items whose procurement timing threatens downstream work
- show the expected **path to 100% bought**
- identify which specific items are driving schedule risk
- guide the user directly to the exact line item needing action

The buyout schedule is a real operational input, not just a passive reference.

## 11. Session Orchestration Model

Buyout Log must behave as a **live operational hub** that continuously surfaces:

- what remains to be bought out
- what is blocked
- what is late
- what is waiting on someone else
- what poses lead-time risk
- what poses SDI / Bond Status risk
- which items are most schedule-critical
- what the next best action is to move the project toward 100% buyout

The worksheet/log structure may remain familiar, but the runtime must behave like a buyout completion engine.

## 12. Runtime Guidance Model

### Recommend-and-steer doctrine
The tool must continuously recommend the next best action and guide the user into the fastest safe path toward full buyout readiness.

That includes:
- highlighting the highest-risk items
- highlighting the most schedule-critical items
- explaining why each highlighted item matters
- flagging blocked-vs-ready posture clearly
- making ownership and gating posture visible without hunting

## 13. Mold-Breaker UX Requirements

Buyout Log must embody the application’s mold-breaker philosophy while respecting the worksheet/log structure. It should:

- preserve a familiar buyout log shape while making it operationally intelligent
- continuously recommend the next best action
- make **Ball in Court** a real owner-state control
- make SDI / Bond Status a real gating control
- highlight lead-time exposure and schedule-critical timing
- show path-to-100%-bought posture clearly
- explain why specific items matter right now
- shorten navigation distance to the exact item needing action
- distinguish lifecycle posture, owner posture, and risk posture clearly
- support completion and exposure management rather than passive logging

## 14. Acceptance Criteria

Buyout Log is not implementation-complete unless the developer delivers all of the following:

- worksheet-shaped operating surface aligned to the current Buyout Log template
- use of the Buyout Schedule as a real operational input
- visible subcontracts / materials bought out totals
- visible overall buyout percent complete
- visible path-to-100%-bought posture
- **SDI / Bond Status** replacing SDI Enrollment
- governed SDI / Bond Status options exactly as locked
- single-owner control per line item
- **Ball in Court** implemented as a governed owner-state control
- governed operational line-item status model
- SDI / Bond Status directly affecting readiness progression
- guided lead-time risk behavior
- guided schedule-coupling behavior
- recommend-and-steer mold-breaker guidance behavior

## 15. Developer Note

The developer should not implement Buyout Log as a spreadsheet reskin or a passive procurement register. This is a runtime governance doctrine for a worksheet-shaped but intelligent buyout operating surface. The mold-breaker opportunity is in ownership clarity, status posture, SDI / Bond gating, lead-time awareness, schedule coupling, and guided movement toward full buyout readiness.
