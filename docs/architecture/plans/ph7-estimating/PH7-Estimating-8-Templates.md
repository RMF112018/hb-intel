# PH7-Estimating-8 — Proposal Templates Library

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-Estimating-1 (Foundation)
**Blocks:** PH7-Estimating-9 (Cross-Module Integration) — template management is finalized before admin settings

---

## Summary

Implement the Proposal Templates page (`TemplatesPage.tsx`) as a curated library of SharePoint document links for proposal deliverables, organized by category (Cover and Summary, Cost Breakdowns, Clarifications and Allowances, Schedule and Logistics, BIM and Technology, Team and Experience, Legal and Financial, Other). This page enforces **Decision: Option B** (no file storage in HB Intel; all templates are managed as external SharePoint links), ensuring compliance with record management policies and reducing application storage complexity. The page includes a search/filter interface, category-based organization with sort order, and "Open in SharePoint" buttons for each template. Template link management is performed by Admins through the Admin System Settings interface (documented in PH7-Estimating-9).

## Why It Matters

Proposal templates are critical knowledge assets that must be centrally managed, version-controlled, and accessible to all estimators. By storing templates as curated SharePoint links (rather than files within HB Intel), we leverage Microsoft's native document management, enabling version control, approval workflows, and retention policies. This approach reduces application complexity, ensures templates remain single source of truth in SharePoint, and enables Admins to retire outdated templates without code changes. The category-based organization and search interface enable estimators to quickly locate the right template for their workflow.

---

## Files to Create / Modify

| File | Action | Purpose |
|------|--------|---------|
| `packages/features/estimating/src/TemplatesPage.tsx` | Create | Templates library page with category organization, search, and SharePoint links |
| `packages/features/estimating/src/data/estimatingQueries.ts` | Modify | Add `fetchTemplateLinks()` query hook (if not already present) |
| `packages/models/src/estimating/ITemplateLink.ts` | Verify | Confirm data model exists with category enum and sort order |
| `apps/estimating/src/router/routes.ts` | Modify | Add route for `/templates` with lazy-loaded `TemplatesPage` and `estimating:read` RBAC guard |

---

## Implementation

### 1. TemplatesPage Component

**File:** `packages/features/estimating/src/TemplatesPage.tsx`

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import { WorkspacePageShell, HbcCard, HbcButton, Text } from '@hbc/ui-kit';
import { useQuery } from '@tanstack/react-query';
import type { ITemplateLink } from '@hbc/models';
import { TemplateLinkCategory } from '@hbc/models';
import { fetchTemplateLinks } from './data/estimatingQueries.js';

/**
 * CATEGORY_ORDER
 *
 * Canonical ordering of template categories as they appear on the page.
 * Any categories with no active templates are hidden from the UI.
 * This array enforces the correct order for categories that do have templates.
 */
const CATEGORY_ORDER: TemplateLinkCategory[] = [
  TemplateLinkCategory.CoverAndSummary,
  TemplateLinkCategory.CostBreakdowns,
  TemplateLinkCategory.ClarificationsAndAllowances,
  TemplateLinkCategory.ScheduleAndLogistics,
  TemplateLinkCategory.BimAndTechnology,
  TemplateLinkCategory.TeamAndExperience,
  TemplateLinkCategory.LegalAndFinancial,
  TemplateLinkCategory.Other,
];

/**
 * FILE_TYPE_ICON
 *
 * Map file extensions to emoji icons for visual file type recognition.
 * Supports common office document types. Falls back to generic folder icon.
 */
const FILE_TYPE_ICON: Record<string, string> = {
  docx: '📝',
  xlsx: '📊',
  pdf: '📄',
  pptx: '📋',
  default: '📁',
};

/**
 * TemplatesPage
 *
 * Proposal templates library organized by category.
 *
 * Features:
 * - Category-based organization with canonical ordering
 * - Full-text search (title and description)
 * - File type icons for visual recognition
 * - "Open in SharePoint" links for each template
 * - Only displays active templates (isActive = true)
 * - Respects sortOrder field within each category
 *
 * RBAC: Routes.ts enforces estimating:read permission before rendering this page.
 * Data fetching uses TanStack Query with adapter pattern for PWA/SPFx compatibility.
 *
 * Decision: Option B — No file storage in HB Intel. All templates are maintained
 * as external SharePoint links. Admin management is in PH7-Estimating-9 (System Settings).
 */
export function TemplatesPage(): ReactNode {
  const [search, setSearch] = useState('');
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['estimating', 'templates'],
    queryFn: fetchTemplateLinks,
  });

  /**
   * Filter templates by search query (title and description).
   * If search is empty, use all templates.
   */
  const filtered = search
    ? templates.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  /**
   * Group templates by category, respecting CATEGORY_ORDER.
   * Only include categories with active templates.
   * Sort templates within each category by sortOrder.
   */
  const byCategory = CATEGORY_ORDER.reduce<Record<string, ITemplateLink[]>>(
    (acc, cat) => {
      const items = filtered
        .filter((t) => t.category === cat && t.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (items.length > 0) {
        acc[cat] = items;
      }
      return acc;
    },
    {}
  );

  return (
    <WorkspacePageShell layout="list" title="Proposal Templates">
      {/* Search input */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <input
          type="search"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--colorNeutralStroke1)',
            borderRadius: 4,
            fontSize: 14,
          }}
          aria-label="Search proposal templates"
        />
      </div>

      {/* Loading state */}
      {isLoading && <Text>Loading templates…</Text>}

      {/* Category sections */}
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
            {category}
          </Text>

          {/* Template cards grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 10,
            }}
          >
            {items.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!isLoading && Object.keys(byCategory).length === 0 && (
        <Text style={{ color: 'var(--colorNeutralForeground3)' }}>
          {search
            ? `No templates match "${search}".`
            : 'No templates configured. Contact your Admin to add template links.'}
        </Text>
      )}
    </WorkspacePageShell>
  );
}

/**
 * TemplateCard
 *
 * Individual template card component.
 * Displays file icon, title, description, and "Open in SharePoint" button.
 *
 * The card opens the SharePoint URL in a new tab with noopener and noreferrer
 * for security and performance.
 */
interface TemplateCardProps {
  template: ITemplateLink;
}

function TemplateCard({ template }: TemplateCardProps): ReactNode {
  /**
   * resolveFileIcon
   *
   * Resolve the emoji icon based on template file type (extension).
   * Falls back to folder icon if extension is not recognized.
   */
  const resolveFileIcon = (): string => {
    // Extract extension from SharePoint URL or use file type field
    const ext = template.fileType?.toLowerCase() ?? 'default';
    return FILE_TYPE_ICON[ext] ?? FILE_TYPE_ICON.default;
  };

  return (
    <HbcCard
      size="small"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      {/* File type icon */}
      <span
        style={{ fontSize: 22, flexShrink: 0 }}
        aria-hidden="true"
      >
        {resolveFileIcon()}
      </span>

      {/* Content: title, description, button */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          size={300}
          weight="semibold"
          style={{ display: 'block', marginBottom: 2 }}
        >
          {template.title}
        </Text>
        {template.description && (
          <Text
            size={200}
            style={{
              color: 'var(--colorNeutralForeground3)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            {template.description}
          </Text>
        )}
        <HbcButton
          size="small"
          appearance="outline"
          onClick={() =>
            window.open(
              template.sharePointUrl,
              '_blank',
              'noopener noreferrer'
            )
          }
          aria-label={`Open ${template.title} in SharePoint`}
        >
          Open in SharePoint
        </HbcButton>
      </div>
    </HbcCard>
  );
}
```

---

### 2. Data Access Layer

**File:** `packages/features/estimating/src/data/estimatingQueries.ts` — **Modify**

Ensure the following query hook is present. If already defined in PH7-Estimating-1, verify the signature matches. If not, add it now:

```typescript
/**
 * fetchTemplateLinks
 *
 * Fetches the complete list of proposal template links from the Estimating configuration.
 * Returns all templates regardless of active status (filtering to active=true happens in the component).
 *
 * Uses the adapter pattern from @hbc/data-access for dual-mode (PWA/SPFx) compatibility.
 *
 * @returns {Promise<ITemplateLink[]>}
 */
export async function fetchTemplateLinks(): Promise<ITemplateLink[]> {
  const adapter = getEstimatingAdapter();
  return adapter.getTemplateLinks();
}
```

---

### 3. Data Models

**File:** `packages/models/src/estimating/ITemplateLink.ts` — **Verify**

Ensure the following model and enum are defined. If not present, create them:

```typescript
/**
 * TemplateLinkCategory
 *
 * Enumeration of proposal template categories.
 * These categories organize templates by functional area and deliverable type.
 */
export enum TemplateLinkCategory {
  CoverAndSummary = 'Cover and Summary',
  CostBreakdowns = 'Cost Breakdowns',
  ClarificationsAndAllowances = 'Clarifications and Allowances',
  ScheduleAndLogistics = 'Schedule and Logistics',
  BimAndTechnology = 'BIM and Technology',
  TeamAndExperience = 'Team and Experience',
  LegalAndFinancial = 'Legal and Financial',
  Other = 'Other',
}

/**
 * ITemplateLink
 *
 * Data model for a proposal template reference.
 * Template files are stored and versioned in SharePoint; HB Intel maintains only the link metadata.
 *
 * Fields:
 * - id: Unique identifier for the template record (GUID or numeric)
 * - title: Display name of the template
 * - description: Short description (optional) of the template's purpose
 * - category: Category enumeration for organization
 * - fileType: File extension for icon rendering (e.g., "docx", "pdf", "xlsx")
 * - sharePointUrl: Direct URL to the SharePoint document library link
 * - sortOrder: Numeric ordering within category (lower values appear first)
 * - isActive: Boolean flag for soft-delete (only active=true templates display)
 * - createdAt: ISO 8601 timestamp
 * - updatedAt: ISO 8601 timestamp
 */
export interface ITemplateLink {
  id: string;
  title: string;
  description?: string;
  category: TemplateLinkCategory;
  fileType: string; // e.g., "docx", "pdf", "xlsx", "pptx"
  sharePointUrl: string; // Direct URL to SharePoint document
  sortOrder: number; // Lower values appear first within category
  isActive: boolean; // Only active templates are displayed
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

**Barrel Export:** Ensure `TemplateLinkCategory` and `ITemplateLink` are exported from `packages/models/src/estimating/index.ts`:

```typescript
export { TemplateLinkCategory, type ITemplateLink } from './ITemplateLink.js';
```

---

### 4. Routing

**File:** `apps/estimating/src/router/routes.ts` — **Modify**

Add the following route definition (if not already present):

```typescript
// Templates library page route
{
  path: '/templates',
  component: lazy(() =>
    import('@hbc/features-estimating')
      .then((m) => ({ default: m.TemplatesPage }))
  ),
  beforeLoad: requirePermission('estimating:read'),
  pendingComponent: () => <LoadingFallback />,
  errorComponent: ErrorBoundary,
},
```

---

## Cross-Reference: Template Management

Template link management (add, edit, delete, reorder) is implemented as an **Admin System Settings** feature in `PH7-Estimating-9-CrossModule.md`. Admins access template configuration via:

**Admin Navigation → System Settings → "Template Library" tab**

Key responsibilities for PH7-Estimating-9:
- Admin form for creating/editing template links
- Drag-reorder UI for sortOrder
- Bulk import from SharePoint library (optional enhancement)
- Soft-delete (mark isActive = false) vs. permanent removal
- Export template list as CSV (optional)

The TemplatesPage itself only displays active templates and does not include admin functionality.

---

## Verification

After implementing the page, verify:

1. **Build succeeds:**
   ```bash
   pnpm turbo run build
   ```

2. **Templates page renders in dev-harness:**
   - Navigate to `/estimating/templates`
   - Confirm the page loads with search input
   - Verify templates are displayed grouped by category in canonical order

3. **Search functionality works:**
   - Type a template title or keyword in the search box
   - Confirm templates are filtered by title and description (case-insensitive)
   - Confirm clearing search shows all templates again

4. **Category organization:**
   - Confirm categories appear in the order defined by CATEGORY_ORDER
   - Confirm categories with no templates are hidden
   - Confirm templates within each category are sorted by sortOrder

5. **Template cards render correctly:**
   - Verify file type icons display correctly (📝 for docx, 📊 for xlsx, 📄 for pdf, 📋 for pptx, 📁 for unknown)
   - Verify title and description display
   - Confirm "Open in SharePoint" button is clickable

6. **SharePoint links work:**
   - Click "Open in SharePoint" on a template
   - Confirm the SharePoint URL opens in a new tab
   - Verify the link includes `noopener` and `noreferrer` in browser DevTools

7. **Empty state:**
   - Test with search query that returns no results
   - Confirm "No templates match" message displays
   - Test with no templates in database
   - Confirm "No templates configured" message displays

8. **RBAC enforced:**
   - Test without the `estimating:read` permission
   - Confirm the page is blocked and redirect to unauthorized page

9. **Responsive design:**
   - Test at 375px (mobile), 768px (tablet), 1920px (desktop) widths
   - Confirm template cards stack correctly in grid
   - Confirm search input remains usable
   - Confirm "Open in SharePoint" button remains clickable

---

## Definition of Done

- [ ] `TemplatesPage.tsx` created with category organization and search
- [ ] `TemplateCard` sub-component created with file icon and SharePoint link
- [ ] `fetchTemplateLinks` query hook defined in `estimatingQueries.ts`
- [ ] `TemplateLinkCategory` enum defined in models package
- [ ] `ITemplateLink` data model defined in models package
- [ ] Both exports present in `packages/models/src/estimating/index.ts`
- [ ] Route added to `apps/estimating/src/router/routes.ts` with RBAC guard
- [ ] Build passes: `pnpm turbo run build`
- [ ] Templates page renders and loads templates in dev-harness
- [ ] Search filtering works (title and description)
- [ ] Categories appear in canonical order (CATEGORY_ORDER)
- [ ] Templates within categories sorted by sortOrder
- [ ] File type icons display correctly
- [ ] "Open in SharePoint" buttons open URLs in new tab with noopener/noreferrer
- [ ] Only active templates (isActive=true) are displayed
- [ ] Empty states display correctly (no results, no templates)
- [ ] RBAC enforcement verified
- [ ] Responsive design verified at 375px, 768px, 1920px widths
- [ ] All imports use `@hbc/ui-kit`, not `@hbc/ui-kit/app-shell` (correct for PWA page)
- [ ] Cross-reference to PH7-Estimating-9 (Admin System Settings) documented in code/comments

---

## Notes for Next Phase

**PH7-Estimating-9 (Cross-Module Integration)** will implement the Admin System Settings interface for template management:

- Admin form component for CRUD operations on template links
- Drag-reorder UI for sortOrder field
- Validation: SharePoint URL format, required fields
- Soft-delete workflow (isActive flag)
- Optional: bulk import from SharePoint document library
- Optional: CSV export of template library metadata

The TemplatesPage is read-only for all users. Template modifications are restricted to users with the `system:admin` permission.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 8 (Templates) plan created: 2026-03-08
Decision: Option B (external SharePoint links, no file storage) confirmed.
Ready for development. Next: PH7-Estimating-9 (Cross-Module & Admin Settings)
-->
