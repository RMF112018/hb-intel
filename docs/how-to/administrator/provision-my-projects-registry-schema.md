# Provision My Projects Registry Schema

## Purpose

Operator-safe runbook to provision the `My Projects Registry` SharePoint list on the MyDashboard site and verify its column schema and `EnforceUniqueValues` posture. Backs the My Projects incremental projection subsystem (package `B05.13 - backend`).

This runbook is scoped to:

- `My Projects Registry`

It creates the list when missing, ensures every column in `MY_PROJECTS_REGISTRY_LIST_DESCRIPTOR` exists with the canonical type, sets `EnforceUniqueValues=true` on the indexed `ProjectionKey` column, and fails closed on wrong-type or wrong-unique drift. It does **not** mutate item data, does **not** touch the `Projects` or `Legacy Project Fallback Registry` source lists, and does **not** script the list permission-inheritance break.

## Schema in Scope

The descriptor adds 36 custom columns (plus the SharePoint built-in `Title`, set to equal `ProjectionKey` by the projection writer). 5 columns are indexed; `ProjectionKey` carries `EnforceUniqueValues=true`.

| Concern                          | Field(s)                                     |
| -------------------------------- | -------------------------------------------- |
| Idempotent upsert (unique)       | `ProjectionKey`                              |
| User read filter (indexed)       | `UserUpn`, `IsActive`                        |
| Source-slice recompute (indexed) | `ProjectsListItemId`, `LegacyRegistryItemId` |
| Idempotent upsert (indexed)      | `ProjectionKey` (also indexed)               |

See `docs/reference/sharepoint/list-schemas/mydashboard/lists/my-projects-registry.md` for the full field reference.

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
pnpm tsx scripts/verify-my-projects-registry-schema.ts --json
```

Exit 0 ⇒ schema is live-verified (every field present with canonical `TypeAsString`, and `ProjectionKey` carries `EnforceUniqueValues=true`). Exit 1 ⇒ at least one field is `missing`, `wrong-type`, or `wrong-unique`.

### 2. Provisioner dry-run (required)

```bash
pnpm tsx scripts/provision-my-projects-registry-schema.ts --json
```

Optional explicit site:

```bash
pnpm tsx scripts/provision-my-projects-registry-schema.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

The dry-run never creates the list and never mutates fields. Inspect:

- `targets[0].listFound`
- `targets[0].plannedCreates`
- `targets[0].plannedUpdates`
- `targets[0].plannedUniqueChanges`
- `targets[0].blockers[]`
- `targets[0].uniqueBlockers[]`

### 3. Provisioner apply (only if dry-run has no blocking drift)

```bash
pnpm tsx scripts/provision-my-projects-registry-schema.ts --apply --json
```

On apply, the script:

- Creates the list when missing (`createdList: true` in the report).
- Calls `createSharePointField` for each missing column via PnPjs (supports `Text`, `Number`, `Boolean`, `DateTime`, `Choice`, `MultiLineText` → `Note`).
- Applies non-destructive `Required` / `Indexed` / `Choices` / `DefaultValue` updates where descriptor drift is benign.
- Issues `EnforceUniqueValues=true` on `ProjectionKey` after the field exists.

### 4. Wrong-type or wrong-unique drift override (rare)

If drift is reported and remediation is intentionally deferred, override with:

```bash
pnpm tsx scripts/provision-my-projects-registry-schema.ts --apply --allow-type-drift --json
```

Apply proceeds with the remaining `create` / `update-settings` / `unique-change` actions, but the affected columns are NOT auto-converted. Wrong-type columns must be resolved manually in SharePoint admin (the script does not delete or recreate columns).

### 5. Manual operator step — break list permission inheritance

The provisioner intentionally does **not** script permission-inheritance break or role assignments. After `--apply` succeeds:

1. Open the MyDashboard site in SharePoint admin: `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`.
2. Navigate to **Site contents** → **My Projects Registry** → **Settings** (gear) → **List settings**.
3. Open **Permissions for this list** → **Stop Inheriting Permissions**.
4. Remove general site member/visitor group access.
5. Grant **Full Control** or **Manage Lists** to the MyDashboard site owners / designated admin group.
6. Grant **Read** or **Edit** (per governance) to the operations/support group, if one is designated.
7. Confirm the backend Graph app identity (HB SharePoint Creator) retains app-only site access.

Rationale: this list contains `UserUpn` values, assignment-role projections, and launch metadata. It is internal operational data, not a public project directory. See `09_Security_Permissions_And_Governance.md §2`.

### 6. Post-apply verification

```bash
pnpm tsx scripts/verify-my-projects-registry-schema.ts --json
```

Re-run readiness to confirm `ready: true`.

## Blocking Rules

- If readiness verification reports missing/wrong-type/wrong-unique fields, do not chain downstream projection seed/cutover work that assumes the schema.
- If provisioner dry-run reports blocking drift, do not run provisioner apply without `--allow-type-drift` and operator authorization.
- If the list is missing AND `--apply` is not supplied, the script intentionally fails (exit 1) — that is correct dry-run behavior, not an error to retry past.
- The permission-inheritance break is an operator gate, not a script step. Production seed/cutover must not proceed until step 5 is complete and verified in SharePoint admin.

## Rollback Posture

- The provisioner never deletes columns and never modifies item data.
- A wrong-type column must be resolved in SharePoint admin (rename / hide / recreate manually).
- `EnforceUniqueValues=true` can be turned off only in SharePoint admin; the projection engine assumes uniqueness when writing, and disabling it without rebuilding the projection invites duplicate rows.
- The list itself remains empty in MVP until Prompt 08 (seed). Rollback at the schema level is "leave list as-is and revert read mode to `legacy`".

## Related Docs

- Schema reference: `docs/reference/sharepoint/list-schemas/mydashboard/lists/my-projects-registry.md`
- Package source of truth: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/03_SharePoint_My_Projects_Registry_Schema.md`
- Permissions & governance: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/09_Security_Permissions_And_Governance.md`
- Sister pattern: `docs/how-to/administrator/provision-my-projects-custom-links.md` (HBCentral custom-links list)
