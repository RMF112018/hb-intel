# My Projects — HB SharePoint Creator Permission and Provisioning Readiness (Prompt 01)

**Prepared:** May 13, 2026  
**Repo:** `hb-intel`  
**HEAD:** `53ef2c74bcd27db0d3d1dc14d2bbebd7096686f4`

## 1. Current Repo-Documented Posture

### A) SPFx My Dashboard API permission seam (must not be conflated)

- **Resource name:** `HB SharePoint Creator`
- **Scope:** `access_as_user`
- **Repo evidence paths:**
  - `apps/my-dashboard/config/package-solution.json`
  - `apps/my-dashboard/README.md`
- **What this does prove:**
  - My Dashboard SPFx package declares a protected API permission request for the named resource/scope pair.
- **What this does not prove:**
  - It does **not** prove the app-only provisioning identity can perform Graph schema operations.
  - It does **not** prove tenant-granted app permissions or selected-resource grants for provisioning/backfill lanes.

### B) App-only provisioning identity seam

- **Display name:** `HB SharePoint Creator`
- **App/client ID:** `08c399eb-a394-4087-b859-659d493f8dc7`
- **Current posture:** `pilot-interim`
- **Target posture:** `least-privilege-sites-selected`
- **Repo evidence paths:**
  - `docs/how-to/administrator/create-legacy-fallback-lists.md`
  - `backend/functions/src/services/legacy-fallback/hosting-config.ts`
- **Exact environment/config keys from hosting config:**
  - `HBC_LEGACY_FALLBACK_HOSTING_ENV`
  - `HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME`
  - `HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL`
  - `HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL`
  - `SHAREPOINT_TENANT_URL`
  - `AZURE_TENANT_ID`
  - `AZURE_CLIENT_ID`
  - `HBC_LEGACY_FALLBACK_GRAPH_SCOPE`
  - `HBC_LEGACY_FALLBACK_AUTH_POSTURE`
  - `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID`
  - `HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL`
  - `HBC_LEGACY_FALLBACK_TARGET_AUTH_MODEL_NOTES`
- **Existing runbook command path:**
  - `scripts/provision-legacy-fallback-lists.ts` via `pnpm exec tsx ...`
  - Script supports `SHAREPOINT_BEARER_TOKEN` or `DefaultAzureCredential` and optional `--allow-type-drift`.

## 2. Operation-by-Operation Permission Matrix

| Operation | Repo/tooling path | Required proof | Live operator verification |
|---|---|---|---|
| Read list schema | `scripts/provision-legacy-fallback-lists.ts` + descriptor validation helpers | App path can acquire token and inspect list column metadata for target site/lists. | **Tenant-proof-pending** |
| Create missing list columns | Provisioning script / descriptor tooling | Schema-management permission posture for column create operations is granted and effective in tenant. | **Blocked until operator verification** |
| Alter compatible field settings | Provisioning script (`--allow-type-drift` flow if intentionally deferred) | Schema-management permission posture for column updates is granted and effective in tenant. | **Blocked until operator verification** |
| Read Projects and Registry list items | Backend/read-model provider lane for My Work + list service contracts | Runtime identity and lane can read required list items for assignment and launch assembly. | **Tenant-proof-pending** |
| Write Projects backfill values | Prompt 05 migration/backfill script lane (to be executed later) | Item-write capability confirmed for Projects updates. | **Blocked until operator verification** |
| Write Registry mirror/preserve values | Prompt 06/07 migration/discovery support lane (later) | Item-write capability confirmed for Registry updates while preserving manual legacy-only values. | **Blocked until operator verification** |
| Create list if missing (if capability retained) | Provisioning script capability lane | List-create capability verified only if script path still supports list creation in target run. | **Tenant-proof-pending** |

### Matrix status interpretation

- **Repo-validated:** repo paths and intended operation are present and traceable.
- **Tenant-proof-pending:** repo evidence exists, but live tenant permission/grant proof is not yet furnished in this prompt.
- **Blocked until operator verification:** operation must not proceed until operator confirms live permission sufficiency.

## 3. Microsoft Documentation Interpretation (from package research baseline)

Using `supporting/01_External_Research_Validation_Summary.md` as the authoritative package baseline:

- **Schema read posture:** list-column inspection is lower-privilege than schema mutation and must be proven with live tenant identity/grants.
- **Create/update list-column posture:** schema-management operations require stronger permission posture than read-only checks; must be operator-verified before Prompt 02+ mutation steps.
- **List creation posture (if applicable):** creating lists is also schema-management and must be explicitly validated before use.
- **Selected-resource model:** consent alone is insufficient; explicit resource grants and an appropriate token posture are required.
- **Selected roles to verify in tenant:** `read`, `write`, `owner`, `fullcontrol`.
- **Why selected posture cannot be overclaimed:** endpoint-level schema mutation sufficiency is not proven solely by target selected-resource intent; operation-level and tenant-level proof is required before execution.

## 4. Existing HB SharePoint Creator App Path Decision

- **Closed decision:** No new app registration is proposed.
- The implementation package continues on the existing `HB SharePoint Creator` app path.
- If permissions are insufficient, the blocker must be recorded as tenant-side grant/permission posture gap and resolved by operator before mutation prompts execute.
- **Blocking impact if unresolved:** Prompt 02 schema mutation, Prompt 05 Projects backfill apply, Prompt 06/07 Registry mirror/discovery write operations.

## 5. Operator-Owned Checklist

- [ ] Confirm app identity is `HB SharePoint Creator` / `08c399eb-a394-4087-b859-659d493f8dc7` in active tenant.
- [ ] Review current granted app permissions in Entra for required operations (schema read, schema mutation, item writes).
- [ ] Verify HBCentral selected-resource/site/list grants if selected posture is in use.
- [ ] Confirm schema-read capability in target tenant context.
- [ ] Confirm schema-write capability (or explicitly approve next gated step that will verify it).
- [ ] Confirm list-item write capability for Projects and Registry operations.
- [ ] Choose provisioner credential path: `SHAREPOINT_BEARER_TOKEN` or `DefaultAzureCredential`.
- [ ] Ensure no secrets/tokens are committed to repo artifacts.

## 6. Tenant Proof Bundle Requirements (Closure of Operator-Pending Blocker)

To close the blocker, the operator must furnish all five evidence groups below in one review packet:

1. App identity proof (`HB SharePoint Creator` + `08c399eb-a394-4087-b859-659d493f8dc7`).
2. Entra API permissions + admin consent proof.
3. HBCentral site/resource grant proof (selected-resource role assignment).
4. Read-path runtime proof (list/column inspection success for Projects + Registry).
5. Gated write-capability proof (schema-write and item-write authorization path success, no broad mutation run).

If any evidence group is missing or fails, `Operator-pending tenant proof` remains open.

## 7. Operator Command Ledger (Run and Paste Outputs)

Use one auth lane only for the runtime proof pair.

```bash
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD

# lane declaration (record one of these in evidence)
# SHAREPOINT_BEARER_TOKEN lane
# DefaultAzureCredential lane

pnpm exec tsx scripts/provision-legacy-fallback-lists.ts --help
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts <your-readonly-flags>
pnpm exec tsx scripts/provision-legacy-fallback-lists.ts <your-minimal-write-proof-flags>
```

Notes:
- This script does not currently advertise a dedicated `--read-only` switch in repo truth; operator must use tenant-approved non-mutating/limited flags.
- Do not paste tokens or secrets into repo artifacts.

## 8. Prompt 02+ Tenant-Mutation Gate Logic

- **GO:** only when both schema-write proof and item-write proof are present and successful in tenant evidence.
- **NO-GO:** if either proof is absent/fails, with explicit missing prerequisite logged.

## 9. Prompt 02 Readiness Gate

**Current gate decision: CONDITIONAL GO (repo-ready, tenant-proof pending).**

- Prompt 02 may proceed for repo-side descriptor/docs/contracts preparation and non-mutating validation.
- Any live schema/list mutation action remains blocked until operator tenant-proof checklist items above are satisfied.

## 10. Explicit Non-Goals and Safety Assertions

- No live tenant mutation was executed in this prompt.
- No provisioning/backfill/mirroring apply command was run.
- No app registration replacement was proposed.
- SPFx `access_as_user` seam was kept separate from app-only provisioner identity seam.

## 11. Validation Commands and Outcomes

### Commands run

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD

rg -n "HB SharePoint Creator|08c399eb-a394-4087-b859-659d493f8dc7|pilot-interim|least-privilege-sites-selected" \
  docs/how-to/administrator/create-legacy-fallback-lists.md \
  backend/functions/src/services/legacy-fallback/hosting-config.ts \
  apps/my-dashboard/config/package-solution.json \
  apps/my-dashboard/README.md

rg -n "SHAREPOINT_BEARER_TOKEN|DefaultAzureCredential|--allow-type-drift" \
  scripts/provision-legacy-fallback-lists.ts
```

### Outcome summary

- Branch/HEAD resolved to `main` / `53ef2c74bcd27db0d3d1dc14d2bbebd7096686f4`.
- Repo posture tokens and app identity values were found at expected paths.
- Provisioner credential/auth flow markers were found in script (`SHAREPOINT_BEARER_TOKEN`, `DefaultAzureCredential`, `--allow-type-drift`).
- Script argument parsing shows `--allow-type-drift` support but no explicit read-only flag.
- No destructive command or tenant mutation was executed.

## 12. Evidence Appendix Template (Fill with Tenant Proof)

| Evidence Group | Artifact/Output Reference | Timestamp (UTC) | Result |
|---|---|---|---|
| App identity (`HB SharePoint Creator` / app ID) | `OPERATOR_FILL` | `OPERATOR_FILL` | `PASS/FAIL` |
| Entra permissions + admin consent | `OPERATOR_FILL` | `OPERATOR_FILL` | `PASS/FAIL` |
| HBCentral selected-resource grant + role | `OPERATOR_FILL` | `OPERATOR_FILL` | `PASS/FAIL` |
| Read-path runtime proof | `OPERATOR_FILL` | `OPERATOR_FILL` | `PASS/FAIL` |
| Gated write-capability proof | `OPERATOR_FILL` | `OPERATOR_FILL` | `PASS/FAIL` |

## 13. Prompt 01 Verdict and Carry Forward

- **Prompt 01 verdict:** PASS (readiness artifact complete, tenant-proof still operator-owned).
- **Prompt 02 proceed:** YES for docs/contracts and non-mutating work; live tenant mutation remains gated.
- **Recommended docs commit title:**
  - `docs(my-dashboard): document My Projects HB SharePoint Creator provisioning readiness`
- **Recommended description:**
  - Documented split SPFx vs app-only auth seams, operation-level permission/readiness matrix, and operator-owned tenant-proof gates required before schema/backfill writes.
