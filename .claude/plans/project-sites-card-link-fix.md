# Project Sites Card Link Fix

**Date:** 2026-03-29
**Package:** `@hbc/spfx` v0.0.18

## 1. Root Cause

The HBCentral Projects list was created from a CSV import. SharePoint assigned generic internal field names (`field_1` through `field_23`) to all custom columns, while display names remain human-readable (`ProjectName`, `SiteUrl`, etc.). The normalizer was searching for display names (`SiteUrl`, `ProjectName`) which don't exist as keys in the REST API response — the actual keys are `field_23`, `field_3`, etc.

## 2. Files Changed

| File | Change |
|------|--------|
| `packages/spfx/src/webparts/projectSites/types.ts` | `SP_PROJECTS_FIELDS` now maps to confirmed `field_N` internal names |
| `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts` | Reads fields by `SP_PROJECTS_FIELDS.SITE_URL` (`field_23`) etc. with display-name fallback; removed fuzzy `findField()` |
| `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.test.ts` | 19 tests using `field_N` keys |

## 3. Schema Mapping

| Display Name | Internal Name | SP_PROJECTS_FIELDS key |
|-------------|---------------|----------------------|
| Title | `Title` | TITLE |
| Year | `Year` | YEAR |
| ProjectId | `field_1` | PROJECT_ID |
| ProjectNumber | `field_2` | PROJECT_NUMBER |
| ProjectName | `field_3` | PROJECT_NAME |
| ProjectLocation | `field_4` | PROJECT_LOCATION |
| ProjectType | `field_5` | PROJECT_TYPE |
| ProjectStage | `field_6` | PROJECT_STAGE |
| Department | `field_12` | DEPARTMENT |
| ClientName | `field_14` | CLIENT_NAME |
| SiteUrl | `field_23` | SITE_URL |

## 4. Query Contract

**Before:** No `$select`, returned all fields — correct, no change needed.
**After:** Same — still no `$select`. The fix is in how the normalizer reads the response.

## 5. Normalization Changes

**Before:** `findField(item, ['SiteUrl', 'Site_x0020_Url', ...])` — fuzzy search that never matched `field_23`.
**After:** `raw[SP_PROJECTS_FIELDS.SITE_URL]` → `raw['field_23']` — direct key access using confirmed internal name, with display-name fallback (`raw['SiteUrl']`) for forward compatibility.

## 6. Card Behavior

**Before:** `hasSiteUrl` always `false` → card rendered as non-clickable `<div>` with "Provisioning..."
**After:** `hasSiteUrl` is `true` when `field_23` contains a URL → card rendered as `<a href={siteUrl} target="_blank" rel="noopener noreferrer">`

## 7. Test Coverage

19 normalizer tests covering:
- `field_23` → siteUrl (plain string, Hyperlink object, lowercase url, null, missing, display-name fallback)
- `field_3` → projectName (direct, empty fallback to Title)
- `field_2` → projectNumber (direct, empty fallback to Title)
- `field_4/5/6/14` → other metadata fields
- Standard fields (Id, Title, Year)
- Sort ordering

## 8. Manual Validation Steps

- [ ] Upload `dist/sppkg/hb-intel-project-sites.sppkg` to App Catalog
- [ ] Load the Project Sites page — verify year selector loads
- [ ] Select 2025 — verify Wellington Estate Homes card appears
- [ ] Confirm the card is clickable (hover shows pointer cursor, elevation lift)
- [ ] Click the card — confirm it opens `https://hedrickbrotherscom.sharepoint.com/sites/25-244-01TheWellingtonEstateHomes` in a new tab
- [ ] Verify project name, number, location, type, stage render correctly from `field_N` data
- [ ] Verify a row with no `field_23` value still renders as non-clickable "Provisioning..."
