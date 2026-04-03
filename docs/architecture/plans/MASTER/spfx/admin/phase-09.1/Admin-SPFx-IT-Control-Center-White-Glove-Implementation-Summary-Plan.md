# Admin SPFx IT Control Center — White-Glove Device Deployment Implementation Summary Plan

## Objective

Generate and execute a production-realistic implementation program for a **white-glove employee device deployment feature** inside the **Admin SPFx IT Control Center**.

This plan assumes the attached session brief is the governing objective and that the existing **Admin SPFx operator-console / privileged backend** architecture remains mandatory.

## Governing implementation posture

- **Admin SPFx remains the operator console.**
- **Privileged execution stays in the backend control plane.**
- **Windows, macOS, iPhone, and iPad are modeled as different operational lanes.**
- **NinjaOne is treated as a downstream endpoint-management and standardization system, not the enrollment authority.**
- **Microsoft platform-native services own Microsoft enrollment and device identity.**
- **Apple platform-native services own Apple ADE and supervised device enrollment.**
- **Runs, checkpoints, retries, evidence, health, and audit history are first-class.**
- **Configuration and connection setup must be fully UI-driven for the IT department wherever technically possible.**

## Locked implementation decisions

### 1. Primary Microsoft strategy
Use **Windows Autopilot + Intune + Microsoft Entra ID** as the primary Windows enrollment and deployment path.  
Use **technician-assisted pre-provisioning** for white-glove Windows builds.

### 2. Primary Apple strategy
Use **Apple Business Manager + Automated Device Enrollment + Intune MDM** as the primary Apple enrollment path for iPhone, iPad, and macOS.

### 3. NinjaOne role
Use NinjaOne for:

- post-enrollment software deployment
- device standardization
- policy application
- scripting / remediation
- validation
- endpoint metadata and support automation

Do **not** make NinjaOne the authority for:

- Windows Autopilot registration
- Apple ADE ownership
- Entra identity authority
- device enrollment source of truth

### 4. Run model
Use a **parent package run** with **child device runs** and device-specific checkpoints.

### 5. Safety model
High-risk actions must support:

- dry-run / preview where feasible
- readiness validation
- explicit checkpointing
- durable evidence
- durable audit trail
- guided retry / repair / recovery

### 6. Configuration model
Use **code-defined standards** plus **governed live-admin overlays** for:

- package templates
- connector settings
- execution policy toggles
- checkpoint policy
- software standard bundles
- environment readiness thresholds

## Repo-truth findings summary

## What already exists and should be reused

### Admin surface foundations
The repo already has a meaningful Admin application with:

- shell-based admin routing
- system settings surface
- dashboards and monitoring
- provisioning oversight
- permission-gated recovery actions
- live alert / probe polling hooks

### Admin intelligence foundations
The repo already has a reusable `@hbc/features-admin` layer with:

- admin alert monitors
- infrastructure probes
- approval authority components
- admin dashboard components
- admin hooks / APIs

### Backend / control-plane foundations
The repo already has meaningful backend substrate that should be generalized instead of replaced:

- Azure Functions backend
- service factory and adapter pattern
- managed identity usage
- Graph adapter
- Azure Table-backed provisioning run persistence
- SignalR progress updates
- retry / state override / archive / escalation patterns
- headless provisioning package and API client

## What is present but incomplete

The current admin-intelligence and admin-control posture is not yet sufficient for this feature because several capabilities remain in-memory, stubbed, or scoped to existing provisioning only.

Incomplete / partial areas include:

- durable connector-health persistence
- durable probe history
- durable admin-intelligence persistence
- generalized device-package run model
- Microsoft Intune / Autopilot adapter layer
- Apple ABM / ADE adapter layer
- NinjaOne adapter layer
- mixed-device package orchestration
- governed connector configuration UX
- package-template governance UX
- device-package launch / checkpoint UX
- durable evidence model beyond current provisioning history
- white-glove package standards model

## What is missing for the white-glove feature

### Domain model gaps
Missing:

- employee device package template model
- per-package device standards
- package/run/device checkpoint taxonomy
- readiness and failure classification specific to device deployment
- connection and environment validation contracts for Microsoft / Apple / NinjaOne

### Backend gaps
Missing:

- generalized white-glove orchestration endpoints
- Microsoft device-deployment adapter set
- Apple device-deployment adapter set
- NinjaOne package deployment / validation adapter
- package-run / child-run persistence model
- evidence collection for multi-device execution
- normalized downstream result model for SPFx

### SPFx gaps
Missing:

- employee lookup + package launch workflow
- target device intake forms by platform
- package-level preflight / readiness UX
- service-connection configuration and test UX
- package run history / evidence / checkpoint UX
- standards / template governance UX
- connector health and drift UX for this domain

### Documentation / operations gaps
Missing:

- end-to-end IT enablement guide for Microsoft / Apple / NinjaOne
- runbooks for first-use readiness
- troubleshooting model for enrollment and post-enrollment failures
- live environment setup instructions inside the Admin experience

## Recommended implementation strategy

## Strategy statement

Do **not** build this as a single page or a narrow wizard.

Build it as a new **control-plane domain** inside the Admin IT Control Center that reuses the existing operator-console and backend patterns but extends them with:

- white-glove package domain contracts
- connector and configuration governance
- package orchestration
- Microsoft / Apple / NinjaOne adapters
- run / evidence / audit durability
- operator visibility and recovery surfaces

## Target architecture view

```text
Admin SPFx IT Control Center
  -> connector configuration + readiness probes
  -> package templates + standards
  -> employee lookup + package launch
  -> run status + checkpoints + evidence + audit
  -> recovery / retry / repair UX

Privileged backend control plane
  -> package command API
  -> parent / child run orchestrator
  -> checkpoint engine
  -> retry / compensation / repair rules
  -> durable run + audit + evidence persistence
  -> Microsoft adapter
  -> Apple adapter
  -> NinjaOne adapter

Platform systems
  -> Microsoft Entra ID
  -> Microsoft Intune / Windows Autopilot
  -> Apple Business Manager / ADE / APNs
  -> NinjaOne
```

## Required domain model

### Employee package types
The solution must preserve all six distinct package families:

1. VDC Personnel
   - iPhone
   - iPad
   - Alienware desktop

2. Estimating Personnel
   - iPhone
   - Alienware laptop

3. Office Personnel
   - HP or Dell laptop

4. Operations Personnel — Management
   - HP or Dell laptop
   - iPhone

5. Operations Personnel — Management (alternate)
   - MacBook Pro
   - iPhone

6. Operations Personnel — Field Staff
   - iPhone
   - iPad
   - HP or Dell laptop

### Run hierarchy
Required model:

- **Package Run** — parent request / orchestration root
- **Device Run** — one child run per target device
- **Checkpoint** — approval / technician / dependency gate
- **Evidence Item** — structured outcome artifact
- **Connector Snapshot** — connector and config version at run time
- **Readiness Snapshot** — environment validation state at launch time

## Workstream and phase map

### Phase 1 — Repo-truth baseline and architecture freeze
Purpose:

- freeze boundaries
- confirm reuse targets
- define proposed file placement
- lock the Microsoft / Apple / NinjaOne ownership model

### Phase 2 — White-glove domain model and standards baseline
Purpose:

- define package templates
- define run states, checkpoint types, evidence classes
- define code-defined vs admin-maintained governance boundaries

### Phase 3 — Connector registry and governed configuration spine
Purpose:

- build secure connection resolution
- build connector metadata, test actions, health model
- build governed live-admin config versioning

### Phase 4 — Generalized control-plane contracts and durable run spine
Purpose:

- extend current backend run patterns into parent / child package runs
- add package audit / evidence / checkpoint contracts
- preserve provisioning compatibility

### Phase 5 — Microsoft white-glove adapter lane
Purpose:

- implement Entra / Intune / Autopilot control-plane adapters
- implement Windows device registration / assignment / status normalization
- model technician-assisted pre-provisioning checkpoints

### Phase 6 — Apple white-glove adapter lane
Purpose:

- implement ABM / ADE / Intune MDM connector lane
- model supervised enrollment and assignment readiness
- support iPhone, iPad, and macOS differences

### Phase 7 — NinjaOne standardization lane
Purpose:

- implement API / OAuth connectivity
- trigger post-enrollment scripts, policy bundles, and software bundles
- record validation outcomes

### Phase 8 — Admin SPFx connector and readiness UX
Purpose:

- full UI configuration of backend connections
- health probes
- readiness pages
- operator-visible connector status

### Phase 9 — Admin SPFx package launch UX
Purpose:

- employee lookup
- package selection
- device details capture
- preflight validation
- checkpoint visualization
- launch confirmation

### Phase 10 — Run history, evidence, and recovery UX
Purpose:

- package run history
- device run detail
- evidence browsing
- retry / repair / recovery guidance
- operator action attribution

### Phase 11 — Standards and template governance UX
Purpose:

- package template management
- software and standards bundle assignment
- governed overrides
- audit trail and version traceability

### Phase 12 — Test, hardening, and observability completion
Purpose:

- durable health data
- end-to-end tests
- connector failure scenarios
- run reconciliation
- documentation closeout

### Phase 13 — Verification and implementation closeout
Purpose:

- final repo-truth audit
- final architecture alignment review
- production-readiness closeout
- IT enablement verification

## Deliverable file map

This package includes:

- `Admin-SPFx-IT-Control-Center-White-Glove-Implementation-Summary-Plan.md`
- `admin-spfx-white-glove-gap-map.md`
- `README.md`
- `IT-Department-Setup-and-Enablement-Guide.md`
- `Prompt-01-*` through `Prompt-14-*`

## Proposed repo targets

## SPFx / frontend
- `apps/admin/src/router/`
- `apps/admin/src/pages/`
- `apps/admin/src/hooks/`
- `apps/admin/src/components/` or feature-local page composition folders
- `packages/features/admin/src/`

## Backend / control plane
- `backend/functions/src/functions/`
- `backend/functions/src/services/`
- `backend/functions/src/hosts/` where release-scope files already exist
- `backend/functions/src/utils/`
- `backend/functions/src/contracts/` if the repo already uses a similar pattern, otherwise colocate with services and model packages

## Shared / headless
- `packages/provisioning/` only where reuse/generalization is appropriate
- `@hbc/models` contracts if shared domain types belong there
- `packages/features/admin/README.md`
- `packages/provisioning/README.md`

## Docs
- `docs/architecture/plans/MASTER/spfx/admin/`
- `docs/architecture/reviews/`
- `docs/reference/`
- `docs/how-to/developer/`
- `docs/maintenance/` where tenant or operational prerequisites belong

## Acceptance bar for the overall package

The implementation is only complete when:

- the operator-console / privileged-backend boundary is preserved
- all required Microsoft, Apple, and NinjaOne connectors are setup through UI-driven flows
- all six employee package families are implemented without flattening their operational differences
- Windows, macOS, iPhone, and iPad each have explicit workflow handling
- parent / child run orchestration exists with durable persistence
- operator-visible logs, status, health, evidence, and audit history exist
- checkpointed recovery and retry patterns are implemented
- standards and template governance are implemented
- the IT department can prepare the environment using the included setup guide without code edits
- documentation is updated in-place at authoritative repo locations

## Execution note for the local code agent

Every prompt in this package assumes:

- do not re-read files already in active context unless necessary
- reuse current repo truth before inventing new abstractions
- update authoritative docs instead of writing duplicate guidance
- preserve platform-native ownership for Microsoft and Apple
- do not collapse all responsibility into custom code
- do not move privileged execution into SPFx
