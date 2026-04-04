# White-Glove Domain Model Reference

> Canonical domain model for white-glove employee device deployment.

**Package:** `@hbc/models` | **Module:** `admin-control-plane`
**Consumers:** `backend/functions/` (orchestrator, adapters, persistence), `packages/features/admin/` (hooks, types), `apps/admin/` (UX display)

## Model hierarchy

```
IWhiteGlovePackageTemplate
  └─ IWhiteGloveDeviceSlot[]

IWhiteGlovePackageRun (parent)
  ├─ IAdminRunEnvelope (generalized run envelope)
  ├─ IWhiteGloveConnectorSnapshot
  ├─ IWhiteGloveReadinessSnapshot
  └─ IWhiteGloveDeviceRun[] (children)
       ├─ IAdminRunEnvelope
       ├─ IWhiteGloveCheckpointInstance[]
       ├─ IWhiteGloveEvidenceItem[]
       └─ IWhiteGloveFailureSummary | null
```

## Package families

Six locked employee device package templates. Not collapsible into a generic workflow.

| Family | Enum value | Devices |
|--------|-----------|---------|
| VDC Personnel | `vdc-personnel` | iPhone, iPad, Alienware desktop |
| Estimating Personnel | `estimating-personnel` | iPhone, Alienware laptop |
| Office Personnel | `office-personnel` | HP or Dell laptop |
| Operations Management | `operations-management` | HP or Dell laptop, iPhone |
| Operations Management (alt) | `operations-management-alt` | MacBook Pro, iPhone |
| Operations Field Staff | `operations-field-staff` | iPhone, iPad, HP or Dell laptop |

Source: `WhiteGlovePackageFamily` enum and `WHITE_GLOVE_PACKAGE_CATALOG` constant in `IWhiteGloveTemplates.ts`.

## Device platforms

| Platform | Enum value | Enrollment authority | Adapter family |
|----------|-----------|---------------------|----------------|
| Windows desktop | `windows-desktop` | Microsoft Autopilot | Microsoft |
| Windows laptop | `windows-laptop` | Microsoft Autopilot | Microsoft |
| macOS laptop | `macos-laptop` | Apple ADE | Apple |
| iPhone | `iphone` | Apple ADE | Apple |
| iPad | `ipad` | Apple ADE | Apple |

Source: `WhiteGloveDevicePlatform` and `WhiteGloveEnrollmentAuthority` enums in `IWhiteGloveTemplates.ts`.

## Template governance

| Attribute | Governance | Notes |
|-----------|-----------|-------|
| `packageFamily` | Code-defined | Enum value, not editable |
| `deviceSlots[].platform` | Code-defined | Structural, defines package shape |
| `deviceSlots[].enrollmentAuthority` | Code-defined | Determined by platform |
| `deviceSlots[].allowedManufacturers` | Governed override | IT may restrict or add manufacturers |
| `deviceSlots[].label` | Governed override | IT may customize display label |
| `deviceSlots[].requiresNinjaOneStandardization` | Governed override | IT may toggle per slot |
| `version` | Derived at runtime | Auto-incremented on publish |
| `source` | Derived at runtime | Computed from merge state |
| `effectiveAt` | Derived at runtime | Set at publish time |

Source: `WhiteGloveTemplateAttributeGovernance` enum in `IWhiteGloveTemplates.ts`.

## Package run statuses

| Status | Description | Transitions to |
|--------|------------|----------------|
| `Pending` | Created, not started | ReadinessCheck |
| `ReadinessCheck` | Preflight validation | AwaitingLaunchConfirmation, Failed |
| `AwaitingLaunchConfirmation` | Operator must confirm | Running, Cancelled |
| `Running` | Device runs active | AwaitingCheckpoint, Completed, PartiallyCompleted, Failed, Cancelled |
| `AwaitingCheckpoint` | Paused at checkpoint | Running, Cancelled |
| `Completed` | All devices succeeded | (terminal) |
| `PartiallyCompleted` | Some succeeded, some failed | Running (retry) |
| `Failed` | Package failed | Running (retry) |
| `Cancelled` | Operator cancelled | (terminal) |

Source: `WhiteGlovePackageRunStatus` enum in `IWhiteGlove.ts`.

## Device run statuses

| Status | Description | Transitions to |
|--------|------------|----------------|
| `Pending` | Created, not started | Enrolling |
| `Enrolling` | Enrollment in progress | AwaitingCheckpoint, Standardizing, Failed |
| `AwaitingCheckpoint` | Paused at checkpoint | Enrolling, Standardizing, Validating, Cancelled |
| `Standardizing` | NinjaOne post-enrollment | Validating, Failed, AwaitingCheckpoint |
| `Validating` | Post-standardization validation | Completed, Failed |
| `Completed` | Device completed | (terminal) |
| `Failed` | Device failed | RecoveryRequired |
| `RecoveryRequired` | Recovery needed | Enrolling (retry), Cancelled |
| `Cancelled` | Cancelled | (terminal) |

Source: `WhiteGloveDeviceRunStatus` enum in `IWhiteGlove.ts`.

## Checkpoint taxonomy

| Type | Enum value | Generalized category | Description |
|------|-----------|---------------------|-------------|
| Connector readiness | `connector-readiness` | PreExecutionApproval | Connectors validated before launch |
| Technician prep | `technician-prep` | ExternalEventWait | Technician must prepare device |
| Enrollment blocked | `enrollment-blocked` | ExternalEventWait | External platform blocking enrollment |
| Package confirmation | `package-confirmation` | MidExecutionReview | Operator confirms before proceeding |
| Downstream standardization | `downstream-standardization` | PostExecutionValidation | NinjaOne standardization awaiting |
| Recovery required | `recovery-required` | DestructiveConfirmation | Failure requires recovery action |

Source: `WhiteGloveCheckpointType` enum and `WHITE_GLOVE_CHECKPOINT_CATEGORY_MAP` in `IWhiteGlove.ts`.

## Evidence taxonomy

| Type | Enum value | Sources | Description |
|------|-----------|---------|-------------|
| Enrollment | `enrollment` | Microsoft, Apple | Enrollment receipts, registration confirmations |
| Assignment | `assignment` | Microsoft, Apple | Profile assignment, group membership |
| Software bundle | `software-bundle` | NinjaOne | Bundle deployment receipts |
| Validation | `validation` | All adapters | Post-action validation check results |
| Operator action | `operator-action` | Control plane | Checkpoint decisions, manual interventions |

Source: `WhiteGloveEvidenceType` enum in `IWhiteGlove.ts`.

## Failure classification

| Class | Enum value | Retry eligible | Description |
|-------|-----------|---------------|-------------|
| Connector failure | `connector-failure` | Yes | Connector unreachable or auth failure |
| Enrollment failure | `enrollment-failure` | Conditional | Platform enrollment rejected or timed out |
| Profile assignment failure | `profile-assignment-failure` | Conditional | Autopilot/ADE profile assignment failed |
| Standardization failure | `standardization-failure` | Yes | NinjaOne bundle or script failed |
| Validation failure | `validation-failure` | Yes | Post-action validation check failed |
| Operator cancellation | `operator-cancellation` | No | Operator explicitly cancelled |
| Transient | `transient` | Yes | Retryable transient error |
| Permission denied | `permission-denied` | No | Insufficient permissions on external system |

Source: `WhiteGloveFailureClass` enum in `IWhiteGlove.ts`.

## Action keys

| Key | Value | Risk | Mode |
|-----|-------|------|------|
| Launch package | `white-glove-deployment:package:launch` | High | Checkpointed |
| Cancel package | `white-glove-deployment:package:cancel` | Moderate | Seamless |
| Retry package | `white-glove-deployment:package:retry` | High | Checkpointed |
| Preflight only | `white-glove-deployment:package:preflight-only` | ReadOnly | Advisory |
| Retry device | `white-glove-deployment:device:retry` | High | Checkpointed |
| Repair device | `white-glove-deployment:device:repair` | High | Checkpointed |

Source: `WHITE_GLOVE_ACTION_KEYS` constant in `IWhiteGlove.ts`.

## Composition with generalized model

White-glove types use composition with the generalized admin control plane:

- `IWhiteGlovePackageRun.run` → `IAdminRunEnvelope`
- `IWhiteGloveDeviceRun.run` → `IAdminRunEnvelope`
- `IWhiteGloveCheckpointInstance.status` → `AdminCheckpointStatus`
- `IWhiteGloveCheckpointInstance.decision` → `IAdminCheckpointDecision`
- `IWhiteGloveCheckpointInstance.category` → `AdminCheckpointCategory`

The `AdminDomain.WhiteGloveDeployment` value makes white-glove action keys valid `AdminActionKey` instances.

## Cross-references

- [Architecture baseline](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md)
- [Domain model architecture](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-domain-model-architecture.md)
- [Boundary matrix](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-boundary-matrix.md)
- [Generalized run model](../../architecture/plans/MASTER/spfx/admin/phase-02/admin-control-plane-run-model.md)
- [Generalized checkpoint model](../../architecture/plans/MASTER/spfx/admin/phase-02/admin-control-plane-checkpoint-and-execution-modes.md)
