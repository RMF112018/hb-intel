import {
  GraphRequestError,
  classifyGraphFailure,
  classifyGraphThrown,
  type GraphFailureClass,
} from './safety-ingestion-graph-data-plane.js';
import { SharePointTokenAcquisitionError } from './managed-identity-token-service.js';
import { ReportingPeriodContractError } from './safety-reporting-period-contract.js';
import { SafetyIngestionCodePathViolationError } from './safety-ingestion-code-path.js';

/**
 * Canonical ingestion-layer failure classes exposed to Safety operators.
 *
 * These are the discriminators the route surfaces when a preview/ingest/replay
 * request fails. Each class maps to a distinct remediation lane in production:
 *
 * - `identity-not-acquired`: Functions-side managed identity / token acquisition
 *   failed. Check app identity, federation, clock skew.
 * - `permission-denied-401`: Graph rejected the app token. Check app registration
 *   and permission consent.
 * - `permission-denied-403`: Graph accepted the token but the app lacks per-site
 *   grant. Check Sites.Selected permissions on Safety / HBCentral.
 * - `site-binding-error`: Resolved-site path returned 404. Safety/HBCentral
 *   site URL is wrong or the site was deleted.
 * - `list-binding-error`: List lookup returned 404. List GUID overlay drifted or
 *   the list was removed/renamed.
 * - `item-binding-error`: Specific item lookup returned 404. Reporting-period or
 *   parent-run pointer is stale.
 * - `bounded-query-truncated`: Compound `$filter` returned more than one page,
 *   signalling natural-key/index contract violation.
 * - `rate-limited`: Graph throttled the call past the retry ceiling.
 * - `transport-error`: Network failure or Graph 5xx past retries.
 * - `concurrency-conflict`: ETag-protected PATCH was rejected (409/412).
 * - `token-acquisition-error`: SharePoint token-acquisition error (legacy seam).
 * - `payload-error`: Input payload was structurally unusable (empty bytes, etc.).
 * - `preview-gate-blocked`: Preview readiness gate rejected the upload — the
 *   preview response carries the per-class discrimination.
 * - `parser-authority-violation`: Markered workbook lacked parser-authoritative
 *   metadata seam(s); commit rejected by preview gate.
 * - `reference-validation-error`: Required reference lists are missing/inaccessible.
 * - `target-resolution-error`: Site-target constants conflict with env.
 * - `field-contract-missing`: List-field contract check detected drift.
 * - `code-path-violation`: Backend ingestion attempted to run via a non-Graph
 *   repository code path (fail-closed safeguard).
 * - `unknown`: Anything else. Treat as a new class candidate when observed.
 */
export type SafetyIngestionFailureClass =
  | 'identity-not-acquired'
  | 'permission-denied-401'
  | 'permission-denied-403'
  | 'site-binding-error'
  | 'list-binding-error'
  | 'item-binding-error'
  | 'bounded-query-truncated'
  | 'rate-limited'
  | 'transport-error'
  | 'concurrency-conflict'
  | 'token-acquisition-error'
  | 'payload-error'
  | 'preview-gate-blocked'
  | 'parser-authority-violation'
  | 'reference-validation-error'
  | 'target-resolution-error'
  | 'field-contract-missing'
  | 'code-path-violation'
  | 'unknown';

/**
 * Non-secret Graph-call context surfaced to operators when a Graph call is the
 * proximate cause of an ingestion failure. Deliberately excludes tokens, raw
 * authorization headers, and full response bodies. `pathSummary` is a trimmed
 * version of the Graph path with site/list ids left in place (site ids + list
 * ids are not secrets — they're visible in SharePoint URLs already). The
 * `graphErrorCode` is best-effort extracted from the Graph error envelope.
 */
export interface IGraphFailureContext {
  readonly operation?: string;
  readonly pathSummary?: string;
  readonly statusCode?: number;
  readonly statusFamily?: '4xx' | '5xx' | 'network' | 'unknown';
  readonly graphErrorCode?: string;
  readonly authLane: 'identity' | 'permission' | 'binding' | 'throttle' | 'transport' | 'none';
}

export interface IClassifiedIngestionFailure {
  readonly failureClass: SafetyIngestionFailureClass;
  readonly errorCode: string;
  readonly graphContext?: IGraphFailureContext;
}

/**
 * Classify a caught throwable into a stable {@link SafetyIngestionFailureClass}
 * + discriminating error code + optional non-secret Graph context. The caller
 * owns the human-readable message and merges this classification into the
 * diagnostic envelope.
 *
 * Never throws. Returns `unknown` for values that do not match a known pattern
 * so the caller can still produce a structured 500.
 */
export function classifyIngestionFailure(
  err: unknown,
  fallbackErrorCode: string,
): IClassifiedIngestionFailure {
  if (err instanceof GraphRequestError) {
    return classifyFromGraphRequestError(err, fallbackErrorCode);
  }
  if (err instanceof SharePointTokenAcquisitionError) {
    return {
      failureClass: 'token-acquisition-error',
      errorCode: err.code,
      graphContext: { authLane: 'identity' },
    };
  }
  if (err instanceof ReportingPeriodContractError) {
    return {
      failureClass: 'item-binding-error',
      errorCode: err.code,
      graphContext: { authLane: 'binding' },
    };
  }
  if (err instanceof SafetyIngestionCodePathViolationError) {
    return {
      failureClass: 'code-path-violation',
      errorCode: err.code,
      graphContext: {
        authLane: 'none',
      },
    };
  }
  const name = (err as { name?: string } | undefined)?.name;
  if (name === 'GraphBoundedQueryTruncatedError') {
    return {
      failureClass: 'bounded-query-truncated',
      errorCode: 'SAFETY_INGESTION_GRAPH_BOUNDED_QUERY_TRUNCATED',
      graphContext: { authLane: 'none' },
    };
  }
  const thrownClass = classifyGraphThrown(err);
  if (thrownClass === 'identity-not-acquired') {
    return {
      failureClass: 'identity-not-acquired',
      errorCode: 'SAFETY_INGESTION_GRAPH_IDENTITY_NOT_ACQUIRED',
      graphContext: { authLane: 'identity' },
    };
  }
  if (thrownClass === 'transport-error') {
    return {
      failureClass: 'transport-error',
      errorCode: 'SAFETY_INGESTION_GRAPH_TRANSPORT_ERROR',
      graphContext: { authLane: 'transport', statusFamily: 'network' },
    };
  }
  return {
    failureClass: 'unknown',
    errorCode: fallbackErrorCode,
  };
}

function classifyFromGraphRequestError(
  err: GraphRequestError,
  fallbackErrorCode: string,
): IClassifiedIngestionFailure {
  const graphClass: GraphFailureClass =
    err.failureClass ?? classifyGraphFailure(err.status, err.path, err.bodySnippet);
  const graphErrorCode = safeExtractGraphErrorCode(err.bodySnippet);
  const pathSummary = summarizeGraphPath(err.path);
  const isConcurrency = err.name === 'GraphConcurrencyError' || err.status === 409 || err.status === 412;

  if (isConcurrency) {
    return {
      failureClass: 'concurrency-conflict',
      errorCode: 'SAFETY_INGESTION_GRAPH_CONCURRENCY_CONFLICT',
      graphContext: {
        operation: extractOperationFromMessage(err.message),
        pathSummary,
        statusCode: err.status,
        statusFamily: '4xx',
        graphErrorCode,
        authLane: 'none',
      },
    };
  }

  switch (graphClass) {
    case 'permission-denied-401':
      return {
        failureClass: 'permission-denied-401',
        errorCode: 'SAFETY_INGESTION_GRAPH_AUTH_FAILED',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '4xx',
          graphErrorCode,
          authLane: 'permission',
        },
      };
    case 'permission-denied-403':
      return {
        failureClass: 'permission-denied-403',
        errorCode: 'SAFETY_INGESTION_GRAPH_PERMISSION_DENIED',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '4xx',
          graphErrorCode,
          authLane: 'permission',
        },
      };
    case 'site-not-found':
      return {
        failureClass: 'site-binding-error',
        errorCode: 'SAFETY_INGESTION_GRAPH_SITE_NOT_FOUND',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '4xx',
          graphErrorCode,
          authLane: 'binding',
        },
      };
    case 'list-not-found':
      return {
        failureClass: 'list-binding-error',
        errorCode: 'SAFETY_INGESTION_GRAPH_LIST_NOT_FOUND',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '4xx',
          graphErrorCode,
          authLane: 'binding',
        },
      };
    case 'item-not-found':
      return {
        failureClass: 'item-binding-error',
        errorCode: 'SAFETY_INGESTION_GRAPH_ITEM_NOT_FOUND',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '4xx',
          graphErrorCode,
          authLane: 'binding',
        },
      };
    case 'rate-limited':
      return {
        failureClass: 'rate-limited',
        errorCode: 'SAFETY_INGESTION_GRAPH_RATE_LIMITED',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '4xx',
          graphErrorCode,
          authLane: 'throttle',
        },
      };
    case 'transport-error':
      return {
        failureClass: 'transport-error',
        errorCode: 'SAFETY_INGESTION_GRAPH_TRANSPORT_ERROR',
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: '5xx',
          graphErrorCode,
          authLane: 'transport',
        },
      };
    default:
      return {
        failureClass: 'unknown',
        errorCode: fallbackErrorCode,
        graphContext: {
          operation: extractOperationFromMessage(err.message),
          pathSummary,
          statusCode: err.status,
          statusFamily: classifyStatusFamily(err.status),
          graphErrorCode,
          authLane: 'none',
        },
      };
  }
}

function classifyStatusFamily(status: number): '4xx' | '5xx' | 'unknown' {
  if (status >= 400 && status <= 499) return '4xx';
  if (status >= 500 && status <= 599) return '5xx';
  return 'unknown';
}

/**
 * Extract the Graph operation name from the canonical error message format:
 *   `graph.<operation> <path> failed (<status>): <body>`
 */
function extractOperationFromMessage(message: string): string | undefined {
  const match = /^graph\.([a-z0-9-]+)\s/.exec(message);
  return match ? match[1] : undefined;
}

/**
 * Summarize the Graph path for operator triage without leaking query strings
 * (which may contain OData filters that echo user-supplied values). Preserves
 * the lane segments (`/sites/`, `/lists/`, `/items/`) and the ids so operators
 * can identify which binding target was hit.
 */
function summarizeGraphPath(path: string): string {
  const [pathOnly] = path.split('?');
  return pathOnly.length > 160 ? `${pathOnly.slice(0, 160)}...` : pathOnly;
}

function safeExtractGraphErrorCode(bodySnippet: string | undefined): string | undefined {
  if (!bodySnippet) return undefined;
  try {
    const parsed = JSON.parse(bodySnippet) as { error?: { code?: string } };
    const code = parsed.error?.code;
    if (typeof code !== 'string') return undefined;
    return code.length > 64 ? code.slice(0, 64) : code;
  } catch {
    return undefined;
  }
}

/**
 * Preview diagnostic summary — a stable machine-readable discriminator for the
 * top failure class observed in a `SafetyIngestionPreviewResult`. Derived from
 * the existing `blockingErrors` codes so adding a summary does not destabilize
 * the underlying diagnostic list.
 *
 * Precedence is chosen to route operators to the earliest upstream issue:
 * template → parse → period → project → duplicate. Once any class is present,
 * it becomes the summary class regardless of later conditions.
 */
export type PreviewFailureClass =
  | 'none'
  | 'workbook-read-failed'
  | 'template-incompatible'
  | 'parser-authority-violation'
  | 'parse-failure'
  | 'reporting-period-not-found'
  | 'reporting-period-mismatch'
  | 'project-unresolved'
  | 'duplicate-supersession-risk'
  | 'unknown-blocking';

export interface IPreviewDiagnosticSummary {
  readonly commitReady: boolean;
  readonly failureClass: PreviewFailureClass;
  readonly blockingCodes: ReadonlyArray<string>;
  readonly warningCodes: ReadonlyArray<string>;
  readonly checks: {
    readonly templateValid: boolean;
    readonly parserContractMarkerState: 'markered-valid' | 'markered-invalid' | 'markerless';
    readonly parseSucceeded: boolean;
    readonly reportingPeriodResolved: boolean;
    readonly reportingPeriodDateInRange: boolean;
    readonly projectResolved: boolean;
    readonly duplicateConfidence: 'none' | 'near-duplicate' | 'high-confidence-duplicate';
  };
}

export function derivePreviewDiagnosticSummary(input: {
  readonly commitReadiness: boolean;
  readonly blockingErrors: ReadonlyArray<{ readonly code: string }>;
  readonly warnings: ReadonlyArray<{ readonly code: string }>;
  readonly template: {
    readonly valid: boolean;
    readonly templateVersion: string | null;
    readonly parserContractVersion: string | null;
  };
  readonly metadata?: unknown;
  readonly reportingPeriod?: { readonly resolved: boolean; readonly dateInRange: boolean };
  readonly projectResolution: { readonly resolved: boolean };
  readonly duplicateRisk?: {
    readonly confidence: 'near-duplicate' | 'high-confidence-duplicate' | 'none';
  };
}): IPreviewDiagnosticSummary {
  const codes = input.blockingErrors.map((item) => item.code);
  const summaryClass = deriveFailureClass(input.commitReadiness, codes);
  return {
    commitReady: input.commitReadiness,
    failureClass: summaryClass,
    blockingCodes: codes,
    warningCodes: input.warnings.map((item) => item.code),
    checks: {
      templateValid: input.template.valid,
      parserContractMarkerState: deriveMarkerState(input.template),
      parseSucceeded: input.metadata !== undefined,
      reportingPeriodResolved: input.reportingPeriod?.resolved ?? false,
      reportingPeriodDateInRange: input.reportingPeriod?.dateInRange ?? false,
      projectResolved: input.projectResolution.resolved,
      duplicateConfidence: input.duplicateRisk?.confidence ?? 'none',
    },
  };
}

function deriveFailureClass(
  commitReady: boolean,
  codes: ReadonlyArray<string>,
): PreviewFailureClass {
  if (commitReady) return 'none';
  if (codes.includes('WORKBOOK_READ_FAILED')) return 'workbook-read-failed';
  if (
    codes.includes('TEMPLATE_VALIDATION_FAILED') ||
    codes.includes('TEMPLATE_INCOMPATIBLE')
  ) {
    return 'template-incompatible';
  }
  if (codes.includes('PARSER_AUTHORITY_VIOLATION')) {
    return 'parser-authority-violation';
  }
  if (codes.includes('PARSER_CRITICAL_CELL_ERROR')) {
    return 'parser-authority-violation';
  }
  if (codes.includes('PARSE_FAILED')) return 'parse-failure';
  if (codes.includes('REPORTING_PERIOD_NOT_FOUND')) return 'reporting-period-not-found';
  if (codes.includes('REPORTING_PERIOD_MISMATCH')) return 'reporting-period-mismatch';
  if (codes.includes('REPORTING_WEEK_MISMATCH') || codes.includes('REPORTING_WEEK_INCOMPLETE')) {
    return 'reporting-period-mismatch';
  }
  if (codes.includes('PROJECT_UNRESOLVED')) return 'project-unresolved';
  if (codes.includes('DUPLICATE_SUPERSESSION_RISK')) return 'duplicate-supersession-risk';
  return 'unknown-blocking';
}

function deriveMarkerState(template: {
  readonly valid: boolean;
  readonly templateVersion: string | null;
  readonly parserContractVersion: string | null;
}): 'markered-valid' | 'markered-invalid' | 'markerless' {
  const hasMarkers = template.templateVersion !== null || template.parserContractVersion !== null;
  if (!hasMarkers) return 'markerless';
  return template.valid ? 'markered-valid' : 'markered-invalid';
}
