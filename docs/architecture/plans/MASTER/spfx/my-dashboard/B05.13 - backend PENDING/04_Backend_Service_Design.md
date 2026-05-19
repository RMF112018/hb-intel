# 04 | Backend Service Design

## Objective

Define the code architecture, functions, services, repositories, configuration surfaces, and compatibility strategy required to implement the projection subsystem inside the existing Azure Functions backend.

---

## 1. Design Principles

1. Reuse existing backend architecture and middleware patterns.
2. Reuse the current federated Graph token provider.
3. Preserve current My Projects domain semantics.
4. Keep source-list aggregation off the user page-load path after cutover.
5. Separate:
   - notification ingress,
   - queue dispatch,
   - delta sync,
   - projection recompute,
   - registry persistence,
   - read-model output.
6. Use dependency injection seams sufficient for unit tests and deterministic fixtures.
7. Keep tenant mutation operator-gated.

---

## 2. Proposed New Code Areas

### 2.1 Functions

Recommended file organization:

```text
backend/functions/src/functions/myProjectsProjectionWebhook/index.ts
backend/functions/src/functions/myProjectsProjectionSyncWorker/index.ts
backend/functions/src/functions/myProjectsProjectionSubscriptionRenewal/index.ts
backend/functions/src/functions/myProjectsProjectionDriftAudit/index.ts
backend/functions/src/functions/myProjectsProjectionInactivePurge/index.ts
backend/functions/src/functions/myProjectsProjectionAdmin/index.ts
```

### 2.2 Services

```text
backend/functions/src/services/my-projects-projection/
  projection-config.ts
  projection-types.ts
  projection-telemetry.ts
  projection-batch-id.ts
  projection-content-hash.ts

  graph-subscription-client.ts
  graph-list-delta-client.ts
  graph-projection-source-client.ts

  service-bus-projection-queue.ts

  state/
    subscription-state-repository.ts
    delta-state-repository.ts
    lease-repository.ts
    run-repository.ts

  registry/
    my-projects-registry-list-contract.ts
    my-projects-registry-repository.ts
    my-projects-registry-row-mapper.ts

  engine/
    projection-slice-engine.ts
    projection-source-normalizers.ts
    projection-row-builder.ts
    projection-deactivation-policy.ts
    projection-reconciliation-service.ts
    projection-seed-service.ts
    projection-drift-audit-service.ts
    projection-purge-service.ts
```

### 2.3 Existing My Work read-model files to update

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/
  my-project-links-read-model-provider.ts
  [new] my-project-links-projection-read-model-provider.ts
  [possibly new shared domain module]
  my-project-links-domain.ts
```

### 2.4 App models

Update or add typed contracts under the current models package as needed:

```text
packages/models/src/myWork/
  projection-related runtime enums and diagnostics
```

Do not change frontend card contracts unnecessarily.

---

## 3. Configuration Surface

### 3.1 New config resolver

Add:

```text
projection-config.ts
```

It must:
- read all settings,
- validate required posture,
- expose typed config,
- fail loudly for invalid production configuration,
- support disabled mode for local/tests.

### 3.2 Required settings

See `resources/Environment_Settings_Matrix.md`.

Core values include:
- projection enabled flag,
- read mode,
- My Dashboard site URL/list title,
- HBCentral source site URL,
- queue name,
- Service Bus FQDN,
- Azure Table account URL,
- webhook client state,
- subscription expiration days,
- renewal threshold days,
- debounce seconds,
- retention days,
- timer enablement flags.

---

## 4. Notification Webhook Function

### Route

```text
POST /api/webhooks/my-projects-projection/graph
```

### Auth level

```text
anonymous
```

Reason:
- Microsoft Graph webhook validation and notifications do not use your user auth middleware.
- Security is enforced through:
  - validation token handshake,
  - clientState verification,
  - safe payload validation.

### Behavior

#### Validation token request

If query contains `validationToken`:
- URL-decode it;
- return:
  - `200 OK`
  - `Content-Type: text/plain`
  - plain decoded token only.

#### Notification payload

If no validation token:
1. parse payload;
2. validate expected collection shape;
3. validate clientState on every applicable notification;
4. classify source list kind from subscription registry or resource;
5. enqueue debounced queue message;
6. record telemetry;
7. return `202 Accepted`.

### Disallowed behavior
- no delta pull inline;
- no SharePoint list reads inline;
- no token logging;
- no raw secret/clientState logging.

---

## 5. Service Bus Queue Sender

### Sender purpose

The webhook function uses a sender service:
```text
ServiceBusProjectionQueue
```

### Message ID

```text
my-projects-projection:{sourceListKind}:{utcDebounceBucket}
```

Where:
- `sourceListKind ∈ Projects | LegacyRegistry`
- `utcDebounceBucket` is UTC minute bucket rounded by `HBC_MY_PROJECTS_PROJECTION_DEBOUNCE_WINDOW_SECONDS`.

### Message body
Use the contract in:
```text
resources/Service_Bus_Message_Contract.json
```

### Delivery
- send one message per source-list bucket,
- rely on Service Bus duplicate detection for dedupe,
- record enqueue telemetry,
- if enqueue fails, webhook returns `5xx` so Microsoft Graph can retry notification delivery.

---

## 6. Queue-Triggered Sync Worker

### Trigger

Use Azure Functions Node model v4:

```ts
app.serviceBusQueue('myProjectsProjectionSyncWorker', {
  connection: 'MyProjectsProjectionServiceBus',
  queueName: process.env.HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME,
  handler: async (message, context) => { ... }
});
```

### Responsibilities

1. Validate message body and source-list kind.
2. Acquire source-list lease from Azure Table.
3. Load source delta state.
4. Drain delta pages.
5. Handle 410/token reset scenario.
6. Produce changed/deleted item ID sets.
7. Invoke projection reconciliation service.
8. Persist helper list updates.
9. Advance delta checkpoint.
10. Persist run state.
11. Emit telemetry.
12. Release lease.

### Lease behavior

- One active sync lease per source list.
- Lease TTL: 10 minutes.
- Worker seeing active non-expired lease:
  - records `coalesced/skipped` telemetry,
  - exits safely;
  - subsequent queued message or scheduled reconciliation will pick up pending work.

---

## 7. Graph Subscription Manager

### Functions/services

- `graph-subscription-client.ts`
- `subscription-state-repository.ts`
- daily timer function

### Source subscriptions

Manage exactly two subscriptions:
- Projects list,
- Legacy Registry list.

### Subscription create body

Conceptual:
```json
{
  "changeType": "updated",
  "notificationUrl": "<function webhook url>",
  "resource": "/sites/{siteId}/lists/{listId}",
  "expirationDateTime": "<utc now + 27 days>",
  "clientState": "<configured secret>"
}
```

### Timer behavior
For each source:
- create if missing;
- renew if within 7 days;
- record current expiration;
- record failures;
- never silently ignore failures.

---

## 8. Graph Delta Client

### Purpose

Retrieve only changed list items after initial checkpoint.

### Required capabilities
- initialize with `token=latest`,
- call existing stored delta link,
- follow next links,
- return:
  - changed item IDs + field payloads,
  - deleted item IDs,
  - final delta link,
- detect `410 Gone`,
- preserve failed state without overwriting valid prior state until a defined resync path succeeds.

### Selectivity
The delta client should request only fields required for projection recompute where Graph supports projection of fields.  
Do not pull arbitrary list columns without need.

---

## 9. Projection Source Client

The projection engine often needs to resolve related counterpart rows:

### If Projects changes
- fetch latest Projects source row;
- locate relevant Registry rows:
  - explicit match by matched Projects item ID,
  - fallback ProjectNumber + Year candidate set.

### If Registry changes
- fetch latest Registry source row;
- locate Projects counterpart by:
  - explicit matched Projects item ID,
  - fallback ProjectNumber + LegacyYear candidate set.

### Source client posture
Reuse or extend Graph list client patterns where appropriate, but avoid reintroducing page-load aggregation behavior.

---

## 10. Shared Domain Logic

### Required refactor

Extract current My Projects business rules from the existing full-aggregation provider into a shared, testable domain module.

Target shared functions include:
- UPN role parsing,
- SharePoint action construction,
- Procore action construction,
- BuildingConnected action construction,
- Document Crunch action construction,
- warning merging,
- project/registry merge classification,
- row-to-`MyProjectLinkItem` builders.

### Purpose
This prevents:
- drift between the legacy provider and projection engine,
- accidental logic changes at migration,
- parity failures.

---

## 11. Projection Registry Repository

### Responsibilities
- query active rows by `UserUpn`,
- query rows by `ProjectionKey`,
- query rows by `ProjectsListItemId`,
- query rows by `LegacyRegistryItemId`,
- upsert projected row,
- soft-deactivate obsolete row,
- purge inactive rows older than retention.

### Graph client usage
The repository should use Graph list access compatible with the existing federated token provider posture.

---

## 12. Projection-Backed Read Model Provider

### New provider

```text
MyProjectLinksProjectionReadModelProvider
```

### Behavior
- normalize actor UPN;
- if unresolved, preserve current principal-unresolved behavior;
- query `My Projects Registry` active rows for actor UPN;
- map to `MyProjectLinkItem[]`;
- compute summary counts from helper rows;
- build diagnostics;
- return existing envelope structure.

### Resolver
The existing My Work provider resolver selects:
- legacy aggregation provider when read mode is `legacy`;
- projection provider when read mode is `projection`.

---

## 13. Admin Control Functions

### MVP backend admin routes

All routes must reuse existing:
- `withAuth`
- delegated-scope checks where repo standard requires
- admin authorization middleware
- telemetry wrapper

Recommended endpoints:

```text
GET  /api/admin/my-projects-projection/status
POST /api/admin/my-projects-projection/seed
POST /api/admin/my-projects-projection/rebuild
POST /api/admin/my-projects-projection/subscriptions/reconcile
POST /api/admin/my-projects-projection/delta-sync
POST /api/admin/my-projects-projection/drift-audit
POST /api/admin/my-projects-projection/purge-inactive
```

### CLI/operator scripts

Create scripts that:
- verify prerequisites,
- provision/verify helper list,
- call or invoke seed/rebuild controls,
- print structured JSON summaries.

### Admin UI controls

Not part of initial cutover. Implement in staged prompt after backend stabilization.

---

## 14. Testing Strategy

### Unit
- config parser,
- queue message builder,
- webhook validation token behavior,
- clientState validation,
- subscription create/renew behavior,
- delta 410 handling,
- state repository ETag/concurrency behavior,
- projection slice engine,
- row mapper,
- read-model provider.

### Integration-style local tests
- fake Graph client,
- fake Service Bus queue sender,
- fake Azure Table repositories,
- deterministic seed/rebuild projection.

### Route tests
- webhook validation,
- admin endpoint auth,
- project-links route projection read mode.

### Regression
- existing My Projects current provider tests must remain passing,
- parity tests compare legacy vs projection for fixtures.

---

## 15. Explicit Non-Goals

This implementation does not:
- redesign the My Projects card UI,
- make the helper list user-editable,
- replace Projects or Registry source-of-record status,
- introduce direct frontend SharePoint helper-list reads,
- implement Teams/email alerting in MVP,
- add a full admin UI before backend cutover stability.
