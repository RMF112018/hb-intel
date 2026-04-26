# Registry Reader Runtime Bridge

## Scope
This wave adds the first typed consumer layer for the `HB Platform Configuration Registry`. It does not make the Foleon Manager fully write-ready and does not change backend routes, homepage layout, SPFx manifests, or package versions.

## Reader Contract
- Generic registry contracts and value normalization live in `@hbc/sharepoint-platform` as platform mechanics only.
- Foleon-specific key mapping lives outside `@hbc/sharepoint-platform`, in the Foleon runtime layer.
- Registry bootstrap configuration is explicit: host code must provide the HBCentral site URL, registry list title or GUID, environment key, and optional scope fallback rules.
- Live SPFx registry fetching is intentionally deferred. Current shell rendering is synchronous, and adding a delegated async SharePoint read during render would require broader lifecycle/cache decisions. This wave implements the typed reader, mapping, readiness, proof, and tests so a later lifecycle-safe fetch can supply records.

## Runtime Precedence
Resolution order is:

1. explicit page/webpart override;
2. valid active registry value;
3. allowed build/package default;
4. blocked diagnostic state.

Blocked, expired, duplicated, invalid, and secret-reference-only records are not consumed as normal runtime values.

## Foleon Mapping
- `FoleonContentRegistryListGuid` -> `contentRegistryListId`
- `FoleonHomepagePlacementsListGuid` -> `placementsListId`
- `FoleonInteractionEventsListGuid` -> `eventsListId`
- `FoleonApiBaseUrl` -> `foleonApiBaseUrl`
- `BackendFunctionAppUrl` -> fallback for `foleonApiBaseUrl` only when `FoleonApiBaseUrl` is missing
- `AcceptedFoleonOrigins` -> `acceptedFoleonOrigins`
- `AllowPreview` -> `allowPreview`
- `ExpectedManifestId` -> `expectedManifestId`
- `FoleonExpectedPackageVersion` -> standalone Foleon expected package version
- `HomepageExpectedPackageVersion` remains unresolved and is not promoted to homepage runtime until populated
- `FoleonSyncRunsListGuid` is backend/admin-readiness metadata only; it is not passed into current frontend mount config
- `FoleonClientSecret` is never passed into frontend runtime config

## Readiness States
- `listBindingsReady=true` only when required Foleon list GUIDs resolve and parse as GUIDs.
- `backendUrlReady=true` only when `FoleonApiBaseUrl` or allowed `BackendFunctionAppUrl` fallback resolves as HTTPS and does not include `/api`.
- `authResourceReady=false` until `FoleonApiResource` is populated and valid.
- `tokenProviderReady=false` until SPFx token acquisition succeeds.
- `writePathReady=false` until backend URL, API resource, token provider, and backend safe-config readiness are all proven.

Expected post-wave state:

```text
listBindingsReady=true
backendUrlReady=true
authResourceReady=false
tokenProviderReady=false
writePathReady=false
```

## Safe Proof
Runtime proof may expose key names, source/status by key, counts, readiness booleans, duplicate flags, secret hygiene status, and fingerprints. It must not expose raw secret references, secret reference names, access tokens, raw API resources, raw backend URLs, or raw list GUIDs in standard proof.

## Remaining Manual Actions
- Populate and validate `FoleonApiResource`.
- Populate or confirm `HomepageExpectedPackageVersion`.
- Add lifecycle-safe live registry fetching in SPFx host code so records can be supplied to the typed resolver without blocking synchronous render.
- Prove backend safe-config readiness before marking Manager writes ready.
