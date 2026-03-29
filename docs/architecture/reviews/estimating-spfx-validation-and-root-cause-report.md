# Estimating SPFx Validation & Root-Cause Report

> **Date**: 2026-03-29
> **Scope**: Estimating app Project Setup surface in SPFx runtime
> **Commit**: `0690a9e6` (branch `main`)
> **Status**: Validation-only deliverable — no implementation changes

---

## 1. Executive Summary

The Estimating SPFx surface has **one critical runtime defect** (missing Function App URL), **one configuration misalignment** (SharePoint site URL pointing to wrong tenant), **one missing feature** (Year column), and **multiple production-readiness gaps** across auth scoping, state-transition authorization, theme propagation, and test coverage.

All eight prior audit findings were validated against the local repo. Seven are confirmed; one is partially confirmed.

---

## 2. Confirmed Root Cause: `undefined/api/project-setup-requests`

### Symptom

```
GET https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/undefined/api/project-setup-requests 404 (Not Found)
```

UI displays: "Something went wrong — Unable to load project setup requests."

### Evidence Chain

| Step | File | Finding |
|------|------|---------|
| 1 | `apps/estimating/src/pages/ProjectSetupPage.tsx:65` | `createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, ...)` |
| 2 | `packages/provisioning/src/api-client.ts:61` | `fetch(\`${baseUrl}/api${path}\`, ...)` — `baseUrl` receives `undefined` |
| 3 | `apps/estimating/vite.config.ts:107-111` | `define` block sets `HBC_ADAPTER_MODE`, `HBC_AUTH_MODE`, `NODE_ENV` only — **not** `VITE_FUNCTION_APP_URL` |
| 4 | `apps/estimating/` | No `.env`, `.env.production`, or `.env.local` file exists |
| 5 | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:97` | `mount(this.domElement, this.context)` — passes SPFx context only, no API URL |
| 6 | `apps/estimating/src/mount.tsx:26-32` | `mount()` receives `spfxContext` for auth bootstrap only; no config/URL parameter |
| 7 | `tools/build-spfx-package.ts` | Build orchestrator does not inject `VITE_FUNCTION_APP_URL` into Vite env |

### Root Cause (Confirmed Repo Fact)

`import.meta.env.VITE_FUNCTION_APP_URL` is **never defined** at any layer — not at Vite build time, not at SPFx runtime. Vite inlines the literal string `"undefined"` into the production IIFE bundle. The browser resolves this as a relative path from the current page URL, producing the observed 404.

### Affected Surfaces

| Page | File:Line | Usage |
|------|-----------|-------|
| Project Setup list | `ProjectSetupPage.tsx:65` | `createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, ...)` |
| New Request wizard | `NewRequestPage.tsx:51` | Same pattern |
| Request Detail | `RequestDetailPage.tsx:39` | Same pattern |
| SignalR negotiate | `RequestDetailPage.tsx:52` | `useProvisioningSignalR({ negotiateUrl: \`${import.meta.env.VITE_FUNCTION_APP_URL}/api/provisioning-negotiate\` })` |

### Required Fix

Inject the Azure Function App URL via one of:
- **(Recommended)** Runtime config: shell webpart reads from SPFx property pane or tenant app properties and passes to `mount()`
- **(Alternative)** Build-time: `.env.production` with `VITE_FUNCTION_APP_URL=https://<function-app>.azurewebsites.net` + CI pipeline env var

---

## 3. SharePoint List-Target Validation

### Expected Target (Confirmed by User)

| Property | Value |
|----------|-------|
| Site URL | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` |
| List title | `Projects` |
| List URL | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Projects/AllItems.aspx` |

### Current Repo Alignment

| Config | File | Current Value | Status |
|--------|------|---------------|--------|
| `SHAREPOINT_TENANT_URL` | `backend/functions/local.settings.example.json:13` | `https://hbconstruction.sharepoint.com` | **WRONG TENANT** |
| List title | `backend/functions/src/services/project-requests-repository.ts:9` | `'Projects'` | Correct |
| PnPjs site binding | `project-requests-repository.ts:177` | `spfi(this.tenantUrl)` — connects to tenant root | **WRONG SITE** |

### Two Consumers of "Projects" List

| Consumer | Location | Site | Field Names |
|----------|----------|------|-------------|
| Backend project-requests-repository | `backend/functions/` | `SHAREPOINT_TENANT_URL` (tenant root) | Display names: `ProjectName`, `ProjectNumber`, etc. |
| Project-sites webpart | `packages/spfx/src/webparts/projectSites/` | HBCentral | `field_N` internal names from CSV import |

### Required Changes

1. `SHAREPOINT_TENANT_URL` (or a new `SHAREPOINT_SITE_URL`) must point to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
2. `project-requests-repository.ts` PnPjs connection must target the HBCentral site
3. **Field-name reconciliation required**: If both consumers target the same list, the backend's display-name fields (`ProjectName`, `ProjectNumber`) will fail against the HBCentral list's `field_N` internal names from CSV import. The backend `toListItem()`/`fromListItem()` must be updated to use the confirmed `field_N` schema.

### Unresolved Question

Are the backend and project-sites webpart intended to share the **same** HBCentral Projects list? The user-confirmed list URL matches the one the project-sites webpart already reads. If confirmed as shared, field-name reconciliation is mandatory before backend deployment.

---

## 4. Year Column Validation

### Current Repo Support: None

| Layer | File | Year Support |
|-------|------|-------------|
| Model | `packages/models/src/provisioning/IProvisioning.ts` | No `year` property |
| Wizard form | `apps/estimating/src/components/project-setup/ProjectInfoStepBody.tsx` | No Year field |
| Field map | `packages/features/estimating/src/project-setup/config/projectSetupFieldMap.ts` | No Year entry |
| Backend select | `project-requests-repository.ts:60-85` | No Year in select list |
| Backend upsert | `project-requests-repository.ts:101-129` | No Year in payload |
| List creation script | `scripts/create-projects-list.ts` | No Year field provisioned |

### Existing Year Usage (Project-Sites Webpart)

The Year column **does exist** on the HBCentral Projects list and is already consumed by the project-sites webpart:

| File | Usage |
|------|-------|
| `packages/spfx/src/webparts/projectSites/types.ts:28` | `YEAR: 'Year'` in `SP_PROJECTS_FIELDS` |
| `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts:26-46` | Fetches distinct Year values for filter |
| `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts:37-39` | Filters items by Year |
| `packages/spfx/src/webparts/projectSites/types.ts:59` | `year: number` in `IProjectSiteEntry` |

### Internal Name Assessment

The `Year` column was added **after** the CSV import (standard SharePoint column addition), so its internal name is `Year` (matching display name). The project-sites webpart already successfully uses `'Year'` as the internal name. **No separate validation required.**

### Recommended Data Source

Add `Year` as an explicit numeric field in the Project Info wizard step, defaulting to the current calendar year. This is safest because project year may differ from submission date or start date.

### Required Implementation (P2)

1. Add `year?: number` to `IProjectSetupRequest` in `packages/models/src/provisioning/IProvisioning.ts`
2. Add Year input to `apps/estimating/src/components/project-setup/ProjectInfoStepBody.tsx` (default: current year)
3. Add `year` to `packages/features/estimating/src/project-setup/config/projectSetupFieldMap.ts`
4. Add `Year` to backend select, `toListItem()`, `fromListItem()` in `project-requests-repository.ts`

---

## 5. Prior Audit Validation Matrix

| # | Finding | Status | Evidence | Impact |
|---|---------|--------|----------|--------|
| 1 | **Requester-scoped list access missing** | **CONFIRMED** | `backend/functions/src/functions/projectRequests/index.ts:80-93` — `listProjectSetupRequests` returns all requests to all authenticated users. `listMyRequests` exists in client interface (`packages/provisioning/src/api-client.ts:32`) but backend GET handler has no `submitterId` filter. | HIGH |
| 2 | **State-transition auth missing** | **CONFIRMED** | `backend/functions/src/state-machine.ts:21-23` — `isValidTransition()` checks state rules only, not user roles. `projectRequests/index.ts:100-198` — any authenticated user can advance any request state. | HIGH |
| 3 | **Backend validation weaker than wizard** | **PARTIALLY CONFIRMED** | Backend (`index.ts:32-35`) validates only `projectName` and `groupMembers`. Wizard (`projectSetupSteps.ts`) also validates `projectLocation` required, `estimatedValue >= 0`. Backend accepts data the wizard rejects. | MEDIUM |
| 4 | **Clarification return flow incomplete** | **PARTIALLY CONFIRMED** | `ClarificationBanner.tsx` navigates to wizard with `mode=clarification-return`. Transition `NeedsClarification → UnderReview` exists. No enforcement that requester addressed specific `clarificationItems` before resubmitting. | MEDIUM |
| 5 | **Persistence/model drift** | **CONFIRMED** | `IProjectSetupRequest` has `retryCount`, `requesterRetryUsed`, `clarificationRequestedAt`, `clarificationItems` — none persisted in `toListItem()` (`project-requests-repository.ts:101-129`). `retryCount` read from `item.RetryCount` (line 158) but never written. | MEDIUM |
| 6 | **SignalR not production-safe** | **CONFIRMED** | Client `useProvisioningSignalR` uses `import.meta.env.VITE_FUNCTION_APP_URL` — same undefined URL defect. Backend negotiate endpoint and push service exist but are unreachable. | HIGH |
| 7 | **Tests over-mocked** | **CONFIRMED** | `request-lifecycle.test.ts` uses `MockProjectRequestsRepository`. Auth tests mock `validateToken` entirely. No integration tests for clarification flow or wizard→backend round-trip. | MEDIUM |
| 8 | **SPFx theme posture not production-ready** | **CONFIRMED** | See Section 6. | MEDIUM |

---

## 6. UI/Theme Defect Analysis

### Confirmed Causes

| Cause | File | Detail |
|-------|------|--------|
| Hardcoded `:root` colors | `apps/estimating/src/webpart.css:1` | `:root { color: #242424; background-color: #ffffff; }` overrides theme tokens |
| No SPFx theme propagation | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:97` | Shell passes `this.context` but no theme data |
| OS dark-mode detection | `packages/ui-kit/src/HbcAppShell/hooks/useFieldMode.ts` | `HbcThemeProvider` reads `prefers-color-scheme` — dark OS = dark theme inside SP light chrome |
| No SP theme bridge | (missing) | SPFx `window.__themeState__` not consumed |

### Observed Result

When user's OS prefers dark mode, `HbcThemeProvider` applies `hbcDarkTheme` (surfaces: `#111827`, `#0F172A`). The `:root` CSS simultaneously sets `background-color: #ffffff` and `color: #242424`. Fluent tokens resolve to dark variants while container backgrounds remain light — causing low-contrast rendering, dark background fragments, and unstyled-looking tabs/buttons.

### Required Fix

1. Remove hardcoded `:root` color/background from `webpart.css` — let Fluent tokens control all colors
2. When `spfxContext` is present, force `HbcThemeProvider` to light theme (SharePoint is always light chrome)
3. Optionally: read SharePoint theme tokens from `window.__themeState__` for deeper integration

---

## 7. Prioritized Remediation Plan

### P0 — Do First (Unblocks Production Use)

| # | Task | Key Files |
|---|------|-----------|
| 1 | Inject Function App URL into SPFx runtime | `ShellWebPart.ts`, `mount.tsx`, `App.tsx`, all pages using `createProvisioningApiClient` |
| 2 | Fix SPFx theme posture | `webpart.css`, `mount.tsx`, `HbcThemeProvider` integration |
| 3 | Align SharePoint site URL config | `local.settings.example.json`, `project-requests-repository.ts` |

### P1 — Do Next (Security & Data Integrity)

| # | Task | Key Files |
|---|------|-----------|
| 4 | Requester-scoped list endpoint | `projectRequests/index.ts` |
| 5 | Role-gated state transitions | `state-machine.ts`, `projectRequests/index.ts` |
| 6 | Backend validation parity | `projectRequests/index.ts` |
| 7 | Persistence field coverage | `project-requests-repository.ts` |

### P2 — Do Later (Feature & Quality)

| # | Task | Key Files |
|---|------|-----------|
| 8 | Year column integration | `IProvisioning.ts`, `ProjectInfoStepBody.tsx`, `projectSetupFieldMap.ts`, `project-requests-repository.ts` |
| 9 | Field-name reconciliation (if shared list) | `project-requests-repository.ts` |
| 10 | Clarification enforcement | Backend handler, wizard return flow |
| 11 | Integration tests | `projectRequests/__tests__/` |

---

## 8. Prompt 02 Handoff

**Start with P0-1** (Function App URL injection):
1. Extend `mount()` signature: `mount(el, spfxContext, config?: { functionAppUrl?: string })`
2. Shell reads Function App URL from webpart property pane or tenant app property
3. Pass through to `App` → React context/store → all pages
4. Alternative fast path: `.env.production` with hardcoded URL + CI injection

**Then P0-2** (theme): Remove `:root` overrides; force light theme when `spfxContext` present.

**Then P0-3** (site URL): Update config example; document HBCentral site URL requirement.

---

## 9. Changed Files

No implementation changes. This is a validation-only deliverable.
