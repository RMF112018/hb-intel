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

The IIFE entry is `src/mount.tsx`; Vite emits
`dist/hb-intel-foleon-app.js` and exposes `window.__hbIntel_foleon`
with `mount` / `unmount`. The `${dir}-app.js` filename matches the
package-truth convention enforced by `tools/build-spfx-package.ts`.

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

## Runtime config validation and binding proof

`mount()` resolves `IFoleonMountConfig` into an immutable
`IFoleonRuntimeContract` via `resolveFoleonRuntimeContract`. The
contract is fail-closed: if any required field is missing under the
hosted host mode, `canInitialize` is `false` and the app renders a
safe banner instead of any route.

Typed failure codes (`FoleonConfigErrorCode`) — every blocking
condition maps to one of:

| Code | Condition | Scope |
| --- | --- | --- |
| `missing-site-url` | `pageContext.web.absoluteUrl` was not supplied | admin |
| `missing-content-registry-list-id` | `contentRegistryListId` missing | admin |
| `missing-placements-list-id` | `placementsListId` missing on the Highlights route | admin |
| `no-origins-allowlisted` | Normalized origin allowlist is empty | admin |
| `manifest-id-mismatch` | Caller-supplied `expectedManifestId` does not match the governed webpart ID | admin |
| `package-version-mismatch` | Caller-supplied `expectedPackageVersion` does not match `FOLEON_PACKAGE_VERSION` | admin |

All failure codes are admin-scope. End users always see a single
generic "contact an HB Central admin" sentence; admin-scope labels
are surfaced in-app only when `?foleon-diagnostics=1` is appended to
the page URL.

### Binding proof — `window.__hbIntel_foleonRuntimeBindingProof`

The proof is always published at mount time and is intentionally
**redacted**: raw list GUIDs, origin allowlist entries, reader route
path, caller-supplied docId, and caller-supplied expected manifest /
version values are never emitted. Operators get:

- `manifestId`, `packageVersion`, `bundleMarker` — governed identity.
- `hostMode`, `route`, `canInitialize` — runtime state.
- `presence.*` — booleans for every sensitive config field.
- `fingerprints.*` — 8-char FNV-1a fingerprints for the list GUIDs,
  reader route path, and origin allowlist set (sorted + deduped).
  Non-cryptographic; suitable only for deploy-correlation.
- `governance.*` — booleans: manifest / version identity match.
- `issueCodes` — array of `FoleonConfigErrorCode` values.
- `diagnostics.adminIssues` — present only when
  `?foleon-diagnostics=1` was in the URL; carries
  `{ code, adminLabel }` pairs. Standard tenant loads never emit
  this field.

No preview URL paths, credentials, or caller-supplied strings are
interpolated into the proof.

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

Full runbook: `docs/provisioning.md` (step-by-step, with dry-run command).

Canonical tenant-facing field tables live under
`docs/reference/sharepoint/list-schemas/hbcentral/lists/`:

- `hb-foleon-content-registry.md`
- `hb-foleon-homepage-placements.md`
- `hb-foleon-interaction-events.md`

The code-level schema source of truth is
`apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`. Drift between
the two is caught by
`src/schema/__tests__/foleonListSchemas.test.ts`.

Print the deterministic provisioning plan:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon provision:print
```

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
