# Admin SPFx IT Control Center — End-State Plan

**Status:** Developer-facing end-state implementation plan  
**Primary artifact type:** Architecture + phased implementation program  
**Primary surface:** SharePoint Online SPFx application  
**Primary execution model:** SPFx operator console backed by a separate privileged orchestration backend

---

## 1. Purpose

This document defines the intended **end product state** for the **Admin SPFx application** as the HB Intel **IT Control Center**.

It is intended to give a software developer enough context to understand:

- what the product is supposed to become,
- what belongs in the SPFx frontend,
- what belongs in the privileged backend/control plane,
- what major capabilities must exist at end state,
- what constraints govern implementation,
- what phases are required to reach production readiness.

This document is intentionally **not** a prompt package. It is a developer-facing architectural and implementation reference.

---

## 2. Product summary

The Admin SPFx application is intended to become the **IT Control Center** for the HB Intel SharePoint / Microsoft 365 environment.

At end state, it must provide:

- **active rollout and control**, not just passive monitoring,
- **in-app installation/bootstrap** of backend and platform dependencies wherever technically possible,
- **seamless provisioning execution** for the provisioning saga except when failure conditions occur,
- **broad Entra administration** from the start,
- **active control of HB Intel-managed SharePoint assets** first,
- **full operator visibility** into runs, status, logs, drift, health, and audit history,
- **governed standards enforcement** with a hybrid source-of-truth model,
- **single-authorized-admin execution** for even the highest-risk actions, compensated by strong safety controls.

---

## 3. Governing architecture map

The target architecture is:

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

### Architectural meaning

#### What the Admin SPFx app must own
The frontend is the **operator console**. It owns:

- setup / install workflow UX,
- validation and preflight UX,
- run initiation,
- run history,
- logs / status / health visibility,
- operator approvals/checkpoints,
- standards visibility,
- configuration management UX,
- tenant control-center navigation.

#### What the backend/control plane must own
The backend is the **privileged executor**. It owns:

- durable orchestration,
- privileged command execution,
- adapter invocation,
- retries,
- checkpoints,
- compensation,
- repair decisions,
- run persistence,
- audit persistence,
- post-run evidence recording.

#### What adapters must own
Adapters isolate platform-specific execution logic, including:

- Azure resource deployment/bootstrap,
- Entra ID / Microsoft Graph operations,
- SharePoint ALM and package control,
- SharePoint API approval posture,
- validation probes and environment checks,
- standards application / reapplication / repair primitives.

#### What should not live in SPFx
The SPFx layer must **not** directly own:

- privileged Graph write logic,
- privileged SharePoint admin execution,
- long-running orchestration,
- retry logic,
- compensation logic,
- run/audit persistence internals,
- sensitive deployment execution logic.

---

## 4. Current repo truth to preserve and extend

The existing repo already contains meaningful foundations that should be reused.

### Existing frontend/admin foundations
There is already a dedicated admin app under `apps/admin/` with:

- shell-based routing,
- permission-gated admin pages,
- system settings,
- dashboards,
- provisioning oversight,
- placeholder/deferred error log surface.

### Existing reusable admin layer
`@hbc/features-admin` already provides an **admin-intelligence layer** with:

- alert monitors,
- infrastructure probes,
- alert badge/dashboard components,
- approval authority components,
- admin-oriented hooks and APIs.

This package should remain a reusable admin-intelligence package, not become the full privileged control plane.

### Existing provisioning and backend foundations
The repo already has:

- a headless `@hbc/provisioning` package,
- a provisioning saga orchestrator,
- SharePoint service adapters,
- Graph service adapters,
- Azure Table-backed provisioning run persistence,
- SignalR progress flow,
- retry / compensation / state reconciliation logic.

These are foundational building blocks for the broader control plane and should be generalized rather than discarded.

---

## 5. Locked decisions

The following decisions are treated as **locked** and must shape implementation:

1. **Active control is required early.**  
   The first real implementation waves are not oversight-only.

2. **Early active scope is focused on HB Intel rollout and control.**  
   The first serious implementation waves should prioritize the setup, rollout, readiness, health, and repair of the HB Intel environment.

3. **Broad Entra administration begins early.**  
   The Admin app must support broad Entra user/group management from the start, not merely HB Intel-specific group handling.

4. **Provisioning saga runs straight through unless failure occurs.**  
   The provisioning workflow should be seamless from start to finish unless errors or failures are encountered.

5. **Other risky admin actions use checkpointed automation.**  
   The system should pause at meaningful checkpoints for higher-risk actions other than the provisioning saga.

6. **Backend/control-plane installation should be driven in-app.**  
   The Admin app should target in-app self-install/bootstrap of backend prerequisites and control-plane dependencies wherever technically possible.

7. **Standards source of truth is hybrid.**  
   Standards are governed by code/config by default, but where appropriate they must also be maintainable within the live environment by an authorized admin through governed controls.

8. **Single authorized admin approval is sufficient.**  
   Even the highest-risk actions can be approved and executed by one properly authorized admin.

9. **Early active SharePoint control is limited to HB Intel-managed assets.**  
   Broader SharePoint tenant administration may be observed, but first-wave active writes are limited to HB Intel-related assets and standards.

---

## 6. End-state product responsibilities

### 6.1 Admin SPFx operator-console responsibilities
At end state, the Admin SPFx application must provide:

- setup wizard,
- backend install/bootstrap initiation,
- preflight validation,
- environment readiness checks,
- run launch surfaces,
- risk-aware action initiation,
- run history,
- log / audit browsing,
- alert and probe visibility,
- drift visibility,
- standards/configuration management,
- Entra administration UX,
- SharePoint control UX,
- repair initiation UX,
- operator-scoped command rails.

### 6.2 Privileged control-plane responsibilities
At end state, the backend must provide:

- authenticated admin API layer,
- reusable admin orchestration engine,
- command routing,
- run checkpointing,
- retry semantics,
- repair semantics,
- compensation semantics,
- durable run persistence,
- durable audit persistence,
- configuration resolution and versioning,
- adapter execution and normalization.

### 6.3 SharePoint-control responsibilities
The first-wave active SharePoint domain must support:

- HB Intel-managed site drift detection,
- standards comparison,
- standards preview / dry-run,
- site standards application and reapplication,
- controlled site repair,
- app catalog / package posture visibility,
- API-access posture visibility,
- provisioning dependency validation.

### 6.4 Entra-control responsibilities
The first-wave Entra domain must support:

- user create / modify / remove,
- group create / modify / remove,
- standards and normalization logic,
- app-related access governance flows,
- rollout-critical access setup,
- broader identity administration surfaces,
- risk-aware execution of identity changes.

### 6.5 Standards/configuration responsibilities
The system must support:

- code-defined defaults,
- live admin-maintained governed config where appropriate,
- config versioning,
- config audit trail,
- config-to-run traceability,
- explainable drift results tied to active standards state.

---

## 7. Implementation tenets

A developer should treat the following as implementation doctrine:

- **Do not move privileged logic into SPFx.**
- **Do not flatten all admin actions into one generic page.**
- **Do not replace repo-truth foundations without reason.**
- **Generalize the provisioning control-plane pattern rather than starting over.**
- **Treat auditability as mandatory because single-admin approval is allowed.**
- **Use risk tiers, previews, and dry-runs as primary safety controls.**
- **Keep first-wave SharePoint writes scoped to HB Intel-managed assets.**
- **Build Entra administration as a real early workstream, not a later enhancement.**
- **Make standards/configuration governance a first-class capability.**
- **Preserve the seamless nature of provisioning execution.**

---

## 8. Phased implementation outline

### Phase 1 — Boundary hardening and program baseline
**Purpose:** lock the operating model and prevent scope drift.

**Major objectives**
- Freeze what belongs in SPFx, backend, adapters, and config/governance layers.
- Codify locked decisions into architecture doctrine.
- Define admin domain taxonomy.

**Expected deliverables**
- Architecture baseline
- boundary matrix
- decision log
- release-scope map

**Exit criteria**
- There is one approved architecture baseline governing all later phases.

---

### Phase 2 — Admin control-plane contracts and domain model
**Purpose:** define reusable contracts for runs, actions, checkpoints, audit, and configuration.

**Major objectives**
- Create generalized run types and risk levels.
- Define run schemas, audit schemas, and adapter contracts.
- Model execution modes:
  - seamless,
  - checkpointed,
  - destructive,
  - advisory.

**Expected deliverables**
- Versioned admin run model
- action contract catalog
- config/governance contract model

**Exit criteria**
- Stable contracts exist for frontend, backend, and adapter work.

---

### Phase 3 — Privileged backend foundation
**Purpose:** establish the reusable privileged execution substrate.

**Major objectives**
- Extend the backend beyond provisioning-specific orchestration.
- Add admin API endpoints for:
  - install,
  - validate,
  - run launch,
  - status/history,
  - retry/repair,
  - config access.
- Introduce adapter registry/execution routing.

**Expected deliverables**
- Generalized admin backend skeleton
- authenticated run-launch API
- adapter registration pattern

**Exit criteria**
- SPFx can trigger and poll generalized admin runs.

---

### Phase 4 — Durable run history, audit spine, and evidence model
**Status:** Complete — 2026-04-03
**Purpose:** make all admin actions reconstructable and defensible.

**Major objectives**
- Generalize run persistence beyond provisioning.
- Capture input, operator, checkpoint, config version, output, and failure evidence.
- Establish retention/evidence boundaries.

**Expected deliverables**
- Durable run store
- durable audit store
- audit retrieval APIs
- evidence model

**Exit criteria**
- Any admin run can be reviewed end-to-end.

---

### Phase 5 — Operator console foundation in SPFx
**Status:** Complete — 2026-04-03
**Purpose:** turn the existing admin app into the true control-center shell.

**Major objectives**
- Rework IA/navigation around operator workflows:
  - Setup / Install
  - Validation
  - Runs / History
  - SharePoint Control
  - Entra Control
  - Standards / Config
  - Health / Alerts
  - Error / Audit
- Add scoped execution previews and risk-aware action entry points.

**Expected deliverables**
- Unified operator console shell
- run-oriented workflow pages
- command/navigation model

**Exit criteria**
- Admins can launch, monitor, and review admin runs from SPFx.

---

### Phase 6 — In-app backend install and bootstrap
**Status:** Complete — 2026-04-03
**Purpose:** fulfill the target architecture’s install/bootstrap responsibility.

**Major objectives**
- Build setup wizard and preflight flows.
- Add backend install/bootstrap run support.
- Support approval-aware checkpointing where unavoidable.
- Validate environment readiness and post-install health.

**Expected deliverables**
- In-app install workflow
- preflight validator
- install run tracking
- post-install verification flow

**Exit criteria**
- A clean environment can be bootstrapped through the Admin app with only unavoidable approval pauses.

---

### Phase 7 — Provisioning saga refinement and seamless rollout hardening
**Purpose:** preserve and harden straight-through provisioning execution.

**Major objectives**
- Keep provisioning seamless except on failure/error.
- Improve dependency validation before run launch.
- Improve diagnostics, recovery visibility, and operator guidance.
- Ensure provisioning integrates with install/bootstrap and Entra setup.

**Expected deliverables**
- Hardened provisioning control-center flow
- improved diagnostics
- better failure/repair visibility

**Exit criteria**
- Provisioning runs straight through under normal conditions and surfaces failures clearly when they occur.

---

### Phase 8 — HB Intel SharePoint control and standards enforcement
**Purpose:** deliver active control over the SharePoint assets directly supporting HB Intel.

**Major objectives**
- Add drift detection and standards comparison for HB Intel-managed assets.
- Add standards preview/dry-run.
- Add controlled site/package/API posture repair.
- Keep broader tenant SharePoint writes out of first-wave scope.

**Expected deliverables**
- SharePoint control lane
- drift + repair workflows
- standards application/reapplication flows

**Exit criteria**
- HB Intel-managed SharePoint assets can be observed, compared, previewed, and repaired through the control center.

---

### Phase 9 — Broad Entra administration foundation
**Purpose:** establish broad Entra control as an early workstream.

**Major objectives**
- Support broad user/group administration.
- Separate rollout-critical identity actions from broader identity administration actions.
- Implement risk-aware Graph-backed workflows.

**Expected deliverables**
- Entra control lane in the Admin app
- Graph-backed admin workflows
- audit-backed identity change flows

**Exit criteria**
- The Admin app can perform real Entra user/group administrative actions through the control plane.

---

### Phase 10 — Live admin-maintained standards and configuration governance
**Purpose:** implement the hybrid source-of-truth model.

**Major objectives**
- Create governed live configuration for standards that must be admin-maintainable.
- Preserve code defaults while allowing controlled in-environment overrides.
- Version and audit all standards/config changes.

**Expected deliverables**
- Config registry/store
- override/version model
- config audit/history
- run-to-config traceability

**Exit criteria**
- Appropriate standards can be maintained live without losing governance or traceability.

---

### Phase 11 — High-risk action safety model
**Purpose:** harden the system around single-admin approval.

**Major objectives**
- Add:
  - previews,
  - dry runs,
  - scoped execution,
  - impact summaries,
  - explicit destructive-action warnings,
  - post-run validation,
  - recovery guidance.
- Differentiate routine vs destructive vs tenant-sensitive actions.

**Expected deliverables**
- Standardized high-risk action framework
- safety UX patterns
- destructive-action execution model

**Exit criteria**
- High-risk actions are operable by one authorized admin without becoming casual or opaque.

---

### Phase 12 — Admin intelligence completion and unified observability
**Purpose:** finish and productionize the observability layer.

**Major objectives**
- Replace deferred/in-memory admin-intelligence elements with durable implementations.
- Complete:
  - alerts,
  - probes,
  - error log,
  - health views,
  - unified admin observability.

**Expected deliverables**
- Production-grade alerting/probe system
- persistent observability data
- full error/audit surfaces

**Exit criteria**
- Operators have trustworthy visibility across install, rollout, SharePoint control, Entra control, and failure states.

---

### Phase 13 — Production hardening and expansion rails
**Purpose:** prepare the system for production release and future expansion.

**Major objectives**
- Finalize release readiness, support model, runbooks, operational doctrine, and extension rails.
- Create the expansion model for:
  - broader SharePoint tenant governance,
  - broader M365 admin controls,
  - future enterprise control-center capabilities.

**Expected deliverables**
- Production readiness package
- runbooks
- support/escalation model
- expansion architecture

**Exit criteria**
- Platform is ready for production rollout and future scoped expansion.

---

## 9. Workstream view

### Workstream A — Architecture and doctrine
- Phases 1–2

### Workstream B — Privileged control plane
- Phases 3–4

### Workstream C — Operator console and install
- Phases 5–6

### Workstream D — Rollout, SharePoint control, and repair
- Phases 7–8

### Workstream E — Entra administration and standards governance
- Phases 9–11

### Workstream F — Observability, hardening, and expansion
- Phases 12–13

---

## 10. Recommended implementation order

Recommended order:

1. Phase 1  
2. Phase 2  
3. Phase 3  
4. Phase 4  
5. Phase 5  
6. Phase 6  
7. Phase 7  
8. Phase 9  
9. Phase 10  
10. Phase 8  
11. Phase 11  
12. Phase 12  
13. Phase 13

### Sequencing rationale

- Phases 1–6 establish the real control-center substrate.
- Phase 7 comes early because provisioning is already foundational and central to rollout success.
- Phase 9 is pulled ahead because broad Entra administration is explicitly early scope.
- Phase 10 must land before full standards/repair maturity because standards are partly live-admin-maintained.
- Phase 8 then builds on a stable config/governance layer.
- Phases 11–13 harden safety, observability, and production posture.

---

## 11. Developer implementation boundaries

A developer should assume the following scope boundaries:

### Active first-wave scope
- in-app backend bootstrap,
- provisioning control-center integration,
- HB Intel-managed SharePoint active control,
- broad Entra administration,
- governed standards/configuration management,
- risk-aware repair initiation,
- run history, logs, and auditability.

### Advisory / visibility first-wave scope
- broader tenant-wide SharePoint observability,
- broader tenant health visibility where direct control is not yet in scope,
- diagnostics for future M365 control domains.

### Later expansion scope
- broad tenant-wide SharePoint active governance,
- wider Microsoft 365 admin domains,
- broader enterprise control-center capabilities outside the immediate HB Intel/HB-managed boundary.

---

## 12. End-state definition of done

The end product state is achieved when all of the following are true:

- The Admin SPFx app functions as the **operator console** for the IT Control Center.
- The privileged backend/control plane executes all privileged and long-running admin work.
- Backend/control-plane installation can be initiated and governed from inside the app.
- Provisioning executes straight through under normal conditions and fails transparently when it cannot continue.
- Broad Entra administration exists as a real early-class admin capability.
- HB Intel-managed SharePoint assets can be observed, compared to standard, previewed, and actively repaired.
- Standards/configuration are governed by hybrid repo/live-admin controls with versioning and auditability.
- High-risk actions can be run by one authorized admin with sufficient safety controls and traceability.
- Runs, logs, evidence, and audit records are durable and reviewable.
- Alerts, probes, health, drift, and failure visibility are production-grade.
- The architecture can scale into broader Microsoft 365 administrative capabilities without collapsing the frontend/backend boundary.

---

## 13. Final implementation guidance

The correct implementation strategy is **not**:

- “just add more admin pages,”
- “push more privileged logic into SPFx,”
- “treat today’s admin dashboards as nearly complete,”
- or “delay Entra and install/bootstrap to later waves.”

The correct implementation strategy **is**:

- preserve the existing repo foundations,
- generalize the provisioning/backend pattern into a broader admin control plane,
- elevate the frontend into a real operator console,
- make governance/configuration a first-class capability,
- and stage rollout/control domains in a way that matches the locked decisions.

This document should be used as the developer-facing reference for the intended product destination.
