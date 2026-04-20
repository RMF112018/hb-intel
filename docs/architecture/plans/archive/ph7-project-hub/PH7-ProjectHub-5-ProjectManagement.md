# PH7.5 — Project Hub: Project Management Module

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the four Project Management pages: Project Management Plan (structured digital form + team acknowledgment), Responsibility Matrix (interactive RACI with add/edit/delete), Startup Checklist (37-item native Procore replacement), and Closeout Checklist (43-item with auto-populated document links).
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete digital project management toolkit where PMs can create, maintain, and track all core project management documents with team acknowledgment and item-level completion tracking.

---

## Prerequisites

- PH7.1, PH7.2, PH7.3 complete.
- SharePoint lists: `ProjectManagementPlans`, `RaciRows`, `StartupChecklistItems`, `CloseoutChecklistItems` (schemas defined in PH7.15).
- Uploaded reference files analyzed: Project Management Plan template, Responsibility Matrix Excel, Startup Checklist (37-item), Closeout Checklist (43-item).

---

## 7.5.1 — Project Management Plan Page

Route: `/project-hub/:projectId/project-management/pmp`

**API:**
- `GET /api/project-hub/projects/:projectId/pmp` → `IProjectManagementPlan | null`
- `PUT /api/project-hub/projects/:projectId/pmp` → create or update PMP
- `POST /api/project-hub/projects/:projectId/pmp/acknowledge` → record team member acknowledgment

**Page layout — two tabs:**

*Tab 1: Document*
Structured form with collapsible `HbcFormSection` components matching the uploaded PMP template sections:

- **Section 1 – Project Overview:** Project Description (multi-line text), Construction Type (select), Contract Type (select: GC / CM / Design-Build / Other), Contract Amount (currency input), NTP (date), Substantial Completion (date), Final Completion (date)
- **Section 2 – Project Team:** Owner Name, Owner Contact Name + Email, Architect Name + Contact, Engineer Name. Each is a pair of `HbcTextField` fields.
- **Section 3 – Communication Plan:** Owner Meeting Frequency (select: Weekly / Bi-Weekly / Monthly), Internal Meeting Frequency, Reporting Schedule (text)
- **Section 4 – Key Milestones:** Dynamic list — "Add Milestone" button adds a row with Description (text) + Target Date (date). Rows can be deleted. Drag-to-reorder is a future enhancement.
- **Section 5 – Risk Register Summary:** Dynamic list — "Add Risk" button adds a row with Description, Mitigation, Owner (text). Rows can be deleted.
- **Section 6 – Additional Notes:** Multi-line `HbcTextField`.

Save button at bottom: `PUT /api/project-hub/projects/:projectId/pmp`. Show last-saved timestamp.

*Tab 2: Acknowledgments*
Renders `IPmpAcknowledgment[]` as a table: Name | Role | Status | Acknowledged At | Action

- Rows are pre-populated from the project's team members (from `IProjectHubProject.teamMemberUpns`).
- The current user's row shows an "Acknowledge" button if their status is `Pending`.
- Clicking "Acknowledge" opens `HbcConfirmDialog`: "I confirm that I have read and understood the Project Management Plan for {projectNumber} - {projectName}."
- PM can click "Request Acknowledgments" button to send HB Intel notifications to all team members with pending status.
- Status badges: Pending (gray), Acknowledged (green), Declined (red).
- Summary: "X of Y team members have acknowledged."

---

## 7.5.2 — Responsibility Matrix (RACI) Page

Route: `/project-hub/:projectId/project-management/raci`

**API:**
- `GET /api/project-hub/projects/:projectId/raci` → `IRaciMatrix`
- `POST /api/project-hub/projects/:projectId/raci/rows` → add a row
- `PATCH /api/project-hub/projects/:projectId/raci/rows/:rowId` → update row assignments or task text
- `DELETE /api/project-hub/projects/:projectId/raci/rows/:rowId` → delete a row
- `PUT /api/project-hub/projects/:projectId/raci/columns` → update column definitions (add/remove team members as columns)

**Component requirements:**

The RACI matrix is a two-dimensional table where:
- **Rows** = tasks/decisions (e.g., "Approve Change Order", "Submit RFI", "Approve Pay Application")
- **Columns** = team member roles (populated from the project team)

Each cell contains an `HbcSelect` with options: R (Responsible), A (Accountable), C (Consulted), I (Informed), — (None).

*Toolbar (above table):*
- "Add Row" button → appends a new row with an editable Task/Decision text field
- "Manage Columns" button → opens `HbcModal` to add/remove team member columns
- "Export" button → exports current RACI as CSV

*Row controls:*
- Each row has an inline "Edit" icon to rename the task text.
- Each row has a "Delete" icon with `HbcConfirmDialog` confirmation.
- Rows are displayed in `sortOrder` sequence; drag-to-reorder is a future enhancement.

*Column management modal:*
- Shows current project team members as available columns.
- Check/uncheck to include or exclude a person as a RACI column.
- Changes to columns must not delete existing assignment data for removed columns — retain in SharePoint but hide from view.

*Validation:*
- Each row should have exactly one "A" (Accountable). Display a warning badge (not blocking) if a row has 0 or 2+ A assignments.

---

## 7.5.3 — Startup Checklist Page

Route: `/project-hub/:projectId/project-management/startup-checklist`

This is HB Intel's native replacement for the Procore startup checklist. 37 items pre-populated from the uploaded Procore Startup Checklist Summary template.

**API:**
- `GET /api/project-hub/projects/:projectId/startup-checklist` → `IStartupChecklistItem[]`
- `PATCH /api/project-hub/projects/:projectId/startup-checklist/:itemId` → update `status`, `dueDate`, `notes`

**Pre-populated item categories** (derived from uploaded Procore Startup Checklist):
The 37 items span categories including: Contracts, Insurance, Permits, Safety, Subcontractors, Accounting/Finance, Scheduling, Project Controls, IT/Technology, Marketing. All 37 items are seeded into the SharePoint list during project provisioning (Step 4 of the provisioning saga).

**Component requirements:**
- Group items by `category` in collapsible `HbcCard` sections.
- Each item row: Item Text | Status (HbcSelect) | Due Date (date input) | Completed By | Notes (HbcTextField)
- Status options: Not Started (gray), In Progress (yellow), Complete (green), N/A (muted)
- When set to Complete: auto-fill `completedByUpn`, `completedByName`, `completedAt` from current user + timestamp.
- Progress header: circular progress indicator showing "X / 37 Complete (Y%)" — N/A items excluded from denominator.
- "Mark All N/A" quick action for irrelevant items (with confirmation).
- Items with Due Date in the past and status ≠ Complete show a red due date indicator.

---

## 7.5.4 — Closeout Checklist Page

Route: `/project-hub/:projectId/project-management/closeout-checklist`

43-item checklist based on the uploaded Job Closeout Checklist template. Includes a special "Closeout Documents" sub-section where document links are auto-populated from stored project documents.

**API:**
- `GET /api/project-hub/projects/:projectId/closeout-checklist` → `ICloseoutChecklistItem[]`
- `PATCH /api/project-hub/projects/:projectId/closeout-checklist/:itemId` → update item

**Pre-populated item categories** (derived from uploaded Job Closeout Checklist):
Span categories including: Final Inspections, Permits, Punch List, Subcontractor Closeout, Financial Closeout, Owner Deliverables, Warranty Start, Lessons Learned, Project Records. Seeded during project provisioning alongside Startup Checklist items.

**Closeout Documents sub-section:**
- Items with `hasDocument = true` display a document icon and link (`documentUrl`, `documentName`).
- Document links are auto-populated when documents are uploaded elsewhere in the Project Hub (e.g., SSSP, JHA Log, Warranty Documents).
- PM can manually attach a document URL to any checklist item via an "Attach Document" action.

**Component requirements:**
- Identical layout pattern to Startup Checklist (grouped by category, per-item status/due/notes).
- Distinct visual treatment for items with attached documents (document icon + filename shown inline).
- Progress header: "X / 43 Complete (Y%)" excluding N/A items.
- Export button: generates PDF summary of the closeout checklist with completion status for each item.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# PMP: Create a new PMP, fill all sections, save. Verify persistence.
# PMP Acknowledgment: Login as team member, click Acknowledge. Verify status updates.
# RACI: Add 3 rows, assign R/A/C/I to each column, delete 1 row. Verify table state.
# RACI Validation: Create a row with 0 Accountable assignments. Verify warning badge appears.
# Startup Checklist: Set 5 items to Complete. Verify progress header updates to "5 / 37 (14%)".
# Closeout Checklist: Verify items with hasDocument=true show document link.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.6 — Safety Module
-->
