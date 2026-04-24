# 02 — Research-Backed Assessment

## Framing

This assessment used:
- current repo truth on `main` / `c621aee82bc9ec0dc0434225726b83a632ace5c7`
- current official Azure Functions guidance
- current official Microsoft Graph guidance
- current official managed identity guidance
- the uploaded workbook as implementation evidence
- the user-provided live-route behavior as operational evidence

## A. Azure Functions runtime / structure

### What is strong enough to preserve
- The backend uses the Node v4 programming model on `@azure/functions`, which is the current supported direction for code-centric function registration.
- `package.json.main` and `host.json` are set up consistently with the v4 model.
- Route registration is explicit and code-based instead of depending on scattered `function.json` files.

### What is usable but insufficient
- The repo has the right building blocks for scoped hosts, but the deployed/package surface still appears broader than the Safety objective requires.
- The monolithic entrypoint remains a maintenance and blast-radius concern even with proof checks.

### What is weak or risky
- Flex Consumption supports one-deploy, not classic zip deploy. The repo’s packaging and deployment proof are thoughtful, but release operators still need an explicit proof that the current pipeline maps correctly to the hosting plan and is not relying on stale deployment assumptions.
- The host timeout is set to 10 minutes. That is not automatically wrong, but long-running HTTP flows should still be minimized and pushed toward fast preview + bounded commit semantics.

### Correction direction
- Preserve the v4 structure.
- Tighten release proof around the exact hosting-plan deployment semantics.
- Further isolate the Safety/admin control-plane artifact from unrelated monolithic route families where practical.

## B. Identity, auth, and secret posture

### What is strong enough to preserve
- Managed identity is the intended production auth model.
- `DefaultAzureCredential` is already used.
- The code and docs correctly emphasize `AZURE_CLIENT_ID` for user-assigned identity selection.
- No client secret is required in steady-state production.

### What is usable but insufficient
- Local dev and production auth posture are documented, but production readiness needs stronger proof that the deployed identity is the exact one holding the required Graph grants and site grants.
- Startup binding validation catches some missing identity config, but not all grant/proof issues.

### What is weak or risky
- A `401` on the reporting-period read seam strongly suggests that “managed identity exists” is not enough. Production readiness requires:
  - identity selection proof
  - effective permission proof
  - effective site/list grant proof
  - artifact/runtime parity proof
- The backend still contains SharePoint-token helper seams for provisioning-era operations, which increases conceptual complexity even if the Safety ingest path is graph-native.

### Correction direction
- Keep managed identity as direction of record.
- Add explicit runtime proof for the exact outbound identity and effective grants used by Safety graph calls.
- Finish separating graph-only data-plane behavior from legacy SharePoint-token seams where they are not required.

## C. Route and privileged-surface design

### What is strong enough to preserve
- Anonymous `/api/health` is appropriately minimal.
- `/api/health/ready` is admin-gated.
- Safety mutation routes require bearer auth and delegated-scope/admin checks in the route layer.

### What is usable but insufficient
- The route layer is structured and consistent, but the broader function app still carries a wide route surface.
- Broader monolithic composition increases the chance of unrelated regressions, accidental route exposure, and noisy deployments.

### What is weak or risky
- Production readiness is not only about route auth; it also depends on route-surface discipline. A wider host than necessary is a maintenance and hardening burden.
- Auth level is `anonymous` at the platform layer for HTTP routes, which is acceptable because app auth is enforced in middleware, but this requires very strong discipline and tests.

### Correction direction
- Preserve middleware-based auth.
- Reduce release scope where possible.
- Keep `/api/health` minimal and do not add operational detail there.

## D. Graph / SharePoint integration

### What is strong enough to preserve
- The Safety ingestion hot path is graph-native in current repo truth.
- Graph failure classification is explicit.
- Graph retries on 429/5xx are implemented.
- Graph concurrency protection uses `If-Match` + ETag for critical updates.
- Bounded query enforcement is a good guardrail against silent paging drift.

### What is usable but insufficient
- The broader backend still mixes Graph and SharePoint/PnP seams.
- That is acceptable temporarily for provisioning/control-plane work, but it should no longer leak into application-facing Safety ingestion behavior.

### What is weak or risky
- The prompt’s older assumption about lingering REST ingestion dependency is now stale relative to current `main`; however, that discrepancy itself is a risk because it means live-state and source-state may have drifted.
- Graph list item create/update APIs require sufficient app permissions or selected-scope grants. Without tested least-privilege proof, staging may work under broad grants while rollout later fails.
- The repository currently assumes the supplied reporting-period ID can be converted into the correct Graph list item ID. If the upstream UI/context passes a logical ID that is not the numeric SharePoint list item ID, the seam will break.

### Correction direction
- Treat Safety ingestion graph-only as the application-facing direction of record.
- Prove that all ingest/preview/replay list/file operations succeed under that model.
- Explicitly separate:
  - broad staging/test grants
  - narrowed pre-rollout grants
  - steady-state production grants

## E. Configuration and environment management

### What is strong enough to preserve
- The repo already has startup validation.
- Rollout posture validation is stronger than average.
- CORS inventory is treated as declared config rather than scattered code.

### What is usable but insufficient
- CORS declared inventory and App Service CORS need continuous parity proof, not just startup validation.
- SharePoint and Safety binding checks are helpful, but current live evidence proves that passing startup checks is not enough.

### What is weak or risky
- Flex Consumption deployments, app settings, and runtime content behavior must be handled carefully; production readiness requires deploy mechanics that actually match the hosting plan.
- Missing or partial runtime proof can leave the team with a healthy `/api/health` and still a failing data plane.

### Correction direction
- Preserve config validation.
- Add sharper readiness evidence for outbound Graph reachability and list binding correctness.
- Keep exact-origin CORS only.

## F. Resilience and idempotency

### What is strong enough to preserve
- Graph transient retry exists.
- Concurrency retry exists on rollup updates and supersession.
- Duplicate-risk detection and replay support already exist.
- Idempotency is treated seriously in the broader backend.

### What is usable but insufficient
- Safety lane still lacks the only proof that matters: successful committed writes under the real hosted identity.
- Some create-item flows remain single-attempt and should be reviewed for operational recovery assumptions.

### What is weak or risky
- Without end-to-end write proof, resilience code remains only partially validated.
- A failed reporting-period read blocks the entire commit lane before the higher-value idempotency/replay logic can prove itself live.

### Correction direction
- First fix the blocking read seam.
- Then prove create/update/replay/supersession behavior end-to-end with real Graph writes.

## G. Observability

### What is strong enough to preserve
- Health and readiness are intentionally separated.
- Safety ingestion emits rich custom events and metrics.
- Graph failures are classified.
- Auth success/error telemetry exists.

### What is usable but insufficient
- `host.json` sampling is enabled, which is generally fine, but operators need confidence that high-value custom events and failure traces are retained at useful levels.
- Readiness provides declared posture, but not full live permission proof.

### What is weak or risky
- There is still a meaningful difference between “telemetry exists” and “operators can prove the exact reason a Safety graph call is failing.”
- If the deployed artifact differs from `main`, telemetry from source review alone can mislead remediation.

### Correction direction
- Preserve classified telemetry.
- Add explicit proof queries and release evidence tied to the current artifact/version.
- Keep PII discipline and avoid over-logging workbook content.

## H. Workbook parser-contract modernization

### What is strong enough to preserve
- The parser contract is now formalized in code.
- The parser and validator already prefer parser-meta / named ranges before legacy fallback.
- The preview flow already uses template markers, metadata extraction, reporting-period fit, project resolution, and duplicate-risk logic.

### What is usable but insufficient
- The route/UI contract should now present preview as a first-class pre-commit validation result.
- Incompatible-template diagnostics can be sharper and more operator-friendly.

### What is weak or risky
- The uploaded workbook’s `ParserMeta` sheet is visible, not hidden. That is not fatal to parsing, but it contradicts the stated intent and should be corrected if the field workflow should not expose parser scaffolding.
- `ParserMeta!B14` uses `TEXTJOIN`; depending on workbook engine behavior, formula-evaluation portability should be watched carefully when non-Excel tooling touches the file.
- The route still requires `reportingPeriodId` in client context. With the stronger workbook contract, the backend should be able to derive/report period expectations more authoritatively and explain mismatches better.

### Correction direction
- Make preview mandatory in the logical flow even if the transport remains a single submit action.
- Treat parser markers as governed contract.
- Prefer parser-derived date / inspection number when markers exist; keep context only as advisory or legacy fallback.

## Overall research-backed judgment

### Preserve
- v4 function model
- deploy artifact truth pattern
- minimal public health + admin-gated readiness
- managed identity as runtime auth model
- graph-native Safety ingestion design
- graph failure classification / retry / concurrency controls
- parser-contract code and preview gate

### Refine
- route-surface boundaries
- rollout permission proof
- CORS/App Service parity proof
- readiness evidence
- operator-facing preview diagnostics
- end-to-end graph write proof

### Redesign or decisively cut over
- any remaining application-facing Safety reliance on SharePoint REST/PnP
- any ambiguous reporting-period identifier contract
- any release process that cannot prove deployed artifact parity on Flex hosting
- any parser flow that still treats visible sheet coordinates as primary when parser markers exist

## Primary sources consulted

### Official platform guidance
- Azure Functions Node.js v4 programming model: https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4
- Azure Functions deployment technologies: https://learn.microsoft.com/en-us/azure/azure-functions/functions-deployment-technologies
- Zip deployment for Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/deployment-zip-push
- Run Functions from a package: https://learn.microsoft.com/en-us/azure/azure-functions/run-functions-from-deployment-package
- Azure Functions app settings reference: https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings
- Manage function app settings / CORS: https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings
- Azure Functions best practices: https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices
- Improve Azure Functions performance and reliability: https://learn.microsoft.com/en-us/azure/azure-functions/performance-reliability
- Monitor executions in Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring
- Application Insights logs in Azure Functions: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-functions/monitoring/functions-monitoring-appinsightslogs
- Managed identities for App Service and Azure Functions: https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity
- Managed identities developer guidance: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers
- Microsoft Graph throttling guidance: https://learn.microsoft.com/en-us/graph/throttling
- Microsoft Graph Selected permissions overview: https://learn.microsoft.com/en-us/graph/permissions-selected-overview
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Microsoft Graph create site permission: https://learn.microsoft.com/en-us/graph/api/site-post-permissions
- Microsoft Graph list item resource: https://learn.microsoft.com/en-us/graph/api/resources/listitem
- Microsoft Graph get list item: https://learn.microsoft.com/en-us/graph/api/listitem-get
- Microsoft Graph create list item: https://learn.microsoft.com/graph/api/listitem-create
- Microsoft Graph update list item: https://learn.microsoft.com/en-us/graph/api/listitem-update
- Microsoft Graph create list: https://learn.microsoft.com/en-us/graph/api/list-create

### Repo truth inspected
- `backend/functions/README.md`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/README.md
- `backend/functions/package.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/package.json
- `backend/functions/host.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/host.json
- `backend/functions/src/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/index.ts
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
- `backend/functions/src/functions/health/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/index.ts
- `backend/functions/src/functions/health/ready.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/ready.ts
- `backend/functions/src/services/sharepoint-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/sharepoint-service.ts
- `backend/functions/src/services/safety-ingestion-application-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-application-service.ts
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-data-plane.ts
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-repository.ts
- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts
- `backend/functions/src/utils/validate-config.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/utils/validate-config.ts
- `backend/functions/src/middleware/auth.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/auth.ts
- `backend/functions/src/middleware/authorization.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/authorization.ts
- `scripts/package-functions-artifact.ts`: https://github.com/RMF112018/hb-intel/blob/main/scripts/package-functions-artifact.ts
- `packages/features/safety/src/domain/templateContract.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/domain/templateContract.ts
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/contractWorkbookAccess.ts
- `packages/features/safety/src/parser/extractMetadata.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/extractMetadata.ts
- `packages/features/safety/src/parser/parseChecklist.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/parseChecklist.ts
- `packages/features/safety/src/parser/validateTemplate.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/validateTemplate.ts
