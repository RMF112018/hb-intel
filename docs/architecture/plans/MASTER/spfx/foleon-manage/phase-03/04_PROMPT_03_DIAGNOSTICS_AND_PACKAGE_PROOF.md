# Prompt 03 — Strengthen Foleon Diagnostics and Package Proof

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not re-read files that are already within your current context or memory unless verifying a specific line, contradiction, or diff.

## Objective

Strengthen Foleon diagnostics, runtime binding proof, and package proof so runtime-contract misconfiguration is immediately actionable and future packages cannot claim readiness while omitting the bridge/default checks required for initialization.

This prompt targets Audit Findings B, D, and F:

- The user-facing error is intentionally generic.
- Admin diagnostics exist behind `?foleon-diagnostics=1`, but current output may not identify whether config is missing because it is absent or because it is nested under `webPartProperties`.
- Package proof validates route entries but does not validate runtime-required config posture or shell bridge coverage.

## Required Starting Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -3 --oneline
rg "RuntimeBindingProof|foleonRuntimeBindingProof|diagnostics|issueCodes|package:proof|preconfiguredEntries|webPartProperties|contentRegistryListId|placementsListId|eventsListId" apps/hb-intel-foleon tools -n
```

## Required Files to Inspect

Inspect at minimum:

```text
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/runtime/foleonConfigIssues.ts
apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts
apps/hb-intel-foleon/src/FoleonApp.tsx
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
apps/hb-intel-foleon/src/webparts/foleon/__tests__/FoleonWebPartManifest.test.ts
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
```

## Issue Explanation

The runtime proof currently exposes high-value fields:

```js
window.__hbIntel_foleonRuntimeBindingProof
```

Useful fields include:

- `packageVersion`
- `manifestId`
- `hostMode`
- `route`
- `canInitialize`
- `presence.contentRegistryListId`
- `presence.placementsListId`
- `presence.eventsListId`
- `issueCodes`

However, the current proof does not clearly expose whether page properties existed under `webPartProperties` but failed to bridge into top-level `IFoleonMountConfig`.

The package proof also confirms toolbox route values, but it does not prove the Foleon initialization path is bridge-safe.

## Implementation Requirements

### 1. Add bridge diagnostics without exposing secrets

In the shell or Foleon mount proof, add a redacted diagnostic posture for Foleon page properties.

Recommended shape:

```ts
foleonPropertyBridge?: {
  webPartPropertiesPresent: boolean;
  topLevelConfigPresent: {
    contentRegistryListId: boolean;
    placementsListId: boolean;
    eventsListId: boolean;
    foleonRoute: boolean;
  };
  nestedWebPartPropertiesPresent: {
    contentRegistryListId: boolean;
    placementsListId: boolean;
    eventsListId: boolean;
    foleonRoute: boolean;
  };
}
```

Keep GUIDs redacted. Presence booleans and deterministic fingerprints are acceptable.

If adding this to `window.__hbIntel_foleonRuntimeBindingProof`, ensure it does not break existing proof consumers.

### 2. Improve diagnostics-mode admin detail

When `?foleon-diagnostics=1` is present, make the admin error more actionable.

Current style:

```text
missing-content-registry-list-id: HB_FoleonContentRegistry list GUID is missing.
```

Add concise remediation guidance, for example:

```text
missing-content-registry-list-id: HB_FoleonContentRegistry list GUID is missing. Set contentRegistryListId in the Foleon webpart property pane using the list GUID from /_api/web/lists/getbytitle('HB_FoleonContentRegistry')?$select=Id.
```

Keep default non-diagnostics user copy generic.

Do not expose actual GUIDs in rendered diagnostics unless the admin explicitly opens the property pane or console proof.

### 3. Add package proof checks

Update `apps/hb-intel-foleon/scripts/prove-foleon-package.ts` so proof includes checks for:

1. Both toolbox entries are present and visible.
2. Both toolbox entries route correctly.
3. Both toolbox entries include safe non-tenant defaults:
   - `acceptedFoleonOrigins`
   - `allowPreview`
   - `expectedManifestId`
   - `expectedPackageVersion`
4. No hard-coded tenant-specific GUIDs appear in preconfigured entry properties.
5. The shell source includes the Foleon component ID and explicit bridge keys:
   - `contentRegistryListId`
   - `placementsListId`
   - `eventsListId`
   - `foleonRoute`

Do not make package proof dependent on the actual tenant list GUIDs.

### 4. Add tests

Add/update unit tests for:

- `adminIssueDetails()`
- diagnostics mode behavior in `FoleonApp`
- runtime binding proof presence booleans
- bridge diagnostics if implemented as a pure helper
- package proof parsing of preconfigured entry properties

### 5. Keep diagnostics gated

Do not show admin detail by default. Admin details must remain behind:

```text
?foleon-diagnostics=1
```

or another explicitly admin-scoped mode already supported by the app.

## Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Required Closure Report

Return:

1. Diagnostic improvements made.
2. Package proof checks added.
3. Tests added/updated.
4. Validation command results.
5. Package SHA if rebuilt.
6. Any remaining tenant/browser validation required.
