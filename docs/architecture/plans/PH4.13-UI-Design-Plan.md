# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 13
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 13. Module-Specific UI Patterns

### 13.1 Go/No-Go Scorecards

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="ballInCourt"` — responsibility heat map active **[V2.1]**
- KPI Cards: Total Active, Pending My Review, Approved This Month, Rejected This Month
- Columns: Project Name, Score (0–100), Recommendation badge (Go / No-Go / Conditional), Status, Submitted By, Ball in Court, Last Modified
- Default sort: Last Modified, descending

**Scorecard Detail (`DetailLayout`)**
- Tabs: Scorecard | Approval Chain | Change History
- Main column: Criterion scoring table + horizontal score bar (red 0–40 / amber 41–69 / green 70–100)
- Sidebar: Vertical approval chain stepper with avatar, name, role, decision, timestamp

**Create/Edit Scorecard (`CreateUpdateLayout`)**
- Focus Mode auto-activates on tablet **[V2.1]**
- Sections: Project Selection, Scoring Criteria (dynamic weighted rows), Narrative (`HbcRichTextEditor` + voice), Attachments, Related Items

---

### 13.2 RFIs

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="ballInCourt"` — responsibility heat map active **[V2.1]**
- KPI Cards: Total Open, Overdue (danger if > 0), Average Response Time, Closed This Week
- Columns: RFI #, Subject, Status badge, Ball in Court, Due Date (red if overdue), Received Date, Responding Company, Cost Impact badge
- Frozen column: RFI #

**RFI Detail (`DetailLayout`)**
- Tabs: General | Responses | Related Items | Change History
- Main: Question (`HbcRichTextEditor` view-only), Official Response, Response thread
- Sidebar: Activity feed, Attachments, Related Drawings/Specs

**Create RFI (`CreateUpdateLayout`)**
- Focus Mode auto-activates on tablet **[V2.1]**
- Sections: General Info, Question (`HbcRichTextEditor` + voice **[V2.1]**), Distribution List, Related Items, Attachments

---

### 13.3 Punch List

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="assigneeId"` — responsibility heat map active **[V2.1]**
- Dashboard tab: Status donut + Items by Company bar + Average Response Time + Total Overdue
- List tab: `HbcDataTable`
- Columns: Item #, Description, Status badge, Assignee, Company, Due Date, Location, Photo count

**Punch Item Detail (`DetailLayout`)**
- Tabs: General | Photos | Change History
- Main: Description, Location (drawing link), Inspection Type, Trade Responsible
- Sidebar: Photo grid, Activity feed, Attachments

---

### 13.4 Drawings

**Landing View (`ToolLandingLayout`)**
- View modes: Table (default) | Thumbnail Grid (toggle in CommandBar)
- Columns: Sheet #, Title, Revision, Discipline, Issue Date, Status badge
- Discipline filter chip row below CommandBar

**Drawing Viewer (`DetailLayout` — modified)**
- Main column expands to 12/12 columns (full width).
- Canvas: High-resolution PDF renderer, touch-optimized pan/zoom (two-finger pinch, one-finger pan). **[V2.1 gesture-first]**
- Toolbar: Sheet/Revision selector, Markup toggle, Layer filter, Activity log toggle
- Markup toolbar: Selection, Freehand pen, Shapes (cloud, rectangle, ellipse), Lines/arrows, Text, Measurement, Link pin (RFI/Punch Item)
- Drawings pre-cached by service worker when project is selected (cache-first strategy for drawing files) **[V2.1]**

---

### 13.5 Budget / Cost Management

**Landing View (`ToolLandingLayout`)**
- KPI Cards: Revised Budget, Forecasted Cost, Variance (color-coded), Approved Change Orders, Pending Change Orders
- Density auto-detects to Compact on desktop (wide viewport + mouse) **[V2.1]**
- Table: Expandable row hierarchy — cost code divisions → sub-codes
- Columns: Cost Code, Description, Original Budget, Revised Budget, Actual Cost, Forecast, Variance ($), Variance (%), Status badge
- Frozen columns: Cost Code + Description

> **Note:** Highest information density view in HB Intel. Horizontal scroll is expected. Compact density default for this tool reduces the frequency of horizontal scroll without eliminating any financial columns.

---

### 13.6 Daily Log

**Landing View** — Calendar/date-centric:
- Month calendar with date-picker header
- Each day cell: log status badge, weather icon, crew count
- Click navigates to that day's log

**Daily Log Entry (`CreateUpdateLayout`)**
- Focus Mode auto-activates on tablet **[V2.1]**
- Sections: Date + Weather (auto-populated), Work Log, Visitors, Deliveries, Safety Observations, General Notes (`HbcRichTextEditor` + **voice dictation** — high-value field input **[V2.1]**), Attachments
- All sections independently collapsible

---

### 13.7 Turnover to Operations

**Landing View (`ToolLandingLayout`)**
- `responsibilityField="pendingSignatoryId"` — responsibility heat map active **[V2.1]**
- KPI Cards: Total, In Progress, Completed, Pending Signatures
- Columns: Package Name, Project, Status badge, Phase, Created By, Target Handoff Date, Signature Status

**Turnover Detail (`DetailLayout`)**
- Tabs: Checklist | Agenda | Signatures | Change History
- Checklist: Grouped items with checkboxes, assignees, due dates
- Signatures: Stepper with signatory status + timestamps

**Create Turnover Package (`HbcTearsheet`)**
- Multi-step: Step 1 Package Details, Step 2 Checklist Items, Step 3 Meeting Agenda, Step 4 Signatories
- Uses `HbcTearsheet` due to multi-step nature

---

### 13.8 Documents

**Landing View (`ToolLandingLayout`)**
- Left column (3/12): `HbcTree` folder navigator
- Right column (9/12): File list `HbcDataTable` — Name, Type icon, Size, Modified Date, Modified By, Version
- Preview pane: Optional right `HbcPanel` (md) for selected file thumbnail + metadata