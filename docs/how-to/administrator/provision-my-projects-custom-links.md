# Provision My Projects Custom Links

## Purpose

Operator-safe runbook to provision the `My Projects Custom Links` SharePoint list on HBCentral and verify its column schema. Backs the user-authored "More Project Resources" registry surfaced under My Dashboard → My Projects.

This runbook is scoped to:

- `My Projects Custom Links`

It creates the list if missing, ensures every column in `MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR` exists with the canonical type, and fails closed on wrong-type drift. It does not mutate item data and does not touch the `Projects` or `Legacy Project Fallback Registry` source lists.

### Schema in scope

The descriptor adds **14 custom columns** plus the SharePoint built-in `Title` (used as the custom-link display title — no separate `LinkTitle` column is created):

| Internal Name          | Type     | Indexed | Notes                                                            |
| ---------------------- | -------- | :-----: | ---------------------------------------------------------------- |
| `ProjectNumber`        | Text     |    ✓    | Join key                                                         |
| `ProjectYear`          | Number   |    ✓    |                                                                  |
| `ProjectsListItemId`   | Number   |    ✓    | One-of with `LegacyRegistryItemId` (write-time, server-enforced) |
| `LegacyRegistryItemId` | Number   |    ✓    | One-of with `ProjectsListItemId` (write-time, server-enforced)   |
| `LinkUrl`              | Text     |    —    | URL stored as Text per contract                                  |
| `Visibility`           | Choice   |    ✓    | `['private', 'project']`                                         |
| `CreatedByUpn`         | Text     |    ✓    |                                                                  |
| `CreatedByOid`         | Text     |    —    |                                                                  |
| `CreatedAtUtc`         | DateTime |    —    |                                                                  |
| `UpdatedAtUtc`         | DateTime |    —    |                                                                  |
| `DeletedAtUtc`         | DateTime |    —    | Soft-delete                                                      |
| `DeletedByUpn`         | Text     |    —    | Soft-delete                                                      |
| `DeletedByOid`         | Text     |    —    | Soft-delete                                                      |
| `IsActive`             | Boolean  |    ✓    | `defaultValue: '1'`; soft-delete sets `false`                    |

See `docs/reference/sharepoint/list-schemas/hbcentral/lists/my-projects-custom-links.md` for the canonical field reference.

## Identity Lane Prerequisite

1. **Runtime lane (script execution)**: Function App UAMI app-only token lane. In production, `AZURE_CLIENT_ID` must be set to the user-assigned MI client id so `DefaultAzureCredential` selects the correct identity.
2. **Operator/deployment lane**: `HB SharePoint Creator` app registration (operator-token context). Local operator runs may use `SHAREPOINT_BEARER_TOKEN` to bypass `DefaultAzureCredential`.

Do not treat these as the same thing. SPFx `requiredResourceAccess` and package permission declarations do not, by themselves, prove effective app-only grants for runtime list creation or schema mutation.

## No-Secrets Warning

- Never commit tokens, bearer strings, client secrets, or tenant app-setting dumps.
- Do not paste raw auth payloads into docs, PRs, or logs.
- Use redacted evidence only.

## Deterministic Command Sequence

Run from repo root. **Live tenant apply requires explicit operator authorization.** Always run the dry-run first.

### 1. Read-only readiness verification

```bash
pnpm tsx scripts/verify-my-projects-custom-links.ts --json
```

Exit 0 ⇒ schema is live-verified. Exit 1 ⇒ at least one field is `missing` or `wrong-type`.

### 2. Provisioner dry-run (required)

```bash
pnpm tsx scripts/provision-my-projects-custom-links.ts --json
```

Optional explicit site:

```bash
pnpm tsx scripts/provision-my-projects-custom-links.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral --json
```

The dry-run never creates the list and never mutates fields. Inspect:

- `targets[0].listFound`
- `targets[0].plannedCreates`
- `targets[0].plannedUpdates`
- `targets[0].blockers[]`

### 3. Provisioner apply (only if dry-run has no blocking drift)

```bash
pnpm tsx scripts/provision-my-projects-custom-links.ts --apply --json
```

On apply, the script:

- Creates the list when missing (`createdList: true` in the report).
- Calls `createSharePointField` for each missing column via PnPjs (supports `Text`, `Number`, `Boolean`, `DateTime`, `Choice`, etc.).
- Applies non-destructive `Required` / `Indexed` / `Choices` / `DefaultValue` updates where descriptor drift is benign.

### 4. Wrong-type drift override (rare)

If wrong-type drift is reported and remediation is intentionally deferred, override with:

```bash
pnpm tsx scripts/provision-my-projects-custom-links.ts --apply --allow-type-drift --json
```

Apply proceeds with the remaining `create` / `update-settings` actions, but the affected columns are NOT auto-converted. Wrong-type columns must be resolved manually in SharePoint admin (the script does not delete or recreate columns).

### 5. Post-apply verification

```bash
pnpm tsx scripts/verify-my-projects-custom-links.ts --json
```

Re-run readiness to confirm `ready: true`.

## Blocking Rules

- If readiness verification reports missing/wrong-type fields, do not chain downstream backend work that assumes the schema.
- If provisioner dry-run reports blocking wrong-type drift, do not run provisioner apply without `--allow-type-drift` and operator authorization.
- If the list is missing AND `--apply` is not supplied, the script intentionally fails (exit 1) — that is correct dry-run behavior, not an error to retry past.

## Rollback Posture

- The provisioner never deletes columns and never modifies item data.
- A wrong-type column must be resolved in SharePoint admin (rename / hide / recreate manually).
- Soft-delete in the application layer sets `IsActive=false`, `DeletedAtUtc`, `DeletedByUpn`, `DeletedByOid`. It does not remove the SharePoint item; SharePoint recycle bin is unaffected by this script.

## Related Docs

- Schema reference: `docs/reference/sharepoint/list-schemas/hbcentral/lists/my-projects-custom-links.md`
- Package source of truth: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.12 - m-p-add-links/02_SharePoint_Custom_Links_List_Schema.md`
- Legacy fallback list runbook (sister pattern): `docs/how-to/administrator/create-legacy-fallback-lists.md`
- My Projects source-list runbook (sister pattern): `docs/how-to/administrator/provision-my-projects-source-list-schema.md`
