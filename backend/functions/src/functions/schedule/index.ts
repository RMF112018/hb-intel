import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IScheduleActivity } from '@hbc/models';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
} from '../../utils/response-helpers.js';

/**
 * GET /api/projects/{projectId}/schedule/activities
 */
app.http('getScheduleActivities', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.schedule.listActivities(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'schedule', operation: 'getScheduleActivities' })),
});

/**
 * GET /api/projects/{projectId}/schedule/activities/{id}
 */
app.http('getScheduleActivityById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const activity = await services.schedule.getActivityById(id);
      if (!activity) return notFoundResponse('Activity', String(id), requestId);
      return successResponse(activity);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'schedule', operation: 'getScheduleActivityById' })),
});

/**
 * POST /api/projects/{projectId}/schedule/activities
 */
app.http('createScheduleActivity', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IScheduleActivity>;
    try { body = (await request.json()) as Partial<IScheduleActivity>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.name || !body.startDate || !body.endDate || body.percentComplete === undefined || body.isCriticalPath === undefined) {
      return errorResponse(400, 'VALIDATION_ERROR', 'name, startDate, endDate, percentComplete, and isCriticalPath are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const activity = await services.schedule.createActivity({
        projectId,
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        percentComplete: body.percentComplete,
        isCriticalPath: body.isCriticalPath,
      });
      logger.info('Schedule activity created', { id: activity.id, projectId, by: auth.claims.upn });
      return successResponse(activity, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'schedule', operation: 'createScheduleActivity' })),
});

/**
 * PUT /api/projects/{projectId}/schedule/activities/{id}
 */
app.http('updateScheduleActivity', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IScheduleActivity>;
    try { body = (await request.json()) as Partial<IScheduleActivity>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.schedule.updateActivity(id, body);
      if (!updated) return notFoundResponse('Activity', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'schedule', operation: 'updateScheduleActivity' })),
});

/**
 * DELETE /api/projects/{projectId}/schedule/activities/{id}
 */
app.http('deleteScheduleActivity', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.schedule.deleteActivity(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'schedule', operation: 'deleteScheduleActivity' })),
});

/**
 * GET /api/projects/{projectId}/schedule/metrics
 */
app.http('getScheduleMetrics', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/metrics',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    try {
      const services = createServiceFactory();
      const metrics = await services.schedule.getMetrics(projectId);
      return successResponse(metrics);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'schedule', operation: 'getScheduleMetrics' })),
});
