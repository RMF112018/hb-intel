# Foleon Final Package and Tenant Validation Runbook

Use this runbook to validate the registry-first Foleon Manager after the `1.0.27.0` package is built and uploaded to SharePoint. Local package proof and tenant-hosted proof are separate gates; do not mark deployment complete until hosted evidence is captured.

## Targets

- Registry list: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Platform%20Configuration%20Registry`
- Manager page: `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx`
- Marketing site root for homepage lanes: `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New`
- Package artifact to deploy: `dist/sppkg/hb-intel-foleon.sppkg`
- Expected package version: `1.0.27.0`
- Foleon web part ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- App ID / API resource basis: `08c399eb-a394-4087-b859-659d493f8dc7`

## Source and Package Proof

Run locally before upload:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Expected package proof fields:

- `solutionVersion`: `1.0.27.0`
- `feature.version`: `1.0.27.0`
- `components[0].id`: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- Every preconfigured entry `expectedPackageVersion`: `1.0.27.0`
- Package truth proof `checks.structuralValidity.pass`: `true`
- Package truth proof `checks.freshness.pass`: `true`
- Package truth proof `checks.sourcePackageSemanticAlignment.pass`: `true`
- Package truth proof `checks.liveRuntimeProof.pass`: `true`

## Registry Proof

Run:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production"
```

Expected proof fields:

- List URL: `/sites/HBCentral/Lists/HB Platform Configuration Registry`
- Field count: `54`
- Index count: `12`
- Seeded record count: `14 / 14`
- Duplicate active key check: `pass`
- Secret storage check: `pass`
- Read access: `True`
- Write access: `True`
- Failures: `0`
- Warnings: `0`
- `FoleonApiResource` configured as `api://08c399eb-a394-4087-b859-659d493f8dc7` with no `/.default` or custom scope suffix.
- `FoleonClientSecret` remains a secret reference only; do not enter the raw secret in SharePoint.

## Hosted Manager Validation

Open `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx` after uploading and approving `hb-intel-foleon.sppkg`.

Capture screenshots of:

- Manager page loaded with no fatal error.
- `Homepage Foleon Content` tab.
- `Config` tab showing registry source and redacted values.
- Write actions disabled when `writePathReady=false`, or enabled only after backend safe config and route authorization are proven.
- Publish/readiness checklist for one content item.
- Unauthorized user denial using a non-admin or non-marketing test user.

Run in browser DevTools Console:

```js
JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
```

Expected proof fields:

- `packageVersion`: `1.0.27.0`
- `manifestId`: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- `hostMode`: `sharepoint`
- `route`: `manage`
- `governance.manifestIdMatchesExpected`: `true`
- `governance.packageVersionMatchesExpected`: `true`
- `registry.registryResolved`: `true`
- `registry.registryListPresent`: `true`
- `registry.registryValuesMissing`: `[]`
- `registry.registryValuesBlocked`: `[]`
- `registry.registryValuesInvalid`: `[]`
- `registry.registryValuesExpired`: `[]`
- `registry.registryDuplicateActiveKeysDetected`: `false`
- `registry.registrySecretHygieneStatus`: `pass`
- `registry.registryFetchStatus`: `available`
- `registry.foleonReadiness.registryReady`: `true`
- `registry.foleonReadiness.listBindingsReady`: `true`
- `registry.foleonReadiness.backendUrlReady`: `true`
- `registry.foleonReadiness.authResourceReady`: `true`
- `registry.foleonReadiness.readPathReady`: `true` only after the Manager read probe succeeds.
- `registry.foleonReadiness.writePathReady`: `true` only after backend safe config and route authorization are proven.

Save the JSON output as hosted runtime evidence. Redact fingerprints only if required by policy; do not paste tokens or raw secrets.

## Homepage Lane Validation

Open the Marketing site homepage or the deployed homepage page under `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New`.

Capture screenshots for all three lanes:

- Project Spotlight
- Company Pulse
- Leadership Message

For each lane, record:

- Lane state: Live, Preview, Blocked, Empty, or Config Incomplete.
- Active content title and Foleon doc ID when visible.
- Any blocked reasons shown in the UI.
- Whether `Open Foleon` or reader launch appears only for policy-valid production URLs.
- Console proof from `window.__hbIntel_foleonRuntimeBindingProof` if the Foleon package owns the hosted reader web part on that page.

## Rollback

Do not delete the registry list during rollback. Preserve audit history and proof artifacts.

To deactivate registry-driven config:

1. Open `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/HB%20Platform%20Configuration%20Registry`.
2. Filter `ApplicationKey=Foleon`, `EnvironmentKey=Production`, `IsActive=True`.
3. For the affected records only, set `IsActive=False`.
4. Add an `AdminNotes` entry with date, operator, reason, and rollback ticket.
5. Re-run registry validation and confirm duplicate active keys remain `0`.

To restore page/webpart overrides:

1. Edit the affected SharePoint page.
2. Open the Foleon web part property pane.
3. Re-enter the prior known-good explicit values for list IDs, route, accepted origins, API base URL, and expected package version as needed.
4. Publish the page.
5. Confirm `window.__hbIntel_foleonRuntimeBindingProof.configSource` shows the expected top-level or nested override source.

To redeploy the prior package:

1. Use the prior known-good `.sppkg` from release storage or rebuild the prior commit if release storage is unavailable.
2. The immediate prior Foleon package version before this wave was `1.0.26.0`.
3. Upload the prior package to the SharePoint app catalog.
4. Approve deployment and hard-refresh the hosted page.
5. Confirm runtime proof `packageVersion` matches the prior expected version before declaring rollback complete.

Failure triage:

- Registry failure: registry proof has missing, blocked, invalid, expired, duplicate, or secret-hygiene failures; Config tab shows registry unavailable or missing values.
- Package failure: package proof fails, runtime proof has the wrong `packageVersion`, or the hosted bundle lacks `__hbIntel_foleon`.
- Backend/auth failure: registry values resolve but token provider, token acquisition, backend safe config, or route authorization readiness is false.
- Homepage lane data failure: package and registry are healthy, but lane state is Blocked/Empty due to content record publish status, display window, origin policy, placement mismatch, or duplicate active edition.
