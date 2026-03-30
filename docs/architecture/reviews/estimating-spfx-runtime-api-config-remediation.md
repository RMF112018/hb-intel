# Estimating SPFx Runtime API Config Remediation

> **Date**: 2026-03-29
> **Scope**: Function App URL injection, SharePoint target alignment, diagnostic improvement
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

1. **Runtime injection** — Shell webpart reads `__FUNCTION_APP_URL__` (webpack DefinePlugin) and passes it to `mount(el, context, { functionAppUrl })`. The app stores it in a module-level config before rendering.
2. **Vite build-time env** — `import.meta.env.VITE_FUNCTION_APP_URL` (for Vite dev mode or CI-injected builds).
3. **ConfigError** — Throws a descriptive `ConfigError` with actionable diagnostic instead of silently producing a relative URL.

### Why This Fits

- **Consistent with existing architecture**: The shell already uses webpack DefinePlugin for `__APP_BUNDLE_NAME__` and `__APP_GLOBAL_NAME__`. Adding `__FUNCTION_APP_URL__` follows the same pattern.
- **Generic shell contract**: The shell webpart remains domain-agnostic — it passes an opaque config object. The app decides what to do with it.
- **Production-safe**: The URL is baked into the SPFx webpack bundle at package build time, not dependent on Vite env at runtime.
- **Dev-compatible**: Vite dev mode still works via `.env.local` with `VITE_FUNCTION_APP_URL`.
- **Explicit failure**: Missing config throws `ConfigError` before any fetch, not after a confusing 404.

---

## 3. Changed Files

### Frontend (Estimating App)

| File | Change |
|------|--------|
| `apps/estimating/src/config/runtimeConfig.ts` | **NEW** — Config store with `setRuntimeConfig()`, `getFunctionAppUrl()`, `ConfigError` |
| `apps/estimating/src/mount.tsx` | Extended `mount()` to accept `config?: IMountConfig`; calls `setRuntimeConfig()` before render |
| `apps/estimating/src/pages/ProjectSetupPage.tsx` | Uses `getFunctionAppUrl()` instead of `import.meta.env.VITE_FUNCTION_APP_URL`; catches `ConfigError` |
| `apps/estimating/src/pages/NewRequestPage.tsx` | Same migration |
| `apps/estimating/src/pages/RequestDetailPage.tsx` | Same migration; SignalR negotiate URL also uses resolved config |
| `apps/estimating/src/test/runtimeConfig.test.ts` | **NEW** — Unit tests for config resolution, guard, and ConfigError |

### SPFx Shell

| File | Change |
|------|--------|
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Reads `__FUNCTION_APP_URL__` and passes to `mount()` as `{ functionAppUrl }` |
| `tools/spfx-shell/gulpfile.js` | Added `__FUNCTION_APP_URL__` to webpack DefinePlugin |

### Build Pipeline

| File | Change |
|------|--------|
| `tools/build-spfx-package.ts` | Passes `FUNCTION_APP_URL` env var to shell build env |

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
2. Run `pnpm --filter @hbc/estimating dev`
3. Verify Project Setup page loads without "undefined" in network requests

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
