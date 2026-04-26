# Prompt 01 — Fix the Foleon SPFx Runtime Config Bridge

You are working in the live `RMF112018/hb-intel` repository on `main`.

Do not re-read files that are already within your current context or memory unless you are verifying a specific line, contradiction, or diff.

## Objective

Fix the SPFx shell-to-Foleon runtime configuration bridge so persisted Foleon webpart properties are passed to the Foleon app in the top-level `IFoleonMountConfig` shape consumed by `resolveFoleonRuntimeContract()`.

This prompt targets Audit Findings A, B, C, and D:

- The Foleon runtime contract reads top-level `config.contentRegistryListId`, `config.placementsListId`, `config.eventsListId`, and `config.foleonRoute`.
- The generic SPFx shell currently passes persisted page properties under `runtimeConfig.webPartProperties`.
- The Foleon runtime contract does not read nested `webPartProperties`.
- This causes `contract.canInitialize === false` even when the tenant lists exist and may even be configured on the page instance.

## Required Starting Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -3 --oneline
rg "webPartProperties|runtimeConfig|mount\(|FoleonWebPart|2160edb3|contentRegistryListId|placementsListId|eventsListId|foleonRoute" tools apps/hb-intel-foleon -n
```

## Required Files to Inspect

Inspect at minimum:

```text
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
apps/hb-intel-foleon/src/types/foleon-runtime.types.ts
apps/hb-intel-foleon/src/runtime/foleonRuntimeContract.ts
apps/hb-intel-foleon/src/mount.tsx
apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json
```

## Issue Explanation

The current shell builds `runtimeConfig` and assigns:

```ts
runtimeConfig.webPartProperties = this.properties as Record<string, unknown>;
```

That is useful as diagnostics payload, but it is not the app contract used by Foleon.

The Foleon app receives:

```ts
mount(el, spfxContext, config)
```

and then calls:

```ts
resolveFoleonRuntimeContract({ hasSpfxContext, siteUrl, config, telemetryIdentity })
```

The contract reads:

```ts
params.config?.contentRegistryListId
params.config?.placementsListId
params.config?.eventsListId
params.config?.foleonRoute
```

It does not read:

```ts
params.config?.webPartProperties?.contentRegistryListId
```

Therefore, the fix must bridge known Foleon page properties into top-level `runtimeConfig`.

## Implementation Requirements

### 1. Add a Foleon webpart ID constant to the shell

In `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`, add:

```ts
const FOLEON_WEBPART_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e';
```

Use the current runtime manifest ID from the Foleon package.

### 2. Extend `IShellWebPartProperties`

Add optional Foleon-specific fields:

```ts
contentRegistryListId?: string;
placementsListId?: string;
eventsListId?: string;
acceptedFoleonOrigins?: string | string[];
allowPreview?: boolean;
expectedManifestId?: string;
expectedPackageVersion?: string;
foleonRoute?: 'highlights' | 'reader' | 'hub' | 'manage';
foleonDocId?: string | number;
foleonReaderRoutePath?: string;
foleonApiBaseUrl?: string;
foleonApiResource?: string;
```

If TypeScript typing becomes awkward because this shell is shared by many domains, use a narrow helper type rather than weakening the entire interface unnecessarily.

### 3. Add an explicit Foleon config bridge

Do not blindly spread every property for every app. Implement an explicit Foleon-only bridge, for example:

```ts
private buildFoleonRuntimeConfig(): Record<string, unknown> {
  const props = this.properties as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  const copyText = (key: string): void => {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) {
      out[key] = value.trim();
    } else if (typeof value === 'number') {
      out[key] = value;
    } else if (typeof value === 'boolean') {
      out[key] = value;
    }
  };

  copyText('contentRegistryListId');
  copyText('placementsListId');
  copyText('eventsListId');
  copyText('expectedManifestId');
  copyText('expectedPackageVersion');
  copyText('foleonRoute');
  copyText('foleonDocId');
  copyText('foleonReaderRoutePath');
  copyText('foleonApiBaseUrl');
  copyText('foleonApiResource');

  const origins = props.acceptedFoleonOrigins;
  if (Array.isArray(origins)) {
    out.acceptedFoleonOrigins = origins.filter((entry) => typeof entry === 'string' && entry.trim());
  } else if (typeof origins === 'string' && origins.trim()) {
    out.acceptedFoleonOrigins = origins
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof props.allowPreview === 'boolean') {
    out.allowPreview = props.allowPreview;
  }

  return out;
}
```

The helper above is illustrative. Implement cleanly and testably according to current repo style.

### 4. Apply the bridge during render

In `ShellWebPart.render()`, after shared runtime constants are assigned and before `mount()`, add:

```ts
if ((this.manifest as any).id === FOLEON_WEBPART_ID) {
  Object.assign(runtimeConfig, this.buildFoleonRuntimeConfig());
}
```

Keep:

```ts
runtimeConfig.webPartProperties = this.properties as Record<string, unknown>;
```

for diagnostics, but do not rely on it for Foleon initialization.

### 5. Preserve non-Foleon behavior

The change must not alter the runtime config shape for Safety, Hero, Kudos, Project Sites, or PnP Operations except for preserving the existing `webPartProperties` diagnostics object.

### 6. Add tests

Add or update tests proving:

1. Foleon properties are copied to top-level runtime config.
2. Blank strings are not copied as valid config.
3. `acceptedFoleonOrigins` string input is normalized to an array.
4. Non-Foleon webpart IDs do not receive Foleon config bridging.
5. Existing `webPartProperties` remains present for diagnostics.

If direct testing of `ShellWebPart.render()` is difficult, extract pure helper functions and test those.

## Required Validation

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

If shell tests live outside the Foleon package, run the appropriate workspace-level test/typecheck command and record it.

## Versioning

If this changes package/runtime behavior, bump Foleon from `1.0.13.0` to `1.0.14.0` consistently across:

```text
apps/hb-intel-foleon/config/package-solution.json
apps/hb-intel-foleon/src/webparts/foleon/FoleonWebPart.manifest.json
apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts
apps/hb-intel-foleon/scripts/validate-foleon-feature-assets.ts
apps/hb-intel-foleon/scripts/prove-foleon-package.ts
apps/hb-intel-foleon/docs/provisioning.md
any package proof expectation/output files
```

## Required Closure Report

Return:

1. Root cause confirmed or revised.
2. Files changed.
3. Exact runtime bridge implemented.
4. Tests added.
5. Validation commands run and results.
6. Package version and SHA if rebuilt.
7. Remaining tenant/page configuration steps.
