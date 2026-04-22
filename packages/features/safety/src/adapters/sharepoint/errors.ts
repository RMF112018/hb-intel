/**
 * Safety SharePoint adapter error taxonomy.
 *
 * Phase-3 "Periods tab" root-cause remediation: the UI was collapsing every
 * adapter failure into "Failed to load reporting periods.", which masked the
 * real failing list. These typed errors let consumers distinguish
 *
 *   - configuration gaps (no list GUID overlay → fail-closed),
 *   - runtime REST failures (HTTP 403/404/500 etc).
 *
 * They extend the built-in `Error` so existing `catch` blocks continue to
 * work.
 */

/**
 * Thrown when a descriptor resolves to the zero-GUID placeholder because no
 * overlay was configured for that list. Signals a provisioning / bootstrap
 * problem, not a runtime I/O failure — retrying without fixing the overlay
 * will not succeed.
 */
export class SafetyConfigurationError extends Error {
  readonly listName: string;
  constructor(listName: string, message: string) {
    super(message);
    this.name = 'SafetyConfigurationError';
    this.listName = listName;
  }
}

/**
 * Thrown when the SharePoint REST call for a specific list returns a
 * non-OK HTTP status. Carries enough detail for honest error messages and
 * targeted retry UX.
 */
export class SafetyAdapterFetchError extends Error {
  readonly listName: string;
  readonly siteUrl: string;
  readonly endpoint: string;
  readonly httpStatus: number;
  readonly bodySnippet?: string;

  constructor(params: {
    listName: string;
    siteUrl: string;
    endpoint: string;
    httpStatus: number;
    bodySnippet?: string;
    operation?: string;
  }) {
    const op = params.operation ?? 'Fetch';
    const base = `${op} ${params.listName} failed (${params.httpStatus}).`;
    const withSnippet = params.bodySnippet
      ? `${base} Body: ${params.bodySnippet}`
      : base;
    super(withSnippet);
    this.name = 'SafetyAdapterFetchError';
    this.listName = params.listName;
    this.siteUrl = params.siteUrl;
    this.endpoint = params.endpoint;
    this.httpStatus = params.httpStatus;
    this.bodySnippet = params.bodySnippet;
  }
}

export function isSafetyAdapterFetchError(err: unknown): err is SafetyAdapterFetchError {
  return err instanceof SafetyAdapterFetchError;
}

export function isSafetyConfigurationError(err: unknown): err is SafetyConfigurationError {
  return err instanceof SafetyConfigurationError;
}
