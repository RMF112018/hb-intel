# PH7.11 — Project Hub: Buyout Log

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the Buyout Log: a full digital tracker replicating the uploaded 14-column template with CSI division structure, simplified data entry, Procore budget upload for Original Budget seeding, and summary calculations.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A buyout tracking tool that preserves the exact report view the team is familiar with from the uploaded `Buyout Log_Template 2025.xlsx`, while dramatically simplifying data entry and eliminating manual spreadsheet maintenance.

---

## Prerequisites

- PH7.1, PH7.2, PH7.9 complete (Procore budget upload in PH7.9 seeds `originalBudget` in Buyout Log).
- SharePoint list: `BuyoutLogEntries` (schema in PH7.15).
- CSI divisions 02–16 definition available in Admin module or as a constants file.

---

## 7.11.1 — CSI Division Constants

```typescript
// packages/models/src/project-hub/BuyoutLogConstants.ts

/** CSI divisions pre-populated in every Buyout Log — from uploaded template. */
export const CSI_DIVISIONS = [
  { division: '02', description: 'Existing Conditions' },
  { division: '03', description: 'Concrete' },
  { division: '04', description: 'Masonry' },
  { division: '05', description: 'Metals' },
  { division: '06', description: 'Wood, Plastics & Composites' },
  { division: '07', description: 'Thermal & Moisture Protection' },
  { division: '08', description: 'Openings' },
  { division: '09', description: 'Finishes' },
  { division: '10', description: 'Specialties' },
  { division: '11', description: 'Equipment' },
  { division: '12', description: 'Furnishings' },
  { division: '13', description: 'Special Construction' },
  { division: '14', description: 'Conveying Equipment' },
  { division: '16', description: 'Electrical' },
] as const;

export type CsiDivisionCode = typeof CSI_DIVISIONS[number]['division'];
```

---

## 7.11.2 — Buyout Log Page

Route: `/project-hub/:projectId/buyout-log`

**API:**
- `GET /api/project-hub/projects/:projectId/buyout-log` → `{ entries: IBuyoutLogEntry[]; summary: IBuyoutLogSummary }`
- `PATCH /api/project-hub/projects/:projectId/buyout-log/:entryId` → update a row
- `POST /api/project-hub/projects/:projectId/buyout-log/entries` → add a custom row (for trades outside standard CSI divisions)

**Page initialization:**
When the Buyout Log is first accessed for a new project, one `IBuyoutLogEntry` row is created per CSI division (14 rows, pre-populated with `csiDivision` and `csiDescription`). If Procore budget upload has been completed (PH7.9), `originalBudget` for each row is seeded from the budget import by summing all cost codes within the matching CSI division.

---

## 7.11.3 — Buyout Log Table Component

The table replicates the 14-column layout of the uploaded template. All 14 columns must be present.

**Column definitions:**

| # | Column Label | Field | Type | Notes |
|---|---|---|---|---|
| 1 | REF # | `refNumber` | read-only | Auto-assigned (sequential within project) |
| 2 | DIVISION # / DESCRIPTION | `csiDivision` + `csiDescription` | read-only | Pre-populated from CSI constants |
| 3 | SUBCONTRACTOR / VENDOR | `subcontractorVendor` | editable text | |
| 4 | CONTRACT AMOUNT | `contractAmount` | currency input | |
| 5 | ORIGINAL BUDGET | `originalBudget` | read-only (from Procore upload) | Edit icon allows manual override |
| 6 | OVER / UNDER | calculated | read-only | `contractAmount - originalBudget`; red if positive |
| 7 | LOI DATE TO BE SENT | `loiDateToBeSent` | date input | |
| 8 | LOI RETURNED EXECUTED | `loiReturnedExecuted` | date input | |
| 9 | SUBMITTAL DATES | `submittalDates` | text | Free text for ranges/multiple |
| 10 | LEAD TIMES | `leadTimes` | text | Free text |
| 11 | SUB NAME | `subName` | text | Secondary contact name |
| 12 | BALL IN COURT | `ballInCourt` | text | |
| 13 | SDI | `enrolledInSdi` | boolean toggle | Yes / No chip |
| 14 | BOND | `bondRequired` | boolean toggle | Yes / No chip |

**Comments:** A "Comments" icon button at the end of each row opens a popover with the `comments` field as an editable `HbcTextField`. Shows a filled icon if comments exist.

---

## 7.11.4 — Inline Editing Pattern

Cells are **not** in persistent edit mode. Click a cell to activate inline editing for that cell only. On blur or Enter: auto-save via `PATCH`. This mimics the spreadsheet experience the team is accustomed to.

Fields with content display the value; empty optional fields display a placeholder (e.g., `—` for empty dates, `-` for empty text) that turns into an input on click.

Currency fields (`contractAmount`, `originalBudget`): display with `$` prefix and comma formatting. Input accepts numeric entry; format on blur.

Date fields: render as `MM/DD/YYYY`; input uses a date picker.

Over/Under column: calculated in real time on `contractAmount` change. Green if ≤ 0 (under budget), red if > 0 (over budget).

---

## 7.11.5 — Summary Footer

Below the main table, show three summary rows matching the uploaded template:

| Label | Value |
|---|---|
| Subcontracts Bought Out | {subcontractsBoughtOut} of {totalSubcontracts} |
| Total Budget | $ {totalBudget} (from originalBudget sum) |
| % Buyout Complete | {percentBuyoutComplete}% |

% Buyout Complete = (rows where contractAmount is set) / (rows where originalBudget > 0) × 100

---

## 7.11.6 — Procore Budget Upload Link

If no Procore budget has been uploaded, show a banner above the table:
> "Original Budget columns are empty. Upload your Procore Budget to auto-populate them."
With a "Upload Procore Budget" button that navigates to `/financial` (PH7.9 upload page).

If budget has been uploaded, show a small indicator in the page header: "Original Budget sourced from Procore upload on {date}." With a "Re-upload" link.

---

## 7.11.7 — Add Custom Row

For trades that fall outside the standard 14 CSI divisions (e.g., a specialty subcontractor):
- "Add Row" button at bottom of table opens a mini-form: REF # (auto-assigned), Division # (text), Description (text). Creates a new `IBuyoutLogEntry` with `isCustom: true`.
- Custom rows appear after the standard 14 CSI division rows.
- Custom rows can be deleted; standard CSI rows cannot.

---

## 7.11.8 — Export

"Export" button generates a `.xlsx` file matching the uploaded Buyout Log template view, including:
- All 14 columns with current data
- Summary rows at bottom
- Column header formatting preserved

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# New project: verify 14 CSI division rows auto-created.
# After Procore upload: verify originalBudget populated from upload.
# Enter contractAmount > originalBudget for one row: verify Over/Under shows red positive value.
# Enter contractAmount < originalBudget: verify Over/Under shows green negative value.
# Set 3 rows to have contractAmount set. Verify % Buyout Complete = 3/14 = ~21%.
# Add a custom row. Verify it appears after standard rows.
# Export: verify .xlsx downloads with correct data.
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.12 — Permit Log & Required Inspections
-->
