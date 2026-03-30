# Estimating SPFx Runtime API Config Remediation

> **Date**: 2026-03-30
> **Scope**: Function App URL injection, backend-mode runtime selection, reviewer-only mode switching, SharePoint target alignment, diagnostic improvement
> **Predecessor**: `estimating-spfx-validation-and-root-cause-report.md`

---

## 1. Root Cause Summary

`import.meta.env.VITE_FUNCTION_APP_URL` was never defined — not at Vite build time (no `.env.production`, no `define` entry in `vite.config.ts`), not at SPFx runtime (shell webpart passed no config to `mount()`). Vite inlined the literal `"undefined"` into the IIFE bundle, causing every API call to resolve as a relative SharePoint page URL:

```
https://<sharepoint-site-url>/SitePages/undefined/api/project-setup-requests → 404
```

All three Estimating pages (ProjectSetupPage, NewRequestPage, RequestDetailPage) and SignalR negotiate were affected.

---

## 2. Chosen Solution

**Shell-injected runtime configuration** with build-time env fallback.

### Config Resolution Order

1. **Runtime injection** — Shell webpart reads `__FUNCTION_APP_URL__` and `__BACKEND_MODE__` (webpack DefinePlugin) and passes them to `mount(el, context, { functionAppUrl, backendMode })`. The app stores them in a module-level config before rendering.
2. **Vite build-time env** — `import.meta.env.VITE_FUNCTION_APP_URL` and `import.meta.env.VITE_BACKEND_MODE` (for Vite dev mode or CI-injected builds).
3. **Defaults / ConfigError** — `backendMode` defaults to `production`. `ConfigError` is thrown only when `production` mode requires a missing Function App URL.

### Why This Fits

- **Consistent with existing architecture**: The shell already uses webpack DefinePlugin for `__APP_BUNDLE_NAME__` and `__APP_GLOBAL_NAME__`. Adding `__FUNCTION_APP_URL__` follows the same pattern.
- **Generic shell contract**: The shell webpart remains domain-agnostic — it passes an opaque config object. The app decides what to do with it.
- **Production-safe**: The URL is baked into the SPFx webpack bundle at package build time, not dependent on Vite env at runtime.
- **Dev-compatible**: Vite dev mode still works via `.env.local` with `VITE_FUNCTION_APP_URL`.
- **Explicit failure**: Missing config throws `ConfigError` before any fetch, not after a confusing 404.
- **Review-safe**: `ui-review` bypasses backend fetches, negotiate URLs, provisioning retry polling, and red error shells tied to missing backend config.

### Added Backend Modes

| Mode | Intended use | Runtime behavior |
|------|---------------|------------------|
| `production` | Real SharePoint + Functions deployment | Uses live provisioning API adapter and SignalR/polling behavior |
| `ui-review` | SharePoint UI review with no backend dependency | Uses localStorage-backed Project Setup mock client; no backend fetches or negotiate calls |

### Reviewer-Only Switch Flag

| Flag | Intended use | Runtime behavior |
|------|---------------|------------------|
| `allowBackendModeSwitch` | Temporary tester control during limited release | Enables an estimating-local header switch that persists a browser-local backend-mode override |

- The switch is intentionally local to the Estimating Project Setup shell header, not the shared shell package.
- Persisted overrides use `hb-intel:estimating:project-setup:backend-mode-override`.
- Effective mode precedence is: persisted override when switching is enabled, then injected/env/default backend mode.
- Mode changes clear local provisioning UI state and remount the router subtree so routes stay stable while loaders restart safely.

---

## 3. Changed Files

### Frontend (Estimating App)

| File | Change |
|------|--------|
| `apps/estimating/src/config/runtimeConfig.ts` | **NEW** — Config store with `setRuntimeConfig()`, `getFunctionAppUrl()`, `ConfigError` |
| `apps/estimating/src/mount.tsx` | Extended `mount()` to accept `config?: IMountConfig`; calls `setRuntimeConfig()` before render |
| `apps/estimating/src/project-setup/backend/*` | **NEW** — App-local Project Setup backend boundary with live adapter + localStorage-backed `ui-review` adapter |
| `apps/estimating/src/App.tsx` | Router subtree remounts on backend mode changes so Project Setup routes restart safely without a full page refresh |
| `apps/estimating/src/pages/ProjectSetupPage.tsx` | Uses the app-local backend hook; `ui-review` preloads stored status and avoids backend error-shell behavior |
| `apps/estimating/src/pages/NewRequestPage.tsx` | Uses the app-local backend hook for create + clarification-return lookup |
| `apps/estimating/src/pages/RequestDetailPage.tsx` | Uses the app-local backend hook; SignalR/polling are disabled in `ui-review` |
| `apps/estimating/src/components/project-setup/RetrySection.tsx` | Uses the app-local backend hook instead of constructing a live client directly |
| `apps/estimating/src/router/root-route.tsx` | Shows the non-error `ui-review` informational banner and the gated reviewer-only backend mode switch |
| `apps/estimating/src/test/runtimeConfig.test.ts` | **NEW** — Unit tests for config resolution, guard, and ConfigError |

### SPFx Shell

| File | Change |
|------|--------|
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Reads `__FUNCTION_APP_URL__`, `__BACKEND_MODE__`, and `__ALLOW_BACKEND_MODE_SWITCH__` and passes them to `mount()` |
| `tools/spfx-shell/gulpfile.js` | Added `__FUNCTION_APP_URL__`, `__BACKEND_MODE__`, and `__ALLOW_BACKEND_MODE_SWITCH__` to webpack DefinePlugin |

### Build Pipeline

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Passes `FUNCTION_APP_URL`, `BACKEND_MODE`, and `ALLOW_BACKEND_MODE_SWITCH` env vars to shell build env |

### Backend

| File | Change |
|------|--------|
| `backend/functions/src/services/project-requests-repository.ts` | Added `SHAREPOINT_PROJECTS_SITE_URL` env var; PnPjs now connects to site-scoped URL |
| `backend/functions/local.settings.example.json` | Corrected tenant URL; added `SHAREPOINT_PROJECTS_SITE_URL` |
| `backend/functions/src/config/wave0-env-registry.ts` | Registered `SHAREPOINT_PROJECTS_SITE_URL` |
| `backend/functions/src/services/__tests__/project-requests-repository.test.ts` | **NEW** — SP target alignment tests |

### Documentation

| File | Change |
|------|--------|
| `docs/architecture/reviews/estimating-spfx-runtime-api-config-remediation.md` | **NEW** — This document |

---

## 4. Validation Steps

### Local Dev

1. Add `VITE_FUNCTION_APP_URL=http://localhost:7071` to `apps/estimating/.env.local`
2. Optionally set `VITE_BACKEND_MODE=ui-review` for SharePoint-free UI review
3. Run `pnpm --filter @hbc/estimating dev`
3. Verify Project Setup page loads without "undefined" in network requests

### SharePoint UI Review Mode

1. Set `BACKEND_MODE=ui-review` when packaging the Estimating SPFx surface, or inject `backendMode: 'ui-review'` from the shell runtime.
2. Set `ALLOW_BACKEND_MODE_SWITCH=true` only when testers should be able to switch modes inside SharePoint.
3. Deploy the `.sppkg` and open the Estimating Project Setup surface in SharePoint.
4. Verify the informational banner appears and Project Setup list/new/detail flows operate using local sample data.
5. If the switch is enabled, verify the header control updates the active mode label and persists the reviewer choice in the current browser only.
6. Verify there are no backend requests to `/api/project-setup-requests`, `/api/provisioning-status/*`, or `/api/provisioning-negotiate` while `UI Review` is active.

### SPFx Package Build

1. Set `FUNCTION_APP_URL=https://<your-function-app>.azurewebsites.net` in environment
2. Run `npx tsx tools/build-spfx-package.ts --domain estimating`
3. Verify the shell webpart bundle contains the Function App URL (inspect generated JS)

### SharePoint Deployment

1. Upload the `.sppkg` to the App Catalog
2. Add the webpart to a page
3. Open browser DevTools → Network tab
4. Verify API calls go to `https://<function-app>.azurewebsites.net/api/project-setup-requests`
5. Verify no `undefined` appears in any request URL

### Backend SP Target

1. Set `SHAREPOINT_PROJECTS_SITE_URL=https://<sharepoint-site-url>` in Function App configuration
2. Verify the backend connects to the HBCentral site's Projects list
3. Run backend tests: `pnpm --filter @hbc/functions test`

---

## 5. SharePoint Target Alignment Confirmation

| Property | Expected | Repo Status |
|----------|----------|-------------|
| Site URL | `https://<sharepoint-site-url>` | `SHAREPOINT_PROJECTS_SITE_URL` env var (preferred) → adapter `siteUrl` |
| List title | `Projects` | `PROJECTS_LIST_NAME = 'Projects'` (unchanged) |
| Tenant URL | `<sharepoint-tenant-url>` | `SHAREPOINT_TENANT_URL` (corrected in example) |

The backend adapter now uses `SHAREPOINT_PROJECTS_SITE_URL` to connect PnPjs to the correct site. Token scope is derived from the URL origin.

---

## 6. Year Column — Deferred Implementation Notes

The `Year` column (Number, `yyyy`) has been confirmed on the HBCentral Projects list. The project-sites webpart already successfully uses internal name `'Year'`.

**Not implemented in this prompt:**
- `year` property on `IProjectSetupRequest`
- Year field in wizard UI
- Year in backend field mapping

**Implementation notes for future prompt:**
- Internal name: `Year` (confirmed safe — added after CSV import, not a `field_N` name)
- Recommended UI: Explicit numeric input in Project Info step, default to current calendar year
- Backend: Add `Year` to `select()`, `toListItem()`, `fromListItem()` in `project-requests-repository.ts`
- Model: Add `year?: number` to `IProjectSetupRequest` in `packages/models/src/provisioning/IProvisioning.ts`
- Field map: Add `year: 'project-info'` to `projectSetupFieldMap.ts`

**Field-name reconciliation note:** If the backend and project-sites webpart share the same HBCentral Projects list, the backend's display-name-based SP field names (`ProjectName`, `ProjectNumber`, etc.) may need to be updated to `field_N` internal names. This is a separate concern from Year column integration.

---

## 7. Follow-on Work (Deferred)

| Priority | Task | Tracked In |
|----------|------|------------|
| P0 | SPFx theme fix (`:root` CSS + force light theme in SPFx) | Validation report §6 |
| P1 | Requester-scoped list endpoint | Validation report §5 item #1 |
| P1 | Role-gated state transitions | Validation report §5 item #2 |
| P1 | Backend validation parity | Validation report §5 item #3 |
| P1 | Persistence field coverage | Validation report §5 item #5 |
| P2 | Year column full implementation | This doc §6 |
| P2 | Field-name reconciliation | This doc §6 |
| P2 | Clarification enforcement | Validation report §5 item #4 |
| P2 | Integration tests | Validation report §5 item #7 |
