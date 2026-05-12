# Prompt 04 — Register My Dashboard in SPFx Packaging Orchestrator and Package-Truth Proof

## Role
Act as a focused packaging-governance implementation agent. Execute only this prompt’s scope.

## Context
Prompts 01–03 should have created a compile-safe `apps/my-dashboard` domain with package/manifest identity, runtime config/readiness, and mount/auth/runtime-marker bootstrap. This prompt wires the authoritative SPFx package builder and proof system.

## Read-first instruction
Do **not** re-read files that remain within your current context or memory unless exact current text is needed for patching or drift is suspected. Open only what is necessary for accurate edits.

## Objective
Update:

```text
tools/build-spfx-package.ts
```

so My Dashboard becomes a first-class standalone packageable domain with runtime marker proof and critical-runtime path fingerprints.

## Required repo inspection before edits
Inspect the current sections of `tools/build-spfx-package.ts` that define:

- `ALL_DOMAINS`,
- web-part ID constants,
- critical-runtime path arrays,
- `CRITICAL_RUNTIME_PATHS_BY_DOMAIN`,
- `RUNTIME_MARKERS_BY_DOMAIN`.

Do not broadly refactor the orchestrator.

## Required edits

### 1. Add My Dashboard domain config
Add:

```ts
{
  dir: 'my-dashboard',
  camel: 'myDashboard',
  pascal: 'MyDashboard',
  packagingModel: 'single',
  freshBuildRequired: true,
}
```

in the correct location within `ALL_DOMAINS`.

### 2. Add My Dashboard web-part ID constant
Use the exact GUID already created in:

```text
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
```

as:

```ts
const MY_DASHBOARD_WEBPART_ID = '<same-guid>';
```

### 3. Add critical runtime paths
Add a My Dashboard proof path list. B02’s expected baseline is:

```ts
const MY_DASHBOARD_CRITICAL_RUNTIME_PATHS: readonly string[] = [
  'apps/my-dashboard/src/mount.tsx',
  'apps/my-dashboard/src/MyDashboardApp.tsx',
  'apps/my-dashboard/src/config/runtimeConfig.ts',
  'apps/my-dashboard/src/config/productionReadiness.ts',
  'apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json',
  'apps/my-dashboard/vite.config.ts',
  'apps/my-dashboard/package.json',
];
```

If Prompt 02 made a different readiness file structure while preserving the B02 file-placement contract, reflect the actual repo files and document the deviation in closeout.

### 4. Register the critical-runtime mapping
Add:

```ts
'my-dashboard': MY_DASHBOARD_CRITICAL_RUNTIME_PATHS,
```

to `CRITICAL_RUNTIME_PATHS_BY_DOMAIN`.

### 5. Register runtime marker proof mapping
Add:

```ts
'my-dashboard': {
  id: MY_DASHBOARD_WEBPART_ID,
  label: 'My Dashboard webpart',
},
```

to `RUNTIME_MARKERS_BY_DOMAIN`.

## Required non-edits
Do not:

- change unrelated domain registry entries,
- change existing PCC/Homepage/Safety package-truth posture,
- invent a separate packaging script,
- alter shell `gulpfile.js` env injection unless a packaging run proves a My Dashboard-specific issue and you document it.

B02 expects existing shell injection constants to be reused as-is.

## Validation
Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard build
```

Then, if the local packaging toolchain supports it:

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

If packaging is unavailable because Node 18 or another governed prerequisite is missing, document it exactly. Do not fake proof outputs.

Also run:

```bash
rg -n "my-dashboard|MY_DASHBOARD_WEBPART_ID|MY_DASHBOARD_CRITICAL_RUNTIME_PATHS|My Dashboard webpart" tools/build-spfx-package.ts
```

## Required closeout
Return:

1. orchestrator edits made,
2. runtime-marker GUID consistency confirmation,
3. critical-runtime paths recorded,
4. app build/typecheck result,
5. package build/proof result or explicit environment limitation.
