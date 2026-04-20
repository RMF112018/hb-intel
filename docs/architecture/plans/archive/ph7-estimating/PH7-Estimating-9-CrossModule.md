# PH7-Estimating-9 — Cross-Module Integration & Admin System Settings

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** EST-1 (Foundation)
**Blocks:** PH7-ProjectHub (kickoff route), PH7-Admin (System Settings Template Library tab)

---

## Summary

This plan specifies the two critical cross-module integration contracts for the Estimating module:

1. **Estimating → Project Hub Navigation** — When a user clicks a pursuit row in `ActivePursuitsPage`, the app navigates to the Project Hub kickoff page with a defined routing contract.
2. **Template Library Admin Management** — Admins manage template links via a new "Template Library" tab in `AdminSystemSettingsPage`, which feeds the Estimating Templates page via SharePoint.

Both contracts are locked and must be adhered to exactly by the consuming modules (Project Hub and Admin).

---

## Why It Matters

The Estimating module is a source system for pursuit data that flows into Project Hub. The kickoff page (owned by Project Hub) acts as the "detail view" for a pursuit, while Estimating owns the multi-pursuit dashboard. This relationship requires a stable, documented navigation contract to prevent routing misalignment.

Similarly, the Template Library is an administrative subsystem shared between Admin (write) and Estimating (read). Documenting this contract prevents duplication and ensures admins have a single, consistent place to manage templates.

---

## Files to Create / Modify

| File | Type | Action | Notes |
|---|---|---|---|
| **`packages/features/estimating/src/pages/ActivePursuitsPage.tsx`** | Feature | Modify | Add row-click navigation handler |
| **`packages/features/estimating/src/types/index.ts`** | Type Def | Ensure | IActivePursuit includes projectNumber field |
| **`packages/ui-kit/src/components/ExternalPlatformLinks.tsx`** | UI Component | Create | Render BC/PC link buttons (new or existing?) |
| **`apps/admin/src/pages/SystemSettingsPage.tsx`** | Admin Feature | Reference | Add "Template Library" tab (deferred to PH7-Admin plan) |
| **`docs/reference/contracts/cross-module-contracts.md`** | Reference Doc | Create | Central repository of all cross-module contracts |

---

## Implementation

### Part 1: Estimating → Project Hub Navigation Contract

#### 1.1 Navigation Code in ActivePursuitsPage

**Current:** Pursuit table with row click handler (e.g., edit, detail view).

**Change:** Row click navigates using TanStack Router to Project Hub kickoff page.

```typescript
// packages/features/estimating/src/pages/ActivePursuitsPage.tsx
import { useNavigate } from '@tanstack/react-router';

export function ActivePursuitsPage() {
  const navigate = useNavigate();
  const { data: pursuits } = useFetchActivePursuits();

  const handlePursuitRowClick = (pursuit: IActivePursuit) => {
    // TanStack Router navigation across modules
    navigate({
      to: '/project-hub/$projectId/kickoff',
      params: { projectId: pursuit.projectNumber },
    });
  };

  return (
    <HbcDataTable
      columns={columns}
      data={pursuits}
      onRowClick={handlePursuitRowClick}
      // ... other table props
    />
  );
}
```

#### 1.2 Data Contract: IActivePursuit

**Requirement:** The `projectNumber` field is the linking key. It must:
- Be unique per pursuit
- Match the `projectId` parameter in the Project Hub route
- Be immutable (primary key)
- Format: `##-###-##` (e.g., `25-010-42`)

```typescript
// packages/features/estimating/src/types/models.ts
export interface IActivePursuit {
  id: string; // SharePoint item ID
  projectNumber: string; // ##-###-## format — LINKING KEY
  projectName: string;
  source?: string;
  deliverable?: EstimatingDeliverable;
  subBidsDue?: Date;
  presubmissionReview?: Date;
  winStrategyMeeting?: Date;
  dueDate: Date;
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  contributorUpns?: string[];
  contributorNames?: string[];
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  status: PursuitStatus; // Active, Submitted, Awarded, NotAwarded, OnHold, Withdrawn

  // Checklist flags for kickoff page display
  checkBidBond?: boolean;
  checkPPBond?: boolean;
  checkSchedule?: boolean;
  checkLogistics?: boolean;
  checkBimProposal?: boolean;
  checkPreconProposal?: boolean;
  checkProposalTabs?: boolean;
  checkMarketingCoordination?: boolean;
  checkBusinessTerms?: boolean;

  // External platform links
  buildingConnectedUrl?: string;
  procoreUrl?: string;

  updatedByUpn: string;
  updatedAt: Date;
}

export type PursuitStatus =
  | 'Active'
  | 'Submitted'
  | 'Awarded'
  | 'NotAwarded'
  | 'OnHold'
  | 'Withdrawn';

export type EstimatingDeliverable =
  | 'Lump Sum'
  | 'GMP'
  | 'Hard Bid'
  | 'Design Build'
  | 'ROM'
  | 'SD Estimate'
  | 'Schematic Estimate'
  | 'Conceptual Estimate';
```

#### 1.3 Route Registration (Estimating Module)

The Estimating module provides the pursuits table and row navigation. The route `/project-hub/:projectId/kickoff` is **owned and registered by the Project Hub module** (see reference in PH7-ProjectHub plan).

```typescript
// packages/features/estimating/src/routes.ts
// Only includes Estimating routes; Project Hub route is registered separately
export const estimatingRoutes = [
  {
    path: '/',
    component: EstimatingHomePage,
  },
  {
    path: '/pursuits',
    component: ActivePursuitsPage,
  },
  // ... other estimating routes
];
```

#### 1.4 Cross-Module Navigation Contract Table

| Aspect | Specification |
|---|---|
| **Trigger** | User clicks a pursuit row in Estimating → `ActivePursuitsPage` |
| **Data Passed** | `pursuit.projectNumber` (string, ##-###-## format) |
| **Router Call** | `navigate({ to: '/project-hub/$projectId/kickoff', params: { projectId: pursuit.projectNumber } })` |
| **Target Module** | Project Hub (PH7-ProjectHub-Feature-Plan) |
| **Target Route** | `/project-hub/:projectId/kickoff` |
| **Target Component** | `ProjectKickoffPage` (Project Hub module) |
| **Expected Route Params** | `projectId` (matching IActivePursuit.projectNumber) |
| **Data Consumption** | Project Hub will load pursuit data by projectNumber via API call or context sharing (TBD in PH7-ProjectHub plan) |
| **Responsibility Split** | Estimating: owns pursuit list, provides navigation link. Project Hub: owns kickoff checklist, responsible for loading pursuit context by projectId. |

---

### Part 2: Admin Template Library Integration

#### 2.1 SharePoint List: HBIntelTemplateLinks

Templates are stored in SharePoint and read by Estimating. Admins write to this list via Admin module UI.

**List Name:** `HBIntelTemplateLinks`

| Column | Type | Required | Indexed | Notes |
|---|---|---|---|---|
| **Title** | Single line | Yes | No | Display name for template (e.g., "HBC Standard GMP Template") |
| **Category** | Choice | Yes | Yes | See TemplateLinkCategory enum below |
| **SharePointUrl** | Single line | Yes | No | Full SharePoint document URL (e.g., `https://hbcteams.sharepoint.com/sites/.../Shared%20Documents/...docx`) |
| **FileType** | Single line | Yes | No | File extension (docx, xlsx, pdf, pptx) |
| **Description** | Multi-line | No | No | User-facing description (150–300 chars) |
| **SortOrder** | Number | Yes | Yes | Display order within category (0–999); sorted ascending |
| **IsActive** | Yes/No | Yes | Yes | Hide inactive templates from Estimating view (default: true) |
| **UpdatedByUpn** | Single line | Yes | No | Azure AD UPN of last modifier |
| **CreatedByUpn** | Single line | Yes | No | Azure AD UPN of creator |

**Indexes:**
- Primary: `Category`, `SortOrder` (for fast filtering/sorting in Estimating read)
- Secondary: `IsActive` (to exclude inactive templates)

#### 2.2 Template Category Enum & Display Order

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
  OTHER = 'Other',
}

// Display order for category headers in UI
export const CATEGORY_ORDER: TemplateLinkCategory[] = [
  TemplateLinkCategory.COVER_AND_SUMMARY,
  TemplateLinkCategory.ESTIMATE,
  TemplateLinkCategory.SCHEDULE,
  TemplateLinkCategory.BIM,
  TemplateLinkCategory.PRECONSTRUCTION,
  TemplateLinkCategory.PROPOSAL,
  TemplateLinkCategory.LEGAL_AND_COMPLIANCE,
  TemplateLinkCategory.OTHER,
];

export interface ITemplateLink {
  id: string; // SharePoint item ID
  title: string;
  category: TemplateLinkCategory;
  sharePointUrl: string;
  fileType: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  updatedByUpn: string;
  updatedAt: Date;
}
```

#### 2.3 Admin Module: Template Library Tab (Deferred Reference)

**Location:** `apps/admin/src/pages/SystemSettingsPage.tsx`

**Responsibility:** Admin module will implement a new tab "Template Library" with:
- CRUD table displaying `ITemplateLink` records
- Columns: Title, Category (dropdown), FileType, SortOrder, IsActive toggle, Updated By, Actions (edit/delete)
- Modal form with fields: Title, Category, SharePointUrl, FileType, Description, SortOrder, IsActive
- Add / Edit / Delete buttons with confirmation
- Permissions: Admin role required to write

**Form Data Type (for Admin module use):**

```typescript
// packages/features/estimating/src/types/admin.ts
export interface ITemplateLinkAdminFormData {
  title: string;
  category: TemplateLinkCategory;
  sharePointUrl: string;
  fileType: string; // 'docx' | 'xlsx' | 'pdf' | 'pptx'
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ITemplateLinkAdminFormError {
  title?: string;
  category?: string;
  sharePointUrl?: string;
  fileType?: string;
  sortOrder?: string;
}

// Validation helper
export function validateTemplateLinkForm(data: ITemplateLinkAdminFormData): ITemplateLinkAdminFormError {
  const errors: ITemplateLinkAdminFormError = {};
  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.category) errors.category = 'Category is required';
  if (!data.sharePointUrl?.trim()) errors.sharePointUrl = 'SharePoint URL is required';
  if (!data.sharePointUrl?.startsWith('https://')) errors.sharePointUrl = 'Must be a valid HTTPS URL';
  if (!data.fileType) errors.fileType = 'File type is required';
  if (data.sortOrder < 0 || data.sortOrder > 999) errors.sortOrder = 'Sort order must be 0–999';
  return errors;
}
```

#### 2.4 Data Flow Diagram

```
Admin Module (Write Path)
───────────────────────────
User (Admin) → AdminSystemSettingsPage
                    ↓
            [Template Library Tab]
                    ↓
            TemplateLinkForm (modal)
                    ↓
         API: POST/PATCH/DELETE /api/estimating/templates
                    ↓
         (Requires: admin:write permission)
                    ↓
         Backend: Azure Function
                    ↓
         HBIntelTemplateLinks SharePoint List


Estimating Module (Read Path)
──────────────────────────────
User (Estimator) → EstimatingModule
                        ↓
                TemplatesPage
                        ↓
            API: GET /api/estimating/templates
                        ↓
            Backend: reads HBIntelTemplateLinks
                        ↓
         Filters: IsActive = true, sorted by Category + SortOrder
                        ↓
            Response: ITemplateLink[]
                        ↓
            UI: grouped by CATEGORY_ORDER, clickable "Open in SharePoint"
```

#### 2.5 External Platform Links Component

The `ExternalPlatformLinks` component displays BC and Procore deep links stored in `IActivePursuit`.

```typescript
// packages/ui-kit/src/components/ExternalPlatformLinks.tsx
import React from 'react';

export interface ExternalPlatformLinksProps {
  buildingConnectedUrl?: string;
  procoreUrl?: string;
}

/**
 * Renders BC and/or PC icon buttons for a pursuit.
 * URLs are opened in a new tab.
 */
export function ExternalPlatformLinks({
  buildingConnectedUrl,
  procoreUrl,
}: ExternalPlatformLinksProps) {
  if (!buildingConnectedUrl && !procoreUrl) {
    return null;
  }

  const handleOpenUrl = (url: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row-click navigation
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex gap-2">
      {buildingConnectedUrl && (
        <button
          onClick={handleOpenUrl(buildingConnectedUrl)}
          aria-label="Open in Building Connected"
          className="p-2 hover:bg-gray-100 rounded"
          title="Building Connected"
        >
          <BCIcon />
        </button>
      )}
      {procoreUrl && (
        <button
          onClick={handleOpenUrl(procoreUrl)}
          aria-label="Open in Procore"
          className="p-2 hover:bg-gray-100 rounded"
          title="Procore"
        >
          <ProcoreIcon />
        </button>
      )}
    </div>
  );
}
```

**Key behaviors:**
- Returns `null` if both URLs are absent (no visual footprint)
- Each button calls `window.open(url, '_blank')` with `noopener,noreferrer` for security
- Stops event propagation on click to prevent row-click handler from firing
- Styled as subtle icon buttons (small footprint in table row)

#### 2.6 Estimating Reading Template Links

The `TemplatesPage` fetches and displays template links from the API.

```typescript
// packages/features/estimating/src/pages/TemplatesPage.tsx
import { useFetchTemplateLinks } from '../data/estimatingQueries';
import { CATEGORY_ORDER, TemplateLinkCategory } from '../types/templates';

export function TemplatesPage() {
  const { data: templates, isLoading } = useFetchTemplateLinks();

  if (isLoading) return <LoadingSpinner />;

  // Group by category in CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.reduce<Record<string, ITemplateLink[]>>(
    (acc, category) => {
      acc[category] = templates
        .filter(t => t.category === category && t.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map(category => {
        const items = grouped[category] || [];
        if (items.length === 0) return null;
        return (
          <div key={category}>
            <h2 className="text-lg font-bold mb-3">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TemplateCard({ template }: { template: ITemplateLink }) {
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(template.sharePointUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="border rounded p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{template.title}</h3>
        <FileTypeIcon type={template.fileType} />
      </div>
      {template.description && (
        <p className="text-xs text-gray-600 mb-3">{template.description}</p>
      )}
      <button
        onClick={handleOpen}
        className="text-xs text-blue-600 hover:underline"
      >
        Open in SharePoint
      </button>
    </div>
  );
}
```

---

## Verification

### Navigation Contract Tests

```bash
# Test pursuit row click → Project Hub kickoff navigation
cd packages/features/estimating
pnpm vitest run routes.test.ts

# E2E: table row navigation
cd e2e
pnpm playwright test webparts/estimating/pursuits.spec.ts
```

**Verify:**
- Row click calls `navigate({ to: '/project-hub/$projectId/kickoff', params: { projectId: '##-###-##' } })`
- `projectNumber` from IActivePursuit is correctly formatted and passed as `projectId`
- No page reload (client-side SPA navigation)

### Template Library Tests

```bash
# Admin module: Template Library tab renders
cd apps/admin
pnpm vitest run pages/__tests__/SystemSettingsPage.test.ts

# Estimating: Templates page fetches and displays
cd packages/features/estimating
pnpm vitest run pages/__tests__/TemplatesPage.test.ts

# E2E: Full admin → estimating flow
cd e2e
pnpm playwright test webparts/estimating/templates.spec.ts
```

**Verify:**
- Admin form validates SharePoint URL format (must be HTTPS)
- Admin DELETE calls API with correct endpoint
- Estimating displays only `isActive=true` templates
- Templates grouped by CATEGORY_ORDER, sorted by sortOrder within category
- "Open in SharePoint" button opens URL in new tab without propagating click

### Cross-Module API Contract Tests

```bash
# Backend endpoints exist and return correct schemas
cd backend/functions
pnpm vitest run src/functions/estimating/index.test.ts
```

**Verify:**
- GET `/api/estimating/templates` returns `ITemplateLink[]`
- POST/PATCH/DELETE require `admin:write` permission
- Response includes all fields: title, category, sharePointUrl, fileType, isActive, etc.

---

## Definition of Done

**Estimating → Project Hub Navigation:**
- [ ] IActivePursuit interface includes `projectNumber` field with JSDoc comment: "##-###-## format; linking key to Project Hub"
- [ ] ActivePursuitsPage.tsx implements row-click handler using TanStack Router `navigate()`
- [ ] Navigation route: `/project-hub/$projectId/kickoff` with params: `{ projectId: pursuit.projectNumber }`
- [ ] No direct import of Project Hub components (loose coupling)
- [ ] Unit tests: pursue row click → navigate call verified
- [ ] E2E test: row click → browser URL changes to `/project-hub/25-010-42/kickoff`
- [ ] Cross-module contract documented in `docs/reference/contracts/cross-module-contracts.md`

**Template Library (Admin ↔ Estimating):**
- [ ] HBIntelTemplateLinks SharePoint list created with all columns defined in section 2.1
- [ ] ITemplateLink and TemplateLinkCategory enum exported from `packages/features/estimating/src/types/templates.ts`
- [ ] CATEGORY_ORDER array locked (defines display order for all UIs)
- [ ] ITemplateLinkAdminFormData type and validation function exported for Admin module use
- [ ] ExternalPlatformLinks component in `packages/ui-kit/src/components/` renders BC/PC buttons correctly
- [ ] TemplatesPage fetches, filters (isActive=true), groups, and sorts templates per spec
- [ ] Admin module reference: System Settings page will have Template Library tab (plan documented, implementation deferred to PH7-Admin)
- [ ] API endpoints: GET /api/estimating/templates (read), POST/PATCH/DELETE /api/estimating/templates (admin-only write) — implementation in PH7-Estimating-10
- [ ] Unit tests: category grouping, search, inactive filtering verified
- [ ] E2E test: admin creates template → estimating page displays in correct category
- [ ] Cross-module contract documented in `docs/reference/contracts/cross-module-contracts.md`

---

## Notes & Dependencies

**Blocking Dependencies:**
- Project Hub must register `/project-hub/:projectId/kickoff` route before end-to-end navigation test passes (see PH7-ProjectHub plan)
- Admin module must implement Template Library tab before admins can manage templates (see PH7-Admin plan)

**Future Enhancements (Documented in ADR-0075):**
- Option C: HB Intel could manage template file versioning and storage (deferred)
- Option C: Live API integration with Building Connected and Procore (deferred)

**Security Notes:**
- SharePoint URLs use `noopener,noreferrer` to prevent tab/referrer hijacking
- Admin template write endpoints require explicit `admin:write` permission (enforced in backend)
- Template descriptions are user-provided but rendered as text (no XSS risk)

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase: PH7-Estimating-9 (Cross-Module Integration)
Status: Plan created, awaiting implementation
Referenced by: PH7-ProjectHub-Feature-Plan, PH7-Admin-Feature-Plan
Next: Review with Product Owner, proceed to PH7-Estimating-10 (Backend API)
-->
