# Phase 9 Hybrid Identity Architecture Baseline

## 1. Purpose

Define the canonical architecture baseline for **Phase 9 — Hybrid Identity Administration foundation** within the Admin SPFx IT Control Center.

This baseline establishes what the Hybrid Identity control lane is, which layer owns which responsibility, and what execution boundaries Phase 9 must build. It is a **redirection** of the earlier Entra-only Phase 9 intent — not an unrelated side architecture.

All architectural decisions in this document are governed by the Phase 9 hard gate:

> After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

---

## 2. Current foundations

Verified in Prompt-01 (`admin-spfx-phase-9-repo-truth-and-hybrid-gap-map.md`):

| Foundation | Location | Phase 9 role |
|------------|----------|--------------|
| Admin SPFx app shell | `apps/admin/` | Operator console — receives the Hybrid Identity lane |
| Lane registry with scaffold model | `apps/admin/src/router/lane-registry.ts` | `/entra` scaffold promoted to active |
| Permission-gating system | `@hbc/auth` — `PermissionGate`, `requireAdminAccessControl()` | Gates identity actions by operator role |
| Service factory pattern | `backend/functions/src/services/service-factory.ts` | Wires new identity services (real/mock) |
| Admin control plane | `backend/functions/src/hosts/admin-control-plane/service-factory.ts` | Hosts identity adapter invokers, connection registry, audit |
| Adapter registry | `backend/functions/src/services/admin-control-plane/adapter-registry.ts` | Already has `identity-provisioning:ad-ds` descriptor (no invoker) |
| Saga/orchestration pattern | `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Step-based, retry, compensate, audit — reusable for identity workflows |
| Table Storage persistence | `backend/functions/src/services/table-storage-service.ts` | Proven PartitionKey/RowKey pattern for new tables |
| Graph service | `backend/functions/src/services/graph-service.ts` | Starting point — 5 provisioning-era methods, must expand |
| Managed Identity auth | ADR-0078 | `DefaultAzureCredential` for Graph and SharePoint |
| Admin audit/evidence services | Admin control plane | Durable audit writes, evidence with retention classes |
| Retry utility | `backend/functions/src/utils/retry.ts` | Exponential backoff, transient detection |
| Session token factory | `apps/admin/src/utils/resolveSessionToken.ts` | Fresh Bearer token per frontend API call |

**Not present (must be built):**
- AD DS / on-prem execution boundary
- Connection registry service
- Hybrid identity action models
- Source-of-authority model
- Identity-specific UI pages beyond scaffold

---

## 3. Phase 9 operating model

### The Hybrid Identity control lane

The Hybrid Identity control lane is a **dedicated operator surface and privileged backend capability** for administering user lifecycle, group membership, and access in an environment where:

- **AD DS is the likely source of authority** for synced user lifecycle actions (create, update, disable, delete),
- **Microsoft Entra ID / Graph** is the cloud-side identity, access, sync-visibility, and follow-on control surface,
- **Groups and membership** have mixed authority depending on type (AD-synced vs cloud-only),
- and **rollout-critical access operations** must be executed quickly with audit trails regardless of authority source.

### Execution flow

```
Operator (IT admin)
  → Admin SPFx App (Hybrid Identity lane)
    → Backend API (authenticated, permission-gated)
      → Source-of-authority router
        → AD DS adapter (on-prem lifecycle actions)
        → Graph service (cloud-side actions, sync verification)
      → Connection registry (resolve connector credentials)
      → Audit service (record action, actor, target, authority, result)
    → Response to operator (result, sync-state, evidence)
```

### Operating principles

1. **SPFx is the operator console.** It collects operator intent, displays results, and shows connection/sync status. It never executes privileged identity operations.
2. **The backend is the privileged executor.** All AD DS, Graph, and connection operations run in the Azure Function control plane.
3. **Source-of-authority routing is first-class.** Every identity action must resolve which system is authoritative before execution.
4. **Connections are UI-managed.** IT configures, tests, rotates, and monitors connections through the admin app, not through code or config files.
5. **Audit is mandatory.** Every identity action produces a durable audit record with actor, action, target, authority, result, and timestamp.
6. **Existing patterns are reused.** The saga pattern, adapter registry, service factory, and Table Storage conventions are extended, not replaced.

---

## 4. Source-of-authority model

### Authority types

| Authority type | Meaning | Example objects |
|---------------|---------|-----------------|
| **AD DS authoritative** | The object is mastered in on-prem Active Directory and synced to Entra ID via Azure AD Connect. Lifecycle mutations (create, update, disable, delete) must execute against AD DS. | Synced user accounts, AD-synced security groups |
| **Entra authoritative (cloud-only)** | The object exists only in Entra ID with no on-prem counterpart. Lifecycle mutations execute against Graph. | Cloud-only users, cloud-only security groups, Microsoft 365 groups |
| **Mixed / context-dependent** | Authority depends on the specific object instance. The system must inspect sync state before routing. | Groups that could be either AD-synced or cloud-only |
| **Read-only / sync-visibility** | The action does not mutate the object. Cloud-side state is read via Graph regardless of authority source. | Sync status checks, last-sign-in queries, license state |

### Routing rules

1. **Before any mutation**, resolve the target object's authority type.
2. **AD DS-authoritative objects**: route lifecycle mutations to the AD DS adapter. After AD DS execution, optionally verify sync propagation via Graph.
3. **Cloud-only objects**: route lifecycle mutations to the expanded Graph service.
4. **Mixed-authority objects**: inspect the object's `onPremisesSyncEnabled` or equivalent flag via Graph to determine routing.
5. **Read-only actions**: always use Graph (cloud-side) regardless of authority source.
6. **Never mutate an AD DS-authoritative object through Graph alone** — this would create a conflict with the sync engine and is not supported.

### Operator visibility

The UI must display authority type for identity objects so operators understand:
- which system owns the object,
- where mutations will execute,
- what sync delays may apply after on-prem changes,
- and what actions are available vs blocked for the object's authority type.

---

## 5. Frontend responsibilities

**Owner:** `apps/admin/`

The Admin SPFx app is the operator console for hybrid identity administration. It is responsible for:

| Responsibility | Detail |
|---------------|--------|
| Hybrid Identity lane navigation | Promote `/entra` from scaffold to active; add sub-routes for users, groups, connections, audit |
| Connection management UX | Pages for configuring, testing, rotating, and viewing health of AD DS and Graph connectors |
| User administration UX | Search, view, create, update, disable users with source-of-authority visibility |
| Group administration UX | Search, view, create, update membership with authority-type indicators |
| Sync-status visibility | Display sync state, last-sync timestamps, propagation warnings |
| Risk-aware workflow UX | Confirmation dialogs, preview/impact panels for destructive actions, complexity gating |
| Audit/history surfaces | View identity action history, filter by actor/target/authority/result |
| Preflight feedback | Display connection health status, warn about unhealthy connectors before actions |
| Permission gating | Gate identity actions by operator role using `@hbc/auth` permission model |

**The frontend must NOT:**
- Execute AD DS or Graph operations directly
- Store, cache, or display connection credentials or secrets
- Make source-of-authority routing decisions (backend decides)
- Bypass permission gates or preflight checks

---

## 6. Backend / control-plane responsibilities

**Owner:** `backend/functions/`

The orchestration backend is the privileged execution boundary for all hybrid identity operations.

| Responsibility | Detail |
|---------------|--------|
| API endpoints | Identity action endpoints (user CRUD, group CRUD, sync check), connection management endpoints |
| Source-of-authority routing | Resolve authority type per object, route to correct adapter |
| AD DS adapter execution | Execute on-prem lifecycle operations via the AD DS execution boundary |
| Graph service execution | Execute cloud-side operations via the expanded Graph service |
| Connection registry | Store, resolve, test, and rotate connector configurations securely |
| Credential custody | Securely store and resolve connection credentials — never expose to frontend |
| Preflight validation | Validate connection health and permissions before executing identity actions |
| Audit persistence | Write durable audit records for every identity action via `IAdminAuditService` |
| Evidence capture | Capture execution evidence (timing, authority, downstream state) via `IAdminEvidenceService` |
| Error categorization | Classify failures by type (permission, connectivity, authority conflict, sync-pending, transient) |
| Retry and compensation | Reuse saga/retry patterns for multi-step identity workflows |

**The backend must NOT:**
- Expose connection credentials in API responses
- Assume Graph is authoritative for all objects without checking authority type
- Execute on-prem operations without resolving the AD DS connection from the registry
- Skip audit writes for identity actions

---

## 7. AD DS / on-prem execution responsibilities

**Owner:** New AD DS adapter in `backend/functions/`

This is a **new execution boundary** that Phase 9 must build. It does not exist in the current repo.

| Responsibility | Detail |
|---------------|--------|
| User lifecycle operations | Create, update, disable, delete users in on-prem AD DS |
| Group membership operations | Add/remove members from AD-synced security groups |
| Connection resolution | Resolve AD DS endpoint and credentials from the connection registry at execution time |
| Authentication | Authenticate to AD DS using service account credentials from the connection registry |
| Error handling | Classify AD DS errors (unreachable, auth failed, insufficient permissions, object not found, constraint violation) |
| Health checks | Test AD DS connectivity on demand (connection test from registry UI) |

**Technology choice:** The specific AD DS connector technology (LDAPS direct, hybrid agent relay, etc.) is deferred to Prompt-04 for detailed design. The architecture baseline establishes that:

1. The adapter must be invocable through the admin adapter registry.
2. Credentials must come from the connection registry, not environment variables.
3. The adapter must support real and mock implementations (service factory pattern).
4. Network connectivity to AD DS is an external infrastructure prerequisite.

**The AD DS adapter must NOT:**
- Run in SPFx or any frontend context
- Store credentials locally — always resolve from connection registry
- Assume network connectivity — validate before execution
- Execute without audit trail

---

## 8. Graph / Entra responsibilities

**Owner:** Expanded `graph-service.ts` in `backend/functions/`

The existing Graph service must be expanded from its current 5 provisioning-era methods to support hybrid identity operations.

| Responsibility | Detail |
|---------------|--------|
| User read/lookup/search | Query user profiles, account state, sync status via Graph v1.0 |
| Sync-status visibility | Read `onPremisesSyncEnabled`, `lastDirSyncTime`, sync-related properties |
| Cloud-only user lifecycle | Create, update, disable cloud-only users (not AD-synced) |
| Group type awareness | Distinguish AD-synced groups from cloud-only groups via sync properties |
| Cloud-only group lifecycle | Create, update, delete cloud-only security groups |
| Membership operations | Add/remove members for cloud-only groups |
| Post-action sync verification | After AD DS mutations, check cloud-side propagation state |
| Existing provisioning operations | Retain all current methods (group create, member add, site access) |

**Permission model:**
- Use least-privileged Graph application permissions per action
- Prefer `User.Read.All` for read, `User.ReadWrite.All` only for cloud-only mutations
- Prefer `Group.Read.All` for read, `Group.ReadWrite.All` only for cloud-only group mutations
- Prefer `GroupMember.ReadWrite.All` for membership operations
- Continue using Managed Identity via `DefaultAzureCredential`
- Migrate the `GRAPH_GROUP_PERMISSION_CONFIRMED` env-var gate to the connection registry

**The Graph service must NOT:**
- Mutate AD DS-authoritative users (create, update, disable synced users through Graph)
- Request broader permissions than the action catalog requires
- Assume all identity objects are cloud-only

---

## 9. Audit / evidence responsibilities

**Owner:** Existing `IAdminAuditService` and `IAdminEvidenceService` in the admin control plane

All hybrid identity operations must produce durable audit records. The existing audit and evidence services are reused, extended with identity-specific fields.

### Audit record fields for identity actions

| Field | Purpose |
|-------|---------|
| `actor` | Who initiated the action (resolved from Bearer token) |
| `action` | What was requested (e.g., `user:disable`, `group:add-member`) |
| `target` | What object was affected (user UPN, group ID) |
| `authorityType` | Which system is authoritative (AD DS, Entra, cloud-only) |
| `executionBoundary` | Which adapter executed (AD DS adapter, Graph service) |
| `result` | Outcome (success, failure, partial) |
| `errorDetail` | If failed, classified error with actionable message |
| `timestamp` | When the action completed |
| `correlationId` | Links related audit entries across multi-step workflows |
| `syncState` | If applicable, sync propagation status after AD DS mutation |

### Evidence capture

For elevated or destructive actions, the evidence service captures additional execution metadata:
- Pre-action state snapshot (where feasible)
- Execution timing
- Downstream verification results (sync propagation check)
- Connection health at time of execution

---

## 10. Explicit out-of-boundary items

These items are **not part of Phase 9** and must not be built:

| Item | Reason |
|------|--------|
| Full tenant-wide M365 administration | Out of scope — Phase 9 is hybrid identity, not broad M365 admin |
| Full device-join / workstation management | Phase 9B scope (white-glove device deployment) |
| Full password writeback / SSPR / federation redesign | Out of scope unless repo truth and approved scope explicitly require it |
| Phase 10 live standards/config governance | Later phase — minimal compatibility only |
| Phase 11 high-risk-action safety maturity | Later phase — Phase 9 builds clean foundations |
| Phase 12 observability completion | Later phase |
| Broad SharePoint control outside identity boundary | Phase 8 scope |
| `@hbc/features-admin` as privileged executor | Architectural violation — it remains reusable intelligence |
| Direct frontend-to-AD-DS communication | Architectural violation — all on-prem execution goes through backend |
| Direct frontend-to-Graph execution | Architectural violation — all Graph identity operations go through backend |

---

## 11. Reuse of provisioning-era patterns

Phase 9 deliberately extends existing patterns rather than inventing parallel infrastructure:

| Pattern | Current location | Phase 9 extension |
|---------|-----------------|-------------------|
| Saga/orchestration | `saga-orchestrator.ts` | Conceptual model for multi-step identity workflows (not necessarily same class) |
| Adapter registry | `adapter-registry.ts` | Add real invokers for `identity-provisioning:ad-ds` and identity-related Graph operations |
| Service factory | `service-factory.ts`, admin control plane factory | Wire new services (connection registry, AD DS adapter, expanded Graph) |
| Table Storage | `table-storage-service.ts` | New tables: `ConnectionRegistry`, identity audit/evidence entries |
| Admin run store | `admin-run-store.ts` | Identity action runs follow same durable run model |
| Admin audit service | Admin control plane | Identity actions produce audit records through existing service |
| Admin evidence service | Admin control plane | Elevated identity actions capture evidence through existing service |
| Retry utility | `retry.ts` | AD DS and Graph operations use same retry/backoff logic |
| Permission gating | `@hbc/auth` + `PermissionGate` | New identity-specific permission strings |
| Lane registry | `lane-registry.ts` | Promote `/entra` from scaffold to active |
| Session token factory | `resolveSessionToken.ts` | Identity API calls use same fresh-token pattern |

---

## 12. Forward-compatibility notes without phase bleed

Phase 9 establishes foundations that later phases will consume. To prevent phase bleed while maintaining forward compatibility:

| Future phase | What Phase 9 provides | What Phase 9 does NOT build |
|-------------|----------------------|----------------------------|
| Phase 9B (White-Glove Device Deployment) | Governed connection registry, no-code handoff model, adapter pattern, audit infrastructure | Device-specific adapters, device templates, device orchestration |
| Phase 10 (Standards/Config Governance) | Identity configuration as governed state, connection health model | Live config drift detection, automated remediation |
| Phase 11 (High-Risk Action Safety) | Risk tiers in action catalog, confirmation/preview patterns | Full risk-scoring engine, approval workflows for destructive actions |
| Phase 12 (Observability) | Audit records, evidence payloads, connection health metadata | Dashboards, alerting, SLA tracking |

**Design for extension, not for speculation:**
- Use interfaces and adapter patterns that later phases can extend
- Do not build empty frameworks for Phase 10–12 features
- Do not add configuration surfaces for features that Phase 9 does not implement
- Keep the connection registry extensible (new connector types) without building connectors Phase 9 does not need

---

## Validation

- This baseline aligns with Prompt-01 repo-truth findings — no target-state speculation is written as current implementation fact.
- Phase boundaries remain clear — only hybrid identity administration is in scope.
- The baseline is a redirection of the current Phase 9 intent (from Entra-only to hybrid identity), not an unrelated architecture.
- All referenced patterns and locations verified to exist in the repository.
- The architecture preserves the Admin SPFx target architecture (`admin-spfx-target-architecture.md`) rather than rewriting it.

## Cross-references

| Document | Purpose |
|----------|---------|
| `admin-spfx-phase-9-repo-truth-and-hybrid-gap-map.md` | Prompt-01 verified repo state and gap inventory |
| `admin-spfx-phase-9-connection-topology-and-config-gap-map.md` | Prompt-01 connection topology and configuration gaps |
| `admin-spfx-phase-9-no-code-handoff-gate-checklist.md` | Prompt-01 no-code handoff gate blocker enumeration |
| `admin-spfx-phase-9-scope-map.md` | Companion — what is and is not in Phase 9 scope |
| `admin-spfx-phase-9-connection-management-baseline.md` | Companion — connection management architecture |
| `admin-spfx-phase-9-no-code-handoff-gate.md` | Companion — architecture-level handoff gate definition |
| `admin-spfx-target-architecture.md` | Governing target architecture diagram |
| `admin-spfx-it-control-center-end-state-plan.md` | Full phased implementation program |
