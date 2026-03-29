# Project Sites Web Part — Validation & Architecture Report

**Date:** 2026-03-29
**Scope:** Prompt 01 — Validation, contract definition, architecture recommendation
**Target package:** `@hbc/spfx` (`packages/spfx/`)

---

## 1. Executive Summary

A new "Project Sites" web part will render project-site link cards on year-specific pages in HBCentral/SitePages. The web part queries the `Projects` SharePoint list, filtering by a `Year` column that matches the hosting page's `Year` property, and displays clickable cards linking to each project's `SiteUrl`.

**Key decisions:**
- Lives in `packages/spfx/src/webparts/projectSites/` alongside `HbcDocumentManagerWebPart`
- Page-year resolved from `pageContext.listItem.fieldValues` with property pane override fallback
- Data model kept local (not promoted to `@hbc/models`)
- PnPjs v4 direct query via `@tanstack/react-query` hook
- UI composed from `HbcCard`, `HbcEmptyState`, `HbcSpinner` (`@hbc/ui-kit`)

---

## 2. Recommended Repo Location

**Decision: `packages/spfx/src/webparts/projectSites/`**

| Factor | Domain App (`apps/*`) | Standalone (`packages/spfx/`) |
|--------|----------------------|-------------------------------|
| Routing needed | Yes (full workspace) | No |
| Shell integration | Yes | No |
| Build pipeline | Vite IIFE + gulp | tsc only |
| Precedent | estimating, accounting, etc. | HbcDocumentManagerWebPart |
| Complexity match | Overweight | Exact fit |

The Project Sites web part is a single-purpose card feed — no navigation, no routing, no shell. It follows the `HbcDocumentManagerWebPart` pattern exactly: `BaseClientSideWebPart` + React 18 `createRoot` + auth bootstrap + property pane.

**File structure:**
```
packages/spfx/src/webparts/projectSites/
├── ProjectSitesWebPart.ts
├── ProjectSitesWebPart.manifest.json
├── ProjectSitesRoot.tsx
├── components/ProjectSiteCard.tsx
├── hooks/useProjectSites.ts
└── types.ts
```

---

## 3. Confirmed SharePoint Source Contract

### Projects List Fields (confirmed from `backend/functions/src/services/project-requests-repository.ts`)

| Display Name | Internal Name | Type | Status in Repo |
|-------------|--------------|------|----------------|
| SiteUrl | `SiteUrl` | Text | Confirmed — populated post-provisioning |
| ProjectName | `ProjectName` | Text | Confirmed |
| ProjectNumber | `ProjectNumber` | Text | Confirmed — format ##-###-## |
| ProjectType | `ProjectType` | Text | Confirmed |
| Department | `Department` | Choice | Confirmed — commercial / luxury-residential |
| Year | `Year` (expected) | Number (yyyy) | **Not in repo models** — user confirms exists in SharePoint |

### SiteUrl Population Contract
- Populated by provisioning saga Step 1 (`sharepoint-service.ts` → `createSite()`)
- Written to Projects list item and ProvisioningAuditLog
- Stored in `IProjectSetupRequest.siteUrl` and `IProjectRegistryRecord.siteUrl`
- **Some early-state requests may have empty SiteUrl** — UI must handle gracefully

### Year Field — Validation Required
The `Year` column is user-confirmed on the Projects list but has no TypeScript representation in the repo. The internal field name needs runtime validation:
```
GET /_api/web/lists/getbytitle('Projects')/fields?$filter=Title eq 'Year'
```

---

## 4. Page-Year Resolution Contract

### Strategy: Combination (page metadata primary, property pane fallback)

```
1. yearOverride > 0       → use override (admin/testing)
2. pageContext.listItem    → use fieldValues['Year'] (production)
   .fieldValues['Year']
3. neither                 → render "Year Not Configured" empty state
```

### SPFx `pageContext.listItem` Behavior
- Available when web part is on a Site Pages library page (confirmed for modern pages)
- `fieldValues` dictionary exposes standard and custom columns
- Custom column access may depend on the field's internal name matching exactly

### Validation Required During Implementation
- Confirm `this.context.pageContext.listItem?.fieldValues` is populated on HBCentral Site Pages
- Confirm the internal name for the Year column (display name "Year" → internal name likely `Year` for a simple Number column)
- If `fieldValues` does not include custom columns by default, a `listItem` property load or separate REST call may be needed

### Fallback Behavior
| Condition | UI Response |
|-----------|------------|
| Year resolved | Fetch and render project cards |
| Year = null, no override | `HbcEmptyState`: "Year Not Configured" + guidance |
| Year resolved, no results | `HbcEmptyState`: "No Project Sites for {year}" |
| Year resolved, fetch error | `HbcEmptyState`: error message |
| SiteUrl empty on a project | Card rendered in disabled/provisioning state |

---

## 5. UI Architecture Recommendations

### Card Component: `ProjectSiteCard`
- Composes `HbcCard weight="standard"` (level-1 elevation, default border)
- Header slot: project number as compact label/badge
- Body: project name (primary), department + type (secondary metadata)
- Full-card clickable anchor → `siteUrl` (new tab)
- Disabled state when `siteUrl` is empty

### Container: `ProjectSitesRoot`
- CSS Grid: `repeat(auto-fill, minmax(280px, 1fr))` with `16px` gap
- State machine: no-year / loading / error / empty / data
- `Suspense` wrapper (matching `HbcDocumentManagerRoot` pattern)

### UI-Kit Components
| Component | Usage |
|-----------|-------|
| `HbcCard` | Card primitive for each project |
| `HbcEmptyState` | Empty, error, and config-needed states |
| `HbcSpinner` | Loading state |

### Pattern Precedents
- `HbcMyWorkTile` — card with header/footer composition
- `HbcMyWorkListItem` — list item with accent colors, hover states
- `ProjectHealthPulseCard` — card with loading/error/empty state handling

---

## 6. Ranked Implementation Plan

### Prompt 02 — Scaffolding & Web Part Class
1. `types.ts` — `IProjectSiteEntry`, `IProjectSitesWebPartProps`
2. `ProjectSitesWebPart.manifest.json` — new UUID, "Project Sites" title, Globe icon
3. `ProjectSitesWebPart.ts` — full SPFx class with `resolveYear()`, auth bootstrap, React root
4. `packages/spfx/src/index.ts` — add barrel export
5. `packages/spfx/package.json` — add `@pnp/sp` devDep
6. Verify: `check-types`, `lint`

### Prompt 03 — Data Hook
1. `hooks/useProjectSites.ts` — PnPjs query + `@tanstack/react-query`
2. Unit tests for hook with mocked responses
3. Verify: `check-types`, `lint`, `test`

### Prompt 04 — UI Components
1. `components/ProjectSiteCard.tsx` — `HbcCard` composition
2. `ProjectSitesRoot.tsx` — state machine + grid layout
3. Unit tests for rendering and state handling
4. Full verification: `check-types`, `lint`, `test`

### Prompt 05 — Documentation, Packaging & Close
1. Update `packages/spfx/README.md`
2. Address SPFx packaging gap for standalone web parts
3. Final version bump and commit

---

## 7. Open Questions

| # | Question | Validation Method | Blocks |
|---|----------|------------------|--------|
| 1 | Year field internal name on Projects list | REST API query against HBCentral | Prompt 03 |
| 2 | `pageContext.listItem.fieldValues` includes custom Year column | Runtime check on HBCentral page | Prompt 02 |
| 3 | SiteUrl populated for all Year-tagged projects | Manual SharePoint query | No (graceful UI) |
| 4 | SPFx packaging for `packages/spfx` standalone web parts | Investigate HbcDocumentManager deployment | Prompt 05 |

---

## Implementation Handoff Note (for Prompt 02)

Begin with `packages/spfx/src/webparts/projectSites/`. Replicate the `HbcDocumentManagerWebPart` pattern exactly for the class, manifest, and root component scaffold. The key differences:
- Props: `{ yearOverride: number }` instead of document context props
- Root component receives `year: number | null` instead of document config
- Add `@pnp/sp` to `packages/spfx/package.json` devDependencies (v4, already in monorepo via `@hbc/auth`)
- Generate a new UUID for the manifest (do not reuse any existing web part ID)
- The root component will initially render a placeholder; the data hook and card UI come in Prompts 03–04

---

## Changed Files (This Prompt)

| File | Action |
|------|--------|
| `.claude/plans/project-sites-webpart-validation-and-architecture-report.md` | Created — this report |

No code changes were made. This prompt is validation and architecture only.
