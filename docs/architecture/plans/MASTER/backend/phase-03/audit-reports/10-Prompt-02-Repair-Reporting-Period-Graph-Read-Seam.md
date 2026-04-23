# Prompt-02 Closure — Repair Reporting-Period Graph Read Seam

Date: April 23, 2026  
Repo: `/Users/bobbyfetting/hb-intel`  
Branch: `main`  
Commit at execution start: `a6dba698`

## Exact cause identified

Primary cause: **reporting-period identifier contract ambiguity at backend ingress/repository seam**.

- Route ingress accepted `reportingPeriodId` but did not enforce canonical format (`period-{spItemId}`) nor strict companion-ID agreement.
- Repository `getReportingPeriod()` derived SharePoint item ID from string tail without seam-specific diagnostics.
- Result: 401/403/404 incidents lacked deterministic seam context to distinguish identity/grant vs binding vs contract causes.

## Canonical reporting-period ID contract (after fix)

- Required: `context.reportingPeriodId = period-{positiveInteger}`.
- Optional: `context.reportingPeriodSpItemId`.
- If companion is provided, it must exactly equal numeric tail of `reportingPeriodId`.
- Violations fail fast with explicit codes:
  - `SAFETY_REPORTING_PERIOD_ID_REQUIRED`
  - `SAFETY_REPORTING_PERIOD_ID_INVALID`
  - `SAFETY_REPORTING_PERIOD_SP_ITEM_ID_INVALID`
  - `SAFETY_REPORTING_PERIOD_ID_MISMATCH`

## Exact files changed

- `backend/functions/src/services/safety-reporting-period-contract.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`
- `backend/functions/src/services/safety-ingestion-failure-classifier.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `backend/functions/src/services/__tests__/safety-reporting-period-contract.test.ts`
- `backend/functions/src/services/__tests__/safety-ingestion-graph-repository.test.ts`
- `backend/functions/src/services/__tests__/safety-ingestion-graph-data-plane.test.ts`
- `backend/functions/src/services/__tests__/safety-ingestion-failure-classifier.test.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.test.ts`
- `backend/functions/README.md`
- `docs/reference/developer/verification-commands.md`
- `apps/safety/config/package-solution.json`

## Before evidence

Reported failing seam (live blocker from prompt):

> `Fetch item 1 from Safety Reporting Periods failed (401).`

Live probe at time of this run returned stale hosted route surface:

```bash
/tmp/run-safety-ingest-route.sh
# HTTP/1.1 404 Not Found
```

This confirms live environment drift from current source route surface, so post-fix live success cannot be proven until deployment parity is restored.

## After evidence (deterministic proof in current source)

### Commands executed

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test -- src/services/__tests__/safety-reporting-period-contract.test.ts
pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-repository.test.ts
pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-data-plane.test.ts
pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-failure-classifier.test.ts
pnpm --filter @hbc/functions test -- src/functions/adminApi/safety-record-keeping-routes.test.ts
```

### Proven outcomes

- Contract enforcement works and rejects malformed/mismatched IDs (`safety-reporting-period-contract.test.ts`).
- Repository reporting-period read uses deterministic numeric item ID and emits seam failure diagnostics with cause bucket (`safety-ingestion-graph-repository.test.ts`).
- Graph data-plane item-read failures emit self-classifying telemetry payload (`safety.ingestion.graph.get-item.failed`) including `statusCode`, `graphErrorCode`, `authLane` (`safety-ingestion-graph-data-plane.test.ts`).
- Failure classifier maps contract failures to explicit item-binding diagnostic code path (`safety-ingestion-failure-classifier.test.ts`).

## Reporting-period read seam diagnostics now emitted

- Start: `safety.ingestion.reporting-period.read.start`
- Success/miss: `safety.ingestion.reporting-period.read.result`
- Failure: `safety.ingestion.reporting-period.read.failed`

Failure event includes:

- `identityLane` (`managed-identity-app-only`)
- `siteUrl`, `siteId` (when resolved), `listId`
- `requestedReportingPeriodId`, `requestedReportingPeriodSpItemId`, `parsedItemId`
- `graphOperation`, `graphPathSummary`
- `statusCode`, `graphErrorCode`, `failureClass`
- `causeBucket` (`identity/grant`, `site-binding`, `list-binding`, `item-contract`, `item-missing`, `unknown`)

## Prompt-02 closure statement

- Reporting-period ID contract is now explicit and enforced at ingress.
- Repository Graph read seam no longer relies on ambiguous implicit coercion.
- 401/403/404 incidents are now self-classifying with deterministic seam diagnostics.
- Live success for this seam requires redeployment to remove current hosted-route drift; deterministic source-level proof is complete in this wave.
