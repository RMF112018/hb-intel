# White-Glove Connector Governance Reference

> Connector registry, policy toggles, configuration versioning, and secret handling for white-glove device deployment.

**Backend service:** `ConnectionRegistryService` in `backend/functions/src/services/connection-registry-service.ts`
**Shared types:** `@hbc/models/admin-control-plane` — `IConnectorGovernanceRecord`, `IConnectorPolicyToggles`, `ConnectorClassEnum`
**Consumers:** `backend/functions/` (orchestrator, adapters, preflight), `apps/admin/` (connector setup UX)

## Connector classes

| Class | Enum value | Domain | Purpose |
|-------|-----------|--------|---------|
| AD DS | `ad-ds` | Hybrid identity | On-premises Active Directory |
| Graph Identity | `graph-identity` | Hybrid identity | Entra ID / Microsoft Graph |
| Microsoft Intune | `microsoft-intune` | White-glove | Device management and compliance |
| Microsoft Autopilot | `microsoft-autopilot` | White-glove | Windows enrollment and pre-provisioning |
| Apple Business Manager | `apple-abm` | White-glove | Apple device procurement |
| Apple ADE | `apple-ade` | White-glove | Automated Device Enrollment |
| Apple APNs | `apple-apns` | White-glove | Push notification and MDM |
| NinjaOne API | `ninjaone-api` | White-glove | Post-enrollment automation |

Source: `ConnectorClass` type in `connection-registry-service.ts`, `ConnectorClassEnum` in `@hbc/models`.

## Data storage model

### Stored directly (non-secret)

- `connectorId` — unique identifier
- `connectorClass` — which external system
- `displayName` — operator-visible name
- `config` — non-secret configuration metadata (endpoints, tenant IDs, org identifiers)
- `configVersion` — monotonically increasing version number
- `policyToggles` — operator-managed behavior flags
- `changeHistory` — last 50 change entries with attribution
- Health metadata (status, test results, timestamps)
- Audit metadata (createdAt, updatedAt, createdBy, updatedBy)

### Referenced securely (never returned in API)

- `credential` — password, certificate reference, OAuth secret, or API key
- Resolved only by `resolveCredential()` (backend-internal, never exposed to API)
- `hasCredential` boolean flag indicates presence without revealing value

### Credential flow

1. **Write:** SPFx sends credential in `IConnectionUpsertRequest.credential`
2. **Store:** Backend stores the raw value (Phase 9: in-memory; future: Table Storage with encryption)
3. **Read:** API responses include `hasCredential: true` but never the value itself
4. **Resolve:** Backend adapters call `resolveCredential(connectorId)` at execution time

## Configuration versioning

- `configVersion` starts at 1 on creation and increments on every change
- Every change produces an `IConnectionChangeEntry` in the history
- Change types: `created`, `updated`, `policy-changed`, `credential-rotated`
- History is capped at 50 entries (most recent first)
- Each entry records: version, timestamp, actor UPN, change type, summary

## Policy toggles

| Toggle | Default | Purpose |
|--------|---------|---------|
| `enabled` | `true` | Whether the connector is active and usable |
| `dryRunOnly` | `true` | Only dry-run execution allowed (no real changes) |
| `productionLaunchAllowed` | `false` | Whether real production launches are permitted |
| `highRiskCheckpointRequired` | `true` | Force checkpoint on high-risk actions |

New connectors start in a restricted state: enabled but dry-run only, no production launches, checkpoints required. IT must explicitly open gates for production use.

Source: `CONNECTOR_DEFAULT_POLICY_TOGGLES` in `@hbc/models`.

## API endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/admin/connections` | DelegatedScope | List all connections |
| POST | `/api/admin/connections` | DelegatedScope + Admin | Create or update a connection |
| POST | `/api/admin/connections/{connectorId}/test` | DelegatedScope + Admin | Test a connection |
| GET | `/api/admin/connections/{connectorId}/history` | DelegatedScope | Get change history |
| PATCH | `/api/admin/connections/{connectorId}/policy` | DelegatedScope + Admin | Update policy toggles |

## Health lifecycle

```
untested → (test) → healthy | unhealthy
healthy  → (config change) → untested → (test) → healthy | unhealthy
unhealthy → (test) → healthy | unhealthy
```

Configuration changes reset health to `untested`. The operator must re-test after changes.

## Cross-references

- [Architecture baseline](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md)
- [Connector governance architecture](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-connector-governance-architecture.md)
- [Domain model reference](../white-glove/white-glove-domain-model.md)
- [Wave 0 config registry](wave-0-config-registry.md)
