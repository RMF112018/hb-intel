# PH7.10 — Project Hub: Schedule

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the Schedule module: XER/XML/CSV file upload and parsing (Primavera P6, MS Project), milestone tracker display, and schedule status indicators.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A schedule visibility tool that imports project milestone data from the industry-standard scheduling tools (P6, MS Project) and presents a clean, actionable milestone tracker that surfaces schedule health at a glance.

---

## Prerequisites

- PH7.1, PH7.2 complete.
- SharePoint lists: `ScheduleMilestones`, `ScheduleUploads` (schemas in PH7.15).
- Azure Functions backend capable of parsing XER/XML/CSV (Node.js parsing libraries available).

---

## 7.10.1 — Schedule Upload and Parsing

**API:**
- `POST /api/project-hub/projects/:projectId/schedule/upload` → multipart/form-data (XER, XML, or CSV file)
- `GET /api/project-hub/projects/:projectId/schedule/uploads` → `IScheduleUpload[]`
- `GET /api/project-hub/projects/:projectId/schedule/milestones` → `IScheduleMilestone[]`

**Supported file formats and parsing approach:**

*XER (Primavera P6 native format):*
- Parse using a Node.js XER parser library (e.g., `p6-xer-reader` or custom regex-based parser).
- Extract activities where `task_type = 'TT_Mile'` (milestones) or activities flagged as milestones.
- Map fields: Activity ID → `milestoneCode`, Activity Name → `milestoneName`, Early Start → `baselineDate`, Data Date-adjusted early start → `forecastDate`, Actual Finish → `actualDate`, Float → derive `status` (negative float = delayed, 0 = at-risk, positive = on-track).

*XML (Primavera P6 or MS Project XML):*
- Parse using standard XML parsing (`fast-xml-parser`).
- P6 XML schema: same field mapping as XER.
- MS Project XML schema: extract `<Task>` elements where `<Milestone>1</Milestone>`. Map: `<Name>` → `milestoneName`, `<Start>` → `baselineDate`, `<Finish>` → `forecastDate`, `<PercentComplete>` → derive completion, `<Critical>` → `isCriticalPath`.

*CSV (generic milestone format):*
- Flexible column detection. Required columns (case-insensitive match): Milestone Name + one of (Baseline Date, Target Date, Planned Date). Optional: Forecast Date, Actual Date, Status, Phase, Critical Path.
- Display a column mapping interface if auto-detection fails.

**Upload Component:**

```typescript
// apps/project-hub/src/pages/schedule/ScheduleUploadPanel.tsx

/**
 * Accepts file drag-and-drop or file picker button.
 * Supported extensions: .xer, .xml, .csv
 * Max file size: 50MB (schedule files can be large)
 *
 * After upload:
 * 1. Backend parses the file and returns IParsedSchedulePreview.
 * 2. Display preview: N milestones found, parse errors (if any).
 * 3. "Import {N} Milestones" confirm button.
 * 4. On confirm: milestones saved to SharePoint, previous upload's isActive=false.
 */

export interface IParsedSchedulePreview {
  fileName: string;
  format: ScheduleFileFormat;
  milestonesFound: number;
  activitiesSkipped: number; // non-milestone activities ignored
  parseErrors: string[];
  previewRows: Array<{
    milestoneName: string;
    baselineDate?: string;
    forecastDate?: string;
    actualDate?: string;
    isCriticalPath: boolean;
    phase?: string;
  }>;
}
```

---

## 7.10.2 — Milestone Tracker Page

Route: `/project-hub/:projectId/schedule`

**Component — Milestone Table:**

Columns: Phase | Milestone | Baseline Date | Forecast Date | Actual Date | Variance (days) | Status | Critical Path | Notes

Variance calculation: `forecastDate - baselineDate` (positive = behind schedule). Display in days.

Status badge logic:
- `Complete` (green) → `actualDate` is set
- `OnTrack` (green) → forecastDate ≤ baselineDate + 7 days (≤ 1 week buffer)
- `AtRisk` (orange) → forecastDate is 8–30 days after baselineDate
- `Delayed` (red) → forecastDate > 30 days after baselineDate or forecastDate is in the past and not complete

Critical Path indicator: flame icon (🔥) in the Critical Path column for milestones with `isCriticalPath = true`.

**Filter bar:**
- Phase filter (multi-select dropdown from distinct `phase` values in the data)
- Status filter (multi-select: OnTrack / AtRisk / Delayed / Complete)
- "Critical Path Only" toggle
- Search input (filters by milestone name)

**Schedule Summary cards at top:**
- Total Milestones | Complete | On Track | At Risk | Delayed
- Scheduled Completion | Forecasted Completion | Variance (days)

**Manual milestone entry:**
For projects without a schedule file (or to add milestone not in the schedule file):
- "Add Milestone" button → modal with all fields. Set `isCustom: true` in the record.
- Custom milestones can be edited and deleted; imported milestones are read-only by default (to preserve source-of-truth integrity). PM can override an imported milestone's forecast date via an "Override Forecast" action that opens an editable field.

**Upload History panel** (collapsible, bottom of page):
- Shows all past uploads with file name, format, date, milestone count.
- "Restore" button to re-activate a previous upload (replaces current active milestone set).

---

## 7.10.3 — Schedule Status Integration

The schedule status is surfaced in:
1. Project Hub Home Page → Schedule module card (via `IProjectDashboard.modules.schedule`)
2. Financial Summary → Schedule Status section (reads `IScheduleSummary` from schedule module)
3. PX Review auto-assembly (reads schedule snapshot)
4. Owner Report auto-population (scheduled completion + variance)

The `GET /api/project-hub/projects/:projectId/schedule/summary` endpoint computes `IScheduleSummary` on demand from the active milestone set.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Upload an XER file. Verify N milestones detected in preview.
# Confirm import. Verify milestones appear in tracker table.
# Verify Delayed milestones show red badge.
# Verify critical path milestones show flame icon.

# Add a manual milestone. Verify it appears in table.
# Filter by Phase. Verify only matching milestones show.
# Filter to Critical Path Only. Verify non-critical milestones hide.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.11 — Buyout Log
-->
