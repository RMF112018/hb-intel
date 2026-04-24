# hb-intel-foleon

Governed SPFx surface for Marketing's Foleon publications on HB Central.
One webpart (`FoleonWebPart`) drives three internal routes selected by
URL search params:

| Route | `?foleonRoute=` | Purpose |
| --- | --- | --- |
| Highlights | `highlights` (default) | Homepage card surface backed by `HB_FoleonHomepagePlacements` |
| Reader | `reader` | SharePoint-hosted iframe reader with hard gating |
| Content Hub | `hub` | Archive / search over `HB_FoleonContentRegistry` |

The reader web part never renders an iframe until every gate passes:
`IsVisible`, `PublishStatus=Published`, `AllowEmbed`, not
`RequiresExternalOpen`, a non-empty published/embed URL, display
window, and URL origin on the allowlist.

## Build / test

```bash
pnpm --filter @hbc/spfx-foleon build
pnpm --filter @hbc/spfx-foleon test
pnpm --filter @hbc/spfx-foleon lint
```

The IIFE entry is `src/mount.tsx`; Vite emits `dist/foleon-app.js`
and exposes `window.__hbIntel_foleon` with `mount` / `unmount`.

## SPFx packaging

Domain is registered in `tools/build-spfx-package.ts`:

```text
{ dir: 'hb-intel-foleon', camel: 'foleon', pascal: 'Foleon', packagingModel: 'single' }
```

Produce the `.sppkg`:

```bash
pnpm tsx tools/build-spfx-package.ts --domain foleon
```

## Mount config contract

The shell passes `IFoleonMountConfig` into `mount()`:

| Field | Purpose |
| --- | --- |
| `contentRegistryListId` | GUID of `HB_FoleonContentRegistry` (required in hosted mode) |
| `placementsListId` | GUID of `HB_FoleonHomepagePlacements` (required for Highlights route) |
| `eventsListId` | GUID of `HB_FoleonInteractionEvents` (optional; telemetry seam) |
| `acceptedFoleonOrigins` | Exact-origin allowlist; defaults to `['https://viewer.us.foleon.com']` |
| `allowPreview` | Admin-review only; permits `/preview/` URLs |
| `foleonReaderRoutePath` | Optional SitePage URL (e.g. `/sites/HBCentral/SitePages/Foleon-Reader.aspx`) pinned to the reader webpart |
| `expectedManifestId` / `expectedPackageVersion` | Governance proof values |

No Foleon API credentials are accepted or used. Direct API access and
OAuth client-credentials flows are owned exclusively by the Azure
Functions backend; the SPFx bundle must not ship secrets.

## Deferred scope

The following items from the integration plan are intentionally not
implemented in this ship; they do not block MVP:

- **Backend sync** — Azure Functions Foleon OAuth/sync/analytics routes
  (`docs/architecture/plans/MASTER/spfx/foleon/integration-plan/04_…`).
  The telemetry service will flip from direct list POST to
  `POST /api/foleon/events` when the backend lands, with no consumer
  change.
- **Additional SharePoint lists** — `HB_FoleonProjectsRegistry`,
  `HB_FoleonAnalyticsSnapshots`, `HB_FoleonSyncRuns`. Only the three
  MVP lists are queried: content registry, homepage placements,
  interaction events.
- **Admin Panel webpart** — admins use SharePoint list default forms
  to edit overrides for the MVP.
- **Homepage launcher card registration** — Highlights currently ships
  as its own webpart. A follow-up will register it inside
  `@hbc/homepage-launcher` once the surface is verified in tenant.

## Provisioning checklist (tenant side)

The canonical schemas live in
`docs/architecture/plans/MASTER/spfx/foleon/integration-plan/02_sharepoint_data_model.md`.
For MVP, provision in `/sites/HBCentral`:

1. `HB_FoleonContentRegistry` — all columns per §List 1, indexes on the
   fields listed under _Required Indexed Columns_.
2. `HB_FoleonHomepagePlacements` — all columns per §List 3 with its
   indexes; `ContentLookup` is a Lookup to Content Registry.
3. `HB_FoleonInteractionEvents` — columns per §List 4 with its
   indexes.
4. Add the three list GUIDs to the webpart mount config.
5. Add `https://viewer.us.foleon.com` to the tenant iframe allowlist
   (or the custom `stories.hedrickbrothers.com` subdomain when it
   ships) and register it in `acceptedFoleonOrigins`.
6. Marketing attaches the Foleon-side remarketing script with
   `origins` limited to `https://hedrickbrotherscom.sharepoint.com`.

## Security posture

- Exact-origin allowlist; wildcards are rejected at config parse time.
- Preview URLs are blocked unless `allowPreview=true`.
- `postMessage` events are validated by origin, shape, and numeric
  height bounds before mutating the iframe.
- Telemetry writes are best-effort; failure never surfaces to the
  user and never leaks backend errors into the UI.
- No Foleon client secret or API token is bundled.
