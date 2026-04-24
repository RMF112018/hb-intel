# How to set and verify Safety runtime binding

This runbook covers the **governed** runtime binding for the Safety SPFx webpart. Binding is fail-closed: if any governed value drifts from the manifest, package-solution, runtime-binding file, or hosted GUID overlay, the app blocks at mount with explicit blocking reasons.

## What is governed (and what is not)

Governed (repo-controlled, not operator-editable):
- **SPFx manifest id** — `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json` (`id` field)
- **Package-solution version** — `apps/safety/config/package-solution.json` (`solution.version`) — must match manifest version
- **Accepted backend origin** — `apps/safety/config/runtime-binding.json` (`acceptedBackendOrigin`)
- **Expected API audience** — `apps/safety/config/runtime-binding.json` (`expectedApiAudience`)
- **Hosted GUID overlay fingerprint** — derived from `apps/safety/src/runtime/hostedSafetyGuidBinding.ts`

Operator-editable via property pane (validated against governed values):
- `Function App URL` — free text; origin is extracted and must equal `acceptedBackendOrigin` or the app fails closed.
- `API Audience` — free text; must equal `expectedApiAudience` or the app fails closed.
- `Description` — unused in binding.

The manifest ships with governed defaults in `preconfiguredEntries[0].properties` so SharePoint pre-populates the matching values when the webpart is first dropped.

## Setting values for a new environment

1. Edit `apps/safety/config/runtime-binding.json`:
   ```json
   {
     "acceptedBackendOrigin": "https://<function-app>.azurewebsites.net",
     "expectedApiAudience": "api://<function-app>",
     "defaultFunctionAppUrl": "https://<function-app>.azurewebsites.net",
     "defaultApiAudience": "api://<function-app>"
   }
   ```
2. (Optional) set env vars at build time to override:
   - `HBC_SAFETY_ACCEPTED_BACKEND_ORIGIN`
   - `HBC_SAFETY_EXPECTED_API_AUDIENCE`
   - `HBC_SAFETY_DEFAULT_FUNCTION_APP_URL`
   - `HBC_SAFETY_DEFAULT_API_AUDIENCE`
   - `HBC_SAFETY_BUILD_SHA`
   - `HBC_SAFETY_BUILD_TIMESTAMP`
3. Bump the SPFx 4-part version in both `SafetyWebPart.manifest.json` and `package-solution.json` (they must match).
4. Commit.

## Verifying before release

Run:

```
pnpm --filter @hbc/spfx-safety release-proof
```

This emits JSON to stdout and writes `apps/safety/dist/safety-release-proof.json`. The script exits non-zero if any governed field is missing or inconsistent. Example output:

```json
{
  "generatedAt": "2026-04-24T17:30:00.000Z",
  "buildSha": "...",
  "manifest": { "id": "...", "version": "1.2.37.0" },
  "packageSolution": { "id": "...", "name": "hb-intel-safety", "version": "1.2.37.0" },
  "runtimeBinding": {
    "acceptedBackendOrigin": "https://hb-intel-api-production.azurewebsites.net",
    "expectedApiAudience": "api://hb-intel-api-production",
    "hostedGuidOverlayFingerprint": "fnv1a32:xxxxxxxx"
  }
}
```

## Verifying after deploy

In the browser on a page hosting the Safety webpart:

```js
console.log(window.__hbIntel_safetyRuntimeBindingProof);
```

Expected:
- `runtimeContract.canInitializeCommands === true`
- `runtimeContract.blockingReasons` is empty
- `governedAuthority.expectedPackageVersion` matches the shipped `package-solution.json`
- `governedAuthority.expectedHostedGuidOverlayFingerprint` matches the release-proof output

If `blockingReasons` is non-empty, read each reason — each one maps to exactly one governed field that failed validation. Common failures:

| Reason | Root cause |
|---|---|
| `Backend base URL origin does not match accepted backend origin.` | Property pane `Function App URL` points at a host the governed allowlist does not include. |
| `API audience does not match governed expected audience.` | Property pane `API Audience` diverged from `config/runtime-binding.json`. |
| `Expected package version does not match governed Safety package version.` | Manifest and package-solution versions are out of sync, or vite build-time constant was not applied. |
| `Hosted GUID overlay fingerprint does not match expected governance value.` | Overlay GUIDs changed without updating callers; regenerate the release proof. |

## Why governance instead of property-pane-only

A free-text property-pane field is user-editable state. A typo or hostile edit can move the entire backend allowlist. Governed binding ensures:

- The allowlist is committed to source control and code-reviewed like any other change.
- Property-pane edits can **match** the allowlist but not **widen** it.
- The release-proof artifact is reproducible and ships alongside the `.sppkg` for deploy sign-off.
