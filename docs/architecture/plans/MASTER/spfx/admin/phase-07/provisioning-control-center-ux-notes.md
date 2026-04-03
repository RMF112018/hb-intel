# Provisioning Control-Center UX Notes

## Purpose

Documents the P7-09 route and UX corrections applied to the admin SPFx operator console for Phase 7 provisioning hardening.

## Changes made

### Lane registry correction

The canonical lane registry (`apps/admin/src/router/lane-registry.ts`) incorrectly classified the Setup lane as `'scaffold'` with `deliversIn: 'Phase 6'`. The Setup lane has been active since Phase 6 delivered `SetupWizardPage` with real preflight review, install launch, and run tracking content.

**Before**: `status: 'scaffold'`, `deliversIn: 'Phase 6'`, `scaffoldMessage: 'Backend install and bootstrap will be available here.'`
**After**: `status: 'active'` (scaffold fields removed)

**Impact**: Navigation UI now renders Setup at full opacity instead of dimmed. The lane is no longer incorrectly flagged as unfinished.

### Dead code removal

`apps/admin/src/pages/SetupLanePage.tsx` was deleted. This file was:
- Never imported by `routes.ts`
- Superseded by `SetupWizardPage.tsx` (which contains a comment: "This page replaces the SetupLanePage scaffold")
- A scaffold placeholder that directed users to the Health lane

### README correction

`apps/admin/README.md` was updated to accurately reflect that 5 lanes have active content (Setup, Runs, Config, Health, and the landing page), not 3 as previously stated. The lanes table was already correct and required no changes.

## Current lane status

| Lane | Route | Status | Phase |
|------|-------|--------|-------|
| Setup / Install | `/setup` | **Active** | Phase 6 |
| Validation | `/validation` | Scaffold | Phase 7 (future) |
| Runs / History | `/runs` | **Active** | Phase 5 |
| SharePoint Control | `/sharepoint` | Scaffold | Phase 8 (future) |
| Entra Control | `/entra` | Scaffold | Phase 9 (future) |
| Standards / Config | `/config` | **Active** | Phase 5 |
| Health / Alerts | `/health` | **Active** | Phase 5 |
| Error / Audit | `/errors` | Deferred | SF17-T05 |

## Route structure

All routes are intentionally wired. No route indirection exists — each route maps directly to its page component:
- `/provisioning-failures` → redirects to `/runs` with `?projectId=` preserved (legacy cross-app deep links)
- `/dashboards` → redirects to `/health` (legacy bookmarks)
- `/error-log` → redirects to `/errors` (legacy bookmarks)

## Provisioning operator experience

The provisioning control-center lane (`/runs`) served by `ProvisioningOversightPage` provides:
- Tabbed run listing (Active, Failures, Completed, All)
- Permission-gated actions: Force Retry, Archive, Acknowledge Escalation, Manual State Override
- Complexity-tiered detail modal (Essential, Standard, Expert)
- Backend-assigned failure classification display
- Embedded runbook links for operator guidance
- Deep-link support via `?projectId=` query parameter

Phase 7 backend enhancements (P7-03 through P7-08) provide richer data through the same page:
- `failureClass` is now populated on every failure (P7-04)
- Structured evidence payload available on status records (P7-06)
- Recovery guidance available via `getRecoveryGuidance()` client method (P7-05/P7-08)

## Design decisions

- **SPFx remains the operator console**: no privileged execution logic was moved into the frontend
- **Scaffold lanes are preserved**: Validation, SharePoint, and Entra lanes remain as honest scaffolds with clear messaging about which phase delivers their content
- **Legacy redirects are preserved**: cross-app deep links from Accounting and Estimating continue to work
