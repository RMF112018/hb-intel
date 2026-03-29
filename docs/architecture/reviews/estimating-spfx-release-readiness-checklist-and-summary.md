# Estimating SPFx Release-Readiness Checklist & Summary

> **Date**: 2026-03-29
> **App**: Estimating SPFx (`@hbc/spfx-estimating` v0.1.11)
> **Backend**: `@hbc/functions` v0.0.60
> **UI Kit**: `@hbc/ui-kit` v2.2.87

---

## 1. What Was Tested (Automated)

### Estimating App — 9 test files, 66 tests passed

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| `runtimeConfig.test.ts` | 8 | Config resolution, ConfigError, trailing slash handling, empty/undefined rejection |
| `themeEnforcement.test.tsx` | 2 | `forceTheme="light"` override, theme context propagation |
| `bootstrap.test.ts` | 4 | Mock environment bootstrap, persona, permissions |
| `router.test.ts` | 2 | Route registration |
| `NewRequestPage.test.tsx` | 16 | Wizard rendering, draft resume, submission, clarification-return |
| `RequestDetailPage.test.tsx` | 8 | Core summary, state context, clarification banner, provisioning checklist |
| `RequestDetailPage.completion.test.tsx` | 6 | Completion confirmation, missing status handling |
| `RequestDetailPage.coordinator.test.tsx` | 8 | Failure detail, retry/escalation, coordinator queue |
| `complexity.test.tsx` | 5 | Complexity gate rendering, tier switching |

### Backend — 40 test files, 431 tests passed

| Key Test File | Tests | Coverage Area |
|---------------|-------|---------------|
| `request-lifecycle.test.ts` | 49 | State transitions, role-based auth (C1-C10), Year derivation (E1-E6), persistence (D1-D12) |
| `project-requests-repository.test.ts` | 4 | SP site URL resolution, env var precedence, error messaging |
| `sp-field-mapping.test.ts` | 3 | Full round-trip persistence, field_N schema contract, Year default |
| `state-machine.test.ts` | 3 | Transition matrix, notification targets |
| `saga-orchestrator.test.ts` | 8 | Provisioning saga steps |

### Provisioning Package — 259 tests passed

| Key Test File | Tests | Coverage Area |
|---------------|-------|---------------|
| `api-client.test.ts` | 17 | Envelope unwrapping, error handling, auth header, undefined base URL guard |

### Build / Type / Lint

| Check | Result |
|-------|--------|
| `tsc --noEmit` (estimating) | Clean |
| `vite build` (estimating) | Clean — 1,183 KB IIFE |
| `eslint` (estimating) | 0 errors, 45 pre-existing warnings |
| `tsc --noEmit` (ui-kit) | Clean |
| `vitest` (backend) | 431 passed, 3 skipped |

---

## 2. What Remains Manual (SharePoint Staging Checklist)

### Deployment

- [ ] Upload `.sppkg` to SharePoint App Catalog (`https://hedrickbrotherscom.sharepoint.com/sites/appcatalog`)
- [ ] Deploy with "Make this solution available to all sites" enabled
- [ ] Verify app appears in Site Contents on HBCentral

### Page Setup & Bundle Load

- [ ] Add the Estimating webpart to a modern page on HBCentral
- [ ] Open browser DevTools → Console
- [ ] Verify `[HB-Intel ShellWebPart] Module resolved.` message appears
- [ ] Verify no `undefined` appears in any console URL
- [ ] Verify bundle URL resolves to CDN path (not relative `/sites/.../undefined/...`)

### API Base URL Resolution

- [ ] Open Network tab → filter for `api/`
- [ ] Verify all API calls go to `https://<function-app>.azurewebsites.net/api/...`
- [ ] Verify no requests to `undefined/api/...`
- [ ] If `FUNCTION_APP_URL` was not set at build time, verify ConfigError appears in console

### Auth & Bootstrap

- [ ] Verify SharePoint auth bootstraps (no 401 errors in console)
- [ ] Verify user identity resolves in session context
- [ ] Verify permissions load without error

### Project Setup — List Page

- [ ] Navigate to Project Setup tab
- [ ] Verify the page loads without "Something went wrong" error
- [ ] Verify requests display in the data table (or empty state if no requests)
- [ ] Verify non-admin users see only their own requests
- [ ] Verify admin/controller users see all requests

### Project Setup — New Request Flow

- [ ] Click "New Project Setup Request"
- [ ] Fill required fields: Project Name, Project Location, at least one group member
- [ ] Verify validation rejects empty project name / location
- [ ] Submit the request
- [ ] Verify the request appears in the list

### Project Setup — Request Detail

- [ ] Click on a request in the list
- [ ] Verify core summary fields display correctly
- [ ] Verify state context text matches current state
- [ ] If NeedsClarification, verify clarification banner appears

### Backend — SP Target Alignment

- [ ] Verify the Function App env has `SHAREPOINT_PROJECTS_SITE_URL=https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- [ ] Verify submitted requests appear in the HBCentral Projects list
- [ ] Verify field_N columns contain correct data (field_1=ProjectId, field_3=ProjectName, etc.)
- [ ] Verify Year column is populated (derived from project number prefix)

### Year Field Validation

- [ ] Submit a request for project number `25-xxx-xx` → verify Year = 2025 in SP list
- [ ] Submit a request for project number `24-xxx-xx` → verify Year = 2024 in SP list
- [ ] Submit a request with no project number → verify Year = current year (2026)
- [ ] Verify the project-sites webpart can filter by the Year values written by the backend

### Theme & Visual Quality

- [ ] Verify the page renders with light/white background inside SharePoint chrome
- [ ] Verify text is dark-on-light with appropriate contrast
- [ ] Verify buttons render with HBC brand styling (blue primary, outlined secondary)
- [ ] Verify data table renders with light surface and visible borders
- [ ] Toggle OS dark mode → verify the app STILL renders in light theme
- [ ] Verify no dark-background fragments or low-contrast text appears

### Error States

- [ ] Temporarily break the Function App URL → verify ConfigError message appears (not generic "connection" error)
- [ ] Disconnect from network → verify appropriate error messaging
- [ ] Access a non-existent request ID → verify "Not Found" state

---

## 3. Residual Risk Register

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R1 | `FUNCTION_APP_URL` not set in CI/build env | **Blocking** | Must be configured before production deployment. Shell webpart reads `__FUNCTION_APP_URL__` from webpack DefinePlugin. |
| R2 | `SHAREPOINT_PROJECTS_SITE_URL` not set in Function App | **Blocking** | Must point to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`. Falls back to tenant root which is wrong site. |
| R3 | SP field_N names change if list is recreated | **Low** | Schema is confirmed from live list. If list is recreated without CSV import, columns may get display-name internal names. |
| R4 | SignalR negotiate also needs Function App URL | **Medium** | Fixed by same config path. Validate in staging. |
| R5 | Clarification items not enforced before resubmit | **Low** | Deferred — requires UI changes. Clarification note is stored. |
| R6 | Over-mocked auth tests | **Medium** | Backend auth middleware tests mock `validateToken`. Real token validation requires Entra ID integration test env. |
| R7 | No E2E tests | **Medium** | Playwright framework exists but no Estimating E2E suite. Manual staging checklist covers this gap. |

---

## 4. SharePoint Target Alignment Confirmation

| Property | Expected | Verified In |
|----------|----------|-------------|
| Site URL | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` | `project-requests-repository.ts` constructor, `project-requests-repository.test.ts` |
| List title | `Projects` | `PROJECTS_LIST_NAME = 'Projects'` constant |
| Field names | `field_1`..`field_24`, `Title`, `Year` | `sp-field-mapping.test.ts`, `toListItem()`/`fromListItem()`, select/filter queries |

---

## 5. Year Field Validation Summary

| Aspect | Status |
|--------|--------|
| SP internal name `Year` | Confirmed |
| Model property `year?: number` | Implemented |
| Derivation rule | `projectNumber` prefix `##-` → `2000 + ##`; fallback to `new Date().getFullYear()` |
| Backend read/write | `Year` in select and toListItem/fromListItem |
| Unit tests | 6 derivation tests (E1-E6), round-trip test (D10) |
| Compatibility | project-sites webpart uses `SP_PROJECTS_FIELDS.YEAR = 'Year'` — compatible |

---

## 6. Go / No-Go Recommendation

### **Conditional GO** for staging deployment

**Conditions for production deployment:**
1. `FUNCTION_APP_URL` must be set in the CI/build environment before packaging the `.sppkg`
2. `SHAREPOINT_PROJECTS_SITE_URL` must be set to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` in the Function App configuration
3. Manual staging checklist (Section 2) must pass with no blocking failures

**Confidence level:**
- Runtime config injection: **High** (8 unit tests, build-time + runtime dual path)
- SP target alignment: **High** (field_N mapping matches confirmed schema, 7 tests)
- Authorization: **High** (10 role-based auth tests, requester-scoped listing)
- Theme enforcement: **High** (2 tests + CSS hardcoded color removal)
- Year integration: **High** (6 derivation tests, round-trip persistence test)
- End-to-end flow: **Medium** (no automated E2E; covered by manual checklist)

**Non-blocking residual items:**
- Clarification enforcement (UI change deferred)
- Integration tests against real SP (requires staging env)
- E2E Playwright suite (framework exists, suite not yet written for Estimating)
