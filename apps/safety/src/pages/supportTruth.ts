import {
  isSafetyAdapterFetchError,
  isSafetyBackendCommandError,
  isSafetyConfigurationError,
} from '@hbc/features-safety';

export interface SupportDetails {
  readonly requestId?: string;
  readonly failureClass?: string;
  readonly previewFailureClass?: string;
}

export interface TruthfulMessage {
  readonly headline: string;
  readonly detail: string;
  readonly support: SupportDetails;
}

export type UploadFailureSeam =
  | 'configuration-bootstrap'
  | 'auth'
  | 'preview-blocker'
  | 'commit-failure'
  | 'read-side-list'
  | 'unknown';

export type ReplayFailureSeam =
  | 'auth'
  | 'replay-failure'
  | 'configuration-bootstrap'
  | 'read-side-list'
  | 'unknown';

export function classifyUploadFailure(error: unknown): UploadFailureSeam {
  if (isSafetyConfigurationError(error)) return 'configuration-bootstrap';
  if (isSafetyAdapterFetchError(error)) return 'read-side-list';
  if (isSafetyBackendCommandError(error)) {
    if (error.errorKind === 'auth') return 'auth';
    if (error.previewFailureClass || error.failureClass || error.httpStatus === 422) return 'preview-blocker';
    return 'commit-failure';
  }
  return 'unknown';
}

export function classifyReplayFailure(error: unknown): ReplayFailureSeam {
  if (isSafetyConfigurationError(error)) return 'configuration-bootstrap';
  if (isSafetyAdapterFetchError(error)) return 'read-side-list';
  if (isSafetyBackendCommandError(error)) {
    if (error.errorKind === 'auth') return 'auth';
    return 'replay-failure';
  }
  return 'unknown';
}

export function uploadFailureMessage(error: unknown): TruthfulMessage {
  const seam = classifyUploadFailure(error);
  if (isSafetyBackendCommandError(error)) {
    const support: SupportDetails = {
      requestId: error.requestId,
      failureClass: error.failureClass,
      previewFailureClass: error.previewFailureClass,
    };
    if (seam === 'auth') {
      return {
        headline: 'Backend authentication failed.',
        detail: 'Safety could not authenticate this command against the backend API. Verify sign-in and delegated scope.',
        support,
      };
    }
    if (seam === 'preview-blocker') {
      return {
        headline: 'Preview blocked commit readiness.',
        detail: 'The backend preview gate rejected this context. Resolve blockers before commit/retry.',
        support,
      };
    }
    if (seam === 'commit-failure') {
      return {
        headline: 'Commit command failed.',
        detail: 'Preview may have passed, but the commit seam failed before terminal write completion.',
        support,
      };
    }
  }
  if (seam === 'configuration-bootstrap') {
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
    const support: SupportDetails = {
      requestId: error.requestId,
      failureClass: error.failureClass,
      previewFailureClass: error.previewFailureClass,
    };
    if (seam === 'auth') {
      return {
        headline: 'Replay authentication failed.',
        detail: 'Safety could not authenticate replay against the backend API.',
        support,
      };
    }
    return {
      headline: 'Replay command failed.',
      detail: 'Replay failed in the backend command seam before a successful terminal transition.',
      support,
    };
  }
  if (seam === 'configuration-bootstrap') {
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
