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
  readonly timestamp?: string;
}

export interface TruthfulMessage {
  readonly headline: string;
  readonly detail: string;
  readonly support: SupportDetails;
  readonly failureClass: SafetyFailureClass;
  readonly suggestedAction: string;
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

function supportDetailsForBackendError(
  error: {
    readonly requestId?: string;
    readonly frontendRequestId?: string;
    readonly backendRequestId?: string;
    readonly failureClass?: string;
    readonly previewFailureClass?: string;
    readonly endpoint: string;
    readonly httpStatus: number;
    readonly attempts: number;
  },
  at?: Date,
): SupportDetails {
  return {
    requestId: error.requestId,
    frontendRequestId: error.frontendRequestId,
    backendRequestId: error.backendRequestId,
    failureClass: error.failureClass,
    previewFailureClass: error.previewFailureClass,
    route: error.endpoint,
    status: error.httpStatus,
    attempts: error.attempts,
    timestamp: at ? at.toISOString() : undefined,
  };
}

const SUGGESTED_ACTION_BY_CLASS: Readonly<Record<SafetyFailureClass, string>> = {
  config:
    'Ask an administrator to complete Safety hosted-runtime bindings before retrying.',
  auth:
    'Sign in again with a Safety-authorized account; if access should already be granted, contact an administrator.',
  'network-cors':
    'Check your connection and retry; contact IT if the failure persists.',
  'route-not-found':
    'Wait for the current deploy to finish, then retry. If routes are missing after deploy, contact operations.',
  'validation-contract':
    'Correct the highlighted intake fields and re-run preview before retrying commit.',
  'template-incompatibility':
    'Re-issue the checklist against the current v1 Safety Checklist template.',
  'parser-authority-violation':
    'Fix the workbook authority fields (parser-meta / named ranges) so the parser can read them authoritatively.',
  'reporting-period-mismatch':
    'Select a reporting period that includes the inspection date, or correct the workbook period.',
  'project-unresolved':
    'Pick a resolvable project or correct the workbook project cell so it matches an active or legacy project.',
  'duplicate-supersession-risk':
    'Use the Review queue supersede flow to make an intentional governed replacement.',
  'commit-failed':
    'Retry commit; if the failure repeats, send the copied support payload to operations.',
  'replay-failed':
    'Retry replay; if the failure repeats, send the copied support payload to operations.',
  'read-side-list':
    'Retry; if the failure repeats, confirm SharePoint list availability with an administrator.',
  unknown:
    'Send the copied support payload to operations so they can classify the failure.',
};

export function suggestedActionForClass(cls: SafetyFailureClass): string {
  return SUGGESTED_ACTION_BY_CLASS[cls] ?? SUGGESTED_ACTION_BY_CLASS.unknown;
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

export function uploadFailureMessage(error: unknown, at?: Date): TruthfulMessage {
  const seam = classifyUploadFailure(error);
  const suggestedAction = suggestedActionForClass(seam);
  if (isSafetyBackendCommandError(error)) {
    const support = supportDetailsForBackendError(error, at);
    const base = { support, failureClass: seam, suggestedAction };
    if (seam === 'auth') return {
      headline: 'Backend authentication failed.',
      detail: 'Safety could not authenticate this command against the backend API. Verify sign-in and delegated scope.',
      ...base,
    };
    if (seam === 'network-cors') return {
      headline: 'Network or CORS failure reached the backend seam.',
      detail: 'Safety could not complete the backend request due to transport/CORS failure. Retry after connectivity and API CORS checks.',
      ...base,
    };
    if (seam === 'route-not-found') return {
      headline: 'Safety backend route was not found.',
      detail: 'The configured upload endpoint is missing or mis-routed. Confirm backend route deployment and runtime binding.',
      ...base,
    };
    if (seam === 'validation-contract') return {
      headline: 'Validation contract blocked this upload context.',
      detail: 'The backend rejected required intake metadata or payload shape. Correct the highlighted context and retry preview.',
      ...base,
    };
    if (seam === 'template-incompatibility') return {
      headline: 'Template is incompatible with the governed parser contract.',
      detail: 'Upload requires a compatible checklist template/contract marker combination before commit can proceed.',
      ...base,
    };
    if (seam === 'parser-authority-violation') return {
      headline: 'Parser authority rules blocked commit readiness.',
      detail: 'Parser-authoritative values or marker requirements were violated. Fix workbook authority fields before retry.',
      ...base,
    };
    if (seam === 'reporting-period-mismatch') return {
      headline: 'Reporting period mismatch blocked this submission.',
      detail: 'The inspection date or period contract does not match the selected reporting period.',
      ...base,
    };
    if (seam === 'project-unresolved') return {
      headline: 'Project resolution failed for this intake context.',
      detail: 'The backend could not resolve the project safely. Correct project metadata or pick a resolvable project.',
      ...base,
    };
    if (seam === 'duplicate-supersession-risk') return {
      headline: 'Duplicate or supersession risk requires review flow.',
      detail: 'Backend duplicate checks blocked direct commit. Use review/replay flow with intentional supersede decision.',
      ...base,
    };
    if (seam === 'commit-failed') return {
      headline: 'Commit command failed before terminal write completion.',
      detail: 'Preview may have passed, but commit failed in a downstream backend seam. Retry after addressing support details.',
      ...base,
    };
    if (seam === 'replay-failed') return {
      headline: 'Replay command failed in backend execution.',
      detail: 'Replay did not reach a successful terminal transition. Inspect support details and retry with intent.',
      ...base,
    };
  }
  const emptySupport: SupportDetails = at ? { timestamp: at.toISOString() } : {};
  if (seam === 'config') {
    return {
      headline: 'Safety configuration is incomplete.',
      detail: 'List or backend bootstrap bindings are missing for this hosted runtime.',
      support: emptySupport,
      failureClass: seam,
      suggestedAction,
    };
  }
  if (seam === 'read-side-list') {
    return {
      headline: 'Read-side list seam failed.',
      detail: 'Safety could not read required SharePoint list state needed for this operation.',
      support: emptySupport,
      failureClass: seam,
      suggestedAction,
    };
  }
  return {
    headline: 'Upload flow failed at an unknown seam.',
    detail: error instanceof Error ? error.message : 'Unexpected failure.',
    support: emptySupport,
    failureClass: seam,
    suggestedAction,
  };
}

export function replayFailureMessage(error: unknown, at?: Date): TruthfulMessage {
  const seam = classifyReplayFailure(error);
  const suggestedAction = suggestedActionForClass(seam);
  if (isSafetyBackendCommandError(error)) {
    const support = supportDetailsForBackendError(error, at);
    const base = { support, failureClass: seam, suggestedAction };
    if (seam === 'auth') return {
      headline: 'Replay authentication failed.',
      detail: 'Safety could not authenticate replay against the backend API.',
      ...base,
    };
    if (seam === 'network-cors') return {
      headline: 'Replay failed due to network or CORS transport issues.',
      detail: 'The replay command could not reliably reach backend runtime. Retry after connectivity and CORS validation.',
      ...base,
    };
    if (seam === 'route-not-found') return {
      headline: 'Replay route was not found.',
      detail: 'The backend replay endpoint is unavailable in this runtime deployment.',
      ...base,
    };
    return {
      headline: 'Replay command failed.',
      detail: 'Replay failed in the backend command seam before a successful terminal transition.',
      ...base,
    };
  }
  const emptySupport: SupportDetails = at ? { timestamp: at.toISOString() } : {};
  if (seam === 'config') {
    return {
      headline: 'Replay configuration is incomplete.',
      detail: 'Hosted Safety bindings are incomplete for replay.',
      support: emptySupport,
      failureClass: seam,
      suggestedAction,
    };
  }
  if (seam === 'read-side-list') {
    return {
      headline: 'Replay list read failed.',
      detail: 'Safety could not read required list state while evaluating replay context.',
      support: emptySupport,
      failureClass: seam,
      suggestedAction,
    };
  }
  return {
    headline: 'Replay failed at an unknown seam.',
    detail: error instanceof Error ? error.message : 'Unexpected failure.',
    support: emptySupport,
    failureClass: seam,
    suggestedAction,
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
    details.timestamp ? `timestamp: ${details.timestamp}` : null,
  ].filter(Boolean) as ReadonlyArray<string>;
}

/**
 * composeSupportPayload renders a copy-safe plain-text payload from the
 * allow-listed diagnostic fields only. It deliberately never includes
 * backend `message` text or `graphContext` free-text so the result is safe
 * to paste into a support ticket.
 */
export function composeSupportPayload(
  details: SupportDetails,
  options?: { readonly suggestedAction?: string },
): string {
  const header = 'Safety support details';
  const actionLine =
    options?.suggestedAction && options.suggestedAction.trim().length > 0
      ? `suggestedAction: ${options.suggestedAction}`
      : null;
  const lines = supportDetailLines(details);
  if (!actionLine && lines.length === 0) {
    const fallbackTs = details.timestamp ? `timestamp: ${details.timestamp}` : null;
    return [header, fallbackTs ?? 'No additional diagnostic details were returned.']
      .filter(Boolean)
      .join('\n');
  }
  return [header, actionLine, ...lines].filter(Boolean).join('\n');
}

export function readFailureMessage(
  error: unknown,
  scope: ReadFailureScope,
  at?: Date,
): TruthfulMessage {
  const seam = classifyUploadFailure(error);
  const suggestedAction = suggestedActionForClass(seam);
  const subject = scope === 'reporting-periods' ? 'reporting periods' : 'project-week records';
  if (isSafetyBackendCommandError(error)) {
    const support = supportDetailsForBackendError(error, at);
    const base = { support, failureClass: seam, suggestedAction };
    if (seam === 'auth') {
      return {
        headline: `Authentication failed while loading ${subject}.`,
        detail: 'Safety could not authenticate read-side backend access for this view.',
        ...base,
      };
    }
    if (seam === 'network-cors') {
      return {
        headline: `Network/CORS failure while loading ${subject}.`,
        detail: 'The read request failed in transport before completing route execution.',
        ...base,
      };
    }
    if (seam === 'route-not-found') {
      return {
        headline: `Read route was not found for ${subject}.`,
        detail: 'The configured backend route is unavailable in this deployment.',
        ...base,
      };
    }
    return {
      headline: `Loading ${subject} failed at backend command seam.`,
      detail: 'Retry after reviewing support details and runtime configuration.',
      ...base,
    };
  }
  const emptySupport: SupportDetails = at ? { timestamp: at.toISOString() } : {};
  if (isSafetyConfigurationError(error)) {
    return {
      headline: 'Safety configuration is incomplete.',
      detail: `Required bindings for ${subject} are missing in this hosted runtime.`,
      support: emptySupport,
      failureClass: 'config',
      suggestedAction: suggestedActionForClass('config'),
    };
  }
  if (isSafetyAdapterFetchError(error)) {
    return {
      headline: `Read-side list access failed for ${subject}.`,
      detail: 'Safety could not read required SharePoint list data for this view.',
      support: emptySupport,
      failureClass: 'read-side-list',
      suggestedAction: suggestedActionForClass('read-side-list'),
    };
  }
  return {
    headline: `Loading ${subject} failed.`,
    detail: error instanceof Error ? error.message : 'Unexpected read-side error.',
    support: emptySupport,
    failureClass: seam,
    suggestedAction,
  };
}
