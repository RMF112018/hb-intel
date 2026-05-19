# Environment Settings Matrix

## Purpose

Define the full backend configuration surface for the My Projects projection subsystem.

---

## 1. Core Enablement

| Setting                                            | Value                    | Required | Purpose                                                     |
| -------------------------------------------------- | ------------------------ | -------: | ----------------------------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_ENABLED`               | `true`                   |      Yes | Master enablement for projection services                   |
| `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE`          | `legacy` or `projection` |      Yes | Controls read provider selection                            |
| `HBC_MY_PROJECTS_PROJECTION_VERSION`               | `v1`                     |      Yes | Projection schema/version stamp                             |
| `HBC_MY_PROJECTS_PROJECTION_MAX_FRESHNESS_MINUTES` | `5`                      |      Yes | Runtime staleness threshold for projection read diagnostics |

---

## 2. SharePoint Sites and Lists

| Setting                                                 | Value                                                         | Required | Purpose                     |
| ------------------------------------------------------- | ------------------------------------------------------------- | -------: | --------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL`            | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`   |      Yes | Source list host            |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL`          | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` |      Yes | Projection helper list host |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_LIST_TITLE`        | `My Projects Registry`                                        |      Yes | Helper list title           |
| `HBC_MY_PROJECTS_PROJECTION_PROJECTS_LIST_TITLE`        | `Projects`                                                    |      Yes | Source list                 |
| `HBC_MY_PROJECTS_PROJECTION_LEGACY_REGISTRY_LIST_TITLE` | `Legacy Project Fallback Registry`                            |      Yes | Source list                 |

---

## 3. Graph Webhook and Subscriptions

| Setting                                                          | Value                                                               | Required | Purpose                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- | -------: | -------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL`                    | `https://<function-host>/api/webhooks/my-projects-projection/graph` |      Yes | Graph subscription target              |
| `HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE`                  | secure random string                                                |      Yes | Notification anti-forgery verification |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS`        | `27`                                                                |      Yes | Create/renew target                    |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEW_THRESHOLD_DAYS`   | `7`                                                                 |      Yes | Daily renewal trigger                  |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED`  | `true`                                                              |      Yes | Renewal timer enablement               |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE` | `0 15 2 * * *`                                                      |      Yes | Daily 02:15 UTC                        |

---

## 4. Service Bus Queue

| Setting                                              | Value                                | Required | Purpose                  |
| ---------------------------------------------------- | ------------------------------------ | -------: | ------------------------ |
| `HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME`              | `my-projects-projection-sync`        |      Yes | Queue name               |
| `HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN`         | `<namespace>.servicebus.windows.net` |      Yes | SDK sender namespace     |
| `HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS` | `60`                                 |      Yes | Queue message debouncing |

### Azure Functions identity-based Service Bus connection

| Setting                                                   | Value                                | Required |
| --------------------------------------------------------- | ------------------------------------ | -------: |
| `MyProjectsProjectionServiceBus__fullyQualifiedNamespace` | `<namespace>.servicebus.windows.net` |      Yes |
| `MyProjectsProjectionServiceBus__credential`              | `managedidentity`                    |      Yes |
| `MyProjectsProjectionServiceBus__clientId`                | `<Function App UAMI client ID>`      |      Yes |

---

## 5. Azure Table State Storage

| Setting                                          | Value                                              | Required | Purpose                |
| ------------------------------------------------ | -------------------------------------------------- | -------: | ---------------------- |
| `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL`   | `https://<storage-account>.table.core.windows.net` |      Yes | Table service endpoint |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTIONS_TABLE` | `MyProjectsProjectionSubscriptions`                |      Yes | Subscription state     |
| `HBC_MY_PROJECTS_PROJECTION_DELTA_STATE_TABLE`   | `MyProjectsProjectionDeltaState`                   |      Yes | Delta state            |
| `HBC_MY_PROJECTS_PROJECTION_LEASES_TABLE`        | `MyProjectsProjectionLeases`                       |      Yes | Lease state            |
| `HBC_MY_PROJECTS_PROJECTION_RUNS_TABLE`          | `MyProjectsProjectionRuns`                         |      Yes | Run history            |

---

## 6. Drift, Repair, and Purge

| Setting                                                   | Value                  | Required | Purpose                          |
| --------------------------------------------------------- | ---------------------- | -------: | -------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED`          | `true`                 |      Yes | Nightly read-only audit          |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE`   | `0 30 3 * * *`         |      Yes | Daily 03:30 UTC                  |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED`        | `false` initial launch |      Yes | Flip to true after 14 clean days |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE` | `0 0 4 * * 0`          |      Yes | Sunday 04:00 UTC                 |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED`        | `true`                 |      Yes | Inactive row purge               |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE` | `0 0 5 1 * *`          |      Yes | First day of month 05:00 UTC     |
| `HBC_MY_PROJECTS_PROJECTION_INACTIVE_RETENTION_DAYS`      | `90`                   |      Yes | Retention                        |

---

## 7. Worker Leases and Operational Limits

| Setting                                                | Value | Required | Purpose                                |
| ------------------------------------------------------ | ----- | -------: | -------------------------------------- |
| `HBC_MY_PROJECTS_PROJECTION_SYNC_LEASE_MINUTES`        | `10`  |      Yes | Source lane lease                      |
| `HBC_MY_PROJECTS_PROJECTION_REBUILD_LEASE_MINUTES`     | `60`  |      Yes | Full seed/rebuild lease                |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_LEASE_MINUTES` | `60`  |      Yes | Drift audit lease                      |
| `HBC_MY_PROJECTS_PROJECTION_PURGE_LEASE_MINUTES`       | `30`  |      Yes | Purge lease                            |
| `HBC_MY_PROJECTS_PROJECTION_MAX_DELTA_PAGES_PER_RUN`   | `100` |      Yes | Safety bound; fail visibly if exceeded |

---

## 8. Live Cutover Values

### Before cutover

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED=false
```

### After production cutover

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection
HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED=false
```

### After 14-day stabilization

```text
HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED=true
```

---

## 9. Secret Handling

Treat as secure values:

- `HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE`

Do not log it.  
Do not store it in SharePoint.  
Do not include it in evidence output.

---

## 10. Identity / Managed-Identity Settings

The Function App's user-assigned managed identity (UAMI) holds every RBAC
role required by the projection subsystem (Service Bus Data Sender + Data
Receiver, Storage Table Data Contributor). Both env vars below MUST be set on
the Function App so `DefaultAzureCredential` resolves the UAMI rather than the
Function's system-assigned identity or another credential source.

| Name              | Required | Default | Description                                                                                                                                                   |
| ----------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AZURE_TENANT_ID` | yes      | —       | Entra tenant id (guid). Already a Function App pre-condition for legacy-fallback Graph auth; the projection subsystem reuses it.                              |
| `AZURE_CLIENT_ID` | yes      | —       | **UAMI client id** (not the application client id). Identity-based Service Bus settings (`MyProjectsProjectionServiceBus__clientId`) must use the same value. |

Verification: see `runbooks/Runbook_01_Azure_Portal_Provisioning.md` § 8
"Required managed-identity settings" and the post-deployment readiness
checklist at
`docs/architecture/blueprint/sp-project-control-center/my-projects-projection/deployment-readiness-checklist.md`.

---

## 11. Compatibility with Existing Hosting Config

The projection subsystem reuses:

- the existing `AZURE_TENANT_ID` / `AZURE_CLIENT_ID` Function App settings
  (now formalized in § 10),
- the federated Graph hosting config under legacy-fallback conventions where
  reused.

The implementation may introduce dedicated projection-specific config files,
but it must not duplicate or contradict the established Graph authorization
lane.
