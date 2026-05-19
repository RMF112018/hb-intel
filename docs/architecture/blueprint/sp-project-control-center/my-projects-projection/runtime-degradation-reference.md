# My Projects Projection — Runtime Degradation Reference

> Classification: **Canonical Current-State** operator reference.
> Sprint: B05.13 backend, Prompt 11.
> Audience: operator triaging an incident or interpreting a partial subsystem outage.

## Principle

Every subsystem in the projection lane fails **honestly** — observable through structured telemetry events plus typed return envelopes — and never silently falls back. The locked decision (Doc 07 §9) is that rollback is an operator config change, never an automatic request-time switch.

If you see one of the failure events below, do NOT expect the subsystem to "self-heal" by reverting to a different code path. Operator action (config flip + restart, or upstream fix) is the recovery vector.

Every event name below is in the canonical inventory at
`backend/functions/src/services/my-projects-projection/telemetry/event-names.ts`
and queryable via the KQL pack
(`docs/architecture/plans/MASTER/spfx/my-dashboard/B05.13 - backend/resources/App_Insights_KQL_Query_Pack.md`).

---

## Projection-backed read provider

**Module:** `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-projection-provider.ts`

| Failure                                             | Envelope shape                                                                                                                                        | Telemetry event                                                             | Operator action                                                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Helper-list read throws (Graph 5xx, network, token) | `sourceStatus: 'source-unavailable'`, empty `items`, `diagnostics.classification = 'source-unavailable'`, `diagnostics.projectionMode = 'projection'` | `myProjectLinks.read.projection.failed` (with `stage` + `sanitizedMessage`) | Confirm the helper list is reachable; if persistent, flip `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy` and restart the Function App.         |
| Principal claim missing/invalid                     | `sourceStatus: 'principal-unresolved'`, empty items, `diagnostics.classification = 'principal-unresolved'`                                            | none (envelope itself is the signal)                                        | Investigate the auth claim flow; never a projection-side fix.                                                                                    |
| Zero active helper rows for the actor               | `sourceStatus: 'available'`, empty items, `diagnostics.classification = 'zero-match-available-sources'`                                               | `myProjectLinks.read.projection.load.result` with `projectionRowCount = 0`  | Distinguish via the rows-counter: zero matches is **not** an outage. If unexpected, check seed status (`projection-admin-cli --command=status`). |
| Source-sync health read fails                        | response still succeeds; diagnostics may include `projectionSourceSyncHealth = 'unknown'`                                                               | none (best-effort diagnostics lane)                                          | Treat as telemetry/diagnostics degradation only; inspect Source Sync State list readability and Graph auth lane.                                  |

**No automatic fallback to the legacy aggregation provider.** A failed projection read returns `source-unavailable`; the SPFx surface renders the corresponding empty/error state per its existing contract.

---

## Legacy aggregation read provider

**Module:** `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`

| Failure                                              | Envelope shape                                                                                                                 | Telemetry event                                                                         | Operator action                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Projects-source loader throws                        | `sourceStatus: 'source-unavailable'` or `'partial'` (depending on registry status), warnings include `projects-source-partial` | `projects-loader.failed` (with `stage` + `sanitizedMessage`)                            | Check Graph health for the HBCentral Projects list; check federated token issuer. |
| Registry-source loader throws                        | same shape with `legacy-registry-source-partial`                                                                               | `registry-loader.failed`                                                                | Check Graph health for the Legacy Project Fallback Registry list.                 |
| Either loader truncates at `MAX_SOURCE_ROWS = 25000` | warnings include `assignment-source-bounded`                                                                                   | `myProjectLinks.read.sources.result` with `projectsBounded` or `registryBounded = true` | Source list is approaching the bound; plan archival or paging.                    |
| Both loaders fail                                    | `sourceStatus: 'source-unavailable'`, empty items                                                                              | both loader-failed events                                                               | Likely tenant/auth outage; confirm the federated Graph token lane.                |

The legacy provider is the rollback target for the projection path; it has its own degradation modes that operators should recognize independently.

---

## Webhook ingress

**Module:** `backend/functions/src/services/my-projects-projection/webhook/projection-webhook-handler.ts`

| Failure                                   | Response                         | Telemetry event                                                                           | Operator action                                                                                                                                      |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validation handshake                      | 200 with decoded token           | `myProjectsProjection.notification.validation.request` + `.validation.success`            | None; this is the Graph subscription-create round trip.                                                                                              |
| Forged / wrong-`clientState` notification | 200 with empty body (no enqueue) | `myProjectsProjection.notification.clientState.invalid`                                   | Investigate notification source; do **not** rotate the client state without coordinated subscription teardown — would invalidate live subscriptions. |
| Pending-work persistence failure          | 503                              | `myProjectsProjection.notification.queue.failed` (with `failureCode` + `sanitizedReason`) | Check MyDashboard list write health/permissions for `Pending Work`; validate SharePoint identity lane.                                               |
| Duplicate within debounce window          | 200 (already enqueued)           | `myProjectsProjection.notification.duplicate.bucketed`                                    | Informational; debounce is working as designed.                                                                                                      |

Forged notifications never enqueue — eliminates a message-replay attack vector.

---

## Pending-work timer worker

**Module:** `backend/functions/src/functions/myProjectsProjectionPendingWorkProcessor/index.ts` (orchestrator) plus `backend/functions/src/services/my-projects-projection/delta/projection-sync-worker.ts` (delta/recompute core)

| Failure                                   | Worker outcome status                          | Telemetry event                                                                      | Operator action                                                                                                                                                           |
| ----------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pending row already claimed by another worker | row skipped (no process)                    | warning with `failureOutcome: already-claimed` (processor lane)                        | None; active lease is working. If rows stay claimed past lease window, inspect worker health and claim-expiry timestamps.                                                |
| No delta baseline                         | `resync-required-no-baseline`                  | `myProjectsProjection.worker.delta.resyncRequired` (`reason: no-baseline`)           | Run seed (`projection-admin-cli --command=seed`) to establish baseline.                                                                                                   |
| State flag marks resync required          | `resync-required-state-flag`                   | `.delta.resyncRequired` (`reason: state-flag`)                                       | Investigate why state was marked; usually follows a prior 410.                                                                                                            |
| Graph 410 Gone on delta                   | `resync-required-410`                          | `.delta.resyncRequired` (`reason: 410`)                                              | Run seed; the delta token is expired/invalid.                                                                                                                             |
| Other delta failure (5xx, token, network) | row transitions to `failed` / `dead-lettered` | `.delta.failure` (with `failureCode` + `sanitizedReason`) and pending-work failure upsert | Check Graph health; retry scheduling is automatic until max attempts (default 5), then row is dead-lettered and requires operator remediation.                          |
| Slice recompute write failure             | `completed` with `recomputeOutcome.ok = false` | `.projection.write.failure` (with `failureCode`, `partialCounts`, `sanitizedReason`) | Check helper-list writability (Graph rate-limits, schema drift). Delta checkpoint does NOT advance on recompute failure — the same delta page is retried on the next run. |
| Recompute write success                   | `completed`                                    | `.projection.write.success` (with row counts)                                        | Normal path.                                                                                                                                                              |

Slice recompute and delta checkpoint advance are atomic by intent: a write failure leaves the checkpoint where it was, so the next retry reprocesses the same delta page rather than skipping forward.

Service Bus sender and queue-trigger worker seams remain in the repo as quarantined compatibility artifacts, but they are intentionally inactive in the SharePoint MVP runtime composition.

---

## Subscription manager

**Module:** `backend/functions/src/services/my-projects-projection/subscriptions/projection-subscription-manager.ts`

| Failure                                  | Outcome                                                            | Telemetry event                                          | Operator action                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Sites.Read.All` missing on create (403) | `create.failure` outcome with `failureCode: 'graph-403-forbidden'` | `myProjectsProjection.subscription.create.failure`       | Confirm the permission is granted; see deployment-readiness-checklist §5.                        |
| Subscription create 401 (token)          | `create.failure` with `failureCode: 'graph-401-unauthorized'`      | same event with the 401 code                             | Check the federated Graph token issuer and UAMI identity binding.                                |
| Subscription create 4xx other            | `create.failure` with classified code                              | same event                                               | Investigate per failure code; events are sanitized.                                              |
| Renewal 410-gone                         | `health.missing` outcome on subsequent `ensureSubscription`        | `myProjectsProjection.subscription.health.missing`       | Subscription has lapsed beyond renewal window; manager will recreate on next renewal-timer tick. |
| Renewal near expiry                      | `health.nearingExpiry`                                             | `myProjectsProjection.subscription.health.nearingExpiry` | Informational; renewal timer fires within the threshold.                                         |

No retry storm — the manager surfaces failure and lets the renewal-timer schedule drive recovery cadence (default daily at 02:15 UTC).

---

## Seed / rebuild service

**Module:** `backend/functions/src/services/my-projects-projection/engine/projection-seed-service.ts`

| Failure                                           | `ISeedRunResult.status` | `failureCode`                                                | Operator action                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rebuild lease held by another operator/process    | `skipped`               | `rebuild-lease-active` (or `rebuild-lease-conflict` on race) | Wait; check `MyProjectsProjectionRuns` ledger to identify the in-flight run.                                                                                                          |
| `source-rebuild` request missing `sourceListKind` | `failed`                | `invalid-request`                                            | Fix the request body / CLI flags.                                                                                                                                                     |
| Source-load throw (Graph)                         | `failed`                | `rebuild-failed`                                             | Check Graph health; `partialCounts` in `ISeedRunResult` records work completed before the failure; same counts written to the run ledger via `ProjectionRunRepository.finalize(...)`. |
| Helper-list write throw                           | `failed`                | `rebuild-failed`                                             | Same as above; ledger preserves the failure trace.                                                                                                                                    |
| Success (with or without writes)                  | `succeeded`             | —                                                            | `counts` field carries inserted/updated/reactivated/deactivated/unchanged tallies.                                                                                                    |

The seed service does **not** currently emit `customEvents` (Doc 08 § 2.4 spec); evidence lives in the `MyProjectsProjectionRuns` Azure Table read via `projection-admin-cli --command=status`. Direct `customEvents` emission is deferred per `telemetry-evidence.md` § "Deferred".

---

## What the operator should NOT expect

- A failed projection read does **not** transparently re-route to the legacy aggregation provider. Cutover is operator-only.
- A failed slice recompute does **not** advance the delta checkpoint; the same delta page is processed again on the next message.
- A forged webhook notification does **not** enqueue a poison message; it is silently dropped after telemetry capture.
- A pending `Sites.Read.All` grant does **not** block deployment of the code — but it blocks live subscription create / renewal / delta operations; expect 403 telemetry on the first attempt if the grant is missing.

---

## Quick triage map

| Symptom                               | First place to look                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Users see "no projects" suddenly      | Read-mode setting (legacy vs projection), then loader/projection.failed events.                |
| Webhook spam not enqueueing           | `notification.clientState.invalid` count → mismatch is the cause.                              |
| Sync worker silent                    | Lease table — possibly stuck lease; `lease.skipped` events name the holder.                    |
| Helper list rows drifting from source | `worker.projection.write.failure` events; check delta-state markFailure rows.                  |
| Subscription expired                  | `subscription.health.missing` + `health.nearingExpiry`; check renewal-timer run history.       |
| Seed never completed                  | `My Projects Projection Runs` SharePoint list ledger via `projection-admin-cli --command=status --run-type=seed`. |

Subscription and delta checkpoint persistence note:
- Active MVP runtime persists Graph subscription health/status in SharePoint `Subscription State`.
- Active MVP runtime persists Graph delta checkpoint + `NeedsResync` in SharePoint `Source Sync State`.
- Azure Table subscription/delta repositories remain quarantined compatibility seams and are not part of enabled MVP composition.

---

## Related references

- `parity-evidence.md` — what projection-read output should match.
- `telemetry-evidence.md` — full event-name inventory grouped by subsystem.
- `deployment-readiness-checklist.md` — pre-deployment pre-flight items.
- `App_Insights_KQL_Query_Pack.md` — operator KQL queries for each subsystem.
