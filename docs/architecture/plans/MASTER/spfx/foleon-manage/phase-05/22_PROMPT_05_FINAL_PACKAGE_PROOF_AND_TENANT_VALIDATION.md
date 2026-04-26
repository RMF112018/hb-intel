# Prompt 05 — Final Package Proof and Tenant Validation

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Close the registry-first Foleon Manager implementation with package proof, tenant proof, hosted validation, rollback documentation, and a final closure report.

## Required Preconditions

Confirm all prior waves are complete or document blockers:

```text
Wave 00 — registry provisioned and validated
Wave 01 — registry reader/runtime bridge complete
Wave 02 — Manager load/write-readiness fixed
Wave 03 — two-tab Manager UI complete
Wave 04 — content workflow/validation complete
```

## Required Proof

### Registry Proof

Capture registry list URL, registry list GUID, field count, index count, seed record count, duplicate active key check, secret hygiene check, Foleon config values resolved, and blocked/missing records remaining.

### Package Proof

If SPFx source changed, capture version bump, manifest version, runtime contract version, sppkg generated from current repo truth, bundle contains expected updated strings, and package proof output.

### Hosted Runtime Proof

From hosted tenant pages, capture Foleon Manager page load, Config tab registry source, API/token readiness, backend safe config, content read/write, unauthorized denial, all three homepage lane states, runtime binding proof, and registry resolution proof.

## Validation Commands

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

Run registry validation:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -EnvironmentKey "Production"
```

## Required Documentation Updates

Update or create:

```text
docs/architecture/plans/MASTER/platform/config-registry/proof/*.md
docs/architecture/plans/MASTER/spfx/foleon-manager/** closure report
docs/how-to/** tenant validation or admin runbook if repo convention supports it
```

## Rollback Requirements

Document how to deactivate registry records, restore page-level override fields, redeploy prior package, identify registry vs package vs backend failure, and what not to delete during rollback.

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
Package Version:
Registry Proof:
Hosted Proof:
Commands Run:
Validation Results:
Known Unrelated Failures:
Rollback Notes:
Open Manual Actions:
Commit Message:
```
