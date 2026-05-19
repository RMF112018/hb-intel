# 07 | Seed, Rebuild, Cutover, and Rollback Plan

## 1. Objective

Define the controlled migration sequence from the current live-read legacy path to the SharePoint-backed projected read path.

## 2. Governing Cutover Principle

The My Projects module must not be cut over to projection mode until:

- storage lists are provisioned and verified;
- runtime repositories and timers are implemented;
- seed and baseline delta initialization succeed;
- Graph subscription/webhook/delta validation succeeds;
- parity evidence against the legacy path is acceptable;
- failure ledgers are clean enough for operator acceptance.

## 3. Preflight Gates

### Gate A — Repo and configuration readiness

- code builds/tests;
- active MVP config no longer requires Service Bus/Table;
- SharePoint storage env settings exist;
- read mode remains `legacy`.

### Gate B — Provisioning readiness

- all seven lists provisioned;
- verifier passes;
- permission inheritance/operator governance complete;
- seed/control state rows created where required.

### Gate C — Runtime sync readiness

- subscriptions created and healthy;
- webhook validation succeeds;
- Pending Work rows can be created;
- timer worker processes work;
- delta checkpoint writes succeed;
- resync/failure behavior tested.

## 4. Initial Seed

### Required steps

1. Acquire global rebuild lease.
2. Start Run row:
   - `RunType=seed`.
3. Load Projects + Legacy Registry source data.
4. Use existing domain reconciliation logic.
5. Generate per-user Registry projections.
6. Upsert Registry rows.
7. Soft-deactivate obsolete active rows when appropriate.
8. Initialize Graph delta baseline with `token=latest`.
9. Persist Source Sync State.
10. Complete Run row.
11. Release rebuild lease.

## 5. Parity Validation

Before cutover, run parity comparisons between:

- legacy provider output;
- projection-backed provider output.

### Required dimensions

- row count;
- project number/name/stage;
- role mapping;
- source/provenance semantics;
- SharePoint launch state;
- Procore/other action state;
- summary counts;
- warnings;
- zero-match behavior.

Use existing parity harness where available, then extend it only if the redirection introduces additional needed cases.

## 6. Cutover

### Target config change

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection
```

### Required cutover checks

- deploy/readiness gates completed;
- no open provisioning blockers;
- no source lane in `NeedsResync=true`;
- subscriptions healthy;
- pending-work backlog normal;
- parity accepted.

## 7. Post-Cutover Monitoring

Monitor:

- Registry read failures;
- source-unavailable envelopes;
- projection freshness lag;
- `data.diagnostics.projectionMaxLastProjectedAtUtc` freshness drift versus expected delta cadence;
- `data.diagnostics.projectionSourceSyncHealth` (`healthy` / `needs-resync` / `uninitialized` / `unknown`);
- Pending Work backlog depth/age;
- Runs failures;
- Sync Failures open count;
- subscription expiry risk;
- NeedsResync flags.

### Read-path contract reminders

- Projection mode reads persisted `My Projects Registry` rows only.
- A projection read failure returns `sourceStatus='source-unavailable'` (no request-time fallback to legacy).
- Rollback remains an explicit operator config change:
  - `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy`

## 8. Rollback

### Closed rollback action

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
```

### Rollback rules

- do not delete SharePoint projection storage;
- do not reset subscriptions/delta automatically;
- do not suppress failure diagnostics;
- record rollback time, reason, and operator;
- after rollback, investigate/fix projection path before re-cutover.

## 9. Manual Rebuild

### Use cases

- delta invalidation;
- drift repair;
- first-time seed;
- operator recovery after projection mismatch;
- re-baseline after major source-list schema/content changes.

### Required controls

- admin route and/or CLI only;
- explicit run type;
- Run row created;
- Control State lease enforced;
- no silent rebuild triggered by ordinary page load.

## 10. Acceptance Criteria

- cutover is reversible in one explicit config action;
- projection mode is validated before exposure;
- no live request-time fallback masks projection errors;
- rollback procedure is documented and executable;
- repair/resync procedures exist for the top operational failures.
