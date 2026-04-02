# Admin Control Plane — Package Placement and Boundary Map

## Purpose

This document locks where Phase 2 admin control-plane contracts live in the repo and defines the import/boundary rules that later implementation phases must follow. It prevents contract types from scattering across the wrong layers.

## Package/layer ownership table

| Package / Layer | Role | Owns contracts? | May import contracts? | Must not contain |
|----------------|------|-----------------|----------------------|------------------|
| `@hbc/models` (`packages/models/src/admin-control-plane/`) | Shared pure types | **Yes** — canonical home for all Phase 2 contracts | N/A (is the source) | Runtime logic, storage implementations, framework-specific code |
| `apps/admin` | SPFx operator console | No | **Yes** — consumes for type-safe API calls and display | Contract definitions, control-plane runtime, adapter implementations |
| `@hbc/features-admin` (`packages/features/admin/`) | Admin intelligence layer | No | **Yes** — may reference for type alignment (e.g., alert → run correlation) | Control-plane runtime, orchestrator logic, adapter implementations, privileged execution |
| `@hbc/provisioning` (`packages/provisioning/`) | Provisioning domain lifecycle | No — retains own domain-specific types | **Yes** — may reference for crosswalk/projection | Generalized control-plane types that replace its own domain types |
| `backend/functions` | Privileged control plane | No — implements against contracts | **Yes** — imports contracts and implements runtime | Contract type definitions (those belong in `@hbc/models`) |

## Import-direction rules

```
@hbc/models (pure types — no runtime dependencies)
    ↑ imported by
    ├── apps/admin (consumer — display and API calls)
    ├── @hbc/features-admin (consumer — type alignment only)
    ├── @hbc/provisioning (consumer — crosswalk/projection types)
    └── backend/functions (consumer — runtime implementation)
```

**Rules**:
1. `@hbc/models` must not import from any consumer package.
2. Consumer packages import from `@hbc/models` — never the reverse.
3. `apps/admin` must not import directly from `backend/functions`.
4. `@hbc/features-admin` must not import from `backend/functions`.
5. `@hbc/provisioning` must not import from `admin-control-plane` contracts for its own domain logic — only for projection/crosswalk adapters at the display boundary (Phase 5).
6. `backend/functions` may import from `@hbc/models` and `@hbc/provisioning` but not from `apps/admin` or `@hbc/features-admin`.

## Export surface inventory

The `@hbc/models/admin-control-plane` module exports the following contract surface:

### Source files

| File | Contents |
|------|----------|
| `AdminEnums.ts` | `AdminDomain`, `AdminRiskLevel`, `AdminExecutionMode` |
| `types.ts` | `AdminActionKey`, `IAdminActionDescriptor` |
| `IAdminRun.ts` | `AdminRunStatus`, `AdminStepStatus`, `IAdminActorContext`, `IAdminStepResult`, `IAdminFailureSummary`, `IAdminRunEnvelope` |
| `IAdminApi.ts` | 23 API request/response DTOs |
| `IAdminCheckpoint.ts` | `AdminCheckpointCategory`, `AdminCheckpointStatus`, `IAdminCheckpointDefinition`, `IAdminCheckpoint`, `IAdminCheckpointDecision`, `IAdminExternalEventCorrelation` |
| `IAdminAudit.ts` | `AdminAuditEventType`, `AdminEvidenceType`, `IAdminAuditRecord`, `IAdminEvidenceReference`, `IAdminConfigSnapshotReference`, `IAdminStandardsReference`, `IAdminRationale`, `IAdminPostRunValidationSummary`, `IAdminPostRunValidationCheck`, `IAdminRunConfigTrace` |
| `IAdminAdapter.ts` | `AdminAdapterCategory`, `AdminAdapterOutcome`, `IAdminAdapterDescriptor`, `IAdminAdapterInvocationContext`, `IAdminAdapterResult`, `IAdminAdapterWarning`, `IAdminAdapterIssue`, `IAdminRemediationHint` |

### Export counts

| Category | Enums | Interfaces/Types | Total |
|----------|-------|-----------------|-------|
| Action vocabulary | 3 | 2 | 5 |
| Run model | 2 | 4 | 6 |
| API DTOs | 0 | 23 | 23 |
| Checkpoint | 2 | 4 | 6 |
| Audit/evidence/config | 2 | 8 | 10 |
| Adapter | 2 | 6 | 8 |
| **Total** | **11** | **47** | **58** |

### Import paths

Consumers can import via:
- **Root barrel**: `import { AdminDomain, IAdminRunEnvelope } from '@hbc/models'`
- **Sub-path**: `import { AdminDomain } from '@hbc/models/admin-control-plane'`

Both paths are supported by the `package.json` exports field wildcard pattern.

## Prohibited placement examples

| Scenario | Wrong placement | Correct placement | Why |
|----------|----------------|-------------------|-----|
| New admin action enum value | `apps/admin/src/types/` | `@hbc/models/admin-control-plane/AdminEnums.ts` | Action vocabulary is shared across all layers |
| Run envelope interface | `backend/functions/src/types/` | `@hbc/models/admin-control-plane/IAdminRun.ts` | Consumed by frontend, backend, and intelligence layers |
| Adapter result type | `@hbc/features-admin/src/types/` | `@hbc/models/admin-control-plane/IAdminAdapter.ts` | Features-admin is intelligence, not control plane |
| Provisioning-specific step definition | `@hbc/models/admin-control-plane/` | `@hbc/provisioning` or `@hbc/models/provisioning/` | Domain-specific; generalized model uses projection (P2-D06) |
| Checkpoint approval modal component | `@hbc/models/` | `apps/admin/src/components/` or `@hbc/ui-kit` | UI components are not shared types |
| Orchestrator retry logic | `@hbc/models/` | `backend/functions/src/` | Runtime logic belongs in the backend |
| Azure Table persistence adapter | `@hbc/models/` | `backend/functions/src/services/` | Storage implementations are runtime |

## Phase 3 handoff notes

Phase 3 (Privileged Backend Foundation) should:

1. **Create a new admin control-plane domain host** under `backend/functions/src/hosts/admin-control-plane/` following the project-setup host pattern (ADR-0124).
2. **Import all shared contracts** from `@hbc/models/admin-control-plane` — do not recreate types locally.
3. **Implement route handlers** against the API contract catalog DTOs, using existing `withAuth()`, `parseBody()`/`parseQuery()`, and response helpers.
4. **Implement the adapter registry** using the `IAdminAdapterDescriptor` and `IAdminAdapterResult` contracts, extending the service factory pattern.
5. **Keep provisioning routes in the project-setup host** — do not merge them into the admin control-plane host.
6. **Add Zod validation schemas** in `@hbc/models/api-schemas/` for the new API DTOs, following the existing schema pattern.

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Action catalog](admin-control-plane-action-catalog.md) | Action vocabulary contracts |
| [Run model](admin-control-plane-run-model.md) | Run envelope and lifecycle contracts |
| [API contract catalog](admin-control-plane-api-contract-catalog.md) | Request/response DTOs |
| [Checkpoint contract](admin-control-plane-checkpoint-and-execution-modes.md) | Checkpoint/approval contracts |
| [Audit/evidence contracts](admin-control-plane-audit-evidence-and-config-contracts.md) | Audit, evidence, config contracts |
| [Adapter registry contract](admin-control-plane-adapter-registry-contract.md) | Adapter contracts |
| [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) | Layer ownership rules |
| [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | LD-03, LD-04 |
