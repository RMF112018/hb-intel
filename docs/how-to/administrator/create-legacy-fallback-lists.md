# Create Legacy Fallback Bridge Lists

## Purpose

Provision or alter the Prompt 02 bridge lists at HBCentral so legacy fallback discovery/matching has authoritative storage before sync execution.

Target site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

Required lists:
1. `Legacy Project Fallback Registry`
2. `Legacy Project Fallback Sync Runs`

## Entry point

From repo root:

```bash
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts
```

Optional:

```bash
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts --allow-type-drift
```

Use `--allow-type-drift` only when an existing column has an incompatible SharePoint type that cannot be safely auto-converted and manual remediation is intentionally deferred.

## What the script does

- Uses app-only auth via `DefaultAzureCredential`.
- Enforces host-site lock to HBCentral.
- Detects existing equivalent lists by normalized title.
- Creates missing lists.
- Creates missing fields.
- Alters compatible existing fields (`Required`, `Indexed`, default value, choice set).
- Validates post-provisioning schema against governed descriptors.
- Emits a JSON report with:
  - host site
  - per-list create/alter result
  - field-level mutations
  - unresolved mutations requiring manual follow-up

## Governed field set

The authoritative descriptors are defined in:
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`

Those descriptors are the source of truth for:
- list titles
- field names
- field types
- index flags

## Auth and secrets posture

- Interim pilot identity is `HB SharePoint Creator` (`08c399eb-a394-4087-b859-659d493f8dc7`).
- Posture is app-only backend execution.
- No secrets are stored in source control.
- Credential and secret handling remains environment/Key Vault managed.
