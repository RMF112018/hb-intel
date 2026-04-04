# Phase 11 — First-Adopter Integration and Adoption Map

## 1. Purpose

This document records which admin actions have adopted the Phase 11 safety framework, how they were integrated, and which actions are deferred.

---

## 2. Route reconciliation

**Finding:** Routes are already clean. All lanes route to dedicated pages — no routes point back into `SystemSettingsPage` as a proxy. The Phase 11 summary plan's assumption that "some routes point back into SystemSettingsPage" was corrected in the P11-01 audit (favorable variance). No route reconciliation changes were needed.

---

## 3. Adopted actions

### Provisioning Oversight Page (`/runs`)

The ProvisioningOversightPage was the strongest first-adopter candidate (identified in P11-01). Three confirmation dialogs were replaced with safety-aware compositions from `@hbc/features-admin`.

#### Force Retry — `provisioning-rollout:saga:retry`

| Attribute | Value |
|-----------|-------|
| Risk tier | T2 Elevated (moderate) |
| Previous UX | `HbcConfirmDialog` with `variant="danger"` and inline text |
| Adopted UX | `ForceRetryConfirmation` with `HbcSafetyBanner`, `HbcScopeSummaryCard`, risk badge, structured warnings |
| Preview | Not required (retry re-executes from last failed step) |
| Dry-run | Not supported |
| Confirmation | Standard — safety banner with retry count, failure-class-specific warnings |
| Validation | Via existing saga evidence (retry count, failure class) |
| Evidence | Inherits from saga audit trail (P4) |
| Integration point | `apps/admin/src/pages/ProvisioningOversightPage.tsx` lines 511–530 |

**Safety improvements:**
- Risk badge visible in confirmation dialog
- Structured warnings surface per failure class (structural/permissions get non-idempotent-risk warning)
- Retry ceiling warning escalates to critical severity when approaching limit
- Execution scope card shows project number, name, and action description

#### Archive Failure — `provisioning-rollout:failure:archive`

| Attribute | Value |
|-----------|-------|
| Risk tier | T1 Routine (low) |
| Previous UX | `HbcConfirmDialog` with `variant="warning"` and inline text |
| Adopted UX | `ArchiveConfirmation` with `HbcRiskBadge`, project context |
| Preview | Not required |
| Dry-run | Not supported |
| Confirmation | None (low risk — standard button is sufficient) |
| Validation | Not required |
| Evidence | Audit record via existing API |
| Integration point | `apps/admin/src/pages/ProvisioningOversightPage.tsx` lines 532–544 |

**Safety improvements:**
- Risk badge shows "Routine" (green) — distinguishes this from higher-risk actions
- Project context displayed in dialog

#### Force State Transition — `provisioning-rollout:saga:force-state-transition`

| Attribute | Value |
|-----------|-------|
| Risk tier | T3 Destructive (high) |
| Previous UX | `HbcConfirmDialog` with `variant="danger"` and inline text |
| Adopted UX | `StateOverrideConfirmation` with `HbcSafetyBanner` (critical warnings), `HbcScopeSummaryCard`, typed acknowledgment, state transition display |
| Preview | Supported (not yet wired — future P11 adoption) |
| Dry-run | Not supported |
| Confirmation | Enhanced — typed "OVERRIDE" acknowledgment required |
| Validation | Via post-run validation (when validation provider is registered) |
| Evidence | Confirmation evidence via safety-confirmation-service |
| Integration point | `apps/admin/src/pages/ProvisioningOversightPage.tsx` lines 546–560 |

**Safety improvements:**
- Enhanced confirmation requires typing "OVERRIDE" — cannot be accidentally clicked
- Critical-severity warnings for state consistency risk and no-automatic-rollback
- Scope card shows current state → target state transition
- Non-dismissible safety banner (high risk)

---

## 4. Composition components created

`packages/features/admin/src/components/ProvisioningSafetyOverrides.tsx` contains three composition components that wrap ui-kit safety primitives for provisioning-domain use:

| Component | Risk tier | Confirmation type |
|-----------|-----------|-------------------|
| `ForceRetryConfirmation` | Elevated | Standard (safety banner + scope) |
| `ArchiveConfirmation` | Routine | Simple (risk badge + context) |
| `StateOverrideConfirmation` | Destructive | Enhanced (typed phrase + scope + warnings) |

These are exported from `@hbc/features-admin` for use by the admin app.

---

## 5. Deferred actions

### Hybrid Identity actions (EntraLanePage)

| Action | Risk tier | Reason deferred |
|--------|-----------|----------------|
| Create user (AD DS) | Destructive | EntraLanePage already has risk-tiered checkpoint flows. Full P11 adoption requires backend safety profile registration for identity actions (connection setup, test, rotate). Deferred to avoid a partial adoption that mixes old and new patterns on the same page. |
| Create user (cloud) | Elevated | Same — batch with full Entra safety adoption. |
| Delete user | Destructive | Same. |
| Disable user | Elevated | Same. |
| Update user | Elevated | Same. |
| Connection upsert/rotate | Elevated | Same. |

**Dependency:** Register domain-specific preview and validation providers for the Entra domain in the backend. The safety profile registrations (P11-04 catalog) are already in place; what's missing is the domain-specific provider implementations.

### SharePoint Control actions

| Action | Risk tier | Reason deferred |
|--------|-----------|----------------|
| Apply repair | Destructive | SharePointControlPage UI shell is complete but backend API integration is pending. Adopt after API wiring. |

**Dependency:** Backend SharePoint repair API integration.

### Standards / Config actions

| Action | Risk tier | Reason deferred |
|--------|-----------|----------------|
| Publish config override | Elevated | StandardsConfigPage already requires audit reason. Full P11 adoption would add preview and structured confirmation. Deferred to avoid disrupting a working governance surface without clear safety uplift. |
| Revert config override | Elevated | Same. |

### Setup / Install actions

| Action | Risk tier | Reason deferred |
|--------|-----------|----------------|
| Launch install | Elevated | InstallRunDetailPage already has checkpoint approve/reject with comments. The existing checkpoint model is healthy and doesn't need P11 retrofit. |
| Checkpoint approve/reject | Elevated/Routine | Same — existing model is already safety-conscious. |

### White-Glove Deployment actions

| Action | Risk tier | Reason deferred |
|--------|-----------|----------------|
| Launch package run | Elevated | Deferred until white-glove domain registers preview/validation providers. |
| Checkpoint approve/reject | Elevated/Routine | Same. |

---

## 6. Adoption coverage summary

| Domain | Actions adopted | Actions deferred | Coverage |
|--------|----------------|------------------|----------|
| Provisioning Rollout | 3 (retry, archive, force-state) | 0 | **Full** |
| Hybrid Identity | 0 | 8 | Deferred (batch adoption) |
| SharePoint Control | 0 | 1 | Deferred (API pending) |
| Standards / Config | 0 | 2 | Deferred (audit-reason is sufficient) |
| Setup / Install | 0 | 3 | Deferred (checkpoint model healthy) |
| App Binding | 0 | 2 | Deferred (batch with elevated actions) |
| White-Glove | 0 | 3 | Deferred (providers needed) |

---

## 7. Validation results

- `pnpm --filter @hbc/spfx-admin build` — clean (tsc + vite build success)
- `pnpm --filter @hbc/spfx-admin lint` — 0 new errors (61 pre-existing in EntraLanePage)
- `pnpm --filter @hbc/spfx-admin test` — 7 passed, 1 file with 17 pre-existing failures (router context issue)
- `pnpm --filter @hbc/features-admin check-types` — clean
- `pnpm --filter @hbc/features-admin test` — 13 files, 181 tests passed

---

## 8. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 repo-truth audit](./phase-11-repo-truth-and-dependency-audit.md) | First-adopter candidates identified |
| [Phase 11 risk-tier classification](./phase-11-risk-tier-and-action-classification.md) | Risk tiers for adopted actions |
| [Phase 11 operator safety UX](./phase-11-operator-safety-ux.md) | UI primitives composed by adopters |
| [Phase 11 backend safety enforcement](./phase-11-backend-safety-enforcement.md) | Safety profiles registered for actions |
| [Phase 11 destructive-action model](./phase-11-destructive-action-execution-model.md) | Enhanced confirmation pattern |
