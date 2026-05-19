# 00 | Closed Decision Register

## Purpose

This register converts all open architecture and implementation questions into **closed decisions** for the My Projects incremental projection program.

---

## 1. Product and Runtime Decisions

| Decision | Locked answer | Rationale |
|---|---|---|
| Runtime read path | Backend-mediated helper-list read | Preserves existing authenticated read-model posture and avoids exposing user-project assignment rows directly to SPFx. |
| Frontend changes | Preserve existing envelope and card semantics | My Projects UI should not need a fundamental rework to benefit from the backend projection refactor. |
| Summary counts | Compute from helper rows at read time | Keeps summary values current without storing separate summary rows. |
| Freshness tolerance | 1–5 minutes | Supports 60-second queue debounce and resilient asynchronous sync without user-visible operational lag in normal use. |

---

## 2. Projection Storage Decisions

| Decision | Locked answer |
|---|---|
| Host site | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` |
| List title | `My Projects Registry` |
| Hidden status | Not hidden |
| Access model | Unique permissions; operator/system-facing; not general-site-user readable |
| Projection grain | One row per `Normalized UserUpn × RecordKey` |
| Record key posture | `projects:{ProjectsListItemId}` or `legacy:{LegacyRegistryItemId}` |
| Obsolete rows | Soft-deactivate |
| Inactive retention | 90 days |
| Purge | Monthly purge job deletes rows inactive for more than 90 days |
| History warehouse | None in MVP; use inactive rows + run records + telemetry |

---

## 3. Azure Infrastructure Decisions

| Decision | Locked answer |
|---|---|
| Queue technology | Azure Service Bus |
| Service Bus tier | Standard |
| Queue name | `my-projects-projection-sync` |
| Duplicate detection | Enabled |
| Duplicate window | 10 minutes |
| Queue message TTL | 7 days |
| DLQ | Native Service Bus DLQ; monitor, do not auto-delete |
| Max delivery count | 10 |
| Debounce interval | 60 seconds |
| Azure auth | Managed identity |
| Runtime Azure principal | Existing Function App UAMI |
| Queue SDK | Add `@azure/service-bus` for explicit sender/recovery flows |
| Trigger pattern | Azure Functions Service Bus queue trigger |
| Operational state store | Dedicated Azure Table Storage account |
| State-store auth | Managed identity + `Storage Table Data Contributor` |
| Host storage reuse | Do not use as preferred projection state store |

---

## 4. Graph and Change-Tracking Decisions

| Decision | Locked answer |
|---|---|
| Notification technology | Microsoft Graph change notifications for SharePoint lists |
| Source resources | HBCentral Projects list and HBCentral Legacy Project Fallback Registry list |
| Subscription changeType | `updated` |
| Changed-item retrieval | `listItem/delta` |
| Delta baseline | Seed full projection first, then acquire `token=latest` checkpoint |
| Delta deletion behavior | Treat tombstones as source deletions and recompute/deactivate affected helper slices |
| Delta 410 handling | Persist resync-required state, schedule controlled resync, do not advance invalid token |
| Subscription create/renew lifetime | 27 days |
| Renewal threshold | Renew if less than 7 days remain |
| Renewal timer | Daily |
| Notification endpoint | Anonymous Graph webhook endpoint with validation-token support and client-state validation |
| Webhook processing | Validate → durable queue send → return `202 Accepted` |

---

## 5. Identity and Permissions Decisions

| Decision | Locked answer |
|---|---|
| Graph token provider | Reuse federated Graph provider: UAMI assertion → HB SharePoint Creator app token |
| Current repo Graph provider | `backend/functions/src/services/legacy-fallback/federated-graph-token-provider.ts` |
| Graph permission gate | `Sites.Read.All` Application pending admin grant |
| Existing permission | `Sites.ReadWrite.All` available; may cover delta, but does not remove subscription-validation gate |
| Azure Service Bus RBAC | UAMI receives `Azure Service Bus Data Sender` and `Azure Service Bus Data Receiver` |
| Azure Table RBAC | UAMI receives `Storage Table Data Contributor` |
| SharePoint helper list | Back-end app identity must retain app-only access through current HBCentral/My Dashboard site permission posture |
| Client state secret | Stored as secure Function App configuration for MVP, not in SharePoint |

---

## 6. Reconciliation and Repair Decisions

| Decision | Locked answer |
|---|---|
| Daily drift posture | Nightly read-only drift audit enabled |
| Weekly repair posture | Weekly automated repair timer implemented but disabled during first 14 days after cutover; then enable through documented production change |
| Manual rebuild controls | Backend admin endpoints + CLI/operator scripts in MVP; admin UI controls in staged post-cutover enhancement |
| Full rebuild behavior | Recompute full expected active projection set, upsert current rows, soft-deactivate obsolete rows |
| Legacy provider fallback | Retained only for parity testing and rollback configuration; not automatic runtime fallback after cutover |
| Projection content dedupe | Store content hash; skip SharePoint row updates when projected business payload is unchanged |

---

## 7. Cutover Decisions

| Decision | Locked answer |
|---|---|
| Migration mode | Build projection system in parallel with current legacy read path |
| Seed | Operator-triggered full seed before cutover |
| Parity | Selected-user plus aggregate parity evidence required |
| Cutover | Flip backend read-mode config to projection provider |
| Automatic rollback | No silent automatic rollback; operator may switch read mode back to legacy via config if needed |
| User-facing failure mode | If projection backend read fails after cutover, return typed backend/source unavailable envelope rather than rehydrating full source lists inline |

---

## 8. Decisions Explicitly Not Reopened in the Prompt Set

The local agent must not reopen:
- Service Bus vs Storage Queue
- Table Storage vs SharePoint/app settings for backend state
- direct SPFx read vs backend-mediated read
- hard-delete vs soft-deactivate for ordinary sync
- source tracking via notifications + delta
- My Projects Registry list title and host site
- summary-count computation from helper rows
- staged manual control surfaces
- App Insights-only MVP alerting

Any repo-truth incompatibility must be documented as a blocker, not used to quietly redesign the target architecture.
