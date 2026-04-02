# Admin SPFx IT Control Center — Target Architecture

## Purpose

This document provides the target architecture diagram and layer summary for the Admin SPFx IT Control Center. It is **not** the complete architecture doctrine — see the [Phase 1 architecture baseline](phase-01/admin-spfx-phase-1-architecture-baseline.md) for the full operating model, and the [boundary matrix](phase-01/admin-spfx-boundary-matrix.md) for capability ownership rules.

## Architecture diagram

```text
+----------------------------------------------------------------------------------+
| SharePoint Online                                                                |
|                                                                                  |
|  Admin SPFx App                                                                  |
|  - Setup wizard                                                                  |
|  - Input validation                                                              |
|  - Run history / logs / status                                                   |
|  - "Install Backend" trigger                                                     |
|                                                                                  |
+------------------------------------|---------------------------------------------+
                                     | HTTPS (authenticated trigger / status)
                                     v
+----------------------------------------------------------------------------------+
| Orchestration Backend (separate privileged control plane)                        |
|                                                                                  |
|  API Layer                                                                       |
|  - Start setup run                                                               |
|  - Get run status                                                                |
|  - Cancel / retry / repair                                                       |
|                                                                                  |
|  Durable Orchestrator                                                            |
|  - workflow state                                                                |
|  - step sequencing                                                               |
|  - retries / checkpoints                                                         |
|  - compensation / repair decisions                                               |
|                                                                                  |
|  Activity Adapters                                                               |
|  - Azure Deployment Adapter (Bicep/ARM)                                          |
|  - Entra Adapter (Graph)                                                         |
|  - SharePoint ALM Adapter                                                        |
|  - SharePoint API Access Adapter                                                 |
|  - Validation Adapter                                                            |
|                                                                                  |
|  Run Store / Audit Store                                                         |
|  - input snapshot                                                                |
|  - step results                                                                  |
|  - final outputs                                                                 |
|                                                                                  |
+-------------------|------------------------|------------------------|-------------+
                    |                        |                        |
                    v                        v                        v
         +-------------------+   +-------------------------+   +------------------+
         | Azure Resource    |   | Microsoft Entra / Graph |   | SharePoint Admin |
         | Manager / Bicep   |   | - app registrations     |   | - App Catalog    |
         | - RG              |   | - service principals    |   | - ALM APIs       |
         | - Storage         |   | - app role assignments  |   | - API approvals  |
         | - Function App    |   | - scopes / audience     |   | - site install   |
         +-------------------+   +-------------------------+   +------------------+
```

## Layer summary

| Layer | Role | Repo anchor |
|-------|------|-------------|
| **Admin SPFx App** | Operator console. Observe, initiate, manage. Never execute privileged actions directly. | `apps/admin` |
| **Orchestration Backend** | Privileged control plane. Orchestration, retries, compensation, durable state, audit persistence. | `backend/functions` |
| **Activity Adapters** | Platform-specific execution: Graph, SharePoint, Azure Tables. Invoked by the control plane. | `backend/functions/src/services/` |
| **External platforms** | Azure Resource Manager, Microsoft Entra ID, SharePoint Admin. Target systems for privileged operations. | External |

## Key boundaries

- SPFx triggers runs via backend APIs. It does not execute privileged operations.
- The backend owns all durable orchestration, retry, compensation, and audit persistence.
- Adapters isolate platform-specific logic from the orchestrator.
- `@hbc/features-admin` is the admin intelligence layer (monitors, probes, dashboards). It is not the control plane.

## Cross-references

| Document | Purpose |
|----------|---------|
| [Architecture baseline](phase-01/admin-spfx-phase-1-architecture-baseline.md) | Full 5-layer operating model with responsibilities |
| [Boundary matrix](phase-01/admin-spfx-boundary-matrix.md) | Capability-to-layer ownership table |
| [Domain taxonomy](phase-01/admin-spfx-domain-taxonomy.md) | 10 admin domains with maturity labels |
| [Release-scope map](phase-01/admin-spfx-release-scope-map.md) | Active / advisory / expansion tiers |
| [Locked decisions](phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | 10 locked decisions and boundary guards |
| [End-state plan](admin-spfx-it-control-center-end-state-plan.md) | Full 13-phase implementation program |
