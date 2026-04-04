# Phase 11 — Backend Safety Enforcement

## 1. Purpose

This document describes the backend safety policy registry and enforcement rails added in Phase 11 Prompt-04. These components ensure that risky admin actions cannot bypass required safety controls, whether through UI shortcuts, direct API calls, or automation scripts.

---

## 2. Architecture

### Files added

| File | Purpose |
|------|---------|
| `backend/functions/src/services/admin-control-plane/safety-policy-registry.ts` | Safety profile registry, gate evaluation, HTTP enforcement helpers |
| `backend/functions/src/services/admin-control-plane/safety-action-catalog.ts` | Code-defined action → safety profile mappings for all 7 admin domains |
| `backend/functions/src/services/admin-control-plane/__tests__/safety-policy-registry.test.ts` | 40 tests covering registry, defaults, builder, gate evaluation, HTTP enforcement, catalog |

### Barrel exports

All public functions and types are re-exported from `backend/functions/src/services/admin-control-plane/index.ts`.

---

## 3. Safety policy registry

The registry is a `Map<AdminActionKey, IAdminSafetyProfile>` that stores code-defined safety profiles. It provides:

| Function | Purpose |
|----------|---------|
| `registerSafetyProfile(profile)` | Register a profile for an action |
| `getSafetyProfile(actionKey)` | Look up a profile (returns `null` if not found) |
| `listSafetyProfiles()` | List all registered profiles |
| `clearSafetyRegistry()` | Clear the registry (testing only) |
| `resolveSafetyProfile(actionKey)` | Resolve a profile with seam for Phase 10 governed overrides |

### Default control sets

The registry provides default control sets per risk level:

| Risk level | Default controls |
|-----------|------------------|
| Read-only | (none) |
| Low | AuditRecord, ExecutionEvidence |
| Moderate | Preview, StandardConfirmation, AuditRecord, InputEvidence, PreviewEvidence, ExecutionEvidence |
| High | Preview, EnhancedConfirmation, ScopeRestriction, PostRunValidation, RecoveryGuidance, AuditRecord, InputEvidence, PreviewEvidence, ExecutionEvidence, ValidationEvidence |
| Critical | All of High + DryRun |

### Profile builder

`buildSafetyProfile(actionKey, domain, riskLevel, overrides?)` creates a profile with defaults derived from the risk level. Callers can override individual fields. This avoids repetitive boilerplate in the action catalog.

---

## 4. Enforcement evaluation

### Gate context

Route handlers provide an `ISafetyGateContext` that proves which safety steps were completed:

```typescript
interface ISafetyGateContext {
  previewCompleted?: boolean;
  previewEvidenceId?: string;
  dryRunCompleted?: boolean;
  confirmationCaptured?: boolean;
  scopeDeclared?: boolean;
}
```

### Evaluation

`evaluateSafetyGates(profile, context)` checks each required control against the context and returns:

```typescript
interface ISafetyGateResult {
  passed: boolean;
  violations: readonly string[];
  profile: IAdminSafetyProfile;
}
```

Key behaviors:
- Dry-run is only enforced when `supportsDryRun` is true (actions that technically can't dry-run are not penalized).
- Read-only actions with empty control sets always pass.
- Missing preview evidence ID is a separate violation from missing preview completion.
- Scope restriction is enforced for destructive and tenant-sensitive actions.

### HTTP enforcement helpers

| Function | Purpose |
|----------|---------|
| `requireSafetyGates(actionKey, context, requestId?)` | Returns 422 if gates fail, `null` if pass. Returns `null` for unregistered actions (forward-compatible). |
| `requireSafetyProfile(actionKey, requestId?)` | Returns `[400, null]` if no profile exists, `[null, profile]` if found. |

Usage pattern in route handlers:

```typescript
const [denied, profile] = requireSafetyProfile(actionKey, requestId);
if (denied) return denied;

const gateDenied = requireSafetyGates(actionKey, {
  previewCompleted: true,
  previewEvidenceId: 'ev-123',
  confirmationCaptured: true,
  scopeDeclared: true,
}, requestId);
if (gateDenied) return gateDenied;
```

### Query helpers

| Function | Purpose |
|----------|---------|
| `getRequiredEvidenceControls(profile)` | Returns only evidence-related controls |
| `isControlRequired(profile, control)` | Check if a specific control is required |
| `isPostRunValidationRequired(profile)` | Check if post-run validation is needed |
| `isRecoveryGuidanceRequired(profile)` | Check if recovery guidance must be generated |

---

## 5. Action catalog

`registerDefaultSafetyProfiles()` populates the registry with profiles for all currently implemented admin actions across 7 domains:

| Domain | Actions registered | Risk levels |
|--------|-------------------|-------------|
| Provisioning Rollout | 5 (launch, retry, archive, acknowledge, force-state-transition) | Low–High |
| Setup / Install | 3 (launch, checkpoint approve/reject) | Low–Moderate |
| App Binding | 2 (publish, repair) | Moderate |
| Hybrid Identity (Entra) | 8 (create AD DS/cloud, update, enable, disable, delete, connection upsert/rotate) | Low–High |
| White-Glove Deployment | 3 (launch, checkpoint approve/reject) | Low–Moderate |
| Standards / Config | 2 (publish, revert) | Moderate |
| SharePoint Control | 1 (apply-repair) | High |

Total: 24 action profiles registered.

---

## 6. Design decisions

### Why code-defined (not live-configurable)

The Phase 10 config governance system is scaffolded but does not yet govern safety policy at runtime. Per the Phase 11 summary plan's dependency-handling rule, safety policy is code-defined with a documented seam (`resolveSafetyProfile`) for future governed overrides.

### Why not middleware

The safety gate enforcement is implemented as service-layer helpers (`requireSafetyGates`, `requireSafetyProfile`) rather than HTTP middleware. This follows the existing backend pattern where `requireAdmin()` and `requireDelegatedScope()` are also service-layer helpers called by route handlers, not middleware injected into the pipeline. This gives handlers explicit control over when safety gates are checked relative to other validation.

### Why forward-compatible for unregistered actions

`requireSafetyGates` returns `null` (pass) for actions with no registered profile. This allows existing routes to continue operating during the adoption rollout. The `requireSafetyProfile` helper is available for routes that want to strictly require a profile.

---

## 7. Validation results

- `pnpm --filter @hbc/models build` — clean
- `pnpm --filter @hbc/functions check-types` — clean (0 errors)
- `pnpm --filter @hbc/functions test` — 93 test files, 1763 tests passed, 3 skipped (pre-existing)
- New test file: 40 tests all passing

---

## 8. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 safety baseline](./phase-11-safety-baseline.md) | Safety doctrine and backend enforcement mandate |
| [Phase 11 risk-tier and action classification](./phase-11-risk-tier-and-action-classification.md) | Risk tier definitions and per-tier control matrix |
| [Phase 11 shared contracts](./phase-11-preview-dry-run-and-confirmation-model.md) | `AdminSafetyControl`, `IAdminSafetyProfile`, and related types |
| [Phase 11 repo-truth audit](./phase-11-repo-truth-and-dependency-audit.md) | Confirmed backend patterns used as foundation |
