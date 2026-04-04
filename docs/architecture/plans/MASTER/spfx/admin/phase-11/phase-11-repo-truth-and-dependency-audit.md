# Phase 11 — Repo-Truth and Dependency Audit

## 1. Purpose

This document captures the confirmed state of the HB Intel repository as it relates to **Phase 11 — High-risk action safety model**. It establishes what currently exists, what is mature enough to build on, what gaps must be addressed, and what Phase 11 should not attempt to backfill.

This is an audit artifact, not an implementation document. All claims are verified against live code and package manifests as of the audit date.

---

## 2. Authority set actually used

| Source | Path | Role |
|--------|------|------|
| Root operating brief | `CLAUDE.md` | Agent operating rules and authority hierarchy |
| Current-state map | `docs/architecture/blueprint/current-state-map.md` | Present-truth authority |
| Target architecture | `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` | Target-state reference |
| End-state plan | `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` | Phase definitions and exit criteria |
| Phase 11 summary plan | `docs/architecture/plans/MASTER/spfx/admin/phase-11/Admin-SPFx-IT-Control-Center-Phase-11-Summary-Plan.md` | Phase scope and objectives |
| Admin app package | `apps/admin/package.json` | Dependencies, scripts, version |
| Admin app entry | `apps/admin/src/App.tsx` | Provider composition, error boundary |
| Admin routes | `apps/admin/src/router/routes.ts` | Route wiring and permission guards |
| Admin pages | `apps/admin/src/pages/*.tsx` | Page-level implementation maturity |
| Admin app README | `apps/admin/README.md` | Lane structure, polling, known limitations |
| Features-admin package | `packages/features/admin/package.json` | Exports, dependencies |
| Features-admin README | `packages/features/admin/README.md` | Boundary, Wave 0 limitations |
| UI kit package | `packages/ui-kit/package.json` | Exports, component surface |
| Models package | `packages/models/package.json` | Shared types, subpath exports |
| Models admin types | `packages/models/src/admin-control-plane/index.ts` | Enums, interfaces, contracts |
| Backend functions package | `backend/functions/package.json` | Dependencies, scripts, version |
| Backend functions README | `backend/functions/README.md` | API surface, auth, saga, audit |
| Saga orchestrator | `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Retry, compensation, evidence, failure classification |
| Service factory | `backend/functions/src/services/service-factory.ts` | Service composition, adapter mode |
| Auth middleware | `backend/functions/src/middleware/auth.ts` | Token validation, auth context |
| Authorization middleware | `backend/functions/src/middleware/authorization.ts` | Role checks, scope enforcement, break-glass telemetry |
| Admin control plane services | `backend/functions/src/services/admin-control-plane/*.ts` | Audit store, evidence, preflight, install, config, binding, SharePoint, drift |
| Admin API routes | `backend/functions/src/functions/adminApi/*.ts` | Endpoint registration and route handlers |

---

## 3. Confirmed repo facts relevant to Phase 11

### Admin operator console

- `apps/admin` exists as `@hbc/spfx-admin` version `00.000.117`.
- Build, lint, and test scripts are functional (`tsc --noEmit && vite build`, `eslint`, `vitest`).
- App composition uses `HbcThemeProvider` → `HbcToastProvider` → `QueryClientProvider` → `HbcErrorBoundary` → `ComplexityProvider` → `RouterProvider`.
- 20 routes are registered: 19 with real implementations, 1 stub (`ErrorLogPage`).
- All lane routes use `adminBeforeLoad` guard requiring `admin:access-control:view` or `*:*` permission.
- Legacy redirects exist for backward compatibility: `/provisioning-failures` → `/runs`, `/dashboards` → `/health`, `/error-log` → `/errors`.

### Route and page maturity

| Route | Page | Maturity | Safety-relevant features |
|-------|------|----------|-------------------------|
| `/runs` | ProvisioningOversightPage | Production | Permission-gated destructive actions (retry, archive, escalation, force-state), confirmation dialogs, complexity gating, retry ceiling, runbook links |
| `/health` | OperationalDashboardPage | Production | Alert dashboard, probe dashboard, health metrics, coaching callouts |
| `/standards-config` | StandardsConfigPage | Production | Config versioning, audit-reason-required publish/revert, domain taxonomy |
| `/config` | SystemSettingsPage | Production | Access control, approval authority rules, permission-gated editing |
| `/errors` | ErrorLogPage | Stub | `HbcSmartEmptyState` with `truly-empty` classification, deferred to SF17-T05 |
| `/setup` | SetupWizardPage | Production | Preflight checks (6 categories), blocking/non-blocking failures, install launch |
| `/setup/run/$runId` | InstallRunDetailPage | Production | Polling, checkpoint approve/reject, step progress, post-install verification |
| `/setup/bindings` | BindingStatusPage | Production | Binding status, verify, repair with rationale |
| `/validation` | ValidationLanePage | Scaffold | Phase 7 placeholder |
| `/sharepoint` | SharePointControlPage | UI shell | Drift/preview/repair/posture UI complete, backend API integration pending |
| `/entra` | EntraLanePage | Production | Risk-tiered actions (routine/elevated/destructive), checkpoint flows, authority-aware operations, audit history |
| `/white-glove/*` | 7 pages | Production | Device deployment, connectors, readiness, checkpoints, evidence, history, standards |

### Current admin routes and SystemSettingsPage

- Routes are wired to dedicated pages, not collapsed into `SystemSettingsPage`.
- `SystemSettingsPage` serves only the `/config` route for access control and approval authority.
- No routes point back into `SystemSettingsPage` as proxy — this was true in earlier phases but has been corrected.

### Backend control plane

- `backend/functions` exists as `@hbc/functions` version `00.000.131`.
- Auth middleware: `withAuth()` wrapper validates JWT against Azure Entra JWKS; `requireAdmin()`, `requireDelegatedScope()`, `requireWorkloadRole()` enforce policy.
- Role constants: `ADMIN_ROLES` (`Admin`, `HBIntelAdmin`), `CONTROLLER_ROLES`, `BREAK_GLASS_ROLES`, `AUTOMATION_ROLES`.
- Break-glass telemetry: `emitAuthorizationTelemetry()` emits `authz.break_glass` events for accountability.
- Admin API: 13+ authenticated endpoints under `/api/admin/` across 5 route files (`index.ts`, `app-binding-routes.ts`, `hybrid-identity-routes.ts`, `connection-routes.ts`, `white-glove-routes.ts`).
- Service factory: singleton pattern with eager/lazy initialization, adapter-mode validation, degraded-mode warnings.

### Provisioning saga

- 7-step provisioning with `withRetry()` (max 3 attempts, 2s base delay).
- Step idempotency guards via `isStepAlreadyCompleted()`.
- Full compensation chain (reverse order, Step 7 → Step 1), including explicit Entra group deletion.
- Evidence capture: `buildEvidencePayload()` with per-step timing, attempt counts, permission posture, failure classification, parent correlation chain.
- Failure classification: `classifyFailure()` maps to `transient`, `permissions`, `structural`, `repeated`, or `admin-class`.
- Dual audit store writes: Azure Table `ProvisioningStatus` + non-blocking SharePoint `ProvisioningAuditLog`.

### Audit and evidence infrastructure

- **Durable audit store (Phase 4):** `AdminAuditEvents` table in Azure Table Storage.
- **Audit record schema:** `IAdminAuditRecord` with `auditId`, `eventType` (18 types), `domain`, `actionKey`, `runId`, `actor` (UPN, OID, display name), `rationale`, `evidenceRef`, `configSnapshotRef`, `summary`.
- **Evidence service (Phase 4):** `IAdminEvidenceService` with retention policies, inline (< 32 KB) / offload boundary.
- **Evidence types:** 8 defined (`command-input-snapshot`, `step-result-detail`, `preview-result`, `post-validation-summary`, `compensation-record`, `external-event-payload`, `drift-report`, `error-diagnostic`).
- **Config snapshot store (Phase 10):** Captures config state at action time for audit linkage.

---

## 4. Current implementation maturity by area

### Operator console

**Maturity: Production — active and growing.**

The admin app has 8 active lanes with 19 real page implementations. The app shell is provider-composed with error boundary, theme, toast, query client, complexity gating, and TanStack Router. Permission guards are applied consistently. Complexity gating is used for progressive disclosure. Empty-state patterns use `HbcSmartEmptyState` for deferred or scaffold surfaces.

The console already demonstrates several safety-adjacent patterns:
- Confirmation dialogs for destructive provisioning actions.
- Permission-gated action visibility.
- Retry ceiling enforcement.
- Checkpoint approve/reject with comments.
- Risk-tiered actions in the Entra lane (routine/elevated/destructive).
- Audit-reason-required publish/revert in standards config.

These patterns are ad hoc per page. Phase 11 should systematize them into a reusable framework.

### Reusable admin package (`@hbc/features-admin`)

**Maturity: Beta — admin-intelligence domain, not the control plane.**

The package exports 129 symbols across monitors, probes, hooks, dashboards, approval authority, and adapter integrations. It is explicitly bounded as the admin-intelligence layer, not the privileged executor.

Wave 0 limitations remain:
- Alert and probe snapshot stores are in-memory only.
- Only 2 of 6 monitors are fully wired (`provisioning-failure`, `stuck-workflow`).
- Only 2 of 5 probes have live connections (`azure-functions`, `sharepoint-infrastructure`).
- Approval authority rules are not persisted.
- Teams webhook delivery is best-effort; email relay is console-logged.

These limitations are Phase 12 scope (admin intelligence completion), not Phase 11.

### UI kit (`@hbc/ui-kit`)

**Maturity: Production — extensive component library.**

The kit provides the building blocks Phase 11 needs: `HbcConfirmDialog`, `HbcTearsheet`, `HbcModal`, `HbcPanel`, `HbcStatusBadge`, `HbcBanner`, `HbcCoachingCallout`, `HbcErrorBoundary`, `HbcDataTable`, `HbcCommandBar`.

A `SafetyObservation` icon is defined in the icon library. Status color ramps (green/red/amber/info/gray) are available for risk-signal visualization.

**Gap:** No admin-specific safety wrapper components exist (e.g., risk-tier-aware confirmation, preview panel, destructive-action modal). Phase 11 should add these as reusable visual primitives in `@hbc/ui-kit`.

### Shared models (`@hbc/models`)

**Maturity: Production — strong type foundation, safety-specific gap.**

The admin control plane type surface includes:
- `AdminRiskLevel` (5 tiers: read-only, low, moderate, high, critical).
- `AdminExecutionMode` (4 modes: seamless, checkpointed, destructive, advisory).
- `AdminAuditEventType` (18 event types).
- `AdminEvidenceType` (8 evidence types).
- Full run lifecycle types (`IAdminRunEnvelope`, `IAdminRunLaunchRequest`, statuses, steps).
- Checkpoint types (`IAdminCheckpointDefinition`, `IAdminCheckpoint`, `IAdminCheckpointDecision`).
- Audit types (`IAdminAuditRecord`, `IAdminEvidenceReference`, `IAdminConfigSnapshotReference`).
- Preview types (`IAdminPreviewResponse`, `IAdminPreviewImpactItem`).
- Action metadata (`IAdminActionMetadata`).

**Gap:** No per-action safety profile type binding `actionKey` to its required risk level, execution mode, and mandatory safety controls. The enums exist but are not composed into a safety contract that can be enforced at runtime.

### Backend control plane

**Maturity: Production — strong auth and orchestration, safety enforcement is manual.**

The backend has:
- Mature auth middleware with role-based, scope-based, and ownership-based enforcement.
- Break-glass accountability telemetry.
- A provisioning saga with full retry, compensation, evidence, and failure classification.
- A service factory with adapter-mode validation.
- Durable audit and evidence stores.
- Preflight validation, install checkpoint, and install verification services.
- App binding, SharePoint drift/preview/repair/posture, config override/versioning/resolution services.

**Gap:** Safety enforcement is per-route and manual. There is no centralized safety policy engine that maps an action's risk tier to its required controls (preview, confirmation, evidence capture, post-validation). Each route independently calls `requireAdmin()` and `requireDelegatedScope()`, but there is no middleware layer that enforces "this action is `high` risk and requires preview + confirmation + evidence."

### Audit/evidence

**Maturity: Production — durable and extensible.**

The Phase 4 audit/evidence infrastructure is complete and healthy:
- `AdminAuditEvents` and `AdminEvidence` tables in Azure Table Storage.
- `IAdminAuditService` and `IAdminEvidenceService` interfaces with clear contracts.
- Evidence retention policies and inline/offload boundary.
- Config snapshot references (Phase 10).
- Actor context with UPN, OID, and display name.
- Rationale support for free-text justification and external references.

Phase 11 can attach safety evidence to this infrastructure without inventing a parallel store.

---

## 5. Natural first-adopter candidates

### Tier 1 — Strongest candidates (existing destructive actions with partial safety patterns)

1. **ProvisioningOversightPage** (`/runs`)
   - Already has: permission-gated retry/archive/escalation/force-state, confirmation dialogs, retry ceiling, complexity gating, runbook links.
   - Missing: risk-tier classification, preview/dry-run, structured impact summary, post-run validation, recovery guidance, durable safety evidence.
   - Adoption path: wrap existing actions in the Phase 11 safety framework; replace ad hoc confirmation with risk-tier-aware flow.

2. **EntraLanePage** (`/entra`)
   - Already has: risk-tiered actions (routine/elevated/destructive), checkpoint flows (none/preview/confirmation/double-confirmation), authority-aware operations, audit history.
   - Missing: standardized safety contract types, backend enforcement of risk gates, durable evidence capture.
   - Adoption path: formalize the existing risk-tier model into the Phase 11 framework; wire checkpoint flows to backend safety policy.

### Tier 2 — Strong candidates (audit-reason-required or checkpoint-based flows)

3. **StandardsConfigPage** (`/standards-config`)
   - Already has: audit-reason-required publish/revert, version history, diff preview.
   - Missing: risk-tier classification, formal impact summary, post-change validation.

4. **InstallRunDetailPage** (`/setup/run/$runId`)
   - Already has: checkpoint approve/reject with comments, step progress, post-install verification.
   - Missing: risk-tier classification of the install action itself, structured safety evidence.

5. **BindingStatusPage** (`/setup/bindings`)
   - Already has: repair with rationale, verification findings.
   - Missing: risk-tier classification, preview before repair.

### Tier 3 — Future candidates (pending backend API wiring)

6. **SharePointControlPage** (`/sharepoint`) — UI shell complete but backend integration pending; adopt after API wiring.

---

## 6. Dependency gaps / variances

### Gap 1 — No per-action safety profile type

`AdminRiskLevel` and `AdminExecutionMode` exist as enums but are not composed into a type that maps a specific `actionKey` to its risk level, execution mode, and required safety controls. Phase 11 must define this type in `@hbc/models`.

### Gap 2 — No centralized backend safety enforcement

Each admin API route independently calls `requireAdmin()` and `requireDelegatedScope()`. There is no middleware or policy engine that enforces "action X requires preview + confirmation + evidence capture because it is `high` risk." Phase 11 must add this enforcement layer in `backend/functions`.

### Gap 3 — No safety-specific UI primitives

`@hbc/ui-kit` provides generic building blocks (confirm dialog, modal, tearsheet, status badge) but no admin-safety-specific compositions (risk-tier-aware confirmation, preview panel, destructive-action warning, recovery guidance display). Phase 11 should add these as reusable primitives in `@hbc/ui-kit`.

### Gap 4 — No safety control catalog enum

There is no enum defining the universe of safety controls (preview, dry-run, confirmation, double-confirmation, evidence capture, post-validation, recovery guidance). Phase 11 should define this in `@hbc/models`.

### Gap 5 — Phase 10 config governance is code-defined first

The config override store, versioning service, and resolution service are scaffolded but not yet fully governing safety policy at runtime. Phase 11 should keep its safety policy registry code-defined with a documented seam for future governed live overrides, consistent with the Phase 11 summary plan's dependency-handling rule.

### Variance — Earlier plan assumption about SystemSettingsPage routing

The Phase 11 summary plan states that "some routes point back into `SystemSettingsPage` rather than dedicated mature safety workflows." This is no longer accurate. All lanes route to dedicated pages. `SystemSettingsPage` serves only `/config` for access control and approval authority. This variance is favorable — routing is already cleaner than the plan assumed.

---

## 7. What Phase 11 can implement now without broad backfill

1. **Safety contract types in `@hbc/models`:** Define `IAdminActionSafetyProfile`, safety control enum, preview/dry-run result shapes, impact summary shape, post-validation result shape, recovery guidance shape. The existing `AdminRiskLevel`, `AdminExecutionMode`, `AdminAuditEventType`, and `AdminEvidenceType` enums provide the foundation.

2. **Backend safety policy middleware in `backend/functions`:** A `requireSafetyGates()` middleware or policy-check function that maps action risk tier to required controls. Can compose with existing `requireAdmin()` and `requireDelegatedScope()` without replacing them.

3. **Safety UI primitives in `@hbc/ui-kit`:** Risk-tier-aware confirmation dialog, preview panel, destructive-action warning banner, impact summary card, recovery guidance display. These compose existing `HbcConfirmDialog`, `HbcModal`, `HbcBanner`, and `HbcStatusBadge` components.

4. **Admin-domain safety composition in `@hbc/features-admin`:** Domain-specific hooks and compositions that wire the safety contract to the admin intelligence layer (e.g., `useActionSafetyProfile()`, safety-aware action wrappers).

5. **First-adopter integration:** ProvisioningOversightPage and EntraLanePage already have the strongest partial safety patterns and can adopt the framework with minimal disruption.

6. **Safety evidence attached to existing audit infrastructure:** The Phase 4 audit/evidence stores are ready. Phase 11 evidence can use `IAdminEvidenceReference` and `IAdminAuditRecord` without a new store.

---

## 8. What Phase 11 must not try to solve in full

1. **Full admin-intelligence completion (Phase 12).** Do not backfill in-memory alert/probe stores to durable persistence, wire remaining stub monitors/probes, or complete the error log surface.

2. **Full config governance runtime (Phase 10 completion).** Keep the safety policy registry code-defined. Do not build a full live-override governance system for safety policies.

3. **SharePoint control lane API wiring.** The SharePointControlPage UI shell is complete but backend API integration is pending. Do not complete the SharePoint backend integration as part of Phase 11; adopt the safety framework there only after backend APIs are wired.

4. **Broad admin routing or IA redesign.** The current 8-lane structure with dedicated pages is healthy. Do not reorganize routing or information architecture beyond what first-adopter integration requires.

5. **Full generalized audit spine (Phase 4 completion).** The audit/evidence stores are sufficient. Do not build a parallel store or expand the audit schema beyond what safety evidence requires.

6. **Multi-admin approval workflows.** The end-state plan explicitly allows single-authorized-admin execution. Phase 11 compensates with strong safety controls, not multi-party approval.

7. **Production hardening (Phase 13).** Do not scope release readiness, runbooks, or expansion rails into Phase 11.

---

## 9. Recommended package placement for safety-model responsibilities

| Responsibility | Package | Rationale |
|---------------|---------|-----------|
| Safety contract types, risk-tier enum, safety control enum, action safety profile interface | `@hbc/models` | Shared types consumed by both frontend and backend |
| Safety policy registry (code-defined action → risk tier → required controls) | `backend/functions` | Backend owns enforcement; policy must not be bypassable from frontend |
| Safety enforcement middleware (`requireSafetyGates()`) | `backend/functions` | Composes with existing auth middleware; backend is the privileged executor |
| Preview/dry-run execution and result shaping | `backend/functions` | Backend owns the data and execution; frontend only displays results |
| Post-run validation execution | `backend/functions` | Backend validates against authoritative state |
| Recovery guidance generation | `backend/functions` | Backend has the context to recommend recovery actions |
| Durable safety evidence capture | `backend/functions` | Uses existing `IAdminEvidenceService` and `AdminAuditEvents` table |
| Reusable safety UI primitives (risk-aware confirm, preview panel, impact summary card, destructive warning, recovery display) | `@hbc/ui-kit` | Reusable visual components belong in the UI kit per architectural invariant |
| Admin-domain safety composition (hooks, action wrappers, domain-specific safety flows) | `@hbc/features-admin` | Admin-intelligence and admin-domain composition layer |
| App-level first-adopter integration (page-level safety framework adoption) | `apps/admin` | Page-level wiring of safety flows into existing operator surfaces |
