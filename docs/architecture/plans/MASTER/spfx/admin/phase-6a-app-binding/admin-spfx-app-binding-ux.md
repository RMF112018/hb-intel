# Admin SPFx IT Control Center — App-Binding Status and Repair UX

**Prompt:** P6A-08 — Admin UX for App-Binding Status and Repair  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Document the route/page structure, what the UI shows, how repair is initiated, and what remains deferred.

---

## 1. Route and page structure

### Route

| Path | Component | Lane | Permission |
|------|-----------|------|------------|
| `/setup/bindings` | `BindingStatusPage` | Setup (sub-route) | `admin:access-control:view` |

The binding status page is a sub-route under the Setup lane, parallel to `/setup/run/$runId`. It does not add a new top-level lane — binding is a direct output of the install flow and belongs in the Setup workflow.

### Navigation

The page is accessible via direct URL or programmatic navigation. The Setup lane's setup wizard page may link to it after install completion. No lane registry changes are required.

### Page component

`apps/admin/src/pages/BindingStatusPage.tsx` uses `WorkspacePageShell` with `layout="list"` and follows the same patterns as `SetupWizardPage.tsx`:
- `@griffel/react` makeStyles with HBC spacing tokens
- `@hbc/auth` useCurrentSession + createSessionTokenFactory
- Direct fetch to backend API with Bearer token
- useState for local UI state

---

## 2. What the UI shows

### Binding list view

On mount, the page fetches `GET /api/admin/apps/bindings` and displays one card per managed app.

### Per-app binding card

Each card displays:

| Field | Source | Display |
|-------|--------|---------|
| App ID | `binding.appId` | Card heading |
| Status | `binding.status` | HbcStatusBadge with mapped variant |
| Function App URL | `binding.functionAppUrl` | Text, "(empty)" if absent |
| API Audience | `binding.apiAudience` | Text, "(empty)" if absent |
| Backend Mode | `binding.backendMode` | Text |
| Version | `binding.version` | "v{n}" |
| Published | `binding.publishedAt` + `binding.publishedBy.upn` | Timestamp + actor |
| Last Verified | `binding.lastVerifiedAt` + `binding.lastVerificationResult` | Timestamp + outcome |
| Source | `binding.publishSource` | Text (e.g., "install-run:{runId}") |

### Status badge mapping

| AppBindingStatus | HbcStatusBadge variant |
|-----------------|----------------------|
| Active | success |
| Drifted | error |
| Error | error |
| PendingPublication | inProgress |
| Superseded | warning |
| NotConfigured | neutral |

### Verification findings

After a verify action, drift findings are displayed inline on the card:
- Each finding shows severity badge, field name, message, expected vs. observed values
- Severity variants: critical → error, warning → warning, info → neutral

---

## 3. How repair is initiated

### Verify action

1. Operator clicks "Verify" on a binding card
2. Page sends `POST /api/admin/apps/{appId}/binding/verify`
3. Result is displayed inline as findings list
4. Binding list is refreshed to show updated status

### Repair action

1. Operator clicks "Repair" on a binding card
2. An inline repair form appears with:
   - Function App URL (pre-filled with current value)
   - API Audience (pre-filled with current value)
   - Rationale (text field for operator explanation)
3. Operator modifies values and clicks "Submit Repair"
4. Page sends `POST /api/admin/apps/{appId}/binding/repair` with corrected values
5. Binding list is refreshed to show updated binding

### Empty state

When no bindings exist, the page displays an informational card explaining that bindings are published automatically by install/setup runs.

---

## 4. What remains intentionally deferred

| Feature | Deferred to | Reason |
|---------|-------------|--------|
| Binding status in lane navigation badge | Phase 10 | Requires integration with broader config governance dashboard |
| Auto-detection of correct values from Azure | Phase 10+ | Requires infrastructure adapters not yet available |
| Binding history timeline | Phase 10 | Requires historical snapshot storage |
| Bulk verify/repair all apps | Phase 10 | Minimal value with 2 managed apps |
| Real-time binding posture polling | Phase 12 | Observability maturity required |
| Binding status on operator landing page | P6A-09 or later | May be added during final reconciliation |

---

## 5. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-store-and-api.md` | Backend API endpoints consumed by this UX |
| `phase-6a-app-binding/admin-spfx-app-binding-verification-and-drift.md` | Verification service and drift classification |
| `phase-6a-app-binding/admin-spfx-app-binding-repair-and-drift-policy.md` | Repair semantics and policy |
| `phase-06/admin-spfx-setup-wizard-ux.md` | Phase 6 setup UX — page pattern reference |
