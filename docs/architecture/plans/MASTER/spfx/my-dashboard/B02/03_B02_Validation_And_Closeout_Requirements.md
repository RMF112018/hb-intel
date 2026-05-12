# 03 — B02 Validation and Closeout Requirements

## Objective

Define the acceptance gates, validation commands, and closeout format for B02 implementation work.

---

## A. Required implementation acceptance gates

### A1. Domain scaffold exists

The following must exist:

```text
apps/my-dashboard/
├── config/package-solution.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── MyDashboardApp.tsx
    ├── mount.tsx
    ├── config/runtimeConfig.ts
    ├── config/productionReadiness.ts
    └── webparts/myDashboard/MyDashboardWebPart.manifest.json
```

### A2. SPFx package identity is internally aligned

Confirm:

- solution name = `hb-intel-my-dashboard`,
- package output = `solution/hb-intel-my-dashboard.sppkg`,
- package/feature/manifest versions match,
- manifest alias = `MyDashboardWebPart`,
- manifest title = `HB Intel My Dashboard`,
- full-width + SharePoint-only + non-theme-variant + toolbox-visible posture matches B02.

### A3. API permission contract exists

Confirm My Dashboard `package-solution.json` includes:

```json
{
  "resource": "hb-intel-api-production",
  "scope": "access_as_user"
}
```

### A4. Runtime config contract exists

Confirm runtime config supports:

- `functionAppUrl`,
- `backendMode`,
- `allowBackendModeSwitch`,
- `apiAudience`,
- injection-first resolution,
- Vite env fallback,
- production readiness contract.

### A5. Mount/auth bootstrap contract exists

Confirm `mount.tsx`:

- stores runtime config before render,
- bootstraps SPFx auth when context exists,
- creates `getApiToken` from `createSpfxApiTokenProvider(...)` when audience is present,
- publishes `__hbIntel_myDashboard`,
- exposes `runtimeMarkerId`,
- does not persist tokens or call Adobe APIs.

### A6. Packaging orchestrator integration exists

Confirm `tools/build-spfx-package.ts` contains:

- domain registry entry for `my-dashboard`,
- My Dashboard web-part ID constant,
- My Dashboard critical runtime path list,
- My Dashboard critical path mapping,
- My Dashboard runtime marker mapping.

---

## B. Required command validation

Run what the environment supports and document all outcomes.

### B1. App-level validation

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard build
```

If the app includes tests in B02:

```bash
pnpm --filter @hbc/spfx-my-dashboard test
```

### B2. Focused repository scans

```bash
rg -n "my-dashboard|MyDashboard|__hbIntel_myDashboard|MY_DASHBOARD_WEBPART_ID" \
  apps/my-dashboard tools/build-spfx-package.ts

rg -n "MY_DASHBOARD_|function key|x-functions-key|\?code=|Adobe.*secret|refresh token" \
  apps/my-dashboard
```

The first scan should confirm intentional new seams. The second should not reveal disallowed frontend configuration/secrets.

### B3. Package orchestration validation

If the local machine satisfies the repo packaging prerequisites:

```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

Expected outputs:

```text
dist/sppkg/hb-intel-my-dashboard.sppkg
dist/sppkg/my-dashboard-package-truth-proof.json
```

If packaging cannot run because Node 18 or another governed toolchain prerequisite is unavailable, the closeout must state that explicitly and must still complete all non-packaging validations.

### B4. Optional follow-on package proof inspection

If the proof JSON is generated, inspect it for:

- `domain: my-dashboard`,
- correct package filename,
- correct runtime marker ID,
- critical runtime file fingerprints present,
- structural/freshness/live-runtime proof pass where the orchestrator supports it.

---

## C. Scope-control validation

Confirm no B03–B08 scope drift occurred:

- no My Work shell/router implementation,
- no Adobe Sign Action Queue UI,
- no Adobe OAuth/provider code,
- no backend My Work routes,
- no hosted Playwright suite,
- no property-pane runtime/auth configuration fields.

---

## D. Recommended closeout format

The final local-agent response should use this structure:

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

5. Key implementation results
- standalone app/package domain:
- runtime config/readiness:
- mount/auth bootstrap:
- packaging orchestrator/proof:

6. Validation performed
- command — result
- command — result

7. Packaging result
- .sppkg created? yes/no
- package-truth proof created? yes/no
- if not, why:

8. Scope confirmations
- no B03/B04/B05/B06/B07/B08 overreach:
- no frontend secret/property-pane drift:

9. Residual risk / operator follow-up
- ...
```

---

## E. Definition of done

B02 implementation is done when:

1. My Dashboard exists as a new compile-safe standalone SPFx-targeted app domain.
2. My Dashboard has a valid package solution and manifest posture that matches B02.
3. My Dashboard runtime config/readiness and mount/auth bootstrap match the established protected API caller pattern.
4. The SPFx package orchestrator recognizes My Dashboard as a first-class domain with runtime marker and proof fingerprints.
5. Available validations pass, and any environment-blocked packaging run is transparently documented.
6. No later My Dashboard batch scope is accidentally implemented early.
