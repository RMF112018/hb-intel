# Runbook 03 | Post-Permission Live Validation

## Objective

Validate the live Graph capabilities that were intentionally gated until Microsoft Graph **Application `Sites.Read.All`** is granted.

This runbook should be executed after admin consent is confirmed.

---

# 1. Confirm Permission Grant

## Portal path

```text
Microsoft Entra admin center
→ App registrations
→ HB SharePoint Creator
→ API permissions
```

Confirm:

| API | Type | Permission | Status |
|---|---|---|---|
| Microsoft Graph | Application | `Sites.Read.All` | Granted for tenant |

Do not proceed if admin consent is still pending.

---

# 2. Deploy Backend Build Containing Subscription + Delta Code

Use the normal GitHub Actions / deployment process for `functions/backend`.

Post-deploy check:

```text
Function App
→ Overview
→ Functions
```

Confirm the new function routes/triggers expected by the implementation appear.

---

# 3. Seed Delta Checkpoints Using `token=latest`

Run the admin or CLI validation path produced by the implementation to initialize delta state for:

- Projects list
- Legacy Project Fallback Registry list

Expected result:

- Table `MyProjectsProjectionDeltaState` has one ready/checkpointed entity per source list.
- Each entity contains a non-empty delta link.
- Telemetry emits delta-seed success events.

---

# 4. Create Live Graph Subscriptions

Use the implementation's operator endpoint or CLI, not an ad hoc Postman request, so the live system state is persisted correctly.

Expected result:

- Table `MyProjectsProjectionSubscriptions` has one subscription entity per source list.
- Each record contains:
  - `SubscriptionId`
  - `ResourcePath`
  - `ExpirationDateTimeUtc`
  - status = active/ready equivalent.
- App Insights emits subscription-create success events.

---

# 5. Validate Notification URL Handshake

During subscription creation, Graph must validate the webhook endpoint.

Expected evidence:

- Validation token route handles the request.
- App Insights records a validation-request event.
- Subscription creation succeeds.

Failure interpretation:

| Symptom | Likely cause |
|---|---|
| 403 Graph create failure | permission/app role issue |
| validation URL timeout/failure | webhook route/public URL issue |
| subscription create succeeds but no state row | persistence bug |

---

# 6. Perform Live Source-Change Validation

Execute a controlled low-risk source change in a testable list row or operator-approved test item.

Preferred sequence:
1. Change a Projects row field that affects a projected value or role assignment.
2. Wait within the freshness target window.
3. Confirm Graph notification arrival telemetry.
4. Confirm Service Bus queue work is consumed.
5. Confirm delta pull finds changed item.
6. Confirm affected projection rows are updated.
7. Confirm My Projects backend read reflects the new projected state.

Repeat for:
- Legacy Registry row change.

---

# 7. Validate Delete Tombstone / Deactivation Behavior

Use a test fixture or operator-approved controlled record path. If live deletion is not acceptable in production source lists, validate this in a lower environment or through mocked/live-adjacent integration only.

Required proof:
- Delta client handles deleted tombstone shape.
- Projection slice engine soft-deactivates obsolete helper rows or recomputes counterpart source slice as designed.

---

# 8. Validate Subscription Renewal Timer

Do not wait nearly 30 days. Use an operator-triggered renewal command or temporarily force a near-expiry fixture/state in a safe environment if supported by the implementation.

Required proof:
- Renewal calls Graph successfully.
- Table state updates expiration timestamp.
- Renewal success telemetry emitted.

---

# 9. Acceptance Exit Criteria

All must be true before projection read cutover is considered live-validated:

- `Sites.Read.All` granted.
- Delta checkpoints seeded for both lists.
- Graph subscriptions created for both lists.
- Notification handshake succeeds.
- Queue wake-up flow succeeds.
- Delta worker processes a live change.
- Projection rows update within target 1–5 minute freshness.
- App Insights telemetry shows no critical pipeline failures.
