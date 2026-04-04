# Phase 10 — Config Override Store Implementation Notes

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 04  
**Date:** 2026-04-03

---

## Provider abstraction

**Interface:** `IConfigOverrideStore` (defined in `config-override-store.ts`, re-exported via `types.ts`)

Methods:
- `getOverride(key)` — single record lookup
- `listOverrides(domain?)` — domain-scoped or full list
- `putOverride(request, actor)` — create or update with optimistic concurrency
- `revertOverride(request, actor)` — revert to code default with concurrency check
- `getHistory(key)` — append-only audit log, newest first

## Storage shape

**ConfigOverrides table:**
- PartitionKey: `domain` (enables domain-scoped queries for the admin UI catalog view)
- RowKey: `configKey` (unique per item)
- Fields: `valueJson`, `version`, `status`, `lastModifiedByJson`, `lastModifiedAt`, `createdAt`, `reason`

**ConfigAuditLog table:**
- PartitionKey: `configKey` (groups all history for one item)
- RowKey: `eventId` (UUID, unique per event)
- Fields: `eventType`, `domain`, `previousValueJson`, `newValueJson`, `previousVersion`, `newVersion`, `actorJson`, `timestamp`, `reason`
- Append-only: records are created via `createEntity()`, never updated or deleted

## Why this implementation fits current repo truth

1. **Follows existing persistence pattern.** The store uses `createAppTableClient()` from `table-client-factory.ts`, matching `DurableAdminRunStore`, `DurableAdminAuditStore`, and `DurableAdminAppBindingStore`.

2. **Follows existing service factory pattern.** Wired into `IAdminControlPlaneServiceContainer` with `MockConfigOverrideStore` for test/mock mode and `DurableConfigOverrideStore` for production, matching the existing adapter-mode switching pattern.

3. **Follows existing serialization pattern.** Complex fields (value, actor) are JSON-serialized with `*Json` suffix. Exported `serialize*`/`deserialize*` functions enable direct round-trip testing, matching the pattern in `admin-run-store.ts` and `admin-audit-store.ts`.

4. **Follows existing test pattern.** Tests are in `__tests__/config-override-store.test.ts`, using mock store + serialization round-trips, matching `app-binding-store.test.ts` and `durable-stores.test.ts`.

5. **Shared DTOs in `@hbc/models`.** Override record, audit event, snapshot, and write request types are in `packages/models/src/admin-control-plane/IConfigGovernance.ts`, following the existing pattern where transport-agnostic DTOs live in the models package.

## Design decisions

- **Optimistic concurrency via `expectedVersion`.** Prevents stale-write conflicts without distributed locks. Matches the concurrency model specified in P10-02 §8.
- **Separate tables for overrides and audit.** Overrides are mutable (upsert); audit is append-only (createEntity). This separation follows the pattern of `AdminRuns` (mutable) vs `AdminAuditEvents` (append-only).
- **Domain-partitioned overrides.** Enables efficient domain-scoped queries for the admin UI catalog view without full table scans.
- **Key-partitioned audit.** Enables efficient per-item history retrieval.
- **Future-compatible.** The `IConfigOverrideStore` interface can be implemented by an Azure App Configuration provider or any other backend without changing consumers.
