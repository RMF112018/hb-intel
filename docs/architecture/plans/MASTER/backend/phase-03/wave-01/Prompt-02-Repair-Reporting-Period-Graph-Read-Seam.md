# Prompt-02-Repair-Reporting-Period-Graph-Read-Seam

## Objective

Repair the live blocker on the Safety ingestion path by fixing the reporting-period read seam under the deployed Graph identity and binding model.

The failure to close is:

> `Fetch item 1 from Safety Reporting Periods failed (401).`

Do not treat this as a generic backend bug.
Do not assume the old REST repository explanation is still correct.
Start from current `main` repo truth.

## Governing authorities

- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`
- `backend/functions/src/utils/validate-config.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

And current Microsoft Graph guidance for list item GET/create/update and Selected permissions.

## Exact seams to inspect

- `getReportingPeriod()` in the graph repository
- `spItemIdFromString(...)` usage and any ID parsing assumptions
- route request parsing for `context.reportingPeriodId`
- frontend/backend contract expectations for reporting-period identity
- graph site/list/item resolution path
- managed identity token acquisition path
- any telemetry emitted on graph failure classification

## Required work

1. Instrument the failing seam so the backend logs, at safe detail level:
   - outbound identity lane
   - target site URL / resolved site ID
   - target list ID
   - requested reporting-period identifier
   - parsed numeric item ID
   - graph operation name
   - graph path summary
   - HTTP status
   - graph error code if present
2. Determine whether the failure is:
   - wrong identity / grant
   - wrong site binding
   - wrong list binding
   - wrong item identifier contract
   - or a combination
3. Fix the code/config/contract as needed.
4. Make the resulting diagnostics strong enough that future 401/403/404 incidents are self-classifying.

## Required implementation outcome

- `POST /api/safety-records/ingest` no longer fails at reporting-period fetch for a valid workbook payload and valid reporting period selection.
- The identifier contract for reporting period is explicit and enforced.

## Proof of closure required

- before/after evidence
- exact cause identified
- exact files changed
- exact live or test proof showing reporting-period read succeeds
- exact statement of the canonical reporting-period ID contract after the fix

## Prohibitions

- no unrelated route/UI work except the minimal contract changes required by this seam
- no fallback hacks that preserve ambiguity
- no silent coercion without explicit diagnostics
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
