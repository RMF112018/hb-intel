# Provisioning Prelaunch Validation Model

## Purpose

Documents the typed validation model introduced by P7-03 for provisioning prelaunch dependency checking. This model replaces the opaque throw-string approach with structured, operator-meaningful validation results.

## Validation categories

| Category | Scope | Example failures |
|----------|-------|-----------------|
| `environment` | Missing or invalid environment variables required for saga execution | SHAREPOINT_TENANT_URL not set, HB_INTEL_SPFX_APP_ID not set |
| `permission` | Permission flags or grants that must be confirmed before provisioning | Graph Group.ReadWrite.All not confirmed, Sites.Selected grant not confirmed |
| `request-data` | Incomplete or malformed request fields required by the saga | Missing projectId, empty groupMembers, invalid projectNumber format |
| `configuration` | Reserved for future runtime configuration checks | Endpoint health-check failures (future Phase 7 enhancement) |

## When launch is blocked

Provisioning is blocked when `validatePrelaunchReadiness()` returns `ok: false`. This happens when **any** of the following conditions exist:

### Environment gates (checked in non-mock/non-test mode)

- `GRAPH_GROUP_PERMISSION_CONFIRMED` is not `"true"`
- `AZURE_TENANT_ID` is not set
- `SHAREPOINT_TENANT_URL` is not set
- `SHAREPOINT_HUB_SITE_ID` is not set
- `SHAREPOINT_APP_CATALOG_URL` is not set
- `HB_INTEL_SPFX_APP_ID` is not set
- `OPEX_MANAGER_UPN` is not set
- `SITES_SELECTED_GRANT_CONFIRMED` is not `"true"` when Sites.Selected permission model is active

### Request data gates (always checked)

- `projectId` is empty or missing
- `projectNumber` is empty or does not match `##-###-##` format
- `projectName` is empty or missing
- `triggeredBy` is empty or missing
- `submittedBy` is empty or missing
- `groupMembers` is empty or missing (at least one UPN required for Step 6)

## What evidence is returned

Each failure is a structured `IPrelaunchFailure` object:

| Field | Type | Purpose |
|-------|------|---------|
| `code` | string | Machine-readable failure code (e.g. `MISSING_ENV_SHAREPOINT_TENANT_URL`) |
| `category` | `PrelaunchFailureCategory` | Grouping for display and triage |
| `message` | string | Human-readable description of the issue |
| `remediation` | string | Operator-facing guidance on how to resolve the issue |

The `IPrelaunchValidationResult` wraps these:

| Field | Type | Purpose |
|-------|------|---------|
| `ok` | boolean | `true` when all checks pass |
| `failures` | `IPrelaunchFailure[]` | Empty when `ok` is true; populated with all detected issues otherwise |

## How operators should interpret failures

### At the API level (HTTP 422)

The `POST /api/provision-project-site` endpoint performs synchronous preflight validation. When prerequisites fail, the response is:

```json
{
  "message": "Provisioning prerequisites not satisfied",
  "code": "PRELAUNCH_VALIDATION_FAILED",
  "requestId": "...",
  "failures": [
    {
      "code": "MISSING_ENV_SHAREPOINT_TENANT_URL",
      "category": "environment",
      "message": "SHAREPOINT_TENANT_URL is not configured.",
      "remediation": "Set SHAREPOINT_TENANT_URL to the root SharePoint tenant URL."
    }
  ]
}
```

Operators should:
1. Read the `failures` array to understand all blocking issues.
2. Resolve each issue per the `remediation` guidance.
3. Re-attempt provisioning after all issues are resolved.

### At the saga level

If prelaunch validation passes at the HTTP layer but a prerequisite becomes invalid between the 202 response and saga execution, the saga throws an aggregated error via `assertPrelaunchReady()`. This is logged as a saga failure with a `ProvisioningPrelaunchValidation` telemetry event.

## Integration points

| Caller | Function | Behavior |
|--------|----------|----------|
| HTTP handler (`index.ts`) | `validatePrelaunchReadiness(request)` | Returns structured result; handler returns 422 on failure |
| Saga orchestrator (`saga-orchestrator.ts`) | `assertPrelaunchReady(request)` | Throws aggregated error on failure; logs telemetry on success |

## Implementation location

- Validation module: `backend/functions/src/functions/provisioningSaga/prelaunch-validation.ts`
- Tests: `backend/functions/src/functions/provisioningSaga/__tests__/prelaunch-validation.test.ts`
