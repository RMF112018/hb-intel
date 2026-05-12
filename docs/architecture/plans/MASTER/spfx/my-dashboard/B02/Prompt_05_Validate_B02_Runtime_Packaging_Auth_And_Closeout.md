# Prompt 05 — Validate B02 Runtime, Packaging, Auth, and Closeout

## Role
Act as the final B02 implementation auditor. Perform a repo-truth validation of the full Prompt 01–04 result, repair only prompt-chain defects that are clearly within B02 scope, and produce a precise closeout.

## Read-first instruction
Do **not** re-read files that remain within your current context or memory unless exact current text is needed for patching or drift is suspected. Open only the files required to validate or patch B02 implementation truth.

## Objective
Confirm that B02’s runtime/deployment foundation is complete, coherent, buildable, and free of later-batch scope drift.

## Validation checklist

### 1. File presence
Confirm all B02 target files exist:

```text
apps/my-dashboard/package.json
apps/my-dashboard/tsconfig.json
apps/my-dashboard/vite.config.ts
apps/my-dashboard/README.md
apps/my-dashboard/config/package-solution.json
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/mount.tsx
apps/my-dashboard/src/config/runtimeConfig.ts
apps/my-dashboard/src/config/productionReadiness.ts
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
```

### 2. Package/manifest alignment
Confirm:

- package solution name = `hb-intel-my-dashboard`,
- zipped package path = `solution/hb-intel-my-dashboard.sppkg`,
- versions match across solution/feature/manifest,
- manifest supports full bleed,
- manifest is SharePoint-only,
- manifest is toolbox-visible,
- no runtime config appears in web-part property pane.

### 3. API permission posture
Confirm package solution declares:

```json
"resource": "hb-intel-api-production",
"scope": "access_as_user"
```

### 4. Runtime/auth posture
Confirm:

- runtime config uses injection-first plus Vite env fallback,
- no `MY_DASHBOARD_*` public env namespace was introduced,
- mount creates API token provider via `createSpfxApiTokenProvider(...)`,
- runtime marker global is `__hbIntel_myDashboard`,
- `runtimeMarkerId` equals manifest GUID,
- no token persistence, no function key, no browser secret, no direct Adobe API.

### 5. Orchestrator posture
Confirm `tools/build-spfx-package.ts` includes:

- My Dashboard domain entry,
- web-part ID constant,
- critical runtime path list,
- critical-runtime mapping,
- runtime-marker mapping.

### 6. Scope restraint
Confirm no B03–B08 scope drift:

- no shell/router/navigation surfaces,
- no Adobe Sign queue UI,
- no backend route host,
- no OAuth/provider/token store,
- no hosted Playwright lane.

## Required commands

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard build
```

If tests exist:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
```

Run focused scans:

```bash
rg -n "my-dashboard|MyDashboard|__hbIntel_myDashboard|MY_DASHBOARD_WEBPART_ID" \
  apps/my-dashboard tools/build-spfx-package.ts

rg -n "MY_DASHBOARD_|x-functions-key|\?code=|refresh token|Adobe.*secret|function key" \
  apps/my-dashboard
```

If packaging prerequisites are available:

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

Inspect generated package-truth proof if present.

## Repair policy

You may patch only clear B02-scope defects discovered during validation, such as:

- version mismatch,
- typo in orchestrator registration,
- missing runtime marker mapping,
- invalid runtime config import/export,
- build failure directly attributable to Prompt 01–04 work.

Do not use Prompt 05 to begin later My Dashboard batches.

## Required final closeout format

Use exactly this high-level structure:

```text
HB: B02 My Dashboard Runtime Foundation Closeout

1. Verdict
- PASS | PASS WITH ENVIRONMENT-LIMITED PACKAGING | FAIL

2. Branch / HEAD
- Branch:
- Starting HEAD:
- Ending HEAD:

3. Files created
- ...

4. Files modified
- ...

5. Foundation results
- App/domain scaffold:
- SPFx package/manifest posture:
- Runtime config/readiness:
- Mount/auth/bootstrap/runtime marker:
- Packaging orchestrator/proof:

6. Validation performed
- command — result
- command — result

7. Packaging result
- .sppkg generated? yes/no
- package-truth proof generated? yes/no
- if no, exact reason:

8. Scope confirmations
- no B03–B08 overreach:
- no frontend secrets/property-pane config drift:
- no direct Adobe/frontend provider drift:

9. Residual risk / next batch handoff
- ...
```
