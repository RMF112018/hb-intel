# HB Intel My Dashboard — Adobe Sign Backend Runtime Remediation Prompt Package

## Purpose

This package is a **post-B05 runtime remediation sequence** for the `apps/my-dashboard/` / My Work Adobe Sign integration. It is designed to close the remaining backend implementation gaps that are still visible in current repo truth after the B05 OAuth/configuration package:

1. production OAuth code-exchange logic is not yet wired,
2. durable OAuth state storage is still mock/test only,
3. durable grant and encrypted refresh-token persistence is still mock/test only,
4. production refresh-token exchange is not yet implemented,
5. production Adobe Sign search-client/provider composition is not yet wired into the protected My Work routes,
6. readiness semantics can still appear stronger than the actual production adapter posture.

This package is optimized for **Claude Code Opus 4.7** and follows the user’s required prompt-authoring discipline:
- targeted prompts,
- explicit repo-truth inspection lanes,
- closed decisions,
- concrete files/families likely to change,
- hard non-goals,
- exact validation expectations,
- commit/closeout reporting,
- and no unnecessary file re-reading when content is still in active context.

---

## Governing closed decisions

### OAuth/documentation decisions
- Keep the Adobe authorization link free of any `client_secret`.
- Use `client_secret` only in **server-side** authorization-code exchange and refresh-token exchange.
- Treat the Adobe commercial OAuth flow as:
  - authorization request: `/public/oauth/v2`
  - code exchange target: `/oauth/v2/token`
  - refresh target: `/oauth/v2/refresh`
- Adobe’s quickstart prose names `/oauth/v2/token`, while the inline HTTP example still displays `/oauth/token`. This package closes on the **v2 family** and requires tests/docs to record the discrepancy rather than silently drifting.

### HB architecture decisions
- This remediation does **not** broaden OAuth scope beyond:
  - `agreement_read:self`
- This remediation does **not** alter the locked route contract:
  - `POST /api/my-work/me/adobe-sign/oauth/start`
  - `GET  /api/my-work/adobe-sign/oauth/callback`
  - `GET  /api/my-work/me/home`
  - `GET  /api/my-work/me/adobe-sign/action-queue`
- Actor binding remains:
  - trusted tenant context + Entra `oid`
  - never UPN/email as a lookup key.
- App-only HB tokens remain ineligible for personal queue OAuth/reads.
- No Adobe token, refresh token, authorization code, callback query string, raw provider payload, or agreement-row content may leak into:
  - SPFx surfaces,
  - generic telemetry error-message paths,
  - evidence artifacts,
  - or logs.

### Production-store decision for this remediation
This package closes the production runtime path on:

```text
ADOBE_SIGN_TOKEN_STORE_MODE=table-storage
```

using the repo’s existing Azure Table utility seam for durable metadata/state, plus **application-level authenticated encryption** for refresh-token ciphertext before persistence.

Binding storage posture:
- Azure Table Storage stores:
  - one-time OAuth state records,
  - Adobe grant metadata,
  - opaque encrypted-refresh-token references / encrypted token payload metadata.
- Refresh-token plaintext is never persisted.
- Refresh-token ciphertext is generated using a backend-only encryption key supplied through environment/app settings, ideally resolved through an Azure Key Vault reference at deployment time.
- The existing `key-vault` token-store enum may remain as a future placeholder only if repo truth already requires it, but it must **not** report ready/live unless a real production adapter exists.

---

## Repo-truth basis already identified

The current backend codebase contains:
- registered OAuth start/callback routes:
  - `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts`
- an OAuth service seam whose production exchange path is still not wired:
  - `read-models/adobe-sign/adobe-sign-oauth-service.ts`
- mock/test-only production gates for durable state/grant persistence:
  - `adobe-sign-oauth-state-store.ts`
  - `adobe-sign-grant-store.ts`
- a refresh-client contract without production implementation:
  - `adobe-sign-refresh-client.ts`
- a token-service seam that expects a refresh client:
  - `adobe-sign-token-service.ts`
- a search-client contract without production implementation:
  - `adobe-sign-search-client.ts`
- an action-queue adapter that is implemented as a composition seam but not yet wired into route-provider composition:
  - `adobe-sign-action-queue-adapter.ts`
- protected My Work routes that still instantiate:
  - `new MyWorkMockReadModelProvider()`
  in:
  - `my-work-read-model-routes.ts`

The prompt sequence below is written to remediate those gaps without reopening the completed B05/B06 architecture.

---

## Prompt sequence

| Prompt | Purpose |
|---|---|
| `Prompt_01_Adobe_Sign_Backend_Runtime_Preflight_And_Drift_Audit.md` | Confirm current repo truth, identify any drift since package authoring, and produce the exact implementation map. |
| `Prompt_02_Implement_Durable_OAuth_State_Grant_And_Encrypted_Token_Storage.md` | Implement Table Storage-backed OAuth state, grant metadata, and encrypted refresh-token persistence; fix readiness semantics. |
| `Prompt_03_Implement_Live_OAuth_Code_Exchange_And_Callback_Grant_Persistence.md` | Implement live authorization-code exchange and update callback completion to persist a real grant/token reference safely. |
| `Prompt_04_Implement_Production_Refresh_Client_And_Token_Service_Runtime.md` | Implement live refresh-token exchange and token-service integration. |
| `Prompt_05_Implement_Live_Search_Client_Principal_Resolver_And_Read_Model_Composition.md` | Implement production search client, principal resolver, and replace mock-only backend route composition with governed live-provider composition. |
| `Prompt_06_Validate_Adobe_Backend_Runtime_Readiness_Security_And_Closeout.md` | Run end-to-end validation, security searches, docs/config alignment, and produce closeout. |

---

## Recommended execution order

Execute in exact order:

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04
5. Prompt 05
6. Prompt 06

Do not skip Prompt 01 unless the executing code agent already performed an equivalent fresh repo-truth verification in the same working session.

---

## Package-wide guardrails

Every prompt must preserve these guardrails:

1. **Do not re-read files that are still fully available in your current context or working memory** unless:
   - drift is suspected,
   - a prior step changed them,
   - or the prompt explicitly requires a fresh verification pass.

2. **Protect unrelated active work.**
   - Do not revert or overwrite unrelated WIP.
   - Use `git status --short` at prompt start and report unexpected operator-owned changes.

3. **Do not broaden runtime scope.**
   - No frontend UI redesign.
   - No webhook runtime.
   - No queue-data durable cache.
   - No broader Adobe scopes.
   - No account/group admin OAuth posture.
   - No shared Adobe principal fallback.

4. **Do not claim live readiness unless code and configuration are truthfully ready.**
   - Missing operator secrets/storage/App Settings remain explicit residual dependencies.
   - Do not fake end-to-end success with mock values.

5. **Do not leak secrets.**
   - No raw tokens or secrets in tests, docs, telemetry, snapshots, or sample logs.
   - Test fixtures must use clearly synthetic placeholders.

---

## Expected final outcome

After this sequence, the backend should have:

- a live authorization-code exchange adapter,
- durable one-time OAuth state persistence,
- durable per-actor grant metadata persistence,
- encrypted refresh-token storage,
- a live refresh-token exchange adapter,
- production token-service wiring,
- a live bounded Adobe search client,
- a live principal resolver,
- My Work route composition that can select the real backend provider when configured,
- safe fallback to governed source states when not configured,
- validation proving that the completed runtime does not leak secrets or reopen B05/B06 decisions.

---

## Suggested final commit theme

A clean single closeout commit, or a small set of logical commits, may use the general theme:

```text
feat(my-dashboard): complete Adobe Sign backend OAuth and live provider runtime
```
