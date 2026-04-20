# PH7.8 — Project Hub: Warranty Module

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the Warranty module: warranty request workflow (submission through resolution), warranty document library (equipment/manufacturer warranties with expiration tracking), and automated expiration alert system.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete warranty management system that replaces manual spreadsheet tracking, provides a structured workflow for owner requests, and proactively alerts the project team before equipment warranties expire.

---

## Prerequisites

- PH7.1, PH7.2 complete.
- SharePoint lists: `WarrantyRequests`, `WarrantyDocuments` (schemas in PH7.15).
- Azure Functions timer trigger available for expiration alerts.

---

## 7.8.1 — Warranty Requests Page

Route: `/project-hub/:projectId/warranty/requests`

**API:**
- `GET /api/project-hub/projects/:projectId/warranty-requests` → `IWarrantyRequest[]`
- `POST /api/project-hub/projects/:projectId/warranty-requests` → submit new request
- `PATCH /api/project-hub/projects/:projectId/warranty-requests/:requestId` → update status/assignment/resolution

**Requests Table:**
Columns: Request # | Description | Location | Urgency | Category | Status | Assigned To | Submitted | Last Updated | Actions

Status badge color coding:
- Submitted → yellow
- Acknowledged → blue
- InProgress → orange
- Resolved → green
- Denied → red
- Closed → gray

Filter bar: Status dropdown | Urgency dropdown | "Open Only" toggle (hides Resolved/Denied/Closed)

**New Request Form** (modal):
- Location (text, required)
- Description (multi-line text, required)
- Urgency (HbcSelect: Low / Medium / High / Emergency, required)
- Category (HbcSelect: Roofing / HVAC / Plumbing / Electrical / Finishes / Structural / Landscaping / Equipment / Other)
- Photo Attachments (file upload, multiple, accepts JPEG/PNG/PDF)

On submit: request is created with status = Submitted and request number auto-assigned (`WR-{projectNumber}-{sequential#}`).

**Request Detail View** (opens in modal or side panel):
Shows all fields + full history of status changes + assignment log.

PM / Admin actions (role-gated):
- "Acknowledge" → status → Acknowledged
- "Assign To" (HbcPeoplePicker) → status → InProgress
- "Route to Subcontractor" (text input for sub company name) → records `responsibleSubcontractor`
- "Resolve" (requires `resolutionDescription`) → status → Resolved
- "Deny" (requires note) → status → Denied
- "Close" → status → Closed (only from Resolved or Denied)

Urgency = Emergency: display a prominent red banner at top of request detail. This urgency level also triggers an immediate HB Intel notification to the PM and Project Executive.

---

## 7.8.2 — Warranty Documents Page

Route: `/project-hub/:projectId/warranty/documents`

**API:**
- `GET /api/project-hub/projects/:projectId/warranty-documents` → `IWarrantyDocument[]`
- `POST /api/project-hub/projects/:projectId/warranty-documents` → add warranty document
- `PATCH /api/project-hub/projects/:projectId/warranty-documents/:docId` → update
- `DELETE /api/project-hub/projects/:projectId/warranty-documents/:docId` → delete

**Documents Table:**
Columns: Equipment / System | Vendor | Warranty Start | Warranty Expiration | Days Remaining | Alert Threshold | Document | Notes | Actions

Days Remaining color coding:
- ≥ 91 days → green
- 31–90 days → orange (within `alertDaysBefore` threshold — default 90)
- 1–30 days → red
- Expired (≤ 0) → dark red with "EXPIRED" badge

**Add Warranty Document form** (modal):
- Document Title (text, required)
- Vendor (text, required)
- Equipment or System (text, required) — e.g., "Carrier HVAC Unit - Roof", "TPO Roofing Membrane"
- Warranty Start Date (date, required)
- Warranty Expiration Date (date, required) — auto-calculates days remaining on change
- Alert Days Before Expiration (number input, default 90)
- Document Upload (PDF preferred; optional)
- Notes (multi-line text)

**Expiration Alerts:**
The system sends HB Intel notifications when `warrantyExpirationDate - today = alertDaysBefore` days. The Azure Functions timer trigger (`timerWarrantyAlerts`) runs daily at 8:00 AM and scans all active warranty documents. When an alert is triggered:
- Send notification to Project Manager UPN with message: "Warranty Alert: The {equipmentOrSystem} warranty for {projectNumber} - {projectName} expires on {expirationDate} ({daysRemaining} days remaining)."
- Set `alertSentAt` on the document record.

Note: `alertDaysBefore` is per-document configurable. Default is 90 days. If the PM sets it to 30, the alert fires 30 days out. Set to 0 to disable alerts for that document.

**Summary Cards at top of page:**
- Total Warranties: N
- Expiring Within 90 Days: N (orange)
- Expiring Within 30 Days: N (red)
- Expired: N (dark red)

---

## 7.8.3 — Timer Trigger: Warranty Expiration Alerts

```typescript
// backend/functions/src/functions/warrantyAlerts/index.ts

/**
 * Timer trigger: runs daily at 8:00 AM EST.
 * Scans all active warranty documents across all projects.
 * Sends HB Intel notification when today = expirationDate - alertDaysBefore.
 * Sets alertSentAt on the record to prevent duplicate alerts.
 */
export async function warrantyAlertsTimer(myTimer: Timer): Promise<void> {
  const today = new Date();
  // Query SharePoint WarrantyDocuments list for all records where:
  //   - warrantyExpirationDate is in the future
  //   - alertSentAt is null
  //   - (warrantyExpirationDate - today) <= alertDaysBefore
  // For each matching record: send notification + set alertSentAt
}
```

Timer CRON expression: `0 0 13 * * *` (8:00 AM EST = 13:00 UTC)

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Warranty Requests:
# Submit a new request (urgency = High). Verify it appears with yellow "Submitted" badge.
# Acknowledge → Assign → Resolve with description. Verify status progression.
# Submit a request with urgency = Emergency. Verify red banner appears in detail view.

# Warranty Documents:
# Add a document expiring in 45 days with alertDaysBefore=90. Verify orange "Days Remaining" color.
# Add a document with expiration date in the past. Verify "EXPIRED" badge.

# Timer Trigger (unit test):
# Mock a document expiring in exactly alertDaysBefore days. Verify alert notification fires.
# Mock a document where alertSentAt is already set. Verify no duplicate notification.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.9 — Financial Forecasting
-->
