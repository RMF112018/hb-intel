import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';
import {
  MockSharePointService,
  SharePointService,
  type ISafetyIngestionOperationResult,
  type ISafetyIngestionPreviewOperationResult,
  type ISafetyProvisionDiagnostic,
} from '../../services/sharepoint-service.js';
import { classifyIngestionFailure } from '../../services/safety-ingestion-failure-classifier.js';
import {
  ReportingPeriodContractError,
  normalizeReportingPeriodContract,
} from '../../services/safety-reporting-period-contract.js';
import type { ProjectSourceClassification, UploadContext } from '../../../../../packages/features/safety/src/domain/types.js';

/**
 * Prompt 03: Prefer a discriminating failure-class from the underlying
 * diagnostics list when shaping 422 responses. Falls back to the preview
 * summary when no diagnostic carries a class, and finally to `unknown`.
 */
function deriveRouteFailureClass(
  diagnostics: ReadonlyArray<ISafetyProvisionDiagnostic>,
  previewFailureClass?: string,
): string {
  const classed = diagnostics.find((d) => typeof d.failureClass === 'string' && d.failureClass);
  if (classed?.failureClass) return classed.failureClass;
  if (previewFailureClass && previewFailureClass !== 'none') return previewFailureClass;
  return 'unknown';
}

function buildIngestFailureEnvelope(
  operation: ISafetyIngestionOperationResult,
  requestId: string,
  defaultCode: string,
  defaultMessage: string,
): HttpResponseInit {
  const primaryDiagnostic = operation.diagnostics.find((d) => d.failureClass);
  const previewClass = operation.preview?.diagnosticSummary?.failureClass;
  const failureClass = deriveRouteFailureClass(operation.diagnostics, previewClass);
  return {
    status: 422,
    jsonBody: {
      message: defaultMessage,
      code: primaryDiagnostic?.code ?? defaultCode,
      requestId,
      failureClass,
      previewFailureClass: previewClass ?? 'none',
      graphContext: primaryDiagnostic?.graphContext,
      data: operation,
    },
    headers: {
      'X-Request-Id': requestId,
    },
  };
}

function buildPreviewFailureEnvelope(
  operation: ISafetyIngestionPreviewOperationResult,
  requestId: string,
  defaultCode: string,
  defaultMessage: string,
): HttpResponseInit {
  const primaryDiagnostic = operation.diagnostics.find((d) => d.failureClass);
  const previewClass = operation.preview?.diagnosticSummary?.failureClass;
  const failureClass = deriveRouteFailureClass(operation.diagnostics, previewClass);
  return {
    status: 422,
    jsonBody: {
      message: defaultMessage,
      code: primaryDiagnostic?.code ?? defaultCode,
      requestId,
      failureClass,
      previewFailureClass: previewClass ?? 'none',
      graphContext: primaryDiagnostic?.graphContext,
      data: operation,
    },
    headers: {
      'X-Request-Id': requestId,
    },
  };
}

function buildRouteFailureDetails(err: unknown): Record<string, unknown> {
  const classification = classifyIngestionFailure(err, 'INTERNAL_ERROR');
  return {
    failureClass: classification.failureClass,
    errorCode: classification.errorCode,
    ...(classification.graphContext ? { graphContext: classification.graphContext } : {}),
  };
}

const VALID_PROJECT_SOURCE_CLASSIFICATIONS: ReadonlyArray<ProjectSourceClassification> = [
  'project',
  'legacy-only',
  'project+legacy',
  'unresolved',
];

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function parseProjectSourceClassification(
  value: unknown,
): ProjectSourceClassification | undefined {
  if (typeof value !== 'string') return undefined;
  return VALID_PROJECT_SOURCE_CLASSIFICATIONS.find((c) => c === value);
}

function parseDryRun(body: Record<string, unknown>): boolean {
  return body.dryRun === true;
}

type ParsedIngestionBody =
  | {
    ok: true;
    value: {
      fileName: string;
      fileContentBase64: string;
      context: UploadContext;
    };
  }
  | {
    ok: false;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

function parseIngestionBody(body: Record<string, unknown>): ParsedIngestionBody {
  const invalid = (
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ): ParsedIngestionBody => ({
    ok: false,
    code,
    message,
    details,
  });

  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
  const fileContentBase64 = typeof body.fileContentBase64 === 'string'
    ? body.fileContentBase64.trim()
    : '';
  const rawContext = body.context as Record<string, unknown> | undefined;
  if (!fileName || !fileContentBase64 || !rawContext) {
    return invalid(
      'VALIDATION_ERROR',
      'fileName, fileContentBase64, and context.{uploadedByUpn, uploadedAt, reportingPeriodId} are required.',
    );
  }

  const reportingPeriodSpItemIdCompanion = typeof rawContext.reportingPeriodSpItemId === 'number'
    ? rawContext.reportingPeriodSpItemId
    : undefined;
  const context: UploadContext = {
    uploadedByUpn:
      typeof rawContext.uploadedByUpn === 'string' ? rawContext.uploadedByUpn : '',
    uploadedByDisplayName: parseOptionalString(rawContext.uploadedByDisplayName),
    uploadedAt:
      typeof rawContext.uploadedAt === 'string' ? rawContext.uploadedAt : '',
    fileName:
      typeof rawContext.fileName === 'string' ? rawContext.fileName : fileName,
    reportingPeriodId:
      typeof rawContext.reportingPeriodId === 'string' ? rawContext.reportingPeriodId : '',
    reportingPeriodSpItemId:
      reportingPeriodSpItemIdCompanion ?? 0,
    // G-03 structured intake authority (Wave 2 revision): operator-entered
    // intake metadata flows through the backend as-is. Calendar-date
    // semantics are preserved (`inspectionDate` stays as `YYYY-MM-DD`;
    // no timezone conversion here).
    projectNumber: parseOptionalString(rawContext.projectNumber),
    projectNameSnapshot: parseOptionalString(rawContext.projectNameSnapshot),
    projectLocationSnapshot: parseOptionalString(rawContext.projectLocationSnapshot),
    projectStageSnapshot: parseOptionalString(rawContext.projectStageSnapshot),
    projectSourceClassification: parseProjectSourceClassification(
      rawContext.projectSourceClassification,
    ),
    projectLookupId: parseOptionalNumber(rawContext.projectLookupId),
    legacyRegistryItemId: parseOptionalNumber(rawContext.legacyRegistryItemId),
    inspectionNumber: parseOptionalString(rawContext.inspectionNumber),
    inspectionDate: parseOptionalString(rawContext.inspectionDate),
  };

  if (!context.reportingPeriodId || !context.uploadedByUpn || !context.uploadedAt) {
    return invalid(
      'VALIDATION_ERROR',
      'fileName, fileContentBase64, and context.{uploadedByUpn, uploadedAt, reportingPeriodId} are required.',
    );
  }

  try {
    const normalized = normalizeReportingPeriodContract({
      reportingPeriodId: context.reportingPeriodId,
      reportingPeriodSpItemId: reportingPeriodSpItemIdCompanion,
    });
    const normalizedContext: UploadContext = {
      ...context,
      reportingPeriodId: normalized.reportingPeriodId,
      reportingPeriodSpItemId: normalized.reportingPeriodSpItemId,
    };
    return {
      ok: true,
      value: { fileName, fileContentBase64, context: normalizedContext },
    };
  } catch (err) {
    if (err instanceof ReportingPeriodContractError) {
      return invalid(err.code, err.message, err.details);
    }
    throw err;
  }
}

function parseReplayBody(body: Record<string, unknown>): {
  parentRunId: string;
  supersedePrior?: boolean;
} | null {
  const parentRunId = typeof body.parentRunId === 'string' ? body.parentRunId.trim() : '';
  if (!parentRunId) return null;
  const supersedePrior = body.supersedePrior === true;
  return { parentRunId, supersedePrior };
}

function parseOptionalPositiveInteger(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

app.http('adminProvisionSafetyRecordKeepingSharePoint', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-records/provision-sharepoint',
  handler: withAuth(
    withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const scopeDenied = requireDelegatedScope(auth.claims, requestId);
      if (scopeDenied) return scopeDenied;
      const adminDenied = requireAdmin(auth.claims, requestId);
      if (adminDenied) return adminDenied;

      let body: Record<string, unknown> = {};
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        body = {};
      }

      try {
        const mode = assertAdapterModeValid();
        const sharePoint = mode === 'mock' || process.env.NODE_ENV === 'test'
          ? new MockSharePointService()
          : new SharePointService();

        const result = await sharePoint.provisionSafetyRecordKeepingSharePoint({
          dryRun: parseDryRun(body),
        });

        if (!result.success) {
          return {
            status: 422,
            jsonBody: {
              message: 'Safety Record Keeping SharePoint provisioning preconditions failed.',
              code: 'SAFETY_RECORD_KEEPING_PROVISIONING_FAILED',
              requestId,
              data: result,
            },
            headers: {
              'X-Request-Id': requestId,
            },
          };
        }

        return successResponse(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
      }
    }, { domain: 'adminControlPlane', operation: 'provisionSafetyRecordKeepingSharePoint' })
  ),
});

app.http('safetyIngestWorkbook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-records/ingest',
  handler: withAuth(
    withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const scopeDenied = requireDelegatedScope(auth.claims, requestId);
      if (scopeDenied) return scopeDenied;

      let body: Record<string, unknown> = {};
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return errorResponse(400, 'VALIDATION_ERROR', 'Request body must be valid JSON.', requestId);
      }

      const parsed = parseIngestionBody(body);
      if (!parsed.ok) {
        return errorResponse(400, parsed.code, parsed.message, requestId, parsed.details);
      }

      try {
        const mode = assertAdapterModeValid();
        const sharePoint = mode === 'mock' || process.env.NODE_ENV === 'test'
          ? new MockSharePointService()
          : new SharePointService();

        const operation = await sharePoint.ingestSafetyWorkbook(parsed.value, requestId);
        if (!operation.success || !operation.result) {
          return buildIngestFailureEnvelope(
            operation,
            requestId,
            'SAFETY_INGESTION_FAILED',
            'Safety ingestion failed before commit.',
          );
        }

        return successResponse(operation);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const details = buildRouteFailureDetails(err);
        return errorResponse(
          500,
          typeof details.errorCode === 'string' ? details.errorCode : 'INTERNAL_ERROR',
          message,
          requestId,
          details,
        );
      }
    }, { domain: 'adminControlPlane', operation: 'safetyIngestWorkbook' }),
  ),
});

app.http('safetyPreviewWorkbook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-records/ingest/preview',
  handler: withAuth(
    withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const scopeDenied = requireDelegatedScope(auth.claims, requestId);
      if (scopeDenied) return scopeDenied;

      let body: Record<string, unknown> = {};
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return errorResponse(400, 'VALIDATION_ERROR', 'Request body must be valid JSON.', requestId);
      }

      const parsed = parseIngestionBody(body);
      if (!parsed.ok) {
        return errorResponse(400, parsed.code, parsed.message, requestId, parsed.details);
      }

      try {
        const mode = assertAdapterModeValid();
        const sharePoint = mode === 'mock' || process.env.NODE_ENV === 'test'
          ? new MockSharePointService()
          : new SharePointService();

        const operation = await sharePoint.previewSafetyWorkbook(parsed.value, requestId);
        if (!operation.success || !operation.preview) {
          return buildPreviewFailureEnvelope(
            operation,
            requestId,
            'SAFETY_INGESTION_PREVIEW_FAILED',
            'Safety ingestion preview failed.',
          );
        }

        return successResponse(operation);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const details = buildRouteFailureDetails(err);
        return errorResponse(
          500,
          typeof details.errorCode === 'string' ? details.errorCode : 'INTERNAL_ERROR',
          message,
          requestId,
          details,
        );
      }
    }, { domain: 'adminControlPlane', operation: 'safetyPreviewWorkbook' }),
  ),
});

app.http('safetyReplayWorkbook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'safety-records/replay',
  handler: withAuth(
    withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const scopeDenied = requireDelegatedScope(auth.claims, requestId);
      if (scopeDenied) return scopeDenied;

      let body: Record<string, unknown> = {};
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return errorResponse(400, 'VALIDATION_ERROR', 'Request body must be valid JSON.', requestId);
      }

      const parsed = parseReplayBody(body);
      if (!parsed) {
        return errorResponse(
          400,
          'VALIDATION_ERROR',
          'parentRunId is required.',
          requestId,
        );
      }

      try {
        const mode = assertAdapterModeValid();
        const sharePoint = mode === 'mock' || process.env.NODE_ENV === 'test'
          ? new MockSharePointService()
          : new SharePointService();

        const operation = await sharePoint.replaySafetyWorkbook(parsed, requestId);
        if (!operation.success || !operation.result) {
          return buildIngestFailureEnvelope(
            operation,
            requestId,
            'SAFETY_INGESTION_REPLAY_FAILED',
            'Safety replay failed before commit.',
          );
        }

        return successResponse(operation);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const details = buildRouteFailureDetails(err);
        return errorResponse(
          500,
          typeof details.errorCode === 'string' ? details.errorCode : 'INTERNAL_ERROR',
          message,
          requestId,
          details,
        );
      }
    }, { domain: 'adminControlPlane', operation: 'safetyReplayWorkbook' }),
  ),
});

app.http('safetyReportingPeriodProbe', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'safety-records/reporting-periods/{reportingPeriodId}/probe',
  handler: withAuth(
    withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
      const requestId = extractOrGenerateRequestId(request);
      const scopeDenied = requireDelegatedScope(auth.claims, requestId);
      if (scopeDenied) return scopeDenied;
      const adminDenied = requireAdmin(auth.claims, requestId);
      if (adminDenied) return adminDenied;

      const routeReportingPeriodId = String(request.params.reportingPeriodId ?? '').trim();
      const queryCompanion = parseOptionalPositiveInteger(request.query.get('reportingPeriodSpItemId') ?? undefined);
      try {
        const normalized = normalizeReportingPeriodContract({
          reportingPeriodId: routeReportingPeriodId,
          reportingPeriodSpItemId: queryCompanion,
        });

        const mode = assertAdapterModeValid();
        const sharePoint = mode === 'mock' || process.env.NODE_ENV === 'test'
          ? new MockSharePointService()
          : new SharePointService();

        const operation = await sharePoint.probeSafetyReportingPeriodRead({
          reportingPeriodId: normalized.reportingPeriodId,
          reportingPeriodSpItemId: normalized.reportingPeriodSpItemId,
        }, requestId);
        return successResponse(operation);
      } catch (err) {
        if (err instanceof ReportingPeriodContractError) {
          return errorResponse(400, err.code, err.message, requestId, err.details);
        }
        const message = err instanceof Error ? err.message : String(err);
        const details = buildRouteFailureDetails(err);
        return errorResponse(
          500,
          typeof details.errorCode === 'string' ? details.errorCode : 'INTERNAL_ERROR',
          message,
          requestId,
          details,
        );
      }
    }, { domain: 'adminControlPlane', operation: 'safetyReportingPeriodProbe' }),
  ),
});
