# Admin SPFx IT Control Center — Setup Wizard UX

**Prompt:** P6-08 — SPFx Setup Wizard and Preflight UX
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the setup/install page structure, preflight presentation model, and frontend/backend boundary.

---

## 1. Route and page structure

| Route | Page component | Purpose |
|-------|---------------|---------|
| `/setup` | `SetupWizardPage` | Preflight review and install launch (replaces `SetupLanePage` scaffold) |
| `/runs` | `ProvisioningOversightPage` | Run status/history (install runs appear here via existing run list) |
| `/health` | `OperationalDashboardPage` | Post-install verification results (via health probes) |

The setup wizard is a single page with a progressive flow:
1. **Run Preflight** — operator clicks to validate environment readiness
2. **Review Results** — categorized findings with pass/fail/warning badges
3. **Launch Install** — gated button enabled only when all blocking checks pass
4. **Track Progress** — after launch, operator is directed to the Runs lane

---

## 2. Setup flow

```
[Run Preflight] → [Review Findings] → [Launch Install] → [Track on Runs Lane]
      ↑                                                          |
      └──── Re-run after fixing issues ─────────────────────────┘
```

### Step 1: Run Preflight
- Calls `POST /api/admin/preflight` with `actionKey: 'setup-install:bootstrap:full-install'`
- Shows loading state during execution
- Disabled when no backend URL is configured

### Step 2: Review Findings
- Groups checks by category (Backend Config, Auth & Identity, SharePoint, Graph & Entra, Persistence, Install Compatibility)
- Each check shows: status badge (Pass/Fail/Warning), label, detail message
- Failed checks show recommended operator action
- Checks with `resolvableByCheckpoint: true` note that the install may resolve them via manual checkpoint

### Step 3: Launch Install
- Button enabled only when `response.ready === true` (all blocking checks pass)
- Calls `POST /api/admin/runs` with the install action key
- After successful launch, displays the run ID and directs to Runs lane

---

## 3. Preflight presentation model

### Summary bar
- **Ready to Install** (green) or **Not Ready** (red)
- Count: "N of M checks passed — X blocking — Y warnings"

### Category groups
Checks are grouped by `PreflightCategory` with human-readable headers:

| Category code | Display label |
|--------------|--------------|
| `backend-config` | Backend Configuration |
| `auth-identity` | Authentication & Identity |
| `sharepoint` | SharePoint |
| `graph-entra` | Graph & Entra |
| `persistence` | Persistence |
| `install-compatibility` | Install Compatibility |

### Check detail
Each check renders:
- `HbcStatusBadge` — variant based on pass/fail/blocking
- `label` — check name
- `message` — detail text
- `recommendedAction` — shown only on failure, with actionable guidance
- `resolvableByCheckpoint` indicator — notes that install checkpoint may resolve

---

## 4. What the frontend owns vs does not own

### Frontend owns
- Calling the preflight and launch APIs
- Rendering structured results from the backend
- Gating the install button on preflight readiness
- Providing operator-facing copy and navigation

### Frontend does NOT own
- Preflight validation logic (backend `AdminPreflightService`)
- Install execution (backend `executeInstallRun()`)
- Run state persistence (backend `DurableAdminRunStore`)
- Checkpoint handling (backend `processCheckpointDecision()`)
- Evidence capture (backend audit + evidence services)
- Environment configuration checks (backend reads `process.env`)

---

## 5. Checkpoint visibility

The page includes a static "About checkpoints" section explaining:
- The install has 2 manual checkpoint steps (API permissions, SharePoint API access)
- These steps pause the install and provide instructions
- All other steps are fully automated
- Checkpoint details are displayed on the Runs lane when the install pauses

---

## Implementation location

| File | Purpose |
|------|---------|
| `apps/admin/src/pages/SetupWizardPage.tsx` | Setup wizard with preflight review and install launch |
| `apps/admin/src/router/routes.ts` | `/setup` route now points to `SetupWizardPage` |

---

## Cross-references

- [Preflight Validator](admin-spfx-preflight-validator.md) — backend validation engine
- [Install Orchestrator](admin-spfx-install-orchestrator.md) — backend execution
- [Checkpoint Lifecycle](admin-spfx-install-checkpoint-lifecycle.md) — checkpoint handling
- [Install Contract Slice](admin-spfx-install-contract-slice.md) — shared types
