export type CanonicalPnpActionKey =
  | 'sharepoint-control:extraction:site-template'
  | 'sharepoint-control:extraction:list-schema'
  | 'sharepoint-control:extraction:page-layout'
  | 'sharepoint-control:extraction:site-inventory'
  | 'sharepoint-control:extraction:library-folder-tree'
  | 'sharepoint-control:extraction:site-groups-summary'
  | 'sharepoint-control:extraction:page-webpart-inventory'
  | 'sharepoint-control:provisioning:priority-actions-band-lists'
  | 'sharepoint-control:extraction:homepage-quick-links'
  | 'sharepoint-control:provisioning:priority-actions-band-seed-items'
  | 'sharepoint-control:provisioning:priority-actions-band-provision-and-seed'
  | 'sharepoint-control:provisioning:flagship-action-layer-cutover'
  | 'sharepoint-control:proof:homepage-action-layer'
  | 'sharepoint-control:provisioning:flagship-homepage-wrapper-cutover'
  | 'sharepoint-control:proof:homepage-wrapper-embedded';

export type PnpExecutionIntentMode =
  | 'read-only-export'
  | 'sharepoint-provision'
  | 'sharepoint-seed'
  | 'sharepoint-provision-and-seed';

export interface PnpExecutionIntent {
  readonly mode?: PnpExecutionIntentMode | string;
  readonly source?: string;
  readonly requestedAt?: string;
}

export interface PnpCommandInput {
  readonly targetSiteUrl?: string;
  readonly listFilters?: readonly string[];
  readonly pageFilters?: readonly string[];
  readonly executionIntent?: PnpExecutionIntent;
}

export interface RunLaunchRequest {
  readonly actionKey: string;
  readonly targetEntityId?: string;
  readonly commandInput?: PnpCommandInput;
  readonly dryRun?: boolean;
}

export interface PreflightRequest {
  readonly actionKey: string;
  readonly targetEntityId?: string;
  readonly commandInput?: PnpCommandInput;
}

export interface PreflightCheck {
  readonly checkId: string;
  readonly label: string;
  readonly passed: boolean;
  readonly message: string;
  readonly blocking: boolean;
}

export interface PreflightResult {
  readonly ready: boolean;
  readonly checks: readonly PreflightCheck[];
}

export interface StepResult {
  readonly stepNumber: number;
  readonly stepLabel: string;
  readonly status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  readonly errorMessage: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export interface RunRecord {
  readonly runId: string;
  readonly actionKey: CanonicalPnpActionKey;
  readonly status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  readonly totalSteps: number;
  readonly currentStep: number | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly steps: readonly StepResult[];
}

export interface EvidenceRef {
  readonly evidenceId: string;
  readonly label: string;
  readonly note?: string;
  readonly fileName: string;
  readonly contentType: string | null;
  readonly sizeBytes: number | null;
  readonly isBundle: boolean;
  readonly bundleFormat: 'zip' | null;
  readonly availability: 'available' | 'unavailable';
  readonly downloadUrl: string | null;
}

export interface RunEvidence {
  readonly runId: string;
  readonly evidenceRefs: readonly EvidenceRef[];
  readonly total: number;
}

export type ActionRiskLevel = 'read-only' | 'low-impact';
export type ActionExecutionMode = 'advisory' | 'apply';

export interface ActionDescriptor {
  readonly actionKey: CanonicalPnpActionKey;
  readonly label: string;
  readonly description: string;
  readonly riskLevel: ActionRiskLevel;
  readonly executionMode: ActionExecutionMode;
  readonly supportsPreview: boolean;
  readonly available: boolean;
  readonly unavailableReason: string | null;
  readonly requiredInput: 'site-only' | 'site-and-list-filter' | 'site-and-page-filter';
  readonly expectedArtifacts: readonly string[];
  readonly allowedExecutionIntents: readonly PnpExecutionIntentMode[];
}

export interface RunnerConfig {
  readonly host: string;
  readonly port: number;
  readonly profile: 'local-runner' | 'remote-runner';
  readonly certPath: string;
  readonly keyPath: string;
  readonly allowedOrigins: readonly string[];
  readonly storageDir: string;
  readonly authMode: 'DeviceLogin' | 'Interactive';
  readonly clientId: string;
  readonly tenant: string;
  readonly allowNonLoopback: boolean;
  readonly authRequired: boolean;
  readonly apiKey: string | null;
}

export interface ActionResultFileSet {
  readonly rawPath: string;
  readonly normalizedPath: string;
  readonly summaryPath: string;
  readonly provisionSummaryPath: string;
  readonly seedSummaryPath: string;
}
