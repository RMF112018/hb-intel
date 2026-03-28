import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProvisionSiteRequest, IProvisioningStatus } from '@hbc/models';
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
  listResponse,
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
    return listResponse(failedRuns, failedRuns.length, 1, failedRuns.length, requestId);
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

/**
 * W0-G4-T04 GET /api/provisioning-runs
 * Lists all provisioning runs, optionally filtered by overallStatus. Admin-only.
 */
app.http('listProvisioningRuns', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'provisioning-runs',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
      return forbiddenResponse('Admin role required', requestId);
    }

    const statusFilter = request.query.get('status') ?? undefined;
    const services = createServiceFactory();
    const runs = await services.tableStorage.listAllRuns(statusFilter);
    return listResponse(runs, runs.length, 1, runs.length, requestId);
  }, { domain: 'provisioningSaga', operation: 'listProvisioningRuns' })),
});

/**
 * W0-G4-T04 POST /api/provisioning-archive/{projectId}
 * Archives a failed run by marking it Completed (removes from failures view). Admin-only.
 */
app.http('archiveFailure', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provisioning-archive/{projectId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);
    const projectId = request.params.projectId;

    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'Missing projectId parameter', requestId);
    if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
      return forbiddenResponse('Admin role required', requestId);
    }

    const services = createServiceFactory();
    const status = await services.tableStorage.getProvisioningStatus(projectId);
    if (!status) return notFoundResponse('ProvisioningStatus', projectId, requestId);

    status.overallStatus = 'Completed';
    status.completedAt = new Date().toISOString();
    await services.tableStorage.upsertProvisioningStatus(status);

    logger.info('Failure archived', { projectId, archivedBy: auth.claims.upn });
    return successResponse({ message: 'Failure archived', projectId });
  }, { domain: 'provisioningSaga', operation: 'archiveFailure' })),
});

/**
 * W0-G4-T04 POST /api/provisioning-escalation-ack/{projectId}
 * Acknowledges an escalation by clearing the escalation markers. Admin-only.
 */
app.http('acknowledgeEscalation', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provisioning-escalation-ack/{projectId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);
    const projectId = request.params.projectId;

    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'Missing projectId parameter', requestId);
    if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
      return forbiddenResponse('Admin role required', requestId);
    }

    const services = createServiceFactory();
    const status = await services.tableStorage.getProvisioningStatus(projectId);
    if (!status) return notFoundResponse('ProvisioningStatus', projectId, requestId);

    status.escalatedBy = undefined;
    status.escalatedAt = undefined;
    await services.tableStorage.upsertProvisioningStatus(status);

    logger.info('Escalation acknowledged', { projectId, acknowledgedBy: auth.claims.upn });
    return successResponse({ message: 'Escalation acknowledged', projectId });
  }, { domain: 'provisioningSaga', operation: 'acknowledgeEscalation' })),
});

const VALID_PROVISIONING_STATES = new Set([
  'NotStarted', 'InProgress', 'BaseComplete', 'Completed', 'Failed', 'WebPartsPending',
]);

/**
 * W0-G4-T04 POST /api/provisioning-force-state/{projectId}
 * Forces a provisioning run into a specific state. Admin expert-tier only.
 */
app.http('forceStateTransition', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provisioning-force-state/{projectId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);
    const projectId = request.params.projectId;

    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'Missing projectId parameter', requestId);
    if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
      return forbiddenResponse('Admin role required', requestId);
    }

    const body = (await request.json()) as { targetState?: string };
    if (!body.targetState || !VALID_PROVISIONING_STATES.has(body.targetState)) {
      return errorResponse(400, 'VALIDATION_ERROR', `targetState must be one of: ${[...VALID_PROVISIONING_STATES].join(', ')}`, requestId);
    }

    const services = createServiceFactory();
    const status = await services.tableStorage.getProvisioningStatus(projectId);
    if (!status) return notFoundResponse('ProvisioningStatus', projectId, requestId);

    const fromState = status.overallStatus;
    status.overallStatus = body.targetState as IProvisioningStatus['overallStatus'];

    if (body.targetState === 'Completed') status.completedAt = new Date().toISOString();
    if (body.targetState === 'Failed') status.failedAt = new Date().toISOString();

    await services.tableStorage.upsertProvisioningStatus(status);

    logger.warn('Manual state override applied', {
      projectId,
      from: fromState,
      to: body.targetState,
      overriddenBy: auth.claims.upn,
    });
    return successResponse({ message: `State overridden: ${fromState} → ${body.targetState}`, projectId });
  }, { domain: 'provisioningSaga', operation: 'forceStateTransition' })),
});
