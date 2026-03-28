# GC-GR Forecast Governance Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The GC-GR Forecast tool is a governed, worksheet-shaped operating surface inside the Financial module. It must mirror the current `GC-GR Forecast.xlsm` worksheet in a refined, modernized, and enhanced manner without changing the required structural format. Its purpose is to project General Conditions / General Requirements cost distribution by month, preserve continuity with schedule-driven period logic, enforce lifecycle rules around original forecast and rolling actualization, and actively guide the user through drift, mismatch, and readiness issues.

## 2. Runtime Doctrine Summary

The GC-GR Forecast tool is governed by the following runtime doctrines:

- **Guided cost-period command-center doctrine**  
  GC-GR Forecast behaves as an intelligent operating surface, not a worksheet clone. It must actively highlight schedule-driven period impacts, cost drift, unresolved assumptions, comparison to prior forecast, and the next best action needed to keep the projection accurate.

- **Cost-period command-center doctrine**  
  The tool behaves as a live operational hub. It continuously surfaces period variances, schedule alignment issues, unresolved cost drivers, dependency on completion-date assumptions, prior-period changes, and the best next action to move the GC-GR forecast toward a clean, reviewable state.

- **Auto-preserve doctrine**  
  When the schedule-driven month range changes, the tool automatically preserves and repositions existing values where possible, while warning on ambiguous cases and making all preservation/shift behavior transparent.

- **Editor-prepared, PM-locked doctrine**  
  Original Forecast values may be prepared by a Financial editor or contributor during the first reporting period, but the Project Manager must review and execute the final lock.

- **Protected-history doctrine with rolling single-month actualization**  
  Only the most recent closed month may auto-refresh from the newest Budget Import. Older historical actual months remain frozen unless reopened through a governed override path.

- **PM request, Project Executive review & approve doctrine**  
  Any override of a frozen historical actual month requires a PM-initiated request and Project Executive approval, with full audit history.

- **Guided variance doctrine**  
  The tool must actively identify unusual month-to-month drift, budget-vs-total mismatch, schedule-driven spread changes, and Original Forecast vs Actual / Remaining divergence, explain why they matter, and guide the user to the exact row/month needing attention.

- **Recommend-and-steer doctrine**  
  The tool continuously recommends the next best action, highlights the highest-risk row/month combinations, explains schedule-driven impacts, flags locked-vs-editable posture clearly, and guides the user into the fastest safe path to a clean, reviewable GC-GR forecast.

## 3. Hard Non-Negotiable Structural Constraints

The following worksheet structure cannot change.

### 3.1 Column order
The table must retain this overall column order:

1. **Cost Code**
2. **(cost code) Description**
3. **Current Budget**
4. **Forecast Type**
5. **mmm-yy** monthly columns from first reporting month through final reporting month
6. **Total**
7. **Difference**

### 3.2 Final total row
The final row must be a total row for all columns from **Current Budget** through **Difference**.

### 3.3 Cost code source
- **Cost Code** and **Description** must be derived from the **Budget** tool.

### 3.4 Row pairing by cost code
For each cost code there must be two paired rows:
- **Original Forecast**
- **Actual / Remaining Forecast**

### 3.5 Forecast Type values
Forecast Type is static for each row pair:
- `Original Forecast`
- `Actual / Remaining Forecast`

## 4. Month Column Generation Rules

### 4.1 Base schedule-driven month range
The monthly `mmm-yy` columns are based on **Schedule module** data plus user-defined offsets.

If the Schedule module provides:
- Notice of Commencement = `01/01/2026`
- Planned Final Completion or Actual Final Completion = `06/30/2026`

Then the table includes:
- `Jan-26`
- `Feb-26`
- `Mar-26`
- `Apr-26`
- `May-26`
- `Jun-26`

### 4.2 User-defined offsets
The **Forecast Summary** tool must include:
- `GC GR Start Date`
- `Planned Closeout Completion Date`

These are user-entered values in `mm/dd/yyyy`.

If the PM sets:
- GC GR Start Date = `11/15/2025`
- Planned Closeout Completion Date = `07/31/2026`

Then the table includes:
- `Nov-25`
- `Dec-25`
- `Jan-26`
- `Feb-26`
- `Mar-26`
- `Apr-26`
- `May-26`
- `Jun-26`
- `Jul-26`

### 4.3 Month-range change behavior
When schedule data or offsets change:
- the tool should automatically preserve and reposition existing values where possible
- the runtime must show what was:
  - preserved
  - shifted
  - added
  - unmapped / ambiguous
- ambiguous cases must not be silent

## 5. Original Forecast Rules

### 5.1 Lifecycle rule
For each cost code:
- there is one **Original Forecast** row
- values are entered for each month **one time only**
- this occurs during the **first reporting period** of the project lifecycle
- once locked, these values remain fixed for the duration unless a separately governed exception/reset path is defined

### 5.2 Ownership rule
- A Financial editor or contributor may prepare Original Forecast values
- The **Project Manager** must review and execute the final lock

## 6. Actual / Remaining Forecast Rules

### 6.1 Lifecycle rule
For each cost code:
- there is one **Actual / Remaining Forecast** row
- it is paired with the same cost code’s Original Forecast row
- values are updated each reporting period

### 6.2 Current reporting month rule
The **current reporting month** is always forward-looking.

This means:
- reporting periods are based on **closed accounting periods for the month prior**
- months **before** the current reporting month are treated as **actualized** where applicable
- the **current reporting month** is always a **forecast month**
- the current reporting month is **not** split between actual and remaining in GC-GR Forecast

Example:
If the reporting period is `Feb-26`:
- `Jan-26` and earlier = actualized/locked history according to the actualization rules below
- `Feb-26` and later = forecast values

### 6.3 Prior-month actualization from Budget Import
For months prior to the current reporting period, actual cost values are derived from changes in the imported budget.

Example:
- cost code `10-01-835` reflects cost-to-date of `$100` when uploaded for `Jan-26`
- when the user uploads the budget for `Feb-26`, cost-to-date becomes `$250`
- the Actual / Remaining Forecast value for `Jan-26` is therefore `$150`

### 6.4 Future-month remaining forecast
Future months after the most recent closed month are updated manually by the **Project Manager** as forward-looking forecast values.

## 7. Historical Actuals Protection Model

### 7.1 Rolling single-month actualization
Only the **most recent closed month** may be updated automatically by the latest Budget Import.

Example:
If the reporting period is `Feb-26`:
- only `Jan-26 Actual` may auto-refresh from the imported budget
- `Dec-25` and earlier remain frozen

### 7.2 Frozen historical months
Any month earlier than the most recent closed month is frozen historical actuals and may not be changed automatically.

### 7.3 Why this matters
This creates a clean rolling model:
- current reporting month and future months = forecast
- most recent closed month = eligible for automatic actual refresh
- older historical actual months = locked history

## 8. Frozen Historical Override Model

Any change to a frozen historical actual month requires a governed exception path.

### Required authority chain
- The **Project Manager** must initiate the override request
- The **Project Executive** must review and approve it

### Required request data
The override request must capture:
- affected month(s)
- affected cost code row(s)
- reason for override
- before/after value visibility
- full audit history

Frozen historical months must never be editable directly in the grid without this governed override process.

## 9. Derived and Computed Columns

### 9.1 Current Budget
- derived from the Budget tool

### 9.2 Total
- sum of the values across all `mmm-yy` monthly columns for the row

### 9.3 Difference
- `Current Budget - Total`

### 9.4 Final total row
The final row must total all columns from **Current Budget** through **Difference**.

## 10. Session Orchestration Model

GC-GR Forecast must behave as a live operational hub that continuously surfaces:

- period variances
- schedule alignment issues
- unresolved cost drivers
- dependency on completion-date assumptions
- prior-period changes
- highest-risk row/month combinations
- the next best action needed to keep the forecast accurate and reviewable

The fixed worksheet structure is required, but the runtime must behave like an intelligent control surface rather than a static grid.

## 11. Variance and Drift Guidance

### Guided variance doctrine
The tool must actively identify and explain:

- unusual month-to-month drift
- budget-vs-total mismatch
- schedule-driven spread changes
- Original Forecast vs Actual / Remaining divergence

### Runtime behavior
The tool must:
- explain **why** the variance matters
- guide the user to the exact **row and month** needing attention
- distinguish between:
  - informational variance
  - review-needed variance
  - governed exception conditions

## 12. Locked vs Editable Posture

The runtime must make locked-vs-editable posture unmistakable.

### Locked zones include
- Original Forecast after PM lock
- frozen historical actual months
- derived Current Budget values
- computed Total and Difference columns

### Editable zones include
- Original Forecast during first-period preparation prior to PM lock
- current reporting month forecast values
- future-month forecast values
- any governed override surface specifically opened for frozen historical months after approval

## 13. Mold-Breaker UX Requirements

GC-GR Forecast must embody the application’s mold-breaker philosophy while respecting the fixed worksheet format. It should:

- preserve the worksheet structure but make it operationally intelligent
- continuously recommend the next best action
- highlight the highest-risk row/month combinations
- explain schedule-driven impacts
- explain why drift matters
- clearly show locked vs editable posture
- preserve continuity when month ranges change
- surface historical actual protection behavior clearly
- shorten navigation distance to the exact place the user needs to act
- make reviewability and readiness obvious without forcing the user to interpret the entire grid manually

## 14. Acceptance Criteria

GC-GR Forecast is not implementation-complete unless the developer delivers all of the following:

- exact required worksheet structure and column order
- derived Cost Code and Description from Budget
- month-column generation from Schedule plus Forecast Summary offsets
- exact final total row behavior
- paired Original Forecast and Actual / Remaining Forecast rows per cost code
- one-time Original Forecast entry during first reporting period only
- PM review and lock for Original Forecast rows
- current reporting month treated as forward-looking forecast, not split actual/remaining
- rolling single-month actualization from Budget Import
- frozen historical actual months beyond the most recent closed month
- PM request + Project Executive approval for historical override
- transparent preservation/repositioning when month ranges change
- guided variance detection and explanation
- clear locked-vs-editable posture
- recommend-and-steer mold-breaker guidance behavior

## 15. Developer Note

The developer should not treat GC-GR Forecast as a worksheet reskin. This is a runtime governance doctrine for a fixed-format but intelligent cost-period operating surface. The worksheet shape is constrained; the mold-breaker opportunity is in guidance, validation, preservation logic, historical protection, schedule coupling, readiness visibility, and operational steering.
