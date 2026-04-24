# Prompt-01-Verify-Live-Artifact-Parity-And-Hosted-Route-Truth

## Objective

Prove whether the live Azure Functions host is actually running the graph-native Safety ingestion implementation that exists on current `main`.

This is not a general repo review.
This is not a “looks right in source” exercise.
This is a hard proof task against deployed reality.

## Governing authorities

- `backend/functions/README.md`
- `scripts/package-functions-artifact.ts`
- `backend/functions/src/functions/health/index.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`

Also use current official Azure Functions deployment guidance for the hosting plan in use.

## Repo seams to inspect

- `backend/functions/package.json`
- `backend/functions/src/index.ts`
- `backend/functions/src/hosts/admin-control-plane/**`
- `.github/workflows/main_hb-intel-function-app.yml`
- `scripts/package-functions-artifact.ts`
- health/readiness routes
- Safety ingest/preview/replay routes

## Required work

1. Confirm the current `main` branch code path for Safety ingest/preview/replay.
2. Confirm what artifact the packaging pipeline actually builds and how it proves runtime identity.
3. Confirm whether the live function host’s reported build version / SHA / timestamp match the intended artifact.
4. Confirm whether the deployed host route surface includes the graph-native Safety route signatures expected by current source.
5. Produce a concise evidence register that answers:
   - Is the deployed artifact current?
   - Is the deployed artifact graph-native on the Safety hot path?
   - Is there any evidence of stale or divergent deployment behavior?

## Required implementation outcome

- If drift or ambiguity exists, correct the deployment/release proof so operators can no longer mistake stale runtime for current source.
- If current proof is already sufficient, document the exact commands/evidence that establish parity.

## Proof of closure required

- exact repo files changed
- exact verification commands run
- exact health artifact output observed
- exact statement on whether live artifact parity is proven
- exact statement on whether current hosted Safety routes are graph-native

## Prohibitions

- no unrelated UI work
- no speculative refactors
- no “should be fine” language
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
