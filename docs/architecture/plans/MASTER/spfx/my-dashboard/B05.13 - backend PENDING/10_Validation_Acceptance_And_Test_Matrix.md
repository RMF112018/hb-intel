# 10 | Validation, Acceptance, and Test Matrix

## Objective

Define the complete testing and acceptance program for implementation, migration, live validation, and cutover.

---

## 1. Test Layers

| Layer | Purpose |
|---|---|
| Unit tests | Validate pure logic and config parsing |
| Component/service tests | Validate repositories, mappers, state handling |
| Route tests | Validate webhook/admin/read route behavior |
| Fixture parity tests | Compare legacy projection semantics to new projection engine |
| Provisioning/verification scripts | Prove schema/resource readiness |
| Live smoke tests | Prove Graph/Azure/SharePoint runtime behavior |
| Cutover acceptance | Prove production read-mode transition is safe |

---

## 2. Unit Test Matrix

### 2.1 Config and setting resolver
Must test:
- required settings loaded,
- disabled mode behavior,
- invalid integers/durations rejected,
- invalid URLs rejected,
- invalid read mode rejected,
- missing client-state secret rejected in enabled production mode.

### 2.2 Webhook
Must test:
- validation token response exact body/content type,
- valid notification -> queue send -> 202,
- invalid clientState -> no queue send,
- queue send failure -> 5xx,
- malformed body -> 400 or appropriate rejection,
- multi-notification payload coalesces by source-list kind.

### 2.3 Queue message contract
Must test:
- deterministic debounce bucket,
- deterministic MessageId,
- source kind validation,
- no secret values in payload.

### 2.4 State repositories
Must test:
- subscription state upsert/read,
- delta state upsert/read,
- lease acquire succeeds when absent,
- lease conflict rejects second worker,
- lease expiry allows takeover,
- run record creation/completion update,
- optimistic concurrency handling.

### 2.5 Subscription manager
Must test:
- create missing subscription,
- renew subscription inside threshold,
- no-op when healthy,
- failure telemetry state,
- resource classification.

### 2.6 Delta client
Must test:
- initial `token=latest` checkpoint extraction,
- multiple `nextLink` pages,
- final `deltaLink`,
- changed/deleted item separation,
- 410 resync classification,
- failure does not advance state.

### 2.7 Projection engine
Must test:
- Projects-only generation,
- merged generation,
- legacy-only generation,
- role-array inclusion,
- Projects legacy fallback-role handling,
- Registry legacy-only inclusion statuses,
- action URL validation,
- stage precedence,
- warning preservation,
- source deletion transitions,
- merge topology transitions,
- hash no-op behavior,
- soft-deactivation behavior.

### 2.8 Registry mapper/repository
Must test:
- row-to-item reconstruction,
- item-to-row projection mapping,
- upsert create/update/reactivation,
- no-op update suppression,
- active query by UserUpn,
- query by source IDs,
- soft-deactivation patch shape.

### 2.9 Projection read provider
Must test:
- principal unresolved behavior,
- current user active rows only,
- summary counts identical to expected fixture,
- source/unavailable failure envelope,
- sorted item order.

---

## 3. Existing Regression Coverage to Preserve

The implementation must keep current tests passing for:
- My Projects frontend card/module behavior,
- My Work backend route registration,
- current provider behavior while in legacy mode,
- Graph list client and runtime diagnostics where touched,
- provisioning scripts convention tests where added.

---

## 4. Fixture Parity Requirements

### Required parity dimensions
For the same fixture source state:
- legacy provider items and projection provider items must match on:
  - `recordKey`
  - `source`
  - `projectName`
  - `projectNumber`
  - `projectStage`
  - `assignmentRoles`
  - `sharePointAction`
  - `procoreAction`
  - `buildingConnectedAction`
  - `documentCrunchAction`
  - warning codes
  - provenance fields where surfaced
- summary counts must match.

### Allowed differences
- `generatedAtUtc`
- internal projection batch metadata not exposed through existing envelope.

---

## 5. Provisioning and Readiness Validation

### 5.1 My Projects Registry schema
Scripts must prove:
- list exists,
- required fields exist,
- required field types are correct,
- indexed fields applied,
- ProjectionKey uniqueness enabled where script/tooling supports verification,
- wrong-type drift is surfaced as blocker.

### 5.2 Azure resource readiness
Operator checklist must confirm:
- Service Bus namespace exists,
- queue exists with correct settings,
- dedicated storage account exists,
- all four tables exist,
- UAMI RBAC assignments completed,
- Function App settings loaded.

---

## 6. Live Validation Sequence

## 6.1 Pre-permission live validation
Can validate:
- Azure resources provisioned,
- Service Bus connection works from deployed app if message-sending test route/script is provided,
- Table Storage repositories can write/read state,
- helper list provisioning/seed works,
- read provider in projection mode can be tested in non-prod or controlled route if seeded.

## 6.2 Post-`Sites.Read.All` live validation
Must validate:
1. Graph subscription create for Projects succeeds.
2. Graph subscription create for Legacy Registry succeeds.
3. Validation token handshake succeeds.
4. Subscription state rows persist.
5. Delta baseline `token=latest` persists for each source.
6. Controlled Projects edit triggers:
   - webhook notification,
   - queue message,
   - worker sync,
   - helper row change.
7. Controlled Registry edit triggers same.
8. Observed end-to-end propagation fits the 1–5 minute tolerance in normal conditions.

---

## 7. Cutover Acceptance Criteria

All must be true:

| Area | Acceptance |
|---|---|
| Infra | Service Bus + Table Storage + RBAC ready |
| Graph | Subscriptions live; delta state live |
| Projection | Seed success; helper rows active |
| Parity | Clean selected-user parity report |
| Runtime | Projection read route succeeds |
| No regression | Existing UI behavior preserved |
| Performance posture | Page-load route does not execute full source aggregation in projection mode |
| Telemetry | Core events observed in App Insights |
| Rollback | Legacy read mode rollback documented and tested/configured |

---

## 8. Migration Evidence Package

Implementation closeout should produce repo evidence docs for:
- schema verification output,
- seed run output,
- selected-user parity report,
- subscription creation output,
- delta baseline output,
- live source edit propagation result,
- cutover record,
- post-cutover monitoring snapshot.

---

## 9. Rollback Test

Before production cutover, confirm:
- setting read mode to `legacy` restores existing provider behavior,
- projection data remains intact,
- no destructive scripts are tied to rollback,
- subscriptions can remain running while read route is temporarily rolled back.

---

## 10. Definition of Done

The program is complete when:
1. The read path is cut over to projection mode.
2. The user-facing My Projects behavior remains correct.
3. The sync pipeline operates through subscriptions + delta + Service Bus.
4. Admin repair controls exist.
5. App Insights runbooks support operation.
6. The implementation package closeout contains full evidence.
