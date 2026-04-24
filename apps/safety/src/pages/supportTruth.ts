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
      detail: 'For markered templates, parser values are authoritative and define committed values; this command was blocked because parser authority requirements were violated.',
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
    if (seam === 'validation-contract') return {
      headline: 'Replay payload failed backend validation contract.',
      detail: 'Replay input or replay-state contract was rejected by the backend validator before commit.',
      ...base,
    };
    if (seam === 'template-incompatibility') return {
      headline: 'Replay blocked by template incompatibility.',
      detail: 'The retained workbook does not satisfy the active parser/template compatibility contract for replay.',
      ...base,
    };
    if (seam === 'parser-authority-violation') return {
      headline: 'Replay blocked by parser authority contract.',
      detail: 'For markered templates, parser values are authoritative and define committed values; replay cannot proceed when parser authority constraints are violated.',
      ...base,
    };
    if (seam === 'reporting-period-mismatch') return {
      headline: 'Replay blocked by reporting period mismatch.',
      detail: 'The replay context conflicts with the reporting period contract for the inspection date and selected period.',
      ...base,
    };
    if (seam === 'project-unresolved') return {
      headline: 'Replay blocked because project resolution is unresolved.',
      detail: 'Replay could not resolve a safe project identity for commit. Correct project mapping before retry.',
      ...base,
    };
    if (seam === 'duplicate-supersession-risk') return {
      headline: 'Replay requires governed duplicate/supersession decision.',
      detail: 'Replay detected duplicate or supersession risk and stopped until an explicit governed supersede decision is made.',
      ...base,
    };
    if (seam === 'commit-failed') return {
      headline: 'Replay commit failed before terminal write completion.',
      detail: 'Replay reached backend execution but failed before the commit path produced a successful terminal write.',
      ...base,
    };
    if (seam === 'replay-failed') return {
      headline: 'Replay failed before terminal transition.',
      detail: 'Replay execution did not reach a successful terminal transition; inspect support details and retry intentionally.',
      ...base,
    };
    return {
      headline: 'Replay failed at an unclassified backend seam.',
      detail: 'Replay reached backend execution, but the returned failure did not map to a classified seam.',
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
    headline: 'Replay failed at an unclassified seam.',
    detail: error instanceof Error ? error.message : 'No classified replay failure details were returned.',
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
    if (seam === 'validation-contract') {
      return {
        headline: `Read contract validation failed for ${subject}.`,
        detail: 'Backend read-input contract validation failed before list data could be returned.',
        ...base,
      };
    }
    if (seam === 'template-incompatibility') {
      return {
        headline: `Template compatibility prevented loading ${subject}.`,
        detail: 'The read path depends on template/contract state that is incompatible with the current parser contract.',
        ...base,
      };
    }
    if (seam === 'parser-authority-violation') {
      return {
        headline: `Parser authority contract blocked loading ${subject}.`,
        detail: 'For markered templates, parser values are authoritative and define committed values; read-side projection is blocked until parser authority constraints are satisfied.',
        ...base,
      };
    }
    if (seam === 'reporting-period-mismatch') {
      return {
        headline: `Reporting period contract blocked loading ${subject}.`,
        detail: 'Read-side query context does not satisfy reporting period/date contract requirements.',
        ...base,
      };
    }
    if (seam === 'project-unresolved') {
      return {
        headline: `Project resolution blocked loading ${subject}.`,
        detail: 'Read-side projection could not safely resolve project identity for this query scope.',
        ...base,
      };
    }
    if (seam === 'duplicate-supersession-risk') {
      return {
        headline: `Duplicate or supersession risk blocked loading ${subject}.`,
        detail: 'Read-side query is blocked behind governed duplicate/supersession safeguards.',
        ...base,
      };
    }
    if (seam === 'commit-failed') {
      return {
        headline: `Prior commit failure is blocking ${subject} read-state.`,
        detail: 'A known commit failure seam is preventing trustworthy read-side state for this view.',
        ...base,
      };
    }
    if (seam === 'replay-failed') {
      return {
        headline: `Replay failure is blocking ${subject} read-state.`,
        detail: 'A known replay failure seam is preventing trustworthy read-side state for this view.',
        ...base,
      };
    }
    return {
      headline: `Loading ${subject} failed at an unclassified backend seam.`,
      detail: 'The backend returned a failure that did not map to a classified read-side seam.',
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
    headline: `Loading ${subject} failed at an unclassified seam.`,
    detail: error instanceof Error ? error.message : 'No classified read-side failure details were returned.',
    support: emptySupport,
    failureClass: seam,
    suggestedAction,
  };
}
