# PH7.4 — Project Hub: Preconstruction Module

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Build all five preconstruction pages: Go/No-Go (read-only BD feed), Kickoff Checklist (read/write Estimators, read-only Operations), Estimate Panel (read-only), Turnover to Ops (4-party digital sign-off), and Post-Bid Autopsy (read/write Estimators, read-only Operations).
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A complete preconstruction section where cross-module data flows correctly from Business Development and Estimating into the Project Hub, and where the Turnover to Ops sign-off provides a permanent digital record of project handoff.

---

## Prerequisites

- PH7.1, PH7.2, PH7.3 complete.
- Estimating module complete (`PH7-Estimating-Feature-Plan.md`) — Kickoff and Autopsy data lives in Estimating SharePoint lists.
- BD module Go/No-Go feature must exist (may be stubbed for now with mock data).
- Role determination available via `useCurrentUser().role`.

---

## 7.4.1 — Role-Access Rule (Enforced Across All Preconstruction Pages)

```typescript
// apps/project-hub/src/hooks/usePreconAccess.ts

import { useCurrentUser } from '@hbc/auth';

export type PreconAccess = 'readWrite' | 'readOnly' | 'hidden';

const ESTIMATING_ROLES = ['EstimatingCoordinator', 'EstimatingManager', 'Admin'];
const OPERATIONS_ROLES = ['ProjectManager', 'Superintendent', 'ProjectExecutive', 'OperationalExcellence'];

export function usePreconAccess(): PreconAccess {
  const { role } = useCurrentUser();
  if (ESTIMATING_ROLES.includes(role)) return 'readWrite';
  if (OPERATIONS_ROLES.includes(role)) return 'readOnly';
  return 'hidden';
}
```

**Turnover to Ops** is an exception: all 4 signing parties have write access for their own signature field only.

---

## 7.4.2 — Go/No-Go View Page

Route: `/project-hub/:projectId/preconstruction/go-no-go`

This page displays the read-only Business Development Go/No-Go scorecard record for the current project.

**API:** `GET /api/project-hub/projects/:projectId/go-no-go` → returns `IGoNoGoView | null`

**Component requirements:**
- If no Go/No-Go record exists: show informational empty state — "Go/No-Go scorecard not yet completed. This is managed in the Business Development module."
- If record exists, display:
  - Decision badge: `HbcStatusBadge` in green ("Go"), red ("No-Go"), or orange ("Conditional")
  - Total score and max score with progress bar
  - Decision made by + date
  - Category breakdown table: Category | Score | Max Score | % (rendered as `HbcDataTable`)
  - Notes field (read-only)
- "View in BD Module" deep link button (navigates to BD module for that project)
- No edit controls of any kind — this page is always read-only

---

## 7.4.3 — Kickoff Checklist Page

Route: `/project-hub/:projectId/preconstruction/kickoff`

The kickoff checklist items are owned by the Estimating module. The Project Hub renders the same data with role-appropriate access controls.

**API:**
- `GET /api/project-hub/projects/:projectId/kickoff-checklist` → `IKickoffChecklistItem[]`
- `PATCH /api/project-hub/projects/:projectId/kickoff-checklist/:itemId` → updates `status`, `notes` (Estimating roles only)

**Component requirements:**
- Render items grouped by `category` using collapsible `HbcCard` sections.
- Each item row: Category | Item Text | Status dropdown | Completed By | Completed At | Notes
- For read-only (Operations role): all fields rendered as display text; no dropdowns or inputs.
- For read/write (Estimating roles): `status` is an `HbcSelect` (NotStarted / InProgress / Complete / NA); `notes` is an `HbcTextField`.
- Progress summary header: "X of Y items complete (Z%)" with a progress bar.
- Items with `status = 'Complete'` are visually de-emphasized (muted text, checkmark icon).
- Save is per-row (auto-save on blur or status change); no bulk save required.

---

## 7.4.4 — Estimate Panel Page

Route: `/project-hub/:projectId/preconstruction/estimate`

Read-only display of the estimate data associated with this project from the Estimating module.

**API:** `GET /api/project-hub/projects/:projectId/estimate-summary` → `IEstimateSummary`

```typescript
// packages/models/src/project-hub/IPreconstruction.ts (add interface)
export interface IEstimateSummary {
  projectId: string;
  estimateType?: string;
  totalEstimateAmount?: number;
  gcGrAmount?: number;
  subcontractTotal?: number;
  contingencyAmount?: number;
  contingencyPercent?: number;
  submittedAt?: string;
  submittedByName?: string;
  lastUpdatedAt?: string;
  costCodeBreakdown?: Array<{
    csiDivision: string;
    description: string;
    amount: number;
  }>;
  notes?: string;
}
```

**Component requirements:**
- Header card: Estimate Type, Total Amount (bold, large), Submitted Date, Submitted By
- Cost Code Breakdown table: Division | Description | Amount | % of Total
- No edit controls — always read-only
- "View full estimate in Estimating module" deep link

---

## 7.4.5 — Turnover to Ops Page

Route: `/project-hub/:projectId/preconstruction/turnover`

The only preconstruction page where Operations roles have write access (for their own signature only).

**API:**
- `GET /api/project-hub/projects/:projectId/turnover` → `ITurnoverToOps`
- `PUT /api/project-hub/projects/:projectId/turnover` → full update (Estimating Coordinator only; narrative sections)
- `POST /api/project-hub/projects/:projectId/turnover/sign` → records a party's digital sign-off

**Component requirements:**

*Narrative Sections* (editable only by Estimating Coordinator role):
- Project Scope Narrative
- Owner Relationship Notes
- Budget Notes
- Schedule Notes
- Risk Notes
- Open Items / Action Items

Each narrative field is a multi-line `HbcTextField` for the Estimating Coordinator; rendered as styled read-only text for all other roles.

*4-Party Sign-Off Section* — rendered as a signature grid:

| Role | Name | Status | Signed At | Action |
|---|---|---|---|---|
| Estimating Coordinator | {name} | {badge} | {date} | [Sign] |
| Project Executive | {name} | {badge} | {date} | [Sign] |
| Project Manager | {name} | {badge} | {date} | [Sign] |
| Superintendent | {name} | {badge} | {date} | [Sign] |

- `[Sign]` button is visible only to the currently logged-in party whose row matches their UPN.
- Clicking `[Sign]` opens an `HbcConfirmDialog`: "By clicking Confirm, you acknowledge that you have reviewed and accept the Turnover to Operations document for {projectNumber} - {projectName}."
- Once all 4 parties have signed, a green "Turnover Complete" banner is displayed.
- Status badges: Pending (gray), Acknowledged (green), Declined (red).

---

## 7.4.6 — Post-Bid Autopsy Page

Route: `/project-hub/:projectId/preconstruction/autopsy`

**API:** `GET /api/project-hub/projects/:projectId/autopsy` → `IPostBidAutopsy | null`

**Component requirements:**
- If no autopsy exists: empty state — "Post-Bid Autopsy not yet completed. This is managed in the Estimating module."
- If record exists, display all autopsy fields as read-only for Operations roles.
- Estimating roles see an "Edit in Estimating Module" button that deep-links to the Estimating module autopsy page.
- Key financial fields (bid amount, next lowest, spread) rendered in a summary card with difference calculated and highlighted.
- Narrative fields (what went well, improvement areas, lessons learned) displayed in styled read-only text blocks.

---

## Verification

```bash
pnpm turbo run build --filter=project-hub

# Test role-based access:
# Login as EstimatingCoordinator → all 5 pages accessible, Kickoff/Autopsy are read/write
# Login as ProjectManager → all 5 pages accessible, Kickoff/Autopsy are read-only
# Login as Superintendent → Turnover page shows [Sign] button for Superintendent row only

# Test Turnover sign-off:
# All 4 parties sign → "Turnover Complete" banner appears
# Attempting to sign as a different user → [Sign] button not shown
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Next: PH7.5 — Project Management Module
-->
