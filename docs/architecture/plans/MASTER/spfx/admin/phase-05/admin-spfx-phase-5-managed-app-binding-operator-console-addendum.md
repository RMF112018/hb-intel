# Phase 5 Addendum — Managed App Binding Operator Console Accommodation

**Prompt:** P00A — Phase 6A Upstream Architecture and Plan Reconciliation  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Make explicit that the Phase 5 shell and lane model must accommodate app-binding status, configuration state, and repair surfaces.

---

## 1. Context

Phase 5 established the 8-lane operator console shell, route taxonomy, page ownership map, and navigation model. None of these mention app binding. Phase 6A will deliver binding status, configuration state, and repair UX. This addendum makes explicit that the lane model is ready to accommodate those surfaces, even though the detailed UX lands in Phase 6A.

---

## 2. What Phase 5 already established (confirmed repo fact)

- The operator console shell uses an 8-lane model (`admin-spfx-phase-5-route-taxonomy.md`):
  1. Setup / Install
  2. Validation
  3. Runs / History
  4. SharePoint Control
  5. Hybrid Identity
  6. Device Deployment
  7. Standards / Config
  8. Health / Alerts
- The page ownership map (`admin-spfx-phase-5-page-ownership-map.md`) assigns pages to lanes. The Setup lane was a scaffold for Phase 6.
- The operator console baseline (`admin-spfx-phase-5-operator-console-baseline.md`) defines the shell configuration and navigation behavior.
- Lane-driven navigation uses `lane-registry.ts` to map lanes to routes and metadata.

---

## 3. What this addendum makes explicit (new architectural reconciliation)

### App-binding status belongs in the operator console

Binding posture for managed apps — which apps are bound, which are unbound, which have drifted — is operator-visible information that belongs in the console. The natural homes are:

- **Standards / Config lane** — binding is governed runtime configuration; binding status and management fit here.
- **Setup / Install lane** — binding publication is a post-install concern; binding status may also surface in setup context.

Phase 6A will determine the exact routing, but the lane model must not prevent either placement.

### Configuration state visibility

The operator must be able to see:

- Per-app binding status (unbound, published, verified, drifted, repair-pending)
- Last-published binding values
- Last-verified timestamp
- Drift details when applicable

This is consistent with the operator console's existing pattern of status-oriented lane pages.

### Repair surfaces

Binding repair (re-publish, re-verify) must be initiable from the operator console. This follows the same pattern as other operator-initiated actions: the SPFx app triggers the action through a backend API, and the backend executes it.

### Lane model readiness

The existing 8-lane model does not need to change. It already includes:

- **Setup / Install** — where install-triggered binding publication originates
- **Standards / Config** — where binding management and configuration governance naturally land
- **Health / Alerts** — where binding drift alerts may surface

Phase 6A adds pages and routes within these lanes; it does not require new lanes.

---

## 4. Relationship to later phases

- **Phase 6A** implements the binding status, management, and repair UX within the existing lane model.
- **Phase 10** may extend the Standards / Config lane with broader governed configuration surfaces that subsume or extend the binding UX.

---

## 5. Cross-references

| Document | Relevance |
|----------|-----------|
| `admin-spfx-phase-5-route-taxonomy.md` | 8-lane model — binding fits within existing lanes |
| `admin-spfx-phase-5-page-ownership-map.md` | Page ownership — Phase 6A will add binding pages to relevant lanes |
| `admin-spfx-phase-5-operator-console-baseline.md` | Shell configuration — no changes needed for binding accommodation |
| `phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md` | Central reconciliation note |
