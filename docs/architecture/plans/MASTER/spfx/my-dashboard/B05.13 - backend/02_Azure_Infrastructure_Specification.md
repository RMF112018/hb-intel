# 02 | Azure Infrastructure Specification

## Objective

Define the exact Azure resources, tiers, settings, role assignments, and configuration posture required to support the My Projects incremental projection subsystem.

---

## 1. Confirmed Existing Infrastructure State

Based on operator portal inspection:

| Capability | Observed state |
|---|---|
| Service Bus namespace | None available for this backend flow |
| Service Bus queue | None |
| Azure Storage Queue | None in the reviewed storage account |
| Existing Function App UAMI | Present: `hb-intel-function-app-uami` |
| Existing storage access shown | UAMI has `Storage Blob Data Owner` on `hbintelb8f1` |
| Table/Queue data access shown | Not present in screenshot |
| Repo Service Bus dependency | Not currently present |
| Repo Azure Table SDK | Already present as `@azure/data-tables` |

### Implication

The implementation must **introduce new Azure queue infrastructure** and **explicitly configure Table Storage data access**. It must not assume that the Function App host storage account is already a suitable operational state store.

---

## 2. Target Azure Resource Topology

### 2.1 Service Bus

Create a **Service Bus Standard namespace**.

#### Target naming convention

Use:

```text
sb-hb-myprojects-projection-prod
```

If Azure rejects the namespace due to global uniqueness, use the fixed fallback:

```text
sb-hb-myprojects-projection-prod01
```

#### Tier

```text
Standard
```

#### Why Standard

The architecture requires:
- durable queue-based decoupling,
- native dead-letter handling,
- duplicate detection.

Duplicate detection is not supported in the Basic tier; Standard is the correct locked choice.

---

### 2.2 Service Bus queue

Create exactly one queue:

```text
my-projects-projection-sync
```

#### Queue configuration

| Setting | Value |
|---|---|
| Lock duration | `PT5M` |
| Max delivery count | `10` |
| Default message TTL | `P7D` |
| Dead-letter on message expiration | Enabled |
| Duplicate detection | Enabled |
| Duplicate detection history window | `PT10M` |
| Partitioning | Disabled |
| Sessions | Disabled |
| Express entities | Disabled |

### Rationale

- 5-minute lock allows worker execution without premature message redelivery during normal batch sync.
- 10 delivery attempts gives retries before DLQ.
- 7-day TTL prevents indefinite primary queue retention.
- DLQ preserves unprocessable work for operator inspection.
- Duplicate detection suppresses redundant debounce-window messages.

---

## 3. Operational State Storage

### 3.1 Create a dedicated storage account

Create a new general-purpose v2 storage account for operational state.

#### Target naming convention

Use:

```text
sthbmyprojopsprod
```

If Azure rejects due to global uniqueness, use:

```text
sthbmyprojopsprod01
```

#### Storage account settings

| Setting | Value |
|---|---|
| Kind | StorageV2 |
| Performance | Standard |
| Redundancy | LRS |
| Secure transfer | Enabled |
| Public blob access | Disabled |
| Minimum TLS | Current organization standard; do not weaken |
| Shared key access | Keep according to current enterprise posture; app access must use Entra/RBAC |
| Region | Same region as existing backend Function App |

### Rationale

The operational state store should be:
- separate from Function App host storage,
- low-cost,
- identity-authenticated,
- optimized for small durable state entities.

---

### 3.2 Azure Tables to create

Create these four tables:

| Table | Purpose |
|---|---|
| `MyProjectsProjectionSubscriptions` | Graph subscription records per source list |
| `MyProjectsProjectionDeltaState` | Delta checkpoints per source list |
| `MyProjectsProjectionLeases` | Worker/rebuild coarse locks |
| `MyProjectsProjectionRuns` | Seed, incremental sync, audit, rebuild, purge run records |

#### Optional future table — not MVP

Do **not** create a separate history table in MVP. The architecture uses:
- soft-deactivated helper rows,
- `MyProjectsProjectionRuns`,
- App Insights telemetry.

---

## 4. Managed Identity and RBAC

### 4.1 Runtime Azure identity

Use the existing Function App user-assigned managed identity:

```text
hb-intel-function-app-uami
```

This identity is responsible for:
- sending Service Bus messages,
- receiving Service Bus messages through the Function trigger,
- reading/writing Azure Table state.

### 4.2 Service Bus RBAC

Assign to the UAMI at the queue scope when practical, namespace scope if the portal/operational process requires:

| Role | Required |
|---|---|
| `Azure Service Bus Data Sender` | Yes |
| `Azure Service Bus Data Receiver` | Yes |

Do not use `Azure Service Bus Data Owner` unless role-scoping constraints make sender/receiver impossible. The package target is least privilege.

---

### 4.3 Table Storage RBAC

Assign to the UAMI:

```text
Storage Table Data Contributor
```

Scope:
- preferred: storage account if individual-table IAM is not operationally convenient,
- acceptable: table-level assignments after tables exist.

This role is required for:
- subscription state writes,
- delta checkpoint writes,
- lease state writes,
- run record writes.

---

## 5. Service Bus Connection Configuration

### 5.1 Azure Functions Service Bus trigger connection

Use an identity-based connection prefix:

```text
MyProjectsProjectionServiceBus
```

App settings:

```text
MyProjectsProjectionServiceBus__fullyQualifiedNamespace = <service-bus-namespace>.servicebus.windows.net
MyProjectsProjectionServiceBus__credential = managedidentity
MyProjectsProjectionServiceBus__clientId = <Function-App-UAMI-client-id>
```

Queue-trigger binding uses:

```ts
connection: 'MyProjectsProjectionServiceBus'
queueName: process.env.HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME
```

### 5.2 Sender-side SDK configuration

Add:

```text
@azure/service-bus
```

Use:
- namespace from `HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN`
- credential chain aligned to existing Azure-hosted managed identity posture

App setting:

```text
HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN = <service-bus-namespace>.servicebus.windows.net
```

---

## 6. Azure Table Configuration

App setting:

```text
HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL = https://<storage-account-name>.table.core.windows.net
```

The implementation should use:
- `TableClient`
- `DefaultAzureCredential` or a project-specific credential wrapper consistent with existing Azure identity posture
- table names from explicit configuration constants/defaults

Table-name app settings may be supported, but the locked default names are:

```text
MyProjectsProjectionSubscriptions
MyProjectsProjectionDeltaState
MyProjectsProjectionLeases
MyProjectsProjectionRuns
```

---

## 7. Backend App Settings Matrix — Azure-Service Portion

| Setting | Value / Example | Purpose |
|---|---|---|
| `HBC_MY_PROJECTS_PROJECTION_ENABLED` | `true` | Enables projection subsystem |
| `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE` | `legacy` during build; `projection` after cutover | Controls read provider |
| `HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME` | `my-projects-projection-sync` | Service Bus queue |
| `HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN` | `<namespace>.servicebus.windows.net` | SDK sender endpoint |
| `MyProjectsProjectionServiceBus__fullyQualifiedNamespace` | same as FQDN | Functions trigger identity connection |
| `MyProjectsProjectionServiceBus__credential` | `managedidentity` | User-assigned MI trigger |
| `MyProjectsProjectionServiceBus__clientId` | UAMI client ID | User-assigned MI trigger |
| `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL` | table endpoint URL | Azure Table state |
| `HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS` | `60` | Notification coalescing |
| `HBC_MY_PROJECTS_PROJECTION_INACTIVE_RETENTION_DAYS` | `90` | Helper-row retention |
| `HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED` | `false` at initial cutover | Stabilization posture |
| `HBC_MY_PROJECTS_PROJECTION_MONTHLY_PURGE_ENABLED` | `true` | Purge old inactive helper rows |

---

## 8. Infrastructure That Must Not Be Used

The following are explicitly rejected as the preferred target:

### 8.1 No Storage Queue as primary dispatch
Storage Queue is not the target because:
- no existing queue infrastructure is available,
- Service Bus offers better DLQ and duplicate-detection semantics for a production synchronization worker.

### 8.2 No SharePoint operational-state lists
Do not store:
- Graph subscription IDs,
- delta links,
- sync leases,
- queue pending state,
- retry counters
in SharePoint.

### 8.3 No Function host storage reuse as preferred state store
The current `hbintelb8f1` account is not adopted as the target operational state account. A dedicated storage account is the locked design.

---

## 9. Required Infrastructure Validation

Before code cutover:
1. Service Bus namespace exists.
2. Queue exists with required queue properties.
3. UAMI has Data Sender and Data Receiver.
4. Operational storage account exists.
5. Four tables exist.
6. UAMI has Storage Table Data Contributor.
7. Function App app settings are populated.
8. Deployment restart occurs after identity connection app settings are added.

---

## 10. Portal/IaC Posture

This package provides portal runbooks because the user requested explicit Azure portal check/setup guidance.  
The local agent may also add IaC artifacts if the repo already has an accepted Azure infrastructure convention, but it must not invent a new IaC stack without first revalidating repo truth.
