# Prompt 01 — Create My Dashboard App Domain and SPFx Package Identity

## Role
Act as a meticulous HB Intel monorepo implementation agent. Execute only this prompt’s scope. Maintain repo-truth discipline and preserve all unrelated changes.

## Context
You are implementing **B02 — My Dashboard Hosting, Packaging, Protected API Authentication, and Runtime Development**. B02 is a runtime/deployment foundation batch. It must create the new standalone My Dashboard SPFx-targeted domain without prematurely implementing My Work shell UI, queue UI, backend routes, or Adobe integration.

## Read-first instruction
Do **not** re-read files that remain within your current context or memory unless exact current text is needed for patching or drift is suspected. Open only the files necessary to verify current repo truth and perform the edits safely.

## Objective
Create the new standalone My Dashboard app/package identity under:

```text
apps/my-dashboard/
```

with the package/manifest/build scaffold required for later prompts.

## Required repo inspection before edits
Inspect the current versions of:

- `apps/project-control-center/package.json`
- `apps/project-control-center/vite.config.ts`
- `apps/project-control-center/config/package-solution.json`
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`
- `apps/hb-homepage/config/package-solution.json`
- `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`
- `apps/estimating/config/package-solution.json`
- `apps/accounting/config/package-solution.json`
- `pnpm-workspace.yaml`

Use these only as implementation precedents. Do not alter them.

## Required creation scope
Create:

```text
apps/my-dashboard/package.json
apps/my-dashboard/tsconfig.json
apps/my-dashboard/vite.config.ts
apps/my-dashboard/README.md
apps/my-dashboard/config/package-solution.json
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
```

Do not create `mount.tsx` or `MyDashboardApp.tsx` in this prompt unless the repo build configuration requires immediate compile scaffolding. Those are Prompt 03’s primary scope.

## Closed implementation decisions

### App package identity
Use:

```text
@hbc/spfx-my-dashboard
```

as the workspace package name unless an existing repo convention discovered at execution time requires a materially different scoped name. If such a variance is necessary, document it in closeout.

### SPFx package identity
Use:

```text
solution.name: hb-intel-my-dashboard
paths.zippedPackage: solution/hb-intel-my-dashboard.sppkg
```

### Version posture
Initialize solution, feature, and manifest versions consistently. Recommended closed baseline:

```text
1.0.0.0
```

If live repo truth contains an already-adopted My Dashboard version registry before you execute, follow that registry and document the variance.

### GUID posture
Generate fresh, stable GUIDs for:

- solution ID,
- feature ID,
- web-part manifest ID.

Do not reuse IDs from PCC, HB Homepage, Estimating, Accounting, Safety, or any other domain.

### Package solution requirements
Set:

```json
"includeClientSideAssets": true,
"skipFeatureDeployment": true,
"isDomainIsolated": false
```

and include:

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-production",
    "scope": "access_as_user"
  }
]
```

### Manifest requirements
Use:

```json
"alias": "MyDashboardWebPart",
"componentType": "WebPart",
"requiresCustomScript": false,
"supportedHosts": ["SharePointWebPart"],
"supportsFullBleed": true,
"supportsThemeVariants": false
```

Toolbox posture:

- group: `HB Intel`,
- title: `HB Intel My Dashboard`,
- hiddenFromToolbox: `false`,
- properties: `{}`.

Do not expose runtime config, auth config, or Adobe config in the property pane.

### Vite config requirements
Create a Vite config structurally consistent with other SPFx-targeted app domains:

- production build entry should be `src/mount.tsx`,
- IIFE global should be `__hbIntel_myDashboard`,
- bundle filename should be deterministic, recommended:
  ```text
  my-dashboard-app.js
  ```
- externalize `@microsoft/sp-*` packages consistently with current app precedent.

It is acceptable that `src/mount.tsx` lands in Prompt 03; Prompt 01 is establishing the build contract.

### README requirements
Create a concise `apps/my-dashboard/README.md` that states:

- B02 scope = runtime/package/auth foundation only,
- target host = MyDashboard communication-site home page, full-width section,
- package = `hb-intel-my-dashboard.sppkg`,
- protected API posture = `hb-intel-api-production` / `access_as_user`,
- no Adobe/provider/shell/read-model implementation in B02,
- later prompts/batches extend this foundation.

## Prohibited scope
Do not:

- create My Work shell files,
- create Adobe Sign Action Queue files,
- create backend route files,
- create OAuth/provider/token-store files,
- add public config property pane controls,
- update the SPFx orchestrator in this prompt.

## Validation for this prompt
Run any low-cost validations available after the scaffold lands, such as:

```bash
rg -n "hb-intel-my-dashboard|MyDashboardWebPart|supportsFullBleed|access_as_user" apps/my-dashboard
```

A full app build is not expected until Prompt 03 has created `mount.tsx` and `MyDashboardApp.tsx`.

## Required closeout
Return:

1. files created,
2. generated GUID values,
3. initialized version value,
4. validation performed,
5. any variance from the prompt and why.
