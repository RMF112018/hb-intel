# Accounting Hosted Staging Validation and Tenant Approval Readiness

**Date:** 2026-04-02
**Scope:** Convert the rebuilt Accounting release candidate into a hosted validation plan with clean separation of proof tiers.
**Phase:** [Phase 11, Prompt 08](../plans/MASTER/spfx/accounting/phase-11/Prompt-08_Phase-11-Hosted-Staging-Validation-and-Tenant-Approval-Readiness.md)
**Predecessor:** [Production-Target .sppkg Build Evidence](accounting-production-target-sppkg-build-evidence.md) (P11-07)

## 1. Executive Summary

The Accounting `.sppkg` release candidate is **repo-complete and artifact-verified** as of P11-07. All repo-side proof dimensions are satisfied: packaging path, bundle contract, API permissions, runtime injection, hosted dependencies, shell continuity, and artifact integrity.

What remains are **hosted environment validations and tenant-admin prerequisites** that cannot be verified from the repo alone. This memo provides the execution path for those remaining steps, with explicit owner assignments and evidence requirements.

No hosted validation is marked "done" — all items below require environment execution before they produce evidence.

## 2. Artifact Baseline Used

| Property | Value |
|----------|-------|
| Artifact | `dist/sppkg/hb-intel-accounting.sppkg` |
| Version | `001.000.033` (at build time; current repo version `001.000.034`) |
| SHA-256 | `b0c0ee558e358835b4618f3f45a53c30d7e46be7d00be5ca96176472001ae53d` |
| Build evidence | [P11-07 Artifact Evidence](accounting-production-target-sppkg-build-evidence.md) |
| Classification | Staging-targeted (local build without CI/CD env vars) |

**For production-target artifact:** Rebuild in CI/CD with `FUNCTION_APP_URL`, `API_AUDIENCE`, and `BACKEND_MODE=production` env vars.

## 3. Hosted Validation Checklist

### Tier 1: App Catalog Deployment and Trust

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H1 | Upload `.sppkg` to tenant app catalog | Screenshot or CLI confirmation of successful upload | SharePoint Admin | Not started |
| H2 | Trust dialog accepted (deploy to all sites or site-scoped) | Screenshot of trust dialog showing `hb-intel-accounting` with `access_as_user` scope | SharePoint Admin | Not started |
| H3 | App visible in site contents after deployment | Screenshot of app catalog listing showing version `001.000.0xx` | SharePoint Admin | Not started |

### Tier 2: API Access Approval

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H4 | API access request appears in SharePoint admin center | Screenshot of pending API access request for `hb-intel-api-production / access_as_user` | SharePoint Admin | Not started |
| H5 | API access request approved | Screenshot of approved status in admin center | SharePoint Admin | Not started |
| H6 | Verify tenant-wide scope: if Estimating's identical permission was already approved, confirm Accounting inherits | Admin center confirmation or documented auto-approval | SharePoint Admin | Not started |

**Microsoft reference:** [Connect to Azure AD-secured APIs in SharePoint Framework solutions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) — API permissions are tenant-scoped; approval of `hb-intel-api-production / access_as_user` for one solution applies to all solutions requesting the same resource/scope.

### Tier 3: Token Acquisition in Hosted Context

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H7 | SPFx `AadTokenProvider.getToken(audience)` succeeds in hosted page | Browser DevTools network trace showing successful token request, or console log from mount.tsx | Developer + SharePoint Admin | Not started |
| H8 | Acquired token contains `aud` matching `API_AUDIENCE` | JWT decode of acquired token (redact sensitive claims) | Developer | Not started |
| H9 | Token contains `scp: access_as_user` | JWT decode confirmation | Developer | Not started |

### Tier 4: Function App URL Resolution

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H10 | Shell-injected `FUNCTION_APP_URL` resolves in hosted runtime | Browser console showing `runtimeConfig` with `functionAppUrl` populated | Developer | Not started |
| H11 | `checkProductionReadiness()` returns `ready: true` | Console log or code breakpoint evidence | Developer | Not started |

**Note:** Requires CI/CD-built artifact with `FUNCTION_APP_URL` env var set. The local build artifact (P11-07) has empty runtime config values.

### Tier 5: Backend Route Connectivity

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H12 | `GET /api/project-setup-requests` returns 200 with valid Bearer token | Browser DevTools network trace | Developer | Not started |
| H13 | `PATCH /api/project-setup-requests/{id}/state` returns 200 on state advance | Network trace of successful action | Developer | Not started |
| H14 | 401 returned when token is missing or invalid | Negative test evidence | Developer | Not started |

### Tier 6: CORS Verification

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H15 | Function App CORS configuration includes the SharePoint origin | Azure portal screenshot or `az functionapp cors show` output | DevOps / Backend | Not started |
| H16 | Preflight `OPTIONS` request succeeds from hosted SharePoint page | Browser DevTools showing preflight + successful API call | Developer | Not started |

**Microsoft reference:** [CORS in Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#cors) — The Function App's CORS allowlist must include the SharePoint tenant origin (e.g., `https://hbcaldwell.sharepoint.com`).

### Tier 7: Same-Origin Dependency Validation

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H17 | No network calls to `/api/users/me/preferences` or `/api/users/me/groups` in hosted runtime | Browser DevTools network tab filtered for `users/me` — zero requests | Developer | Not started |

**Reference:** P11-05 confirmed triple-gate isolation. This hosted check validates the isolation holds in the SharePoint runtime context.

### Tier 8: Smoke Workflow Path

| # | Validation Step | Evidence Required | Owner | Status |
|---|----------------|-------------------|-------|--------|
| H18 | Accounting webpart renders in SharePoint page | Screenshot of rendered UI in hosted environment | Developer | Not started |
| H19 | Project Review Queue page loads with real data | Screenshot showing request list from API | Developer | Not started |
| H20 | Project Review Detail page loads for a specific request | Screenshot showing request detail with state actions | Developer | Not started |
| H21 | State advance action (approve/hold/clarify) completes successfully | Screenshot showing action success toast and state change | Developer | Not started |
| H22 | Complexity tier switching works (essential → standard → expert) | Screenshots at each tier showing feature gating | Developer | Not started |
| H23 | Back-to-Project-Hub navigation works | Confirmation of navigation link functionality | Developer | Not started |

## 4. External / Tenant Prerequisite Register

| # | Prerequisite | Owner | Evidence Required | Impacted Stage | Severity |
|---|-------------|-------|-------------------|---------------|----------|
| E1 | App registration `hb-intel-api-production` exists in Entra ID | IT / Identity | Azure portal screenshot | H4–H9 (API access + token) | **Blocker** |
| E2 | App registration exposes `access_as_user` scope | IT / Identity | App registration manifest screenshot | H4–H9 | **Blocker** |
| E3 | `accessTokenAcceptedVersion` is null or 1 | IT / Identity | App registration manifest screenshot | H7–H9 (token format) | **Blocker** |
| E4 | App roles configured (Admin, Controller, BreakGlass, Automation) | IT / Identity | App registration roles screenshot | Backend authorization | **Blocker** for admin/controller actions |
| E5 | SharePoint admin approves API access request | SharePoint Admin | Admin center screenshot | H5–H6 | **Blocker** |
| E6 | Function App deployed with `API_AUDIENCE` and `AZURE_TENANT_ID` env vars | DevOps | Azure portal app settings screenshot | H12–H14 (backend auth) | **Blocker** |
| E7 | Function App CORS includes SharePoint origin | DevOps | `az functionapp cors show` output | H15–H16 | **Blocker** |
| E8 | CI/CD pipeline builds `.sppkg` with `FUNCTION_APP_URL` and `API_AUDIENCE` | DevOps | Pipeline run log | H10–H11 (runtime config) | **Blocker** for production artifact |
| E9 | SharePoint site page configured with Accounting webpart | SharePoint Admin / Developer | Site page screenshot | H18–H23 (smoke test) | **Required** for validation |

## 5. Owner Assignment Summary

| Owner | Responsibilities |
|-------|-----------------|
| **SharePoint Admin** | E1 verification, E5 approval, E9 site page setup, H1–H6 |
| **IT / Identity** | E1–E4 app registration configuration |
| **DevOps** | E6–E8 Function App and CI/CD pipeline configuration |
| **Developer** | H7–H23 hosted validation execution, evidence collection |

## 6. Blocking Severity Classification

| Severity | Count | Items |
|----------|-------|-------|
| **Blocker** — prevents all hosted validation | 3 | E1 (app registration), E5 (API approval), E6 (Function App config) |
| **Blocker** — prevents specific validation tiers | 5 | E2, E3, E4, E7, E8 |
| **Required** — prevents smoke test | 1 | E9 |
| **Validation** — requires execution | 23 | H1–H23 |

## 7. Evidence Still Needed

### From repo (complete)
All repo-side evidence is captured in P11-01 through P11-07. No additional repo work is required.

### From hosted environment (pending)
All 23 hosted validation items (H1–H23) require execution in the target SharePoint tenant with a CI/CD-built production artifact. None can be completed from the repo alone.

### From external stakeholders (pending)
All 9 external prerequisites (E1–E9) require action from IT, SharePoint Admin, or DevOps teams. These should be requested in parallel to minimize calendar delay.

## 8. Exact Files / References Used

### Phase 11 evidence chain
- [P11-01 Canonical Packaging Truth Freeze](accounting-spfx-packaging-truth-freeze.md)
- [P11-02 Entry Surface and Bundle Contract](accounting-entry-surface-and-bundle-contract-reconciliation.md)
- [P11-03 API Permission Contract](accounting-protected-api-permission-contract-reconciliation.md)
- [P11-04 Runtime Config Injection Parity](accounting-runtime-config-injection-and-packaged-shell-hardening.md)
- [P11-05 Hidden Hosted Dependencies](accounting-hidden-hosted-dependency-reconciliation.md)
- [P11-06 Shell Continuity](accounting-vs-project-setup-shell-continuity-review.md)
- [P11-07 Artifact Evidence](accounting-production-target-sppkg-build-evidence.md)

### Auth and configuration references
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-connected-services-readiness.md`

### Microsoft documentation
- [SPFx API permissions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)
- [Azure Functions CORS](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#cors)
