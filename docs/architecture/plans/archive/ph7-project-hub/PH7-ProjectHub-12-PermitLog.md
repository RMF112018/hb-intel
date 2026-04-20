# PH7.12 — Project Hub: Permit Log & Required Inspections

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the Permit Log (14-column tracker matching uploaded template) and the linked Required Inspections tracker (200+ inspection rows per uploaded template). Both match the uploaded files exactly in report view while simplifying data entry.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A digital permit tracking system where PMs can manage all permits and their associated required inspections in one place, with clear status management, expiration tracking, and the ability to drill into inspection results per permit.

---

## Prerequisites

- PH7.1, PH7.2 complete.
- Uploaded reference files analyzed: `20250915_TWN_PermitLog.xlsx` (14 columns, PRIMARY/SUB/TEMP types), `10b_20260220_RequiredInspectionsList.xlsx` (200+ inspections, 6 columns).
- SharePoint lists: `PermitLogEntries`, `RequiredInspections` (schemas in PH7.15).

---

## 7.12.1 — Permit Log Page

Route: `/project-hub/:projectId/permit-log`

**API:**
- `GET /api/project-hub/projects/:projectId/permit-log` → `IPermitLogEntry[]`
- `POST /api/project-hub/projects/:projectId/permit-log` → add permit
- `PATCH /api/project-hub/projects/:projectId/permit-log/:entryId` → update permit
- `DELETE /api/project-hub/projects/:projectId/permit-log/:entryId` → delete (soft)

**Permit Log Table:**

14 columns matching the uploaded `20250915_TWN_PermitLog.xlsx`:

| # | Column | Field | Type |
|---|---|---|---|
| 1 | REF # | `refNumber` | text (alphanumeric, e.g., "02E", "16E") |
| 2 | LOCATION | `location` | text |
| 3 | TYPE | `permitType` | select: PRIMARY / SUB / TEMP |
| 4 | PERMIT # | `permitNumber` | text |
| 5 | DESCRIPTION | `description` | text (required) |
| 6 | RESPONSIBLE CONTRACTOR | `responsibleContractor` | text |
| 7 | ADDRESS | `address` | text |
| 8 | DATE REQUIRED | `dateRequired` | date |
| 9 | DATE SUBMITTED | `dateSubmitted` | date |
| 10 | DATE RECEIVED | `dateReceived` | date |
| 11 | DATE EXPIRES | `dateExpires` | date |
| 12 | STATUS | `status` | select (see PermitStatus enum) |
| 13 | AHJ | `ahj` | text (Authority Having Jurisdiction) |
| 14 | COMMENTS | `comments` | text popover |

Status options (from `PermitStatus` enum): Active | Inactive | Pending Application | Pending Revision | VOID

**Status badge color coding:**
- Active → green
- Inactive → gray
- Pending Application → yellow
- Pending Revision → orange
- VOID → dark gray with strikethrough text

**Expiration alerts inline:**
- `dateExpires` within 30 days: red date label
- `dateExpires` within 60 days: orange date label
- `dateExpires` in the past (and status = Active): red "EXPIRED" badge next to date

**Toolbar:**
- "Add Permit" button → modal form with all 14 fields. REF # is user-assigned (alphanumeric to support sub-permit references like "16E", "02E").
- Filter by Type (PRIMARY / SUB / TEMP)
- Filter by Status
- "Active Only" toggle (hides VOID and Inactive permits)

**Permit row expansion:**
Each row has an expand arrow that reveals the linked Required Inspections for that permit (inline, not a separate page). See 7.12.2 for the inspection sub-table.

---

## 7.12.2 — Required Inspections Sub-Tracker

Route: `/project-hub/:projectId/permit-log/:permitId/inspections` (also embedded in permit row expansion)

The Required Inspections tracker is linked to each permit. The inspection list for a given permit type is seeded from the master inspection list (sourced from the uploaded `10b_20260220_RequiredInspectionsList.xlsx` — 200+ inspections organized by permit/inspection type).

**API:**
- `GET /api/project-hub/projects/:projectId/permit-log/:permitId/inspections` → `IRequiredInspection[]`
- `PATCH /api/project-hub/projects/:projectId/permit-log/:permitId/inspections/:inspectionId` → update result/notes
- `POST /api/project-hub/projects/:projectId/permit-log/:permitId/inspections` → add inspection

**Inspection Sub-Table (6 columns matching uploaded file):**

| # | Column | Field | Type |
|---|---|---|---|
| 1 | Inspection | `inspectionName` | text (read-only for seeded; editable for custom) |
| 2 | Code | `codeReference` | text |
| 3 | Date Called In | `dateCalledIn` | date |
| 4 | Result | `result` | select: Pass / Fail / N/A / Pending |
| 5 | Comment | `comment` | text |
| 6 | Verified Online | `verifiedOnline` | boolean toggle |

**Result badge color coding:**
- Pass → green
- Fail → red
- N/A → gray
- Pending → yellow

**Inspection seeding from master list:**
When a new permit is created, the system queries the Admin module's master inspection list filtered by the permit's `description` or type to auto-suggest the applicable Required Inspections. The PM can accept all suggestions, deselect irrelevant ones, and add custom inspections. This ensures the 200+ inspection list is applied appropriately without overwhelming the PM.

**Inspection summary inline in permit row:**
When the permit row is collapsed, show a small summary: "X / Y Inspections Complete (Z Failed)"

---

## 7.12.3 — Permit Log Summary Dashboard

At the top of the Permit Log page, show summary stat cards:

- Total Permits: N
- Active Permits: N (green)
- Pending (Application + Revision): N (yellow)
- Expiring Within 60 Days: N (orange)
- VOID: N (gray)
- Total Inspections: N | Passed: N | Failed: N | Pending: N

Failed inspections card is highlighted red if count > 0.

---

## 7.12.4 — Export

"Export" button exports current permit log (with or without inspection detail) as `.xlsx` matching the uploaded template format.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Add a PRIMARY permit. Verify it appears in table.
# Add a SUB permit with REF # "16E". Verify alphanumeric REF # saves correctly.
# Set a permit dateExpires to 20 days from now with status = Active. Verify red expiration indicator.
# Expand permit row. Verify Required Inspections sub-table shows.
# Set one inspection to Fail. Verify red badge and summary updates to "1 Failed".
# Set permit status to VOID. Verify strikethrough and gray badge.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.13 — Constraints Log
-->
