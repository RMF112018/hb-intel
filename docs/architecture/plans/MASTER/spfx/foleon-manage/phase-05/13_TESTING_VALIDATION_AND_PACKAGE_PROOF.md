# 13 — Testing, Validation, and Package Proof

## Registry Validation Comes First

Before any Foleon Manager UI/runtime remediation is accepted, the registry provisioning and validation pass must complete or produce an explicit blocker.

## Registry Validation Commands

```powershell
pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production" `
  -DryRun
```

```powershell
pwsh tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production" `
  -Seed
```

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production"
```

## Foleon Validation Commands

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

Use Node 18 where SPFx tooling requires it.

## Hosted Proof Requirements

Hosted proof must capture:

```text
registry list reachable
registry values resolved
config source by key: override | registry | default | missing
runtime binding proof
Manager write-readiness state
SPFx token-provider state
backend safe-config state
Foleon list GUID validation state
package version / manifest match state
```

## Acceptance Criteria

- Registry validation passes before Foleon remediation is marked complete.
- Manager no longer requires hidden page-local values when registry values are valid.
- Missing registry values still produce safe blocked states.
- Tests cover registry precedence and current property-pane fallback.
- Final proof includes hosted tenant evidence.
