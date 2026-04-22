import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { requireAdmin, requireDelegatedScope } from '../../middleware/authorization.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { assertAdapterModeValid } from '../../utils/adapter-mode-guard.js';
import { MockSharePointService, SharePointService } from '../../services/sharepoint-service.js';

function parseDryRun(body: Record<string, unknown>): boolean {
  return body.dryRun === true;
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
