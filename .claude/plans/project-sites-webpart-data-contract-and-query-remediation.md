# Project Sites Web Part — Data Contract & Query Remediation

**Date:** 2026-03-29
**Scope:** Prompt 02 — Data contract, page-year resolution, list query layer
**Package:** `@hbc/spfx` v0.0.2

---

## 1. Chosen Architecture

The Project Sites data layer lives entirely in `packages/spfx/src/webparts/projectSites/`. It follows the `HbcDocumentManagerWebPart` pattern: standalone `BaseClientSideWebPart` with React 18 `createRoot`, auth bootstrap via `@hbc/auth/spfx`, and PnPjs v4 for SharePoint list queries.

**Key design choices:**
- Data model local to web part (not promoted to `@hbc/models`)
- PnPjs query direct to HBCentral Projects list (no backend proxy needed)
- `@tanstack/react-query` for caching, loading, and error state management
- SharePoint field names centralized in `SP_PROJECTS_FIELDS` constant object
- Normalization layer between raw SharePoint items and UI-ready records

---

## 2. Page-Year Resolution Rule

**Source:** `resolvePageYear.ts`

| Priority | Source | Condition |
|----------|--------|-----------|
| 1 | Property pane `yearOverride` | `yearOverride > 0` |
| 2 | Page metadata `pageContext.listItem.fieldValues['Year']` | Number > 0 on hosting page |
| 3 | null | Triggers "Year Not Configured" empty state |

The property pane override enables admin testing and fallback when page metadata is unavailable (e.g., in SPFx workbench). String-to-number coercion is handled for edge cases where SharePoint returns numbers as strings.

---

## 3. Query / Filter Rule

**Source:** `hooks/useProjectSites.ts`

```
List:   Projects (getByTitle('Projects'))
Site:   HBCentral (current site via SPFx context)
Filter: Year eq {resolvedYear}
Select: Id, ProjectName, ProjectNumber, SiteUrl, Year,
        Department, ProjectLocation, ProjectType, ProjectStage, ClientName
Sort:   Client-side — ProjectNumber ascending, then ProjectName alphabetical
Cache:  5-minute stale time via react-query, 1 retry on failure
```

The query is disabled when no year is resolved (`enabled: year !== null`).

---

## 4. Exact Files Changed

### Created
| File | Purpose |
|------|---------|
| `packages/spfx/src/webparts/projectSites/types.ts` | Data contract: `IProjectSiteEntry`, `IRawProjectSiteItem`, `IProjectSitesWebPartProps`, `IResolvedPageYear`, `IProjectSitesResult`, `SP_PROJECTS_FIELDS`, `SP_PROJECTS_SELECT` |
| `packages/spfx/src/webparts/projectSites/resolvePageYear.ts` | Page-year resolution seam with override + metadata + null fallback |
| `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts` | Raw SP item → UI-ready `IProjectSiteEntry` normalization + sort |
| `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts` | React hook: PnPjs query + react-query state machine |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.ts` | SPFx entry point with auth bootstrap, createRoot, property pane |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | Web part manifest (UUID: `e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b`) |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Stub root component (full UI in Prompt 04) |

### Modified
| File | Change |
|------|--------|
| `packages/spfx/src/index.ts` | Added `ProjectSitesWebPart` default export + type exports |
| `packages/spfx/package.json` | Added `@pnp/sp: ^4.0.0` dependency, bumped version to 0.0.2 |

---

## 5. Data Shape Returned to UI

```typescript
interface IProjectSiteEntry {
  id: number;              // SharePoint list item ID
  projectName: string;     // Display name (never empty — defaults to "(Untitled Project)")
  projectNumber: string;   // Format: ##-###-## (empty string if absent)
  siteUrl: string;         // SharePoint site URL (empty string if not provisioned)
  year: number;            // Fiscal/calendar year
  department: string;      // "commercial" | "luxury-residential" | ""
  projectLocation: string; // Geographic location | ""
  projectType: string;     // Classification type | ""
  projectStage: string;    // "Pursuit" | "Active" | ""
  clientName: string;      // Client name | ""
  hasSiteUrl: boolean;     // Convenience flag for UI rendering
}
```

### Error / Empty States

| Status | Trigger | UI Behavior |
|--------|---------|-------------|
| `no-year` | No year resolved from override or page metadata | Configuration guidance |
| `loading` | Query in flight | Loading indicator |
| `error` | PnPjs/network failure | Error message from exception |
| `empty` | Query returned 0 results | "No project sites for {year}" |
| `success` | 1+ results | Card grid |

---

## 6. Unresolved Dependencies

| Item | Risk | Mitigation |
|------|------|------------|
| Year field internal name | May differ from `'Year'` if created with special characters | `SP_PROJECTS_FIELDS.YEAR` constant — single place to update. Validate via `/_api/web/lists/getbytitle('Projects')/fields?$filter=Title eq 'Year'` |
| `pageContext.listItem.fieldValues` for custom columns | May not include custom columns without explicit property load in some SPFx versions | Property pane override provides immediate fallback |
| SPFx packaging for standalone web parts | `packages/spfx` not in `build-spfx-package.ts` pipeline | Pre-existing gap (same for HbcDocumentManager). Address in Prompt 05 |

---

## 7. Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass (0 errors) |
| `eslint src/ --ext .ts,.tsx` | Pass (0 errors, 0 warnings) |
| Unit tests | N/A — no test infrastructure in `packages/spfx` yet |
| Manual SharePoint validation | Required — Year field internal name + page metadata access |
