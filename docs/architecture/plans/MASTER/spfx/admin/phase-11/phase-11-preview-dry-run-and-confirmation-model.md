# Phase 11 — Preview, Dry-Run, and Confirmation Model

## 1. Purpose

This document describes the shared TypeScript contracts added to `@hbc/models` for the Phase 11 safety framework. These contracts define how admin actions are classified, previewed, confirmed, validated, and recovered — and how safety evidence is summarized.

All contracts are placed in `@hbc/models` because they are consumed by both the frontend (operator console) and backend (privileged control plane).

---

## 2. Contracts added

### File: `packages/models/src/admin-control-plane/IAdminSafety.ts`

All Phase 11 safety contracts are in a single file, following the existing pattern of one file per concern area (e.g., `IAdminAudit.ts`, `IAdminCheckpoint.ts`).

---

## 3. Contract inventory

### Enum: `AdminSafetyControl`

Defines the universe of safety controls that can be required for an admin action. Each value represents a gate or evidence-capture step in the safety pipeline.

| Value | Description |
|-------|-------------|
| `Preview` | Backend-generated preview of what will change |
| `DryRun` | Simulated execution without committing |
| `StandardConfirmation` | Confirmation dialog with scope summary |
| `EnhancedConfirmation` | Confirmation with risk warning and typed acknowledgment |
| `ScopeRestriction` | Action must declare and enforce intended scope |
| `PostRunValidation` | Post-execution validation of outcome |
| `RecoveryGuidance` | Context-aware recovery steps on failure |
| `AuditRecord` | Durable audit record |
| `InputEvidence` | Command input snapshot evidence |
| `PreviewEvidence` | Preview/dry-run result evidence |
| `ExecutionEvidence` | Execution result evidence |
| `ValidationEvidence` | Post-run validation summary evidence |

### Type: `AdminConfirmationType`

Union type: `'none' | 'standard' | 'enhanced'`. Declares the confirmation ceremony level for an action.

### Interface: `IAdminSafetyProfile`

The core safety contract. Maps an action to its safety envelope:
- `actionKey`, `domain`, `riskLevel`, `executionMode` — identity and classification
- `requiredControls` — array of `AdminSafetyControl` values the backend enforces
- `supportsPreview`, `supportsDryRun` — capability flags
- `confirmationType` — required confirmation ceremony
- `scopeDescription` — human-readable scope

This is the unit of safety enforcement. The backend registers a profile per action. The frontend reads it to present the correct UX. The backend rejects requests that skip required controls.

### Interface: `IAdminExecutionScope`

Declares the intended scope of an action execution:
- `domain`, `targetEntityId`, `targetEntityLabel` — what the action targets
- `affectedResourceCount` — how many resources are affected
- `scopeDescription` — human-readable scope

Used in preview results and confirmation payloads to prove scope was declared and reviewed.

### Interface: `IAdminSafetyWarning`

Structured warning with `severity` (`info` | `warning` | `critical`), `code`, `message`, and optional `resource`. Used in preview results and execution results.

### Interface: `IAdminSafetyPreviewResult`

Safety-aware preview/dry-run result:
- `actionKey`, `dryRun` — what was previewed and whether it was a dry-run
- `scope` — execution scope
- `riskLevel` — action risk tier
- `impactItems` — array of `IAdminSafetyImpactItem` (what would change)
- `warnings` — structured safety warnings
- `advisoryNotes` — non-blocking notes
- `proceedRecommended` — backend's recommendation
- `previewedAt` — timestamp
- `evidenceId` — link to captured evidence

### Interface: `IAdminSafetyImpactItem`

Enhanced impact item with `reversible` flag and per-item `itemRiskLevel`. Extends the concept from the existing `IAdminPreviewImpactItem` with safety-specific context.

### Interface: `IAdminConfirmationPayload`

Records the operator's explicit confirmation:
- `actionKey`, `confirmationType` — what was confirmed and how
- `operatorAcknowledgment` — the text the operator typed or confirmed
- `previewEvidenceId` — links to the preview they reviewed
- `rationale` — operator-provided reason (reuses existing `IAdminRationale`)
- `confirmedAt`, `confirmedBy` ��� timestamp and actor

Captured as evidence to prove the operator acknowledged scope and risk.

### Interface: `IAdminRecoveryGuidance`

Backend-generated recovery steps after failure:
- `runId`, `actionKey`, `failureClass` — what failed and how
- `steps` — ordered `IAdminRecoveryStep` array
- `estimatedComplexity` — `simple` | `moderate` | `complex` | `requires-support`
- `compensationAvailable` — whether automatic rollback is possible
- `externalActions` — actions outside the system

### Interface: `IAdminRecoveryStep`

A single recovery step with `order`, `label`, `description`, `actionType` (`automatic` | `manual` | `external`), and optional `actionKey` for system-triggered steps.

### Interface: `IAdminSafetyEvidenceSummary`

Single-view summary of safety evidence for a run:
- `controlsSatisfied` / `controlsSkipped` — which controls were met
- Boolean flags: `previewCaptured`, `confirmationCaptured`, `validationCaptured`, `recoveryCaptured`
- `evidenceRefs` — all evidence artifacts for the run

---

## 4. Why these contracts belong in `@hbc/models`

These contracts are **shared data shapes** consumed by both:
- the **frontend** (to render preview results, confirmation dialogs, recovery guidance, evidence summaries), and
- the **backend** (to enforce safety profiles, generate preview results, capture evidence, produce recovery guidance).

They contain no runtime logic, no UI components, and no backend enforcement logic. They are pure TypeScript types and enums, consistent with the existing `@hbc/models` pattern.

---

## 5. How the model supports the safety pipeline

```text
┌─────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
│ IAdminSafety-   │──>│ IAdminSafetyPreview-  │──>│ IAdminConfirmation-  │
│ Profile         │   │ Result                │   │ Payload              │
│ (classify)      │   │ (preview/dry-run)     │   │ (confirm)            │
└─────────────────┘   └────────────────���──────┘   └───────────���──────────┘
                                                            │
                                                            v
┌─────────────────┐   ┌───────────────────────┐   ┌──────────────────────┐
│ IAdminRecovery- │<──│ IAdminSafetyEvidence- │<──│ Execution            │
│ Guidance        │   │ Summary               │   │ (existing run model) │
│ (recover)       │   │ (evidence)            │   │                      │
└───��─────────────┘   └──────���───────────────��┘   └───────────────��──────┘
```

1. **Classify:** `IAdminSafetyProfile` maps the action to required controls.
2. **Preview:** `IAdminSafetyPreviewResult` shows impact, scope, warnings.
3. **Confirm:** `IAdminConfirmationPayload` records operator acknowledgment.
4. **Execute:** Uses existing `IAdminRunEnvelope` and step model.
5. **Validate:** Uses existing `IAdminPostRunValidationSummary` (from `IAdminAudit.ts`).
6. **Recover:** `IAdminRecoveryGuidance` provides structured recovery steps.
7. **Evidence:** `IAdminSafetyEvidenceSummary` ties it all together.

---

## 6. Relationship to existing contracts

| Existing contract | Relationship |
|-------------------|-------------|
| `AdminRiskLevel` | Reused directly — no duplicate risk enum |
| `AdminExecutionMode` | Reused directly — no duplicate mode enum |
| `IAdminActionDescriptor` | Safety profile extends the action descriptor concept with required controls |
| `IAdminPreviewResponse` / `IAdminPreviewImpactItem` | Safety preview extends these with scope, warnings, reversibility, and evidence linkage |
| `IAdminPostRunValidationSummary` | Reused as-is for post-run validation — no duplicate |
| `IAdminRationale` | Reused in confirmation payload |
| `IAdminActorContext` | Reused in confirmation payload |
| `IAdminEvidenceReference` | Reused in evidence summary |
| `AdminEvidenceType` | Existing enum already covers safety evidence types |

---

## 7. Governing cross-references

| Document | Role |
|----------|------|
| [Phase 11 safety baseline](./phase-11-safety-baseline.md) | Safety doctrine and ownership boundary |
| [Phase 11 risk-tier and action classification](./phase-11-risk-tier-and-action-classification.md) | Per-tier control requirements that these contracts enforce |
| [Phase 11 repo-truth and dependency audit](./phase-11-repo-truth-and-dependency-audit.md) | Confirmed repo state |

---

## 8. Validation

- `pnpm --filter @hbc/models check-types` — clean (0 errors)
- `pnpm --filter @hbc/models lint` — 0 errors (34 pre-existing warnings, none from new code)
