# Runbook 04 | Seed, Cutover, and Rollback

## Objective

Move My Projects from legacy page-load aggregation to projection-backed reads through a staged, reversible production process.

---

# 1. Cutover Philosophy

This is a **parallel-build / controlled-cutover** migration.

Do not cut over the live route until:
- helper-list schema is verified,
- seed projection completes,
- parity evidence passes,
- Graph subscriptions and delta checkpoints are live-validated,
- queue processing is healthy.

---

# 2. Seed Sequence

## Step 1 — Keep read mode on legacy

Ensure:

```text
HBC_MY_PROJECTS_PROJECTION_ENABLED=true
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
```

The pipeline may be active while user reads remain legacy-backed.

## Step 2 — Run initial projection seed

Execute the implementation's admin endpoint or CLI script for a full rebuild/seed.

Expected result:
- `My Projects Registry` populated.
- `MyProjectsProjectionRuns` records the seed batch.
- Projection rows include the full current assigned-user / record-key projection set.

## Step 3 — Run parity harness

Compare:
- legacy aggregation output
- projection-backed output

across deterministic fixtures and selected live actor UPNs approved for validation.

## Step 4 — Inspect parity mismatches

No unresolved mismatches may remain for:
- row presence,
- source classification,
- project number/name/stage,
- assignment roles,
- action state/href values,
- warning semantics materially relied on by UI/ops.

---

# 3. Projection Read Cutover

## Step 1 — Freeze the cutover precheck

Confirm:
- live Graph validation complete,
- DLQ empty,
- delta state healthy,
- no active repair/rebuild job running,
- seed parity accepted.

## Step 2 — Change read mode

Set:

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection
```

Save and restart/recycle the Function App if required by platform behavior.

## Step 3 — Validate application behavior

Check:
- My Dashboard loads normally.
- My Projects card loads with the same UI behavior.
- backend route remains `GET /api/my-work/me/project-links`.
- response envelope shape remains compatible.
- summary counts remain correct and are recomputed from helper rows.

## Step 4 — Validate performance posture

Confirm page-load My Projects backend telemetry no longer shows:
- full Projects list load duration,
- full Legacy Registry load duration,
- request-path reconciliation duration.

Instead it should show:
- projection helper-list read duration,
- rows returned,
- projection freshness diagnostics.

---

# 4. Rollback Procedure

## When to rollback

Rollback if any of the following occurs during cutover monitoring:
- helper-list reads return incorrect rows,
- material parity defect is found,
- projection read route creates user-visible errors,
- freshness failure exceeds accepted 1–5 minute tolerance materially,
- pipeline defect threatens correctness.

## Rollback action

Set:

```text
HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy
```

Save environment settings and restart/recycle if needed.

## Rollback does not require
- deleting the helper list,
- deleting queue infrastructure,
- deleting Table state,
- deleting Graph subscriptions.

The projection pipeline may continue to run for observation unless a defect in the writer requires disabling it separately.

---

# 5. Optional Pipeline Disable

If sync pipeline itself is causing issues, additionally set:

```text
HBC_MY_PROJECTS_PROJECTION_ENABLED=false
```

This should stop queue-driven sync behavior while preserving read fallback to legacy if read mode is set accordingly.

---

# 6. Cutover Monitoring Window

Recommended minimum:
- first 2 business days: active monitoring of App Insights, Service Bus queue, DLQ, delta state.
- first 14 days: nightly drift audit remains read-only; weekly automated repair stays disabled.

---

# 7. Post-Cutover Exit Criteria

- No rollback required during monitoring window.
- Projection reads stable.
- Queue/DLQ stable.
- Subscription renewals healthy.
- Freshness target respected in observed controlled changes.
- App Insights telemetry provides sufficient operational evidence.
