# PH7.6 — Project Hub: Safety Module

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build all four Safety pages: Site Specific Safety Plan (structured form with subcontractor acknowledgment), JHA Log (Phase 1 file upload), Emergency Plans Library (company-wide with annual acknowledgment), and Incident Reporting (24-field structured form with notification workflow).
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A comprehensive per-project safety documentation hub that replaces paper-based processes, enforces acknowledgment tracking, and ensures incident reports trigger the correct notification workflow within the 24-hour submission window.

---

## Prerequisites

- PH7.1, PH7.2, PH7.3 complete.
- SharePoint lists: `SiteSafetyPlans`, `SubAcknowledgments`, `JhaLogEntries`, `EmergencyPlanAcknowledgments`, `IncidentReports` (schemas in PH7.15).
- Emergency plans library pre-populated in Admin module with company-wide plans (including Tropical Storm/Hurricane Plan and ICE/Crisis documents from uploaded reference files).
- `VITE_FUNCTION_APP_URL` set.

---

## 7.6.1 — Site Specific Safety Plan (SSSP) Page

Route: `/project-hub/:projectId/safety/sssp`

**API:**
- `GET /api/project-hub/projects/:projectId/sssp` → `ISiteSafetyPlan | null`
- `PUT /api/project-hub/projects/:projectId/sssp` → create or update SSSP
- `POST /api/project-hub/projects/:projectId/sssp/sub-acknowledgments` → add/update subcontractor acknowledgment

**Page layout — two tabs:**

*Tab 1: Safety Plan Form*

Structured form with `HbcFormSection` sections matching the uploaded Site Specific Safety Plan template:

- **Section 1 – Project Information:** Project Address, Owner Name, General Contractor (auto-filled from project), Safety Manager (HbcPeoplePicker → populates `safetyManagerUpn`/`safetyManagerName`/`safetyManagerPhone`)
- **Section 2 – Scope & Hazard Overview:** Scope Description (multi-line), Identified Hazards (multi-select chip input — type to add hazard tags), Special Conditions (multi-line)
- **Section 3 – Emergency Procedures:** Nearest Hospital + Address, Emergency Assembly Point, Emergency Contact Name + Phone
- **Section 4 – Required PPE:** Multi-select chip input (standard options: Hard Hat, Safety Vest, Steel-Toe Boots, Safety Glasses, Gloves, Fall Protection, Respirator, Hearing Protection + custom entry)
- **Section 5 – Subcontractor Requirements:** Multi-line text
- **Section 6 – Additional Sections:** Dynamic list — "Add Section" button creates a new section with custom Title + Content fields. Sections can be reordered and deleted.

Auto-save with debounce (2 seconds after last keystroke). Show "Saved" / "Saving…" indicator in header.

*Tab 2: Subcontractor Acknowledgments*

Table: Company | Contact | Status | Acknowledged At | Action

- "Add Subcontractor" button opens modal with fields: Subcontractor Company (text), Contact Name (text), Contact UPN (optional HbcPeoplePicker).
- Each row shows status badge and, for Pending rows, a "Send Reminder" button that triggers a notification.
- When a subcontractor acknowledges (via the HB Intel notification link or manual override by Safety Manager), status updates to Acknowledged.
- Summary: "X of Y subcontractors have acknowledged."

---

## 7.6.2 — JHA Log Page

Route: `/project-hub/:projectId/safety/jha-log`

**Phase 1 (this task):** File upload log. Phase 2 (future): Native digital JHA form — document the Phase 2 vision in a code comment but do not build it.

**API:**
- `GET /api/project-hub/projects/:projectId/jha-log` → `IJhaLogEntry[]`
- `POST /api/project-hub/projects/:projectId/jha-log` → upload a new JHA entry (multipart/form-data with metadata + file)
- `DELETE /api/project-hub/projects/:projectId/jha-log/:entryId` → soft delete

**Component requirements:**

*Upload Section:*
- "Upload JHA" button opens a modal with fields: JHA Date (date, required), Work Activity (text, required), Prepared By Company (text, required), Prepared By Name (text, auto-filled from current user), File Upload (accepts PDF, DOCX, XLSX; max 20MB), Notes (optional text).
- On submit: POST to API, store file in project SharePoint document library (`/Shared Documents/Safety/JHA/`), create `IJhaLogEntry` record.

*Log Table:*
- Columns: Date | Work Activity | Prepared By | Company | File | Notes | Actions
- File column: clickable link icon that opens the stored document.
- Actions: "Delete" with `HbcConfirmDialog` confirmation.
- Sort by date descending by default.

*Phase 2 Vision Comment:*
```typescript
/*
 * PHASE 2 — Native Digital JHA Form (future enhancement)
 * Replace file upload with a structured digital form including:
 * - Job steps / task breakdown
 * - Hazards identified per step
 * - Controls/mitigations per hazard
 * - Worker signatures (digital acknowledgment)
 * - Supervisor sign-off
 * - Auto-generated PDF export
 * - Sub-acknowledgment tracking linked to SubAcknowledgments list
 */
```

---

## 7.6.3 — Emergency Plans Library Page

Route: `/project-hub/:projectId/safety/emergency-plans`

Company-wide emergency plans managed by Admin; Project Hub shows the library with per-project, per-member annual acknowledgment tracking.

**API:**
- `GET /api/project-hub/emergency-plans` → `IEmergencyPlan[]` (company-wide library)
- `GET /api/project-hub/projects/:projectId/emergency-plan-acknowledgments` → current year acknowledgments for this project
- `POST /api/project-hub/projects/:projectId/emergency-plan-acknowledgments` → record acknowledgment

**Plans in the library** (pre-populated from uploaded reference files):
- Tropical Storm / Hurricane Plan
- ICE (Immigration and Customs Enforcement) Response Protocol
- Crisis Communication Plan
- Medical Emergency Response
- Fire Emergency Plan
- Active Threat / Workplace Violence Response

**Component requirements:**

Plan cards (one `HbcCard` per plan):
- Plan title, type, version, effective date
- "View Document" button → opens document URL in new tab
- Per-project acknowledgment section: shows each project team member and their acknowledgment status for the current year.
- If the current user has not acknowledged: "Acknowledge for {current year}" button.
- Clicking Acknowledge opens `HbcConfirmDialog`: "I confirm I have read and understand the {planTitle} (effective {date})."
- Status badges: Acknowledged {year} (green), Not Yet Acknowledged (gray).

PM Actions toolbar:
- "Send Reminder to All Pending" → fires HB Intel notification to all team members with un-acknowledged plans.

---

## 7.6.4 — Incident Reporting Page

Route: `/project-hub/:projectId/safety/incident-reporting`

**API:**
- `GET /api/project-hub/projects/:projectId/incidents` → `IIncidentReport[]`
- `POST /api/project-hub/projects/:projectId/incidents` → submit new incident report (triggers notification workflow)
- `GET /api/project-hub/projects/:projectId/incidents/:incidentId` → single report

**Component — Incident Log view:**
Table of past incidents: Date | Type | Location | Person Completing | Status | Actions
- "New Incident Report" button opens the report form.
- Click a row to view the full incident record (read-only after submission).

**Component — Incident Report Form:**
24-field form matching the uploaded Incident Report.docx exactly. Rendered in a full-page form or large modal. Fields:

*Reporter Information:*
- Person Completing Report (auto-fill from current user, editable)
- Company (text)

*People Involved:*
- Employees Involved (multi-line text)

*Incident Details:*
- Date and Time of Incident (date-time picker, required)
- Date and Time First Reported (date-time picker, required — default to now)
- Location (text, required)
- Incident Type (HbcSelect: Near Miss / Unsafe Condition / Equipment Damage / Other, required)
- Incident Type - Other Specify (text, visible only if type = Other)

*Narrative:*
- Description (multi-line text, required)
- Immediate Causes (multi-line text)
- Contributing Factors (multi-line text)
- Corrective Actions (multi-line text, required)

*Equipment:*
- Equipment Involved (text)
- Operator Trained (HbcToggle: Yes / No / N/A)

*Documentation:*
- Photos Attached (HbcToggle)
- Police Report Filed (HbcToggle)
- Police Report Number (text, visible if police report = Yes)

*Witnesses:*
- Witness 1: Name, Company, Agrees with Description (HbcToggle)
- Witness 2: Name, Company, Agrees with Description (HbcToggle)

*Notifications:*
- Safety Manager Notified (HbcToggle)
- Safety Manager Notified At (date-time, visible if yes)
- Subcontractor Supervisor Notified (HbcToggle)
- Subcontractor Supervisor Notified At (date-time, visible if yes)

**Submission validation:**
- Required fields: Description, Corrective Actions, Incident Date, Location, Incident Type.
- If current time is more than 24 hours after Incident Date, display a yellow warning banner: "This incident occurred more than 24 hours ago. Please ensure your supervisor has been notified."
- On submit: POST to API. Backend triggers notification workflow.

**Notification workflow (backend, implemented in PH7.15):**
1. Identify the project's Safety Manager (from SSSP `safetyManagerUpn` or project team role).
2. Identify the Subcontractor Supervisor (from subcontractor acknowledgments or form field).
3. Send HB Intel notification to both recipients: "A new incident report has been submitted for {projectNumber} - {projectName}. Please review immediately."
4. Record `IIncidentNotification` entries on the report.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# SSSP: Fill all 6 sections, save. Verify auto-save fires after 2 seconds.
# SSSP Sub Acknowledgment: Add 2 subcontractors, mark one as Acknowledged. Verify counts.
# JHA Log: Upload a PDF file. Verify entry appears in log with file link.
# Emergency Plans: Click Acknowledge on one plan. Verify status updates to Acknowledged.
# Incident Report: Fill all required fields, submit. Verify notification records created.
# Incident Report: Enter incident date 25 hours ago. Verify 24-hour warning banner shows.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.7 — Quality Control Module
-->
