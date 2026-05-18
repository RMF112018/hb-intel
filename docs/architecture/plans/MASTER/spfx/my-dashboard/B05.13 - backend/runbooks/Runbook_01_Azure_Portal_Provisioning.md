# Runbook 01 | Azure Portal Provisioning

## Objective

Provision the new Azure infrastructure required by the My Projects incremental projection subsystem before live Graph subscription validation:

1. Azure Service Bus Standard namespace and queue.
2. Dedicated Azure Storage account for operational Table state.
3. Azure RBAC assignments for `hb-intel-function-app-uami`.
4. Function App environment variables required by the backend implementation.

This runbook is intentionally written for **portal execution**, not CLI.

---

# 1. Locked Resource Decisions

| Resource                          | Locked target                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Service Bus namespace             | Preferred `sb-hb-myprojects-projection-prod`; if unavailable, use `sb-hb-myprojects-projection-prod01` and document the final actual name. |
| Service Bus tier                  | **Standard**                                                                                                                               |
| Queue                             | `my-projects-projection-sync`                                                                                                              |
| Operational state storage account | Preferred `sthbmyprojopsprod`; if unavailable, use `sthbmyprojopsprod01` and document final actual name.                                   |
| Table service                     | Required                                                                                                                                   |
| Queue service in storage account  | Not used by the selected architecture                                                                                                      |
| Runtime identity                  | Existing UAMI `hb-intel-function-app-uami`                                                                                                 |
| Backend Function App              | Existing backend Azure Functions app used by My Dashboard                                                                                  |

---

# 2. Provision Azure Service Bus Namespace

## Portal path

```text
Azure Portal
→ Search: Service Bus
→ Service Bus namespaces
→ + Create
```

## Required selections

| Setting         | Value                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Subscription    | Same subscription as the My Dashboard backend Function App                                            |
| Resource group  | Same resource group as backend Function App unless platform standards dictate a shared integration RG |
| Namespace name  | `sb-hb-myprojects-projection-prod` preferred                                                          |
| Pricing tier    | `Standard`                                                                                            |
| Region          | Same Azure region as the backend Function App where practical                                         |
| Zone redundancy | Follow environment standard; not required to complete this package                                    |

## Acceptance check

After creation:

```text
Service Bus namespace opens successfully
→ Overview page loads
→ Tier shows Standard
```

---

# 3. Create the Projection Sync Queue

## Portal path

```text
Service Bus namespace
→ Entities
→ Queues
→ + Queue
```

## Queue settings

| Setting                              | Value                         |
| ------------------------------------ | ----------------------------- |
| Name                                 | `my-projects-projection-sync` |
| Max delivery count                   | `10`                          |
| Lock duration                        | `5 minutes`                   |
| Default message time to live         | `7 days`                      |
| Dead-lettering on message expiration | Enabled                       |
| Duplicate detection                  | Enabled                       |
| Duplicate detection history window   | `10 minutes`                  |
| Sessions                             | Disabled                      |
| Partitioning                         | Disabled                      |
| Express                              | Disabled                      |

## Why this queue posture is locked

- Queue volume is expected to be bursty during MVP and low thereafter.
- Duplicate detection suppresses notification storms and repeated enqueue attempts.
- Dead-lettering provides operator-visible failure capture.
- The queue is a **wake-up queue**, not a durable business-data ledger; operational truth remains in Azure Table Storage and SharePoint projection rows.

## Acceptance check

```text
Queues
→ my-projects-projection-sync
→ Overview
```

Confirm:

- Active message count = 0 initially.
- Dead-letter count = 0 initially.
- Duplicate detection = enabled.

---

# 4. Provision Dedicated Operational State Storage Account

## Portal path

```text
Azure Portal
→ Search: Storage accounts
→ + Create
```

## Required selections

| Setting                | Value                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| Subscription           | Same subscription as backend Function App                               |
| Resource group         | Same RG as Service Bus / Function App unless platform standard differs  |
| Storage account name   | `sthbmyprojopsprod` preferred                                           |
| Region                 | Same region as backend Function App where practical                     |
| Performance            | Standard                                                                |
| Redundancy             | LRS is acceptable for MVP unless organizational policy requires ZRS/GRS |
| Access tier            | Hot/default                                                             |
| Hierarchical namespace | Disabled unless broader platform policy requires otherwise              |
| Public blob access     | Disabled                                                                |

## Purpose

This storage account is **not** the Function host storage account. It is a dedicated backend operational-state store for:

- Graph subscription registry.
- Delta cursor/checkpoint state.
- Lease/worker coordination state.
- Run ledger / sync operations state.

## Acceptance check

```text
Storage account
→ Overview
```

Confirm the storage account exists and opens.

---

# 5. Create Table Storage Tables

## Portal path

```text
Operational storage account
→ Storage browser
→ Tables
→ + Add table
```

Create each table exactly:

1. `MyProjectsProjectionSubscriptions`
2. `MyProjectsProjectionDeltaState`
3. `MyProjectsProjectionLeases`
4. `MyProjectsProjectionRuns`

## Acceptance check

All four tables appear under:

```text
Storage browser → Tables
```

No initial entities are required at provisioning time. The implementation creates/updates entities through code.

---

# 6. Assign Service Bus RBAC to the Function App UAMI

## Portal path

```text
Service Bus namespace
→ Access control (IAM)
→ + Add
→ Add role assignment
```

Assign both roles to:

```text
hb-intel-function-app-uami
```

### Role 1

```text
Azure Service Bus Data Sender
```

### Role 2

```text
Azure Service Bus Data Receiver
```

## Scope

Preferred:

- scope at the **queue** if portal/workflow supports it cleanly.

Acceptable:

- scope at the **namespace** for MVP if queue-level assignment is operationally awkward.

Do not assign:

```text
Azure Service Bus Data Owner
```

to the runtime identity unless an infrastructure administrator determines it is required for a separate operations process. It is not required for send/receive runtime behavior.

## Acceptance check

```text
Service Bus namespace or queue
→ Access control (IAM)
→ Role assignments
→ Search hb-intel-function-app-uami
```

You should see:

- Azure Service Bus Data Sender
- Azure Service Bus Data Receiver

---

# 7. Assign Table Storage RBAC to the Function App UAMI

## Portal path

```text
Operational storage account
→ Access control (IAM)
→ + Add
→ Add role assignment
```

Assign:

```text
Storage Table Data Contributor
```

to:

```text
hb-intel-function-app-uami
```

## Why this role

The runtime must read/write/update/delete Table entities for:

- delta checkpoints,
- subscription state,
- leases,
- run records.

Blob-only roles do not grant Table entity access.

## Acceptance check

```text
Storage account
→ Access control (IAM)
→ Role assignments
→ Search hb-intel-function-app-uami
```

You should see:

- Storage Table Data Contributor

---

# 8. Add Function App Environment Variables

## Portal path

```text
Azure Portal
→ Function App
→ Settings
→ Environment variables
```

Add the exact settings below once the implementation reaches configuration wiring. Values in angle brackets are deployment-specific.

## Core projection settings

| Name                                               | Value                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_ENABLED`               | `false` initially; change to `true` after code deployment when preparing pipeline validation |
| `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE`          | `legacy` initially                                                                           |
| `HBC_MY_PROJECTS_PROJECTION_VERSION`               | `v1`                                                                                         |
| `HBC_MY_PROJECTS_PROJECTION_MAX_FRESHNESS_MINUTES` | `5`                                                                                          |

## Required target/source site settings

| Name                                                    | Value                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL`            | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`   |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL`          | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_LIST_TITLE`        | `My Projects Registry`                                        |
| `HBC_MY_PROJECTS_PROJECTION_PROJECTS_LIST_TITLE`        | `Projects`                                                    |
| `HBC_MY_PROJECTS_PROJECTION_LEGACY_REGISTRY_LIST_TITLE` | `Legacy Project Fallback Registry`                            |

## Graph webhook and subscription settings

| Name                                                             | Value                                                                                                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL`                    | `<public HTTPS Function webhook URL>`                                                                                                     |
| `HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE`                  | secure Function App application setting containing a high-entropy random value; do not place the literal value in source or evidence docs |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS`        | `27`                                                                                                                                      |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEW_THRESHOLD_DAYS`   | `7`                                                                                                                                       |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED`  | `true`                                                                                                                                    |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE` | `0 15 2 * * *`                                                                                                                            |

## Required managed-identity settings

The Function App's user-assigned managed identity (UAMI) is the identity that
holds the RBAC roles assigned in §7. Both values below must be set so
`DefaultAzureCredential` resolves the UAMI (not the Function App's system-
assigned identity, and not an unintended credential source).

| Name              | Value                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AZURE_TENANT_ID` | `<tenant-guid>` — the Entra tenant the UAMI lives in.                                                                                                                                |
| `AZURE_CLIENT_ID` | `<hb-intel-function-app-uami client id>` — the **UAMI client id** (not the application client id). Identity-based Service Bus connection settings below must use the same client id. |

> If `AZURE_CLIENT_ID` is unset or points at a different identity, the
> projection subsystem will throw on token acquisition and surface
> `subscription.create.failure` / `worker.delta.failure` / projection-read
> `source-unavailable` envelopes — see
> `docs/architecture/blueprint/sp-project-control-center/my-projects-projection/runtime-degradation-reference.md`.

## Required Service Bus settings

| Name                                                      | Value                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN`              | `<service-bus-namespace>.servicebus.windows.net`                               |
| `HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME`                   | `my-projects-projection-sync`                                                  |
| `HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS`      | `60`                                                                           |
| `MyProjectsProjectionServiceBus__fullyQualifiedNamespace` | `<service-bus-namespace>.servicebus.windows.net`                               |
| `MyProjectsProjectionServiceBus__credential`              | `managedidentity`                                                              |
| `MyProjectsProjectionServiceBus__clientId`                | `<hb-intel-function-app-uami client id>` — must match `AZURE_CLIENT_ID` above. |

## Required operational Table Storage settings

| Name                                             | Value                                                   |
| ------------------------------------------------ | ------------------------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL`   | `https://<storage-account-name>.table.core.windows.net` |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTIONS_TABLE` | `MyProjectsProjectionSubscriptions`                     |
| `HBC_MY_PROJECTS_PROJECTION_DELTA_STATE_TABLE`   | `MyProjectsProjectionDeltaState`                        |
| `HBC_MY_PROJECTS_PROJECTION_LEASES_TABLE`        | `MyProjectsProjectionLeases`                            |
| `HBC_MY_PROJECTS_PROJECTION_RUNS_TABLE`          | `MyProjectsProjectionRuns`                              |

## Drift, repair, purge, and worker settings

| Name                                                      | Value             |
| --------------------------------------------------------- | ----------------- |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED`          | `true`            |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE`   | `0 30 3 * * *`    |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED`        | `false` initially |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE` | `0 0 4 * * 0`     |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED`        | `true`            |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE` | `0 0 5 1 * *`     |
| `HBC_MY_PROJECTS_PROJECTION_INACTIVE_RETENTION_DAYS`      | `90`              |
| `HBC_MY_PROJECTS_PROJECTION_SYNC_LEASE_MINUTES`           | `10`              |
| `HBC_MY_PROJECTS_PROJECTION_REBUILD_LEASE_MINUTES`        | `60`              |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_LEASE_MINUTES`    | `60`              |
| `HBC_MY_PROJECTS_PROJECTION_PURGE_LEASE_MINUTES`          | `30`              |
| `HBC_MY_PROJECTS_PROJECTION_MAX_DELTA_PAGES_PER_RUN`      | `100`             |

## Save and restart

After adding or editing settings:

```text
Save
→ confirm app restart if prompted
```

---

# 9. Provisioning Exit Criteria

Do not advance to live subscription testing until all are true:

- Service Bus Standard namespace exists.
- Queue `my-projects-projection-sync` exists.
- Dedicated operational storage account exists.
- All four tables exist.
- UAMI has Service Bus Sender + Receiver.
- UAMI has Storage Table Data Contributor.
- Function App environment variables are added when implementation reaches that step.
- `Sites.Read.All` Application permission status is tracked as pending until granted.
