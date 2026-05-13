# Prompt 01 — Adobe Sign Backend Runtime Preflight and Drift Audit

## Objective

Conduct a fresh, read-only repo-truth verification for the `my-dashboard` Adobe Sign backend runtime before any remediation code is written. Confirm exactly which seams remain placeholder/mock-only, whether any remediation has already landed, and produce a precise implementation map for Prompts 02–06.

This prompt is **read-only**. Do not change files, install packages, run destructive commands, or create commits.

---

## Repo-truth references to inspect

Inspect only what is necessary. Do not re-read files that are still fully available in your current context or working memory unless drift is suspected or this prompt explicitly requires a fresh verification pass.

### Required runtime files
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-mock-read-model-provider.ts`

### Required Adobe Sign backend seams
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts`
- `.../adobe-sign-oauth-service.ts`
- `.../adobe-sign-oauth-state.ts`
- `.../adobe-sign-oauth-state-store.ts`
- `.../adobe-sign-grant-record.ts`
- `.../adobe-sign-grant-store.ts`
- `.../adobe-sign-refresh-client.ts`
- `.../adobe-sign-token-service.ts`
- `.../adobe-sign-search-client.ts`
- `.../adobe-sign-action-queue-adapter.ts`
- `.../adobe-sign-principal-resolution.ts`

### Existing test coverage to inspect
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.test.ts`
- `.../adobe-sign-oauth-state-store.test.ts`
- `.../adobe-sign-grant-store.test.ts`
- `.../adobe-sign-token-service.test.ts`
- `.../adobe-sign-search-client.test.ts`
- `.../adobe-sign-action-queue-adapter.test.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.test.ts`

### Supporting repo utilities/patterns
- `backend/functions/src/utils/table-client-factory.ts`
- Search for existing Azure Table-backed store patterns under:
  - `backend/functions/src/services/admin-control-plane/`
  - `backend/functions/src/services/table-storage-service.ts`

---

## Implementation scope

This prompt does **not** implement anything. It must:

1. Establish branch / HEAD / clean-working-tree status.
2. Verify whether each identified runtime seam is:
   - fully implemented,
   - partially implemented,
   - contract-only,
   - mock/test-only,
   - or not wired into production composition.
3. Verify the current live-state gap map for:
   - code exchange,
   - OAuth state durability,
   - grant persistence,
   - encrypted refresh-token persistence,
   - refresh flow,
   - search-client production HTTP implementation,
   - principal resolver implementation,
   - route provider composition.
4. Verify whether `my-work-read-model-routes.ts` still hard-wires `MyWorkMockReadModelProvider`.
5. Verify whether `resolveAdobeSignOAuthConfigReadiness(...)` can produce a `ready` status for a token-store mode that lacks a corresponding production adapter.
6. Produce a remediation plan mapped one-to-one to Prompts 02–06.

---

## Exact commands / checks to run

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Then use focused searches such as:

```bash
rg -n "service-not-wired|production-store-not-selected|MyWorkMockReadModelProvider|exchangeAuthorizationCode|resolveAdobeSignOAuthStateStore|resolveAdobeSignGrantStore|IAdobeSignRefreshClient|IAdobeSignSearchClient|createAdobeSignActionQueueAdapter|AdobeSignPrincipalResolutionResult" backend/functions/src
```

and:

```bash
rg -n "ADOBE_SIGN_TOKEN_STORE_MODE|table-storage|key-vault|pending-store-selection" backend/functions/src docs/architecture/plans/MASTER/spfx/my-dashboard
```

Do not over-search the repository beyond what is necessary to answer the targeted runtime questions.

---

## Required non-goals

Do not:
- modify code,
- modify docs,
- create a prompt package,
- refactor unrelated route code,
- install dependencies,
- run formatting,
- run tests unless a test file must be inspected by static reading,
- start implementing later-prompt scope.

---

## Detailed execution steps

### Step 1 — Session snapshot
Record:
- branch,
- HEAD,
- working-tree state,
- whether unrelated operator-owned changes are present.

### Step 2 — OAuth route truth
Confirm:
- the protected start route exists,
- the public callback route exists,
- the callback still depends on injected `oauthService.exchangeAuthorizationCode(...)`,
- the default production route deps still use a non-live placeholder or not.

### Step 3 — Durable storage truth
Confirm:
- whether OAuth state store is production-ready or mock/test-only,
- whether grant store is production-ready or mock/test-only,
- whether refresh-token material has any actual durable persistence implementation,
- whether any Table Storage adapter already exists for this feature.

### Step 4 — Token runtime truth
Confirm:
- whether `adobe-sign-refresh-client.ts` still has only a seam/mock,
- whether `adobe-sign-token-service.ts` is production-composable today,
- whether access-token refresh can actually succeed in a non-test runtime.

### Step 5 — Search/runtime provider truth
Confirm:
- whether `adobe-sign-search-client.ts` still has only a contract/mock,
- whether a principal resolver implementation exists beyond contract types,
- whether `adobe-sign-action-queue-adapter.ts` is production-wired,
- whether `my-work-read-model-routes.ts` still uses `MyWorkMockReadModelProvider`.

### Step 6 — Readiness-semantic truth
Confirm:
- whether `adobe-sign-config.ts` can classify `table-storage` or `key-vault` as `ready`,
- whether the downstream store resolvers actually support those modes,
- whether readiness output could overstate live backend capability.

### Step 7 — Prompt-sequence implementation map
Provide a concise map:
- Prompt 02 target files and exact gaps,
- Prompt 03 target files and exact gaps,
- Prompt 04 target files and exact gaps,
- Prompt 05 target files and exact gaps,
- Prompt 06 validation/closeout focus.

---

## Validation requirements

Validation for this prompt is documentation-quality only:

- Every finding must cite actual inspected path(s).
- Distinguish:
  - implementation absent,
  - implementation contract exists,
  - implementation exists but is not composition-wired,
  - implementation exists but remains configuration-gated.
- Avoid speculation.

---

## Evidence requirements

No generated evidence files are required. The prompt response itself is the evidence.

---

## Commit / closeout expectations

No commit.

Final response format:

```text
HB: Prompt 01 — Adobe Sign Backend Runtime Preflight and Drift Audit

Verdict:
- PASS / FAIL

Branch / HEAD:
- Branch:
- HEAD:
- Working tree:

Verified runtime gap map:
1. OAuth code exchange:
2. OAuth state store:
3. Grant store:
4. Refresh-token encrypted storage:
5. Refresh client:
6. Search client:
7. Principal resolver:
8. Protected read-model route composition:
9. Config/readiness semantic drift:

Prompt 02–06 implementation map:
- Prompt 02:
- Prompt 03:
- Prompt 04:
- Prompt 05:
- Prompt 06:

Files inspected:
- ...

Residual uncertainties:
- ...

No files modified.
```

---

## Risks / guardrails

- Do not infer live readiness from contracts alone.
- Do not mistake B05 prompt-package intent for actual production runtime.
- Do not assume `ADOBE_SIGN_TOKEN_STORE_MODE=table-storage` is implemented until verified.
- Do not treat mock stores as acceptable production runtime.
