# Admin SPFx IT Control Center — Domain Taxonomy

## Purpose

This document defines the canonical admin domain taxonomy for the Admin SPFx IT Control Center. It names every major domain, its sub-capabilities, its primary owner layer, and its current maturity in the repo. Later phases use this taxonomy to scope work, name features, and prevent drift.

## How to use this taxonomy

- **When planning a phase**: find the domain(s) in scope. Use the sub-capabilities to define deliverables.
- **When naming a feature**: use the domain and sub-capability names from this taxonomy, not ad hoc labels.
- **When checking scope**: verify the feature maps to a domain here. If it doesn't, either add a domain (with justification) or recognize you're out of scope.

## Domains

### 1. Operator Console Shell

**Purpose**: The top-level navigation, information architecture, and UX shell that organizes operator workflows into a coherent control-center experience.

**Sub-capabilities**:
- Workflow-oriented navigation (tool picker, sidebar, breadcrumbs)
- Permission-gated route access
- Complexity-tier feature exposure (Essential, Standard, Expert)
- Shell layout modes (simplified tenant-level)
- Cross-domain search and command surface (later)

**Primary owner**: SPFx operator console (`apps/admin`)

**Current maturity**: **Existing** — Working shell with 4 routes, tool picker navigation, complexity gating, and permission-gated access. Not yet expanded to full control-center IA (~8+ workflow areas at end state).

**Key later-phase dependencies**: Phase 5 reworks IA/navigation around the full domain set.

---

### 2. Setup / Install

**Purpose**: In-app backend installation, bootstrap, and initial environment configuration so the control center can be stood up from within the Admin app itself.

**Sub-capabilities**:
- Setup wizard UX
- Backend install/bootstrap initiation
- Prerequisite detection and preflight
- Post-install health verification
- Install run tracking and evidence

**Primary owner**: SPFx console (UX) + backend/control plane (execution)

**Current maturity**: **Not yet implemented** — No setup wizard or install flow exists. The admin app assumes backend infrastructure is already deployed.

**Key later-phase dependencies**: Phase 6 delivers in-app install/bootstrap.

---

### 3. Validation / Readiness

**Purpose**: Environment readiness checks, preflight validation, and dependency verification before runs or admin actions are initiated.

**Sub-capabilities**:
- Environment readiness probes
- Dependency validation (backend, SharePoint, Entra prerequisites)
- Preflight validation UX
- Validation result display and guidance
- Pre-run gate checks

**Primary owner**: SPFx console (UX) + admin intelligence (probes) + backend (execution probes)

**Current maturity**: **Partial** — `@hbc/features-admin` has 2 of 5 probes live (`sharePointProbe`, `azureFunctionsProbe`). Probe scheduling and display infrastructure exists. No formal preflight validation UX.

**Key later-phase dependencies**: Phase 6 builds preflight flows. Phase 12 completes probe coverage.

---

### 4. Runs / History / Status

**Purpose**: Operator visibility into active runs, completed runs, run history, and real-time status for all admin domain operations.

**Sub-capabilities**:
- Active run monitoring
- Run history browsing (filtered by domain, status, date)
- Run detail views (steps, timing, outcomes)
- Real-time status updates (SignalR)
- Run retry/archive/escalation actions

**Primary owner**: SPFx console (UX) + backend (API, state management) + persistence (run store)

**Current maturity**: **Existing** (provisioning-scoped) — `ProvisioningOversightPage.tsx` (759 lines) provides full CRUD: active/failure/completed/all tabs, retry with ceiling enforcement, archive, escalation acknowledge, expert-tier diagnostics. SignalR progress. Session token factory (P3-09). Not yet generalized beyond provisioning.

**Key later-phase dependencies**: Phase 3 generalizes backend run contracts. Phase 5 generalizes console UX.

---

### 5. Audit / Logs / Evidence

**Purpose**: Durable, reconstructable records of all admin actions for compliance, forensics, and operational accountability.

**Sub-capabilities**:
- Audit record browsing
- Error log viewing
- Per-run evidence chains (correlation IDs, input snapshots, step results)
- Retention and evidence boundaries
- Audit export / retrieval

**Primary owner**: Persistence (stores) + backend (writes) + SPFx console (read-only browsing)

**Current maturity**: **Partial** — Dual-store audit writes exist (SharePoint audit list + Azure Table). Correlation ID chains (`correlationId`, `parentCorrelationId`) exist. `ErrorLogPage.tsx` is a placeholder (SF17-T05). No generalized audit browsing UX.

**Key later-phase dependencies**: Phase 4 generalizes persistence. Phase 12 delivers ErrorLog and audit browsing.

---

### 6. SharePoint Control

**Purpose**: Active control over HB Intel-managed SharePoint assets — drift detection, standards comparison, preview/dry-run, and repair.

**Sub-capabilities**:
- HB Intel-managed site drift detection
- Standards comparison (current vs expected)
- Standards preview / dry-run
- Site standards application and reapplication
- Controlled site repair
- App catalog / package posture visibility
- API-access posture visibility
- Provisioning dependency validation

**Primary owner**: Backend/control plane (execution) + adapters (SharePoint service) + SPFx console (UX)

**Current maturity**: **Partial** — SharePoint service adapter exists with full provisioning contract (site lifecycle, document libraries, lists, web parts, permissions, audit writes). No drift detection, standards comparison, or repair flows beyond provisioning.

**Key later-phase dependencies**: Phase 8 delivers HB Intel SharePoint control. Phase 10 delivers standards governance.

---

### 7. Entra Control

**Purpose**: Broad Entra ID (Azure AD) administration — user/group management, access governance, identity standards, and rollout-critical identity setup.

**Sub-capabilities**:
- User create / modify / remove
- Group create / modify / remove
- Standards and normalization logic for identity objects
- App-related access governance flows
- Rollout-critical access setup
- Broader identity administration surfaces
- Risk-aware execution of identity changes

**Primary owner**: Backend/control plane (execution) + adapters (Graph service) + SPFx console (UX)

**Current maturity**: **Partial** — Graph service adapter exists with Entra group lifecycle (`createSecurityGroup`, `addGroupMembers`, `getGroupByDisplayName`, `grantSiteAccess`). Gated by `GRAPH_GROUP_PERMISSION_CONFIRMED`. No user management, no broader identity administration UX, no standards/normalization.

**Key later-phase dependencies**: Phase 9 delivers broad Entra administration.

---

### 8. Standards / Configuration Governance

**Purpose**: First-class governance of configuration and standards — code defaults, live admin-maintained overrides, versioning, audit trail, and drift baseline.

**Sub-capabilities**:
- Code-defined default standards
- Live admin-maintained governed configuration
- Config versioning
- Config audit trail
- Config-to-run traceability
- Drift detection tied to active standards state
- Standards management UX

**Primary owner**: Config governance (engine) + backend (resolution at run time) + SPFx console (management UX)

**Current maturity**: **Not yet implemented** — Provisioning has implicit config (template files, data list schemas) but no explicit standards governance capability. No config versioning, no config audit trail, no drift baseline.

**Key later-phase dependencies**: Phase 10 delivers the hybrid source-of-truth model.

---

### 9. Health / Alerts / Probes

**Purpose**: Operational health monitoring, alerting, and infrastructure probing for the HB Intel environment.

**Sub-capabilities**:
- Alert monitoring and badge display
- Infrastructure probe execution and scheduling
- Alert dashboard
- Probe result visualization
- Alert dispatch (Teams webhook, email)
- Health summary views

**Primary owner**: Admin intelligence (`@hbc/features-admin`) + SPFx console (display)

**Current maturity**: **Partial** — Alert/probe architecture is mature (ports-and-adapters, ADR-0106). 2 of 6 monitors live (`provisioningFailureMonitor`, `stuckWorkflowMonitor`). 2 of 5 probes live (`sharePointProbe`, `azureFunctionsProbe`). In-memory alert store (Wave 0). `AdminAlertBadge` and polling hooks in root route. Teams webhook dispatch adapter exists.

**Key later-phase dependencies**: Phase 12 completes monitors/probes and adds durable stores.

---

### 10. Repair / Recovery Initiation

**Purpose**: Operator-initiated repair and recovery actions for failed runs, degraded environments, and drifted configurations.

**Sub-capabilities**:
- Retry initiation (with ceiling enforcement)
- Escalation acknowledgment
- Manual state override (expert tier)
- Targeted repair workflows (site repair, permission repair, config reapplication)
- Recovery guidance and operator coaching
- Compensation visibility

**Primary owner**: SPFx console (initiation UX) + backend/control plane (execution) + adapters (repair actions)

**Current maturity**: **Partial** — Provisioning retry with ceiling enforcement, archive, escalation acknowledge, and expert-tier manual state override exist in `ProvisioningOversightPage.tsx`. Saga compensators exist (Steps 7→1). No generalized repair workflows beyond provisioning.

**Key later-phase dependencies**: Phase 7 hardens provisioning repair. Phase 11 delivers the high-risk action safety model.
