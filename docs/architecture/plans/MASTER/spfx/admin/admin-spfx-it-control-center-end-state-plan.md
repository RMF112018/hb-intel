# Admin SPFx IT Control Center — End-State Plan (Updated for Phase 6A, Phase 9 Hybrid Identity Redirect, Phase 9B White-Glove Device Deployment, and Phase 10 Configuration Governance)

**Status:** Developer-facing end-state implementation plan  
**Primary artifact type:** Architecture + phased implementation program  
**Primary surface:** SharePoint Online SPFx application  
**Primary execution model:** SPFx operator console backed by a separate privileged orchestration backend  
**Version:** 01.000.026  
**Revision note:** Adds **Phase 11 post-run validation, recovery guidance, and evidence** (P11-08) — implements safety-post-run-service with post-run validation provider registry and `executePostRunValidation` (domain-specific checks with truthful defaults, evidence capture, audit recording), recovery guidance provider registry and `generateRecoveryGuidance` (default 3-step honest guidance with failure class context, no false automatic-rollback claims), and `assembleSafetyEvidenceSummary` (links all safety artifacts, computes controlsSatisfied/controlsSkipped per profile). Adds `usePostRunSafetyValidation` React hook in features-admin. 12 new tests all passing. Preserves all prior phase content.

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
- **first-class managed-app binding and backend-setup configuration** for HB Intel SPFx applications,
- **seamless provisioning execution** for the provisioning saga except when failure conditions occur,
- **hybrid identity administration** from the start, with **AD DS / on-prem identity authority respected where the environment requires it** and **Microsoft Entra ID / Graph used for cloud-side identity, access, and sync-aware operations**,
- **first-class white-glove employee device deployment orchestration** for governed role-based device packages across Microsoft, Apple, and NinjaOne surfaces,
- **active control of HB Intel-managed SharePoint assets** first,
- **full operator visibility** into runs, status, logs, drift, health, audit history, binding posture, hybrid-identity connection posture, and device-deployment posture,
- **governed standards enforcement** with a hybrid source-of-truth model,
- **single-authorized-admin execution** for even the highest-risk actions, compensated by strong safety controls,
- **UI-driven operational setup and maintenance** for the connections and settings required by the feature so IT can install the app and complete setup without editing code.

### Why Phase 6A remains explicit

Phase 6 established the install/bootstrap lane, checkpoint model, post-install verification, and operator-console workflow. The follow-on gap is the durable **app-binding / backend-setup configuration** required for managed SPFx apps such as Accounting and Project Setup to consume the correct:

- Function App URL,
- API audience,
- backend mode,
- backend-mode-switch policy,
- related approval / binding status.

That slice remains its own implementation phase so it is not buried inside install/bootstrap and not postponed all the way to the broader live-governance work of Phase 10.

### Why Phase 9 is redirected

The earlier Phase 9 framing assumed that broad identity administration should primarily be delivered as an **Entra / Graph administration lane**. The corrected target is broader and more environment-aware:

- **Identity administration remains early scope.**
- **The SPFx app remains the operator console.**
- **The backend remains the privileged executor.**
- **The authoritative system for core lifecycle actions must match the real environment rather than being assumed to be cloud-only Entra.**
- **The delivered feature must be operable by IT through the UI and standard admin pages without code edits.**

Phase 9 is therefore redirected to **Hybrid Identity Administration** rather than broad Entra-only administration.

### Why Phase 9B is now explicit

White-glove device deployment depends on the Phase 9 hybrid-identity substrate, governed connector setup, and no-code IT handoff model. It should not be buried inside generic identity administration, and it should not be deferred until later governance or observability phases.

Phase 9B therefore establishes a first-class feature slice for:

- governed employee device package templates,
- mixed-device package orchestration,
- Microsoft device-management flows,
- Apple enrollment and assignment flows,
- NinjaOne post-enrollment standardization and automation,
- technician checkpoints and operator evidence,
- and full UI-driven connection setup, validation, and run visibility.

### Locked initial employee device packages

The initial white-glove device deployment feature must support the following governed package templates as distinct operational targets:

1. **VDC Personnel**
   - iPhone
   - iPad
   - Alienware desktop

2. **Estimating Personnel**
   - iPhone
   - Alienware laptop

3. **Office Personnel**
   - HP or Dell laptop

4. **Operations Personnel — Management**
   - HP or Dell laptop
   - iPhone

5. **Operations Personnel — Management (alternate package)**
   - MacBook Pro
   - iPhone

6. **Operations Personnel — Field Staff**
   - iPhone
   - iPad
   - HP or Dell laptop

These packages are first-class governed templates. They must not be collapsed into one generic “device setup” workflow, and Windows, macOS, iPhone, and iPad may not be treated as operationally identical.

---

## 3. Governing architecture map

The target architecture is:

```text
+------------------------------------------------------------------------------------------------------------------------------+
| SharePoint Online                                                                                                            |
|                                                                                                                              |
|  Admin SPFx App                                                                                                              |
|  - Setup wizard                                                                                                              |
|  - Input validation                                                                                                          |
|  - Run history / logs / status                                                                                               |
|  - "Install Backend" trigger                                                                                                 |
|  - App-binding status / repair                                                                                               |
|  - Hybrid Identity status / repair                                                                                           |
|  - Device package launch / checkpoint / evidence / repair                                                                    |
|  - Connection setup / test / health                                                                                          |
|                                                                                                                              |
|  Managed HB Intel SPFx Apps                                                                                                  |
|  - Accounting                                                                                                                |
|  - Project Setup                                                                                                             |
|  - Other managed suite apps                                                                                                  |
|  - Resolve app-binding / backend-setup configuration before backend-dependent execution                                      |
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
|  - versioning / provenance                                                                                                   |
|  - publish-from-install output                                                                                               |
|  - runtime resolution for managed apps                                                                                       |
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
|  - parent-run / child-run orchestration                                                                                      |
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
- configuration and app-binding management UX,
- managed-app binding status / repair initiation,
- hybrid-identity operator UX,
- governed connection setup / test / rotate / verify UX,
- white-glove device-package selection / launch / checkpoint / evidence UX,
- tenant control-center navigation.

#### What the managed HB Intel SPFx apps must own
Managed apps own:

- consuming resolved app-binding / backend-setup configuration,
- surfacing clear runtime readiness state when binding is incomplete,
- using the resolved binding before backend-dependent operations,
- avoiding direct ownership of privileged or tenant-level setup logic.

Managed apps must **not** become their own configuration authority.

#### What the backend/control plane must own
The backend is the **privileged executor**, **binding authority**, **hybrid-identity execution boundary**, and **device deployment orchestration boundary**. It owns:

- durable orchestration,
- privileged command execution,
- adapter invocation,
- retries,
- checkpoints,
- compensation,
- repair decisions,
- run persistence,
- audit persistence,
- post-run evidence recording,
- first-class app-binding resolution and publication,
- app-binding versioning / provenance / repair,
- authoritative routing of identity actions to the correct system of record,
- secure storage / resolution of governed connector settings and secret material,
- mixed-device package orchestration and downstream result normalization.

#### What adapters must own
Adapters isolate platform-specific execution logic, including:

- Azure resource deployment/bootstrap,
- AD DS / on-prem identity operations,
- Entra ID / Microsoft Graph operations,
- Microsoft device-management operations,
- Apple enrollment and assignment operations,
- NinjaOne automation and standardization operations,
- SharePoint ALM and package control,
- SharePoint API approval posture,
- validation probes and environment checks,
- platform facts needed to publish usable runtime configuration, identity evidence, and device deployment evidence.

#### What should not live in SPFx
The SPFx layer must **not** directly own:

- privileged Graph write logic,
- privileged AD DS or on-prem identity execution,
- privileged Microsoft device-management execution,
- privileged Apple enrollment execution,
- privileged NinjaOne automation execution,
- privileged SharePoint admin execution,
- long-running orchestration,
- retry logic,
- compensation logic,
- run/audit persistence internals,
- sensitive deployment execution logic,
- durable app-binding authority,
- secret storage or secret-resolution logic.

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
- setup/install lane from Phase 6,
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

### Existing app-runtime configuration direction
The suite already points toward runtime-resolved configuration for managed SPFx apps. That direction should be preserved and formalized rather than replaced with one-off build-time package edits.

### What the current repo does not yet guarantee
The current repo does **not** by itself guarantee:

- a first-class hybrid identity execution substrate,
- source-of-authority-aware routing for users, groups, and access actions,
- a first-class device deployment orchestration substrate,
- governed UI-managed setup of the required backend connections,
- or a hard no-code IT handoff model for Phase 9 and Phase 9B.

Those remain implementation requirements, not assumptions.

### What Phase 6 contributed
Phase 6 already delivered:

- install/bootstrap run support,
- preflight validation,
- checkpoint handling,
- post-install verification,
- setup/install UX,
- run detail / verification UX,
- durable run, audit, and evidence reuse.

Phase 6A, redirected Phase 9, and Phase 9B should extend those foundations rather than rebuilding them.

---

## 5. Locked decisions

The following decisions are treated as **locked** and must shape implementation:

1. **Active control is required early.**  
   The first real implementation waves are not oversight-only.

2. **Early active scope is focused on HB Intel rollout and control.**  
   The first serious implementation waves should prioritize the setup, rollout, readiness, health, and repair of the HB Intel environment.

3. **Hybrid identity administration begins early.**  
   The Admin app must support real early-class identity administration, but it must route actions according to the actual source of authority rather than assuming Entra alone owns the lifecycle.

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

10. **Managed-app backend binding is first-class configuration.**  
    Runtime backend binding for managed SPFx apps must be treated as governed control-plane configuration, not as an incidental per-package detail.

11. **Install/bootstrap must publish usable managed-app binding outputs.**  
    Completing backend setup is not enough by itself; the control plane must also publish the resolved runtime binding needed by the target apps.

12. **Phase 9 is governed by a hard no-code IT handoff and setup gate.**  
    After delivery of the final `.sppkg`, IT must be able to install the app, configure required connections, complete operational setup, and use the feature without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files.

13. **Standard admin approvals are allowed; hidden engineering setup is not.**  
    Standard SharePoint, Microsoft 365, Entra, hybrid-platform, Apple, or device-management approval steps are acceptable where unavoidable, but the product may not satisfy its setup model by requiring undocumented engineering edits or repository changes.

14. **White-glove device deployment begins as an early governed feature slice after Hybrid Identity foundation.**  
    Device deployment is not a late enhancement and not a generic future aspiration. It is an early-class control-center capability that depends on Phase 9 and should be implemented as a discrete follow-on slice.

15. **Platform-native responsibilities must be respected.**  
    Microsoft, Apple, and NinjaOne responsibilities must be modeled honestly. The system may orchestrate and evidence those platforms, but it may not pretend all enrollment, assignment, or post-enrollment work belongs in custom code.

16. **Mixed-device package coordination is first-class.**  
    The feature must support employee packages that contain multiple devices and multiple downstream system actions. It must not flatten all packages into a single-device workflow.

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
- app-binding status, resolution, and repair UX,
- hybrid identity administration UX,
- governed connection-management UX,
- white-glove device-package launch and run-oversight UX,
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
- app-binding publication and runtime resolution,
- source-of-authority-aware identity routing,
- secure governed connection storage / resolution / test handling,
- mixed-device white-glove run orchestration,
- adapter execution and normalization.

### 6.3 Managed-app binding responsibilities
The early managed-app binding domain must support:

- per-app binding records,
- binding of `functionAppUrl`, `apiAudience`, `backendMode`, and backend-mode-switch policy,
- coupling of binding posture to relevant approval / dependency status,
- publish-from-install output,
- runtime resolution for target apps,
- app-binding drift detection,
- operator-visible repair / re-publish flow.

### 6.4 SharePoint-control responsibilities
The first-wave active SharePoint domain must support:

- HB Intel-managed site drift detection,
- standards comparison,
- standards preview / dry-run,
- site standards application and reapplication,
- controlled site repair,
- app catalog / package posture visibility,
- API-access posture visibility,
- provisioning dependency validation.

### 6.5 Hybrid-identity responsibilities
The first-wave hybrid-identity domain must support:

- authoritative user lifecycle administration in the correct system of record,
- source-of-authority-aware group and membership administration,
- rollout-critical access setup,
- Entra / Graph cloud-side identity, access, and visibility actions where appropriate,
- sync-aware operator feedback and evidence,
- broader identity administration surfaces that reflect the real environment,
- risk-aware execution of identity changes.

### 6.6 Connection-management responsibilities
The Phase 9 and Phase 9B setup and operability model must support:

- governed UI-managed entry of required connection details and references,
- secure backend handling of secrets, keys, certificates, and credential references,
- connection testing / verification from the UI,
- operator visibility into connection health, last verification, and failure state,
- credential or endpoint rotation without code changes,
- explicit surfacing of unavoidable external admin approvals or prerequisites,
- failure of readiness when required connectors or prerequisites are missing.

### 6.7 White-glove device deployment responsibilities
The first-wave white-glove device deployment domain must support:

- governed employee package templates,
- per-package device standards and required metadata,
- package-specific orchestration logic,
- parent-run / child-run coordination where needed,
- mixed-device package launch and tracking,
- Microsoft device deployment actions where appropriate,
- Apple device enrollment / assignment actions where appropriate,
- NinjaOne post-enrollment standardization and automation where appropriate,
- technician checkpoints and evidence capture,
- recovery, retry, and repair visibility for partial package failures.

### 6.8 Standards/configuration responsibilities
The system must support:

- code-defined defaults,
- live admin-maintained governed config where appropriate,
- config versioning,
- config audit trail,
- config-to-run traceability,
- explainable drift results tied to active standards state,
- app-binding configuration as an early first-class governed slice,
- hybrid-identity connector configuration as an early governed slice,
- device-package configuration as a governed slice,
- later broader configuration governance without discarding the early app-binding, connection, or package model.

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
- **Build hybrid identity administration as a real early workstream, not a later enhancement.**
- **Make standards/configuration governance a first-class capability.**
- **Preserve the seamless nature of provisioning execution.**
- **Treat managed-app backend binding as governed runtime configuration, not package trivia.**
- **Do not require target apps to infer or hardcode backend setup state that the control plane already knows.**
- **Do not assume Graph is the authoritative lifecycle boundary if the environment depends on AD DS / hybrid realities.**
- **Do not require IT to edit code, env files, manifests, or deployment templates for normal setup and use once the software is delivered.**
- **Do not force Microsoft, Apple, and NinjaOne responsibilities into one fake abstraction.**
- **Do not treat Windows, macOS, iPhone, and iPad as operationally identical.**
- **Do not assume NinjaOne owns enrollment and authoritative identity lifecycle by default.**

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
  - Hybrid Identity
  - Device Deployment
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

**Handoff:** Phase 6 delivered install/bootstrap but did not establish the managed-app binding layer. Target apps are not runtime-ready until Phase 6A publishes and resolves their backend binding. See `phase-06/admin-spfx-phase-6a-handoff-note.md`.

---

### Phase 6A — Managed App Binding and Backend-Setup Configuration
**Purpose:** establish first-class, durable app-binding / backend-setup configuration for managed HB Intel SPFx apps.

**Major objectives**
- Define the managed-app binding contract for runtime backend configuration.
- Add durable per-app binding storage and retrieval in the control plane.
- Publish binding outputs from install/bootstrap and related repair flows.
- Integrate managed target apps so they resolve binding before backend-dependent execution.
- Add binding verification, status visibility, and drift/repair hooks.
- Keep this slice narrow and forward-compatible with later broader configuration governance.

**Expected deliverables**
- Managed app-binding contract/model
- binding store and retrieval API
- publish-from-install integration
- target-app runtime resolution integration
- binding verification / drift checks
- Admin binding status / repair UX
- docs and runbook guidance for binding posture

**Exit criteria**
- Managed apps can resolve and use governed runtime backend binding supplied by the control plane.
- Install/bootstrap publishes usable binding outputs for the target apps it configures.
- Binding gaps and drift are visible and repairable from the Admin control center.

---

### Phase 7 — Provisioning saga refinement and seamless rollout hardening
**Purpose:** preserve and harden straight-through provisioning execution.

**Major objectives**
- Keep provisioning seamless except on failure/error.
- Improve dependency validation before run launch.
- Improve diagnostics, recovery visibility, and operator guidance.
- Ensure provisioning integrates with install/bootstrap, app-binding publication, and hybrid identity setup.

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

### Phase 9 — Hybrid Identity Administration foundation
**Purpose:** establish hybrid identity administration as an early workstream with a hard no-code IT handoff and setup gate.

**Major objectives**
- Define the source-of-authority model for users, groups, membership, and access actions.
- Support authoritative lifecycle actions in the correct system of record.
- Support cloud-side Entra / Graph actions where appropriate.
- Separate rollout-critical identity actions from broader identity administration actions.
- Implement risk-aware hybrid identity workflows through the privileged backend.
- Add a Hybrid Identity control lane and governed connection-management UX in the Admin app.
- Deliver the phase so IT can install the app and complete required setup without code edits.

**Expected deliverables**
- Hybrid Identity control lane in the Admin app
- source-of-authority-aware identity workflows
- AD DS / on-prem identity execution boundary where required
- Entra / Graph cloud-side workflows where appropriate
- governed connection-management and verification UX
- audit-backed identity change flows
- operator runbooks and prerequisite guidance aligned to no-code setup

**Exit criteria**
- The Admin app can perform real hybrid-identity administrative actions through the control plane.
- Required backend connections can be configured, tested, updated, and re-verified through the UI.
- The phase fails if setup still requires code edits, manifest edits, `.env` edits, or backend configuration-file edits by IT.

---

### Phase 9B — White-Glove Device Deployment foundation
**Purpose:** establish white-glove employee device deployment as an early governed control-center feature built on the Phase 9 hybrid-identity and connection substrate.

**Architecture baseline:** [white-glove/white-glove-architecture-baseline.md](white-glove/white-glove-architecture-baseline.md) — frozen boundary definitions, ownership model, and implementation constraints for this phase.

**Major objectives**
- Define the governed device package model, package metadata, and standards boundaries.
- Implement package-specific orchestration for the locked initial employee device packages.
- Support mixed-device parent-run / child-run coordination where needed.
- Implement Microsoft device-management flows where appropriate for Windows and Microsoft-managed device actions.
- Implement Apple enrollment / assignment flows where appropriate for iPhone, iPad, and macOS actions.
- Implement NinjaOne post-enrollment automation, software deployment, and standardization flows where appropriate.
- Add operator launch, checkpoint, status, evidence, and repair UX in the Admin app.
- Deliver the phase so IT can configure required device-management connections and execute the feature without code edits.

**Expected deliverables**
- White-Glove Device Deployment control lane in the Admin app
- governed device package contract/model
- package run orchestration and evidence model
- Microsoft device-management adapter flows where appropriate
- Apple device-management adapter flows where appropriate
- NinjaOne adapter flows where appropriate
- governed connection-management, validation, and health UX for device-management dependencies
- operator runbooks and prerequisite guidance aligned to no-code setup

**Exit criteria**
- The Admin app can launch and monitor real white-glove device-package runs through the control plane.
- Mixed-device packages are supported with clear checkpoint, evidence, and recovery behavior.
- Required device-management connections can be configured, tested, updated, and re-verified through the UI.
- The phase fails if IT still needs code edits, manifest edits, `.env` edits, or backend configuration-file edits to complete normal setup and use.

---

### Phase 10 — Live admin-maintained standards and configuration governance
**Purpose:** implement the hybrid source-of-truth model.

**Major objectives**
- Create governed live configuration for standards that must be admin-maintainable.
- Preserve code defaults while allowing controlled in-environment overrides.
- Version and audit all standards/config changes.
- Generalize the narrower app-binding, hybrid-identity connection, and device-package slices into the broader governed configuration model without breaking runtime consumers.

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
- Operators have trustworthy visibility across install, rollout, app-binding, SharePoint control, hybrid identity control, device deployment, connection posture, and failure states.

---

### Phase 13 — Production hardening and expansion rails
**Purpose:** prepare the system for production release and future expansion.

**Major objectives**
- Finalize release readiness, support model, runbooks, operational doctrine, and extension rails.
- Create the expansion model for:
  - broader SharePoint tenant governance,
  - broader Microsoft 365 admin controls,
  - broader enterprise device orchestration and lifecycle capabilities,
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

### Workstream C — Operator console, install, and managed-app binding
- Phases 5–6A

### Workstream D — Rollout, SharePoint control, and repair
- Phases 7–8

### Workstream E — Hybrid identity administration, device deployment, and standards governance
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
7. Phase 6A  
8. Phase 7  
9. Phase 9  
10. Phase 9B  
11. Phase 10  
12. Phase 8  
13. Phase 11  
14. Phase 12  
15. Phase 13

### Sequencing rationale

- Phases 1–6 establish the real control-center substrate and install/bootstrap lane.
- **Phase 6A follows immediately** because managed apps need durable runtime binding once backend setup exists.
- Phase 7 comes after 6A so provisioning hardening can assume a first-class binding model rather than ad hoc per-app configuration.
- Phase 9 stays early because identity administration remains early scope, but it now follows a hybrid identity model and a hard no-code IT setup bar.
- **Phase 9B follows Phase 9** because white-glove device deployment depends on source-of-authority-aware identity handling, governed connector setup, and the no-code IT handoff substrate.
- Phase 10 must still land before full standards/repair maturity because standards are partly live-admin-maintained, but it should extend the narrower app-binding, connection, and package slices rather than replace them.
- Phase 8 then builds on a stable config/governance layer.
- Phases 11–13 harden safety, observability, and production posture.

---

## 11. Developer implementation boundaries

A developer should assume the following scope boundaries:

### Active first-wave scope
- in-app backend bootstrap,
- managed-app backend binding publication and resolution,
- provisioning control-center integration,
- HB Intel-managed SharePoint active control,
- hybrid identity administration,
- governed UI-driven connection setup / verification / maintenance for required Phase 9 and Phase 9B capabilities,
- white-glove employee device deployment,
- governed standards/configuration management,
- risk-aware repair initiation,
- run history, logs, and auditability.

### Advisory / visibility first-wave scope
- broader tenant-wide SharePoint observability,
- broader tenant health visibility where direct control is not yet in scope,
- diagnostics for future Microsoft 365 control domains.

### Later expansion scope
- broad tenant-wide SharePoint active governance,
- wider Microsoft 365 admin domains,
- broader enterprise device lifecycle governance beyond the early white-glove slice,
- broader enterprise control-center capabilities outside the immediate HB Intel/HB-managed boundary.

---

## 12. End-state definition of done

The end product state is achieved when all of the following are true:

- The Admin SPFx app functions as the **operator console** for the IT Control Center.
- The privileged backend/control plane executes all privileged and long-running admin work.
- Backend/control-plane installation can be initiated and governed from inside the app.
- Managed HB Intel SPFx apps can resolve and use first-class governed backend binding supplied by the control plane.
- Provisioning executes straight through under normal conditions and fails transparently when it cannot continue.
- Hybrid identity administration exists as a real early-class admin capability.
- Required Phase 9 and Phase 9B connections and settings can be configured, tested, updated, and re-verified through governed UI without code edits.
- White-glove employee device deployment exists as a real early-class admin capability with mixed-device package orchestration.
- HB Intel-managed SharePoint assets can be observed, compared to standard, previewed, and actively repaired.
- Standards/configuration are governed by hybrid repo/live-admin controls with versioning and auditability.
- High-risk actions can be run by one authorized admin with sufficient safety controls and traceability.
- Runs, logs, evidence, audit records, binding posture, connection posture, and device-package posture are durable and reviewable.
- Alerts, probes, health, drift, and failure visibility are production-grade.
- The architecture can scale into broader Microsoft 365 administrative capabilities and broader device lifecycle capabilities without collapsing the frontend/backend boundary.

---

## 13. Final implementation guidance

The correct implementation strategy is **not**:

- “just add more admin pages,”
- “push more privileged logic into SPFx,”
- “treat today’s admin dashboards as nearly complete,”
- “hardcode backend settings into each app package,”
- “assume Graph is the lifecycle authority for everything,”
- “leave connection setup to repo edits or env-file edits,”
- “treat white-glove deployment as one generic device form,”
- or “delay hybrid identity, device deployment, and no-code setup until later.”

The correct implementation strategy **is**:

- preserve the existing repo foundations,
- generalize the provisioning/backend pattern into a broader admin control plane,
- elevate the frontend into a real operator console,
- make governance/configuration a first-class capability,
- treat app-binding as an early governed runtime slice,
- treat hybrid identity as a source-of-authority-aware early workstream,
- treat white-glove device deployment as an early governed orchestration slice,
- and stage rollout/control domains in a way that matches the locked decisions.

This document should be used as the developer-facing reference for the intended product destination.
