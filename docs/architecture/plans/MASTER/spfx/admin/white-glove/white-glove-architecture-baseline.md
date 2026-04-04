# White-Glove Device Deployment — Architecture Baseline

## Purpose

Freeze the architectural ownership model for the white-glove employee device deployment feature before any code spread begins. This document defines what each layer owns, what it does not own, and how the layers interact.

This baseline preserves the **Admin SPFx operator-console / privileged-backend control-plane** split established in [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) and extended through Phases 2–6.

## Governing references

- [End-state plan](../admin-spfx-it-control-center-end-state-plan.md) — Phase 9B locked decisions and target architecture
- [Implementation summary plan](../phase-09.1/Admin-SPFx-IT-Control-Center-White-Glove-Implementation-Summary-Plan.md) — governing implementation posture
- [Gap map](../phase-09.1/admin-spfx-white-glove-gap-map.md) — scope ownership matrix and file-placement baseline
- [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) — original capability-to-layer ownership model

---

## Layer ownership

### SPFx operator console

The Admin SPFx application owns all operator-facing interaction for the white-glove domain. It does not execute privileged operations.

**Owns:**

- Operator input capture (employee lookup, device details, package selection)
- Package selection and launch initiation
- Connection setup and configuration UX
- Readiness and health visibility
- Run launch confirmation
- Checkpoint display and acknowledgment UX
- Logs, evidence, and audit consumption
- Standards and template governance UX
- Connector health and drift visibility
- Recovery and retry initiation UX (delegates execution to backend)

**Does not own:**

- Privileged API calls to Microsoft, Apple, or NinjaOne
- Connector credential storage or secret resolution
- Run orchestration or state transitions
- Evidence capture from external systems
- Retry, compensation, or repair execution
- Audit record persistence

### Privileged backend control plane

The backend control plane owns all privileged execution, orchestration, and durable persistence. It exposes API endpoints consumed by SPFx.

**Owns:**

- Package command API (launch, cancel, retry, repair)
- Parent package run / child device run orchestration
- Checkpoint engine (creation, timeout, escalation)
- Retry, compensation, and repair rule execution
- Durable run persistence (Azure Table Storage)
- Durable audit trail persistence
- Evidence capture and retention
- Connector validation execution (test connections, health probes)
- Connection and credential resolution (secure secret access)
- Package and device run normalization for SPFx consumption
- Governed configuration version persistence

**Does not own:**

- Operator UX or interaction flows
- Direct user input capture
- Visual presentation of run state or evidence

### Adapter layer

Adapters are backend services that encapsulate platform-specific execution. Each adapter family is distinct — there is no generic device adapter.

**Microsoft adapter family owns:**

- Intune device management operations (profile assignment, compliance policy)
- Autopilot registration and pre-provisioning orchestration
- Entra ID device and group operations for this feature
- Windows-specific readiness validation
- Windows enrollment status normalization

**Apple adapter family owns:**

- ABM / ADE connector operations
- Apple token and MDM readiness state management
- Serial-assignment workflow execution
- iPhone, iPad, and macOS differentiation logic
- Supervised enrollment evidence collection

**NinjaOne adapter family owns:**

- OAuth / API connection handling
- Post-enrollment software deployment
- Policy and script bundle orchestration
- Endpoint standardization task execution
- Post-enrollment validation and metadata synchronization

**No adapter owns:**

- Cross-platform enrollment arbitration (each platform is authoritative for its own devices)
- Operator UX
- Audit trail structure (adapters report results; the control plane persists them)

### Platform-native systems

External systems that are authoritative for their domains. The backend calls into them via adapters but does not replicate their authority.

**Microsoft Entra ID / Intune / Autopilot owns:**

- Windows device identity and registration
- Autopilot profile assignment authority
- Entra ID group membership for device management
- Intune compliance and configuration profile authority
- Windows enrollment state of record

**Apple Business Manager / ADE / APNs owns:**

- Apple device enrollment program authority
- ADE profile assignment
- Supervised device state
- MDM enrollment ownership for Apple devices
- Device serial number to MDM server binding

### NinjaOne

NinjaOne is the post-enrollment endpoint management system. It is not an enrollment authority.

**Owns:**

- Post-enrollment policy application
- Software deployment to enrolled endpoints
- Endpoint scripting and remediation
- Standardization task execution
- Endpoint validation tasks
- Endpoint metadata collection

**Does not own:**

- Device enrollment (Windows or Apple)
- Device identity registration
- MDM enrollment authority
- ADE or Autopilot profile assignment
- Primary device compliance state

---

## Interaction model

```
Operator (SPFx)
  │
  ├─ initiates package launch ──────────► Backend API
  ├─ views run status / checkpoints ◄──── Backend API (poll or SignalR)
  ├─ acknowledges checkpoints ──────────► Backend API
  ├─ initiates retry / repair ──────────► Backend API
  ├─ configures connections ────────────► Backend API
  └─ browses evidence / audit ◄────────── Backend API

Backend Control Plane
  │
  ├─ creates parent run + child device runs
  ├─ invokes adapter per device platform
  ├─ manages checkpoint lifecycle
  ├─ persists run / audit / evidence
  │
  ├─ Microsoft Adapter ──► Entra ID / Intune / Autopilot
  ├─ Apple Adapter ──────► ABM / ADE / APNs / Intune MDM
  └─ NinjaOne Adapter ──► NinjaOne API
```

---

## Run hierarchy

The white-glove feature uses a parent/child run model:

| Level | Description | Persistence |
|-------|-------------|-------------|
| Package Run | Parent orchestration root for an employee package | Durable (Table Storage) |
| Device Run | One child run per target device in the package | Durable (Table Storage) |
| Checkpoint | Approval, technician, or dependency gate within a device run | Durable |
| Evidence Item | Structured outcome artifact from adapter execution | Durable with retention policy |
| Connector Snapshot | Connector and config version captured at run launch | Durable |
| Readiness Snapshot | Environment validation state captured at launch | Durable |

---

## Employee package families

Six distinct governed package templates. These are not collapsible into a generic device workflow.

| Package | Devices |
|---------|---------|
| VDC Personnel | iPhone, iPad, Alienware desktop |
| Estimating Personnel | iPhone, Alienware laptop |
| Office Personnel | HP or Dell laptop |
| Operations Management | HP or Dell laptop, iPhone |
| Operations Management (alternate) | MacBook Pro, iPhone |
| Operations Field Staff | iPhone, iPad, HP or Dell laptop |

Each package produces one parent run with one child device run per device.

---

## Cross-references

- [Boundary matrix](white-glove-boundary-matrix.md) — operational concern ownership table
- [Repo-truth reuse map](white-glove-repo-truth-reuse-map.md) — existing foundations, extensions, and new build areas
- [No-go list](white-glove-no-go-list.md) — implementation constraints that must not be violated
- [Phase 9.1 prompt package](../phase-09.1/README.md) — execution order for white-glove implementation
- [End-state plan — Phase 9B](../admin-spfx-it-control-center-end-state-plan.md) — governing product plan
