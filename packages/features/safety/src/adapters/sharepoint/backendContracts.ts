import type {
  IngestionUploadContext,
  IngestionRunResult,
  SafetyIngestionPreviewResult,
} from '../../domain/types.js';

export interface SafetyBackendIngestionRequest {
  readonly fileName: string;
  readonly fileContentBase64: string;
  readonly context: IngestionUploadContext;
}

export interface SafetyBackendReplayRequest {
  readonly parentRunId: string;
  readonly supersedePrior?: boolean;
}

export interface SafetyBackendCommandOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly requestId?: string;
}

export interface SafetyBackendCommandResult<TData> {
  readonly data: TData;
  readonly requestId?: string;
  readonly frontendRequestId: string;
  readonly attempts: number;
}

export interface SafetyBackendDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly failureClass?: string;
  readonly graphContext?: Record<string, unknown>;
}

export interface SafetyBackendOperationResult {
  readonly success: boolean;
  readonly requestAccepted: boolean;
  readonly requestId?: string;
  readonly result?: IngestionRunResult;
  readonly preview?: SafetyIngestionPreviewResult;
  readonly previewPassed?: boolean;
  readonly diagnostics: ReadonlyArray<SafetyBackendDiagnostic>;
}

export interface SafetyBackendPreviewOperationResult {
  readonly success: boolean;
  readonly requestAccepted: boolean;
  readonly requestId?: string;
  readonly preview?: SafetyIngestionPreviewResult;
  readonly diagnostics: ReadonlyArray<SafetyBackendDiagnostic>;
}

export interface SafetyBackendSuccessEnvelope<TData> {
  readonly data: TData;
}

export interface SafetyBackendErrorEnvelope {
  readonly message?: string;
  readonly code?: string;
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;
}

export interface SafetyBackendFailureEnvelope {
  readonly message: string;
  readonly code: string;
  readonly requestId?: string;
  readonly failureClass?: string;
  readonly previewFailureClass?: string;
  readonly graphContext?: Record<string, unknown>;
  readonly data: SafetyBackendOperationResult | SafetyBackendPreviewOperationResult;
}

export type SafetyBackendCommandErrorKind =
  | 'aborted'
  | 'timeout'
  | 'transient'
  | 'non-transient'
  | 'auth'
  | 'contract';
