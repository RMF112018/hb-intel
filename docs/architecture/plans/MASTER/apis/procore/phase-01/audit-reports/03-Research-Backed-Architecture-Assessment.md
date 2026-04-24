# 03 – Research-Backed Architecture Assessment

## Preserve as-is or with light refinement

### Backend host choice
Preserve the decision to use Azure Functions as the repo-owned integration host.
Why:
- Functions runtime v4 is the recommended runtime line for Azure Functions
- the repo is already on the Node/Functions stack
- existing middleware, telemetry, and service-factory seams make it the natural integration termination point

### Managed identity for Azure resources
Preserve the managed-identity pattern for:
- Key Vault access
- Graph
- SharePoint
- Azure storage access where identity-based access is supported

This is already directionally correct and consistent with Microsoft guidance.

### Protected API audience separation
Preserve the explicit `API_AUDIENCE` contract and the current backend JWT validation posture.
This is already a mature separation between:
- protected API audience
- managed identity
- frontend authentication bootstrap

### Repository / query-hook consumer boundary
Preserve the rule that downstream consumers should consume published repositories/read models and not call connector runtimes directly.

## Directionally usable but still insufficient

### Admin connection routes
The repo already has authenticated `/api/admin/connections` routes and a connection registry service, but the service is still in-memory and generic/stubbed.
Implication:
- good control-plane seed
- not production-capable yet
- should be extended into a durable Procore connector registry, not replaced

### Azure Table-backed domain data
Azure Table is already part of repo truth and is useful for:
- run ledgers
- checkpoints
- idempotency keys
- lightweight publication snapshots
- control-plane records

But it is not sufficient as the only canonical analytics store for Procore because the package requires:
- bridge-heavy joins
- snapshot families
- subject-area conformance
- analytic reshaping over time

### PWA proxy mode and data-access factory
Good direction, weak completion.
The repo has a proxy client, proxy repositories, and a factory pattern, but:
- `setProxyContext()` is not wired in startup
- project registry is mock-only
- route parity is not fully reconciled
- some consumer sources are still mock-backed

## Structurally weak or incompatible with a credible Procore integration

### SharePoint as a primary persistence target for Procore
This would be the wrong move.
Why it matters:
- Procore data volume, history, and joins make SharePoint lists the wrong primary custody plane
- package guidance strongly rejects a full SharePoint mirror
- current repo doctrine also leans away from SharePoint-first custody for connector-backed domains

### No durable Procore connection + credential model
The repo does not yet have:
- durable connection records
- credential references tied to Key Vault
- token refresh / acquisition behavior for an external non-Microsoft API
- connector-specific health checks
- sync checkpoint model

Without that, the integration would be operationally weak from day one.

### No raw landing and replay layer
Because Procore has a broad, evolving API and rate limits, the backend needs:
- raw payload retention
- replayable extraction runs
- watermark/checkpoint strategy
- failure isolation
- partial rerun support

That is currently absent.

### No canonical relational layer
This is the biggest architectural deficiency relative to the package.
Current repo truth has operational data stores, but not the governed canonical relational model that the Procore package assumes.

## Reuse of the current Azure app
### Final assessment
Reusing the current Azure app registration is justified **for the HB Intel protected API and Entra trust model**.
It is not justified to create a second Azure app registration merely because a new connector is being added.

### What still must be added
You still need:
- a Procore app in the Procore Developer Portal
- DMSA-backed client credentials for first-wave enterprise data sync
- Key Vault-backed secret storage for the Procore client secret
- backend-only token acquisition against Procore’s OAuth endpoints

### Why this is not a contradiction
A Procore app credential is not a second Azure app registration. It is an external-system credential required by Procore itself.

## Backend hosting strategy
### Decision
`backend/functions/` should remain the primary host.

### Why
- it already centralizes authenticated HTTP routes
- it already owns Microsoft-side app-only access
- it already contains admin/control-plane seams
- it can own timers/jobs and publication pipelines
- it is consistent with the repo’s native-integration doctrine

### What to add
- a Procore connector service family
- token broker/client for Procore
- connection registry persistence
- run ledgers and checkpoints
- raw landing orchestration
- publication services
- admin health/test endpoints for Procore

## SharePoint fit vs non-SharePoint fit
### Good SharePoint fit
- current-state project summaries
- open-item queues
- KPI snapshots
- key project contacts / vendor summaries
- dictionaries / lookup data where lightweight
- generated reports and curated documents

### Poor SharePoint fit
- raw payload archives
- line-item-heavy financial history
- high-volume event tables
- large document/file mirrors
- workflow activity history at scale
- detailed labor / production / daily-log segment history
