# White-Glove Connector Governance — Architecture Decisions

## Purpose

Document the design decisions behind the connector governance extension for white-glove device deployment. For the full type reference, see [white-glove-connector-governance.md](../../../../../reference/configuration/white-glove-connector-governance.md).

## Decision 1: Extend existing registry, not a new service

**Choice:** Extend `ConnectionRegistryService` with new connector classes, versioning, and policy toggles rather than creating a separate white-glove connector service.

**Why:**
- The Phase 9 `ConnectionRegistryService` already has the right patterns: CRUD, credential redaction, health tracking, test execution.
- A separate service would duplicate the credential handling, health lifecycle, and API surface.
- The `ConnectorClass` type is a union that naturally extends with new values.
- The service factory already wires `connectionRegistry` — no new wiring needed.

## Decision 2: Backend-only secret resolution

**Choice:** Credentials are write-only from the API perspective. `resolveCredential()` is a backend-internal method never exposed to API consumers.

**Why:**
- SPFx runs in the browser. Credential values must never be present in API responses.
- The `hasCredential` flag lets the UI show whether a credential is configured without revealing it.
- Backend adapters resolve credentials at execution time when making calls to external systems.
- This pattern is already proven in Phase 9 for AD DS and Graph identity connectors.

## Decision 3: Monotonic version + change history

**Choice:** Every configuration change increments `configVersion` and appends to `changeHistory` (capped at 50 entries).

**Why:**
- Versioning enables the `IWhiteGloveConnectorSnapshot` to record which config version was active at run launch time. This is critical for diagnosing failures after the fact.
- Change history with attribution (who, when, what type) satisfies the audit requirement without requiring a separate audit table for connector changes.
- The 50-entry cap prevents unbounded growth while retaining enough history for operational diagnosis.

## Decision 4: Conservative default policy toggles

**Choice:** New connectors start enabled but restricted: `dryRunOnly: true`, `productionLaunchAllowed: false`, `highRiskCheckpointRequired: true`.

**Why:**
- IT should be able to set up and test a connector without it being used in production runs immediately.
- The explicit opt-in for production launches prevents accidental deployment through a partially configured connector.
- The high-risk checkpoint requirement is a safety net that IT can remove once confidence is established.
- These defaults align with the no-go constraint that connector handling requires governance.

## Decision 5: Shared types in @hbc/models

**Choice:** `ConnectorClassEnum`, `IConnectorPolicyToggles`, `IConnectorGovernanceRecord`, and related types live in `@hbc/models/admin-control-plane`.

**Why:**
- Both the backend (service implementation) and frontend (connector setup UX) need these types.
- The backend `ConnectorClass` type alias remains for internal use; the enum in `@hbc/models` provides a proper enumeration for UI consumption (dropdown menus, display labels).
- This follows the established pattern where shared domain types live in `@hbc/models` and backend-only types stay in the service files.

## Integration with white-glove run preflight

The connector governance model integrates with the white-glove run lifecycle at preflight:

1. **Before launch:** Preflight checks verify all required connectors are configured, healthy, and have `enabled: true` and `productionLaunchAllowed: true` (unless dry-run).
2. **At launch:** `IWhiteGloveConnectorSnapshot` captures the `configVersion` and health state of each connector.
3. **During execution:** Adapters call `resolveCredential()` and `assertHealthy()` before making external calls.
4. **Policy enforcement:** `dryRunOnly` prevents real external calls; `highRiskCheckpointRequired` forces checkpoints on destructive operations.

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md)
- [Boundary matrix](white-glove-boundary-matrix.md)
- [Domain model reference](../../../../../reference/white-glove/white-glove-domain-model.md)
- [Connector governance reference](../../../../../reference/configuration/white-glove-connector-governance.md)
