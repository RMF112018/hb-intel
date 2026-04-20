# PH7.7 — Project Hub: Quality Control Module

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build the QC module: CSI-division-auto-suggested checklists that are per-project customizable, and the QC Completion tracker with third-party inspection coordination. Document the Phase 2 collaborative workflow vision (Dashpivot/Sitemate replacement) but do not build it in this task.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A Phase 1 QC tool that allows PMs and QC Managers to define and track quality control checklists based on the project's CSI division scope, with per-item pass/fail tracking and third-party inspection records.

---

## Prerequisites

- PH7.1, PH7.2, PH7.3 complete.
- CSI division master list seeded in Admin module (divisions 02–16 with standard checklist item templates per division).
- SharePoint lists: `QcChecklists`, `QcChecklistItems`, `ThirdPartyInspections` (schemas in PH7.15).
- Uploaded reference: HB QC App Initiative presentation and Dashpivot Analytics Overview analyzed.

---

## 7.7.1 — QC Checklists Page

Route: `/project-hub/:projectId/quality-control/checklists`

**API:**
- `GET /api/project-hub/projects/:projectId/qc-checklists` → `IQcChecklist[]`
- `POST /api/project-hub/projects/:projectId/qc-checklists` → create a checklist (from template or blank)
- `GET /api/project-hub/projects/:projectId/qc-checklists/:checklistId` → single checklist with items
- `PATCH /api/project-hub/projects/:projectId/qc-checklists/:checklistId/items/:itemId` → update item result
- `POST /api/project-hub/projects/:projectId/qc-checklists/:checklistId/items` → add custom item
- `DELETE /api/project-hub/projects/:projectId/qc-checklists/:checklistId/items/:itemId` → remove item

**CSI Auto-Suggestion System:**
When a new checklist is created, the system suggests items based on the selected CSI division. The Admin module maintains a library of standard QC checklist items per CSI division (e.g., Division 03 Concrete includes: Formwork inspection, Rebar placement/spacing, Concrete mix design approval, Pour sequence, Curing plan). When the user selects a division, these items are pre-loaded and can be accepted, modified, or removed before saving.

**Checklists Landing Page:**
- Summary cards, one per checklist: Division | Name | Items | Pass% | Fail Count | Status
- "Add Checklist" button → opens `HbcModal` with: Checklist Name (text), CSI Division (HbcSelect from division list), then shows auto-suggested items with checkboxes to include/exclude.
- Items with `Fail` results are highlighted in the summary cards with a count badge.

**Checklist Detail Page:**
Route: `/project-hub/:projectId/quality-control/checklists/:checklistId`

- Item list: Item Text | Result (HbcSelect: Pass/Fail/N/A/Pending) | Completed By | Date | Notes | Photos
- Inline result update → auto-saves on change.
- Photo attachment: clicking the camera icon opens a file picker to attach images to the item.
- "Add Custom Item" button appends a new row with an editable item text field.
- "Delete Item" available for custom items only (auto-suggested items cannot be deleted, only set to N/A).
- Summary bar: X Pass / Y Fail / Z Pending — the critical metric from the Dashpivot gap analysis is that **"No" (Fail) responses must be trackable and reportable** — this is a core design requirement.

---

## 7.7.2 — QC Completion Page

Route: `/project-hub/:projectId/quality-control/completion`

Phase 1: Completion summary with Third-Party Inspection coordination.

**API:**
- `GET /api/project-hub/projects/:projectId/qc-completion-summary` → `IQcCompletionSummary`
- `GET /api/project-hub/projects/:projectId/third-party-inspections` → `IThirdPartyInspection[]`
- `POST /api/project-hub/projects/:projectId/third-party-inspections` → add inspection record
- `PATCH /api/project-hub/projects/:projectId/third-party-inspections/:inspectionId` → update

```typescript
// packages/models/src/project-hub/IQualityControl.ts (add)
export interface IQcCompletionSummary {
  projectId: string;
  totalChecklists: number;
  completedChecklists: number;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  openFailedItems: number; // failed items with no corrective action note
  naItems: number;
  overallPassRate: number; // 0–100
  checklistBreakdown: Array<{
    checklistId: string;
    checklistName: string;
    csiDivision: string;
    passCount: number;
    failCount: number;
    naCount: number;
    pendingCount: number;
  }>;
}
```

**Completion Summary tab:**
- Progress bar: "Overall QC Pass Rate: X%"
- Checklist completion table from `checklistBreakdown` with color-coded fail counts.
- Alert banner if `openFailedItems > 0`: "X items have failed with no corrective action documented."

**Third-Party Inspections tab:**
Table: Inspection Type | Inspector | Company | Date | Result | Report | Notes | Actions
- "Add Inspection" button → modal with fields: Inspection Type (text), Inspector Name (text), Company (text), Inspection Date (date), Result (HbcSelect: Pass/Fail/N/A/Pending), Report Upload (PDF), Notes.
- Result badges: Pass (green), Fail (red), N/A (gray), Pending (yellow).
- Report column: clickable link if file attached.

---

## 7.7.3 — Phase 2 Collaborative Workflow (Documented Vision)

Add the following comment block to the QC Checklists service file:

```typescript
/*
 * PHASE 2 — Collaborative QC Workflow (Dashpivot/Sitemate Replacement)
 *
 * The long-term objective is to replace Dashpivot/Sitemate with a native
 * HB Intel QC tool that supports:
 *
 * - Multi-party collaborative checklist completion (multiple users completing
 *   different items simultaneously on a shared checklist)
 * - Assignment of specific checklist items to specific team members or subcontractors
 * - Mobile-first item completion with photo capture
 * - Procore Observations-style workflow: create observation → assign → resolve → close
 * - Critical missing capability vs. Dashpivot: REPORTING ON "NO" (FAIL) RESPONSES.
 *   The system must support querying and reporting on all failed items across projects,
 *   by division, by inspector, and by date range. This was the primary gap identified
 *   in the Dashpivot Analytics evaluation (2026-03-07).
 * - Aggregated QC analytics dashboard (cross-project, for QC Manager role)
 * - Automated corrective action workflow: Fail item → assign corrective action → re-inspect
 *
 * Phase 2 build is gated on product-owner sign-off after Phase 1 is live and validated.
 */
```

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Add a checklist for CSI Division 03:
# → Verify auto-suggested items load
# → Accept all items, save checklist
# → Set 3 items to Pass, 1 to Fail, 1 to N/A
# → Verify Pass Rate updates correctly
# → Verify Fail item count shows in checklist summary card

# Third-Party Inspections:
# → Add an inspection with result = Fail
# → Verify table shows red Fail badge
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.8 — Warranty Module
-->
