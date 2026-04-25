# Foleon SharePoint provisioning runbook

Install the Foleon SPFx package on `/sites/HBCentral` to provision the
four governed SharePoint lists via the SPFx Feature Framework. This
replaces the prior manual-creation workflow — no one hand-builds the
lists from the markdown schema documents anymore.

Canonical field tables live under
`docs/reference/sharepoint/list-schemas/hbcentral/lists/`:

- `hb-foleon-content-registry.md`
- `hb-foleon-homepage-placements.md`
- `hb-foleon-interaction-events.md`
- `hb-foleon-sync-runs.md`

These markdown files mirror the code-level schemas in
`apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`, and the
Feature Framework XML in
`apps/hb-intel-foleon/sharepoint/assets/` mirrors both. Drift is
caught by:

- `src/schema/__tests__/foleonListSchemas.test.ts` — code vs. docs.
- `src/schema/__tests__/featureAssets.test.ts` — XML vs. code.

## 1. Packaging posture

This `.sppkg` contains SharePoint assets. Per Microsoft guidance:

- `skipFeatureDeployment` is **false** — the package is **site-installed**.
- Tenant-wide deployment is **not supported** for packages containing
  SharePoint assets.
- The package must be installed on each target site that should host
  the webpart + the four lists.

Launch target: `/sites/HBCentral`. Additional sites are a Wave 02
decision (no business need at launch per ADR-0125).

## 2. Pre-flight

- Tenant: `https://hedrickbrotherscom.sharepoint.com`
- Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Required role: SharePoint admin OR site owner on HBCentral
- Required artifact: `dist/sppkg/hb-intel-foleon.sppkg` (produced by
  `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon`).

## 3. Dry-run — print the provisioning plan

Run from repo root before uploading:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon provision:print \
  > /tmp/foleon-provisioning-plan.json
```

The plan is never written to tenant. Review it against the canonical
markdown reports before proceeding. It should list all four governed
lists in install order.

## 4. Upload to the tenant App Catalog

1. Sign in as SharePoint admin.
2. Open the tenant App Catalog.
3. Upload `dist/sppkg/hb-intel-foleon.sppkg`.
4. When SharePoint prompts **"Do you want to make this solution
   available to all sites in the organization?"** — answer **No**.
   This package cannot be tenant-wide-deployed. Tenant-wide
   deployment of a `.sppkg` containing SharePoint assets is
   unsupported and the feature framework will be silently ignored.
5. Confirm the App Catalog lists the package with version `1.0.14.0`.

## 5. Install on `/sites/HBCentral`

1. Navigate to
   `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
2. **Site Contents → New → App**.
3. Select **HB Intel Foleon Connector** from "From your
   organization".
4. Click **Add**. SharePoint runs feature activation, which executes
   `elements.xml` in order:
   1. Creates `Lists/HB_FoleonContentRegistry` from
      `schema-content-registry.xml`.
   2. Creates `Lists/HB_FoleonHomepagePlacements` from
      `schema-homepage-placements.xml` (its optional `ContentLookup`
      lookup binds to the list created in step 1; `ContentIdCache` is
      the runtime-critical relationship field).
   3. Creates `Lists/HB_FoleonInteractionEvents` from
      `schema-interaction-events.xml` (versioning disabled).
   4. Creates `Lists/HB_FoleonSyncRuns` from
      `schema-sync-runs.xml`.

## 6. Capture list GUIDs

The webpart still binds by list GUID at runtime. After install,
capture each GUID via browser DevTools or SharePoint REST:

```bash
# Replace {list-title} with each Foleon list title.
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonContentRegistry')?$select=Id
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonHomepagePlacements')?$select=Id
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonInteractionEvents')?$select=Id
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_api/web/lists/getbytitle('HB_FoleonSyncRuns')?$select=Id
```

Record the four GUIDs. They are required for webpart configuration.

## 7. Wire GUIDs into the webpart mount config

Add the Foleon webpart to a page on HBCentral and open the property
pane. Set:

- `contentRegistryListId` → GUID from `HB_FoleonContentRegistry`.
- `placementsListId` → GUID from `HB_FoleonHomepagePlacements`.
- `eventsListId` → GUID from `HB_FoleonInteractionEvents`.
- `acceptedFoleonOrigins` → at minimum `https://viewer.us.foleon.com`
  plus any custom publisher subdomain.
- `allowPreview` → leave `false` for production.
- `foleonApiBaseUrl` → existing HB Intel Functions app base URL, or
  omit only when the page is served from the same origin as `/api`.
- `foleonApiResource` → Entra resource/application ID URI used by SPFx
  to acquire backend access tokens.
- `expectedManifestId` → `2160edb3-675e-4451-92bb-8345f9d1c71e`.
- `expectedPackageVersion` → `1.0.14.0`.

`HB_FoleonSyncRuns` is written by the backend sync and validation
routes. Operators review the newest run proof in the connector's
`manage` route.

Save the page. The webpart should render.

## 8. Verify indexes, views, and lookup binding

1. **Indexes** — open each list → **Settings → Indexed columns** and
   confirm the launch-provisioned indexed set declared in the markdown
   docs is marked indexed. Feature Framework launch provisioning
   intentionally avoids over-indexing; recommended future indexes must
   be created through controlled provisioning and validated before
   service code treats them as filter-safe.
2. **Views** — each list shows only the minimal default `All Items`
   view immediately after Feature Framework provisioning. Create
   recommended filtered or sorted operational views only through
   controlled post-provision automation after clean-site list rendering
   is proven.
3. **Lookup binding** — on Homepage Placements → **Settings** →
   `ContentLookup` column → confirm it is optional and targets
   `Foleon Content Registry`. If SharePoint failed to resolve the
   URL-form lookup binding at feature activation time, the lookup will
   show as unresolved; repair it through controlled post-provisioning
   and validate `ContentLookupId` before tenant closure.
4. **Unique fields** — confirm `FoleonDocId`, `EventId`, and `RunId`
   are indexed and enforce unique values in SharePoint field settings.
   Source XML uses `EnforceUniqueValues="TRUE"`, but tenant closure
   requires clean-site proof.

## 9. Runtime binding proof

Open the page hosting the Foleon webpart. In browser DevTools:

```js
window.__hbIntel_foleonRuntimeBindingProof
```

Expected:

- `packageVersion === '1.0.14.0'`.
- `manifestId === '2160edb3-675e-4451-92bb-8345f9d1c71e'`.
- `hostMode === 'sharepoint'`.
- `canInitialize === true`.
- `presence.{siteUrl, contentRegistryListId, placementsListId,
  eventsListId}` all `true`.
- `fingerprints.{contentRegistryListSha, placementsListSha,
  eventsListSha}` non-zero.
- `issueCodes` is `[]`.

Add `?foleon-diagnostics=1` to the page URL to surface admin-scope
issues if any remain.

## 10. Audience groups

`AudienceGroups` on the Content Registry and Placements uses
Person/Group multi-value fields. Point them at HB Central Entra/M365
groups. Audience evaluation happens client-side in the SPFx webpart;
SharePoint group ACLs are not the audience gate.

## 11. Preview URL policy

`PreviewUrl` is captured for admin review only. Production readers
reject URLs containing `/preview/` unless the webpart's mount config
carries `allowPreview=true` — a setting reserved for admin-review
builds on non-production pages.

## 12. Known limitations

- **Lookup URL-form resolution is provisioning-time-sensitive.**
  `ContentLookup` is optional during Feature Framework provisioning. If
  the binding fails to resolve during feature activation, repair it
  through controlled post-provisioning and keep `ContentIdCache` as the
  runtime-critical relationship field.
- **Wave 02 deferrals** — `HB_FoleonProjectsRegistry` and
  `HB_FoleonAnalyticsSnapshots` schemas are not in this package (see
  ADR-0125). They require business-side field design.
- **Tenant-wide deployment is unavailable** for any package that
  provisions SharePoint assets. Installing on additional sites
  requires re-running steps 5–7 per site.
