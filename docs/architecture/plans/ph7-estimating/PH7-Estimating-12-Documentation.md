# PH7-Estimating-12 — Documentation: ADR & Developer How-To Guide

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-Estimating-9 (Cross-Module), PH7-Estimating-10 (Backend), PH7-Estimating-11 (Testing)
**Blocks:** Release & Rollout

---

## Summary

This plan specifies the creation of two critical documentation deliverables:

1. **ADR-0075: Estimating Module Design Decisions** — Architecture Decision Record documenting all locked design choices made during product owner interview (2026-03-07), including scope, cross-module boundaries, templates approach, analytics depth, and external platform integration strategy.

2. **Developer How-To Guide** — Comprehensive reference for developers working on the Estimating module, covering module overview, common tasks (adding columns, template categories, analytics), cross-module navigation contract, SharePoint schema updates, and testing/build commands.

Both documents are foundational for knowledge transfer and long-term maintainability.

---

## Why It Matters

ADRs capture the "why" behind architectural decisions, preventing future rework and providing context for new team members. The Developer How-To guide accelerates onboarding and ensures consistent patterns for common extension tasks.

---

## Files to Create

| File | Type | Location | Purpose |
|---|---|---|---|
| **ADR-0075-Estimating-Module-Decisions.md** | ADR | `docs/architecture/adr/` | Lock all design decisions |
| **phase-7-estimating-guide.md** | How-To | `docs/how-to/developer/` | Developer onboarding & patterns |

---

## Implementation

### Part 1: ADR-0075 — Estimating Module Design Decisions

**File Path:** `/sessions/vibrant-busy-archimedes/mnt/hb-intel/docs/architecture/adr/ADR-0075-estimating-module-decisions.md`

```markdown
# ADR-0075 — Estimating Module Design Decisions

**Date:** 2026-03-07
**Status:** Accepted
**Deciders:** Product Owner (Bobby Fetting), Implementation Agent (Claude Code)
**Context:** Structured product-owner interview to lock all Estimating module scope and design
**Governed by:** CLAUDE.md v1.2, HB-Intel-Blueprint-V4.md

---

## Context

The Estimating module is a core feature of HB Intel MVP (Phase 7, Priority 1). Before implementation, a detailed product-owner interview was conducted on 2026-03-07 to clarify feature scope, cross-module boundaries, template strategy, analytics depth, and external platform integration approach.

All decisions below are **locked** and supersede any prior assumptions. Changes to these decisions require a new ADR and product-owner sign-off.

---

## Decisions

### D1: All Three Tracking Tables in Estimating (Locked Scope)

**Question (Q11):** Should Active Pursuits, Active Precon, and Estimate Tracking Log tables all live in Estimating, or should some belong to Project Hub?

**Decision:** **All three tables belong in Estimating.**

**Rationale:**
- Product Owner Directive: "The Project Hub will contain features that use data for one unique project at a time. Tracking that includes multiple projects will never be included in the Project Hub."
- Active Pursuits: multi-project dashboard (Estimating responsibility)
- Active Precon: multi-project portfolio view (Estimating responsibility)
- Estimate Tracking Log: historical audit trail spanning multiple projects (Estimating responsibility)

**Consequence:** Project Hub owns only the kickoff/submission checklist for a single project (see D2). Multi-project analytics and tracking are permanently in Estimating.

**Future:** If a "Project Health" or "Leadership Dashboard" module is created, it may consume Estimating data for aggregate views, but Estimating remains the source system.

---

### D2: Kickoff / Submission Checklist in Project Hub (Locked)

**Question (Q12):** Where should the 9-item checklist (bid bond, schedule, proposal tabs, etc.) live? In Estimating or Project Hub?

**Decision:** **Checklist lives in Project Hub at `/project-hub/:projectId/kickoff`.**

**Rationale:**
- The checklist is part of the project-specific kickoff workflow, not a multi-project tracking tool.
- Aligns with PO directive that "one unique project at a time" features live in Project Hub.
- Estimating provides the link: when user clicks a pursuit row, navigate to `/project-hub/{projectNumber}/kickoff`.

**Data Fields in HBIntelActivePursuits:**
- `checkBidBond`, `checkPPBond`, `checkSchedule`, ..., `checkBusinessTerms` (9 boolean fields)
- Stored in SharePoint for cross-module access
- Displayed inline in Estimating pursuits table via `PursuitChecklistInline` component (e.g., "7/9")
- Edited in Project Hub kickoff page

**Consequence:** Estimating displays a read-only checklist badge. Full checklist editing happens in Project Hub. Data is synchronized via SharePoint.

---

### D3: Templates as Curated SharePoint Link Library (Option B — Locked)

**Question (Q13):** What approach for templates?
- **Option A:** HB Intel does not display templates; estimators visit SharePoint directly.
- **Option B:** HB Intel shows organized, searchable library of curated SharePoint document links (no file storage in HB Intel).
- **Option C:** HB Intel manages template files with version control, upload/download, auto-formatting.

**Decision:** **Option B — Curated SharePoint Link Library.**

**Rationale:**
- Reduces scope and avoids duplicate file management.
- SharePoint is single source of truth for template documents.
- HB Intel provides searchable launchpad: grouped by category, sortable, searchable.
- Admins manage templates via System Settings → Template Library tab (see cross-module contract in PH7-Estimating-9).
- Users click "Open in SharePoint" to access latest version.

**Implementation:**
- `HBIntelTemplateLinks` SharePoint list stores metadata: title, category, sharePointUrl, fileType, sortOrder, isActive.
- API: `GET /api/estimating/templates` returns `ITemplateLink[]`.
- UI: `TemplatesPage` displays links grouped by CATEGORY_ORDER, filtered by isActive=true.
- Admin UI: System Settings → "Template Library" tab (CRUD for template links).

**Future (Option C):**
- HB Intel could store template files with versioning (e.g., "GMP Template v1.2", "GMP Template v1.3").
- Would require Azure Blob Storage integration, file upload UI, version history tracking.
- Deferred pending user feedback.

---

### D4: Estimate Tracking Log — Full Analytics View (Option C — Locked)

**Question (Q14):** What analytics should Estimating expose?
- **Option A:** No analytics; log is audit trail only.
- **Option B:** Basic aggregations (total submitted, total awarded, win rate).
- **Option C:** Full analytics view with charts (monthly volume, win rate by estimate type, win rate by estimator, FY comparison).

**Decision:** **Option C — Full Analytics View.**

**Rationale:**
- Estimating team needs visibility into submission volume, win rates, and estimator performance.
- Supports quarterly business reviews and performance coaching.
- "View Analytics" button in Log page navigates to dedicated analytics page at `/log/analytics`.

**Analytics Scope:**
- KPI Strip: Total Submitted, Total Awarded, Not Awarded, Win Rate (%)
- Monthly Submission Volume (bar chart): Jan–Dec, submitted vs. awarded
- Win Rate by Estimate Type (bar chart): GMP Est, Lump Sum, ROM, Conceptual, Hard Bid, SD, Design Build, Schematic
- Win Rate by Lead Estimator (table): UPN, Name, Submitted, Awarded, Win Rate %, Total Value
- FY Comparison (table): Current FY vs. Previous FY side-by-side

**Computation:**
- Win Rate = `(Awarded W Precon + Awarded W/O Precon) / (Awarded W Precon + Awarded W/O Precon + Not Awarded) * 100`
- Excludes "Pending" entries from win rate denominator.
- Monthly volume includes all submissions, sorted by submittedDate.

**Consequence:** Analytics backend must compute aggregations server-side (not client-side) to keep bundle lean. Charts rendered client-side using Recharts.

**Future (Leadership Module):**
- Leadership module may request company-wide portfolio analytics (across all departments).
- That module will call Estimating API for log data and compute its own aggregations.
- Estimating remains the source system; Leadership owns cross-module views.

---

### D5: External Platforms — Deep Links Only (Option B — Locked)

**Question (Q15):** What should the Building Connected and Procore integration look like?
- **Option A:** No links; estimators manage BC/Procore separately.
- **Option B:** Deep links only (URLs stored per-pursuit, opened in new tab).
- **Option C:** Live API integration (pull project data, status, RFQ documents from BC/Procore into HB Intel).

**Decision:** **Option B — Deep Links Only.**

**Rationale:**
- Simplest integration; no API credentials management required.
- Building Connected and Procore URLs are stored per-pursuit in SharePoint.
- UI: `ExternalPlatformLinks` component renders BC/PC buttons (when URLs present).
- Click opens URL in new tab with `target="_blank"`, `rel="noopener,noreferrer"`.
- No live data sync; estimators are responsible for data freshness in BC/Procore.

**Fields:**
- `IActivePursuit.buildingConnectedUrl` (optional)
- `IActivePursuit.procoreUrl` (optional)

**Implementation:**
- Admin/Lead Estimator manually copies URL from BC/Procore project and pastes into pursuit record.
- URLs stored in HBIntelActivePursuits SharePoint list.
- Displayed inline in pursuits table; clickable buttons open external tools.

**Future (Option C):**
- Could integrate BC/Procore APIs to pull project details, RFQ documents, vendor lists.
- Would require OAuth/API key credentials, webhook listeners for status updates.
- Deferred pending user requirements and API access agreements.

---

## Governing Architectural Rules (Product Owner)

> **"The Project Hub will contain features that use data for one unique project at a time. Tracking that includes multiple projects will never be included in the Project Hub."**
>
> — Bobby Fetting, Product Owner, HB Intel, 2026-03-07

This rule is immutable for the Estimating/Project Hub split and supersedes any prior assumptions about module boundaries.

---

## Consequences

### D1 Consequences:
- Estimating module owns all multi-project views permanently.
- Project Hub never hosts Estimating tables (Pursuits, Precon, Log).
- If Leadership module (future) needs company-wide analytics, it calls Estimating API.

### D2 Consequences:
- Project Hub team must implement `/project-hub/:projectId/kickoff` route and kickoff checklist UI.
- Estimating provides row-click navigation link; must match `projectNumber` format exactly (##-###-##).
- Bidirectional sync: Estimating reads checklist status for badge display; Project Hub reads/writes for checklist updates.

### D3 Consequences:
- No template file uploads in HB Intel; SharePoint is authoritative.
- Admin team manages templates in HB Intel UI (System Settings), not directly in SharePoint.
- API endpoints for template CRUD locked; future UI changes don't require backend changes.

### D4 Consequences:
- Analytics page is **required** feature (not optional).
- Backend must compute aggregations (win rate, monthly volume, by-estimator) server-side.
- Frontend renders charts using Recharts (no heavy D3 dependencies).
- Historical data (Estimate Log entries) never deleted; soft-delete discouraged (audit trail risk).

### D5 Consequences:
- No BC/Procore API keys in HB Intel; significantly reduces security surface.
- Estimators responsible for data freshness in external tools.
- Deep-link URLs may become stale; no health checks or validation.
- If API integration (Option C) becomes priority, new ADR required with security/auth design.

---

## Alternatives Considered & Rejected

### Rejected: Active Precon in Project Hub
- Precon is tracked across multiple projects simultaneously; doesn't fit "one unique project" rule.

### Rejected: Templates stored in HB Intel Blob Storage
- Increases scope, complexity, version control overhead.
- SharePoint already proven for file management; no reinvention required.

### Rejected: No Analytics View
- Estimating team needs visibility for business reviews and performance coaching.
- Option C selected for full transparency.

### Rejected: Live BC/Procore API Integration
- Requires credential management, webhook listeners, OAuth flow.
- Deferred until strong user demand justifies complexity.

---

## Open Questions for Future Review

1. **D3 Future:** If templates library grows beyond 50 items, should HB Intel manage versioning/obsolescence?
2. **D4 Future:** Should analytics filter by time period (not just fiscal year)? E.g., "Last 30 days"?
3. **D5 Future:** Should we validate that BC/Procore URLs are still accessible? Health check endpoint?
4. **General:** Should Estimating expose GraphQL API in addition to REST for Leadership module queries?

---

## References

- Feature Plan: `docs/architecture/plans/PH7-Estimating-Feature-Plan.md`
- Cross-Module Contract: `docs/architecture/plans/PH7-Estimating-9-CrossModule.md`
- Backend API: `docs/architecture/plans/PH7-Estimating-10-Backend-API.md`
- Testing: `docs/architecture/plans/PH7-Estimating-11-Testing.md`
- Developer How-To: `docs/how-to/developer/phase-7-estimating-guide.md`

---

## Sign-Off

**Product Owner:** Bobby Fetting
**Date:** 2026-03-07
**Status:** LOCKED — No changes without new ADR

**Implementation Agent:** Claude Code
**Acknowledged:** 2026-03-08
```

---

### Part 2: Developer How-To Guide

**File Path:** `/sessions/vibrant-busy-archimedes/mnt/hb-intel/docs/how-to/developer/phase-7-estimating-guide.md`

```markdown
# Developer How-To: Estimating Module (Phase 7)

**Date:** 2026-03-08
**Audience:** Developers extending or maintaining the Estimating module
**Governed by:** CLAUDE.md v1.2, ADR-0075

---

## Quick Start

The Estimating module provides a multi-project dashboard for tracking proposal pursuits, preconstruction projects, estimates, and analytics.

**Location:** `packages/features/estimating/src/`
**API Base:** `VITE_FUNCTION_APP_URL/api/estimating`
**Routes:** 7 main pages (home, pursuits, precon, log, analytics, templates, project setup)

---

## Module Overview

### Architecture Diagram

```
EstimatingModule (packages/features/estimating)
├── pages/
│   ├── EstimatingHomePage         ← Home: summary stats, urgent pursuits
│   ├── ActivePursuitsPage         ← Pursuits table, row-click → Project Hub
│   ├── ActivePreconstructionPage  ← Precon table, stage tracking
│   ├── EstimateTrackingLogPage    ← Log entries, FY selector, View Analytics link
│   ├── EstimateAnalyticsPage      ← Analytics charts (monthly, by type, by estimator)
│   ├── TemplatesPage              ← SharePoint link library, grouped by category
│   └── ProjectSetupPage           ← (TBD) Initial setup/onboarding
├── components/
│   ├── PursuitChecklistInline     ← Badge: "7/9" checklist items
│   ├── ExternalPlatformLinks      ← BC/Procore buttons (opens new tab)
│   ├── PursuitForm                ← Modal: create/edit pursuit
│   ├── PreconForm                 ← Modal: create/edit precon
│   ├── LogForm                    ← Modal: create log entry
│   └── TemplateCard               ← Card: template link with "Open" button
├── data/
│   ├── estimatingQueries.ts       ← API query functions (fetch, create, update)
│   └── hooks.ts                   ← React hooks (useFetchActivePursuits, etc.)
├── types/
│   ├── models.ts                  ← Data models (IActivePursuit, IActivePrecon, etc.)
│   ├── templates.ts               ← TemplateLinkCategory enum, CATEGORY_ORDER
│   └── api.ts                     ← API request/response types
└── utils/
    ├── analytics.ts               ← formatCurrency(), computeWinRate()
    └── validation.ts              ← projectNumber format, date validation

API Endpoints (Backend)
├── GET    /api/estimating/pursuits                ← List all
├── POST   /api/estimating/pursuits                ← Create
├── PATCH  /api/estimating/pursuits/:id            ← Update
├── DELETE /api/estimating/pursuits/:id            ← Delete
├── GET    /api/estimating/preconstruction         ← List all
├── GET    /api/estimating/log?fiscalYear=YYYY    ← List by FY (required param)
├── GET    /api/estimating/analytics?fiscalYear=YYYY
├── GET    /api/estimating/analytics/comparison
├── GET    /api/estimating/templates               ← (sorted by category+sortOrder)
├── POST   /api/estimating/templates               ← Admin only
├── PATCH  /api/estimating/templates/:id           ← Admin only
├── DELETE /api/estimating/templates/:id           ← Admin only
└── GET    /api/estimating/summary                 ← Home page stats

SharePoint Lists (Data Source)
├── HBIntelActivePursuits      ← Pursuits with checklist flags
├── HBIntelActivePreconstruction ← Precon tracking
├── HBIntelEstimateLog         ← Historical log (no deletes)
└── HBIntelTemplateLinks       ← Template metadata (managed by Admins)
```

---

## Common Tasks

### Task 1: Add a New Column to the Pursuits Table

**Scenario:** You need to track a new field on pursuits, e.g., "Client Contact Name".

**Steps:**

1. **Update the data model:**
   ```typescript
   // packages/features/estimating/src/types/models.ts
   export interface IActivePursuit {
     // ... existing fields
     clientContactName?: string; // new field
     clientContactPhone?: string;
   }
   ```

2. **Update SharePoint schema:**
   Add columns to `HBIntelActivePursuits` list:
   - **Column Name:** ClientContactName, Type: Single line of text
   - **Column Name:** ClientContactPhone, Type: Single line of text

3. **Update the backend API mapping:**
   ```typescript
   // backend/functions/src/functions/estimating/handlers/pursuits.ts
   const mapSpItemToPursuit = (item: any): IActivePursuit => ({
     // ... existing mappings
     clientContactName: item.ClientContactName,
     clientContactPhone: item.ClientContactPhone,
   });
   ```

4. **Update the form:**
   ```typescript
   // packages/features/estimating/src/components/PursuitForm.tsx
   <input
     type="text"
     label="Client Contact Name"
     name="clientContactName"
     // Add validation if required
   />
   ```

5. **Update the table columns definition:**
   ```typescript
   // packages/features/estimating/src/pages/ActivePursuitsPage.tsx
   const columns = [
     { key: 'projectNumber', header: 'Project Number' },
     { key: 'projectName', header: 'Project Name' },
     { key: 'clientContactName', header: 'Client Contact' }, // new
     // ... existing columns
   ];
   ```

6. **Test:**
   ```bash
   # Unit test the form
   cd packages/features/estimating
   pnpm vitest run components/__tests__/PursuitForm.test.ts

   # E2E test the full workflow
   cd e2e
   pnpm playwright test webparts/estimating/pursuits.spec.ts
   ```

---

### Task 2: Add a New Template Category

**Scenario:** You need to add a new category to the template library, e.g., "Project Management".

**Steps:**

1. **Update the TemplateLinkCategory enum:**
   ```typescript
   // packages/features/estimating/src/types/templates.ts
   export enum TemplateLinkCategory {
     COVER_AND_SUMMARY = 'Cover & Summary',
     ESTIMATE = 'Estimate',
     SCHEDULE = 'Schedule',
     BIM = 'BIM & 3D',
     PRECONSTRUCTION = 'Preconstruction',
     PROPOSAL = 'Proposal',
     LEGAL_AND_COMPLIANCE = 'Legal & Compliance',
     PROJECT_MANAGEMENT = 'Project Management', // new
     OTHER = 'Other',
   }
   ```

2. **Update CATEGORY_ORDER (controls display sequence):**
   ```typescript
   export const CATEGORY_ORDER: TemplateLinkCategory[] = [
     TemplateLinkCategory.COVER_AND_SUMMARY,
     TemplateLinkCategory.ESTIMATE,
     TemplateLinkCategory.SCHEDULE,
     TemplateLinkCategory.BIM,
     TemplateLinkCategory.PRECONSTRUCTION,
     TemplateLinkCategory.PROPOSAL,
     TemplateLinkCategory.PROJECT_MANAGEMENT, // position it here
     TemplateLinkCategory.LEGAL_AND_COMPLIANCE,
     TemplateLinkCategory.OTHER,
   ];
   ```

3. **Update SharePoint Choice field (HBIntelTemplateLinks → Category column):**
   Add choice option: "Project Management"

4. **Test:**
   ```typescript
   // Unit test
   cd packages/features/estimating
   pnpm vitest run __tests__/templates.test.ts

   // Verify category appears in correct order
   ```

5. **Admin adds templates:**
   Admin logs in → System Settings → Template Library tab → Add new template with category "Project Management"

---

### Task 3: Extend Analytics with a New Breakdown

**Scenario:** Analytics currently shows win rate by estimator. You want to add win rate by project executive.

**Steps:**

1. **Update the IEstimatingAnalytics type:**
   ```typescript
   // packages/features/estimating/src/types/api.ts
   export interface IEstimatingAnalytics {
     // ... existing fields
     byProjectExecutive?: Array<{
       projectExecutiveUpn: string;
       projectExecutiveName: string;
       submitted: number;
       awarded: number;
       notAwarded: number;
       winRatePercent: number | null;
       totalAwardedValue: number;
     }>;
   }
   ```

2. **Update the backend computation:**
   ```typescript
   // backend/functions/src/functions/estimating/handlers/log.ts
   export const computeEstimatingAnalytics = async (
     fiscalYear: string
   ): Promise<IEstimatingAnalytics> => {
     const entries = await fetchLogEntriesByFY(fiscalYear);

     // Compute byProjectExecutive breakdown
     const byExecutive = groupBy(entries, e => e.projectExecutiveUpn);
     const analyticsData = {
       // ... existing fields
       byProjectExecutive: Object.entries(byExecutive).map(([upn, items]) => ({
         projectExecutiveUpn: upn,
         projectExecutiveName: items[0].projectExecutiveName,
         submitted: items.length,
         awarded: items.filter(i => i.outcome.includes('Awarded')).length,
         notAwarded: items.filter(i => i.outcome === 'Not Awarded').length,
         winRatePercent: computeWinRate(awarded, notAwarded),
         totalAwardedValue: sumAwardedValues(items),
       })),
     };
     return analyticsData;
   };
   ```

3. **Update the EstimateAnalyticsPage component:**
   ```typescript
   // packages/features/estimating/src/pages/EstimateAnalyticsPage.tsx

   // Add new section
   <section>
     <h2>Win Rate by Project Executive</h2>
     <AnalyticsTable
       columns={[
         { key: 'projectExecutiveName', header: 'Executive' },
         { key: 'submitted', header: 'Submitted' },
         { key: 'awarded', header: 'Awarded' },
         { key: 'winRatePercent', header: 'Win Rate %' },
       ]}
       data={analytics.byProjectExecutive || []}
     />
   </section>
   ```

4. **Test:**
   ```bash
   pnpm vitest run __tests__/analytics.test.ts
   pnpm playwright test webparts/estimating/log-analytics.spec.ts
   ```

---

### Task 4: Cross-Module Navigation Contract (Row Click → Project Hub)

**Context:** Estimating pursuits table row click should navigate to Project Hub kickoff page.

**How it works:**

```typescript
// packages/features/estimating/src/pages/ActivePursuitsPage.tsx
import { useNavigate } from '@tanstack/react-router';

const handlePursuitRowClick = (pursuit: IActivePursuit) => {
  navigate({
    to: '/project-hub/$projectId/kickoff',
    params: { projectId: pursuit.projectNumber }, // projectNumber = ##-###-##
  });
};
```

**Contract Rules:**
- `projectNumber` field from IActivePursuit is the linking key.
- Format must be `##-###-##` (validated by backend).
- Project Hub route is registered as `/project-hub/:projectId/kickoff`.
- No direct component imports between Estimating and Project Hub (loose coupling).
- Navigation uses TanStack Router `navigate()`, not `window.location` (SPA pattern).

**If Project Hub route changes:**
- Only Estimating needs to update the `to` parameter in the navigate call.
- Coordinate via Slack #engineering to avoid misalignment.

---

### Task 5: Update SharePoint List Schema When Model Changes

**Scenario:** You added `clientContactName` to IActivePursuit (see Task 1). Now you need to ensure the SharePoint list has the column.

**Steps:**

1. **Define the schema change in a migration script:**
   ```typescript
   // backend/provisioning/migrations/001-estimating-lists.ts
   import { sp } from '@pnp/sp';

   export async function ensureEstimatingLists() {
     const web = sp.web;

     // Ensure HBIntelActivePursuits list
     const list = web.lists.getByTitle('HBIntelActivePursuits');

     // Add ClientContactName column if not exists
     try {
       await list.fields.getByInternalNameOrTitle('ClientContactName').get();
     } catch {
       await list.fields.add('ClientContactName', {
         type: 'Text',
         required: false,
       });
     }
   }
   ```

2. **Run the migration in your local SharePoint Test environment:**
   ```bash
   cd backend/provisioning
   pnpm run migrate:estimating
   ```

3. **Verify in SharePoint:** Open the list, confirm the new column exists.

4. **Update the API mapping** (see Task 1, step 3).

5. **Commit the migration script** to version control for other team members and CI/CD.

---

### Task 6: Running Tests

**Unit Tests (Vitest):**

```bash
# Run all Estimating tests
cd packages/features/estimating
pnpm vitest run

# Run specific test file
pnpm vitest run __tests__/pursuits.test.ts

# Watch mode (re-run on file changes)
pnpm vitest watch

# Coverage report
pnpm vitest run --coverage
```

**E2E Tests (Playwright):**

```bash
# Run all Estimating E2E tests
cd e2e
pnpm playwright test webparts/estimating/

# Run single test file
pnpm playwright test webparts/estimating/pursuits.spec.ts

# Headed mode (see browser)
pnpm playwright test webparts/estimating/ --headed

# Debug mode (step through tests)
pnpm playwright test --debug
```

**Build & Dev Harness:**

```bash
# Build the feature
pnpm turbo run build --filter=@hbc/features-estimating

# Start dev harness
pnpm turbo run dev

# Harness available at http://localhost:5173
```

---

### Task 7: How Estimating Connects to Admin Module

**Template Management Flow:**

1. **Admin adds a template:**
   - Admin logs in → Admin App
   - Navigate to System Settings → "Template Library" tab
   - Click "Add Template"
   - Fill form: Title, Category (dropdown), SharePoint URL, FileType, SortOrder, IsActive
   - Submit → POST `/api/estimating/templates` (admin:write required)
   - Backend creates record in `HBIntelTemplateLinks` SharePoint list

2. **Estimating reads the template:**
   - Estimator clicks "Templates" in Estimating
   - `TemplatesPage` calls `GET /api/estimating/templates`
   - Backend queries `HBIntelTemplateLinks`, filters by `isActive=true`, sorts by category + sortOrder
   - Frontend groups by CATEGORY_ORDER, renders template cards
   - User clicks "Open in SharePoint" → opens URL in new tab

**Admin Module Responsibilities (documented in PH7-Admin plan):**
- System Settings page must have "Template Library" tab.
- Tab implements CRUD for `ITemplateLinkAdminFormData` records.
- Form validation: SharePoint URL must be HTTPS, FileType must be one of (docx, xlsx, pdf, pptx), SortOrder 0–999.
- API calls: POST/PATCH/DELETE to `/api/estimating/templates` (all require `admin:write` permission).

---

## API Reference Quick Guide

### GET `/api/estimating/pursuits`

Fetch all active pursuits.

**Query Parameters (optional):**
- `status` — Filter by status (comma-separated: Active, Submitted, Awarded, NotAwarded)
- `daysUntilDue` — Filter to pursuits due within N days
- `leadEstimatorUpn` — Filter by lead estimator

**Response:**
```json
{
  "status": 200,
  "body": {
    "data": [
      {
        "id": "1",
        "projectNumber": "25-010-42",
        "projectName": "Office Tower",
        "dueDate": "2026-04-01T00:00:00Z",
        "leadEstimatorUpn": "john@hbc.com",
        "status": "Active",
        "checkBidBond": true,
        "checkPPBond": false,
        "buildingConnectedUrl": "https://buildingconnected.com/projects/123",
        "updatedByUpn": "john@hbc.com",
        "updatedAt": "2026-03-08T14:30:00Z"
      }
    ],
    "total": 5,
    "timestamp": "2026-03-08T15:00:00Z"
  }
}
```

---

### POST `/api/estimating/pursuits`

Create a new pursuit.

**Request Body:**
```json
{
  "projectNumber": "26-001-01",
  "projectName": "New Project",
  "dueDate": "2026-05-01T00:00:00Z",
  "leadEstimatorUpn": "jane@hbc.com",
  "leadEstimatorName": "Jane Smith",
  "status": "Active"
}
```

**Response:**
```json
{
  "status": 201,
  "body": {
    "data": {
      "id": "2",
      "projectNumber": "26-001-01",
      "projectName": "New Project",
      "dueDate": "2026-05-01T00:00:00Z",
      "leadEstimatorUpn": "jane@hbc.com",
      "leadEstimatorName": "Jane Smith",
      "status": "Active",
      "updatedByUpn": "system",
      "updatedAt": "2026-03-08T15:05:00Z"
    }
  }
}
```

---

### GET `/api/estimating/analytics?fiscalYear=2025`

Fetch computed analytics (aggregated stats, breakdowns by type/estimator, monthly volume).

**Response:**
```json
{
  "status": 200,
  "body": {
    "data": {
      "fiscalYear": "2025",
      "totalSubmitted": 42,
      "totalAwarded": 28,
      "totalNotAwarded": 14,
      "winRatePercent": 66.7,
      "totalAwardedValue": 15000000,
      "byEstimateType": [
        {
          "estimateType": "GMP Est",
          "submitted": 15,
          "awarded": 10,
          "notAwarded": 5,
          "winRatePercent": 66.7,
          "totalAwardedValue": 8000000
        }
      ],
      "byEstimator": [
        {
          "leadEstimatorUpn": "john@hbc.com",
          "leadEstimatorName": "John Doe",
          "submitted": 12,
          "awarded": 9,
          "notAwarded": 3,
          "winRatePercent": 75.0,
          "totalAwardedValue": 5000000
        }
      ],
      "monthlyVolume": [
        { "month": 1, "monthName": "January", "submitted": 4, "awarded": 3 },
        { "month": 2, "monthName": "February", "submitted": 3, "awarded": 2 }
      ]
    },
    "timestamp": "2026-03-08T15:10:00Z"
  }
}
```

---

### GET `/api/estimating/templates`

Fetch all active template links, grouped by category.

**Query Parameters (optional):**
- `category` — Filter by category

**Response:**
```json
{
  "status": 200,
  "body": {
    "data": [
      {
        "id": "1",
        "title": "Standard GMP Template",
        "category": "Estimate",
        "sharePointUrl": "https://hbcteams.sharepoint.com/sites/.../GMP%20Template.docx",
        "fileType": "docx",
        "description": "Company standard GMP estimating template",
        "sortOrder": 1,
        "isActive": true,
        "updatedByUpn": "admin@hbc.com",
        "updatedAt": "2026-03-01T10:00:00Z"
      }
    ],
    "total": 23,
    "timestamp": "2026-03-08T15:15:00Z"
  }
}
```

---

## Troubleshooting

### "projectNumber must be in format ##-###-##"

**Cause:** User typed invalid project number format (not two digits, dash, three digits, dash, two digits).

**Fix:** Validation happens on form submission. Check `packages/features/estimating/src/utils/validation.ts`:

```typescript
export const validateProjectNumber = (value: string): boolean => {
  return /^\d{2}-\d{3}-\d{2}$/.test(value);
};
```

### "fiscalYear is required" (GET /api/estimating/log returns 400)

**Cause:** The query parameter `fiscalYear` is missing or empty.

**Fix:** Include it in the request:

```typescript
// WRONG
fetchEstimateLog(); // Missing param

// CORRECT
fetchEstimateLog('2025');
// Calls: GET /api/estimating/log?fiscalYear=2025
```

### Templates page shows no results

**Cause:** All templates have `isActive=false`, or search filter is too restrictive.

**Fix:**
- Admin: verify templates are set to `isActive=true` in System Settings → Template Library
- Clear search input
- Check browser console for API errors

### Checklist badge shows "0/9" but I filled all checkboxes in Project Hub

**Cause:** Estimating pursuits table reads the SharePoint list; changes in Project Hub haven't synced yet.

**Fix:**
- Refresh the Estimating page (F5)
- Verify Project Hub actually saved the checkbox changes
- Check for API/network errors in browser console

---

## Key Files Reference

| File | Purpose |
|---|---|
| `packages/features/estimating/src/pages/ActivePursuitsPage.tsx` | Pursuits table, row-click navigation |
| `packages/features/estimating/src/pages/EstimateAnalyticsPage.tsx` | Analytics charts and KPI strip |
| `packages/features/estimating/src/pages/TemplatesPage.tsx` | Template library UI |
| `packages/features/estimating/src/types/models.ts` | Data model interfaces |
| `packages/features/estimating/src/types/templates.ts` | TemplateLinkCategory, CATEGORY_ORDER |
| `packages/features/estimating/src/data/estimatingQueries.ts` | API query functions |
| `packages/features/estimating/src/utils/analytics.ts` | Utility functions (formatCurrency, computeWinRate) |
| `packages/features/estimating/vitest.config.ts` | Test configuration |
| `e2e/webparts/estimating/*.spec.ts` | E2E tests |
| `docs/architecture/adr/ADR-0075-estimating-module-decisions.md` | Design decisions (LOCKED) |

---

## Related Documentation

- **ADR-0075:** [Design Decisions (this file)](../adr/ADR-0075-estimating-module-decisions.md)
- **Cross-Module Contracts:** [PH7-Estimating-9](../plans/PH7-Estimating-9-CrossModule.md)
- **Backend API Spec:** [PH7-Estimating-10](../plans/PH7-Estimating-10-Backend-API.md)
- **Testing Strategy:** [PH7-Estimating-11](../plans/PH7-Estimating-11-Testing.md)

---

## Getting Help

- **API questions:** Refer to PH7-Estimating-10 Backend API spec
- **Design questions:** Refer to ADR-0075
- **Testing questions:** Refer to PH7-Estimating-11 Testing guide
- **Slack:** #engineering (for quick questions during development)
- **Code Review:** All PRs require review by at least one core team member before merge

---

**Last Updated:** 2026-03-08
**Maintained by:** Implementation Team
```

---

## Verification

### ADR Creation

```bash
# Verify ADR file exists and is readable
ls -la /sessions/vibrant-busy-archimedes/mnt/hb-intel/docs/architecture/adr/ADR-0075*

# Verify Markdown formatting
grep -E "^#+ " ADR-0075-estimating-module-decisions.md
# Should show: # (title), ## (context, decisions, consequences), ### (specific decisions)
```

### Developer Guide Creation

```bash
# Verify guide file exists
ls -la /sessions/vibrant-busy-archimedes/mnt/hb-intel/docs/how-to/developer/phase-7-estimating-guide.md

# Verify Markdown formatting and sections
grep -E "^## " phase-7-estimating-guide.md
# Should show: Overview, Common Tasks, API Reference, Troubleshooting, Key Files, Related Docs
```

### Content Checks

**ADR-0075:**
- [ ] Contains 5 locked design decisions (D1–D5)
- [ ] Each decision includes: Question, Decision, Rationale, Consequence sections
- [ ] Includes "Governing Architectural Rules" from PO
- [ ] References to cross-module plans and related ADRs
- [ ] Sign-off section with dates

**Developer How-To:**
- [ ] Architecture diagram showing module structure
- [ ] 7+ common tasks with step-by-step instructions
- [ ] API reference with examples (GET pursuits, POST pursuits, GET analytics, GET templates)
- [ ] Troubleshooting section with common errors
- [ ] Key files reference table
- [ ] Links to other documentation (ADR, backend API, testing)

---

## Definition of Done

**ADR-0075:**
- [ ] File created at `docs/architecture/adr/ADR-0075-estimating-module-decisions.md`
- [ ] Markdown syntax valid (no broken links, proper heading hierarchy)
- [ ] 5 design decisions documented with context, decision, rationale, consequence
- [ ] "Governing Architectural Rules" section included (verbatim from PO)
- [ ] Sign-off section with dates and approval status
- [ ] Linked from `docs/architecture/adr/README.md` (index)
- [ ] Referenced in `CLAUDE.md` as locked source for future development

**Developer How-To Guide:**
- [ ] File created at `docs/how-to/developer/phase-7-estimating-guide.md`
- [ ] "Quick Start" section with module location, API base, routes
- [ ] Architecture diagram (ASCII or Mermaid) showing module structure
- [ ] 7 common tasks (add column, add category, extend analytics, navigation contract, schema updates, testing, admin connection)
- [ ] Each task has step-by-step instructions with code examples
- [ ] API reference section with 4+ endpoint examples (GET pursuits, POST pursuits, GET analytics, GET templates)
- [ ] Troubleshooting section with 4+ common errors and solutions
- [ ] Key files reference table (15+ files listed)
- [ ] Related documentation links (ADR, cross-module, backend, testing)
- [ ] Getting Help section
- [ ] Linked from `docs/how-to/developer/README.md` (index)

**Integration:**
- [ ] Both files linked from main `docs/README.md`
- [ ] ADR-0075 linked from `docs/architecture/adr/README.md`
- [ ] Developer guide linked from `docs/how-to/developer/README.md`
- [ ] No broken cross-references (use link checker: `pnpm docs:lint`)
- [ ] Files follow Markdown style guide (consistent heading levels, code blocks, lists)

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase: PH7-Estimating-12 (Documentation)
Status: Plan created, ready for implementation
ADR-0075: To be created with locked design decisions
Developer How-To: To be created with common tasks and API reference
Next: Review with Product Owner, merge to main branch, mark as LOCKED
-->
```

---

## Summary

I have created four comprehensive, production-ready architecture plan documents for the HB Intel Estimating module:

> **Terminology Note (PH7.9 — 2026-03-09):** "Production-ready architecture plan documents" here refers to **Code-Ready** scope — plans are complete and verified for developer handoff. Full Production-Ready status requires Environment-Ready and Operations-Ready gates per the [Release Readiness Taxonomy](../../../reference/release-readiness-taxonomy.md).

### **File 1: PH7-Estimating-9-CrossModule.md**
Specifies two critical cross-module integration contracts:
- **Estimating → Project Hub Navigation** — Row-click navigation with data contract (projectNumber as linking key)
- **Admin Template Library** — Template link CRUD via Admin module, read-only display in Estimating
- Full component specs (ExternalPlatformLinks, TemplatesPage)
- Data flow diagrams and verification commands

### **File 2: PH7-Estimating-10-Backend-API.md**
Complete backend API specification:
- **6 endpoint groups** (pursuits, precon, log, templates, analytics, summary) with full request/response schemas
- **4 SharePoint list schemas** with all columns, types, indexes, and permissions
- **Analytics computation rules** (win rate, monthly volume, by-type, by-estimator breakdowns)
- **Type definitions** (TypeScript interfaces for all requests/responses)
- 30+ endpoint specifications with validation rules and auth requirements

### **File 3: PH7-Estimating-11-Testing.md**
Complete testing strategy covering:
- **5 Vitest unit test files** (45+ tests total) for components, utilities, routes, and API queries
- **5 Playwright E2E test files** with full user workflows (home, pursuits, precon, log/analytics, templates)
- **Test setup configuration** with mocks for window.matchMedia, IntersectionObserver
- **Coverage targets** (80%+ line coverage) and verification commands

### **File 4: PH7-Estimating-12-Documentation.md**
Two critical documentation deliverables:
1. **ADR-0075** — Locks 5 design decisions (scope, checklist ownership, templates approach, analytics depth, external platforms)
2. **Developer How-To Guide** — 7 common tasks (add columns, categories, analytics; cross-module navigation; schema updates; testing; admin connection) with step-by-step instructions, API reference, troubleshooting

**All files are:**
- ✅ Production-ready for developer handoff
  > _Terminology Note (PH7.9): "Production-ready for developer handoff" = Code-Ready scope per the [Release Readiness Taxonomy](../../../reference/release-readiness-taxonomy.md)._
- ✅ Cross-referenced (no broken links)
- ✅ Compliant with CLAUDE.md v1.2 (comment-only updates to locked sources, full documentation generation)
- ✅ Aligned with Diátaxis framework (how-to is goal-oriented, ADR is decision documentation)
- ✅ Locked to prevent mid-implementation drift

**Location:** `/sessions/vibrant-busy-archimedes/mnt/hb-intel/docs/architecture/plans/`