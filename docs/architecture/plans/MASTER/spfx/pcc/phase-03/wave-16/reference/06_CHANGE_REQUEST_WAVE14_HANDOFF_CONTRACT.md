# 06 — Change Request and Wave 14 Handoff Contract

## Change Request Lifecycle

| Status | Meaning | Runtime Posture |
| --- | --- | --- |
| `NotStarted` | No request exists. | Table/detail may show Request button if allowed. |
| `DraftLocalOnly` | User has opened local UX state; not persisted. | Allowed for UI only; no backend write. |
| `ValidationPending` | Future command validation not complete. | Display only / future-gated. |
| `ReadyForApproval` | Request has enough data to hand off. | Future-gated. |
| `SubmittedToApprovals` | Request linked to Wave 14 approval/checkpoint. | Display link/status only in Wave 16. |
| `ApprovalPending` | Wave 14 approval is pending. | Disable duplicate requests. |
| `ApprovedPendingVerification` | Approval passed; admin verification required. | Future-gated. |
| `ApprovedEffective` | Change became effective. | Display audit lineage. |
| `Rejected` | Approval rejected. | Display reason if authorized. |
| `Cancelled` | Request cancelled. | Display closed state. |
| `Expired` | Request/approval expired. | Generate stale/expired signal. |
| `BlockedByPolicy` | Policy blocks change. | Disable submit and explain reason. |

## Future Command Payload — Documentation Only

```ts
interface FutureCreateSettingChangeRequestCommand {
  readonly projectId: string;
  readonly settingKey: string;
  readonly requestedByPersona: PccPersona;
  readonly proposedValueDisplay: string;
  readonly proposedValueJson?: unknown;
  readonly isSecretReference: boolean;
  readonly secretReferenceName?: string;
  readonly justification: string;
  readonly requestedEffectiveStartUtc?: string;
  readonly requestedEffectiveEndUtc?: string;
  readonly validationSnapshotId?: string;
  readonly dependencyAcknowledgements: readonly string[];
  readonly hbiExplanationAccepted?: boolean;
}
```

## Wave 14 Handoff Payload

```ts
interface Wave14SettingApprovalHandoff {
  readonly handoffType: 'control-center-setting-change';
  readonly projectId: string;
  readonly sourceModuleId: 'control-center-settings';
  readonly sourceSurfaceId: 'control-center-settings';
  readonly settingKey: string;
  readonly settingDisplayName: string;
  readonly settingCategory: string;
  readonly requestId: string;
  readonly requestedByPersona: PccPersona;
  readonly requestedByDisplayName?: string;
  readonly proposedValueSummary: string;
  readonly redactionClass: SettingRedactionClass;
  readonly requiresApproval: boolean;
  readonly requiresAdminVerification: boolean;
  readonly policyRuleIds: readonly string[];
  readonly validationResultIds: readonly string[];
  readonly dependencyIds: readonly string[];
  readonly sourceLineageRefs: readonly SourceLineageRef[];
  readonly dedupeKey: string;
  readonly routeRecommendation: 'standard' | 'security' | 'integration' | 'admin-verification' | 'executive';
}
```

## Approval Routing Rules

| Setting Category | Default Route | Notes |
| --- | --- | --- |
| Security | IT/PCC Admin + admin verification | Secret values never included. |
| Integration | IT/Admin + External Systems owner | Source-system mutation not authorized. |
| Workflow | PCC Admin / Manager Operational Excellence | May require Wave 14 checkpoint. |
| ReadModel | IT/PCC Admin | Backend posture only. |
| UX | PM/PX request with PCC Admin approval when global | User preference may be policy-gated. |
| Operations | PM/PX/MOE route | Site Health may be source of validation. |
| Feature Flags | IT/PCC Admin | No direct SPFx flag mutation. |
| Module Flags | IT/PCC Admin / PM/PX request | Module visibility affects Project Home. |
| HBI Policy | HBI governance / IT/PCC Admin | HBI cannot approve its own behavior. |

## Dedupe Key Format

```text
settings::{projectId}::{settingKey}::{requestedEffectiveStartUtc || "now"}::{normalizedProposedValueHash}
```

## UI Rules

- During Wave 16 initial implementation, `Submit`, `Save Draft`, `Validate`, and `Request Recheck` are disabled or local-only unless a future command gate explicitly authorizes backend commands.
- Approval Handoff Panel displays route, policy, blockers, and future-gated status.
- No automatic approval, rejection, waiver, override, deferment, cancellation, supersession, manual-close, or external execution is authorized.
