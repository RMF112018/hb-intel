# Prompt 05 — Reconcile Adobe OAuth User Initiation with the Live Frontend Runtime

## Objective

Reconcile the Adobe Sign OAuth user-initiation path with current repo truth so the frontend correctly exposes — or intentionally withholds — the user authorization action in a way that matches the implemented backend route contract.

## Why this exists now

The prior audit observed:

- backend OAuth routes now exist in repo truth:
  - `POST /api/my-work/me/adobe-sign/oauth/start`
  - `GET /api/my-work/adobe-sign/oauth/callback`
- current live repo frontend search did not show an obvious connected OAuth start-client path,
- the uploaded `.sppkg` artifact appeared to contain frontend OAuth initiation logic not found in the then-current repo source, suggesting artifact/source drift or partially integrated work.

After Prompts 00–04, the app will render truthful readiness states. Prompt 05 must ensure the **authorization-required** state has a coherent product action where the backend is ready for it.

## Required future state

Choose and implement the truthful state based on current source truth after Prompt 00:

### If OAuth start UI is intended to be live now
Implement or reconcile:
1. frontend typed client for:
   ```text
   POST /api/my-work/me/adobe-sign/oauth/start
   ```
2. CTA flow from `authorization-required` guidance to start route,
3. navigation to returned `authorizationUrl`,
4. handling of callback result query marker such as `adobeSignAuthorization=...` if the backend currently emits it,
5. safe loading/error UX that does not leak provider details.

### If OAuth start UI is intentionally deferred
Close all drift:
1. remove/avoid orphaned package-only or stale frontend OAuth initiation code,
2. ensure copy does not imply a user action that is not actually available,
3. document that authorization-required remains operator/admin-gated until the future prompt that activates user consent UX.

## Audit before implementation

Inspect current files for:
- OAuth frontend client code,
- CTA/button code,
- route clients,
- callback-result query parsing,
- source status copy.

Inspect current backend truth:
```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts
```

Inspect current frontend seams:
```text
apps/my-dashboard/src/modules/adobeSign/
apps/my-dashboard/src/api/
apps/my-dashboard/src/shell/
```

## Recommended closure

Unless repo truth or operator direction clearly indicates deferral, the recommended product closure is:

> Implement a secure, explicit user-facing “Connect Adobe Sign” action for `authorization-required` states that calls the existing protected start route and redirects to the returned Adobe authorization URL.

This aligns with the backend route already present and avoids making authenticated users dependent on an administrator for a user-specific delegated consent flow.

## Security rules

- Do not expose Adobe client secret in frontend.
- Do not construct Adobe authorization URLs in the browser if backend start route already returns the governed URL.
- Do not accept arbitrary return URLs from the browser outside the backend’s existing validated return-path contract.
- Do not create direct SPFx → Adobe OAuth or API calls.
- Use the existing backend start route and the current tokenized API client posture.

## Required tests

If UI authorization initiation is implemented:
1. authorization-required card shows CTA,
2. CTA calls typed start client,
3. returned `authorizationUrl` is used for navigation only after successful response,
4. failure produces safe, user-appropriate guidance,
5. no raw provider/body error leakage,
6. callback-result query marker is interpreted safely if implemented.

If UI authorization is deferred:
1. tests prove no misleading actionable CTA exists,
2. copy accurately explains the state,
3. orphaned package/source drift is closed.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

Run backend tests too if any shared contract or response shape is modified:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## Non-scope

- Do not alter backend OAuth state/security logic without a proven contract defect.
- Do not add provider scopes.
- Do not rework the grant-store implementation in this prompt.
- Do not bypass the existing backend start route.

## Completion standard

Prompt 05 is complete only when the product’s authorization-required UX is in parity with the backend OAuth route reality and there is no remaining package/source drift around Adobe OAuth initiation.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
