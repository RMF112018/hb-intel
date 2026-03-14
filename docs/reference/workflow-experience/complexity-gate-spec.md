> **Doc Classification:** Canonical Normative Plan — Complexity gate specification for project setup summary views, expandable history, and coaching prompts.

# Complexity Gate Specification — Project Setup

**Traceability:** W0-G3-T06 (`docs/architecture/plans/MVP/G3/W0-G3-T06-Summary-View-Expandable-History-and-Complexity-Rules.md`)
**Source of truth:** `packages/provisioning/src/summary-field-registry.ts`, `history-level-registry.ts`, `coaching-prompt-registry.ts`, `complexity-gate-helpers.ts`

---

## 1. Tier–Audience Mapping

| Tier | Target Audience | Default For |
|------|----------------|-------------|
| **Essential** | End users (PMs, coordinators) who need only core status and next action | All non-admin, non-power-user roles |
| **Standard** | Power users (estimators, senior PMs) who want workflow detail | Estimating leads, senior project managers |
| **Expert** | Admins and support staff who need operational/diagnostic data | IT admins, platform support |

---

## 2. Core Summary Field Registry

These fields appear in every project setup summary view. Surfaces must use the canonical `PROJECT_SETUP_SUMMARY_FIELDS` registry — they must not define their own field sets.

### Always Visible (No Tier Gate)

| Field ID | Label | Source | Source Path |
|----------|-------|--------|-------------|
| `projectName` | Project Name | request | `IProjectSetupRequest.projectName` |
| `department` | Department | request | `IProjectSetupRequest.department` |
| `statusLabel` | Current Status | request | `IProjectSetupRequest.state → PROJECT_SETUP_STATUS_LABELS` |
| `currentOwner` | Current Owner | bic | `IBicNextMoveState.currentOwner.displayName` |
| `expectedAction` | Expected Action | bic | `IBicNextMoveState.expectedAction` |
| `submittedAt` | Submitted | request | `IProjectSetupRequest.submittedAt` |
| `urgencyTier` | Urgency | bic | `IBicNextMoveState.urgencyTier` |
| `siteUrl` | Provisioned Site | request | `IProjectSetupRequest.siteUrl` *(visible when state=Completed)* |
| `bicBadge` | BIC Badge | bic | `IBicNextMoveState (compact: name + urgency dot)` |

### Standard Tier (`minTier: 'standard'`)

| Field ID | Label | Source | Source Path |
|----------|-------|--------|-------------|
| `bicDetail` | BIC Detail Chain | bic | `IBicNextMoveState (previous → current → next)` |
| `blockedReason` | Blocked Reason | bic | `IBicNextMoveState.blockedReason` |
| `teamMembers` | Team Members | request | `IProjectSetupRequest.groupMembers + projectLeadId` |
| `addOns` | Add-ons Selected | request | `IProjectSetupRequest.addOns` |
| `projectNumber` | Project Number | request | `IProjectSetupRequest.projectNumber` |
| `estimatedValue` | Estimated Value | request | `IProjectSetupRequest.estimatedValue` |
| `clarificationCount` | Clarifications | request | `IProjectSetupRequest.clarificationItems (open/responded count)` |
| `stepCount` | Provisioning Steps | provisioning | `IProvisioningStatus.steps (completed/total)` |

### Expert Tier (`minTier: 'expert'`)

| Field ID | Label | Source | Source Path |
|----------|-------|--------|-------------|
| `entraGroupIds` | Entra ID Groups | provisioning | `IProvisioningStatus.entraGroups` |
| `lastSagaStep` | Last Saga Step | provisioning | `ISagaStepResult (last completed)` |

---

## 3. Expandable History Levels

History is organized into three progressive levels. Level 0 is the core summary (fields above). Level 1 and 2 provide deeper timeline and operational data.

| Level | Label | Expansion Behavior |
|-------|-------|--------------------|
| **0** | Core Summary | Always expanded; not collapsible |
| **1** | Activity Timeline | Expandable; visible at all tiers |
| **2** | Operational Detail | Expandable; requires `minTier: 'standard'` |

### Level 1 — Activity Timeline

| Content ID | Label | Tier Gate | Source Path |
|------------|-------|-----------|-------------|
| `lifecycleTransitions` | Lifecycle State Transitions | *(none)* | `IProvisioningStatus.stateTransitionHistory` |
| `clarificationPairs` | Clarification Requests & Responses | *(none)* | `IRequestClarification[]` |
| `clarificationRaiser` | Who Raised Clarification | *(none)* | `IRequestClarification.raisedBy` |
| `handoffEvents` | Handoff Events | *(none)* | `IHandoffPackage.status + timestamps` |
| `notificationEvents` | Notification Events | `minTier: 'standard'` | notification-registrations (15 events) |
| `clarificationMessageText` | Full Clarification Message | `minTier: 'standard'` | `IRequestClarification.message` |

### Level 2 — Operational Detail

| Content ID | Label | Tier Gate | Source Path |
|------------|-------|-----------|-------------|
| `sagaStepResults` | Saga Step Results | `minTier: 'standard'` | `IProvisioningStatus.steps[]` |
| `level2ExpansionControl` | Operational Detail Expansion | `minTier: 'standard'` | *(UI control)* |
| `idempotentSkip` | Idempotent Skip Flag | `minTier: 'expert'` | `ISagaStepResult.idempotentSkip` |
| `rawErrorDetails` | Error Details | `minTier: 'expert'` | `ISagaStepResult.errorMessage` |
| `statusResourceVersion` | Status Resource Version | `minTier: 'expert'` | `IProvisioningStatus (version fields)` |
| `correlationIds` | Correlation IDs | `minTier: 'expert'` | `IProvisioningStatus.correlationId` |
| `throttleBackoff` | Throttle Backoff Records | `minTier: 'expert'` | `IProvisioningStatus (throttle fields)` |

---

## 4. Coaching Prompt Registry

Coaching prompts are shown only at Essential tier (`maxTier: 'essential'`). They disappear when the user elevates to Standard or Expert.

| Prompt ID | Context | Text |
|-----------|---------|------|
| `setup-step1-tip` | Setup form, Step 1 | Tip: Fill in as much information as you can — you can always update it later. |
| `setup-step2-department` | Setup form, Step 2 | The department you select determines which document libraries and templates are created for your project. |
| `setup-step3-lead` | Setup form, Step 3 | Your project lead will be added to the Project Leaders group and will have full control of the site. |
| `status-provisioning` | Status view, Provisioning state | Your site is being set up. This typically takes a few minutes. You'll receive an email when it's ready. |

---

## 5. Implementation Pattern

### Correct: Use `HbcComplexityGate`

```tsx
import { HbcComplexityGate } from '@hbc/complexity';
import { PROJECT_SETUP_SUMMARY_FIELDS } from '@hbc/provisioning';

// Gate a field by its tier
{PROJECT_SETUP_SUMMARY_FIELDS.map((field) => (
  <HbcComplexityGate key={field.fieldId} minTier={field.minTier} maxTier={field.maxTier}>
    <SummaryField descriptor={field} data={requestData} />
  </HbcComplexityGate>
))}
```

### Correct: Use pure helpers for non-React contexts

```typescript
import { getVisibleSummaryFields, PROJECT_SETUP_SUMMARY_FIELDS } from '@hbc/provisioning';

const visibleFields = getVisibleSummaryFields(PROJECT_SETUP_SUMMARY_FIELDS, currentTier);
```

### Incorrect: Role-based visibility checks

```tsx
// ANTI-PATTERN — do not do this
if (role === 'admin') {
  showEntraGroups();
}
```

### Incorrect: Per-surface field overrides

```tsx
// ANTI-PATTERN — do not do this
const estimatingFields = ['projectName', 'department', 'customField'];
```

---

## 6. Anti-Patterns

- **No `if (role === ...)`** — visibility is controlled by complexity tier, not role
- **No per-surface field overrides** — all surfaces use the same `PROJECT_SETUP_SUMMARY_FIELDS` registry
- **No duplicate field registries** — one registry in `@hbc/provisioning`, consumed everywhere
- **No hardcoded status labels** — use `PROJECT_SETUP_STATUS_LABELS` map

---

## 7. Cross-References

- [BIC Action Contract](./bic-action-contract.md) — canonical expected-action strings
- [Clarification Re-entry Spec](./clarification-reentry-spec.md) — clarification return flow
- [Setup Notification Registrations](./setup-notification-registrations.md) — 15 notification events
- [Draft Key Registry](./draft-key-registry.md) — auto-save and resume
- `packages/complexity/src/components/HbcComplexityGate.tsx` — gate component
- `packages/complexity/README.md` — complexity system overview
