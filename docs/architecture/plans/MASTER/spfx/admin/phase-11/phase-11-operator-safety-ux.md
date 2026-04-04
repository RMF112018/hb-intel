# Phase 11 — Operator Safety UX Primitives and Flow Patterns

## 1. Purpose

This document describes the reusable safety UX primitives added to `@hbc/ui-kit` and the admin-domain workflow compositions added to `@hbc/features-admin` in Phase 11 Prompt-06. These components provide the operator-facing layer of the safety model, making risky actions feel deliberate, bounded, understandable, and reviewable.

---

## 2. UI-Kit Primitives (`@hbc/ui-kit`)

Six reusable visual primitives follow existing ui-kit conventions: Griffel `makeStyles`, HBC theme tokens, `data-hbc-ui` attributes, ARIA roles, light/field mode support.

### HbcRiskBadge

Risk-tier indicator badge with dual-channel signaling (color + icon).

| Prop | Type | Description |
|------|------|-------------|
| `riskLevel` | `RiskLevel` | `'read-only' \| 'low' \| 'moderate' \| 'high' \| 'critical'` |
| `label?` | `string` | Override — defaults to operational name (e.g., "Destructive") |
| `size?` | `'small' \| 'medium'` | Badge size (default: medium) |
| `className?` | `string` | CSS override |

### HbcSafetyBanner

Risk-aware action warning banner with structured warning list.

| Prop | Type | Description |
|------|------|-------------|
| `riskLevel` | `RiskLevel` | Determines banner severity styling |
| `title` | `string` | Banner title |
| `children?` | `ReactNode` | Additional content |
| `warnings?` | `SafetyWarningItem[]` | Structured warnings with severity/code/message |
| `onDismiss?` | `() => void` | Dismiss callback — disabled for high/critical |
| `className?` | `string` | CSS override |

Non-dismissible for high/critical risk. Uses `role="alert"` and `aria-live="assertive"` for high/critical.

### HbcImpactSummaryList

Preview impact items display with change-type icons and reversibility indicators.

| Prop | Type | Description |
|------|------|-------------|
| `items` | `ImpactItem[]` | Impact items from a safety preview |
| `className?` | `string` | CSS override |

Each item shows: change-type icon (+/~/−/·), resource name, description, per-item risk badge, and "Irreversible" flag when applicable.

### HbcScopeSummaryCard

Execution scope display card.

| Prop | Type | Description |
|------|------|-------------|
| `scope` | `ExecutionScope` | Domain, target, affected count, description |
| `riskLevel` | `RiskLevel` | Action risk level |
| `className?` | `string` | CSS override |

### HbcRecoveryGuidancePanel

Recovery steps display with action-type indicators and complexity estimation.

| Prop | Type | Description |
|------|------|-------------|
| `guidance` | `RecoveryGuidance` | Ordered steps, complexity, compensation, external actions |
| `onTriggerAction?` | `(actionKey: string) => void` | Trigger an automatic recovery action |
| `className?` | `string` | CSS override |

### HbcEvidenceSummaryBar

Compact evidence capture status bar.

| Prop | Type | Description |
|------|------|-------------|
| `summary` | `EvidenceSummary` | Controls satisfied/skipped, capture flags, ref count |
| `className?` | `string` | CSS override |

---

## 3. Features-Admin Compositions (`@hbc/features-admin`)

Five admin-domain workflow compositions that orchestrate ui-kit primitives with domain logic.

### SafetyPreviewPanel

Composes `HbcSafetyBanner`, `HbcScopeSummaryCard`, `HbcImpactSummaryList` to display a full preview/dry-run result with proceed/cancel actions. Proceed button is disabled when `!proceedRecommended`.

### SafetyConfirmationDialog

Risk-tier-aware confirmation using `HbcModal`, `HbcRiskBadge`, `HbcScopeSummaryCard`, `HbcBanner`, `HbcButton`. Standard confirmation shows scope + confirm. Enhanced confirmation adds typed acknowledgment phrase matching.

### SafetyActionSummaryCard

Action overview showing action key, domain, risk badge, execution mode badge, required controls, and scope description.

### PostRunValidationPanel

Post-run validation results with per-check pass/fail status badges and accept/reject outcome actions.

### SafetyWorkflowOrchestrator

Multi-step safety flow wrapper: Preview → Confirm → Execute → Validate → Recover. Manages step transitions internally or via controlled `currentStep` prop. Renders the appropriate composition per step.

---

## 4. Package boundary compliance

| Concern | Package | Rationale |
|---------|---------|-----------|
| Reusable visual primitives | `@hbc/ui-kit` | Per architectural invariant — reusable UI belongs in ui-kit |
| Admin-domain workflow composition | `@hbc/features-admin` | Domain-specific composition layer, not reusable across apps |
| App-level page integration | `apps/admin` (future) | P11-09 first-adopter integration |
| Safety contract types | `@hbc/models` | Already placed in P11-03 |

---

## 5. Validation results

- `pnpm --filter @hbc/models build` — clean
- `pnpm --filter @hbc/ui-kit check-types` — clean
- `pnpm --filter @hbc/ui-kit lint` — 0 new errors (1 pre-existing in HbcInput)
- `pnpm --filter @hbc/ui-kit test` — 561 passed, 16 failed (all pre-existing in HbcBanner, HbcHeader, HbcKpiCard)
- `pnpm --filter @hbc/features-admin check-types` — clean
- `pnpm --filter @hbc/features-admin test` — 13 files, 181 tests passed

---

## 6. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 shared contracts](./phase-11-preview-dry-run-and-confirmation-model.md) | Types consumed by components |
| [Phase 11 preview pipeline](./phase-11-preview-pipeline.md) | Backend pipeline that generates preview results |
| [Phase 11 safety baseline](./phase-11-safety-baseline.md) | Frontend ownership boundary |
| [Phase 11 risk-tier classification](./phase-11-risk-tier-and-action-classification.md) | Risk tiers mapped by HbcRiskBadge |
