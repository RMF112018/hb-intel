# Phase 4 — Infrastructure Action Plan

## Objective

Bring the Estimating / Project Setup package onto a **production-safe infrastructure posture** by scoping Azure Functions startup to the actual deployment, hardening managed identity and storage dependencies, locking down connected-service permissions and CORS, and adding the observability, release gates, and operational safeguards required for production launch.

This phase is not intended to redesign business workflows or broaden feature scope. It is intended to make the retained Project Setup infrastructure explicit, supportable, and stable so production mode can run without hidden dependencies, over-broad boot blockers, or unclear operational requirements.

## In scope

- Azure Functions hosting posture for Project Setup deployment
- Startup validation / feature gating / environment validation scope
- Service factory and dependency initialization for retained Project Setup capabilities
- Managed identity usage and service-principal / app-registration prerequisites
- Azure Storage / Functions host dependencies and runtime prerequisites
- Secret / config / app-setting posture for production
- CORS configuration and browser-origin controls for SPFx calls
- SharePoint / Graph / App Catalog connected-service dependency review
- Monitoring, diagnostics, operational readiness, and release checks
- Documentation of retained infrastructure and deployment prerequisites

## Out of scope unless strictly required to enable Phase 4

- Broad auth/token redesign beyond what Phase 3 established
- SharePoint field-schema redesign beyond what Phase 2 established
- General product UX polish unrelated to diagnostics or readiness signaling
- Broad provisioning workflow redesign beyond infrastructure and dependency hardening
- Unrelated module/platform infrastructure changes outside Project Setup deployment scope

## Known starting facts for Phase 4

- The backend entrypoint currently registers a broader surface than the isolated Project Setup deployment should require.
- Startup/config validation and service initialization need tighter scoping so unrelated dependencies do not block Project Setup runtime.
- The backend depends on connected Azure and Microsoft 365 services whose exact production requirements must be made explicit.
- Managed identity, storage, CORS, SharePoint / Graph permissions, and monitoring posture must be documented and hardened before production launch.
- Phase 1 scope control, Phase 2 data-contract work, and Phase 3 auth hardening should reduce ambiguity around what infrastructure truly remains in scope.

## Phase 4 success criteria

Phase 4 is complete only when all of the following are true:

1. Azure Functions startup and runtime validation are scoped to the actual Project Setup deployment.
2. Required environment settings, service identities, storage dependencies, and connected-service prerequisites are explicit and validated.
3. Managed identity and any remaining secrets are production-appropriate, minimal, and clearly documented.
4. CORS and platform permission posture are aligned to the actual SharePoint/SPFx deployment origins and least-privilege service access model.
5. Monitoring, diagnostics, and release-readiness checks exist for the retained infrastructure surface.
6. The repo contains authoritative infrastructure documentation and operational handoff notes for Project Setup deployment.

## Workstream A — Repo truth and infrastructure baseline

### Tasks
- Inventory the retained Project Setup infrastructure surface after Phases 1–3.
- Inventory every active runtime dependency and connected service, including:
  - Azure Functions host/runtime
  - Azure Storage
  - SignalR (if retained)
  - SharePoint Online / App Catalog
  - Microsoft Graph
  - Entra app registrations / managed identities
  - any queue, cache, or timer dependencies still in play
- Inventory startup validation, service-factory initialization, feature flags, and environment-variable requirements.
- Produce a baseline infrastructure matrix covering:
  - dependency
  - purpose
  - required for Project Setup or not
  - production requirement
  - current posture
  - unresolved issues

### Deliverables
- Infrastructure baseline matrix
- Startup dependency inventory
- Connected-service inventory

### Acceptance criteria
- There is one authoritative infrastructure baseline before hardening work begins.
- Every retained Project Setup infrastructure dependency is accounted for.

## Workstream B — Functions hosting, startup scoping, and configuration validation

### Tasks
- Scope Azure Functions startup to the actual Project Setup deployment.
- Split core required validators from optional feature validators.
- Ensure Project Setup runtime does not fail because unrelated future-capability dependencies are absent.
- Tighten service-factory initialization so unsupported dependencies are not eagerly initialized.
- Define the exact required app settings, feature flags, and validation rules for production.
- Add safe, explicit diagnostics for missing required runtime configuration.

### Deliverables
- Startup/validation scope matrix
- Updated validator and service-factory behavior
- Production app-settings contract markdown

### Acceptance criteria
- Project Setup can boot with only its actual required infrastructure in place.
- Missing required config produces explicit, safe, operator-usable diagnostics.

## Workstream C — Managed identity, storage, and secrets hardening

### Tasks
- Review all managed-identity usage and ensure each retained capability has a justified identity path.
- Remove ambiguous or unsafe secret usage where managed identity should be used.
- Review Azure Storage dependency posture for Functions host/runtime and any retained application storage dependencies.
- Document storage-account, connection-string, and identity requirements for production.
- Classify each remaining secret/config value as:
  - required secret
  - required non-secret setting
  - replaceable with managed identity
  - removable
- Harden any remaining secret handling and eliminate repo-visible / runtime-ambiguous patterns.

### Deliverables
- Managed-identity usage matrix
- Storage dependency notes
- Secret/config classification report

### Acceptance criteria
- Service identities are deliberate and least-privilege.
- Storage/runtime dependencies are explicit and production-safe.
- Remaining secrets are minimized, justified, and documented.

## Workstream D — CORS, connected services, and permission model

### Tasks
- Define the exact SharePoint/SPFx browser origins that require API access.
- Lock down CORS posture to those required origins.
- Review SharePoint App Catalog, API access approval, Graph, and site-permission prerequisites.
- Document the least-privilege permission model for:
  - Project Setup API access
  - SharePoint list/site operations
  - App Catalog solution deployment
  - Microsoft Graph calls
- Remove or explicitly mark unsupported connected-service dependencies.
- Verify that retained permissions and connected-service assumptions match the isolated Project Setup deployment.

### Deliverables
- CORS/origin matrix
- Connected-service prerequisite guide
- Permission-boundary documentation

### Acceptance criteria
- Only required origins and services remain allowed.
- The permission model is explicit, least-privilege, and aligned to actual deployment scope.

## Workstream E — Observability, release readiness, and operational guards

### Tasks
- Add monitoring and diagnostics for retained infrastructure dependencies.
- Ensure startup failures, config failures, storage failures, identity failures, and permission failures are diagnosable.
- Add operational readiness checks and deployment gating for production launch.
- Define operator-facing diagnostics for:
  - runtime mode
  - missing config
  - service dependency failures
  - permission misconfiguration
  - degraded connected-service state
- Add regression and readiness checks for infrastructure assumptions.
- Produce final infrastructure handoff notes for deployment/support teams.

### Deliverables
- Monitoring/diagnostic checklist
- Release-readiness checklist additions
- Infrastructure handoff markdown

### Acceptance criteria
- Operators can determine whether infrastructure is healthy, degraded, or blocked.
- Production release has explicit infrastructure go/no-go checks.

## Recommended execution sequence

1. Prompt 01 — Repo truth and infrastructure surface baseline
2. Prompt 02 — Functions hosting, startup, and configuration scope
3. Prompt 03 — Managed identity, storage, and secrets hardening
4. Prompt 04 — CORS, connected services, and permission model
5. Prompt 05 — Observability, release readiness, and operational guards
6. Prompt 06 — Final verification and handoff

## Non-negotiable constraints

- Do not re-read files already in current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not let this phase drift into broad auth redesign, field-schema redesign, or unrelated feature work.
- Do not preserve over-broad boot blockers for unsupported future capabilities.
- Do not leave required infrastructure dependencies implicit or tribal-knowledge-only.
- Do not keep permissive CORS or unclear permission posture in a package labeled production-ready.
- Do not retain secrets or secret-like patterns where managed identity or clearer configuration boundaries should be used.

## Phase 4 exit artifacts

At the end of Phase 4, the repo should contain:

- authoritative Project Setup infrastructure baseline documentation
- scoped startup/config validation rules for retained deployment scope
- explicit production app-settings and dependency documentation
- managed-identity / storage / secret posture documentation
- CORS, connected-service, and permission-boundary notes
- infrastructure monitoring / readiness / operational handoff notes
- final verification notes and known follow-on items for later phases
