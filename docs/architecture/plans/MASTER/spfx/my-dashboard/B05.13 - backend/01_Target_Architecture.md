# 01 | Target Architecture

## Objective

Define the exact target architecture for replacing the current My Projects page-load aggregation pattern with a durable, event-driven, incrementally maintained projection subsystem.

---

## 1. Current State to Preserve and Replace

### Preserve

- The existing My Projects UI module and card semantics.
- The existing backend route:
  - `GET /api/my-work/me/project-links`
- The existing authenticated actor resolution from claims.
- The existing read-model envelope contract, including:
  - `mode`
  - `sourceStatus`
  - `readOnly`
  - `warnings`
  - `generatedAtUtc`
  - `data.summary`
  - `data.items`
  - `data.sourceReadiness`
  - `data.diagnostics`
- The existing My Projects business semantics:
  - Projects-first assignment inclusion
  - Registry merge by explicit match or number/year fallback
  - legacy-only row rules
  - launch action state generation
  - warning generation
  - sorting order

### Replace

The request-time dependency on:

```text
Projects full-list read
+
Legacy Project Fallback Registry full-list read
+
in-request reconciliation
```

---

## 2. End-State System Diagram

```text
                        ┌─────────────────────────────────────┐
                        │ HBCentral SharePoint site           │
                        │                                     │
                        │  Projects list                      │
                        │  Legacy Project Fallback Registry   │
                        └──────────────────┬──────────────────┘
                                           │
                                           │ Microsoft Graph list subscriptions
                                           ▼
                        ┌─────────────────────────────────────┐
                        │ Graph webhook endpoint              │
                        │ Function: projection notification   │
                        │                                     │
                        │ - validationToken response          │
                        │ - clientState verification          │
                        │ - queue send only                   │
                        └──────────────────┬──────────────────┘
                                           │
                                           │ Service Bus message
                                           ▼
                        ┌─────────────────────────────────────┐
                        │ Azure Service Bus Standard queue    │
                        │ my-projects-projection-sync         │
                        └──────────────────┬──────────────────┘
                                           │
                                           ▼
                        ┌─────────────────────────────────────┐
                        │ Delta sync worker                   │
                        │ Function: queue-triggered worker    │
                        │                                     │
                        │ - acquire source delta link         │
                        │ - drain listItem/delta pages        │
                        │ - classify changed/deleted items    │
                        │ - resolve affected projection slice │
                        └──────────────────┬──────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             ▼
    ┌───────────────────────────────┐          ┌───────────────────────────────┐
    │ Azure Table Storage           │          │ SharePoint MyDashboard site   │
    │ operational state             │          │ My Projects Registry list     │
    │                               │          │                               │
    │ subscriptions                 │          │ projected helper rows         │
    │ delta checkpoints             │          │ one row per UserUpn×RecordKey │
    │ leases                        │          │ active/inactive lifecycle     │
    │ runs                          │          │ precomputed launch actions    │
    └───────────────────────────────┘          └──────────────┬────────────────┘
                                                             │
                                                             ▼
                                       ┌─────────────────────────────────────┐
                                       │ Existing backend read route         │
                                       │ GET /api/my-work/me/project-links   │
                                       │                                     │
                                       │ - actor UPN from auth claims        │
                                       │ - query My Projects Registry        │
                                       │ - compute summary counts            │
                                       │ - return existing envelope          │
                                       └──────────────────┬──────────────────┘
                                                          │
                                                          ▼
                                       ┌─────────────────────────────────────┐
                                       │ Existing SPFx My Projects card      │
                                       │                                     │
                                       │ - same module API usage             │
                                       │ - same current-user envelope        │
                                       │ - faster/lower-cost backend read    │
                                       └─────────────────────────────────────┘
```

---

## 3. Trust and Identity Boundaries

### 3.1 End-user read boundary

```text
SPFx frontend
→ bearer-protected backend API
→ backend derives current user from validated auth claims
→ backend returns only current user's projection rows
```

The frontend must not receive a generic helper-list query capability.

### 3.2 Graph data plane boundary

Repo truth currently uses:

```text
Function App UAMI assertion
→ ClientAssertionCredential
→ HB SharePoint Creator app token
→ Microsoft Graph
```

The projection pipeline must reuse this provider, not invent a parallel Graph authorization lane.

### 3.3 Azure resource access boundary

The existing Function App UAMI remains the workload identity for Azure resource access:

- Service Bus queue send/receive
- Azure Table Storage state read/write

This is separate from the federated Graph authorization lane.

---

## 4. Source-of-Record Boundaries

### 4.1 Projects list

The Projects list remains the authoritative source for:
- current project master records,
- project metadata,
- project-stage source where present,
- canonical role assignments,
- current launch metadata such as project site URL and app deep-link tokens.

### 4.2 Legacy Project Fallback Registry

The Registry remains the authoritative supplemental source for:
- legacy folder continuity,
- legacy-only projects,
- merge metadata,
- fallback SharePoint folder URLs,
- transitional matching/provenance.

### 4.3 My Projects Registry

The new helper list is **not a system of record**. It is a **derived read projection** used to:
- accelerate runtime reads,
- make user-project launch data queryable by user,
- preserve existing behavior without page-load aggregation.

### 4.4 Azure Table Storage operational state

Azure Table Storage is not business data. It stores:
- synchronization state,
- subscription state,
- delta checkpoints,
- leases,
- run metadata.

---

## 5. Runtime Read Architecture

### 5.1 Route behavior after cutover

The existing route remains:

```text
GET /api/my-work/me/project-links
```

Post-cutover provider behavior:

```text
actorUpn = normalize(auth.claims.upn)

query My Projects Registry where:
  UserUpn == actorUpn
  IsActive == true

map rows to MyProjectLinkItem[]
sort items using current presentation/business ordering
compute summary counts from rows
return current MyProjectLinksReadModel envelope
```

### 5.2 No automatic full-source fallback

After cutover, if the helper list query fails:
- return a typed backend/source-unavailable envelope;
- do **not** perform the old full Projects + Registry aggregation in the live user request path.

Legacy aggregation remains available only through:
- rollback read-mode configuration,
- parity tooling,
- manual operator testing.

---

## 6. Notification and Incremental Sync Architecture

### 6.1 Graph subscription resources

Subscribe to:

```text
/sites/{site-id}/lists/{projects-list-id}
/sites/{site-id}/lists/{legacy-registry-list-id}
```

Use:
- `changeType = updated`
- webhook notification URL hosted by the Functions app
- fixed clientState secret from secure app configuration
- expiration set to 27 days

### 6.2 Notification handling

The webhook endpoint does only:

1. Subscription validation token handshake.
2. Notification body structural validation.
3. `clientState` verification.
4. Debounced Service Bus enqueue.
5. Fast response:
   - `200 text/plain` for validation token.
   - `202 Accepted` for persisted work.

### 6.3 Debounce logic

Use a 60-second debounce bucket:

```text
messageId =
  my-projects-projection:{sourceListKind}:{utc-minute-bucket}
```

Service Bus duplicate detection suppresses duplicate sends inside the 10-minute duplicate detection window.

### 6.4 Queue worker

Queue worker responsibilities:
- acquire source-list processing lease;
- load delta state row;
- call Graph `listItem/delta`;
- follow `@odata.nextLink` until final page;
- classify changed vs deleted items;
- recompute affected projection slices;
- write My Projects Registry updates;
- update delta checkpoint only after successful write completion;
- record run telemetry/state;
- release lease.

---

## 7. Subscription Renewal Architecture

### 7.1 Daily renewal timer

Run once daily.

For each source list:
- if subscription is healthy and expiry > 7 days away: no-op;
- if expiry <= 7 days away: renew to 27 days from current UTC;
- if renewal fails: record failure and emit App Insights event;
- if subscription missing/invalid: mark state as repair required.

### 7.2 Subscription repair

Admin endpoint and CLI pathway must support:
- recreate subscription,
- reset subscription state,
- reacquire delta token if required,
- emit operator evidence.

---

## 8. Seed, Rebuild, and Drift Architecture

### 8.1 Initial seed

Seed procedure:
1. Read full Projects and Registry source state.
2. Execute the same reconciliation/business rules used by projection engine.
3. Generate expected active helper rows.
4. Upsert helper rows.
5. Soft-deactivate obsolete active rows if reseeding after a partial run.
6. Record projection batch.
7. Acquire delta baselines using `token=latest` after successful seed.
8. Create Graph subscriptions after Graph subscription permission is live.

### 8.2 Full rebuild

Full rebuild uses the same algorithm as initial seed but is operator-invoked and idempotent.

### 8.3 Nightly drift detection

Nightly read-only drift audit:
- recompute expected projection footprint in memory,
- compare keys against active My Projects Registry rows,
- emit:
  - missing rows
  - extra active rows
  - mismatched content hashes
- do not mutate.

### 8.4 Weekly repair

Weekly repair timer:
- implemented in code,
- **disabled in production for first 14 days after cutover**,
- enabled only after stable telemetry,
- when enabled, repairs drift by:
  - upserting missing/mismatched rows,
  - soft-deactivating extra rows.

---

## 9. Helper Row Lifecycle

### 9.1 Normal active row

- `IsActive = true`
- `DeactivatedAtUtc = null`
- `DeactivationReason = null`

### 9.2 Obsolete row

Triggered by:
- source deletion,
- assignment removal,
- merge topology change,
- full rebuild mismatch.

Action:
- set `IsActive = false`
- stamp `DeactivatedAtUtc`
- stamp `DeactivationReason`
- retain for 90 days.

### 9.3 Monthly purge

Monthly maintenance job:
- delete rows where:
  - `IsActive = false`
  - `DeactivatedAtUtc < now - 90 days`

Purpose:
- retain limited recovery/audit context,
- avoid permanent helper-list growth.

---

## 10. Compatibility with Current My Projects Semantics

The projection engine must preserve these current provider rules:

### Projects-backed rows
- actor inclusion derives from Projects role arrays;
- Projects canonical role arrays take precedence;
- four legacy fallback role fields remain valid when canonical fields are absent.

### Registry merge
- explicit match by `MatchedProjectListItemId` first;
- fallback match by `ProjectNumber + LegacyYear` only when there is exactly one Projects candidate.

### Legacy-only rows
- Registry row must remain active;
- MatchStatus inclusion remains:
  - `matched`
  - `unmatched`
  - `review-required`

### Launch action generation
- SharePoint site/folder precedence unchanged;
- Procore token validation unchanged;
- BuildingConnected URL validation unchanged;
- Document Crunch URL validation unchanged.

---

## 11. Read-Mode Cutover Architecture

### 11.1 Read modes

Use an explicit backend configuration value:

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
```

or:

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection
```

### 11.2 Build phase

- keep `legacy`;
- implement projection infrastructure in parallel;
- seed and validate helper rows.

### 11.3 Cutover phase

- set `projection`;
- deploy/restart;
- monitor App Insights;
- retain rollback path to `legacy` only by explicit operator action.

---

## 12. Target Success Criteria

The architecture is considered successfully implemented when:

1. My Projects page-load route no longer reads full Projects + Registry lists in projection mode.
2. Current-user helper rows are returned through the same protected backend route.
3. Source-list changes are reflected in helper rows within 1–5 minutes under normal conditions.
4. Subscription renewal operates automatically.
5. Delta checkpoints persist durably.
6. Deletes and assignment removals deactivate only affected helper rows.
7. Full seed and rebuild controls exist.
8. Drift detection exists.
9. Telemetry is sufficient to operate the pipeline in App Insights.
10. Rollback to legacy read mode is possible without data loss.
