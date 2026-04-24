# 00 — Backend Audit Summary

## Objective

Determine exactly what the `backend/functions/` Azure Functions application requires to become a production-ready, secure, observable, resilient, maintainable backend, with special emphasis on:

- Safety ingestion
- Graph-only cutover
- staging/test stabilization under existing broad Graph permissions
- pre-rollout permission tightening
- workbook parser-contract adoption

## Bottom line

The backend is **not production ready today**.

The strongest positive finding is that the Safety ingestion implementation on `main` is already substantially more Graph-native than the live failure narrative implies. The strongest negative finding is that the live operational evidence and the current source tree do not line up cleanly enough to trust deployment integrity without additional closure work.

## What is already strong enough to preserve

- Azure Functions Node v4 code-centric registration model
- centralized JWT validation and delegated-scope / role checks
- lazy identity-config resolution that avoids hard startup crashes
- Safety preview gate before commit
- Graph-based Safety ingestion repository with:
  - app-only Graph token acquisition
  - typed retry handling for 429 / 5xx
  - bounded-query protection
  - ETag / `If-Match` concurrency updates
- tiered config validation and readiness shaping
- structured route responses and request IDs

## What is directionally good but still insufficient

- Graph-only cutover intent
- managed identity posture
- health/readiness reporting
- preview/validation UX
- deployment automation
- safety rollout/readiness doctrine

## What is materially weak

- `SharePointService` still mixes control-plane provisioning seams, legacy PnP/SharePoint seams, and new Graph ingestion seams
- production deployment packaging is not yet trustworthy enough for a monorepo Flex Consumption backend
- health/readiness output is too revealing for an anonymous public endpoint
- parser authority is incomplete because preview still lets caller-supplied `inspectionDate` / `inspectionNumber` override parsed workbook values
- Graph-only cutover is incomplete at the broader service boundary even though the core Safety ingest path has largely moved

## Current blocker conclusion

The live `401` on reporting-period access is no longer best explained as “the ingestion route still uses SharePoint REST in the current source.” The current `main` branch instead points to one of these root-cause classes:

1. deployment/runtime drift versus source
2. Graph permission or site/list grant mismatch in the deployed environment
3. GUID/site/list binding drift
4. incomplete operational cutover despite code-path cutover
5. some combination of the above

That is a **narrow and tractable blocker**, but it also reveals a broader production-readiness weakness: the team still cannot fully trust that deployed behavior equals repo truth.

## Direction of record

The backend direction of record should be:

- **Graph-only application-facing data plane**
- broad Graph permissions temporarily acceptable in staging/test stabilization
- explicit permission-tightening and proof before rollout
- parse-first workbook authority for parser-critical values
- cleaner separation between:
  - control-plane provisioning services
  - Safety ingestion data plane
  - parser/preview/validation logic
  - deployment/release integrity

