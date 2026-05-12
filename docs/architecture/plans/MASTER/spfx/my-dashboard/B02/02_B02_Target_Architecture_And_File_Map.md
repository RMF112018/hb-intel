# 02 — B02 Target Architecture and File Map

## Objective

Provide the local implementation agent with a precise file-by-file map for the B02 runtime foundation, including what to create, what to modify, what to inspect as precedent, and what not to touch.

---

## A. New files B02 should create

### A1. My Dashboard app root

```text
apps/my-dashboard/
```

### A2. Packaging and build files

| Path | Purpose | Primary precedent |
|---|---|---|
| `apps/my-dashboard/package.json` | workspace app scripts/dependencies | `apps/project-control-center/package.json` |
| `apps/my-dashboard/tsconfig.json` | TS compile baseline | analogous SPFx app TS config in repo |
| `apps/my-dashboard/vite.config.ts` | IIFE bundle config + `__hbIntel_myDashboard` lib global | `apps/project-control-center/vite.config.ts` |
| `apps/my-dashboard/config/package-solution.json` | standalone SPFx package definition + API permission request | PCC + Estimating/Accounting |
| `apps/my-dashboard/README.md` | local app/deployment/runtime baseline | concise new app README |

### A3. Runtime entry files

| Path | Purpose | Primary precedent |
|---|---|---|
| `apps/my-dashboard/src/MyDashboardApp.tsx` | minimal React runtime host only | lightweight local implementation |
| `apps/my-dashboard/src/mount.tsx` | SPFx mount, auth bootstrap, token-provider seam, runtime marker | Estimating mount + PCC runtime marker |

### A4. Runtime config files

| Path | Purpose | Primary precedent |
|---|---|---|
| `apps/my-dashboard/src/config/runtimeConfig.ts` | config injection + env fallback + typed getters | Estimating/Accounting runtime config |
| `apps/my-dashboard/src/config/productionReadiness.ts` | production readiness assessment | B02 plan; may wrap/re-export runtime readiness if that is cleaner |

### A5. Manifest

| Path | Purpose | Primary precedent |
|---|---|---|
| `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json` | SPFx web-part identity | PCC manifest + HB Homepage manifest |

---

## B. Existing files B02 should modify

| Path | Required edit |
|---|---|
| `tools/build-spfx-package.ts` | add My Dashboard as an authoritative packager domain with runtime marker and critical runtime path proof support |

No other existing file should require modification for B02 unless the live repo has changed before execution and the agent documents why.

---

## C. Files to inspect as implementation precedents

### C1. Package/manifest posture

- `apps/project-control-center/config/package-solution.json`
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`

### C2. Runtime marker posture

- `apps/project-control-center/src/mount.tsx`
- `tools/build-spfx-package.ts`

### C3. Auth bootstrap posture

- `apps/estimating/src/mount.tsx`
- `packages/auth/src/spfx/apiTokenProvider.ts`

### C4. Runtime config/readiness posture

- `apps/estimating/src/config/runtimeConfig.ts`
- `apps/accounting/src/config/runtimeConfig.ts`
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx`
- `apps/accounting/src/backend/AccountingBackendContext.tsx`

### C5. Protected backend target contract

- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `docs/reference/configuration/project-setup-api-auth-contract.md`

### C6. Packaging toolchain constraints

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/gulpfile.js`
- `docs/reference/developer/spfx-packaging-toolchain.md`
- `docs/reference/developer/spfx-baseline.md`

---

## D. Detailed target contract for new files

### D1. `package.json`

Required characteristics:

- package name: `@hbc/spfx-my-dashboard`,
- `private: true`,
- `type: module`,
- scripts consistent with PCC-style app posture:
  - `build`,
  - `check-types`,
  - `lint`,
  - `test`,
  - `dev`,
- dependencies limited to what B02 actually needs.

Do not add Adobe SDKs, backend SDKs, or later-batch UI packages.

### D2. `vite.config.ts`

Required characteristics:

- IIFE bundle entry: `src/mount.tsx`,
- IIFE global name: `__hbIntel_myDashboard`,
- output file name aligned to packaging convention, recommended:
  ```text
  my-dashboard-app.js
  ```
- externalize `@microsoft/sp-*` and any established SPFx externals consistent with adjacent apps,
- alias only packages needed by B02 runtime bootstrap.

### D3. `config/package-solution.json`

Required characteristics:

- solution name: `hb-intel-my-dashboard`,
- fresh unique solution GUID,
- initial version aligned across solution, feature, and manifest,
- `includeClientSideAssets: true`,
- `skipFeatureDeployment: true`,
- `isDomainIsolated: false`,
- `webApiPermissionRequests` for:
  ```json
  { "resource": "hb-intel-api-production", "scope": "access_as_user" }
  ```
- zipped package:
  ```text
  solution/hb-intel-my-dashboard.sppkg
  ```

### D4. Manifest

Required characteristics:

- fresh unique web-part GUID,
- alias `MyDashboardWebPart`,
- version aligned with package solution/feature,
- `supportedHosts: ["SharePointWebPart"]`,
- `supportsFullBleed: true`,
- `supportsThemeVariants: false`,
- `hiddenFromToolbox: false`,
- title `HB Intel My Dashboard`,
- group `HB Intel`,
- no runtime/auth config property pane fields.

### D5. `runtimeConfig.ts`

Must provide My Dashboard equivalents of:

- runtime config shape,
- `BackendMode = 'production' | 'ui-review'`,
- `setRuntimeConfig(...)`,
- `getBackendMode()`,
- `getAllowBackendModeSwitch()`,
- `getFunctionAppUrl()`,
- `getApiAudience()`,
- `_resetConfig()` for tests if the app pattern includes it.

It must resolve runtime injection before Vite env fallback and must not introduce `MY_DASHBOARD_*` public bundle keys.

### D6. `productionReadiness.ts`

Must provide a My Dashboard-specific readiness contract that evaluates at minimum:

- function app URL availability in production mode,
- API token-provider availability.

A clean, small module is acceptable. If the agent determines that readiness logic belongs in `runtimeConfig.ts` to match repo precedent, it may keep the logic there and provide a thin module that re-exports or formalizes the B02-specific contract. The closeout must document the choice.

### D7. `mount.tsx`

Must:

- accept `HTMLElement`, optional `WebPartContext`, and runtime config object,
- call runtime config injection before render,
- call `resolveSpfxPermissions(...)` and `bootstrapSpfxAuth(...)` when SPFx context exists,
- resolve API audience and create `getApiToken` through `createSpfxApiTokenProvider(...)`,
- pass the token provider capability into `MyDashboardApp` or its top-level provider seam,
- publish:
  ```ts
  globalThis.__hbIntel_myDashboard = { mount, unmount, runtimeMarkerId }
  ```
  with a `window` defensive mirror if consistent with repo precedent,
- expose `runtimeMarkerId` equal to the new My Dashboard web-part GUID,
- avoid protected API network requests in mount.

### D8. `MyDashboardApp.tsx`

B02 only needs a minimal runtime host that compiles and gives the mount target a stable React root. It should:

- be small,
- be replaceable by B03 shell work,
- not render fake Adobe queue data,
- not introduce shell/navigation decisions,
- expose a stable root data attribute useful for smoke inspection if reasonable.

---

## E. Orchestrator modifications

Update `tools/build-spfx-package.ts` as follows:

### E1. Add domain registry entry

```ts
{
  dir: 'my-dashboard',
  camel: 'myDashboard',
  pascal: 'MyDashboard',
  packagingModel: 'single',
  freshBuildRequired: true,
}
```

### E2. Add web-part ID constant

```ts
const MY_DASHBOARD_WEBPART_ID = '<new My Dashboard web-part GUID>';
```

### E3. Add critical runtime paths

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

The agent may include additional newly created B02 files if package-truth logic in the live repo would benefit from them, but should not add future-batch files as proof dependencies.

### E4. Add critical-runtime mapping

```ts
'my-dashboard': MY_DASHBOARD_CRITICAL_RUNTIME_PATHS,
```

### E5. Add runtime-marker mapping

```ts
'my-dashboard': {
  id: MY_DASHBOARD_WEBPART_ID,
  label: 'My Dashboard webpart',
},
```

---

## F. Do not modify / do not implement

### F1. Do not create later-batch domains

Do not create:

- `packages/models/src/myWork/`,
- `backend/functions/src/hosts/my-work-read-model/`,
- Adobe Sign provider/OAuth/token-store directories.

### F2. Do not author shell UI

Do not create:

- My Work hero,
- tab launchers,
- Bento grid,
- Adobe Sign queue cards,
- My Work shell router/state.

### F3. Do not add public runtime knobs in property panes

Do not add property-pane controls for:

- backend URL,
- backend mode,
- API audience,
- OAuth/Adobe config,
- token settings.

### F4. Do not drift auth scope

Do not replace the B02 API permission posture with:

- function keys,
- anonymous routes,
- browser secrets,
- user-entered email selectors.
