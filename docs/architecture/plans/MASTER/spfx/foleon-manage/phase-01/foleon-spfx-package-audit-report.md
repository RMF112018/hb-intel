# HB Intel Foleon SPFx Package Audit Report

Date: 2026-04-25
Remediated artifact: `dist/sppkg/hb-intel-foleon.sppkg`
Package SHA-256: `3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc`
Package proof: `dist/sppkg/hb-intel-foleon-package-proof.json`

## Executive Conclusion

The root issue was toolbox ambiguity, not a missing manager runtime. Repo truth remains a single route-driven SPFx web part with one component ID, `2160edb3-675e-4451-92bb-8345f9d1c71e`, and runtime routes for `highlights`, `reader`, `hub`, and `manage`.

The package has been remediated by adding a second `preconfiguredEntries` item to the existing Foleon web part manifest. The generated `.sppkg` now proves two visible SharePoint toolbox entries:

- `HB Intel Foleon Highlights` with `foleonRoute="highlights"`
- `HB Intel Foleon Manager` with `foleonRoute="manage"`

Toolbox visibility is not authorization. The manager surface remains gated by the runtime management API/token path; tests prove a `403` manager authorization rejection renders an error state and does not expose registry or sync controls.

## Before And After

Before remediation, the inspected package `hb-intel-foleon(2).sppkg` had:

- Product ID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`
- Solution version: `1.0.10.0`
- Feature version: `1.0.10.0`
- Component ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- Single toolbox entry: `HB Intel Foleon Connector`
- Default route: `foleonRoute="highlights"`

After remediation, `dist/sppkg/hb-intel-foleon.sppkg` proves:

- Product ID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`
- Solution version: `1.0.11.0`
- Feature version: `1.0.11.0`
- Component ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- Supported hosts: `["SharePointWebPart"]`
- Loader asset path: `shell-entry-2160edb3-675e-4451-92bb-8345f9d1c71e-2e2d108e.js`
- Toolbox entries:
  - `HB Intel Foleon Highlights`, `hiddenFromToolbox=false`, `foleonRoute="highlights"`
  - `HB Intel Foleon Manager`, `hiddenFromToolbox=false`, `foleonRoute="manage"`

## Manifest Diff Summary

Changed source authorities:

- `apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json`
- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`

The manifest keeps the existing component ID and changes only the release version plus the `preconfiguredEntries` shape. The public entry is now titled `HB Intel Foleon Highlights`; the new manager entry is titled `HB Intel Foleon Manager` and defaults to `foleonRoute="manage"`.

## Package Unzip Evidence

The custom proof command was:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

The proof script unzipped `dist/sppkg/hb-intel-foleon.sppkg` and validated:

- `AppManifest.xml` Product ID: `c23635f5-ab4d-44c2-96b5-2a2c90f4afc0`
- `AppManifest.xml` Version: `1.0.11.0`
- `feature_ae66c036-8036-4f10-bb63-0d75107e7ce9.xml` Version: `1.0.11.0`
- Web part XML: `ae66c036-8036-4f10-bb63-0d75107e7ce9/WebPart_2160edb3-675e-4451-92bb-8345f9d1c71e.xml`
- Loader asset path: `shell-entry-2160edb3-675e-4451-92bb-8345f9d1c71e-2e2d108e.js`
- All proof checks passed.

## List Schema Packaging Evidence

The generated package includes the Feature Framework assets for all four Foleon lists:

- `schema-content-registry.xml`
- `schema-homepage-placements.xml`
- `schema-interaction-events.xml`
- `schema-sync-runs.xml`

Packaging output also reported: `Staged 5 Feature Framework asset(s) for hb-intel-foleon: elements.xml, schema-content-registry.xml, schema-homepage-placements.xml, schema-interaction-events.xml, schema-sync-runs.xml`.

This proves the list schemas are packaged. It does not prove existing tenant lists are usable or repaired.

## Runtime And Authorization Proof

Route render/deep-link tests cover:

- `foleonRoute=highlights`
- `foleonRoute=manage`
- `foleonRoute=hub`
- `foleonRoute=reader&docId=1234`

Unauthorized manager-route proof was added to `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`. It simulates a management API `403` response and proves the manager route does not expose registry or sync controls.

## Validation Results

Commands run from repo root:

- `pnpm --filter @hbc/spfx-hb-intel-foleon test -- src/webparts/foleon/__tests__/FoleonWebPartManifest.test.ts` passed: 21 files, 286 tests.
- `pnpm --filter @hbc/spfx-hb-intel-foleon test -- src/__tests__/routeDeepLinks.test.tsx src/pages/__tests__/ManagePage.test.tsx` passed: 21 files, 286 tests.
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` passed with existing warnings only: 0 errors, 128 warnings.
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` passed.
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` passed: 21 files, 286 tests.
- `pnpm --filter @hbc/spfx-hb-intel-foleon build` passed.
- `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon` passed and emitted `dist/sppkg/hb-intel-foleon.sppkg`.
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof` passed and emitted `dist/sppkg/hb-intel-foleon-package-proof.json`.

## Tenant Drift Assessment

If a tenant still shows only a reader entry after deploying this artifact, the tenant is not resolving `dist/sppkg/hb-intel-foleon.sppkg` version `1.0.11.0`, or the target site has a stale site app instance/component cache. The expected toolbox search terms are now:

- `HB Intel Foleon Highlights`
- `HB Intel Foleon Manager`
- `Foleon`
- `HB Intel`

The companion runbook documents app catalog and site-installed app drift checks plus uninstall/reinstall or upgrade guidance for stale site instances.

## List Provisioning Posture

The toolbox remediation does not repair list provisioning defects. Existing broken lists may remain broken after package upgrade because the package contains list schemas and no explicit feature upgrade actions that repair already-created list instances.

Open list validation remains separate:

- Confirm all four lists open in SharePoint UI.
- Confirm fields and default views are readable through REST/Graph.
- Confirm intended app paths can read/write the lists.
- Capture root-cause evidence for any list that appears in Site Contents but fails to load, including list GUID, fields payload, view fields, correlation ID, browser console error, and network response.

Do not claim list provisioning closure until those tenant checks pass independently.
