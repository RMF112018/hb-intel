# Cash Flow Forecast Governance Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The Cash Flow Forecast tool is a governed, worksheet-shaped liquidity operating surface inside the Financial module. It must mirror the current cash flow worksheet in a refined, modernized, and enhanced manner without breaking its core structural principles. Its purpose is to project monthly cash movement, preserve continuity with schedule-driven period logic, enforce lifecycle rules around closed-month actualization and protected historical cash periods, and actively guide the user through drift, timing, collection exposure, and readiness issues.

## 2. Runtime Doctrine Summary

The Cash Flow Forecast tool is governed by the following runtime doctrines:

- **Guided liquidity command-center doctrine**  
  Cash Flow Forecast behaves as an intelligent operating surface that actively highlights billing timing, payment timing, collection exposure, schedule-linked cash shifts, forecast drift, and the next best action needed to keep the cash projection realistic and decision-useful.

- **Liquidity command-center doctrine**  
  The tool behaves as a live operational hub. It continuously surfaces billing timing issues, receipt timing drift, pay-app alignment gaps, schedule-driven month shifts, prior-period changes, collection exposure, and the best next action to move the cash forecast toward a clean, reviewable state.

- **Closed-month actualization doctrine**  
  All months prior to the current reporting month are treated as locked actuals based on closed Pay Application / cash data, while the current reporting month and future months remain forward-looking forecast months.

- **Rolling single-month refresh doctrine**  
  Only the most recent closed month may auto-refresh from the latest Pay Application data. Older closed months remain frozen unless reopened through a governed override.

- **PM request, Project Executive review & approve doctrine**  
  Any override of a frozen historical cash month requires a PM-initiated request and Project Executive approval, with full audit history.

- **Guided liquidity variance doctrine**  
  The tool must actively identify unusual month-to-month cash drift, receipt timing slippage, billing-vs-collection mismatch, schedule-driven cash shifts, and concentration risk, explain why each matters, and guide the user to the exact row/month needing attention.

- **Auto-preserve doctrine**  
  When the schedule-driven month range changes, the tool automatically preserves and repositions existing values where possible, while warning on ambiguous cases and making all preservation/shift behavior transparent.

- **Recommend-and-steer doctrine**  
  The tool continuously recommends the next best action, highlights the highest-risk row/month combinations, explains billing and collection timing impacts, flags locked-vs-editable posture clearly, and guides the user into the fastest safe path to a clean, reviewable cash forecast.

## 3. Tool Posture

Cash Flow Forecast is:

- an **always-on operational Financial tool**
- a **worksheet-shaped liquidity command center**
- a **period-aware cash projection surface**
- a **Pay Application-derived forecasting surface**
- a **guided variance and exposure control tool**
- a **reviewable monthly cash posture workspace**

Cash Flow Forecast is **not**:

- a passive draw schedule viewer
- a spreadsheet clone with no runtime intelligence
- a review-only output page
- a freeform manual ledger disconnected from Pay Application history

## 4. Hard Structural Baseline

The Cash Flow Forecast tool must follow the **same structural principles as GC-GR Forecast**, with the following locked distinction:

- there is **only one row per item**
- there is **no paired Original Forecast / Actual-Remaining row structure**
- row items are derived from the **Pay Application upload**, not from the Budget tool

This means Cash Flow Forecast must preserve the worksheet-shaped operating model while enhancing the runtime through guidance, validation, timing logic, drift visibility, collection-risk surfacing, and workflow support.

## 5. Row Source and Item Model

### 5.1 Source of row items
The row set must derive from the **Pay Application upload**.

### 5.2 One row per item
For each applicable item:
- there is one row
- the row persists across monthly period columns
- cash posture evolves over time within that single row structure

### 5.3 Runtime implication
Because the tool uses one row per item, the mold-breaker opportunity is not in restructuring the worksheet, but in:
- billing/collection guidance
- timing drift visibility
- schedule-linked month management
- cash-risk surfacing
- readiness and review support
- intelligent routing and explanation

## 6. Month Column and Period Logic

Cash Flow Forecast follows the same overall structural philosophy as GC-GR Forecast for month-column generation:

- fixed worksheet-shaped working surface
- schedule/date-driven period columns
- runtime enhancement through guidance, validation, variance signaling, and workflow support rather than radical structural redesign

Where schedule-driven month ranges or user-entered offsets change the applicable monthly spread:

- the tool should automatically preserve and reposition existing values where possible
- the runtime must warn on ambiguous cases
- users must be shown exactly what was:
  - preserved
  - shifted
  - added
  - unmapped / ambiguous

Continuity should be preserved by default, but never silently.

## 7. Closed Months vs Current Reporting Month

### 7.1 Closed-month actualization rule
All months **prior** to the current reporting month are treated as **locked actuals** based on closed Pay Application / cash data.

### 7.2 Current reporting month rule
The **current reporting month** remains a **forward-looking forecast month**.

### 7.3 Future months
Future months remain forecast months.

### 7.4 Practical implication
The tool must operate on a closed-period discipline:

- closed prior months = actualized and protected
- current reporting month = forecast
- future months = forecast

The tool must not mix actual and forecast posture inside the current reporting month.

## 8. Historical Cash Refresh Model

### 8.1 Rolling single-month refresh
When a new Pay Application upload changes historical cash data:

- only the **most recent closed month** may auto-refresh from the newest Pay Application data
- older closed months remain frozen

### 8.2 Frozen older months
Any change to older closed months requires a governed override path.

### 8.3 Why this matters
This creates a clean rolling model:
- current reporting month and future months = forecast
- most recent closed month = eligible for automatic actual refresh
- older historical months = locked history

## 9. Frozen Historical Override Model

Any change to a frozen historical cash month requires a governed exception path.

### Required authority chain
- The **Project Manager** must initiate the override request
- The **Project Executive** must review and approve it

### Required request data
The override request must capture:
- affected month(s)
- affected row item(s)
- reason for override
- before/after value visibility
- full audit history

Frozen historical cash months must never be editable directly without this governed override process.

## 10. Session Orchestration Model

Cash Flow Forecast must behave as a **live operational liquidity hub** that continuously surfaces:

- billing timing issues
- receipt timing drift
- pay-app alignment gaps
- schedule-driven month shifts
- prior-period changes
- collection exposure
- highest-risk row/month combinations
- the best next action needed to keep the cash forecast realistic and reviewable

The fixed worksheet structure is required, but the runtime must behave like an intelligent liquidity control surface rather than a static grid.

## 11. Variance and Exposure Guidance

### Guided liquidity variance doctrine
The tool must actively identify and explain:

- unusual month-to-month cash drift
- receipt timing slippage
- billing-vs-collection mismatch
- schedule-driven cash shifts
- concentration risk

### Runtime behavior
The tool must:
- explain **why** the exposure matters
- guide the user to the exact **row and month** needing attention
- distinguish between:
  - informational variance
  - review-needed variance
  - governed exception conditions

## 12. Locked vs Editable Posture

The runtime must make locked-vs-editable posture unmistakable.

### Locked zones include
- closed historical months beyond the most recent closed month
- values governed by closed Pay Application history
- any frozen month pending governed override

### Editable zones include
- current reporting month forecast values
- future-month forecast values
- any governed override surface specifically opened for frozen historical months after approval

The tool must make it obvious to the user which cells are:
- locked historical actuals
- auto-refreshable most recent closed month values
- editable forecast values

## 13. Mold-Breaker UX Requirements

Cash Flow Forecast must embody the application’s mold-breaker philosophy while respecting the fixed worksheet format. It should:

- preserve the worksheet structure but make it operationally intelligent
- continuously recommend the next best action
- highlight the highest-risk row/month combinations
- explain billing and collection timing impacts
- explain why cash drift or exposure matters
- clearly show locked vs editable posture
- preserve continuity when month ranges change
- surface historical cash protection behavior clearly
- shorten navigation distance to the exact place the user needs to act
- make reviewability and readiness obvious without forcing the user to interpret the entire sheet manually

## 14. Acceptance Criteria

Cash Flow Forecast is not implementation-complete unless the developer delivers all of the following:

- worksheet-shaped operating surface aligned to the current cash flow worksheet baseline
- one row per item
- row items derived from the Pay Application upload
- same overall structural philosophy as GC-GR, adapted to the single-row-per-item model
- closed-month actualization behavior
- current reporting month treated as forward-looking forecast
- rolling single-month refresh from Pay Application data
- frozen historical months beyond the most recent closed month
- PM request + Project Executive approval for historical override
- transparent preservation/repositioning when month ranges change
- guided liquidity variance and exposure detection/explanation
- clear locked-vs-editable posture
- recommend-and-steer mold-breaker guidance behavior

## 15. Developer Note

The developer should not treat Cash Flow Forecast as a worksheet reskin. This is a runtime governance doctrine for a fixed-format but intelligent liquidity operating surface. The worksheet shape is constrained; the mold-breaker opportunity is in guidance, validation, preservation logic, historical protection, schedule coupling, exposure visibility, and operational steering.
