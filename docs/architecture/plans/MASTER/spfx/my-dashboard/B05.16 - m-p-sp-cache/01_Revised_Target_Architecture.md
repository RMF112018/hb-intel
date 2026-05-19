# 01 | Revised Target Architecture

## 1. Objective

Define the final target architecture for the **HB Intel > My Dashboard > My Projects** projection subsystem after redirecting the active MVP storage/control plane to SharePoint lists on the MyDashboard site.

## 2. Architecture Summary

### Final MVP Model

```text
Source lists in HB Central
  ├─ Projects
  └─ Legacy Project Fallback Registry

Microsoft Graph
  ├─ list change subscriptions
  ├─ validation-token handshake
  └─ delta reads

Azure Functions
  ├─ webhook receiver
  ├─ subscription manager / renewal timer
  ├─ pending-work processor timer
  ├─ delta sync and projection recompute
  ├─ seed/rebuild/admin routes and CLI
  └─ My Work read-model API

MyDashboard SharePoint lists
  ├─ My Projects Registry
  ├─ Source Sync State
  ├─ Subscription State
  ├─ Pending Work
  ├─ Control State
  ├─ Runs
  └─ Sync Failures

My Dashboard SPFx UI
  └─ reads backend API envelopes only
```

## 3. System-of-Record Boundaries

| Data | Source of truth | MyDashboard role |
|---|---|---|
| Project assignment source fields | HB Central source lists | Read and project only |
| Legacy fallback registry values | HB Central legacy fallback registry | Read and project only |
| User-facing My Projects read model | Derived by backend | Stored in My Projects Registry |
| Sync/subscription/run/failure state | HB Intel runtime control plane | Stored in MyDashboard support lists |
| Frontend rendered values | Backend read-model envelope | No direct SharePoint list access |

## 4. Runtime Read Path

### After projection cutover

```text
Browser
→ My Dashboard backend route: GET /api/my-work/me/project-links
→ authenticate actor / normalize UPN
→ read My Projects Registry where UserUpn = actor and IsActive = true
→ map stored rows back into existing read-model DTO
→ return envelope to SPFx
```

### Explicitly prohibited on routine page load

- live re-read of Projects source list;
- live re-read of Legacy Project Fallback Registry;
- ad hoc seed/rebuild;
- direct frontend SharePoint list reads;
- request-time fallback to the legacy aggregator when projection mode is active.

## 5. Event-Driven Freshness Path

```text
Source list update
→ Microsoft Graph list subscription webhook
→ webhook validates token/clientState
→ webhook classifies source list kind
→ webhook upserts Pending Work row by deterministic WorkKey
→ fast 202/accepted response
→ timer worker claims due Pending Work
→ worker loads Source Sync State delta checkpoint
→ Graph delta drains changed/deleted items
→ projection slice engine recomputes affected rows
→ Registry rows upsert/deactivate
→ delta checkpoint advances only after successful write
→ Runs, Failures, telemetry update
```

## 6. Reconciliation and Repair Path

### Nightly audit

- read source state;
- compute expected projection;
- compare against active Registry rows;
- write Run record and telemetry;
- do not mutate Registry.

### Weekly repair

- disabled by default;
- may be enabled after 14 clean production days;
- upserts missing/mismatched rows;
- soft-deactivates extra rows;
- writes Runs and Failures as required.

### Manual repair

- admin endpoint and CLI remain;
- supports:
  - seed;
  - full rebuild;
  - source-scoped rebuild;
  - status inspection;
  - optional dry-run preview where existing repo patterns support it.

## 7. Graph Subscription Decisions

| Topic | Decision |
|---|---|
| Monitored lists | Projects + Legacy Project Fallback Registry |
| Subscription change type | `updated` |
| Create lifetime | 27 days |
| Renew threshold | Remaining lifetime < 7 days |
| Renewal cadence | Daily timer |
| Missing subscription | Record failure; attempt controlled create |
| Expiring subscription | Renew and update Subscription State |
| Notification trust | Exact clientState match; invalid notifications never enqueue work |

## 8. Delta Sync Decisions

| Topic | Decision |
|---|---|
| Delta checkpoint store | Source Sync State SharePoint list |
| Initial baseline | `token=latest` after seed/rebuild |
| Next pages | Follow all `@odata.nextLink` pages to final `@odata.deltaLink` |
| 410 Gone / invalid token | `NeedsResync=true`; do not overwrite last-known-good Registry rows; require controlled resync |
| Checkpoint advancement | Only after successful projection write |
| Deleted items | Apply deletion-aware projection rules; do not assume deleted source can be re-fetched |

## 9. Pending Work Replaces Service Bus

### Design

Service Bus was technically sound but no longer the active MVP target. The revised implementation uses SharePoint as a low-cost, operator-visible work-intent store.

| Property | Closed value |
|---|---|
| Debounce bucket | 60 seconds |
| Worker cadence | every 1 minute |
| Claim lease | 10 minutes |
| Max attempts | 5 |
| Dead-letter | terminal row state + Sync Failure row |
| Duplicate notification handling | WorkKey upsert; no duplicate work row |

### Active configuration posture

Pending Work processing is controlled by active MVP settings:

- `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_ENABLED`
- `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_PROCESSOR_TIMER_SCHEDULE`
- `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_MAX_ATTEMPTS`
- `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_CLAIM_LEASE_MINUTES`

Retention is controlled by:

- `HBC_MY_PROJECTS_PROJECTION_REGISTRY_INACTIVE_RETENTION_DAYS`
- `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_SUCCESS_RETENTION_DAYS`
- `HBC_MY_PROJECTS_PROJECTION_PENDING_WORK_FAILURE_RETENTION_DAYS`
- `HBC_MY_PROJECTS_PROJECTION_RUN_RETENTION_DAYS`
- `HBC_MY_PROJECTS_PROJECTION_RESOLVED_FAILURE_RETENTION_DAYS`

`HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL`,
`HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN`, queue settings, and projection
table-name settings are superseded from active MVP readiness and may remain only
as quarantined compatibility seams during staged transition.

## 10. Storage Lists

The architecture requires seven lists:

1. `My Projects Registry`
2. `My Projects Projection Source Sync State`
3. `My Projects Projection Subscription State`
4. `My Projects Projection Pending Work`
5. `My Projects Projection Control State`
6. `My Projects Projection Runs`
7. `My Projects Projection Sync Failures`

Exact field contracts are defined in:

- `03_SharePoint_List_Schemas_And_Field_Contracts.md`
- `resources/My_Projects_SharePoint_Storage_Schema.json`

## 11. Public/Operator Routes

### Preserve

- `GET /api/my-work/me/project-links`

### Existing admin concepts to retain/redesign against SharePoint persistence

- seed;
- rebuild;
- subscription reconcile/reset/status;
- run status;
- repair controls.

The local agent must inventory current repo route paths and preserve existing externally consumed route semantics wherever possible. Route renames require explicit contradiction/evidence and are not implied by this package.

## 12. Storage Abstraction

Required repositories:

- `IMyProjectsRegistryRepository`
- `ISourceSyncStateRepository`
- `ISubscriptionStateRepository`
- `IPendingWorkRepository`
- `IControlStateRepository`
- `IProjectionRunRepository`
- `ISyncFailureRepository`

SharePoint-backed implementations are the active MVP target. Future Azure-native implementations may be reintroduced behind these interfaces without changing:

- public API envelopes;
- UI data models;
- projection domain logic;
- source-list interpretation logic.

## 13. Degradation and Rollback

| Failure | Final behavior |
|---|---|
| Registry read failure in projection mode | Return typed `source-unavailable` envelope; no live fallback |
| Missing Registry rows | Return empty/zero-match projection; repair via sync/audit/rebuild |
| Pending Work backlog | Telemetry + operator diagnostics; do not silently bypass queue semantics |
| Delta invalidation | Set `NeedsResync=true`; failure ledger; block incremental lane until repair |
| Subscription failure | Failure ledger + renewal/reconcile path |
| Need to revert architecture at runtime | Set read mode to `legacy`; do not improvise hidden fallbacks |

## 14. Outcome

The final architecture is lower-cost than the prior active Azure Table/Service Bus target, operationally visible to MyDashboard operators, and still migration-ready.
