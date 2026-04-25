# 03 — Config And Property Pane Plan

## Required Homepage-Specific Properties

Add homepage-specific Foleon properties for the HB Homepage webpart ID `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`:

- `foleonContentRegistryListId`
- `foleonPlacementsListId`
- `foleonEventsListId`
- `foleonAcceptedOrigins`
- `foleonAllowPreview`
- `foleonExpectedManifestId`
- `foleonExpectedPackageVersion`
- `foleonApiBaseUrl`
- `foleonApiResource`

These names are intentionally homepage-specific so they do not collide with the standalone Foleon webpart property bridge.

## SPFx Shell Webpart Changes

In `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`:

- Add `HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf'` if not already present.
- Extend `IShellWebPartProperties` with the homepage-specific fields.
- Add a property-pane branch for `HB_HOMEPAGE_WEBPART_ID`.
- Keep the existing Foleon branch scoped to `FOLEON_WEBPART_ID`.
- Do not reuse `contentRegistryListId`, `placementsListId`, `eventsListId`, or other standalone Foleon property names for the homepage branch.

Suggested property-pane groups:

- `Embedded Foleon lists`
  - content registry list ID
  - placements list ID
  - interaction events list ID
- `Embedded Foleon governance`
  - accepted origins
  - allow preview URLs
  - expected manifest ID
  - expected package version
- `Embedded Foleon backend`
  - API base URL
  - API resource

Default guidance:

- `foleonExpectedManifestId` should reference Foleon webpart ID `2160edb3-675e-4451-92bb-8345f9d1c71e`.
- `foleonExpectedPackageVersion` should be `1.0.21.0` unless Wave 02 changes and packages Foleon again.

## Runtime Config Passing

`ShellWebPart.render()` already attaches:

- `runtimeConfig.webPartId`
- `runtimeConfig.webPartProperties = this.properties`

For the homepage, it is acceptable to pass the raw homepage-specific properties through `webPartProperties`; the homepage mount and shell can parse them. Do not apply the existing `applyFoleonRuntimeConfigBridge` to the homepage webpart because that bridge currently maps standalone Foleon property names and only runs for `FOLEON_WEBPART_ID`.

If a helper is added, name it clearly, for example:

- `buildHomepageEmbeddedFoleonConfigBridge(properties)`

It should produce homepage-specific fields only and avoid changing the standalone Foleon bridge behavior.

## Homepage Mount

`apps/hb-homepage/src/mount.tsx` already reads `config.webPartProperties` and passes it to `HbHomepage` as `config`.

Plan:

- Keep that pass-through.
- If `foleonApiResource` is present, create a token provider with the existing `createApiTokenProvider(foleonApiResource)` helper and pass it through a new optional `getFoleonApiToken` prop.
- If `foleonApiResource` is absent, do not create a token provider.

## Homepage Contract And Shell Config

In `hbHomepageContract.ts`, add optional props only if needed:

- `getFoleonApiToken?: () => Promise<string>`

In `shellTypes.ts` / `shellSchema.ts`, add a shell config slice such as:

```ts
foleon?: {
  foleonContentRegistryListId?: string;
  foleonPlacementsListId?: string;
  foleonEventsListId?: string;
  foleonAcceptedOrigins?: string | string[];
  foleonAllowPreview?: boolean;
  foleonExpectedManifestId?: string;
  foleonExpectedPackageVersion?: string;
  foleonApiBaseUrl?: string;
  foleonApiResource?: string;
}
```

Alternatively, keep the values at top-level config and expose a dedicated parser such as `extractHomepageFoleonConfig(config)`. The preferred approach is a dedicated parser to avoid widening unrelated `ModuleConfigSlices` too much.

## Mapping Into `IFoleonMountConfig`

The lane host maps homepage-specific names into `@hbc/foleon-reader` names:

- `contentRegistryListId = foleonContentRegistryListId`
- `placementsListId = foleonPlacementsListId`
- `eventsListId = foleonEventsListId`
- `acceptedFoleonOrigins = parse foleonAcceptedOrigins`
- `allowPreview = foleonAllowPreview`
- `expectedManifestId = foleonExpectedManifestId`
- `expectedPackageVersion = foleonExpectedPackageVersion`
- `foleonApiBaseUrl = foleonApiBaseUrl`
- `foleonApiResource = foleonApiResource`
- `foleonRoute = lane`

No tenant GUID is hardcoded. Missing GUIDs should produce an invalid/config content-state and a visible safe error from the embedded reader contract, not a fake preview.

## Token/API Decision

The current Foleon reader public path resolves SharePoint list content using the current page context and SharePoint REST, so the embedded lanes do not need a backend token for the normal public read path.

Only wire `getAccessToken` into `createEmbeddedFoleonRuntimeContract` when `foleonApiResource` is configured. Use the existing SPFx `aadTokenProviderFactory` path via homepage mount. Do not invent a new auth flow.
