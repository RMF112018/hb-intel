# Staging Validation Checklist — Estimating & Accounting SharePoint Provisioning Workflow

## Purpose

Use this checklist after:
- the implementation prompts are complete,
- the backend maintenance pass is complete,
- known backend test failures are resolved or dispositioned,
- deployment and tenant prerequisites are in place.

This is a **staging validation checklist**, not a planning note.

---

## A. Environment readiness gates

### A1. Function app deployment
- [ ] Latest backend code is deployed to staging (`@hbc/functions` version recorded).
- [ ] All function routes are reachable:
  - **Request lifecycle:** `POST /api/project-setup-requests`, `GET /api/project-setup-requests`, `PATCH /api/project-setup-requests/{requestId}/state`
  - **Provisioning:** `POST /api/provision-project-site`, `GET /api/provisioning-status/{projectId}`
  - **SignalR:** `POST /api/provisioning-negotiate`
  - **Timer:** `timerFullSpec` (CRON: `0 0 1 * * *` — 1 AM EST nightly)
  - **Admin oversight:** `GET /api/provisioning-runs`, `GET /api/provisioning-failures`, `POST /api/provisioning-retry/{projectId}`, `POST /api/provisioning-escalate/{projectId}`, `POST /api/provisioning-archive/{projectId}`, `POST /api/provisioning-escalation-ack/{projectId}`, `POST /api/provisioning-force-state/{projectId}`, `POST /api/admin/trigger-timer`
- [ ] Deployment artifact/version is recorded.

### A2. Auth / app registration
- [ ] Auth app registration used by staging is configured correctly (`AZURE_CLIENT_ID` audience in JWT).
- [ ] Bearer token flow works from Estimating, Accounting, Admin, and PWA surfaces.
- [ ] JWT validation succeeds against `https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys`.
- [ ] Required role claims are present:
  - `Admin` or `HBIntelAdmin` — required for admin oversight routes (listRuns, archive, ack, forceState, triggerTimer)
  - `AcknowledgmentAdmin` — required for acknowledgment sequential bypass
  - All authenticated users can submit, list, advance state, retry, escalate

### A3. Environment variables

**Provisioning prerequisites** (validated at saga start by `validateProvisioningPrerequisites()`):
- [ ] `AZURE_TENANT_ID` — Entra ID tenant identifier (required for group-to-site permission assignment)
- [ ] `SHAREPOINT_TENANT_URL` — root SharePoint tenant URL
- [ ] `SHAREPOINT_APP_CATALOG_URL` — tenant app catalog URL for Step 5 SPFx installation
- [ ] `HB_INTEL_SPFX_APP_ID` — SPFx app package GUID for Step 5
- [ ] `SHAREPOINT_HUB_SITE_ID` — hub site GUID for Step 7 association
- [ ] `OPEX_MANAGER_UPN` — OpEx manager UPN for Step 6 Leaders group membership
- [ ] `GRAPH_GROUP_PERMISSION_CONFIRMED=true` — only if IT has actually granted the required permission

**Platform infrastructure** (validated at startup by `validateRequiredConfig()`):
- [ ] `AZURE_CLIENT_ID` — app registration client ID for backend identity
- [ ] `AZURE_CLIENT_SECRET` — app registration client secret (Key Vault in prod)
- [ ] `AZURE_TABLE_ENDPOINT` — Table Storage endpoint URL
- [ ] `AzureSignalRConnectionString` — SignalR Service connection string
- [ ] `APPLICATIONINSIGHTS_CONNECTION_STRING` — Application Insights telemetry
- [ ] `HBC_ADAPTER_MODE` — must be `proxy` for staging/production
- [ ] `EMAIL_DELIVERY_API_KEY` — SendGrid API key for transactional email
- [ ] `EMAIL_FROM_ADDRESS` — verified sender address
- [ ] `NOTIFICATION_API_BASE_URL` — notification dispatch endpoint

**Business-operational** (validated at startup):
- [ ] `CONTROLLER_UPNS` — comma-separated controller UPNs for oversight notifications
- [ ] `ADMIN_UPNS` — comma-separated admin UPNs for escalation notifications
- [ ] `DEPT_BACKGROUND_ACCESS_COMMERCIAL` — viewer UPNs for Commercial department sites (conditional)
- [ ] `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` — viewer UPNs for Luxury Residential sites (conditional)

**Optional with defaults** (not blocking):
- [ ] `PROVISIONING_STEP5_TIMEOUT_MS` — Step 5 timeout override (default: 90000ms)

See `backend/functions/src/config/wave0-env-registry.ts` for the authoritative registry.

### A4. Tenant / Graph prerequisites
- [ ] `Group.ReadWrite.All` granted to Managed Identity — gates `createSecurityGroup()`, `addGroupMembers()`, `getGroupByDisplayName()` (enforced by `assertPermissionConfirmed()` in `graph-service.ts`)
- [ ] `GRAPH_GROUP_PERMISSION_CONFIRMED=true` set only after IT confirms the grant (see IT-Department-Setup-Guide.md §8.4)
- [ ] SharePoint app catalog access working — `SHAREPOINT_APP_CATALOG_URL` resolves and tenant app is published
- [ ] Hub site exists and `SHAREPOINT_HUB_SITE_ID` is correct — Step 7 `associateHubSite()` depends on this
- [ ] Managed Identity / `DefaultAzureCredential` works for Graph, SharePoint (PnPjs), and Table Storage
- [ ] `Sites.Selected` per-site grants configured if using Path A permission model

---

## B. Request lifecycle validation

### B1. Request submission
- [ ] Submit a new request from Estimating SPFx
- [ ] Submit a new request from PWA
- [ ] Confirm request is created successfully
- [ ] Confirm request appears in requester-visible lists only where appropriate
- [ ] Confirm request appears in Accounting review queue

### B2. Clarification flow
- [ ] Reviewer can request clarification
- [ ] Request transitions to `NeedsClarification`
- [ ] Requester sees clarification state and message
- [ ] Clarification-return flow still works after the latest changes

### B3. Hold / external setup flow
- [ ] Reviewer can place request into `AwaitingExternalSetup`
- [ ] Requester sees correct status/context
- [ ] Review queue tab/filter behavior remains correct

---

## C. Approval to provisioning handoff

### C1. Approval gate
- [ ] Reviewer must enter a valid project number
- [ ] Invalid project number is rejected
- [ ] Valid project number is accepted

### C2. Automatic handoff
- [ ] Approval automatically launches provisioning
- [ ] No manual second trigger is required
- [ ] Request transitions into `Provisioning`
- [ ] Provisioning status record is created
- [ ] Correlation between request and provisioning status is preserved

---

## D. SharePoint provisioning artifact validation

### D1. Site creation
- [ ] SharePoint site is created successfully
- [ ] Site URL follows expected pattern
- [ ] Site readiness poll completes successfully

### D2. Core libraries
- [ ] `Project Documents`
- [ ] `Drawings`
- [ ] `Specifications`

### D3. Department-specific artifacts
- [ ] Correct department library is created
- [ ] Correct folder tree is created
- [ ] Wrong department library is not created unintentionally

### D4. Template files
- [ ] Core template files upload correctly
- [ ] Estimating/startup template files upload correctly
- [ ] Financial-family template files upload correctly
- [ ] Missing-asset metadata behaves correctly if an asset is absent

### D5. Workflow lists
- [ ] Core lists are created
- [ ] Financial-family lists are created
- [ ] Parent/child ordering is correct
- [ ] Default `pid` / project number substitution is correct

---

## E. Step 5 / SPFx install validation

### E1. Direct completion path
- [ ] SPFx installation completes during normal saga execution when possible

### E2. Deferred path
- [ ] If Step 5 defers, status becomes `WebPartsPending`
- [ ] Timer job later retries deferred Step 5
- [ ] Successful timer completion reconciles status correctly
- [ ] Request lifecycle record reflects final outcome correctly after timer completion

---

## F. Step 6 permissions validation

### F1. Entra groups
- [ ] Leaders group created or found idempotently
- [ ] Team group created or found idempotently
- [ ] Viewers group created or found idempotently

### F2. Membership
- [ ] Leaders membership is correct
- [ ] Team membership is correct
- [ ] Viewers membership is correct
- [ ] OpEx manager inclusion is correct

### F3. SharePoint permission assignment
- [ ] Leaders mapped to intended permission level
- [ ] Team mapped to intended permission level
- [ ] Viewers mapped to intended permission level
- [ ] Retry does not duplicate/corrupt permission state

---

## G. Request reconciliation validation

### G1. Start-state reconciliation
- [ ] Request record updates when provisioning begins

### G2. Success reconciliation
- [ ] Request record updates to `Completed`
- [ ] `siteUrl` is written back where intended
- [ ] Relevant timestamps are populated

### G3. Failure reconciliation
- [ ] Request record updates to `Failed`
- [ ] Failure is visible in requester/reviewer/admin surfaces
- [ ] Retry/escalation path remains coherent

---

## H. Surface validation

### H1. Estimating SPFx
- [ ] Submit flow works
- [ ] Detail page loads correct request/provisioning data
- [ ] Progress/failure/completion views are coherent

### H2. PWA
- [ ] My Requests shows requester-scoped data correctly
- [ ] Request detail shows correct lifecycle state
- [ ] Progress view is coherent and useful
- [ ] Completion handoff is visible

### H3. Accounting
- [ ] Queue loads correctly
- [ ] Detail actions work correctly
- [ ] Post-approval behavior is coherent
- [ ] Clarification / hold / failed routing remain intact

### H4. Admin
- [ ] Every exposed admin action maps to a real backend behavior
- [ ] Failed-runs / oversight visibility is accurate
- [ ] Retry / escalate / archive / force-state actions behave as intended, if supported in staging

---

## I. Live-state / SignalR validation

### I1. Real-time behavior
- [ ] SignalR negotiate succeeds
- [ ] Progress events arrive during provisioning
- [ ] Admin sees intended broader visibility where appropriate

### I2. Reconnect / fallback
- [ ] Reconnect behavior works
- [ ] Poll fallback works when real-time connection is lost
- [ ] Durable status refresh reconciles with event-driven updates

---

## J. Evidence capture

For each successful staging run, capture:
- [ ] request ID
- [ ] project ID
- [ ] project number
- [ ] correlation ID
- [ ] site URL
- [ ] screenshots of key surface states
- [ ] proof of created SharePoint artifacts
- [ ] proof of group creation / permission assignment
- [ ] test/build version or deployment reference
- [ ] notes on any anomalies

---

## K. Exit criteria

Declare the workflow **staging-validated** only when:

- [ ] request submission works
- [ ] Accounting approval launches provisioning automatically
- [ ] site/libraries/lists/templates are provisioned correctly
- [ ] Step 5 completion and deferred timer path are validated
- [ ] Step 6 permissions are validated in real staging conditions
- [ ] requester/reviewer/admin surfaces all reconcile correctly
- [ ] evidence is captured for the end-to-end path

If any of the above fail, classify the blocker as one of:
- [ ] code defect
- [ ] deployment/config defect
- [ ] tenant/permission defect
- [ ] intentionally deferred scope
