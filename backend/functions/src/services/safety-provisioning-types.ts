import type {
  IngestionRunResult,
  SafetyIngestionPreviewResult,
  UploadContext,
} from '../../../../packages/features/safety/src/domain/types.js';
import type { SafetyProvisionContainerKind } from '../config/safety-record-keeping-list-definitions.js';
import type {
  IGraphFailureContext,
  SafetyIngestionFailureClass,
} from './safety-ingestion-failure-classifier.js';

/**
 * Shared Safety provisioning / ingestion result types.
 *
 * Extracted from the previous god-service so the Safety provisioning service,
 * the Safety ingestion application service, and the `SharePointService` facade
 * all refer to one authoritative type set.
 */

export type SafetyProvisionOutcome =
  | 'created'
  | 'alreadyExisted'
  | 'updatedOrRepaired'
  | 'failed'
  | 'skipped';

export interface ISafetyProvisionDiagnostic {
  code: string;
  message: string;
  /**
   * Discriminating failure-class label for Safety ingestion diagnostics.
   * Optional for back-compat (provisioning diagnostics omit it); ingest/
   * preview/replay catch sites attach it so operators can triage identity
   * vs permission vs binding vs transport without parsing message text.
   */
  failureClass?: SafetyIngestionFailureClass;
  /**
   * Non-secret Graph-call context surfaced when the diagnostic was produced
   * by a Graph failure. Tokens and raw headers are never included; the
   * `pathSummary` is trimmed and strips OData query strings.
   */
  graphContext?: IGraphFailureContext;
}

export interface ISafetyFieldProvisionResult {
  internalName: string;
  outcome: SafetyProvisionOutcome;
  message?: string;
}

export interface ISafetyContainerProvisionResult {
  key: string;
  title: string;
  kind: SafetyProvisionContainerKind;
  siteUrl: string;
  outcome: SafetyProvisionOutcome;
  fields: ISafetyFieldProvisionResult[];
  message?: string;
}

export interface ISafetyReferenceListValidationResult {
  title: string;
  outcome: SafetyProvisionOutcome;
  exists: boolean;
  message?: string;
}

export interface ISafetyRecordKeepingProvisionResult {
  dryRun: boolean;
  success: boolean;
  siteTargets: {
    safetySiteUrl: string;
    hbCentralSiteUrl: string;
  };
  counts: {
    created: number;
    alreadyExisted: number;
    updatedOrRepaired: number;
    failed: number;
    skipped: number;
  };
  referenceLists: ISafetyReferenceListValidationResult[];
  containers: ISafetyContainerProvisionResult[];
  diagnostics: ISafetyProvisionDiagnostic[];
}

export type SafetyReportingPeriodSeedOutcome =
  | 'created'
  | 'alreadyExisted'
  | 'duplicateDetected'
  | 'failed';

export interface ISafetyReportingPeriodSeedResult {
  success: boolean;
  outcome: SafetyReportingPeriodSeedOutcome;
  matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20';
  targetSiteUrl: string;
  targetListTitle: 'Safety Reporting Periods';
  duplicateCount: number;
  createdItemId?: number;
  item: {
    Title: string;
    WeekStartDate: string;
    WeekEndDate: string;
    PeriodLabel: string;
    Status: 'open';
  };
  diagnostics: ISafetyProvisionDiagnostic[];
}

export interface ISafetyIngestionRequest {
  fileName: string;
  fileContentBase64: string;
  context: UploadContext;
}

export interface ISafetyReplayRequest {
  parentRunId: string;
  supersedePrior?: boolean;
}

export type SafetyReportingPeriodProbeCauseBucket =
  | 'identity/grant'
  | 'site-binding'
  | 'list-binding'
  | 'item-contract'
  | 'item-missing'
  | 'unknown';

export interface ISafetyReportingPeriodProbeResult {
  success: boolean;
  requestId?: string;
  codePath: 'graph-only';
  identityLane: 'managed-identity-app-only';
  requestedId: string;
  requestedSpItemId?: number;
  parsedItemId?: number;
  siteUrl: string;
  siteId?: string;
  listId: string;
  graphOperation: 'get-item';
  graphPathSummary: string;
  status: 'ok' | 'not-found' | 'error' | 'invalid-contract';
  causeBucket: SafetyReportingPeriodProbeCauseBucket;
  statusCode?: number;
  graphErrorCode?: string;
  failureClass?: string;
  period?: {
    id: string;
    spItemId: number;
    title: string;
    weekStartDate: string;
    weekEndDate: string;
    periodLabel: string;
    status: string;
  };
  diagnosticCode?: string;
  diagnosticMessage?: string;
}

export interface ISafetyIngestionOperationResult {
  success: boolean;
  requestAccepted: boolean;
  requestId?: string;
  result?: IngestionRunResult;
  preview?: SafetyIngestionPreviewResult;
  previewPassed?: boolean;
  diagnostics: ISafetyProvisionDiagnostic[];
}

export interface ISafetyIngestionPreviewOperationResult {
  success: boolean;
  requestAccepted: boolean;
  requestId?: string;
  preview?: SafetyIngestionPreviewResult;
  diagnostics: ISafetyProvisionDiagnostic[];
}
