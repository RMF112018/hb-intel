# Create Legacy Fallback Bridge Lists

## Purpose

Provision or alter the legacy fallback bridge lists at HBCentral:

1. `Legacy Project Fallback Registry`
2. `Legacy Project Fallback Sync Runs`

Target site:
- `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Scope note

This runbook governs legacy fallback bridge-list provisioning.

For My Projects source-list schema provisioning + backfill sequence, use:
- `docs/how-to/administrator/provision-my-projects-source-list-schema.md`

## Entry point

From repo root:

```bash
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts
```

Optional unresolved-drift override:

```bash
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts --allow-type-drift
```

Use `--allow-type-drift` only when manual remediation is intentionally deferred.

## What the script does

- App-only auth via `DefaultAzureCredential`.
- HBCentral host-site lock.
- Equivalent-list detection by normalized title.
- Missing-list creation.
- Missing-field creation.
- Compatible field-setting updates.
- JSON report output with unresolved mutations.

## Identity and secrets posture

- Current pilot app identity: `HB SharePoint Creator` (`08c399eb-a394-4087-b859-659d493f8dc7`).
- Runtime provisioning identity and app registration consent context must be validated separately.
- No tokens or secrets are stored in source control.
