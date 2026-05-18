# Runbook 02 | Pre-Permission Implementation Work

## Objective

Define what can be implemented before Microsoft Graph **Application `Sites.Read.All`** is granted, and what must remain live-validation-gated until Monday or later.

---

# 1. Work That May Proceed Before Permission Grant

The local agent may fully implement and validate with mocked/fake Graph responses:

1. Configuration contracts and environment validation.
2. SharePoint `My Projects Registry` descriptor, provisioning script, and readiness verifier.
3. Azure Table repositories and entity contracts.
4. Service Bus message contract and enqueue adapter abstraction.
5. Webhook route shape and validation-token handling logic using route tests.
6. Subscription manager code using mocked Graph responses.
7. Delta client code using mocked Graph nextLink/deltaLink/delete tombstone scenarios.
8. Projection slice engine extracted from current repo truth semantics.
9. Full seed/rebuild algorithm and admin endpoint wiring.
10. Projection-backed read-model provider behind feature flag.
11. Parity harness that compares legacy aggregation output to projected output under fixtures.
12. App Insights telemetry event shapes and unit tests.
13. Docs, runbooks, operator scripts, and staged validation commands.

---

# 2. Work That Must Wait for Permission Grant

Do not claim live success for these until `Sites.Read.All` Application permission is admin-consented on the Graph-authorized app principal used by the backend federation lane:

1. Live Microsoft Graph list subscription creation.
2. Live Microsoft Graph subscription renewal.
3. Live `listItem/delta?token=latest` checkpoint seeding.
4. Live changed-item delta pulls from Projects / Legacy Registry.
5. End-to-end Graph notification → queue → delta → projection sync validation.

---

# 3. Required Test Substitutions During Pre-Permission Window

## 3.1 Graph subscription tests
Use deterministic mock responses for:
- successful `201 Created`,
- permission failure `403`,
- webhook validation failure passthrough, if surfaced,
- renewal success,
- renewal failure,
- expired subscription recovery path.

## 3.2 Delta tests
Use deterministic fixture sequences for:
- initial `token=latest`,
- single-page delta with one changed item,
- multi-page delta via `@odata.nextLink`,
- final `@odata.deltaLink`,
- delete tombstone,
- `410 Gone` resync-required case.

## 3.3 Queue tests
Use adapter fakes for:
- enqueue success,
- duplicate notification path,
- enqueue failure causing HTTP 5xx rather than false acknowledgment,
- worker message parse failure,
- max delivery / dead-letter posture documented in runbooks.

---

# 4. What the Agent Should Produce Before Monday

A production-ready branch/commit series may include all implementation except the final live Graph proof.

Required closeout language:

```text
Implementation complete subject to post-permission live Graph validation.
Not yet proven live:
- create subscriptions
- renew subscriptions
- delta seed checkpoint acquisition
- delta pull from live HBCentral source lists
```

---

# 5. Pre-Permission Done Criteria

- All unit/contract/route tests pass.
- `pnpm --filter @hbc/functions check-types` passes.
- `pnpm --filter @hbc/functions test` passes or scoped suites reported precisely.
- New schema/provision scripts support dry-run and `--apply` separation.
- No package step falsely asserts live Graph proof.
- Runbook 03 is ready to execute once permission lands.
