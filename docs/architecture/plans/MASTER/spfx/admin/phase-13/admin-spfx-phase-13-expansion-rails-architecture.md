# Admin SPFx IT Control Center — Phase 13 Expansion Rails Architecture

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-08 — Phase 13 Expansion Rails Architecture
**Scope:** Future expansion architecture without blurring current production scope
**Evidence base:** End-state plan, P13-01 through P13-07

---

## 1. Purpose

This document defines the future expansion architecture for the Admin SPFx IT Control Center. It separates current production scope from future expansion rails, preserves architectural invariants, and provides concrete guidance for future planning without implementing or committing to expansion scope.

Nothing in this document is current capability. Everything described here is a documented expansion path that requires explicit approval before implementation.

---

## 2. Current production boundary

The following is the complete production scope as of Phase 13 exit. Expansion must not blur these boundaries.

### 2.1 What the Admin IT Control Center manages today

| Domain | Scope | Key surfaces |
|--------|-------|-------------|
| **Provisioning** | HB Intel project site provisioning via 7-step saga | `/setup`, `/setup/run/$runId`, `/runs` |
| **App binding** | SPFx app binding to backend, binding verification | `/setup/bindings` |
| **SharePoint control** | Drift detection and repair for HB Intel-managed SharePoint assets only | `/sharepoint` |
| **Hybrid identity** | AD DS + Entra/Graph user lifecycle for HB Intel-scoped operations | `/entra` |
| **White-glove devices** | Employee device deployment across Microsoft, Apple, NinjaOne platforms | 7 white-glove routes |
| **Standards governance** | Live admin-maintained configuration for HB Intel standards | `/config` (StandardsConfigPage) |
| **Access control** | Admin access and approval authority configuration | `/config` (SystemSettingsPage) |
| **Observability** | Alerts, probes, error log, health dashboard for HB Intel operations | `/health`, `/errors` |
| **Operator landing** | Lane-based navigation to all active admin domains | `/` |

### 2.2 What the Admin IT Control Center does NOT manage today

| Excluded scope | Why excluded | Governed by |
|---------------|-------------|------------|
| Tenant-wide SharePoint governance (all sites, all content types, all permissions) | Current scope is HB Intel-managed assets only | Not yet in scope; requires expansion approval |
| Broader Microsoft 365 admin (Exchange, Teams admin, Intune policies, Compliance Center) | Beyond HB Intel operational scope | Microsoft 365 Admin Center |
| Enterprise-wide device management (all employees, all policies) | White-glove is scoped to HB Intel employee packages only | IT device management tooling |
| Requester-facing features (PWA, project requesting, end-user workflows) | Admin console is operator surface, not requester surface | `apps/pwa` and feature packages |
| Multi-tenant or SaaS-model operations | HB Intel is a single-tenant system | Not applicable |

---

## 3. Approved near-term expansion rails

These expansion paths are architecturally compatible with the current system and can be pursued as incremental additions without restructuring. Each still requires explicit product/architecture approval before implementation.

### E1 — Additional provisioning monitors

**What:** Activate the 3 deferred monitors (permission-anomaly, upcoming-expiration, stale-record) when domain data providers become available.

**Prerequisites:**
- Permission audit data source modeled and accessible
- Expiration-tracked entities modeled in domain
- Record-freshness metadata available

**Architecture impact:** None — monitor registry, scheduler, and notification infrastructure already exist. Each new monitor is a new implementation of the existing `IMonitor` interface injected via the registry.

**Boundary preserved:** Monitors run in the SPFx polling cycle; privileged data comes from backend APIs.

### E2 — Additional infrastructure probes

**What:** Activate the 3 deferred probes (search, notification, module-record-health) when backend health endpoints become available.

**Prerequisites:**
- Azure Search adoption with health endpoint
- Notification system health endpoint
- Module-record integrity query endpoint

**Architecture impact:** None — probe scheduler and `InfrastructureProbeApi` already support new probes. Each new probe implements the existing `IProbe` interface.

**Boundary preserved:** Probes execute in the SPFx polling cycle against backend health endpoints.

### E3 — Email notification relay

**What:** Replace console-logged email relay with real SMTP integration (SendGrid or equivalent).

**Prerequisites:**
- SMTP provider configured (SendGrid account, verified sender domain)
- `EMAIL_DELIVERY_API_KEY` and `EMAIL_FROM_ADDRESS` populated (currently stub in `wave0-env-registry.ts`)

**Architecture impact:** Minimal — notification router already supports immediate/digest routing. Email adapter replaces the console-log stub.

**Boundary preserved:** Email dispatch happens in the backend or notification service, not in the SPFx console.

### E4 — Teams webhook retry queue

**What:** Replace fire-and-forget webhook dispatch with persistent retry queue.

**Prerequisites:**
- Persistent queue mechanism (Azure Queue Storage or equivalent)
- Retry policy with exponential backoff and dead-letter handling

**Architecture impact:** Low — `TeamsWebhookDispatchAdapter` already tracks delivery status. Adding retry requires a queue producer/consumer pattern.

**Boundary preserved:** Dispatch and retry happen in the backend, not in the SPFx console.

### E5 — ApprovalAuthority persistence

**What:** Persist approval authority rules to backend storage (SF17-T05).

**Prerequisites:**
- Backend API endpoint for approval rule CRUD
- Table Storage entity design for approval rules
- Migration path from in-memory stub

**Architecture impact:** Low — `ApprovalAuthorityApi` interface already exists. Implementation replaces stub with real backend client.

**Boundary preserved:** Rules stored and enforced in backend; SPFx console is the configuration UI only.

### E6 — Cross-domain observability event emission

**What:** Instrument additional admin domains (SharePoint control, Entra control, standards config, white-glove deployment) to emit structured audit events to the observability spine.

**Prerequisites:**
- Audit event type definitions per domain
- Backend route instrumentation following `ProvisioningAuditBridge` pattern

**Architecture impact:** Low — audit spine, event types, and bridge pattern already exist. Each new domain adds a new bridge implementation.

**Boundary preserved:** Audit events emitted by backend; SPFx console displays via existing observability surfaces.

---

## 4. Later expansion rails

These expansion paths go beyond the current HB Intel-managed scope and require significant planning, architecture review, and approval. They are documented as rails — not commitments.

### L1 — Broader SharePoint tenant governance

**What:** Extend admin control to SharePoint assets beyond HB Intel-managed sites — tenant-wide site inventory, content type governance, permission auditing across all sites, tenant health monitoring.

**Architecture considerations:**
- Requires tenant-wide SharePoint permissions (currently scoped to `Sites.Selected`)
- `Sites.FullControl.All` or equivalent would violate current least-privilege model — requires ADR
- Operator console would need new lanes for tenant-wide views
- Backend would need new domain host (or expansion of admin-control-plane host)
- Audit volume would increase significantly — retention and performance implications

**What must NOT happen:**
- Do not grant `Sites.FullControl.All` preemptively
- Do not mix tenant-wide and HB Intel-specific logic in the same backend routes
- Do not assume current provisioning saga patterns apply to tenant-wide governance

**Expansion design:**
- New lanes in operator console (lane-registry extensible by design)
- New backend domain host per ADR-0124 pattern
- Separate permission model with explicit scope boundaries
- Separate audit partition to avoid cross-contamination with HB Intel audit records

### L2 — Wider Microsoft 365 admin domains

**What:** Extend admin control into Exchange Online management, Teams admin operations, Intune policy governance, Compliance Center integration, or other M365 admin APIs.

**Architecture considerations:**
- Each M365 domain has its own API surface (Exchange Online Management, Teams Graph, Intune Graph)
- Each domain has its own permission model and admin consent requirements
- Current backend is built around SharePoint + Graph; M365 admin APIs are different SDK families
- Operator console lane model supports unlimited lanes, but cognitive load must be managed

**What must NOT happen:**
- Do not flatten all M365 admin into a single "admin" page
- Do not assume Graph API covers all M365 admin operations (some require PowerShell or specialized APIs)
- Do not bundle M365 admin permissions with HB Intel provisioning permissions
- Do not add M365 admin dependencies to existing backend hosts

**Expansion design:**
- One backend domain host per M365 admin domain (per ADR-0124)
- Independent permission model per M365 domain
- New operator console lanes with appropriate permission gates
- Independent audit partition per domain

### L3 — Broader enterprise control-center capabilities

**What:** Evolve the Admin IT Control Center from an HB Intel operations tool into a broader IT operations platform — multi-product admin console, cross-system health aggregation, enterprise-wide compliance dashboards, multi-tenant or multi-org support.

**Architecture considerations:**
- This fundamentally changes the product scope from "HB Intel admin tool" to "enterprise IT platform"
- Requires reassessing package boundaries, deployment model, and operational support footprint
- Current 4-tier support model (P13-04) is sized for a small team — enterprise scope requires different staffing
- Current single-tenant model does not support multi-org isolation

**What must NOT happen:**
- Do not let incremental feature additions implicitly grow into enterprise scope
- Do not skip the architecture review by treating enterprise features as "just another lane"
- Do not share HB Intel audit/evidence stores with non-HB Intel operations

**Expansion design:**
- Formal architecture review and ADR before any enterprise-scope work
- Separate deployment model assessment (shared vs. isolated Function Apps)
- Support model redesign (P13-04 model is not enterprise-scale)
- Potential multi-shell design (separate SPFx apps per product area, shared design system)

---

## 5. Architectural invariants that must survive expansion

Every expansion rail — near-term or later — must preserve these invariants.

| # | Invariant | Why | Enforcement mechanism |
|---|-----------|-----|----------------------|
| I1 | **SPFx console remains an operator surface, not a control plane** | Privileged logic in the browser bypasses backend security boundaries | Code review; ESLint enforcement rules; boundary auditor |
| I2 | **Privileged operations execute in the backend** | Backend enforces auth, validates prerequisites, manages durable state, and produces audit records | Architecture review; ADR-0124 host separation |
| I3 | **Least-privilege permissions** | Granting broad permissions to work around expansion complexity creates tenant-wide security risk | `Sites.Selected` per-site grants; explicit Graph permission scoping; ADR for any escalation |
| I4 | **Audit trail for every state change** | Expansion without audit creates operational blind spots and compliance risk | Append-only audit stores; provisioning audit bridge pattern; audit gap documentation |
| I5 | **Evidence assembly at terminal states** | Every operation that changes external state must produce reconstructable evidence | Evidence store pattern; evidence payload at saga completion/failure |
| I6 | **Safety controls for high-risk actions** | Expansion into broader admin domains increases blast radius — safety must scale with risk | Phase 11 safety workflow: preview, confirmation, post-run validation, recovery |
| I7 | **Explicit support model for every new domain** | Expansion without support ownership creates "nobody owns this in production" | P13-04 support model extended per domain; no domain goes live without assigned T1/T2 ownership |
| I8 | **Backend host separation per domain** | Mixing domain logic in a single host creates coupling and deployment risk | ADR-0124 domain host pattern; one host per expansion domain |
| I9 | **No cross-feature-package coupling** | Feature packages must not depend on each other — shared logic goes in shared packages | Package relationship map; boundary auditor |
| I10 | **Runbook readiness before production** | No expanded domain goes live without deployment, rollback, incident triage, and recovery runbooks | P13-05/P13-06 runbook pattern replicated per domain |

---

## 6. Capabilities that require fresh approval before active control

These capabilities exist as concepts in the end-state plan but are NOT approved for implementation. Each requires explicit product owner + architecture approval.

| Capability | Why fresh approval needed | Approval criteria |
|-----------|-------------------------|-------------------|
| Tenant-wide SharePoint site inventory and governance | Changes permission model from per-site to tenant-wide | ADR documenting permission escalation, risk assessment, and rollback path |
| Exchange Online / Teams / Intune admin integration | Introduces new API families, permission scopes, and operational complexity | Architecture review of backend host design, permission model, and support model |
| Enterprise-scale device management beyond white-glove | Changes device management from curated packages to fleet-wide policy | Product scope review; support model reassessment |
| Multi-tenant or multi-org isolation | Fundamental change to deployment, data isolation, and operational model | Full architecture redesign proposal with ADR |
| Cross-system health aggregation (non-HB Intel systems) | Expands observability scope beyond HB Intel operational boundary | Product scope review; dependency and failure-mode analysis for new systems |
| Automated per-site grant provisioning (replacing manual IT confirmation) | Changes the `Sites.Selected` grant workflow from manual to automated | Security review; IT approval; ADR documenting the automation scope and safeguards |

---

## 7. Extension design rules

When any expansion rail is approved for implementation, follow these rules:

### 7.1 Console extension

1. **Add new lanes to the lane registry** — the registry is designed to be extensible. Each new admin domain gets its own lane(s).
2. **Create new page files per route** — do not overload existing pages with unrelated domain logic.
3. **Apply permission gates** — every new route must have appropriate permission guards, not default to open.
4. **Follow the complexity dial pattern** — essential/standard/expert tiers help operators manage new capabilities incrementally.

### 7.2 Backend extension

1. **Create a new domain host** (per ADR-0124) for each major expansion domain. Do not add expansion routes to existing hosts.
2. **Register new adapter descriptors** in the adapter registry for new external service integrations.
3. **Follow the tiered config validation pattern** — new config entries go in the registry with documented tiers and ownership.
4. **Implement audit bridge per domain** — follow the `ProvisioningAuditBridge` pattern for structured event emission.

### 7.3 Observability extension

1. **Add monitors for each new domain** — follow the `IMonitor` interface and register in the monitor registry.
2. **Add probes for each new backend dependency** — follow the `IProbe` interface and register in the probe scheduler.
3. **Extend the error classification taxonomy** if new error patterns emerge.
4. **Add KQL queries** for each new domain's telemetry patterns.

### 7.4 Documentation extension

1. **Create operator runbook per new domain** — follow the phase-specific operator runbook pattern (P6, P6A, P8, P9, P12).
2. **Extend the deployment runbook** if new deployment artifacts or coordination requirements are introduced.
3. **Extend the support model** with T1 responsibilities and escalation triggers for the new domain.
4. **Update the IT-Department-Setup-Guide** if new Azure resources, permissions, or external services are required.

---

## 8. No-go expansion shortcuts

| # | Shortcut | Why it is a no-go | What to do instead |
|---|----------|-------------------|-------------------|
| XNG-1 | **Granting `Sites.FullControl.All` to enable tenant-wide governance quickly** | Violates least-privilege; grants access to every site in the tenant | Design a scoped permission model for the specific governance scenario; pursue ADR |
| XNG-2 | **Adding expansion routes to existing backend hosts** | Creates coupling between current and future domains; deployment of one domain risks the other | Create new domain host per ADR-0124 |
| XNG-3 | **Reusing HB Intel audit tables for non-HB Intel operations** | Cross-contaminates audit records; makes compliance queries unreliable | Create separate audit partition or table per expansion domain |
| XNG-4 | **Shipping expansion features without runbooks** | Creates unsupportable production surfaces | Follow P13-05/P13-06 runbook pattern for every new production surface |
| XNG-5 | **Treating expansion as "just another lane" without architecture review** | Incremental scope creep bypasses proper planning and risk assessment | Require T4 architecture review for any expansion beyond near-term rails (E1–E6) |
| XNG-6 | **Mixing M365 admin permissions with HB Intel provisioning permissions** | Conflates operational scopes; makes permission auditing and revocation difficult | Separate app registration or permission set per admin domain |
| XNG-7 | **Building expansion on Wave 0 stubs** | Stubs (email relay, approval authority, deferred monitors) are not production-grade foundations | Complete the stub → production path (E1–E5) before building on top |
| XNG-8 | **Expanding into enterprise-scale without reassessing the support model** | Current 4-tier model is sized for a small team; enterprise scope requires different staffing | Redesign support model before enterprise-scope go-live |

---

## Validation checklist

- [x] Current production scope is explicitly bounded (Section 2)
- [x] Near-term rails (E1–E6) are architecturally safe and incremental
- [x] Later rails (L1–L3) require explicit architecture/product approval
- [x] Architectural invariants (I1–I10) are concrete and enforceable
- [x] Fresh-approval capabilities are listed with criteria
- [x] Extension design rules cover console, backend, observability, and documentation
- [x] No-go shortcuts (XNG-1 through XNG-8) prevent unsafe expansion patterns
- [x] Nothing is written as current capability unless implemented
- [x] Document is concrete enough to guide future planning
