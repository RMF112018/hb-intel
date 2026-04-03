# Phase 3 Addendum — Managed App Binding Backend Foundation

**Prompt:** P00A — Phase 6A Upstream Architecture and Plan Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Make explicit that the Phase 3 backend foundation must support binding store, retrieval, publication, and repair entry points.

---

## 1. Context

Phase 3 established the privileged backend foundation: composition root, service container, adapter registry, API surface, and orchestration bridge. None of these mention app binding. Phase 6A requires backend ownership of binding persistence, publication, and resolution. This addendum identifies the binding-specific backend responsibilities that Phase 6A will add, consistent with Phase 3 patterns.

---

## 2. What Phase 3 already established (confirmed repo fact)

- The API surface (`admin-control-plane-api-surface-and-route-catalog.md`) defines 13 endpoints — none for binding resolution or binding management.
- The service container and factory (`admin-control-plane-service-factory-and-container-plan.md`) define the composition root for wiring services — binding service will follow this pattern.
- The adapter registry (`admin-control-plane-adapter-registry-and-routing-foundation.md`) defines the adapter invocation pattern — binding-related adapters (if any) will follow this pattern.
- The orchestration bridge (`admin-control-plane-orchestration-bridge-plan.md`) generalizes the provisioning saga into a reusable execution substrate.

---

## 3. What this addendum makes explicit (new architectural reconciliation)

### Binding store and retrieval API support

Phase 6A will add binding-specific API endpoints following the Phase 3 route registration pattern:

- **Resolve app binding** — target apps call this endpoint to retrieve their current binding before backend-dependent execution.
- **Get binding status** — the Admin operator console calls this to show binding posture for managed apps.
- **Publish / update binding** — the install/setup flow and repair workflows call this to write or update binding records.
- **Report binding drift** — verification checks report mismatches through this surface.

### Publication and repair entry points

- Binding publication is triggered by install/bootstrap completion or by explicit operator repair actions.
- Repair/re-publish follows the same command-handler pattern established by Phase 3 for other admin operations.
- Publication must be idempotent — re-publishing the same values should not create duplicate audit events.

### Backend ownership of app-binding persistence and publication

- The backend/control plane is the **sole authority** for writing, versioning, and repairing binding records.
- Binding records are persisted in the same durable store infrastructure established by Phase 4 (Azure Tables).
- The backend publishes binding; SPFx and target apps consume it.

### Target-app read-model access pattern

- Target apps resolve binding by calling a backend API endpoint — they do not query binding storage directly.
- The resolution response includes the binding fields plus metadata (version, last-verified timestamp, status).
- This pattern preserves the control-plane boundary: target apps are consumers, not authorities.

---

## 4. Relationship to later phases

- **Phase 6A** implements the binding service, store, API endpoints, and install-flow integration.
- **Phase 10** may extend the binding store into a broader configuration registry without replacing the binding resolution API pattern.

---

## 5. Cross-references

| Document | Relevance |
|----------|-----------|
| `admin-control-plane-api-surface-and-route-catalog.md` | API surface — binding endpoints follow this route registration pattern |
| `admin-control-plane-service-factory-and-container-plan.md` | Service container — binding service follows this composition pattern |
| `admin-control-plane-adapter-registry-and-routing-foundation.md` | Adapter registry — applicable if binding uses platform adapters |
| `admin-control-plane-orchestration-bridge-plan.md` | Orchestration bridge — binding publication may integrate with install orchestration |
| `phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md` | Central reconciliation note |
