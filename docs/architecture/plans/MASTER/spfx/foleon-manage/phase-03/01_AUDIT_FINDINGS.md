# HB Intel Foleon Runtime-Contract Audit Findings

## Objective

Identify why both Foleon webpart entries render the configuration-error state even though the tenant lists now provision and are accessible.

The immediate target is the SPFx initialization/runtime-contract path:

```text
SharePoint page webpart properties
→ ShellWebPart runtime config creation
→ Foleon mount config
→ resolveFoleonRuntimeContract()
→ contract.canInitialize
→ FoleonApp configuration-error rendering
```

## Summary Finding

The strongest source-side finding is a runtime configuration shape mismatch.

The Foleon app expects its mount config to conform to `IFoleonMountConfig` at the top level:

```ts
config.contentRegistryListId
config.placementsListId
config.eventsListId
config.acceptedFoleonOrigins
config.expectedManifestId
config.expectedPackageVersion
config.foleonRoute
config.foleonApiBaseUrl
config.foleonApiResource
```

The generic SPFx shell currently passes page instance properties under a nested object:

```ts
runtimeConfig.webPartProperties = this.properties as Record<string, unknown>;
```

The Foleon runtime contract does not read `config.webPartProperties.contentRegistryListId`; it reads `config.contentRegistryListId`.

Therefore, Foleon-specific page instance properties can be present on the SharePoint page and still be invisible to the Foleon contract unless the shell explicitly bridges them into the top-level mount config.

## Evidence Map

### Finding A — `contract.canInitialize` is false when required top-level config is missing

File:

```text
apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts
```

Relevant behavior:

```ts
const listIds = {
  contentRegistry: normalizeText(params.config?.contentRegistryListId),
  placements: normalizeText(params.config?.placementsListId),
  events: normalizeText(params.config?.eventsListId),
};

if (hostMode === 'sharepoint') {
  if (!params.siteUrl) issues.push(makeIssue('missing-site-url'));
  if (!listIds.contentRegistry) issues.push(makeIssue('missing-content-registry-list-id'));
  if (route === 'highlights' && !listIds.placements) {
    issues.push(makeIssue('missing-placements-list-id'));
  }
}

canInitialize: hostMode === 'mock' || issues.length === 0
```

Targeted remediation:

- Ensure `contentRegistryListId`, `placementsListId`, and `eventsListId` are actually supplied at top level to `mount()`.
- Do not treat successful list provisioning as sufficient runtime configuration.

### Finding B — `FoleonApp` renders the exact screenshot state when `canInitialize` is false

File:

```text
apps/hb-intel-foleon/src/FoleonApp.tsx
```

Relevant behavior:

```ts
if (!contract.canInitialize) {
  const diagnosticsOn =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('foleon-diagnostics') === '1';

  const adminDetail = diagnosticsOn
    ? contract.issues
        .filter((issue) => issue.scope === 'admin')
        .map((issue) => `${issue.code}: ${issue.adminLabel}`)
        .join(' ')
    : undefined;

  return (
    <FoleonError
      title="Foleon integration is not available right now."
      description={
        adminDetail ??
        'Foleon integration is not fully configured. Contact an HB Central admin.'
      }
    />
  );
}
```

Targeted remediation:

- Keep the generic user-safe message.
- Improve admin diagnostics and runtime proof so HB Central admins can see exact missing fields without digging through source.

### Finding C — Foleon preconfigured entries only provide `foleonRoute`

File:

```text
apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json
```

Current packaged entries:

```json
{
  "title": { "default": "HB Intel Foleon Highlights" },
  "properties": {
    "foleonRoute": "highlights"
  }
}
```

```json
{
  "title": { "default": "HB Intel Foleon Manager" },
  "properties": {
    "foleonRoute": "manage"
  }
}
```

Targeted remediation:

- Add safe, non-tenant-specific defaults where possible:
  - `acceptedFoleonOrigins`
  - `expectedManifestId`
  - `expectedPackageVersion`
- Do not hard-code tenant-specific list GUIDs into the manifest.
- Add property pane fields for tenant-specific values.

### Finding D — Shell bridge currently nests properties instead of passing Foleon config shape

File:

```text
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
```

Current behavior:

```ts
runtimeConfig.webPartProperties = this.properties as Record<string, unknown>;
runtimeConfig.assetBaseUrl = this._assetBaseUrl;
```

The Foleon app receives `runtimeConfig` as `config`, but `resolveFoleonRuntimeContract()` does not inspect `webPartProperties`.

Targeted remediation:

- Add a Foleon-specific bridge in `ShellWebPart.render()` or a helper method.
- Use an explicit allowlist of Foleon config keys.
- Avoid blindly spreading all page instance properties into every app domain.

### Finding E — `foleonApiResource` does not currently block initialization

File:

```text
apps/hb-intel-foleon/src/mount.tsx
```

Relevant behavior:

```ts
const tokenProvider =
  spfxContext && config?.foleonApiResource
    ? await createBackendTokenProvider(spfxContext, config.foleonApiResource)
    : undefined;
```

No issue is added for missing `foleonApiResource`.

Targeted remediation:

- Do not chase SharePoint Admin API access approvals as the first explanation for this specific red configuration state.
- Keep backend auth validation separate unless diagnostics prove API config is the failing issue.

### Finding F — Package proof validates route entries but not full initialization defaults

File:

```text
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
```

Current proof checks:

- Product ID.
- Solution version.
- Feature version.
- Component ID.
- Supported hosts.
- Toolbox entry visibility.
- Toolbox route values.
- Feature assets and schema files.

Current proof does not validate that the shell bridge passes Foleon properties to `mount()` in the shape the runtime contract requires.

Targeted remediation:

- Add a proof or test that checks the Foleon package has both route entries and that runtime config wiring supports required Foleon properties.
- Add targeted tests around config bridging and diagnostics.

## Likely Runtime Symptoms

If the bridge defect is present, browser console proof may show:

```json
{
  "canInitialize": false,
  "route": "highlights",
  "presence": {
    "contentRegistryListId": false,
    "placementsListId": false,
    "eventsListId": false
  },
  "issueCodes": [
    "missing-content-registry-list-id",
    "missing-placements-list-id"
  ]
}
```

If the Manager entry also reports `route: "highlights"`, then `foleonRoute` is also not reaching the app at top level.

If the Manager entry reports `route: "manage"` but still fails, then the route is reaching the app, but the list GUIDs are not.

## Minimum Safe Remediation

1. Fix the shell-to-Foleon config bridge.
2. Add Foleon property pane fields.
3. Add safe manifest defaults for non-tenant-specific Foleon values.
4. Add package proof / tests for the bridge and diagnostics.
5. Deploy `1.0.14.0`.
6. Update or recreate SharePoint page instances so persisted properties exist and are current.
7. Confirm runtime proof shows `canInitialize: true`.

## Non-Targets

Do not change these unless new evidence proves they are directly involved:

- SharePoint list schemas.
- Feature Framework provisioning assets.
- Indexes, uniqueness, lookup behavior.
- Reader iframe origin policy.
- Safety app code.
- Shell behavior for unrelated webparts.
- UI styling.
