import {
  isSafetyAdapterFetchError,
  isSafetyBackendCommandError,
  isSafetyConfigurationError,
} from '@hbc/features-safety';

export interface SupportDetails {
  readonly requestId?: string;
  readonly frontendRequestId?: string;
  readonly backendRequestId?: string;
  readonly failureClass?: string;
  readonly previewFailureClass?: string;
  readonly route?: string;
  readonly status?: number;
  readonly attempts?: number;
}

export interface TruthfulMessage {
  readonly headline: string;
  readonly detail: string;
  readonly support: SupportDetails;
}

export type ReadFailureScope = 'reporting-periods' | 'project-weeks';

export type SafetyFailureClass =
  | 'config'
  | 'auth'
  | 'network-cors'
  | 'route-not-found'
  | 'validation-contract'
  | 'template-incompatibility'
  | 'parser-authority-violation'
  | 'reporting-period-mismatch'
  | 'project-unresolved'
  | 'duplicate-supersession-risk'
  | 'commit-failed'
  | 'replay-failed'
  | 'read-side-list'
  | 'unknown';

function isNetworkLikeBackendError(error: { readonly httpStatus: number; readonly errorKind: string }): boolean {
  return error.errorKind === 'timeout' || error.errorKind === 'transient' || error.httpStatus === 0;
}

function classifyBackendCommandFailure(
  error: {
    readonly endpoint: string;
    readonly httpStatus: number;
    readonly errorKind: string;
    readonly code?: string;
    readonly failureClass?: string;
    readonly previewFailureClass?: string;
  },
  operation: 'upload' | 'replay',
): SafetyFailureClass {
  const endpoint = error.endpoint.toLowerCase();
  const failure = (error.previewFailureClass ?? error.failureClass ?? '').toLowerCase();
  const code = (error.code ?? '').toLowerCase();
  if (error.errorKind === 'auth' || error.httpStatus === 401 || error.httpStatus === 403) return 'auth';
  if (isNetworkLikeBackendError(error)) return 'network-cors';
  if (error.httpStatus === 404) return 'route-not-found';
  if (error.errorKind === 'contract' || error.httpStatus === 400 || error.httpStatus === 422) {
    if (failure.includes('template') || code.includes('template')) return 'template-incompatibility';
    if (failure.includes('parser-authority') || code.includes('parser_authority')) {
      return 'parser-authority-violation';
    }
    if (failure.includes('reporting-period') || code.includes('reporting_period')) {
      return 'reporting-period-mismatch';
    }
    if (failure.includes('project-unresolved') || code.includes('project_unresolved')) {
      return 'project-unresolved';
    }
    if (failure.includes('duplicate') || failure.includes('supersession') || code.includes('duplicate')) {
      return 'duplicate-supersession-risk';
    }
    return 'validation-contract';
  }
  if (failure.includes('template') || code.includes('template')) return 'template-incompatibility';
  if (failure.includes('parser-authority') || code.includes('parser_authority')) {
    return 'parser-authority-violation';
  }
  if (failure.includes('reporting-period') || code.includes('reporting_period')) {
    return 'reporting-period-mismatch';
  }
  if (failure.includes('project-unresolved') || code.includes('project_unresolved')) {
    return 'project-unresolved';
  }
  if (failure.includes('duplicate') || failure.includes('supersession') || code.includes('duplicate')) {
    return 'duplicate-supersession-risk';
  }
  return operation === 'replay'
    ? 'replay-failed'
    : endpoint.includes('/replay')
      ? 'replay-failed'
      : 'commit-failed';
}

function supportDetailsForBackendError(error: {
  readonly requestId?: string;
  readonly frontendRequestId?: string;
  readonly backendRequestId?: string;
  readonly failureClass?: string;
  readonly previewFailureClass?: string;
  readonly endpoint: string;
  readonly httpStatus: number;
  readonly attempts: number;
}): SupportDetails {
  return {
    requestId: error.requestId,
    frontendRequestId: error.frontendRequestId,
    backendRequestId: error.backendRequestId,
    failureClass: error.failureClass,
    previewFailureClass: error.previewFailureClass,
    route: error.endpoint,
    status: error.httpStatus,
    attempts: error.attempts,
  };
}

export function classifyUploadFailure(error: unknown): SafetyFailureClass {
  if (isSafetyConfigurationError(error)) return 'config';
  if (isSafetyAdapterFetchError(error)) return 'read-side-list';
  if (isSafetyBackendCommandError(error)) {
    return classifyBackendCommandFailure(error, 'upload');
  }
  return 'unknown';
}

export function classifyReplayFailure(error: unknown): SafetyFailureClass {
  if (isSafetyConfigurationError(error)) return 'config';
  if (isSafetyAdapterFetchError(error)) return 'read-side-list';
  if (isSafetyBackendCommandError(error)) {
    return classifyBackendCommandFailure(error, 'replay');
  }
  return 'unknown';
}

export function uploadFailureMessage(error: unknown): TruthfulMessage {
  const seam = classifyUploadFailure(error);
  if (isSafetyBackendCommandError(error)) {
    const support = supportDetailsForBackendError(error);
    if (seam === 'auth') return {
      headline: 'Backend authentication failed.',
      detail: 'Safety could not authenticate this command against the backend API. Verify sign-in and delegated scope.',
      support,
    };
    if (seam === 'network-cors') return {
      headline: 'Network or CORS failure reached the backend seam.',
      detail: 'Safety could not complete the backend request due to transport/CORS failure. Retry after connectivity and API CORS checks.',
      support,
    };
    if (seam === 'route-not-found') return {
      headline: 'Safety backend route was not found.',
      detail: 'The configured upload endpoint is missing or mis-routed. Confirm backend route deployment and runtime binding.',
      support,
    };
    if (seam === 'validation-contract') return {
      headline: 'Validation contract blocked this upload context.',
      detail: 'The backend rejected required intake metadata or payload shape. Correct the highlighted context and retry preview.',
      support,
    };
    if (seam === 'template-incompatibility') return {
      headline: 'Template is incompatible with the governed parser contract.',
      detail: 'Upload requires a compatible checklist template/contract marker combination before commit can proceed.',
      support,
    };
    if (seam === 'parser-authority-violation') return {
      headline: 'Parser authority rules blocked commit readiness.',
      detail: 'Parser-authoritative values or marker requirements were violated. Fix workbook authority fields before retry.',
      support,
    };
    if (seam === 'reporting-period-mismatch') return {
      headline: 'Reporting period mismatch blocked this submission.',
      detail: 'The inspection date or period contract does not match the selected reporting period.',
      support,
    };
    if (seam === 'project-unresolved') return {
      headline: 'Project resolution failed for this intake context.',
      detail: 'The backend could not resolve the project safely. Correct project metadata or pick a resolvable project.',
      support,
    };
    if (seam === 'duplicate-supersession-risk') return {
      headline: 'Duplicate or supersession risk requires review flow.',
      detail: 'Backend duplicate checks blocked direct commit. Use review/replay flow with intentional supersede decision.',
      support,
    };
    if (seam === 'commit-failed') return {
      headline: 'Commit command failed before terminal write completion.',
      detail: 'Preview may have passed, but commit failed in a downstream backend seam. Retry after addressing support details.',
      support,
    };
    if (seam === 'replay-failed') return {
      headline: 'Replay command failed in backend execution.',
      detail: 'Replay did not reach a successful terminal transition. Inspect support details and retry with intent.',
      support,
    };
  }
  if (seam === 'config') {
    return {
      headline: 'Safety configuration is incomplete.',
      detail: 'List or backend bootstrap bindings are missing for this hosted runtime.',
      support: {},
    };
  }
  if (seam === 'read-side-list') {
    return {
      headline: 'Read-side list seam failed.',
      detail: 'Safety could not read required SharePoint list state needed for this operation.',
      support: {},
    };
  }
  return {
    headline: 'Upload flow failed at an unknown seam.',
    detail: error instanceof Error ? error.message : 'Unexpected failure.',
    support: {},
  };
}

export function replayFailureMessage(error: unknown): TruthfulMessage {
  const seam = classifyReplayFailure(error);
  if (isSafetyBackendCommandError(error)) {
    const support = supportDetailsForBackendError(error);
    if (seam === 'auth') return {
      headline: 'Replay authentication failed.',
      detail: 'Safety could not authenticate replay against the backend API.',
      support,
    };
    if (seam === 'network-cors') return {
      headline: 'Replay failed due to network or CORS transport issues.',
      detail: 'The replay command could not reliably reach backend runtime. Retry after connectivity and CORS validation.',
      support,
    };
    if (seam === 'route-not-found') return {
      headline: 'Replay route was not found.',
      detail: 'The backend replay endpoint is unavailable in this runtime deployment.',
      support,
    };
    return {
      headline: 'Replay command failed.',
      detail: 'Replay failed in the backend command seam before a successful terminal transition.',
      support,
    };
  }
  if (seam === 'config') {
    return {
      headline: 'Replay configuration is incomplete.',
      detail: 'Hosted Safety bindings are incomplete for replay.',
      support: {},
    };
  }
  if (seam === 'read-side-list') {
    return {
      headline: 'Replay list read failed.',
      detail: 'Safety could not read required list state while evaluating replay context.',
      support: {},
    };
  }
  return {
    headline: 'Replay failed at an unknown seam.',
    detail: error instanceof Error ? error.message : 'Unexpected failure.',
    support: {},
  };
}

export function supportDetailLines(details: SupportDetails): ReadonlyArray<string> {
  return [
    details.requestId ? `requestId: ${details.requestId}` : null,
    details.frontendRequestId ? `frontendRequestId: ${details.frontendRequestId}` : null,
    details.backendRequestId ? `backendRequestId: ${details.backendRequestId}` : null,
    details.failureClass ? `failureClass: ${details.failureClass}` : null,
    details.previewFailureClass ? `previewFailureClass: ${details.previewFailureClass}` : null,
    details.route ? `route: ${details.route}` : null,
    details.status !== undefined ? `status: ${details.status}` : null,
    details.attempts !== undefined ? `attempts: ${details.attempts}` : null,
  ].filter(Boolean) as ReadonlyArray<string>;
}

export function readFailureMessage(error: unknown, scope: ReadFailureScope): TruthfulMessage {
  const seam = classifyUploadFailure(error);
  const subject = scope === 'reporting-periods' ? 'reporting periods' : 'project-week records';
  if (isSafetyBackendCommandError(error)) {
    const support = supportDetailsForBackendError(error);
    if (seam === 'auth') {
      return {
        headline: `Authentication failed while loading ${subject}.`,
        detail: 'Safety could not authenticate read-side backend access for this view.',
        support,
      };
    }
    if (seam === 'network-cors') {
      return {
        headline: `Network/CORS failure while loading ${subject}.`,
        detail: 'The read request failed in transport before completing route execution.',
        support,
      };
    }
    if (seam === 'route-not-found') {
      return {
        headline: `Read route was not found for ${subject}.`,
        detail: 'The configured backend route is unavailable in this deployment.',
        support,
      };
    }
    return {
      headline: `Loading ${subject} failed at backend command seam.`,
      detail: 'Retry after reviewing support details and runtime configuration.',
      support,
    };
  }
  if (isSafetyConfigurationError(error)) {
    return {
      headline: 'Safety configuration is incomplete.',
      detail: `Required bindings for ${subject} are missing in this hosted runtime.`,
      support: {},
    };
  }
  if (isSafetyAdapterFetchError(error)) {
    return {
      headline: `Read-side list access failed for ${subject}.`,
      detail: 'Safety could not read required SharePoint list data for this view.',
      support: {},
    };
  }
  return {
    headline: `Loading ${subject} failed.`,
    detail: error instanceof Error ? error.message : 'Unexpected read-side error.',
    support: {},
  };
}
