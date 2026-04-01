# Selected-Site Permission Model Operationalization

**Date:** 2026-04-01
**Scope:** Sites.Selected per-site grant model production readiness

## Prior State

The repo had a well-documented two-path permission model (Path A: Sites.Selected, Path B: Sites.FullControl.All) with:
- `IGraphService.grantSiteAccess()` implemented but not wired into the provisioning saga
- `diagnose-permissions.ts` as a scaffold ("NOT wired into runtime")
- `validateProvisioningPrerequisites()` with no site-grant readiness checks
- Saga orchestrator with no permission-model awareness or telemetry
- IT-Department-Setup-Guide.md stating "Architecture decision still pending"
- No operational gate confirming the manual grant workflow was active

## Production Gap

The repo implied a least-privilege posture (Sites.Selected default) but did not operationalize it:
1. No validation that the per-site grant workflow was confirmed by IT
2. No telemetry distinguishing site-grant issues from other failures
3. No operator signal when a new site was created and needed a grant
4. Documentation said the architecture decision was pending when it had effectively been made

## Final Selected-Site Operational Model

**Confirmed posture:** Option A2 (manual pilot bridge) for Wave 0 pilot (≤3 projects).

| Aspect | Decision |
|--------|----------|
| **Permission model** | Sites.Selected (Path A) — default, least-privilege |
| **Per-site grant method** | Manual via `tools/grant-site-access.sh` (Option A2) |
| **Operational gate** | `SITES_SELECTED_GRANT_CONFIRMED=true` — IT confirms the manual workflow is operational |
| **Automation (Option A1)** | Deferred to future G2/G6/G8 scope |
| **Fallback (Path B)** | Sites.FullControl.All — governed exception, requires ADR |
| **Saga behavior** | Emits `ProvisioningPermissionModel` at start, `SiteCreated.GrantRequired` after Step 1 |
| **Prerequisite validation** | `validateProvisioningPrerequisites()` fails fast when Sites.Selected active without grant confirmation |

## Impacted Code Paths

| File | Change |
|------|--------|
| `backend/functions/src/utils/diagnose-permissions.ts` | Upgraded from scaffold to production; added `diagnoseSiteGrantReadiness()` |
| `backend/functions/src/utils/validate-config.ts` | Added conditional site-grant prerequisite for Sites.Selected model |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Permission-model telemetry at saga start; `SiteCreated.GrantRequired` after Step 1 |
| `backend/functions/src/config/wave0-env-registry.ts` | Registered `SITES_SELECTED_GRANT_CONFIRMED` |
| `backend/functions/local.settings.example.json` | Added `SITES_SELECTED_GRANT_CONFIRMED` |

## What Is Now Automated

- Permission model diagnostic at every saga run (Application Insights telemetry)
- Fail-fast prerequisite validation when Sites.Selected is active without grant confirmation
- `SiteCreated.GrantRequired` telemetry event after each site creation under Sites.Selected

## What Still Requires Manual Tenant-Admin Action

1. **Initial per-site grants:** Hub site, Sales/BD site, shared/department sites — must be granted via `tools/grant-site-access.sh` or Graph API POST during setup
2. **Ongoing per-site grants:** Each new project site created by the saga must be granted access by an IT admin after Step 1
3. **Operational gate confirmation:** IT must set `SITES_SELECTED_GRANT_CONFIRMED=true` in Function App config after confirming the grant workflow is operational
4. **Path B activation:** If Sites.Selected cannot be used, IT must create an ADR, set `SITES_PERMISSION_MODEL=fullcontrol`, and document the expiry commitment

## Remaining Limitations

- Option A1 (automated per-site grants via bootstrap identity) is not implemented — manual grants required for every new project site
- The `SiteCreated.GrantRequired` telemetry event is informational — it does not block the saga or enforce that the grant was actually performed
- Scale threshold: when the 4th project is provisioned, Option A1 must be reassessed per sites-selected-validation.md §3
