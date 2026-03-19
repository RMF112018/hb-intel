import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProvisionSiteRequest } from '@hbc/models';
import { randomUUID } from 'crypto';
import { createServiceFactory } from '../../services/service-factory.js';
import { SagaOrchestrator } from './saga-orchestrator.js';
import { createLogger } from '../../utils/logger.js';
import { withAuth } from '../../middleware/auth.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import {
  errorResponse,
  successResponse,
  notFoundResponse,
  forbiddenResponse,
} from '../../utils/response-helpers.js';
import { runTimerFullSpec } from '../timerFullSpec/handler.js';

app.http('provisionProjectSite', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provision-project-site',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    try {
      const body = (await request.json()) as IProvisionSiteRequest;
      // D-PH6-03 trust boundary: server overwrites identity from validated JWT claims.
      body.triggeredBy = auth.claims.upn;
      const correlationId = body.correlationId ?? randomUUID();
      body.correlationId = correlationId;

      logger.info('Provisioning saga triggered', {
        projectId: body.projectId,
        projectNumber: body.projectNumber,
        correlationId,
        triggeredBy: body.triggeredBy,
      });

      if (!body.projectId || !body.projectNumber || !body.projectName || !body.triggeredBy) {
        return errorResponse(400, 'VALIDATION_ERROR', 'Missing required fields: projectId, projectNumber, projectName, triggeredBy', requestId);
      }

      if (!/^\d{2}-\d{3}-\d{2}$/.test(body.projectNumber)) {
        return errorResponse(400, 'VALIDATION_ERROR', 'projectNumber must match ##-###-## format', requestId);
      }

      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      // Fire-and-forget: start saga asynchronously
      orchestrator.execute(body).catch((err) => {
        logger.error('Saga execution failed', {
          projectId: body.projectId,
          correlationId: body.correlationId,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      // Raw 202 response — fire-and-forget acknowledgment; do NOT wrap in successResponse
      return {
        status: 202,
        jsonBody: { message: 'Provisioning started', projectId: body.projectId, correlationId },
      };
    } catch (err) {
      logger.error('Failed to start provisioning', {
        error: err instanceof Error ? err.message : String(err),
      });
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'provisioningSaga', operation: 'provisionProjectSite' })),
});

app.http('getProvisioningStatus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  // D-PH6-01: route key migrated to immutable {projectId}.
  route: 'provisioning-status/{projectId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;

    if (!projectId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Missing projectId parameter', requestId);
    }

    try {
      const services = createServiceFactory();
      const status = await services.tableStorage.getProvisioningStatus(projectId);

      if (!status) {
        return notFoundResponse('ProvisioningStatus', projectId, requestId);
      }

      return successResponse(status);
    } catch (err) {
      logger.error('Failed to get provisioning status', {
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'provisioningSaga', operation: 'getProvisioningStatus' })),
});

app.http('listFailedRuns', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'provisioning-failures',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    // D-PH6-12 admin-only visibility: failures inbox is restricted to Admin/HBIntelAdmin.
    if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
      return forbiddenResponse('Admin role required', requestId);
    }

    const services = createServiceFactory();
    const failedRuns = await services.tableStorage.listFailedRuns();
    return successResponse(failedRuns);
  }, { domain: 'provisioningSaga', operation: 'listFailedRuns' })),
});

app.http('triggerTimerManually', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/trigger-timer',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    // D-PH6-13 manual timer trigger is limited to explicit admin roles.
    if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
      return forbiddenResponse('Admin role required', requestId);
    }

    // D-PH6-13 safety guard: manual timer execution is forbidden in production.
    if (process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Production') {
      return forbiddenResponse('Manual trigger not available in production', requestId);
    }

    await runTimerFullSpec(context, { isPastDue: false });
    return successResponse({ message: 'Timer logic executed manually' });
  }, { domain: 'provisioningSaga', operation: 'triggerTimerManually' })),
});

app.http('retryProvisioning', {
  methods: ['POST'],
  authLevel: 'anonymous',
  // D-PH6-01: retry endpoint now addresses the system key projectId.
  route: 'provisioning-retry/{projectId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;

    if (!projectId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Missing projectId parameter', requestId);
    }

    try {
      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      orchestrator.retry(projectId).catch((err) => {
        logger.error('Retry failed', {
          projectId,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      // Raw 202 response — fire-and-forget; do NOT wrap in successResponse
      return { status: 202, jsonBody: { message: 'Retry started', projectId } };
    } catch (err) {
      logger.error('Failed to start retry', {
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'provisioningSaga', operation: 'retryProvisioning' })),
});

app.http('escalateProvisioning', {
  methods: ['POST'],
  authLevel: 'anonymous',
  // D-PH6-01: escalation endpoint now addresses the system key projectId.
  route: 'provisioning-escalate/{projectId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;

    if (!projectId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Missing projectId parameter', requestId);
    }

    try {
      void (await request.json());
      const services = createServiceFactory();
      await services.tableStorage.escalateProvisioning(projectId, auth.claims.upn);

      logger.info(`Provisioning escalated for ${projectId} by ${auth.claims.upn}`);
      return successResponse({ message: 'Provisioning escalated', projectId });
    } catch (err) {
      logger.error('Failed to escalate', {
        projectId,
        error: err instanceof Error ? err.message : String(err),
      });
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'provisioningSaga', operation: 'escalateProvisioning' })),
});
