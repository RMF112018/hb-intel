# PH7.14 — Project Hub: PX Review & Owner Report

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the PX Review (auto-assembled project review package with trend dashboard) and Owner Report (auto-populated narrative report with PDF export). Both pull live data from all Project Hub modules and allow PM narrative overrides before export.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** Automated report generation that saves PMs significant time assembling monthly reports by pulling data from all Project Hub modules, presenting an editable narrative layer, and exporting a professional PDF.

---

## Prerequisites

- PH7.1 through PH7.13 complete (all modules providing data must be built before reports can auto-populate).
- PDF generation library available in Azure Functions backend (e.g., `puppeteer` with headless Chrome, or `@sparticuz/chromium` for serverless).
- SharePoint document library for storing exported PDFs: `/Shared Documents/Reports/`.

---

## 7.14.1 — PX Review Page

Route: `/project-hub/:projectId/reports/px-review`

The PX Review is the internal project review package prepared by the PM and Project Executive. It aggregates data from all modules.

**API:**
- `GET /api/project-hub/projects/:projectId/px-reviews` → `IPxReview[]` (review history)
- `GET /api/project-hub/projects/:projectId/px-reviews/draft` → `IPxReview` (current draft, auto-assembled from live data)
- `PUT /api/project-hub/projects/:projectId/px-reviews/draft` → save narrative overrides
- `POST /api/project-hub/projects/:projectId/px-reviews/export` → trigger PDF generation → returns `{ pdfUrl: string }`

**Auto-Assembly Logic (backend, called when draft is fetched):**

```typescript
// backend/functions/src/functions/projectHub/pxReview/assembleDraft.ts

/**
 * Assembles a PX Review draft by pulling live snapshots from all modules.
 * Called each time the PM opens the PX Review page (or clicks "Refresh Data").
 *
 * Data sources:
 * - Schedule: IScheduleSummary (scheduledCompletion, forecastedCompletion, varianceDays, status)
 * - Financial: IFinancialForecastSummary (projectedProfit%, currentContractAmount, exposures)
 * - Safety: incident count (open), JHA log count, acknowledgment gaps
 * - Buyout: IBuyoutLogSummary (percentBuyoutComplete, totalOverUnder)
 * - Constraints: open constraint count by category, overdue count, total delay days
 * - Permits: active permit count, pending inspections count, failed inspections count
 * - QC: openFailedItems count, overallPassRate
 *
 * Each snapshot is serialized to JSON and stored on IPxReview.*SnapshotJson fields.
 * Narrative fields are pre-populated from templates (see 7.14.2) but are PM-overridable.
 */
```

**PX Review Page Layout:**

*Header:*
- Review Date (date picker, defaults to today)
- "Refresh Data" button (re-fetches all module snapshots)
- Last refreshed timestamp

*Section 1 — Schedule Status:*
- Auto-populated from `scheduleSnapshotJson`
- Display: Scheduled Completion | Forecasted Completion | Variance (days) | Status badge
- Narrative field: `scheduleNarrative` (multi-line textarea — PM editable)
- Auto-suggested narrative template: "Project is currently [on track / X days behind schedule]. [Additional PM notes here.]"

*Section 2 — Financial Status:*
- Auto-populated: Contract Amount | Projected Profit $ | Projected Profit % | Open Exposures count
- Highlight: if projectedProfitPercent < 0, show red "AT RISK" banner
- Narrative field: `financialNarrative` (PM editable)

*Section 3 — Safety:*
- Auto-populated: Open Incidents | JHA Log Entries | Pending Acknowledgments
- Narrative field: `safetyNarrative` (PM editable)

*Section 4 — Buyout Status:*
- Auto-populated: % Bought Out | Total Over/Under
- (No separate narrative — included in Financial narrative)

*Section 5 — Constraints & Delays:*
- Auto-populated: Open Constraints by Category | Overdue Count | Total Delay Days
- Included in `executiveSummary` narrative

*Section 6 — Executive Summary:*
- `executiveSummary` (PM editable multi-line text — this is the top section of the exported PDF)
- Auto-suggested template based on module statuses: "Project {projectNumber} - {projectName} is [status]. [Schedule narrative]. [Financial narrative]. [Safety narrative]."

*Section 7 — Look Ahead:*
- `lookAheadNarrative` (PM editable)

**Export PDF:**
"Export PDF" button → `POST /api/project-hub/projects/:projectId/px-reviews/export`

PDF layout: Company letterhead (HBC logo) → Project Header → Section-by-section narrative + data table → Footer with page numbers.

The exported PDF is stored in SharePoint at `/Shared Documents/Reports/PX-Review-{projectNumber}-{date}.pdf` and returned as a download URL.

**Review History:**
Collapsible panel at bottom of page: "Previous PX Reviews" — table showing Review Date | Prepared By | PDF Link. Clicking a row loads the historical snapshot (read-only).

---

## 7.14.2 — Owner Report Page

Route: `/project-hub/:projectId/reports/owner-report`

The Owner Report is the external-facing report distributed to the project owner/client.

**API:**
- `GET /api/project-hub/projects/:projectId/owner-reports` → `IOwnerReport[]` (report history)
- `GET /api/project-hub/projects/:projectId/owner-reports/draft` → `IOwnerReport` (current draft)
- `PUT /api/project-hub/projects/:projectId/owner-reports/draft` → save
- `POST /api/project-hub/projects/:projectId/owner-reports/export` → PDF generation

**Owner Report Page Layout:**

*Header:*
- Report Number (auto-incremented: OR-{projectNumber}-001, OR-{projectNumber}-002…)
- Report Period Start (date)
- Report Period End (date, defaults to today)
- Overall Project Status (HbcSelect: On Track / At Risk / Behind) — PM override; auto-suggested from schedule status
- % Complete (number input, 0–100) — PM-entered overall percent complete

*Section 1 — Executive Summary:*
- `executiveSummary` (PM editable)
- Auto-suggested: "During the period of {periodStart} to {periodEnd}, {projectName} achieved [X]% completion..."

*Section 2 — Work Completed This Period:*
- `workCompletedThisPeriod` (PM editable multi-line)

*Section 3 — Work Planned Next Period:*
- `workPlannedNextPeriod` (PM editable multi-line)

*Section 4 — Schedule Status:*
- `scheduleStatusNarrative` (PM editable)
- Auto-populated: shows scheduled vs. forecasted completion dates and variance

*Section 5 — Budget Status:*
- `budgetStatusNarrative` (PM editable)
- Auto-populated from Financial module: contract amount, % invoiced, projected profit status (internal profit NOT shown — only contract status shown in owner report)

*Section 6 — Safety:*
- `safetyStatusNarrative` (PM editable)
- Auto-populated: "Zero recordable incidents this period." (or incident summary if incidents exist)

*Section 7 — Open Items & Actions:*
- `openItemsAndActions` (PM editable)
- Auto-suggested: lists top 5 open constraints (from Constraints Log) and any open permit issues

*Section 8 — Photos:*
- Photo upload section: PM can attach up to 10 photos with captions.
- Each photo: file upload + caption text input.

**Export PDF:**
"Export PDF" → generates professional PDF with:
- HBC letterhead + project information header
- All narrative sections
- Photo grid (if photos attached)
- Footer: "Prepared by Haskell-Brame Construction | {date}"

Stored in SharePoint at `/Shared Documents/Reports/Owner-Report-{projectNumber}-OR-{number}-{date}.pdf`.

**Report History:**
Same pattern as PX Review — collapsible history table with Report Number | Period | Prepared By | PDF Link.

---

## 7.14.3 — Shared PDF Generation Service

```typescript
// backend/functions/src/services/pdf-generation-service.ts

/**
 * Shared service for generating PDFs from HTML templates.
 * Uses Puppeteer (or @sparticuz/chromium for serverless) to render HTML → PDF.
 *
 * Used by: PX Review export, Owner Report export, Closeout Checklist export (PH7.5)
 *
 * Template approach:
 * - HTML templates in backend/functions/src/pdf-templates/
 * - Templates use inline CSS (no external stylesheets — PDF renderer limitation)
 * - Handlebars for template interpolation
 *
 * File storage: Azure Functions returns the PDF as a Blob; caller stores to SharePoint.
 */

export interface IPdfGenerationRequest {
  templateName: 'px-review' | 'owner-report' | 'closeout-checklist';
  data: Record<string, unknown>;
  fileName: string;
}

export async function generatePdf(request: IPdfGenerationRequest): Promise<Buffer> {
  // Render HTML template with data
  // Launch headless Chrome
  // Generate PDF
  // Return Buffer
}
```

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# PX Review:
# Open PX Review page. Verify auto-assembly pulls schedule, financial, safety data.
# Edit executiveSummary narrative. Save. Reload page. Verify narrative persists.
# Click Export PDF. Verify PDF downloads with correct sections.

# Owner Report:
# Create a new report with period dates. Verify report number auto-increments.
# Add 2 photos with captions. Export PDF. Verify photos appear in PDF.

# Verify both PDFs stored in SharePoint document library.
# View report history. Verify previous reports listed with PDF links.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.15 — Backend API & SharePoint Schemas
-->
