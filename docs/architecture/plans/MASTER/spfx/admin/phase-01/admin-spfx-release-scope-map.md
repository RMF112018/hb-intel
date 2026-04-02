# Admin SPFx IT Control Center — Release-Scope Map

## Purpose

This document separates admin control-center work into explicit scope tiers so later phases know what they can build, what they can observe but not yet write to, and what belongs to future expansion. It prevents scope drift by making the boundaries concrete.

Cross-reference: [Domain taxonomy](admin-spfx-domain-taxonomy.md) for domain definitions and maturity. [Boundary matrix](admin-spfx-boundary-matrix.md) for layer ownership.

## Scope tiers

### 1. Active first-wave scope

Work in this tier is authorized for full implementation: operator UX, backend execution, adapter logic, persistence, and standards governance as applicable.

| Scope area | Domains involved | What "active" means | Phases |
|---|---|---|---|
| In-app backend bootstrap | Setup / Install | Setup wizard, backend install initiation, post-install verification. The admin app drives its own backend deployment. | 6 |
| Provisioning control-center integration | Runs / History / Status, Repair / Recovery | Preserve and harden straight-through provisioning. Improve diagnostics, recovery visibility, and operator guidance. | 7 |
| HB Intel-managed SharePoint active control | SharePoint Control | Drift detection, standards comparison, preview/dry-run, standards application/reapplication, controlled site repair — scoped to HB Intel-managed assets only. | 8 |
| Broad Entra administration | Entra Control | User/group create/modify/remove, standards/normalization, app-related access governance, rollout-critical access setup. This is an early-class workstream, not a later enhancement. | 9 |
| Standards / configuration governance | Standards / Config Governance | Code defaults + live admin-maintained config, versioning, audit trail, config-to-run traceability, drift baseline. | 10 |
| Risk-aware repair initiation | Repair / Recovery, Runs / History | Previews, dry runs, scoped execution, impact summaries, destructive-action warnings, post-run validation, recovery guidance. | 11 |
| Run history / logs / auditability | Audit / Logs / Evidence, Runs / History | Durable run persistence, audit browsing, error logs, per-run evidence chains, retention boundaries. | 4, 12 |

### 2. Advisory / visibility-only first-wave scope

Work in this tier is authorized for **read-only visibility and observation**. No active writes, no governance enforcement, no repair execution against these targets.

| Scope area | Domains involved | What "advisory" means | Constraint |
|---|---|---|---|
| Broader tenant-wide SharePoint visibility | SharePoint Control, Health / Alerts | Observe tenant-wide SharePoint posture (app catalog state, API access posture, site health) where active control is not yet approved. Display-only dashboards, no write operations. | Active SharePoint writes limited to HB Intel-managed assets in first wave. |
| Broader tenant health visibility | Health / Alerts / Probes | Observe tenant-level health signals outside the HB Intel-managed boundary. Probes and monitors may report status, but no active remediation. | Active remediation limited to HB Intel-managed scope. |

### 3. Later expansion scope

Work in this tier is **not authorized** for implementation in first-wave phases. These areas are acknowledged as future directions but must not be implemented until explicitly scoped in a later phase.

| Scope area | Why it is later expansion | Earliest possible phase |
|---|---|---|
| Broader tenant-wide SharePoint active governance | Active writes against arbitrary tenant SharePoint assets require broader approval, governance model maturity, and safety controls beyond first-wave scope. | Post-Phase 8 |
| Wider Microsoft 365 admin domains | Exchange, Teams admin, Intune, Purview, and other M365 control surfaces are not in scope for the initial control center. Domain taxonomy and adapter patterns must mature first. | Post-Phase 13 |
| Wider enterprise control-center capabilities | Enterprise-class capabilities (multi-tenant, delegated admin, cross-org governance) are out of scope for the HB Intel-focused initial product. | Post-Phase 13 |

### 4. Explicit Phase 1 non-goals

Phase 1 is a documentation and boundary phase. The following are **explicitly not Phase 1 deliverables**:

| Non-goal | Why |
|----------|-----|
| Generalized admin run schema implementation | Phase 2 deliverable. |
| New backend API endpoints | Phase 3 deliverable. |
| New orchestration runtime work | Phase 3 deliverable. |
| Generalized run/audit persistence | Phase 4 deliverable. |
| Operator console shell rework (IA/navigation) | Phase 5 deliverable. |
| New SharePoint repair flows | Phase 8 deliverable. |
| New Entra workflow implementation | Phase 9 deliverable. |
| Install/bootstrap execution flows | Phase 6 deliverable. |
| Broad UI feature construction | Phases 5+ deliverable. |
| Standards governance engine | Phase 10 deliverable. |
| High-risk action safety framework | Phase 11 deliverable. |
| Production-grade alerting/observability | Phase 12 deliverable. |

Phase 1 produces architecture doctrine, boundary definitions, taxonomy, and locked decisions. It does not produce runtime capability.

## Scope decision rules

When a later prompt or phase proposes work, use these rules:

1. **Is it in active first-wave scope?** → Proceed with implementation in the designated phase.
2. **Is it in advisory/visibility scope?** → Implement read-only surfaces only. No write operations, no governance enforcement.
3. **Is it in later expansion scope?** → Do not implement. Document as a future direction if relevant.
4. **Is it a Phase 1 non-goal?** → Do not implement in Phase 1. Defer to the designated phase.
5. **Is it not listed anywhere?** → Stop. Add it to the taxonomy and scope map before implementing.

## Current maturity summary by scope tier

| Scope tier | What exists now |
|---|---|
| **Active first-wave** | Provisioning saga (production-grade), SharePoint/Graph adapters, Table Storage persistence, ProvisioningOversight UX, alert/probe architecture. Setup/install, Entra admin, SharePoint control, standards governance, and risk-aware repair are not yet implemented. |
| **Advisory/visibility** | Infrastructure probes partially exist (2/5 live). No tenant-wide SharePoint or health dashboards beyond HB Intel-managed scope. |
| **Later expansion** | No implementation exists. These are future directions only. |
