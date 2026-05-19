# Provision My Dashboard Adobe Sign Cache Lists

## Purpose

Operator-safe runbook to provision the four `MyDashboardAdobeSign*` SharePoint cache lists on the MyDashboard site and verify their column schema and `EnforceUniqueValues` posture. Backs the Adobe Sign webhook-backed projection cache program (package `B05.15 - a-s-webhook-cache`).

This runbook is scoped to:

- `MyDashboardAdobeSignUserCache` — one row per connected Adobe actor; carries the card-home preview JSONs and freshness state.
- `MyDashboardAdobeSignAgreementProjectionCache` — one row per actor × agreement × recipient-action; the agreement-level cache.
- `MyDashboardAdobeSignWebhookSubscriptions` — HB-managed USER-scoped Adobe webhook subscription registry.
- `MyDashboardAdobeSignSyncRuns` — operational refresh/subscription/reconciliation run ledger.

It creates each list when missing, ensures every column in `MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS` exists with the canonical type, and sets `EnforceUniqueValues=true` on each list's indexed primary key (`AdobeActorKey` on UserCache, `ProjectionKey` on AgreementProjectionCache, `SubscriptionKey` on WebhookSubscriptions, `RunId` on SyncRuns). It fails closed on wrong-type or wrong-unique drift. It does **not** mutate item data, does **not** touch any other MyDashboard list, and does **not** script the list permission-inheritance break.

## Schema in Scope

| List                                            | Field count | Indexed fields | Unique-enforced key |
| ----------------------------------------------- | ----------- | -------------- | ------------------- |
| `MyDashboardAdobeSignUserCache`                 | 25          | 5              | `AdobeActorKey`     |
| `MyDashboardAdobeSignAgreementProjectionCache`  | 37          | 8              | `ProjectionKey`     |
| `MyDashboardAdobeSignWebhookSubscriptions`      | 19          | 7              | `SubscriptionKey`   |
| `MyDashboardAdobeSignSyncRuns`                  | 21          | 6              | `RunId`             |

All lists are SharePoint template `100` (generic custom list), not hidden, with the SharePoint built-in `Title` column intentionally not redeclared.

See `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.15 - a-s-webhook-cache/04_SharePoint_Adobe_Sign_Cache_List_Schema_And_Provisioning_Plan.md` for the full field reference and `resources/SharePoint_Adobe_Sign_*_Schema.json` for the canonical per-list JSON descriptors.

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
pnpm tsx scripts/verify-my-dashboard-adobe-sign-cache-lists.ts --json
```

Exit 0 ⇒ every required column on every cache list is live-verified with the canonical `TypeAsString`, and each list's primary-key column carries `EnforceUniqueValues=true`. Exit 1 ⇒ at least one list is missing, or at least one field is `missing`, `wrong-type`, or `wrong-unique`.

### 2. Provisioner dry-run (required)

```bash
pnpm tsx scripts/provision-my-dashboard-adobe-sign-cache-lists.ts --json
```

Optional explicit site:

```bash
pnpm tsx scripts/provision-my-dashboard-adobe-sign-cache-lists.ts \
  --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard \
  --json
```

The dry-run never creates lists and never mutates fields. Inspect per-target:

- `targets[].listFound`
- `targets[].plannedCreates`
- `targets[].plannedUpdates`
- `targets[].plannedUniqueChanges`
- `targets[].blockers[]`
- `targets[].uniqueBlockers[]`

`hasBlockingDrift` and `listsMissing` roll up across all four lists; both contribute to the top-level `success` flag.

### 3. Provisioner apply (only if dry-run has no blocking drift)

```bash
pnpm tsx scripts/provision-my-dashboard-adobe-sign-cache-lists.ts --apply --json
```

On apply, the script:

- Creates each list when missing (`createdList: true` in the target report).
- Calls `createField` for each missing column via PnPjs (supports `Text`, `Number`, `Boolean`, `DateTime`, `Choice`, `URL`, `MultiLineText` → `Note`).
- Applies non-destructive `Required` / `Indexed` / `Choices` / `DefaultValue` updates where descriptor drift is benign.
- Issues `EnforceUniqueValues=true` on the primary key of each list after the field exists.

### 4. Wrong-type or wrong-unique drift override (rare)

If drift is reported and remediation is intentionally deferred, override with:

```bash
pnpm tsx scripts/provision-my-dashboard-adobe-sign-cache-lists.ts --apply --allow-type-drift --json
```

Apply proceeds with the remaining `create` / `update-settings` / `unique-change` actions, but the affected columns are NOT auto-converted. Wrong-type columns must be resolved manually in SharePoint admin — the script does not delete or recreate columns.

### 5. Manual operator step — break list permission inheritance

The provisioner intentionally does **not** script permission-inheritance break or role assignments. After `--apply` succeeds, repeat the following for **each** of the four cache lists:

1. Open the MyDashboard site in SharePoint admin: `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`.
2. Navigate to **Site contents** → the target list → **Settings** (gear) → **List settings**.
3. Open **Permissions for this list** → **Stop Inheriting Permissions**.
4. Remove general site member/visitor group access.
5. Grant **Full Control** or **Manage Lists** to the MyDashboard site owners / designated admin group.
6. Grant **Read** or **Edit** (per governance) to the operations/support group, if one is designated.
7. Confirm the backend Graph app identity (HB SharePoint Creator) retains app-only site access.

Rationale: these lists carry `UserPrincipalName`, `AdobeActorKey`, provider snapshots, and webhook subscription identifiers. They are internal operational data, not a public project directory. See `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.15 - a-s-webhook-cache/11_Security_Permissions_And_Governance.md` for the full posture.

### 6. Post-apply verification

```bash
pnpm tsx scripts/verify-my-dashboard-adobe-sign-cache-lists.ts --json
```

Re-run readiness to confirm top-level `ready: true` and each per-list `targets[].ready: true`.

## Blocking Rules

- If readiness verification reports missing/wrong-type/wrong-unique fields on any list, do not chain downstream cache write/read cutover work (Prompts 03–15) that assumes the schema.
- If the provisioner dry-run reports blocking drift, do not run provisioner apply without `--allow-type-drift` and explicit operator authorization.
- If any list is missing AND `--apply` is not supplied, the script intentionally fails (exit 1) — that is correct dry-run behavior, not an error to retry past.
- The permission-inheritance break is an operator gate, not a script step. Production seed/cutover must not proceed until step 5 is complete on **every** cache list and verified in SharePoint admin.

## Rollback Posture

- The provisioner never deletes columns and never modifies item data.
- A wrong-type column must be resolved in SharePoint admin (rename / hide / recreate manually).
- `EnforceUniqueValues=true` can be turned off only in SharePoint admin; the cache write paths in Prompts 03–10 assume uniqueness when upserting, and disabling it without rebuilding the projection invites duplicate rows.
- The lists themselves remain empty in MVP until the first hydration work item lands (Prompt 05). Rollback at the schema level is "leave the lists as-is and keep `MY_WORK_ADOBE_SIGN_READ_MODE=live`" — the cache write path can be disabled independently of the schema.

## Related Docs

- Package source of truth: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.15 - a-s-webhook-cache/04_SharePoint_Adobe_Sign_Cache_List_Schema_And_Provisioning_Plan.md`
- Final target architecture: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.15 - a-s-webhook-cache/01_Final_Target_Architecture.md` (sections 12.1–12.4)
- Permissions & governance: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.15 - a-s-webhook-cache/11_Security_Permissions_And_Governance.md`
- Sister pattern: `docs/how-to/administrator/provision-my-projects-registry-schema.md` (MyDashboard My Projects Registry list)
