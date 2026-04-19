# Provision Legacy Fallback Hosting

This runbook provisions Azure hosting for the Project Sites legacy fallback backend lane.

**Hosting model:** Azure Functions **Flex Consumption** (plan SKU `FC1`, tier `FlexConsumption`, Linux, Node 22). This is the only supported hosting model for this lane. Dedicated App Service plans and legacy Consumption plans are out of scope.

Scope for this phase:
- staging deployment only,
- production parameter parity prepared but not deployed,
- app-only pilot identity posture using `HB SharePoint Creator` (`08c399eb-a394-4087-b859-659d493f8dc7`).

This is an interim pilot posture and not the final production rights model.

## Prerequisites

- Azure CLI authenticated to the target tenant/subscription.
- Resource group exists for staging.
- Permissions to deploy `Microsoft.Web`, `Microsoft.Storage`, `Microsoft.Insights`, `Microsoft.ManagedIdentity`, and role assignments.
- No secrets stored in source control; secrets remain in environment or Key Vault.

## Files

- Template: `infra/legacy-fallback-hosting.bicep`
- Staging params: `infra/legacy-fallback-hosting.staging.bicepparam`
- Prod params (parity only): `infra/legacy-fallback-hosting.prod.bicepparam`
- Deployment script: `scripts/provision-legacy-fallback-hosting.ts`

## Staging deployment workflow

1. Validate Bicep and run staging what-if:

```bash
AZURE_RESOURCE_GROUP="<staging-rg>" pnpm exec tsx scripts/provision-legacy-fallback-hosting.ts --environment staging
```

2. Apply staging deployment and run smoke checks:

```bash
AZURE_RESOURCE_GROUP="<staging-rg>" pnpm exec tsx scripts/provision-legacy-fallback-hosting.ts --environment staging --apply
```

The script performs:
- Bicep compile validation,
- `az deployment group what-if`,
- `az deployment group create` (when `--apply` is provided),
- smoke checks for Function App presence and required app settings.

### Region override (if environment constraints block apply)

If staging fails due to Flex Consumption region feature availability, rerun with an explicit region override:

```bash
AZURE_RESOURCE_GROUP="<staging-rg>" pnpm exec tsx scripts/provision-legacy-fallback-hosting.ts \
  --environment staging \
  --location "<flex-supported-region>" \
  --apply
```

`--hosting-plan-sku-name` / `--hosting-plan-sku-tier` overrides exist only for staying inside the Flex family (for example, a future Flex SKU). Do not use them to fall back to Dedicated or legacy Consumption SKUs.

## Post-deploy validation checklist

- Function App exists and is running.
- Required settings exist:
  - `HBC_LEGACY_FALLBACK_ENABLED`
  - `HBC_LEGACY_FALLBACK_DISCOVERY_ENABLED`
  - `HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED`
  - `HBC_LEGACY_FALLBACK_HOSTING_ENV`
  - `HBC_LEGACY_FALLBACK_AUTH_POSTURE` = `pilot-interim`
  - `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID` = `08c399eb-a394-4087-b859-659d493f8dc7`
  - `HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_SCHEDULE`
  - `HBC_LEGACY_FALLBACK_MANUAL_RERUN_ENABLED`
  - `HBC_LEGACY_FALLBACK_RERUN_MIN_INTERVAL_MINUTES`
  - `HBC_LEGACY_FALLBACK_MATCH_ANOMALY_THRESHOLD`
  - `AZURE_TENANT_ID`
  - `AZURE_CLIENT_ID`
  - `SHAREPOINT_TENANT_URL`
- Application Insights connected and receiving startup logs.

Key Vault and secret handling:
- If `keyVaultName` is provided to the template, the user-assigned identity gets `Key Vault Secrets User` role.
- Store sensitive runtime values in Key Vault and reference them through Function App app settings.
- If a setting is changed directly in portal for incident response, reconcile it back into IaC/scripted deployment on the next cycle.

## Rollback / retry

- Retry safe operations by rerunning the same command (`what-if`, then `--apply`).
- To remove resources from the staging rollout, delete the staging resource group resources associated with:
  - `func-hbintel-legacy-fallback-staging`,
  - `asp-hbintel-legacy-fallback-staging`,
  - `hblegacyfbstaging`,
  - `appi-hbintel-legacy-fallback-staging`,
  - `id-hbintel-legacy-fallback-staging`.

Use `what-if` before any rollback/redeploy step to avoid accidental drift.
