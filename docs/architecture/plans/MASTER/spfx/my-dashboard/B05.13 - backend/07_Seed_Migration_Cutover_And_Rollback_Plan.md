# 07 | Seed, Migration, Cutover, and Rollback Plan

## Objective

Define the precise migration sequence that gets the production system from current page-load aggregation to projection-backed reads without losing functional parity or creating an uncontrolled cutover.

---

## 1. Migration Strategy

### Use a parallel-build / controlled-cutover approach

The projection pipeline is introduced while the legacy My Projects read path remains active.

```text
Build projection subsystem
→ provision infrastructure
→ seed helper list
→ validate parity
→ enable Graph subscriptions and delta
→ cut over read route
→ monitor
→ enable later repair automation
```

---

## 2. Stages

## Stage 0 — Preconditions

### Must be known/confirmed
- Azure Services currently absent:
  - no Service Bus infrastructure,
  - no reusable queue.
- Target Azure resources will be newly provisioned.
- `Sites.Read.All` application permission is pending grant.
- `Sites.ReadWrite.All` exists today.
- My Projects Registry list target is fixed.

### Work allowed before `Sites.Read.All`
- all code implementation,
- all Azure resource provisioning,
- all SharePoint helper-list provisioning,
- seed/rebuild code,
- parity harnesses,
- mocked subscription/delta tests,
- delta-read live smoke if permitted by available `Sites.ReadWrite.All`.

### Work blocked until `Sites.Read.All`
- final live Graph list subscription creation/validation,
- end-to-end webhook subscription activation,
- production-ready subscription renewal validation.

---

## 3. Stage 1 — Provision Azure Infrastructure

Provision:
1. Service Bus Standard namespace.
2. Service Bus queue.
3. Dedicated Azure Table Storage account.
4. Four operational state tables.
5. UAMI RBAC:
   - Service Bus Data Sender
   - Service Bus Data Receiver
   - Storage Table Data Contributor.
6. Function app settings.

Follow:
```text
runbooks/Runbook_01_Azure_Portal_Provisioning.md
```

---

## 4. Stage 2 — Provision SharePoint Helper List

Provision:
```text
My Dashboard site → My Projects Registry
```

Using the new repo-provided schema tooling:
- dry-run verify,
- apply create-only provisioning,
- post-verify.

The list must:
- contain all required fields,
- have required indexes/unique `ProjectionKey`,
- have unique permissions applied.

---

## 5. Stage 3 — Deploy Backend Code in Non-Cutover Mode

Deploy with:

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
```

Enable projection subsystem components as appropriate for testing, but do not switch runtime reads.

### Expected behavior
- User page remains backed by old provider.
- Projection admin routes, seed services, and validation tooling become available.
- No production page read depends on helper list yet.

---

## 6. Stage 4 — Initial Seed

### Recommended initial seed trigger
Use:
- backend admin endpoint, and
- CLI/operator wrapper.

### Seed process
1. Acquire rebuild lease.
2. Read full Projects source.
3. Read full Legacy Registry source.
4. Compute expected helper rows.
5. Upsert helper rows.
6. Record run.
7. Soft-deactivate any pre-existing stale rows if re-running.
8. Verify helper-list counts and sample rows.

### Seed should not yet depend on subscriptions
Seed is source-enumeration-based and can be built/tested before `Sites.Read.All` is granted.

---

## 7. Stage 5 — Parity Validation

## 7.1 Selected-user parity

Create a parity harness that compares:
- legacy provider output,
- projection provider output

for selected users.

### Required comparison
- item count,
- record keys,
- project number/name/stage,
- source classification,
- assignment roles,
- launch action states/kinds/hrefs,
- warning codes,
- summary counts.

### Suggested sample categories
- user with Projects-only items,
- user with merged items,
- user with legacy-only items if present,
- user with zero rows,
- user with partial/unavailable edge conditions where fixtures support it.

## 7.2 Aggregate projection consistency

Compare:
- expected total projection row count from seed computation,
- active rows in My Projects Registry,
- content-hash mismatches,
- duplicate ProjectionKey count must be zero.

---

## 8. Stage 6 — Post-Permission Graph Validation

After `Sites.Read.All` is granted:

1. Validate Graph subscription create live.
2. Validate webhook validation-token handshake.
3. Create subscriptions for both source lists.
4. Acquire/store delta baselines using `token=latest`.
5. Perform live source-list edit test:
   - edit one Projects source assignment or link field in a controlled record,
   - observe notification received,
   - observe queue message,
   - observe worker sync,
   - observe helper row update within 1–5 minutes.
6. Repeat with one Registry source edit if safe.

Follow:
```text
runbooks/Runbook_03_Post_Permission_Live_Validation.md
```

---

## 9. Stage 7 — Cut Over Runtime Read Path

Only after:
- seed succeeded,
- parity clean,
- subscriptions created,
- delta worker validated,
- app telemetry healthy.

Set:

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection
```

Restart/redeploy Function App as needed.

### Expected behavior
- `GET /api/my-work/me/project-links` reads helper rows only.
- Frontend UI remains unchanged.
- Source-list changes propagate asynchronously.

---

## 10. Stage 8 — Stabilization

### First 14 days after cutover
- Weekly automated repair remains disabled.
- Nightly read-only drift audit enabled.
- Operators review:
  - sync success/failure,
  - subscription health,
  - delta failures,
  - parity of live changed records when sampled,
  - dead-letter queue count.

### After 14 clean days
Enable:
```text
HBC_MY_PROJECTS_PROJECTION_WEEKLY_REPAIR_ENABLED=true
```

This is a documented post-cutover operational change, not a new architecture decision.

---

## 11. Rollback Plan

### Rollback trigger examples
- projection read provider returns incorrect data,
- helper list corruption,
- repeated sync failures with user-facing stale data,
- subscription failure not repairable quickly.

### Rollback action
1. Set:
   ```text
   HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
   ```
2. Restart/redeploy backend if required.
3. Leave:
   - helper list,
   - subscriptions,
   - delta state,
   - queue,
   - state tables
   intact unless they are actively harmful.
4. Diagnose projection subsystem offline.
5. Re-run seed/parity before reattempting cutover.

### No destructive rollback
Do not:
- delete helper list,
- delete subscriptions as an automatic first response,
- erase delta state without an operator-defined resync plan.

---

## 12. Manual Rebuild Controls

### MVP layer 1 — backend endpoints
- seed
- rebuild
- subscriptions reconcile
- drift audit
- purge inactive

### MVP layer 2 — CLI/operator scripts
- verify prerequisites
- trigger seed/rebuild
- inspect status
- emit machine-readable summaries

### Post-cutover layer 3 — admin UI
- staged after backend stability,
- prompt included in this package,
- not required for initial production cutover.

---

## 13. Acceptance Gates

### Cutover gate
All must pass:
- helper list provisioned,
- state storage available,
- Service Bus queue available,
- RBAC assigned,
- seed succeeded,
- selected-user parity clean,
- subscription/delta live tests clean,
- operator sign-off.

### Stabilization gate
Before enabling weekly repair:
- no unresolved DLQ backlog,
- no repeating delta-token failures,
- drift audit counts stable/zero or explained,
- no critical read provider regression.

---

## 14. Migration Evidence to Preserve

The code agent should create or update evidence docs containing:
- resource provisioning checklist,
- helper schema verification report,
- seed run summary,
- parity report,
- live subscription create result,
- delta checkpoint seed result,
- live source-edit propagation result,
- cutover configuration change record,
- rollback test or rollback readiness note.
