# 02 — Wave 16 Runtime DTO Contract Skeleton

## Intent

This skeleton is not final code. It is the documentation-grade DTO target that the local agent should reconcile with current `packages/models/src/pcc/` repo truth and then convert into the smallest safe TypeScript model extension or bridge.

## Top-Level Read Model

```ts
export interface ControlCenterSettingsReadModel {
  readonly moduleIdentity: ControlCenterSettingsModuleIdentity;
  readonly summary: SettingsHomeSummary;
  readonly categories: readonly SettingsCategorySummary[];
  readonly settings: readonly EffectiveSettingRow[];
  readonly featureModuleFlags: SettingsFeatureModuleFlagsView;
  readonly externalSystemsConfiguration: SettingsExternalSystemsConfigurationView;
  readonly securitySecretReferences: SettingsSecuritySecretReferencesView;
  readonly roleVisibility: SettingsRoleVisibilityView;
  readonly validationHealth: SettingsValidationHealthView;
  readonly auditHistoryPreview: SettingsAuditHistoryView;
  readonly hbiPolicy: SettingsHbiPolicyView;
  readonly changeRequestPreview: SettingsChangeRequestPreview;
  readonly sourcePosture: SettingsSourcePosture;
}
```

## Required Submodels

```ts
export interface ControlCenterSettingsModuleIdentity {
  readonly moduleId: 'control-center-settings';
  readonly displayName: 'Control Center Settings';
  readonly surfaceId: 'control-center-settings';
  readonly readRoute: 'pcc/projects/{projectId}/settings';
  readonly writePosture: 'future-command-gated';
}

export interface SettingsHomeSummary {
  readonly totalSettings: number;
  readonly categoriesCount: number;
  readonly blockedCount: number;
  readonly warningCount: number;
  readonly missingRequiredCount: number;
  readonly pendingApprovalCount: number;
  readonly staleOverrideCount: number;
  readonly secretReferenceCount: number;
  readonly lastValidationAtUtc?: string;
  readonly overallPosture: 'healthy' | 'warning' | 'blocked' | 'degraded' | 'unknown';
}

export interface SettingsCategorySummary {
  readonly categoryId:
    | 'security'
    | 'integration'
    | 'workflow'
    | 'read-model'
    | 'ux'
    | 'operations'
    | 'feature-flags'
    | 'module-flags'
    | 'hbi-policy';
  readonly label: string;
  readonly description: string;
  readonly settingCount: number;
  readonly blockedCount: number;
  readonly warningCount: number;
  readonly pendingRequestCount: number;
  readonly owner: SettingsSourceOwner;
  readonly validationStatus: SettingValidationStatus;
}

export interface EffectiveSettingRow {
  readonly settingDefinitionId: string;
  readonly settingKey: string;
  readonly displayName: string;
  readonly category: SettingsCategorySummary['categoryId'];
  readonly valueType: SettingValueType;
  readonly effectiveValue: RedactedSettingValue;
  readonly effectiveSource: SettingEffectiveSource;
  readonly sourceOwner: SettingsSourceOwner;
  readonly storageOwner: SettingsStorageOwner;
  readonly editablePolicy: SettingEditablePolicy;
  readonly canView: boolean;
  readonly canEdit: boolean;
  readonly canRequestChange: boolean;
  readonly canRequestRecheck: boolean;
  readonly requiresApproval: boolean;
  readonly requiresAdminVerification: boolean;
  readonly disabledReason?: SettingDisabledReason;
  readonly validationStatus: SettingValidationStatus;
  readonly approvalStatus: SettingApprovalStatus;
  readonly lastUpdatedAtUtc?: string;
  readonly lastUpdatedByDisplayName?: string;
  readonly dependencies: readonly SettingDependencyRef[];
  readonly hbiEligibility: SettingHbiEligibility;
}
```

## Value, Redaction, and Status Vocabulary

```ts
export type SettingValueType =
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Json'
  | 'Url'
  | 'Guid'
  | 'SecretReference';

export type SettingRedactionClass =
  | 'None'
  | 'Internal'
  | 'Sensitive'
  | 'SecretReference'
  | 'NoAccess';

export interface RedactedSettingValue {
  readonly displayValue: string;
  readonly rawValueAvailable: false;
  readonly redactionClass: SettingRedactionClass;
  readonly secretReferenceName?: string;
  readonly secretStoreLabel?: string;
  readonly lastRotatedAtUtc?: string;
}

export type SettingEffectiveSource =
  | 'HardSecurityPolicy'
  | 'TenantGlobalPolicy'
  | 'HBCentralDefault'
  | 'EnvironmentPolicy'
  | 'ApprovedProjectOverride'
  | 'ApprovedModuleOverride'
  | 'RolePersonaFilter'
  | 'UserPreference'
  | 'SourceDerived';

export type SettingsSourceOwner =
  | 'HBCentral'
  | 'ProjectSite'
  | 'TeamAndAccess'
  | 'ExternalSystems'
  | 'SiteHealth'
  | 'AdminReview'
  | 'HBI'
  | 'Sage'
  | 'Procore'
  | 'Derived';

export type SettingsStorageOwner =
  | 'HBCentralPolicy'
  | 'ProjectEffective'
  | 'ProjectWorkflow'
  | 'SourceReference'
  | 'DerivedReadOnly';

export type SettingEditablePolicy =
  | 'ReadOnly'
  | 'AdminOnly'
  | 'WorkflowApproved'
  | 'RequestOnly'
  | 'UserPreferencePolicyGated';

export type SettingValidationStatus =
  | 'NotValidated'
  | 'Valid'
  | 'Warning'
  | 'Blocked'
  | 'Expired'
  | 'MissingRequired'
  | 'DriftDetected'
  | 'BackendUnavailable';

export type SettingApprovalStatus =
  | 'NotRequired'
  | 'Required'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Expired'
  | 'AdminVerificationRequired';
```

## Detail Drawer Model

```ts
export interface SettingDetailView {
  readonly row: EffectiveSettingRow;
  readonly ownership: SettingOwnershipDetail;
  readonly validation: SettingValidationResultDetail;
  readonly editPolicy: SettingEditPolicyDetail;
  readonly dependencies: readonly SettingDependencyRef[];
  readonly auditPreview: readonly SettingAuditEvent[];
  readonly hbiExplanation: SettingHbiExplanation;
  readonly allowedActions: readonly SettingActionAvailability[];
}
```

## Change Request Preview

```ts
export interface SettingsChangeRequestPreview {
  readonly canStartRequest: boolean;
  readonly disabledReason?: SettingDisabledReason;
  readonly draftBehavior: 'local-ui-only' | 'not-available' | 'future-command-gated';
  readonly futureCommandRoute: 'POST /api/pcc/projects/{projectId}/settings/change-requests';
  readonly requiredFields: readonly string[];
  readonly handoffTarget: 'wave-14-approvals-checkpoints';
}
```

## Mapping Requirement

The local agent must add a schema-to-model mapping table covering all nine Wave 16 setting-family lists:

- definitions;
- policy rules;
- values;
- overrides;
- change requests;
- validation results;
- audit events;
- dependency map;
- health snapshots.

Each SharePoint field must map to one DTO field, derived helper field, or explicit `not exposed in read model` rationale.
