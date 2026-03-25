# Developer Guide: Native Integration Backbone Implementation

## Purpose and Scope

This guide translates the authored MASTER native-integration planning stack into implementation guidance for engineers working in `backend/functions`, shared packages, and downstream consumer packages.

It governs:

- implementation seams for the updated data layer
- published read-model patterns
- downstream consumer integration rules
- rollout sequencing and acceptance expectations

It does not govern:

- vendor endpoint shapes beyond what the `P1-F*` connector families verified
- unresolved connector-runtime details explicitly left open in official-source-backed child families
- any claim that the Azure-first target runtime is already fully implemented today

### Implementation Impact Summary

- The current repo baseline is already Azure Table-backed for most active domain CRUD through backend domain services and [`table-client-factory.ts`](../../../backend/functions/src/utils/table-client-factory.ts).
- The current PWA/source layer still depends on mock query seams in [`sourceAssembly.ts`](../../../apps/pwa/src/sources/sourceAssembly.ts) and [`domainQueryFns.ts`](../../../apps/pwa/src/sources/domainQueryFns.ts); those must be replaced with governed published read-model providers.
- The project-registry contract already exists in [`IProjectRegistryService.ts`](../../../packages/data-access/src/services/IProjectRegistryService.ts) and [`IProjectRegistryRecord.ts`](../../../packages/models/src/project/IProjectRegistryRecord.ts), but the implementation is still mock-only in [`MockProjectRegistryService.ts`](../../../packages/data-access/src/services/MockProjectRegistryService.ts).
- Downstream consumers must consume published read models or governed repositories only. They must not call connector internals, raw custody, normalized source-aligned records, or thin canonical core layers directly.
- Operator/admin surfaces must expose replay, reconciliation, dead-letter, and implementation-truth health rather than leaving those concerns implicit in backend logs.

## Repo-Truth Baseline

The governing implementation baseline is current repo truth plus the authored native-integration families under [`docs/architecture/plans/MASTER/phase-1-deliverables/`](../../architecture/plans/MASTER/phase-1-deliverables/), not older SharePoint-first assumptions in early Phase 1 planning.

### Reusable Seams

| Area | Current seam | Implementation value |
|---|---|---|
| Azure storage access | [`backend/functions/src/utils/table-client-factory.ts`](../../../backend/functions/src/utils/table-client-factory.ts) | Central Azure Table seam for current backend domain services and the most credible reuse point for custody, publication, and operator ledgers |
| Backend route/runtime pattern | `backend/functions/src/routes/**` plus `withAuth()` / `withTelemetry()` usage described in [`backend/functions/README.md`](../../../backend/functions/README.md) | Existing authenticated route and handler pattern should remain the backend entry path for governed repository access and publication jobs |
| Repository factory seam | [`packages/data-access/src/factory.ts`](../../../packages/data-access/src/factory.ts) | Existing adapter/repository selection seam that should absorb published read-model repositories and durable project-registry implementation selection |
| Consumer boundary | [`packages/query-hooks/src/useRepository.ts`](../../../packages/query-hooks/src/useRepository.ts) and [`packages/query-hooks/src/index.ts`](../../../packages/query-hooks/src/index.ts) | Existing governed downstream consumption boundary for PWA and feature packages |
| Project activation handoff | [`packages/provisioning/src/handoff-config.ts`](../../../packages/provisioning/src/handoff-config.ts) | Existing setup-to-project-handoff seam that must eventually bind to a durable registry and publication pipeline |
| Shared project identity contract | [`packages/models/src/project/IProjectRegistryRecord.ts`](../../../packages/models/src/project/IProjectRegistryRecord.ts) | Existing shared type for project identity and registry records |
| Project Hub reporting seam | [`packages/features/project-hub/src/reports/catalog.ts`](../../../packages/features/project-hub/src/reports/catalog.ts) | Existing report/readiness catalog seam that can consume published read models without becoming a connector client |
| Admin implementation-truth seam | [`packages/features/admin/src/components/ImplementationTruthDashboard.tsx`](../../../packages/features/admin/src/components/ImplementationTruthDashboard.tsx) | Existing operator/admin surface that can host integration health, replay, reconciliation, and dead-letter visibility |

### Incomplete Seams That Must Change

| Area | Current truth | Required change |
|---|---|---|
| Project registry | [`createProjectRegistryService()`](../../../packages/data-access/src/factory.ts) still returns [`MockProjectRegistryService`](../../../packages/data-access/src/services/MockProjectRegistryService.ts) only | Add a durable implementation behind the existing interface and keep the shared contract stable unless a documented revision is required |
| Proxy startup wiring | [`apps/pwa/src/main.tsx`](../../../apps/pwa/src/main.tsx) does not wire `setProxyContext()` from [`packages/data-access/src/factory.ts`](../../../packages/data-access/src/factory.ts) | Wire proxy context during startup anywhere proxy-backed repository mode is intended |
| PWA source assembly | [`apps/pwa/src/sources/sourceAssembly.ts`](../../../apps/pwa/src/sources/sourceAssembly.ts) still assembles source providers from mock query fns in [`domainQueryFns.ts`](../../../apps/pwa/src/sources/domainQueryFns.ts) | Replace mocks with governed published read-model providers and repository-backed query hooks |
| Graph runtime expectations | [`backend/functions/src/services/graph-service.ts`](../../../backend/functions/src/services/graph-service.ts) is provisioning-oriented | Do not treat current provisioning Graph usage as the future `P1-F12` Microsoft 365 Graph Content connector runtime |
| Proxy/readme docs | [`packages/data-access/README.md`](../../../packages/data-access/README.md) and [`packages/data-access/src/adapters/proxy/README.md`](../../../packages/data-access/src/adapters/proxy/README.md) lag current implementation truth | Implementation should follow live code and `P1-F*` planning, not stale package documentation |

### Transition Baseline

- Azure already backs most active domain services; the integration program extends that reality rather than replacing it with a greenfield platform.
- SharePoint remains real for provisioning request lifecycle, site/list/document operations, and selected published operational read models during transition.
- The target runtime is still transitional. The guide defines the implementation path; it does not assert full runtime completion.

## Target Data-Layer Operating Model

### Raw Custody Layer

- Azure owns source payload custody, ingest metadata, sync window state, and source-specific correlation metadata.
- Raw custody stays connector-specific and source-aligned.
- Raw custody is never a downstream consumer surface.

### Normalized Source-Aligned Layer

- Azure owns normalized source-aligned records per connector/domain.
- Normalization should preserve source semantics while removing transport-specific noise.
- Normalized source-aligned records remain internal to the integration backbone.

### Thin Canonical Core

- Azure owns identity crosswalks, reconciliation state, replay handles, audit provenance, and limited shared mapping artifacts.
- The canonical core stays thin. It should unify identities and publication logic, not attempt a broad enterprise-wide schema rewrite.

### Published Read-Model Layer

- Published read models are the only connector-backed surfaces that downstream consumers may read.
- Published read models may remain Azure-backed or be selectively published to SharePoint during transition where existing operational surfaces require it.
- Published read models should hide raw payload structure, connector paging behavior, and internal reconciliation state from consumers.

### Operator / Audit / Replay / Reconciliation Layer

- Azure owns run ledgers, replay controls, reconciliation results, dead-letter records, and audit/provenance stores.
- Admin/operator surfaces consume this layer for supportability; downstream business modules do not.

### Operating Rules

- `v1` remains read-only / ingest-first.
- Batch-led sync is the default orchestration model, with event/webhook assist only where official-source-backed connector families support it.
- SharePoint is transitional for provisioning and selected published operational read models only.
- Downstream consumers never read raw custody, normalized source-aligned records, or thin canonical core layers directly.

## Package and Runtime Responsibility Map

### `backend/functions`

- Own ingestion orchestration entrypoints, scheduled jobs, webhook/event entrypoints where applicable, authenticated route surfaces, Azure custody writes, replay/reconciliation/audit ledgers, and publication jobs.
- Continue using the current backend domain-route and Azure Table service pattern rather than pushing connector runtime into feature packages.
- Own the operational truth for dead-letter handling, replay, and operator-support endpoints.

### `packages/data-access`

- Own repository ports, adapter mode selection, published read-model repositories, and durable project-registry service implementation selection.
- Keep raw custody and connector-internal persistence details hidden behind backend routes or internal service layers.
- Preserve the existing repository factory seam while adding publication-specific repositories as the connector backbone becomes executable.

### `packages/query-hooks`

- Remain the downstream consumer boundary for front-end access to governed repositories and published read models.
- Keep query-hook contracts stable even as backing data shifts from mock or domain-local sources to connector-backed publications.
- Do not expose raw connector/runtime stores through hook APIs.

### `packages/models`

- Own shared published read-model contracts, publication DTOs, shared identity/mapping contracts, and project-registry shapes that must cross package boundaries.
- Avoid accumulating connector transport payload types unless they are truly shared runtime contracts.

### `packages/provisioning`

- Continue owning setup handoff and project activation contract assembly.
- Integrate with the durable registry and publication model instead of relying on the current mock-only registry posture.

### `packages/shell`

- Own startup/runtime wiring such as proxy-context bootstrap and route-aware startup coordination.
- Do not own connector logic, source-of-truth decisions, or connector-specific mapping logic.

### `packages/features/project-hub`

- Consume published read models plus module-owned records, overlays, annotations, forecasts, and workflow state.
- Retain ownership of user-authored project context and operational actions.
- Must not own connector runtime, connector SDK usage, replay logic, or reconciliation logic.

### `packages/features/admin`

- Own operator/admin views for runs, health, replay, reconciliation status, dead-letter inspection, and implementation-truth support tooling.
- Surface supportability honestly rather than burying operational state in backend-only logs.

### Explicit Anti-Ownership

- No connector runtime in downstream feature packages.
- No direct Graph, Procore, Sage Intacct, BambooHR, Primavera, or Autodesk API usage in feature packages.
- No module-local reimplementation of identity mapping, replay, or reconciliation.

## Required Implementation Changes to the Current Data Layer

### Add or Expand These Seams

1. Add a durable project-registry implementation behind [`IProjectRegistryService`](../../../packages/data-access/src/services/IProjectRegistryService.ts).
2. Wire `setProxyContext()` from [`packages/data-access/src/factory.ts`](../../../packages/data-access/src/factory.ts) during startup in [`apps/pwa/src/main.tsx`](../../../apps/pwa/src/main.tsx) wherever proxy-backed repository mode is intended.
3. Reconcile proxy repository contracts with actual backend route inventory before published read models are exposed through proxy mode.
4. Replace mock source providers in [`sourceAssembly.ts`](../../../apps/pwa/src/sources/sourceAssembly.ts) and [`domainQueryFns.ts`](../../../apps/pwa/src/sources/domainQueryFns.ts) with governed published read-model providers.
5. Add backend persistence and service seams for:
   - raw custody
   - normalized source-aligned records
   - thin canonical mapping and identity crosswalk
   - replay / reconciliation / audit ledgers
   - dead-letter inspection and operator review
6. Define publication repositories in `@hbc/data-access` and query-hook surfaces in `@hbc/query-hooks` for connector-backed published read models.
7. Extend `packages/models` with shared published read-model contracts only where cross-package use requires them.

### Keep These Seams Stable

- backend domain-route and Azure Table patterns
- repository/query-hook downstream consumption boundary
- provisioning handoff seam in [`handoff-config.ts`](../../../packages/provisioning/src/handoff-config.ts)
- shared project-registry contract shape in [`IProjectRegistryRecord.ts`](../../../packages/models/src/project/IProjectRegistryRecord.ts), unless a documented revision becomes necessary

### Implementation Implications by Area

#### Adapter / Repository

- Add publication-focused repositories rather than exposing raw connector stores.
- Keep adapter mode decisions centralized in `@hbc/data-access`.
- Route parity must be validated before proxy mode becomes the integration-backed default.

#### Query Hooks

- Query hooks should consume governed publication repositories only.
- Hook APIs should remain consumer-safe even when new connector-backed publications appear.

#### Models / Types

- Shared publication DTOs belong in `packages/models` when multiple packages depend on them.
- Connector-specific transport shapes should remain internal unless a shared contract is unavoidable and explicitly governed.

#### Ingestion / Orchestration

- Use backend orchestration for batch-led sync, replay, reconciliation, and publication.
- Event/webhook assist should only be implemented where the corresponding `P1-F*` family has official-source-backed support for that mode.

#### Observability / Replay / Dead-Letter

- Admin/operator tooling must gain first-class visibility into runs, failures, replay requests, and dead-letter queues.
- Operator state should not be inferred from scattered backend logs alone.

#### Publication / Versioning

- Published read models must be versioned and treated as consumer-facing contracts.
- Connector changes should be absorbed behind publication layers rather than propagated directly into feature packages.

## Downstream Consumer Integration Model

### Project Hub / Control Center

- Consume published read models from [P1-F5 Procore](../../architecture/plans/MASTER/phase-1-deliverables/P1-F5-Procore-Connector-Family.md), [P1-F6 Sage Intacct](../../architecture/plans/MASTER/phase-1-deliverables/P1-F6-Sage-Intacct-Connector-Family.md), [P1-F7 BambooHR](../../architecture/plans/MASTER/phase-1-deliverables/P1-F7-BambooHR-Connector-Family.md), [P1-F12 Microsoft 365 Graph Content](../../architecture/plans/MASTER/phase-1-deliverables/P1-F12-Microsoft-365-Graph-Content-Connector-Family.md), and later [P1-F14 Oracle Primavera](../../architecture/plans/MASTER/phase-1-deliverables/P1-F14-Oracle-Primavera-Connector-Family.md) where module scope requires them.
- Retain ownership of user-authored planning, annotations, overrides, forecasts, and workflow state.
- Never read connector internals or raw custody stores directly.

### Reports

- Treat Reports as a major consumer of connector-backed published read models plus module-owned published snapshots.
- Aggregate governed publications instead of acting as a direct integration client.

### Financial / Portfolio Reporting Consumers

- Use published read models that keep Procore project-operational financial-control context separate from Sage Intacct financial and project-accounting backbone context.
- Keep budget, commitment, prime contract, and change context reconcilable without collapsing those sources into a single fabricated upstream truth.

### Staffing / HR-Aware Consumers

- Use BambooHR-backed published read models for workforce identity and staffing truth.
- Keep HB Intel membership, authority, and permission decisions separate from HR identity enrichment.

### Documents / Graph-Content Consumers

- Use Graph Content published read models and references only.
- Do not call Graph directly from feature packages.
- Do not confuse current provisioning Graph seams with future document/content publications.

### Future Wave 2 / Wave 3 Consumers

- Depend on named `P1-F*` families and their published read-model contracts only after readiness gates are satisfied.
- Tolerate staged unknowns recorded in child connector families instead of inventing downstream assumptions.

### Consumer Anti-Patterns

- direct reads from raw custody, normalized source-aligned records, or thin canonical core stores
- module-local connector SDK usage
- bypassing `@hbc/data-access` or `@hbc/query-hooks`
- treating SharePoint as default business-data custody for connector ingestion
- inventing downstream fields from unverified connector contracts

## Publication Boundary Rules

### Consumers May Read

- published read models
- governed repositories
- module-owned records derived from published read models
- stable shared contracts intentionally published for cross-package use

### Consumers May Not Read

- raw custody payloads
- normalized source-aligned integration stores
- thin canonical mapping stores
- replay / reconciliation / audit ledgers
- connector-specific operator/admin stores

### Governance Rules

- Published read-model contracts must be versioned and treated as consumer-facing interfaces.
- Connector/runtime changes must be absorbed behind publication layers.
- Expansion-pack work should prefer additive published read-model evolution over disruptive consumer rewrites.
- Breaking publication changes require coordinated plan/doc updates and migration guidance.

## Delivery Sequencing

1. **Backbone readiness**
   - durable project registry
   - startup proxy-context decision and wiring
   - proxy/backend route reconciliation
   - operator/admin seams for replay, reconciliation, dead-letter, and run health
2. **Publication layer foundation**
   - published read-model contracts
   - repositories and query hooks for published read models
   - shared consumer-safe model types
3. **Wave 1 execution**
   - `P1-F5` Procore
   - `P1-F6` Sage Intacct
   - `P1-F7` BambooHR
   - prioritize Project Hub, Financial, Reports, and workforce-aware published read models
4. **Downstream adoption**
   - replace mock source/query seams
   - shift feature packages to governed published read models
   - validate publication boundaries in Project Hub, Reports, and Admin
5. **Wave 2 readiness**
   - begin only after Wave 1 publication, replay, reconciliation, and operator patterns are stable
6. **Wave 3 readiness**
   - begin only after Wave 2 dependency surfaces and official-source gaps are resolved or explicitly accepted as staged unknowns

Child-family existence is not implementation readiness by itself. Readiness depends on backbone seam completion plus the official-source sufficiency locked in the relevant `P1-F*` family.

## Testing and Acceptance Guidance

### Data-Layer Validation

- validate raw, normalized, canonical, and publication persistence paths
- validate identity mapping and project-registry resolution
- validate replay, reconciliation, and dead-letter lifecycle behavior
- validate backend route and repository alignment

### Publication-Boundary Validation

- confirm repositories expose published read models only
- confirm query hooks consume governed repositories correctly
- confirm publication contracts remain stable for consumers
- confirm no consumer dependence on raw custody or thin canonical stores

### Consumer Integration Validation

- Project Hub consumes published read models only
- Reports consumes module publications and published read models only
- Financial, HR-aware, and Documents surfaces use named connector-backed publications where planned
- PWA source assembly no longer depends on mock domain query seams once adoption occurs

### Operational Readiness

- health and failure visibility in admin/operator surfaces
- run-ledger visibility
- replay support
- dead-letter triage path
- audit and provenance traceability

## Implementation Checklist

### Backbone

- confirm durable registry design and backing store
- confirm backend route inventory versus repository usage
- confirm startup proxy-context strategy

### Data Layer

- define raw, normalized, canonical, and publication storage responsibilities
- define shared types and repository contracts
- define replay, reconciliation, and dead-letter stores

### Publication

- define published read-model contracts for Wave 1
- wire repositories and query hooks
- replace mock domain query seams

### Consumers

- Project Hub adoption
- Reports adoption
- Financial authority split adoption
- BambooHR workforce-read-model adoption
- Graph Content document-awareness adoption

### Operations

- admin health surfaces
- replay tooling
- support runbooks

### Acceptance

- verify no direct connector access from consumers
- verify no SharePoint-first custody assumptions remain in implementation guidance

## Risks, Anti-Patterns, and No-Go Items

- direct consumer use of connector internals
- overuse of SharePoint as integration custody
- pretending the Azure-first target is already implemented
- endpoint or schema fabrication beyond official-source-backed child families
- module-local connector divergence
- registry remaining mock-only while connector-backed identity depends on it
- proxy mode being assumed without startup wiring and route parity
- reusing current provisioning Graph seams as if they were the future Graph Content connector
- bypassing `@hbc/query-hooks` and governed repository boundaries

## Recommended Next Actions

### Immediate

- use this guide as the implementation reading companion to [`P1-F1`](../../architecture/plans/MASTER/phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md) through [`P1-F19`](../../architecture/plans/MASTER/phase-1-deliverables/P1-F19-BambooHR-Expansion-Pack-Family.md)
- freeze package/runtime ownership language around backend, data-access, query-hooks, models, shell, Project Hub, and Admin
- define the first durable project-registry implementation task

### Near-Term

- design Wave 1 published read-model contracts
- extend repositories and query hooks for those publications
- design replacement of mock PWA source/query seams
- build the admin/operator backlog for replay, reconciliation, run health, and dead-letter visibility

### Longer-Term

- harden Wave 2 and Wave 3 readiness criteria
- define expansion-pack readiness and publication-evolution rules
- add migration guidance for any breaking published read-model change

## Related Planning Sources

- [`P1-F1` Native Integration Backbone family](../../architecture/plans/MASTER/phase-1-deliverables/P1-F1-Native-Integration-Backbone-Master-Index.md)
- [`P1-F2` through `P1-F19` child connector and expansion-pack families](../../architecture/plans/MASTER/phase-1-deliverables/README.md)
- [`P1-CLOSEOUT Native Integration Backbone Repo-Truth Audit`](../../architecture/plans/MASTER/phase-1-deliverables/P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md)
- [`Phase 3 Deliverables README`](../../architecture/plans/MASTER/phase-3-deliverables/README.md)
