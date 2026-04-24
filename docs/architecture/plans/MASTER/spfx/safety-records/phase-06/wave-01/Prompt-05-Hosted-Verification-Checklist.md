# Prompt 05 Hosted Verification Checklist

Use this checklist only for seams that require a live SharePoint tenant and delegated Entra token context.

## Required inputs

- `FUNCTION_APP_HOST` (for example `hb-intel-function-app.azurewebsites.net`)
- `RESOURCE_GROUP`
- `FUNCTION_APP_NAME`
- `NON_ADMIN_TOKEN` (delegated user token without admin role)

## 1) Live parity evidence command

Run:

`pnpm exec tsx scripts/verify-functions-live-parity.ts --app-name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" --non-admin-token "$NON_ADMIN_TOKEN" --output /tmp/safety-live-parity.json`

Must pass:

- unauthenticated `POST /api/safety-records/ingest/preview` returns `401`
- non-admin bearer reaches preview/ingest/replay without auth rejection (`!= 401/404`)
- non-admin bearer is denied on `POST /api/safety-records/provision-sharepoint` (`403`)
- malformed preview bearer response includes `X-Request-Id`
- health/readiness/deploy-stamp parity checks remain green

## 2) Hosted smoke evidence command

Run:

`SMOKE_TEST_BASE_URL="https://$FUNCTION_APP_HOST" NON_ADMIN_AUTH_TOKEN="$NON_ADMIN_TOKEN" pnpm --filter @hbc/functions test -- src/test/smoke/post-deploy-smoke.test.ts`

Must pass:

- unauthenticated preview returns `401`
- non-admin delegated token can reach preview/ingest routes as permitted
- non-admin delegated token cannot call provisioning (`403`)
- safety route responses include `X-Request-Id`

## 3) Evidence bundle for closure

- `/tmp/safety-live-parity.json`
- smoke test output log
- exact commit SHA used for the run
- function app hostname and timestamp

If any hosted check is not run, Prompt 05 cannot be marked closed.
