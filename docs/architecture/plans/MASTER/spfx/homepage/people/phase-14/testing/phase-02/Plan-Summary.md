# Plan Summary

## Objective
Replace the People & Culture + HB Kudos test suite’s current bearer-token-first live authentication model with a **device-login-first** model that is appropriate for human-operated SharePoint live testing.

## Current Repo-Truth Problem
The suite’s live-run path is presently built around bearer-token acquisition and bearer-token injection:
- runners parse `--token`
- context passes `explicitToken`
- auth helper reads `SHAREPOINT_BEARER_TOKEN`
- auth helper falls back to `az account get-access-token`
- docs still instruct live runs with `--token <bearer-token>`
- docs explicitly say interactive auth is not yet implemented

This means the suite is **not** presently device-login-first.

## Recommended Technical Direction
Use **MSAL Node** with **PublicClientApplication.acquireTokenByDeviceCode()** as the primary live auth path, with secure persisted cache support via **msal-node-extensions**.

### Why this is the best fit
- This is a Node/TypeScript CLI harness, not a browser app.
- The tool is human-operated and needs interactive delegated auth.
- The suite calls SharePoint REST directly, so a user-delegated token model aligns with the existing request path.
- MSAL Node gives direct control over:
  - device code UX
  - silent cache reuse
  - account selection / cached-account reuse
  - fallback logic
  - future auth extensibility
- `msal-node-extensions` provides secure cross-platform persistent token cache support suitable for CLI tools.

## Recommended Runtime Behavior
### Dry-run
- unchanged
- no tenant access required
- no auth prompt

### Live run
1. Try silent token acquisition from local cache.
2. If no valid cached token exists, trigger device code flow.
3. Display device login instructions and wait for user completion.
4. Reuse cached account/token on future runs when possible.

### Legacy fallback
Allow manual token injection only as an **explicit fallback**, such as:
- `--auth-mode token --token <value>`
- or `SHAREPOINT_BEARER_TOKEN` only when `authMode=token`

Do **not** keep token injection as the implicit default.

## Required Change Areas
- `scripts/testing/people-kudos/shared/auth.ts`
- `scripts/testing/people-kudos/shared/context.ts`
- `scripts/testing/people-kudos/shared/types.ts`
- `scripts/testing/people-kudos/shared/config.ts`
- `scripts/testing/people-kudos/config.example.json`
- `scripts/testing/people-kudos/runAll.ts`
- `scripts/testing/people-kudos/runSuite.ts`
- operations guide / closure docs / examples
- root `package.json` dependencies

## Suggested New Auth Model
Introduce explicit auth config, for example:

```ts
interface HarnessAuthConfig {
  mode: 'deviceCode' | 'token';
  tenantId: string;
  clientId: string;
  authority?: string;
  sharePointResource?: string;
  cache?: {
    enabled: boolean;
    cacheName: string;
    cacheDir?: string;
    allowUnencryptedFallback?: boolean;
  };
}
```

## Prompt Sequence
- Prompt 00: basis lock and implementation plan confirmation
- Prompt 01: implement device-login auth runtime and cache
- Prompt 02: update CLI, config, docs, and fallback semantics
- Prompt 03: validate behavior and close out

