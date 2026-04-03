# Phase 9 Backend Contract Notes

## Purpose

Explain what backend substrate was added in Prompt-05 and why it is the smallest clean fit for Phase 9 hybrid identity workflows.

## What was added

### 1. `hybrid-identity-contracts.ts` — Action types and request/response shapes

Defines the typed action catalog, request payloads, result normalization, audit payload shape, and workflow routing types for all 30 cataloged Phase 9 identity actions.

**Why this shape:**
- Each action has a typed request interface with action-specific fields (e.g., `IUserCreateADDSRequest` includes `targetOu`, `IGroupMembershipCloudRequest` includes `memberUpns`).
- A union type `HybridIdentityRequestPayload` allows API handlers to accept any valid request.
- The normalized `IHybridIdentityResult` provides a consistent response shape with authority-used, sync-state, and error detail.
- The `IHybridIdentityAuditPayload` captures who/what/where/why/outcome for every action.
- These are phase-local types — not an attempt to complete the broader generalized admin-run platform.

### 2. `hybrid-identity-validators.ts` — Validation primitives

Input validation for:
- **Identifiers:** UPN, GUID, sAMAccountName, distinguished name patterns
- **Property mutations:** Allowed-set enforcement for AD DS and cloud user updates
- **Authority compatibility:** Prevents AD DS mutations on cloud-only objects and vice versa
- **Destructive confirmation:** Requires confirmation tokens for delete actions
- **Connector preflight:** Maps actions to required connectors and validates health before execution
- **Member lists:** Validates UPN and DN lists for membership operations

**Why this shape:**
- Validators are pure functions that throw `IdentityValidationError` — composable and testable.
- The connector-action map is data-driven (a `Map<ActionId, ConnectorClass[]>`) so adding new actions does not require code changes in the validator.
- Authority compatibility uses sets of AD DS and cloud action IDs — clear and auditable.

### 3. `hybrid-identity-workflow-router.ts` — Routing and catalog

Static action catalog (30 descriptors) and routing logic:
- `getActionDescriptor(actionId)` — look up metadata for any action
- `resolveRoutingDecision(actionId)` — determine authority, execution boundary, required connectors, preflight checks, risk tier, and checkpoint requirement
- `buildAuditPayload(params)` — normalize audit data for any action outcome

**Why this shape:**
- The catalog is a static array of descriptors that mirrors the Phase 9 identity action catalog (P9-03). It is the code-side source of truth for what actions exist and how they route.
- `resolveRoutingDecision` is the central function that later prompts (06–09) call before dispatching to adapters. It returns a single `IWorkflowRoutingDecision` that captures everything the handler needs to know.
- `buildAuditPayload` normalizes audit data so every action handler produces consistent audit records without duplicating the shaping logic.

## What was NOT added

- **API endpoints** — Prompt-05 creates the substrate; Prompt-08 adds the API routes.
- **Workflow orchestration** — The routing decision says *where* to execute; Prompts 06–07 implement the *how*.
- **UI models** — Frontend types are not defined here; they will be shaped in Prompt-08.
- **Generalized admin-run integration** — The existing admin-run store and audit service are reused where they exist. Phase 9 types are phase-local where the broader platform abstraction is not yet complete.

## Relationship to existing contracts

| Existing contract | Phase 9 relationship |
|------------------|---------------------|
| `AdminDomain` enum (includes `EntraControl`) | Phase 9 actions map to `EntraControl` domain in the existing taxonomy |
| `AdminRiskLevel` enum | Phase 9 risk tiers (`routine`, `elevated`, `destructive`) align with `Low`, `Moderate`, `Critical` |
| `AdminExecutionMode` enum | Phase 9 uses `Seamless` (routine), `Checkpointed` (elevated), `Destructive` (destructive) |
| `IAdminAuditRecord` | Phase 9 audit payloads can be wrapped into `IAdminAuditRecord` at the API layer |
| `IAdminActionDescriptor` | Phase 9 `IHybridIdentityActionDescriptor` is a phase-local equivalent with identity-specific fields |

## Connection / configuration contracts

The connection registry service (Prompt-04) already defines the connection record, health, and test shapes. Prompt-05 adds:
- `ConnectorClass` usage in action descriptors (`requiredConnector` field)
- Connector-action mapping in validators (`ACTION_CONNECTOR_MAP`)
- Preflight integration via `validateConnectorPreflight` and `assertHealthy`

These ensure that no action can execute against an unconfigured or unhealthy connector, enforcing the no-code handoff gate at the contract level.
