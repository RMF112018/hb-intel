# Prompt 02 — Implement Durable OAuth State, Grant, and Encrypted Token Storage

## Objective

Implement the production durability foundation required for Adobe Sign delegated OAuth in `my-dashboard`:

1. a durable OAuth state store,
2. a durable grant metadata store,
3. encrypted refresh-token persistence,
4. truthful readiness semantics that only report production-ready storage when a real adapter exists.

This prompt must close the remediation on:

```text
ADOBE_SIGN_TOKEN_STORE_MODE=table-storage
```

using repo-consistent Azure Table Storage utilities plus backend-only authenticated encryption for refresh-token ciphertext.

---

## Governing closed decisions

### Storage decision
- Use **Azure Table Storage** as the live durability substrate for:
  - OAuth state records,
  - grant metadata,
  - encrypted refresh-token payload/reference metadata.
- Use the existing repo Table client factory:
  - `backend/functions/src/utils/table-client-factory.ts`
- Do **not** add a second live adapter for `key-vault` in this patch.
- If the `key-vault` enum remains for future planning, it must not report as production-ready.

### Secret handling decision
- Never persist refresh-token plaintext.
- Persist only authenticated ciphertext and the metadata needed to decrypt it.
- Use a backend-only encryption key provided through environment/app settings, ideally deployed via Key Vault reference into the Function App setting.
- The encryption key value must never be logged, surfaced in readiness diagnostics, or copied into docs/examples.

### State-token posture
- Do not persist raw OAuth `state` values in Table Storage.
- Store and query by a deterministic cryptographic hash of the callback `state` value.
- Preserve single-use and TTL semantics.
- Preserve existing actor binding and safe return-path behavior.

---

## Repo-truth references to inspect

Read only what is necessary. Do not re-read files still fully available in current context unless drift is suspected or a prior step changed them.

### Required current seams
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts`
- `.../adobe-sign-oauth-state.ts`
- `.../adobe-sign-oauth-state-store.ts`
- `.../adobe-sign-grant-record.ts`
- `.../adobe-sign-grant-store.ts`
- `.../adobe-sign-refresh-client.ts`
- `.../adobe-sign-token-service.ts`

### Table-storage precedents
- `backend/functions/src/utils/table-client-factory.ts`
- Appropriate existing Table-backed stores under:
  - `backend/functions/src/services/admin-control-plane/`
  - `backend/functions/src/services/table-storage-service.ts`

### Tests to extend or add
- `adobe-sign-oauth-state-store.test.ts`
- `adobe-sign-grant-store.test.ts`
- `adobe-sign-config.test.ts`
- Add focused tests for any new cipher/token-persistence module.

---

## Implementation scope

Implement:

1. A production Table-backed OAuth state store.
2. A production Table-backed grant store.
3. A refresh-token encrypted-persistence boundary.
4. Updated resolver logic so production mode can become actually `ready` only when all required runtime settings exist.
5. Updated readiness logic preventing unsupported store modes from appearing ready.
6. Comprehensive unit tests covering normal path and failure path.

---

## Exact files or file families likely to change

Likely modify:
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts`
- `.../adobe-sign-oauth-state.ts`
- `.../adobe-sign-oauth-state-store.ts`
- `.../adobe-sign-grant-store.ts`
- `.../adobe-sign-grant-record.ts` only if the opaque refresh-token reference needs a narrowly compatible extension.

Likely add:
- `.../adobe-sign-refresh-token-crypto.ts`
- `.../adobe-sign-refresh-token-store.ts`
- `.../adobe-sign-table-oauth-state-store.ts`
- `.../adobe-sign-table-grant-store.ts`

Tests:
- matching `.test.ts` files for each added/changed runtime module.

Exact filenames may adapt to repo conventions, but the scope must remain narrow and feature-local.

---

## Required non-goals

Do not:
- implement OAuth code exchange in this prompt,
- implement refresh-token exchange in this prompt,
- implement the Adobe search client,
- wire route providers to live runtime yet,
- change frontend code,
- broaden Adobe scopes,
- add webhooks,
- add durable queue caching,
- create a Key Vault production adapter,
- change unrelated backend service patterns.

---

## Detailed execution steps

### Step 1 — Session preflight
Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Record unrelated operator-owned changes and avoid touching them.

### Step 2 — Reconcile current readiness mismatch
Inspect current readiness behavior and then implement truthful production readiness.

Required target behavior:
- `ADOBE_SIGN_TOKEN_STORE_MODE=pending-selection` → not ready.
- `ADOBE_SIGN_TOKEN_STORE_MODE=table-storage` → ready only when all required Table/encryption settings exist and live adapters resolve.
- `ADOBE_SIGN_TOKEN_STORE_MODE=key-vault` → **not ready** in this remediation unless a real adapter already exists in repo truth. Do not falsely mark it ready.

Add or refine readiness diagnostics so public outputs remain non-secret:
- key names may be surfaced,
- raw values may not.

### Step 3 — Durable OAuth state store
Implement a production state store using Table Storage.

Required behavior:
- `put(record)` stores a hashed state identifier, not the raw state value.
- `take(stateValue, now)` hashes the presented callback value before lookup.
- State must remain:
  - actor-bound,
  - return-path-bound,
  - expiry-bound,
  - consume-on-read,
  - replay-resistant.
- Expired or consumed rows must map to the existing normalized outcomes.
- Use optimistic/concurrency-safe update/delete behavior where practical to prevent double-consume races.

Do not store:
- raw `stateValue`,
- raw callback query strings,
- OAuth codes.

### Step 4 — Durable grant metadata store
Implement a Table Storage-backed grant store satisfying the existing interface.

Required behavior:
- key grants by existing actor key semantics:
  - trusted tenant + Entra `oid`
- preserve:
  - Adobe API access point,
  - Adobe web access point,
  - grant timestamps,
  - grant state,
  - granted scopes,
  - opaque encrypted-refresh-token reference,
  - failure metadata where already allowed.
- support:
  - upsert,
  - find,
  - mark reauthorization required,
  - mark revoked.

Do not:
- key by UPN/email,
- persist token plaintext,
- store raw Adobe provider bodies.

### Step 5 — Encrypted refresh-token persistence
Implement a narrow refresh-token encryption/persistence boundary.

Requirements:
- Use authenticated encryption, e.g. AES-256-GCM or an equivalent repo-approved authenticated cipher.
- Encryption key is provided through environment/app settings only.
- The ciphertext record should carry only non-secret metadata necessary for decrypting in the backend:
  - cipher version,
  - IV/nonce,
  - auth tag,
  - ciphertext,
  - timestamp metadata if useful.
- No plaintext token should survive beyond the narrow service boundary any longer than needed.
- Any diagnostics must be closed-enum / non-secret.

This boundary should allow Prompt 03 callback logic and Prompt 04 refresh logic to:
- store a newly issued refresh token,
- resolve and decrypt it only when the backend must refresh.

### Step 6 — Store resolvers
Update:
- `resolveAdobeSignOAuthStateStore(...)`
- `resolveAdobeSignGrantStore(...)`
and any new token-store resolver so they select live adapters under `table-storage` mode rather than returning perpetual `production-store-not-selected`.

Expected runtime behavior:
- test/mock mode still returns deterministic mocks.
- configured `table-storage` mode returns real adapters.
- missing `AZURE_TABLE_ENDPOINT` or encryption settings produce a governed configuration-required path, not a thrown secret leak.

### Step 7 — Tests
Add/extend unit tests for:
- hash-only OAuth state persistence,
- one-time state consumption,
- expiry handling,
- consumed-state handling,
- grant upsert/find/reauth/revoke,
- ciphertext round trip,
- no plaintext token serialized to persisted entity output,
- config readiness truth table,
- unsupported store-mode not reporting ready,
- mock/test mode preserved.

---

## Validation requirements

Run focused tests first, then broader package tests if the focused set passes.

Suggested commands:

```bash
pnpm --filter @hbc/functions test -- adobe-sign-config
pnpm --filter @hbc/functions test -- adobe-sign-oauth-state-store
pnpm --filter @hbc/functions test -- adobe-sign-grant-store
pnpm --filter @hbc/functions test -- adobe-sign-refresh-token
pnpm --filter @hbc/functions check-types
```

If package test invocation syntax differs, adapt to repo truth and report the exact commands used.

Also run targeted searches proving no plaintext persistence/logging path was introduced:

```bash
rg -n "refresh_token|client_secret|stateValue|authorizationCode" backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign
```

Explain which occurrences are expected contract code and which would be unacceptable storage/logging violations.

---

## Evidence requirements

No hosted evidence required. Provide:
- changed-file list,
- readiness truth table summary,
- test results,
- short note on storage entity design,
- short note on encryption boundary.

---

## Commit / closeout expectations

Create one logical commit if the working session permits commits.

Suggested commit title:

```text
feat(my-dashboard): add durable Adobe OAuth state and encrypted grant storage
```

Final response format:

```text
HB: Prompt 02 — Durable Adobe OAuth State, Grant, and Encrypted Token Storage

Verdict:
- PASS / FAIL

Branch / HEAD:
- Starting:
- Ending:

Implemented:
1. OAuth state store:
2. Grant metadata store:
3. Refresh-token encrypted storage:
4. Readiness semantics:
5. Unsupported store-mode behavior:

Files changed:
- ...

Validation:
- Command:
  Result:

Security checks:
- Raw OAuth state persisted? yes/no
- Refresh-token plaintext persisted? yes/no
- Unsupported store mode can report ready? yes/no

Residual operator requirements:
- ...

Suggested commit:
- ...
```

---

## Risks / guardrails

- A production store that reports ready without a real adapter is a correctness bug.
- Hashing OAuth state at rest is required for lower blast radius.
- Do not let encryption-key absence crash routes with raw stack messages; map to configuration-required.
- Do not embed environment examples containing real or realistic secrets.
