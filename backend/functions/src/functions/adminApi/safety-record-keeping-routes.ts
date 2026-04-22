import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';
import { MockSharePointService, SharePointService } from '../../services/sharepoint-service.js';
import type { UploadContext } from '../../../../../packages/features/safety/src/domain/types.js';

function parseDryRun(body: Record<string, unknown>): boolean {
  return body.dryRun === true;
}

function parseIngestionBody(body: Record<string, unknown>): {
  fileName: string;
  fileContentBase64: string;
  context: UploadContext;
} | null {
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : '';
  const fileContentBase64 = typeof body.fileContentBase64 === 'string'
    ? body.fileContentBase64.trim()
    : '';
  const rawContext = body.context as Record<string, unknown> | undefined;
  if (!fileName || !fileContentBase64 || !rawContext) return null;

  const context: UploadContext = {
    uploadedByUpn:
      typeof rawContext.uploadedByUpn === 'string' ? rawContext.uploadedByUpn : '',
    uploadedAt:
      typeof rawContext.uploadedAt === 'string' ? rawContext.uploadedAt : '',
    fileName:
      typeof rawContext.fileName === 'string' ? rawContext.fileName : fileName,
    reportingPeriodId:
      typeof rawContext.reportingPeriodId === 'string' ? rawContext.reportingPeriodId : '',
    reportingPeriodSpItemId:
      typeof rawContext.reportingPeriodSpItemId === 'number'
        ? rawContext.reportingPeriodSpItemId
        : 0,
  };

  if (!context.reportingPeriodId || !context.uploadedByUpn || !context.uploadedAt) return null;
  return { fileName, fileContentBase64, context };
}

app.http('adminProvisionSafetyRecordKeepingSharePoint', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/safety-records/provision-sharepoint',
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
  route: 'admin/safety-records/ingest',
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
      if (!parsed) {
        return errorResponse(
          400,
          'VALIDATION_ERROR',
          'fileName, fileContentBase64, and context.{uploadedByUpn, uploadedAt, reportingPeriodId} are required.',
          requestId,
        );
      }

      try {
        const mode = assertAdapterModeValid();
        const sharePoint = mode === 'mock' || process.env.NODE_ENV === 'test'
          ? new MockSharePointService()
          : new SharePointService();

        const operation = await sharePoint.ingestSafetyWorkbook(parsed, requestId);
        if (!operation.success || !operation.result) {
          return {
            status: 422,
            jsonBody: {
              message: 'Safety ingestion failed before commit.',
              code: 'SAFETY_INGESTION_FAILED',
              requestId,
              data: operation,
            },
            headers: {
              'X-Request-Id': requestId,
            },
          };
        }

        return successResponse(operation);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResponse(500, 'INTERNAL_ERROR', message, requestId);
      }
    }, { domain: 'adminControlPlane', operation: 'safetyIngestWorkbook' }),
  ),
});
