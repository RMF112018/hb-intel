# Phase 09 Lane A `.sppkg` Build Evidence

## Artifact produced

| Field | Value |
|-------|-------|
| Artifact | `dist/sppkg/hb-webparts.sppkg` |
| Size | 113.2 KB (115,967 bytes) |
| Build command | `npx tsx tools/build-spfx-package.ts --domain hb-webparts` |
| Build result | All checks passed |

## Package contents (verified by `unzip -l`)

| Category | Count | Files |
|----------|-------|-------|
| OPC structure | 4 | `[Content_Types].xml`, `_rels/.rels`, `AppManifest.xml`, feature XML |
| WebPart XML definitions | 10 | One per production webpart manifest ID |
| IIFE bundle | 1 | `hb-webparts-app-112d78d9.js` |
| Per-webpart shell entries | 10 | `shell-entry-{uuid}-{hash}.js` with patched `define()` names |
| Compiled shell webpart | 1 | `shell-web-part_ba914cb802b3ded228cf.js` |
| CSS | 1 | `spfx-hb-webparts.css` (628 bytes) |
| **Total ClientSideAssets** | **13** | |

## Webpart manifests in package

| # | Webpart | Manifest ID | Shell Entry Hash |
|---|---------|-------------|-----------------|
| 1 | CompanyPulse | `0b53f651-...` | `6008e3dd` |
| 2 | SmartSearchWayfinding | `11d72b36-...` | `195b4b6e` |
| 3 | PeopleCulture | `27ac10f4-...` | `07e69323` |
| 4 | HbHeroBanner | `39762a4d-...` | `2274722d` |
| 5 | PersonalizedWelcomeHeader | `46bfde64-...` | `66f1fcf1` |
| 6 | PriorityActionsRail | `b3f07190-...` | `c816829b` |
| 7 | ProjectPortfolioSpotlight | `8370ab0c-...` | `5b95e6b4` |
| 8 | SafetyFieldExcellence | `89ca5ff3-...` | `9ffc1018` |
| 9 | ToolLauncherWorkHub | `cb7060f5-...` | `6a820db1` |
| 10 | LeadershipMessage | `e8fa8a84-...` | `1cb6c6a7` |

## Exclusions confirmed

- Excluded scaffold manifest (`535f5a17-...`): NOT in package
- Proof-case entries (`mount-hero-proof-case.tsx`, `mount-priority-actions-rail-proof-case.tsx`): NOT in production bundle
- Neutral shell ID (`9a2f7f61-...`): NOT in any per-webpart manifest `scriptResources`

## Shim proof

`dist/sppkg/hb-webparts-shim-proof.json` contains 10 entries confirming each webpart's `entryModuleId` maps to its dedicated shell entry file with matching `define()` name.

## Deployment readiness

This artifact is ready for upload to the SharePoint App Catalog.
