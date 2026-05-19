# Environment Settings Matrix | My Projects SharePoint Storage Redirection

## 1. Purpose

Define the active MVP settings required by the SharePoint-backed My Projects projection architecture and identify settings from the prior Azure Table / Service Bus target that are no longer active MVP requirements.

## 2. Active MVP Settings

| Setting | Required | Purpose |
|---|:---:|---|
| `HBC_MY_PROJECTS_PROJECTION_ENABLED` | Yes | Master projection subsystem enablement |
| `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE` | Yes | `legacy` or `projection` |
| `HBC_MY_PROJECTS_PROJECTION_VERSION` | Recommended | Closed MVP projection version, default `v1` |
| `HBC_MY_PROJECTS_PROJECTION_SOURCE_SITE_URL` | Yes | Source HB Central site |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_SITE_URL` | Yes | MyDashboard site hosting projection/control lists |
| `HBC_MY_PROJECTS_PROJECTION_PROJECTS_LIST_TITLE` | Recommended | Defaults to `Projects` |
| `HBC_MY_PROJECTS_PROJECTION_LEGACY_REGISTRY_LIST_TITLE` | Recommended | Defaults to `Legacy Project Fallback Registry` |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_LIST_TITLE` | Recommended | Defaults to `My Projects Registry` |
| `HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL` | Yes | Public Graph webhook receiver URL |
| `HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE` | Yes, secure | Graph webhook client-state secret |
| `HBC_MY_PROJECTS_PROJECTION_MAX_FRESHNESS_MINUTES` | Recommended | Closed MVP target: `5` |
| `HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS` | Recommended | Closed MVP target: `60` |
| `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_ENABLED` | Yes | Enables timer worker |
| `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE` | Yes | 6-field cron, default `0 */1 * * * *` |
| `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_MAX_ATTEMPTS` | Recommended | Default `5` |
| `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_CLAIM_LEASE_MINUTES` | Recommended | Default `10` |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_EXPIRATION_DAYS` | Recommended | Default `27` |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEW_THRESHOLD_DAYS` | Recommended | Default `7` |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_ENABLED` | Yes | Enables renewal timer |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTION_RENEWAL_TIMER_SCHEDULE` | Recommended | Daily timer; align with repo convention |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_ENABLED` | Yes | Required |
| `HBC_MY_PROJECTS_PROJECTION_DRIFT_AUDIT_TIMER_SCHEDULE` | Recommended | Nightly timer |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED` | Yes | Default `false` |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_TIMER_SCHEDULE` | Recommended | Weekly repair schedule |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED` | Yes | Required |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_TIMER_SCHEDULE` | Recommended | Monthly purge |
| `HBC_MY_PROJECTS_PROJECTION_REGISTRY_INACTIVE_RETENTION_DAYS` | Recommended | Default `90` |
| `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_SUCCESS_RETENTION_DAYS` | Recommended | Default `30` |
| `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_FAILURE_RETENTION_DAYS` | Recommended | Default `90` |
| `HBC_MY_PROJECTS_PROJECTION_RUN_RETENTION_DAYS` | Recommended | Default `180` |
| `HBC_MY_PROJECTS_PROJECTION_RESOLVED_FAILURE_RETENTION_DAYS` | Recommended | Default `180` |
| `AZURE_TENANT_ID` | As required by existing auth lane | Current repo/runtime identity support |
| `AZURE_CLIENT_ID` | As required by existing UAMI lane | Current repo/runtime identity support |

## 3. Superseded Active MVP Settings (Quarantined Compatibility Only)

The following were required by the prior Azure Table / Service Bus implementation target but are **not active MVP requirements** under this redirection package. They may remain parsed as compatibility seams during staged transition, but must not block projection-enabled startup.

| Setting | Status |
|---|---|
| `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL` | Superseded |
| `HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN` | Superseded |
| `HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME` | Superseded |
| `MyProjectsProjectionServiceBus__fullyQualifiedNamespace` | Superseded |
| `MyProjectsProjectionServiceBus__credential` | Superseded where present |
| `MyProjectsProjectionServiceBus__clientId` | Superseded where present |
| `HBC_MY_PROJECTS_PROJECTION_SUBSCRIPTIONS_TABLE` | Superseded |
| `HBC_MY_PROJECTS_PROJECTION_DELTA_STATE_TABLE` | Superseded |
| `HBC_MY_PROJECTS_PROJECTION_LEASES_TABLE` | Superseded |
| `HBC_MY_PROJECTS_PROJECTION_RUNS_TABLE` | Superseded |

## 4. Required Config Refactor Outcome

The local agent must make active projection configuration validation compatible with the new SharePoint MVP posture. Projection mode may not fail startup solely because a superseded Table/Service Bus setting is absent.

## 5. Validation Guidance

- Disabled-mode configuration may remain permissive.
- Projection-enabled configuration must validate all active MVP settings.
- Secret-bearing settings may be presence-validated but never echoed.
- Documentation and code must agree.
