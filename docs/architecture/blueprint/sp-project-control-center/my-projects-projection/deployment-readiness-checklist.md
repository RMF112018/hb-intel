# My Projects Projection — Deployment Readiness Checklist

> Classification: **Canonical Current-State** operator-facing checklist.
> Sprint: B05.13 backend, Prompt 11.
> Audience: operator running the deployment + post-permission validation pipeline.
> Read mode at the time of writing: `legacy` (default). **No cutover performed.**

## How to use this checklist

Run it twice:

1. **Pre-deployment** — confirm Azure resources exist, RBAC is in place, env vars are set, and `readMode` defaults are safe before the projection code lands in the Function App.
2. **Post-permission, pre-Prompt-12** — confirm the `Sites.Read.All` Application permission has been granted and the subsystem is ready for live Graph subscription creation + delta seeding.

Each section names the artifact that documents the underlying truth so the checklist itself stays short.

---

## 1. Azure resource readiness

| Resource                                  | Expected name                      | Where provisioned | Verification                                                                               |
| ----------------------------------------- | ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| Service Bus namespace                     | `sb-hb-myprojects-projection-prod` | Runbook 01 §3     | Azure Portal → Service Bus → namespace exists, Standard tier.                              |
| Service Bus queue                         | `my-projects-projection-sync`      | Runbook 01 §4     | Queue exists with duplicate-detection 10m, lock 5m, TTL 7d, dead-letter on expiry enabled. |
| Storage account                           | `sthbmyprojopsprod`                | Runbook 01 §5     | Account exists, Standard LRS, dedicated to projection operational state.                   |
| Table `MyProjectsProjectionSubscriptions` | as named                           | Runbook 01 §6     | Table exists in the storage account.                                                       |
| Table `MyProjectsProjectionDeltaState`    | as named                           | Runbook 01 §6     | Table exists.                                                                              |
| Table `MyProjectsProjectionLeases`        | as named                           | Runbook 01 §6     | Table exists.                                                                              |
| Table `MyProjectsProjectionRuns`          | as named                           | Runbook 01 §6     | Table exists.                                                                              |

Authority: `runbooks/Runbook_01_Azure_Portal_Provisioning.md` §§ 3–6.

---

## 2. RBAC verification

Confirm the Function App's user-assigned managed identity (UAMI) holds:

| Role                              | Scope                 | Why                                                                     |
| --------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `Azure Service Bus Data Sender`   | Service Bus namespace | Webhook handler enqueues sync messages.                                 |
| `Azure Service Bus Data Receiver` | Service Bus namespace | Queue-trigger sync worker reads messages.                               |
| `Storage Table Data Contributor`  | Storage account       | State repositories read/write subscription, delta, lease, and run rows. |

Verification:

```sh
az role assignment list \
  --assignee <UAMI-object-id> \
  --all \
  --query "[].{role:roleDefinitionName, scope:scope}" \
  -o table
```

Authority: `runbooks/Runbook_01_Azure_Portal_Provisioning.md` §7.

---

## 3. Function App app-settings

Every required setting is in `resources/Environment_Settings_Matrix.md`. The
following anchors are operator-critical and easy to miss:

- **Identity** (Matrix §10): `AZURE_TENANT_ID` + `AZURE_CLIENT_ID` (the **UAMI client id**, not the application id).
- **Service Bus identity-based connection** (Matrix §3): `MyProjectsProjectionServiceBus__fullyQualifiedNamespace`, `MyProjectsProjectionServiceBus__credential=managedidentity`, `MyProjectsProjectionServiceBus__clientId` (must match `AZURE_CLIENT_ID`).
- **Read mode safety**: `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE` — see §4.
- **Enablement gate**: `HBC_MY_PROJECTS_PROJECTION_ENABLED=false` until code is deployed and the queue worker is ready to run.

Authority: `resources/Environment_Settings_Matrix.md` (full table) + `runbooks/Runbook_01_Azure_Portal_Provisioning.md` §8.

---

## 4. `readMode` safety check

Before any deployment of the projection code, confirm:

| Setting                                   | Required value        | Failure mode                         |
| ----------------------------------------- | --------------------- | ------------------------------------ |
| `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE` | **unset** or `legacy` | Any other value is unsafe to deploy. |

Code defaults already protect against accidental cutover:

- `projection-config.ts` parses the env var with `isProjectionReadMode(...)`; invalid or missing → defaults to `legacy`.
- `my-work-read-model-provider-resolver.ts → buildProjectLinksProvider` falls through to the legacy provider if reading the projection config throws for any reason.

Net: even if the env var is fat-fingered, the route serves legacy aggregation. Cutover requires an **explicit, well-formed `projection` value** + restart. Doc 07 Stage 7 (Prompt 13) gates the flip behind parity sign-off.

Repository-wide search confirms **no template anywhere** in the repo sets `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection` — see commit description for the Prompt 11 evidence run.

---

## 5. `Sites.Read.All` gate status

The Microsoft Graph **Application** permission `Sites.Read.All` is required for two operations:

1. Creating Graph webhook subscriptions on the Projects and Legacy Project Fallback Registry lists (`POST /subscriptions`).
2. Pulling delta pages against those lists (`GET /sites/{siteId}/lists/{listId}/items/delta`).

Existing `Sites.ReadWrite.All` is not sufficient — the projection lane runs under the SharePoint Creator app's federated token path, which currently does not carry `Sites.Read.All`.

| State                   | Operator meaning                            | What runs                                                                                                                                       |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Not requested**       | No admin consent submitted yet.             | Pre-permission work allowed per Runbook 02. **Stop before Prompt 12.**                                                                          |
| **Requested / pending** | Admin consent flow open; awaiting approval. | Same as above. Do not attempt live subscription create — it will 403.                                                                           |
| **Granted**             | Permission consented.                       | Cleared to execute Prompt 12 (live subscription create + delta seed) per Doc 07 Stage 6 and `10_Validation_Acceptance_And_Test_Matrix.md` §6.2. |

Operator capture (fill in at deployment time):

```text
[ ] Sites.Read.All status:  <Not requested | Pending | Granted>
[ ] Date noted:             <YYYY-MM-DD>
[ ] Granting admin:         <UPN, if Granted>
```

Authority: Sprint package `README.md`, `00_Closed_Decision_Register.md`, `05_Subscription_Delta_Queue_State_Design.md`, `runbooks/Runbook_02_Pre_Permission_Implementation_Work.md`.

---

## 6. Closeout statement

When every checkbox above passes pre-deployment **and** the `Sites.Read.All` row in §5 says **Granted**, the subsystem is in this state:

> Ready for infrastructure provisioning and post-permission live Graph validation.
> Not yet production-cutover ready until Prompt 12 and Prompt 13 complete.

Hand off to Prompt 12 (live subscription/webhook/delta validation) per Doc 07 Stage 6 → Stage 7.

---

## Related references

- `parity-evidence.md` — fixture parity proof between legacy and projection paths.
- `telemetry-evidence.md` — canonical event-name inventory + KQL pack reconciliation.
- `runtime-degradation-reference.md` — what each subsystem does when downstream dependencies are unavailable.
- `runbooks/Runbook_01_Azure_Portal_Provisioning.md` — step-by-step Azure portal recipe.
- `runbooks/Runbook_02_Pre_Permission_Implementation_Work.md` — pre-permission scope boundary.
- `resources/Environment_Settings_Matrix.md` — full env-var contract.
