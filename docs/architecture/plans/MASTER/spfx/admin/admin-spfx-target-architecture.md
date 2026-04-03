# Admin SPFx IT Control Center — Target Architecture (Updated for Phase 6A, Phase 9 Hybrid Identity Redirect, and Phase 9B White-Glove Device Deployment)

## Purpose

This document provides the target architecture diagram and layer summary for the Admin SPFx IT Control Center. It is **not** the complete architecture doctrine — see the Phase 1 architecture baseline for the full operating model and the boundary matrix for capability ownership rules.

This revision preserves **Phase 6A — Managed App Binding and Backend-Setup Configuration**, preserves the **Phase 9 Hybrid Identity Redirect**, and adds **Phase 9B — White-Glove Device Deployment** as an explicit early feature layer.

## Architecture diagram

```text
+------------------------------------------------------------------------------------------------------------------------------+
| SharePoint Online                                                                                                            |
|                                                                                                                              |
|  Admin SPFx App                                                                                                              |
|  - Setup wizard                                                                                                              |
|  - Input validation                                                                                                          |
|  - Run history / logs / status                                                                                               |
|  - Binding status / repair                                                                                                   |
|  - Hybrid Identity status / repair                                                                                           |
|  - Device package launch / checkpoint / evidence / repair                                                                    |
|  - Connection setup / test / health                                                                                          |
|                                                                                                                              |
|  Managed HB Intel SPFx Apps                                                                                                  |
|  - Accounting                                                                                                                |
|  - Project Setup                                                                                                             |
|  - Other managed suite apps                                                                                                  |
|  - Resolve governed backend binding before backend-dependent execution                                                       |
|                                                                                                                              |
+------------------------------------|-----------------------------------------------|---------------------|------------------+
                                     | HTTPS (authenticated trigger / status)        | HTTPS (binding      | HTTPS (runtime)
                                     |                                               | resolve / status)   |
                                     v                                               v                     v
+------------------------------------------------------------------------------------------------------------------------------+
| Orchestration Backend (separate privileged control plane)                                                                    |
|                                                                                                                              |
|  API Layer                                                                                                                   |
|  - Start setup run                                                                                                           |
|  - Get run status                                                                                                            |
|  - Cancel / retry / repair                                                                                                   |
|  - Resolve app binding                                                                                                       |
|  - Report binding status / drift                                                                                             |
|  - Resolve hybrid identity action                                                                                            |
|  - Launch device-package run                                                                                                 |
|  - Test / save / rotate governed connector settings                                                                          |
|                                                                                                                              |
|  Durable Orchestrator                                                                                                        |
|  - workflow state                                                                                                            |
|  - step sequencing                                                                                                           |
|  - retries / checkpoints                                                                                                     |
|  - compensation / repair decisions                                                                                           |
|                                                                                                                              |
|  Managed App Binding / Configuration Layer                                                                                   |
|  - app binding contract                                                                                                      |
|  - per-app binding records                                                                                                   |
|  - publish-from-install output                                                                                               |
|  - runtime resolution for managed apps                                                                                       |
|  - versioning / provenance                                                                                                   |
|                                                                                                                              |
|  Hybrid Identity Administration / Connection Layer                                                                           |
|  - source-of-authority routing                                                                                               |
|  - AD DS / on-prem identity execution boundary                                                                               |
|  - Entra / Graph cloud-side execution boundary                                                                               |
|  - governed connector settings / secret references / health checks                                                           |
|  - sync-aware operator evidence                                                                                              |
|                                                                                                                              |
|  White-Glove Device Deployment Layer                                                                                         |
|  - device package templates / standards                                                                                      |
|  - mixed-device orchestration                                                                                                 |
|  - Microsoft device deployment routing                                                                                       |
|  - Apple enrollment / assignment routing                                                                                     |
|  - NinjaOne post-enrollment automation / standardization                                                                     |
|  - checkpoint / evidence / recovery model                                                                                    |
|                                                                                                                              |
|  Activity Adapters                                                                                                           |
|  - Azure Deployment Adapter (Bicep/ARM)                                                                                      |
|  - AD DS / On-Prem Identity Adapter                                                                                          |
|  - Entra Adapter (Graph)                                                                                                     |
|  - Microsoft Device Management Adapter                                                                                       |
|  - Apple Device Management Adapter                                                                                           |
|  - NinjaOne Adapter                                                                                                          |
|  - SharePoint ALM Adapter                                                                                                    |
|  - SharePoint API Access Adapter                                                                                             |
|  - Validation Adapter                                                                                                        |
|                                                                                                                              |
|  Run Store / Audit Store / Binding Store / Connector Store                                                                   |
|  - input snapshot                                                                                                            |
|  - step results                                                                                                              |
|  - final outputs                                                                                                             |
|  - binding records                                                                                                           |
|  - binding evidence / drift / repair history                                                                                 |
|  - governed connection records / verification history                                                                        |
|  - device deployment evidence / package history                                                                              |
|                                                                                                                              |
+-------------------|-------------------------|--------------------------|-------------------------------|----------------------+
                    |                         |                          |                               |
                    v                         v                          v                               v
         +-------------------+   +---------------------------+   +------------------+      +------------------------------+
         | Azure Resource    |   | Microsoft Entra / Graph   |   | SharePoint Admin |      | Endpoint / Device Platforms  |
         | Manager / Bicep   |   | - cloud identity / access |   | - App Catalog    |      | - Intune / Autopilot         |
         | - RG              |   | - app registrations       |   | - ALM APIs       |      | - Apple Business Manager     |
         | - Storage         |   | - service principals      |   | - API approvals  |      | - ADE / APNs-backed MDM      |
         | - Function App    |   | - scopes / audience       |   | - site install   |      | - NinjaOne                   |
         +-------------------+   +---------------------------+   +------------------+      +------------------------------+
```

## Layer summary

| Layer | Role | Repo anchor |
|-------|------|-------------|
| **Admin SPFx App** | Operator console. Observe, initiate, manage. Never execute privileged actions directly. Owns setup, run visibility, connection-management UX, hybrid-identity operator flows, and white-glove device deployment operator UX. | `apps/admin` |
| **Managed HB Intel SPFx Apps** | Runtime consumers of governed backend binding. Must resolve binding before backend-dependent execution. | `apps/accounting`, `apps/estimating`, other managed apps |
| **Orchestration Backend** | Privileged control plane. Orchestration, retries, compensation, durable state, audit persistence, binding authority, hybrid-identity execution boundary, and device deployment orchestration boundary. | `backend/functions` |
| **Managed App Binding / Configuration Layer** | First-class per-app runtime binding records, publish-from-install outputs, versioning, runtime resolution, drift/repair. | `backend/functions` + shared models/config slice |
| **Hybrid Identity Administration / Connection Layer** | Source-of-authority routing, AD DS / on-prem execution boundary, Entra / Graph cloud-side execution, governed connector settings, secure secret/reference resolution, connection health, and evidence. | `backend/functions` + shared models/config slice |
| **White-Glove Device Deployment Layer** | Governed device package templates, mixed-device orchestration, Microsoft and Apple device-management routing, NinjaOne post-enrollment standardization, checkpoint and evidence model. | `backend/functions` + shared models/config slice |
| **Activity Adapters** | Platform-specific execution: AD DS / on-prem identity, Graph, Microsoft device management, Apple device management, NinjaOne, SharePoint, Azure Tables, validation. Invoked by the control plane. | `backend/functions/src/services/` |
| **External platforms** | Azure Resource Manager, Microsoft Entra ID, SharePoint Admin, and endpoint/device-management platforms. Target systems for privileged operations. | External |

## Key boundaries

- SPFx triggers runs via backend APIs. It does not execute privileged operations.
- Managed target apps consume resolved backend binding. They do not become their own binding authority.
- The backend owns all durable orchestration, retry, compensation, audit persistence, app-binding publication / resolution, hybrid-identity action routing, and white-glove device-package orchestration.
- Source-of-authority routing is first-class. Do not assume Graph is the authoritative lifecycle boundary for all user, group, or access actions.
- Governed connector settings may be entered and managed through UI, but secrets and sensitive material must be handled and stored by the backend, not by SPFx.
- White-glove device deployment is an orchestration boundary, not a thin UI wrapper around direct frontend calls to downstream device platforms.
- Microsoft, Apple, and NinjaOne responsibilities must be modeled honestly. Do not pretend all enrollment, assignment, and post-enrollment work belongs to one platform.
- Adapters isolate platform-specific logic from the orchestrator.
- `@hbc/features-admin` is the admin intelligence layer (monitors, probes, dashboards). It is not the control plane.
- App-binding is first-class governed runtime configuration, not just a build-time package setting.
- Phase 9 and Phase 9B must satisfy a hard no-code IT handoff and setup bar: after delivery of the `.sppkg`, normal setup and use may not require code edits, env-file edits, manifest edits, or backend configuration-file edits by IT.

## Cross-references

| Document | Purpose |
|----------|---------|
| `phase-01/admin-spfx-phase-1-architecture-baseline.md` | Full 5-layer operating model with responsibilities |
| `phase-01/admin-spfx-boundary-matrix.md` | Capability-to-layer ownership table |
| `phase-01/admin-spfx-domain-taxonomy.md` | 10 admin domains with maturity labels |
| `phase-01/admin-spfx-release-scope-map.md` | Active / advisory / expansion tiers |
| `phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md` | Locked decisions and boundary guards |
| `admin-spfx-it-control-center-end-state-plan.md` | Full phased implementation program including Phase 6A, the Phase 9 hybrid identity redirect, and Phase 9B white-glove device deployment |
| `phase-07/provisioning-failure-classification-and-run-state-model.md` | P7: Failure taxonomy, compensation chain, deferral semantics |
| `phase-07/provisioning-recovery-and-operator-guidance-contract.md` | P7: Recovery action contracts and structured guidance API |
| `phase-07/provisioning-prelaunch-validation-model.md` | P7: Typed prelaunch validation with 6 failure categories |
| `phase-07/provisioning-diagnostics-and-evidence-guide.md` | P7: Evidence payload structure and telemetry event catalog |
| `phase-07/provisioning-readiness-dependency-integration.md` | P7: Bootstrap and Entra readiness checks |
| `phase-07/admin-spfx-phase-7-exit-reconciliation.md` | P7: Phase closure, exit criteria, residual risks |
