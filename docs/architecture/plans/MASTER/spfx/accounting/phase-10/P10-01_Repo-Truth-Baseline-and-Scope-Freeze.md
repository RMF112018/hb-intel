# P10-01 — Repo-Truth Baseline and Scope Freeze

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Establish the exact current repo truth for the Accounting SPFx production-gap-closure work so that all later Phase 10 prompts operate against a locked, evidence-based baseline rather than stale assumptions.

## Methodology

- Audited all files listed in Prompt-01 Required Repo Focus.
- Compared Accounting posture against the Project Setup (estimating) production model as the gold standard.
- Classified each prior audit finding against live repo evidence as of 2026-04-02.
- Did not re-implement anything already closed in repo truth.

## Baseline Matrix

| # | Topic | Repo Truth Now | Prior Audit Finding | Status | Evidence Files |
|---|-------|---------------|---------------------|--------|----------------|
| 1 | Package identity and version | `@hbc/spfx-accounting` v00.000.041, solution v001.000.018, manifest ID `cf3c98bf-ff78-4f00-bd6d-c304433d959e` | Package identity aligned with repo truth | Already closed | `apps/accounting/package.json`, `apps/accounting/config/package-solution.json`, `apps/accounting/src/webparts/accounting/AccountingWebPart.manifest.json` |
| 2 | Shell runtime injection mechanism | `ShellWebPart.ts` injects `functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch` via DefinePlugin constants in `gulpfile.js`. Shell calls `mount(domElement, context, runtimeConfig)`. | Shell injection path not proven in shipped artifact | Partially closed | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:99-131`, `tools/spfx-shell/gulpfile.js:25-34` |
| 3 | Accounting app config consumption | `mount.tsx` accepts `IMountConfig` with `functionAppUrl` and `apiAudience` but **does not pass config to App component**. Line 41: `root.render(<App spfxContext={spfxContext} />)` — config is unused. | Config not consumed by app | Still open | `apps/accounting/src/mount.tsx:34-42` |
| 4 | Accounting auth/token path | `bootstrapSpfxAuth()` called for permission/role bootstrap. **No `createSpfxApiTokenProvider()` call** — no audience-scoped API token acquisition. Uses deprecated session-based extraction only. | Auth posture trails Project Setup | Still open | `apps/accounting/src/mount.tsx:36-37`, contrast: `apps/estimating/src/mount.tsx:59-61` |
| 5 | `webApiPermissionRequests` declaration | **Missing entirely** from `apps/accounting/config/package-solution.json`. Project Setup declares `resource: "hb-intel-api-production"`, `scope: "access_as_user"`. | No declared SharePoint API approval path | Still open | `apps/accounting/config/package-solution.json` (absent), `apps/estimating/config/package-solution.json:10-15` |
| 6 | Light-theme / SPFx theming posture | `App.tsx` renders `<HbcThemeProvider>` **without `forceTheme="light"`**. Project Setup explicitly forces light theme when `spfxContext` is present. | UI/UX environment-state drift | Still open | `apps/accounting/src/App.tsx:17`, contrast: `apps/estimating/src/App.tsx:39-41` |
| 7 | Environment banners / readiness messaging | **None** — zero environment-state communication, no readiness banners, no backend-mode gating. | No environment-state UX | Still open | Grep across `apps/accounting/src/` — no matches |
| 8 | Latent `/api/users/me/*` dependency | `packages/complexity/src/storage/complexityApiClient.ts` uses same-origin fetch to `/api/users/me/preferences` and `/api/users/me/groups` with `credentials: 'include'`. Accounting bundles ComplexityProvider but these endpoints are unreachable in SPFx context. Silent fallback to 'standard' tier. | Latent same-origin dependency remains bundled | Still open | `packages/complexity/src/storage/complexityApiClient.ts:5-6,18-28` |
| 9 | Doc: staging vs production API resource | `project-setup-connected-service-posture.md:88` references `"hb-intel-api-staging"` but live code uses `"hb-intel-api-production"`. | Documentation drift in production-sensitive config | Still open | `docs/reference/developer/project-setup-connected-service-posture.md:88`, `apps/estimating/config/package-solution.json:12` |
| 10 | Doc: Accounting maturity statement | No synthesized Accounting readiness statement in `current-state-map.md`. References are scattered across inventory entries (lines 193, 242, 399, 419, 627). | No synthesized current-state assessment | Still open | `docs/architecture/blueprint/current-state-map.md` |
| 11 | Build orchestrator accounting support | Fully implemented: domain registry entry, Vite build, content-hash cache busting, runtime smoke test (globalThis + window + varScope), .sppkg verification. | N/A (not a gap) | Already closed | `tools/build-spfx-package.ts:39-52,365-656` |
| 12 | mount.tsx global export (dual assignment) | Implemented: `globalThis.__hbIntel_accounting` and defensive `window` fallback. | N/A (not a gap) | Already closed | `apps/accounting/src/mount.tsx:55-61` |
| 13 | Frontend API contract doc | Accurately lists Accounting as `IProvisioningApiClient` consumer with correct method set. | N/A (not a gap) | Already closed | `docs/reference/developer/project-setup-frontend-api-contract.md:76-83` |
| 14 | Package relationship map | Accounting correctly positioned: `@hbc/features-accounting` Layer 10, `@hbc/spfx-accounting` app on port 4001. | N/A (not a gap) | Already closed | `docs/architecture/blueprint/package-relationship-map.md:399,419` |
| 15 | Missing env.d.ts declarations | `env.d.ts` declares only `VITE_MSAL_CLIENT_ID` and `VITE_MSAL_AUTHORITY`. Missing: `VITE_API_AUDIENCE`, `VITE_FUNCTION_APP_URL`. | Auth posture incomplete | Still open | `apps/accounting/src/env.d.ts:2-3`, contrast: `apps/estimating/src/env.d.ts:3-14` |
| 16 | Backend auth middleware alignment | Backend requires `API_AUDIENCE` env var (no fallback in production). Token validation checks issuer, audience, required claims. Accounting must acquire tokens scoped to the same audience. | Backend contract exists; frontend must align | Still open (frontend side) | `backend/functions/src/middleware/validateToken.ts:93-113`, `backend/functions/src/config/wave0-env-registry.ts:194-203` |

## Remaining Work by Category

### Code changes required

| Gap # | Summary | Target Prompts |
|-------|---------|---------------|
| 3 | Pass `IMountConfig` through to App component and propagate to runtime config | Prompt-02, Prompt-05 |
| 4 | Create SPFx API token provider in mount.tsx using `createSpfxApiTokenProvider()` | Prompt-03 |
| 5 | Add `webApiPermissionRequests` to `apps/accounting/config/package-solution.json` | Prompt-04 |
| 6 | Add `forceTheme="light"` to `<HbcThemeProvider>` when `spfxContext` is present | Prompt-06 |
| 7 | Add environment-state readiness messaging | Prompt-06 |
| 15 | Add `VITE_API_AUDIENCE` and `VITE_FUNCTION_APP_URL` to `env.d.ts` | Prompt-03 |

### Documentation reconciliation only

| Gap # | Summary | Target Prompt |
|-------|---------|---------------|
| 9 | Correct `"hb-intel-api-staging"` to `"hb-intel-api-production"` in connected-service-posture doc | Prompt-08 |
| 10 | Add synthesized Accounting maturity statement to `current-state-map.md` | Prompt-08 |

### Fresh artifact proof needed

| Gap # | Summary | Target Prompt |
|-------|---------|---------------|
| 2 | Rebuild .sppkg and inspect packaged shell asset to verify DefinePlugin constants are embedded | Prompt-09 |

### Latent dependency hygiene

| Gap # | Summary | Target Prompt |
|-------|---------|---------------|
| 8 | Clean or explicitly quarantine `/api/users/me/*` same-origin dependency in complexity package | Prompt-07 |

### External prerequisites (tenant/admin action)

| Gap # | Summary | Dependency |
|-------|---------|-----------|
| 5 (post-code) | After `webApiPermissionRequests` is declared and .sppkg deployed, a SharePoint admin must approve the API permission in the SharePoint admin center API access page | Tenant admin action |
| 16 (post-code) | Backend `API_AUDIENCE` env var must be configured in the Azure Function App to match the frontend audience URI | Azure resource configuration |

## Narrowed Scope Instructions for Prompts 02–10

### Already resolved — no work needed
- **Package identity** (Gap 1): Confirmed correct. Prompts need not re-verify.
- **Build orchestrator** (Gap 11): Fully functional. Prompts should use it, not rebuild it.
- **Global export** (Gap 12): Implemented. No changes needed.
- **API contract doc** (Gap 13): Accurate. No changes needed.
- **Package relationship map** (Gap 14): Correct. No changes needed.

### Narrowing notes for specific prompts
- **Prompt-02** (Packaging/Runtime Injection): Shell injection mechanism exists (Gap 2 partially closed). Focus on proving the config is consumed end-to-end, not on rebuilding the injection path.
- **Prompt-03** (Auth Model): IMountConfig interface already declares `apiAudience`. Focus on wiring `createSpfxApiTokenProvider()` and adding env declarations.
- **Prompt-04** (SPFx Permissions): Straightforward addition of `webApiPermissionRequests` block. Use estimating's declaration as the template.
- **Prompt-05** (Runtime Config): `IMountConfig` exists but is not propagated. Wire config through App to a runtime config store or context.
- **Prompt-06** (UX Alignment): Two sub-gaps — light-theme forcing and environment-state messaging. Both have clear Project Setup patterns to follow.
- **Prompt-07** (Users/Me Dependency): Complexity package's silent fallback means this is not a blocker but is production-hygiene debt. Consider SPFx-safe adapter or explicit quarantine.
- **Prompt-08** (Docs): Two targeted corrections — connected-service-posture staging reference and current-state-map Accounting synthesis.
- **Prompt-09** (Testing/Artifacts): Must produce a fresh .sppkg build and inspect the packaged shell asset for correct DefinePlugin constant embedding.
- **Prompt-10** (Final Reconciliation): Closure report aggregating all evidence from Prompts 01–09.
