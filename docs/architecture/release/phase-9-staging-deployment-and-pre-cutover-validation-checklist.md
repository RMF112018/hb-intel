# Phase 9 — Staging Deployment and Pre-Cutover Validation Checklist

**Date:** 2026-04-02
**Phase:** Phase 9 — Release Hardening, Pilot, and Cutover
**Scope:** Project Setup workflow — Accounting controller review, provisioning runtime, Admin exception handling, connected Estimating/PWA surfaces.
**Prompt:** `Prompt-02_Phase-9-Staging-Deployment-and-Pre-Cutover-Validation.md`
**Baseline:** `docs/architecture/reviews/phase-9-release-readiness-audit.md`

---

## 1. Deployment Scope

### Release-candidate components

| Component | Package | Current version | Artifact |
|-----------|---------|-----------------|----------|
| Accounting SPFx webpart | `@hbc/spfx-accounting` | 00.000.041 / SPFx 001.000.014 | `hb-intel-accounting.sppkg` |
| Estimating SPFx webpart | `@hbc/spfx-estimating` | 0.1.11 | `hb-intel-estimating.sppkg` |
| Admin SPFx webpart | `@hbc/spfx-admin` | (current) | `hb-intel-admin.sppkg` |
| Backend Functions host | `@hbc/functions` | 0.0.60 | Azure Functions deployment package |
| Provisioning package | `@hbc/provisioning` | (workspace) | Bundled into consuming apps |

### Route families in scope (per RELEASE-SCOPE.md)

8 families: `projectRequests`, `provisioningSaga`, `timerFullSpec`, `signalr`, `acknowledgments`, `notifications`, `health`, `cleanupIdempotency`

11 domain CRUD route families are **excluded** at compile time.

### Deployment slot posture

Slot-based staging/swap is a recommended Azure Functions deployment pattern per Microsoft guidance. **This is not yet evidenced in the target environment.** If the target Function App does not have a staging slot configured, deployment proceeds directly to the production slot with artifact-based rollback as the fallback.

This checklist is written to work with either model. Steps marked **(slot-only)** apply only if a staging slot exists.

---

## 2. Environment Assumptions

All of the following must be true before staging validation begins. Each is classified by evidence type.

| # | Assumption | Owner | Classification | Verified? |
|---|-----------|-------|----------------|-----------|
| E-1 | Azure Function App exists in the target subscription | Platform/DevOps | **manual verification required** | [ ] |
| E-2 | Application Insights resource provisioned and `APPLICATIONINSIGHTS_CONNECTION_STRING` set | Platform/DevOps | **manual verification required** | [ ] |
| E-3 | Azure Table Storage account provisioned and `AZURE_TABLE_ENDPOINT` set | Platform/DevOps | **manual verification required** | [ ] |
| E-4 | Key Vault provisioned with all Bucket A secrets (see section 3) | Platform/DevOps | **manual verification required** | [ ] |
| E-5 | Managed Identity enabled on Function App with Graph and Table Storage permissions | Platform/DevOps | **externally blocked** (requires tenant admin) | [ ] |
| E-6 | SignalR Service resource provisioned and connection string available | Platform/DevOps | **manual verification required** | [ ] |
| E-7 | SharePoint App Catalog accessible (tenant or site-collection level) | SharePoint admin | **externally blocked** | [ ] |
| E-8 | `FUNCTION_APP_URL` set in CI/build pipeline before .sppkg packaging | DevOps | **manual verification required** | [ ] |
| E-9 | **(slot-only)** Staging slot exists on the Function App | Platform/DevOps | **not yet evidenced** | [ ] |

**Gate:** Do not proceed to smoke testing until E-1 through E-8 are verified. E-9 is optional and affects rollback strategy only.

---

## 3. Config Validation Steps

Validate all required configuration settings before any workflow smoke testing. Settings are organized by the two-bucket governance model from `wave-0-config-registry.md`.

### Bucket A — Infrastructure (Platform/DevOps owned)

| # | Setting | Tier | Validation method | Pass? |
|---|---------|------|-------------------|-------|
| C-A1 | `AZURE_TENANT_ID` | Core (blocking) | Function App → Configuration → verify non-empty, matches target tenant | [ ] |
| C-A2 | `AZURE_CLIENT_ID` | Core (blocking) | Verify matches the Managed Identity or app registration client ID | [ ] |
| C-A3 | `AZURE_TABLE_ENDPOINT` | Core (blocking) | Verify resolves to the correct Storage Account; health probe returns 200 | [ ] |
| C-A4 | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Core (blocking) | Verify non-empty; confirm telemetry appears in App Insights Live Metrics within 60s of Function App start | [ ] |
| C-A5 | `HBC_ADAPTER_MODE` | Core (blocking) | Verify set to expected value for environment (`production` or `staging`) | [ ] |
| C-A6 | `API_AUDIENCE` | Core (blocking) | Verify matches the Entra ID app registration audience URI | [ ] |
| C-A7 | `SHAREPOINT_TENANT_URL` | SharePoint (warning) | Verify resolves to the correct tenant root (`https://<tenant>.sharepoint.com`) | [ ] |
| C-A8 | `SHAREPOINT_PROJECTS_SITE_URL` | SharePoint (warning) | Verify resolves to the correct Projects site; GET returns 200 with valid auth | [ ] |
| C-A9 | `SHAREPOINT_HUB_SITE_ID` | Provisioning (saga-time) | Verify GUID format; confirm site is a registered hub site | [ ] |
| C-A10 | `FUNCTION_APP_URL` | Build-time | Verify SPFx bundle network requests target `https://<function-app>.azurewebsites.net/api/...` (not `undefined/api/...`) | [ ] |

### Bucket B — Business (Product Owner/Admin owned)

| # | Setting | Validation method | Pass? |
|---|---------|-------------------|-------|
| C-B1 | `CONTROLLER_UPNS` | Verify contains at least one valid UPN for the staging controller user | [ ] |
| C-B2 | `ADMIN_UPNS` | Verify contains at least one valid UPN for the staging admin user | [ ] |
| C-B3 | `OPEX_MANAGER_UPN` | Verify set if notification routing is tested; may be placeholder for staging | [ ] |

### Startup validation note

`validate-config.ts` exports `validateProvisioningPrerequisites()` with fail-fast logic, but it is **not yet wired into the startup path** (G2.6 deferred). Configuration must be validated manually using the steps above until G2.6 integration is complete.

---

## 4. Backend Readiness Checks

| # | Check | Method | Classification | Pass? |
|---|-------|--------|----------------|-------|
| B-1 | Function App starts without error | Azure Portal → Function App → Overview → Status = Running; no startup exceptions in App Insights | **manual verification** | [ ] |
| B-2 | Health probe responds | `GET /api/health` returns 200 | **manual verification** | [ ] |
| B-3 | Auth middleware active | `GET /api/project-requests` without bearer token returns 401 | **repo-proven** (test) + **manual verification** (live) | [ ] |
| B-4 | CORS rejects foreign origin | Request from non-tenant origin returns CORS error | **repo-proven** (test) + **manual verification** (live) | [ ] |
| B-5 | CORS allows tenant origin | Request from `https://<tenant>.sharepoint.com` with credentials succeeds | **manual verification** | [ ] |
| B-6 | Table Storage connectivity | Submit a request; verify row appears in `ProjectRequests` table | **manual verification** | [ ] |
| B-7 | Managed Identity token acquisition | Function App acquires token for Graph API scope via `DefaultAzureCredential` | **externally blocked** until E-5 | [ ] |
| B-8 | Timer trigger registered | Azure Portal → Function App → Functions → verify `timerFullSpec` function exists | **manual verification** | [ ] |
| B-9 | **(slot-only)** Staging slot accessible | `GET /api/health` on staging slot URL returns 200 | **not yet evidenced** | [ ] |

---

## 5. SPFx / Surface Readiness Checks

| # | Check | Method | Classification | Pass? |
|---|-------|--------|----------------|-------|
| S-1 | .sppkg uploaded to App Catalog | SharePoint App Catalog → verify package appears with correct version | **manual verification** | [ ] |
| S-2 | App Catalog trust granted | "Deploy" / "Make this solution available to all sites" confirmed | **externally blocked** (SharePoint admin) | [ ] |
| S-3 | API access approved in Entra ID | SharePoint admin center → API access → verify pending permissions approved | **externally blocked** (tenant admin) | [ ] |
| S-4 | Webpart added to page | Add Accounting webpart to a modern page on the target site | **manual verification** | [ ] |
| S-5 | Module resolution | Browser Console → verify `[HB-Intel ShellWebPart] Module resolved.` message | **manual verification** | [ ] |
| S-6 | No undefined URLs | Browser Console + Network tab → verify no `undefined` in any URL | **manual verification** | [ ] |
| S-7 | API base URL resolves | Network tab → all API calls target `https://<function-app>.azurewebsites.net/api/...` | **manual verification** | [ ] |
| S-8 | Auth bootstrap | No 401 errors in console; user identity resolves in session context | **manual verification** | [ ] |
| S-9 | Theme enforcement | Light theme applied; dark mode overridden per `forceTheme="light"` | **repo-proven** (2 tests) + **manual verification** (visual) | [ ] |

---

## 6. Workflow Smoke Checks

Execute the full Project Setup lifecycle in the staging environment. Every step uses the current workflow contract language.

### 6.1 Submit (Estimating surface)

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| W-1 | Navigate to Project Setup tab on Estimating surface | Queue page loads; requests visible or empty state | [ ] |
| W-2 | Click "New Project Setup Request" | Wizard opens with required fields | [ ] |
| W-3 | Fill required fields and submit | Request created; appears in queue with state = `Submitted` | [ ] |
| W-4 | Verify request appears in Table Storage | `ProjectRequests` table row exists with correct state | [ ] |

### 6.2 Controller review (Accounting surface)

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| W-5 | Log in as controller user; navigate to Accounting review queue | Queue page loads; submitted request visible in Pending tab | [ ] |
| W-6 | Click "Begin Review" on submitted request | State transitions to `UnderReview`; detail page loads | [ ] |
| W-7 | Verify core summary fields | Project name, type, stage, submitter, submission date all display correctly | [ ] |

### 6.3 Clarification path

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| W-8 | Click "Request Clarification"; enter note; submit | State transitions to `NeedsClarification`; warning banner appears | [ ] |
| W-9 | Log in as requester; view request | Clarification banner visible; "Respond" action available | [ ] |
| W-10 | Respond to clarification; resubmit | State returns to `Submitted`; controller sees it in queue again | [ ] |

### 6.4 Approve to ReadyToProvision

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| W-11 | Enter valid project number (`##-###-##` format) | Project number field validates format | [ ] |
| W-12 | Click "Approve"; confirm in dialog | State transitions to `ReadyToProvision`; banner shows auto-trigger messaging | [ ] |
| W-13 | Verify Table Storage row | State = `ReadyToProvision`; project number persisted | [ ] |

### 6.5 Status visibility during provisioning

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| W-14 | Wait for timer trigger (or manually POST `/api/provisioning-retry/{projectId}`) | Provisioning saga starts; state transitions to `Provisioning` | [ ] |
| W-15 | Verify SignalR real-time updates | Status updates appear in UI without page refresh (if SignalR connected) | [ ] |
| W-16 | If SignalR unavailable, verify polling fallback | "Live updates paused" indicator; 30s polling interval | [ ] |
| W-17 | Verify provisioning completes | State transitions to `Completed` (or `Failed` if prerequisites missing) | [ ] |

### 6.6 Admin exception routing

| # | Step | Expected result | Pass? |
|---|------|-----------------|-------|
| W-18 | If provisioning failed: log in as admin; navigate to Admin Provisioning Oversight | Failures tab active; failed run visible | [ ] |
| W-19 | Verify retry action | "Retry (0/3)" button visible; click triggers retry with confirmation dialog | [ ] |
| W-20 | Verify archive action | "Archive" button visible; click archives failed run after confirmation | [ ] |
| W-21 | Verify escalation (post-ceiling) | After 3 retries, escalation guidance replaces retry button | [ ] |
| W-22 | Verify "Escalate to Admin" from Accounting detail | Button visible for Failed state; opens Admin URL with `?projectId=` | [ ] |
| W-23 | Verify permission gating | Read-only user sees no action buttons; force-state requires expert tier + permission | [ ] |

---

## 7. Manual External Dependency Checks

These checks verify that externally-owned prerequisites are in place. Each must be performed by or with the identified owner.

| # | Dependency | Owner | Check | Classification | Pass? |
|---|-----------|-------|-------|----------------|-------|
| D-1 | Sites.Selected consent | IT/Security tenant admin | Entra ID → Enterprise Applications → verify `Sites.Selected` consent granted | **externally blocked** | [ ] |
| D-2 | Group.ReadWrite.All consent | IT/Security tenant admin | Entra ID → verify `Group.ReadWrite.All` application permission granted | **externally blocked** | [ ] |
| D-3 | Per-site Graph grant | IT/Security tenant admin | Execute `grantSiteAccess()` on a staging site; verify 200 response | **externally blocked** | [ ] |
| D-4 | Managed Identity Graph token | Platform/DevOps | Function App acquires token for `https://graph.microsoft.com/.default` | **externally blocked** | [ ] |
| D-5 | App Catalog API approval | SharePoint/Tenant admin | SharePoint admin center → API access → no pending requests | **externally blocked** | [ ] |
| D-6 | `diagnose-permissions.ts` grant readiness | Engineering | Run permission diagnosis; all checks pass | **repo-proven** (tool exists) + **manual verification** (execution) | [ ] |

---

## 8. Evidence to Capture

For each staging validation pass, capture and retain the following evidence:

| # | Evidence item | Format | Retention location |
|---|--------------|--------|-------------------|
| EV-1 | Screenshot: Function App Configuration blade showing all Bucket A settings | PNG | Release evidence folder |
| EV-2 | Screenshot: App Catalog with deployed .sppkg and version | PNG | Release evidence folder |
| EV-3 | Screenshot: Console output showing module resolution message | PNG | Release evidence folder |
| EV-4 | Screenshot: Network tab showing API base URL resolution | PNG | Release evidence folder |
| EV-5 | Screenshot: Successful request submission with Table Storage row | PNG | Release evidence folder |
| EV-6 | Screenshot: Controller review queue showing submitted request | PNG | Release evidence folder |
| EV-7 | Screenshot: Approve flow with ReadyToProvision confirmation | PNG | Release evidence folder |
| EV-8 | Screenshot: Provisioning status updates (real-time or polling) | PNG | Release evidence folder |
| EV-9 | Screenshot: Admin failures tab with recovery actions | PNG | Release evidence folder |
| EV-10 | App Insights query: provisioning timeline for test correlationId | KQL export | Release evidence folder |
| EV-11 | Health probe response: `GET /api/health` → 200 | Text/screenshot | Release evidence folder |
| EV-12 | Permission diagnosis output from `diagnose-permissions.ts` | Text | Release evidence folder |

---

## 9. Explicit Pass / Fail Criteria

### Pass criteria (all must be true)

1. All Bucket A config settings resolve correctly (C-A1 through C-A10)
2. Backend health probe returns 200 (B-2)
3. Auth middleware rejects unauthenticated requests (B-3)
4. CORS accepts tenant origin and rejects foreign origins (B-4, B-5)
5. SPFx module resolves without undefined URLs (S-5, S-6, S-7)
6. Full workflow smoke path completes: submit → controller review → approve → ReadyToProvision (W-1 through W-13)
7. At least one provisioning attempt executes (W-14), even if it fails due to pending external prerequisites
8. Admin exception handling surfaces function correctly for failed runs (W-18 through W-23)
9. All evidence items captured (EV-1 through EV-12)

### Fail criteria (any triggers staging failure)

1. Function App fails to start or health probe returns non-200
2. Any Bucket A Core-tier setting is missing or unresolvable
3. SPFx bundle contains `undefined` in any API or CDN URL
4. Auth middleware does not reject unauthenticated requests
5. Workflow smoke path cannot reach `ReadyToProvision` state
6. Admin oversight page does not render or action buttons are missing

### Conditional pass (acceptable constraints)

1. Provisioning saga fails at Step 5 (SharePoint site creation) due to pending Sites.Selected consent — acceptable if steps 1–4 succeed
2. SignalR unavailable — acceptable if polling fallback activates and "Live updates paused" indicator appears
3. Email notifications console-logged only — acceptable (Wave 1 scope)
4. Teams webhook fire-and-forget — acceptable (Wave 1 scope)

---

## 10. Exit Criteria to Proceed to Pilot or Cutover

| # | Criterion | Required for | Status |
|---|-----------|-------------|--------|
| X-1 | All pass criteria met (section 9) | Pilot | [ ] |
| X-2 | Sites.Selected consent granted (D-1) OR Path B ADR approved | Pilot | [ ] |
| X-3 | Per-site Graph grant executed successfully on at least one staging site (D-3) | Pilot | [ ] |
| X-4 | Managed Identity token acquisition confirmed (D-4) | Pilot | [ ] |
| X-5 | Full provisioning saga completes end-to-end on at least one test project | Pilot | [ ] |
| X-6 | Pilot audience identified and approved by Product Owner | Pilot | [ ] |
| X-7 | Business-controlled settings (Bucket B) populated with pilot UPNs | Pilot | [ ] |
| X-8 | Evidence package complete and reviewed | Pilot | [ ] |
| X-9 | Rollback path confirmed: slot-swap tested (if slot exists) OR artifact redeployment procedure documented | Cutover | [ ] |
| X-10 | Production Bucket A and Bucket B settings confirmed | Cutover | [ ] |
| X-11 | Production monitoring active: alert rules configured in Azure Monitor | Cutover | [ ] |

---

## 11. Blocking Conditions

These conditions **prevent staging validation from starting or completing**:

| # | Condition | Impact | Resolution owner |
|---|----------|--------|-----------------|
| BL-1 | Function App not provisioned in target subscription | Cannot deploy backend | Platform/DevOps |
| BL-2 | Key Vault not provisioned or secrets missing | Function App fails to start or returns errors at runtime | Platform/DevOps |
| BL-3 | `FUNCTION_APP_URL` not set in build pipeline | SPFx bundle cannot resolve API endpoints | DevOps |
| BL-4 | App Catalog not accessible | Cannot deploy .sppkg | SharePoint admin |
| BL-5 | API access not approved in SharePoint admin center | SPFx webpart cannot call backend API | Tenant admin |
| BL-6 | Managed Identity not enabled or permissions not granted | Backend cannot authenticate to Graph API or Table Storage | Platform/DevOps + Tenant admin |

---

## 12. Exact Owners for Each Major Check

| Check area | Primary owner | Secondary / Escalation |
|-----------|--------------|----------------------|
| Environment provisioning (E-1 through E-9) | Platform/DevOps | Engineering lead |
| Bucket A config (C-A1 through C-A10) | Platform/DevOps | Engineering (validation logic) |
| Bucket B config (C-B1 through C-B3) | Product Owner | Engineering (format validation) |
| Backend readiness (B-1 through B-9) | Engineering | Platform/DevOps (infrastructure) |
| SPFx deployment (S-1 through S-3) | SharePoint admin | Tenant admin (API approval) |
| SPFx validation (S-4 through S-9) | Engineering | — |
| Workflow smoke (W-1 through W-23) | Engineering | Product Owner (workflow correctness) |
| External dependencies (D-1 through D-6) | IT/Security tenant admin | Platform/DevOps |
| Evidence capture (EV-1 through EV-12) | Engineering | — |
| Exit criteria sign-off (X-1 through X-11) | Engineering lead + Product Owner | — |

---

## 13. Staging Execution Sequence

For teams executing this checklist, the recommended order is:

1. **Verify environment assumptions** (section 2) — all E-* checks
2. **Validate configuration** (section 3) — all C-* checks
3. **Confirm backend readiness** (section 4) — B-1 through B-8
4. **Deploy and validate SPFx** (section 5) — S-1 through S-9
5. **Execute workflow smoke path** (section 6) — W-1 through W-23
6. **Verify external dependencies** (section 7) — D-1 through D-6 (may run in parallel with steps 1-5 where possible)
7. **Capture evidence** (section 8) — EV-1 through EV-12
8. **Evaluate pass/fail** (section 9)
9. **Confirm exit criteria** (section 10) — X-1 through X-11

---

## 14. Files Consulted

- `docs/architecture/reviews/phase-9-release-readiness-audit.md` — P9-01 baseline
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` — route families, auth, CORS
- `docs/reference/configuration/wave-0-config-registry.md` — Bucket A/B settings, startup validation
- `docs/reference/configuration/sites-selected-validation.md` — permission path decision matrix
- `docs/maintenance/provisioning-runbook.md` — recovery procedures, timer diagnostics
- `docs/maintenance/provisioning-observability-runbook.md` — KQL queries, alert rules
- `docs/reference/provisioning/verification-matrix.md` — C1-C4 pass/fail evidence
- `docs/architecture/reviews/estimating-spfx-release-readiness-checklist-and-summary.md` — pattern reference for SPFx staging checks
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` — approve/clarify/hold flow verification
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx` — admin recovery action verification
