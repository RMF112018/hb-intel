# PH7.13 — Project Hub: Constraints Log

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the Constraints Log: a full digital tracker matching the uploaded template with 7 constraint categories (each with OPEN/CLOSED subcategories), due-date color coding, Change Tracking section, and Delay Log section. Maintains the exact report view while simplifying data entry.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A constraint, change, and delay management tool that replaces the manually maintained `HB_ConstraintsLog_Template.xlsx`, preserves the familiar column structure and category organization, and adds due-date intelligence to surface overdue items immediately.

---

## Prerequisites

- PH7.1, PH7.2 complete.
- Uploaded reference file analyzed: `HB_ConstraintsLog_Template.xlsx` — 11 columns, 7 categories, OPEN/CLOSED subcategories, Change Tracking section (11 cols), Delay Log section (11 cols).
- SharePoint lists: `ConstraintEntries`, `ChangeTrackingEntries`, `DelayLogEntries` (schemas in PH7.15).

---

## 7.13.1 — Constraints Log Page

Route: `/project-hub/:projectId/constraints-log`

**Page layout — three tabs:**
1. Constraints (default active)
2. Change Tracking
3. Delay Log

---

## 7.13.2 — Constraints Tab

**API:**
- `GET /api/project-hub/projects/:projectId/constraints` → `IConstraintEntry[]`
- `POST /api/project-hub/projects/:projectId/constraints` → add constraint
- `PATCH /api/project-hub/projects/:projectId/constraints/:entryId` → update
- `DELETE /api/project-hub/projects/:projectId/constraints/:entryId` → soft delete

**Table — 11 columns matching uploaded template:**

| # | Column | Field | Notes |
|---|---|---|---|
| 1 | No # | `sequenceNumber` | Auto-assigned, sequential within project |
| 2 | Description | `description` | Required |
| 3 | Date Identified | `dateIdentified` | Date, required |
| 4 | Status | `status` | Open / Closed |
| 5 | Days Elapsed | calculated | `today - dateIdentified` for Open items; `completionDate - dateIdentified` for Closed |
| 6 | Reference | `reference` | Text (contract section, RFI #, drawing ref) |
| 7 | Responsible | `responsible` | Text |
| 8 | B.I.C | `ballInCourt` | Ball in Court — who must act next |
| 9 | Due | `dueDate` | Date with color coding |
| 10 | Completion Date | `completionDate` | Date (set when status = Closed) |
| 11 | Comments | `comments` | Text popover icon |

**Due Date Color Coding (exact match to uploaded template):**
- ≥ 8 days until due → green
- Exactly 7 days until due → orange
- Past due (due date < today) and status = Open → red

The `dueDate` column cell background (or a colored left-border indicator) reflects this logic. Calculated in real time on render.

**Grouping — 7 Categories with OPEN/CLOSED subcategories:**

The table is organized into collapsible sections, one per `ConstraintCategory`:
- Design
- Owner
- Subcontractor
- Weather
- Regulatory
- Site Conditions
- Other

Each category section has two subsections: **OPEN** and **CLOSED**, each collapsible independently.

Section header shows: "Design — Open (5) | Closed (3)"

Default view: all Open sections expanded; all Closed sections collapsed.

**Toolbar:**
- "Add Constraint" button → modal with all fields except No # (auto-assigned) and Days Elapsed (calculated). Category selector (HbcSelect from 7 categories).
- "Filter by Category" multi-select dropdown.
- "Open Only" toggle (hides all Closed sections entirely).
- "Overdue Only" toggle (shows only items where due date is past and status = Open).

**Inline editing:** Same pattern as Buyout Log — click cell to edit; auto-save on blur.

When a constraint is set to Closed: prompt to enter Completion Date (required to close). Days Elapsed freezes at `completionDate - dateIdentified`.

---

## 7.13.3 — Change Tracking Tab

**API:**
- `GET /api/project-hub/projects/:projectId/change-tracking` → `IChangeTrackingEntry[]`
- `POST /api/project-hub/projects/:projectId/change-tracking` → add entry
- `PATCH /api/project-hub/projects/:projectId/change-tracking/:entryId` → update
- `DELETE /api/project-hub/projects/:projectId/change-tracking/:entryId` → soft delete

Identical 11-column structure to the Constraints table, but without category grouping (change tracking items are not categorized in the uploaded template). Displayed as a flat table with OPEN and CLOSED section headers.

The Change Tracking section captures formal or potential changes to the project scope, design, or budget before they become formal change orders. This is distinct from the Constraints Log (constraints are blocking items; changes are scope/budget evolution).

**Toolbar:** "Add Change" button. Same filter options (Open Only, Overdue Only).

---

## 7.13.4 — Delay Log Tab

**API:**
- `GET /api/project-hub/projects/:projectId/delay-log` → `IDelayLogEntry[]`
- `POST /api/project-hub/projects/:projectId/delay-log` → add entry
- `PATCH /api/project-hub/projects/:projectId/delay-log/:entryId` → update

Same 11-column structure plus an additional `delayDays` field (numeric — PM-entered quantification of the delay impact in calendar days).

**Additional column (13th — Delay Log only):**

| Column | Field | Notes |
|---|---|---|
| Delay Impact (Days) | `delayDays` | Numeric — how many days of schedule impact |

The Delay Log feeds into the Financial Forecasting module's exposure tracking (the "Schedule" exposure category in the Summary Sheet) and into the PX Review auto-assembly.

**Toolbar:** "Add Delay" button. Same filter options.

---

## 7.13.5 — Summary Dashboard

At the top of the Constraints Log page (visible across all three tabs), show summary stat cards:

**Constraints:** Open: N | Overdue: N (red if > 0) | Closed This Month: N
**Change Tracking:** Open: N | Overdue: N
**Delay Log:** Open: N | Total Delay Days: N days

---

## 7.13.6 — Export

"Export" button on each tab generates a `.xlsx` file matching the uploaded template format for that section (Constraints, Change Tracking, or Delay Log). Include a "Export All" option that generates a single workbook with three sheets.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Add 3 constraints across different categories.
# Verify category grouping with Open/Closed subcategories.

# Add a constraint with dueDate = today-1 (yesterday), status = Open.
# Verify red due date indicator.

# Add a constraint with dueDate = 7 days from now.
# Verify orange due date indicator.

# Close a constraint. Verify prompts for Completion Date.
# Verify Days Elapsed is frozen after close.

# Change Tracking tab: Add an entry. Verify it appears in flat table.

# Delay Log tab: Add entry with delayDays = 5. Verify "Total Delay Days: 5 days" in summary.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.14 — PX Review & Owner Report
-->
