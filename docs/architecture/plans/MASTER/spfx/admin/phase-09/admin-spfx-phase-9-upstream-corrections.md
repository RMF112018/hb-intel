# Phase 9 — Upstream Architecture, Boundary, and Contract Corrections

## 1. Purpose

Document the upstream corrections applied to Phases 1–5 so their doctrine, boundary expectations, and contract descriptions no longer assume an Entra-only identity model and correctly prepare for Hybrid Identity Administration.

## 2. Inputs actually used

| Source | Purpose |
|--------|---------|
| `admin-spfx-phase-9-program-ripple-map.md` | Canonical correction list |
| `packages/models/src/admin-control-plane/AdminEnums.ts` | Domain enum JSDoc |
| `phase-05/Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md` | Lane naming |
| Phase 1–4 summary plans | Verified as non-ripple (architecture-level, domain-agnostic) |

## 3. Upstream assumptions being corrected

| Assumption | Status before | Corrected to |
|-----------|---------------|-------------|
| Identity domain is Entra-only | `AdminDomain.EntraControl` JSDoc said "Entra ID user/group administration" | JSDoc now says "Hybrid identity administration (AD DS/on-prem and Entra ID/Graph)" |
| Lane name is "Entra Control" | Phase 5 lane list said "Entra Control" | Lane list now says "Identity (Hybrid Identity)" |
| Graph is the sole identity execution boundary | Implicit in Entra-only framing | Backend now has AD DS adapter + Graph service as distinct boundaries |
| All identity actions route through Graph | Implicit in Entra-only framing | Source-of-authority routing determines execution boundary per action |

## 4. Corrected doctrine by phase

### Phase 1 — No correction needed

Phase 1 locked decisions and boundary matrix are architecture-level and domain-agnostic. The separation of SPFx (console) from backend (executor) holds for hybrid identity. No Entra-only assumptions found.

### Phase 2 — JSDoc comment corrected

The `AdminDomain.EntraControl` enum value (`'entra-control'`) is a stable identifier that does not need renaming. The JSDoc comment was updated from "Entra ID user/group administration" to "Hybrid identity administration (AD DS/on-prem and Entra ID/Graph)" to accurately describe the domain's scope.

**File changed**: `packages/models/src/admin-control-plane/AdminEnums.ts` line 31

The enum value, action key format (`entra-control:identity:*`), audit domain value, and all downstream consumers remain unchanged. Only the human-readable description was corrected.

### Phase 3 — No correction needed

The service factory, adapter registry, and API surface were designed as domain-agnostic extension points. Phase 9 extended them cleanly by adding `adDirectory` and `connectionRegistry` to the service container. No Entra-only assumptions exist in Phase 3 architecture.

### Phase 4 — No correction needed

The audit store (`DurableAdminAuditStore`), evidence model (`IAdminEvidenceReference`), and run envelope (`IAdminRunEnvelope`) are all domain-agnostic. Phase 9 identity routes persist audit records using the same `IAdminAuditRecord` type with `domain: 'entra-control'` and `eventType: RunCompleted/RunFailed`. No corrections required.

### Phase 5 — Lane naming corrected

The Phase 5 summary plan listed "Entra Control" in the operator console lane navigation. The implemented code (`lane-registry.ts`) already uses label "Identity" with route ID `entra`. Updated the Phase 5 doc to say "Identity (Hybrid Identity)" to match the implemented reality and Phase 9 redirect.

**File changed**: `docs/architecture/plans/MASTER/spfx/admin/phase-05/Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md` (2 occurrences)

## 5. Corrected boundary/contract expectations

The following boundary expectations are now explicitly documented as upstream doctrine:

| Boundary | Expectation |
|----------|------------|
| SPFx (operator console) | Displays identity state, collects operator input, renders risk/confirmation UX. Never executes privileged identity operations. Never stores credentials. |
| Backend (privileged executor) | Executes all identity mutations through the correct adapter (AD DS or Graph). Stores connection credentials securely. Resolves source of authority. Produces audit payloads. |
| AD DS adapter | Handles on-prem LDAPS operations for AD DS-authoritative objects. Interface defined; mock implementation in place; real LDAPS connector is follow-up. |
| Graph service | Handles cloud-side identity operations for Entra-authoritative objects. Provides sync-status visibility for AD DS-synced objects. |
| Connection registry | UI-managed connector configuration with write-only credential storage. Supports health test, rotation, and preflight validation. |
| Audit store | Domain-agnostic. Records identity operations with `domain: 'entra-control'`, authority used, sync state, and error classification. |

## 6. Corrected audit/evidence expectations

The audit/evidence model does not assume a single Graph-backed action lane. Phase 9 identity audit records now capture:

| Field | Purpose |
|-------|---------|
| `domain` | `'entra-control'` — stable identifier for hybrid identity domain |
| `actionKey` | `'entra-control:identity:{verb}'` — specific action performed |
| `summary` | Includes action ID, target object type, target identifier, and success/failure |
| `actor` | Operator UPN, OID, display name, timestamp |
| `eventType` | `RunCompleted` or `RunFailed` — reuses existing audit event types |

The `IHybridIdentityAuditPayload` (backend-internal) captures additional detail:
- `sourceOfAuthority`: `'ad-ds'` | `'entra'` | `'coordinated'` | `'visibility'`
- `executionBoundary`: `'graph'` | `'ad-ds'` | `'authority-routed'` | `'both'`
- `connectorUsed`: `'ad-ds'` | `'graph-identity'` | `null`
- `syncState`: pending/window/last-known for AD DS mutations
- `riskTier`: `'routine'` | `'elevated'` | `'destructive'` | `'sync-sensitive'`

This supports AD DS execution, cloud-side verification, readiness/preflight failure, blocked actions, and source-of-authority traceability.

## 7. Repo-aligned naming changes applied

| Surface | Before | After | Rationale |
|---------|--------|-------|-----------|
| `AdminEnums.ts` JSDoc (line 31) | "Entra ID user/group administration" | "Hybrid identity administration (AD DS/on-prem and Entra ID/Graph)" | Accuracy |
| Phase 5 summary lane list (2 occurrences) | "Entra Control" | "Identity (Hybrid Identity)" | Match implemented code |

### Naming preserved (no change)

| Surface | Value | Rationale |
|---------|-------|-----------|
| `AdminDomain.EntraControl` enum value | `'entra-control'` | Stable identifier; renaming requires migration |
| Lane registry ID | `'entra'` | URL compatibility |
| Lane registry path | `'/entra'` | Backward compatibility |
| Page file name | `EntraLanePage.tsx` | Renaming breaks imports |
| Route file name | `hybrid-identity-routes.ts` | Already correct |
| Audit domain value | `'entra-control'` | Matches enum |

## 8. Explicit non-goals

- Do not rename `AdminDomain.EntraControl` enum value or its string literal — this is a stable identifier
- Do not rename route paths, lane IDs, or file names — backward compatibility
- Do not rewrite Phase 1–4 architecture docs — they are domain-agnostic and correct
- Do not update downstream phases (10–12) — those are handled by Prompt 15
- Do not update setup/preflight/provisioning docs — those are handled by Prompt 14
- Do not add new features or capabilities — Prompt 13 is corrections only
