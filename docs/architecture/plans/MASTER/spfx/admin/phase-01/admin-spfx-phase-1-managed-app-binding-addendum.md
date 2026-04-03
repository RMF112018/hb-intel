# Phase 1 Addendum — Managed App Binding as a Control-Plane Concern

**Prompt:** P00A — Phase 6A Upstream Architecture and Plan Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Make explicit within the Phase 1 boundary model that managed app binding is a control-plane concern.

---

## 1. Context

Phase 6A inserts a first-class managed-app binding slice into the Admin SPFx roadmap. Phase 1 established the 5-layer operating model, boundary matrix, locked decisions, and domain taxonomy — but none of those artifacts mention app binding. This addendum closes that gap without rewriting Phase 1.

---

## 2. What Phase 1 already established (confirmed repo fact)

- The 5-layer architecture model (`admin-spfx-phase-1-architecture-baseline.md`) assigns privileged execution, persistence, and audit to the backend/control-plane layer.
- The boundary matrix (`admin-spfx-boundary-matrix.md`) defines 21+ capability rows across 6 domain groups, all respecting the SPFx-as-operator-console / backend-as-privileged-executor split.
- Locked decisions LD-01 through LD-10 (`admin-spfx-locked-decisions-and-phase-boundary-guards.md`) govern what stays in SPFx and what stays in the backend.

---

## 3. What this addendum makes explicit (new architectural reconciliation)

### Managed app binding is a control-plane concern

- The backend/control plane owns publication, versioning, audit, and repair of app-binding records.
- App-binding is governed runtime configuration, not an incidental per-package build-time detail.

### Target apps read governed binding but do not write privileged configuration

- Managed SPFx apps (at minimum Accounting and Project Setup) consume a resolved binding before making backend-dependent calls.
- They call a backend resolution endpoint — they do not directly query binding storage or modify binding records.
- Target apps are **consumers**, not **authorities**, for backend-setup configuration.

### The binding layer sits between privileged setup execution and target-app runtime consumption

- Install/bootstrap (Phase 6) produces setup outputs.
- Binding publication (Phase 6A) transforms those outputs into durable, resolvable, auditable records.
- Target-app runtime resolution consumes those records before backend-dependent execution.
- These are three distinct concerns with clear ownership boundaries.

### No locked decisions are changed

- LD-01 through LD-10 remain intact. Binding as a control-plane concern is consistent with the existing boundary guards — it reinforces them.

---

## 4. Relationship to later phases

- **Phase 6A** implements the binding model, store, retrieval, verification, and repair.
- **Phase 10** generalizes and extends the binding substrate into broader governed configuration — it does not invent binding from scratch.

---

## 5. Cross-references

| Document | Relevance |
|----------|-----------|
| `admin-spfx-phase-1-architecture-baseline.md` | 5-layer model — binding fits in control-plane and persistence layers |
| `admin-spfx-boundary-matrix.md` | Capability ownership — binding follows the same SPFx/backend split |
| `admin-spfx-locked-decisions-and-phase-boundary-guards.md` | LD-01 through LD-10 — all preserved |
| `phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md` | Central reconciliation note |
