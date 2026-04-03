# Phase 2 Addendum — Managed App Binding Contract Model

**Prompt:** P00A — Phase 6A Upstream Architecture and Plan Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Make explicit the first-class app-binding contracts that the Phase 2 domain model should anticipate.

---

## 1. Context

Phase 2 defined reusable contracts for admin runs, actions, checkpoints, audit, adapters, and configuration governance. None of those contracts mention app binding. Phase 6A requires a first-class binding contract model. This addendum identifies the binding-specific contract surface that Phase 6A will add, consistent with Phase 2 patterns.

---

## 2. What Phase 2 already established (confirmed repo fact)

- The audit/evidence contract model (`admin-control-plane-audit-evidence-and-config-contracts.md`) defines 13 audit event types — none are binding-related.
- The API contract catalog (`admin-control-plane-api-contract-catalog.md`) defines endpoint contracts — none include binding resolution.
- The run model (`admin-control-plane-run-model.md`) defines `IAdminRunEnvelope` and `AdminRunStatus` — the envelope pattern is reusable for binding operations.
- The config/governance contract model anticipates live-admin-maintained standards — binding is an early governed slice of that model.

---

## 3. What this addendum makes explicit (new architectural reconciliation)

### First-class app-binding contracts

Phase 6A will add binding-specific contracts following existing Phase 2 patterns. The binding contract surface includes:

- **Per-app binding record**: durable record associating a managed app identifier with its resolved backend configuration.
- **Binding resolution response**: the payload returned to a target app when it resolves its binding before backend-dependent execution.

### Binding status vocabulary

Phase 6A should define a binding status model consistent with the existing `AdminRunStatus` pattern. Expected statuses:

| Status | Meaning |
|--------|---------|
| `unbound` | No binding record exists for this app |
| `published` | Binding has been published and is available for resolution |
| `verified` | Binding has been verified against the live environment |
| `drifted` | Binding no longer matches the live environment state |
| `repair-pending` | A repair/re-publish operation has been requested |

### Binding publish / drift / repair events

Phase 6A should add binding-specific audit event types consistent with the existing `AdminAuditEventType` pattern:

- `binding.published` — binding record created or updated
- `binding.verified` — binding verified against live state
- `binding.drift-detected` — mismatch found between binding and live state
- `binding.repaired` — binding re-published after drift or failure
- `binding.resolved` — target app successfully resolved its binding (optional, for consumption audit)

### Binding evidence and audit shape

Binding events should carry evidence references following the existing `IAdminEvidenceReference` pattern, including:

- The published binding payload
- The verification check results
- The drift comparison details
- The repair action details and prior binding snapshot

### Target-app runtime binding fields

The binding contract must include at minimum:

| Field | Type | Purpose |
|-------|------|---------|
| `functionAppUrl` | `string` | Backend Function App endpoint URL |
| `apiAudience` | `string` | API audience for token acquisition |
| `backendMode` | `string` | Current backend operational mode |
| `allowBackendModeSwitch` | `boolean` | Whether the target app may switch backend modes |

Additional fields (resource/scope relationships, approval status coupling) may be added by Phase 6A as implementation proceeds.

---

## 4. Relationship to later phases

- **Phase 6A** implements these contracts as real shared types and backend service interfaces.
- **Phase 10** generalizes the binding contract into the broader governed configuration model without breaking runtime consumers.

---

## 5. Cross-references

| Document | Relevance |
|----------|-----------|
| `admin-control-plane-audit-evidence-and-config-contracts.md` | Audit event types and evidence model — binding events follow this pattern |
| `admin-control-plane-api-contract-catalog.md` | API contract catalog — binding resolution endpoint follows this pattern |
| `admin-control-plane-run-model.md` | Run envelope pattern — reusable for binding operations |
| `phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md` | Central reconciliation note |
