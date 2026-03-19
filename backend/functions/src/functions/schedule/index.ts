import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IScheduleActivity } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects/{projectId}/schedule/activities
 */
app.http('getScheduleActivities', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.schedule.listActivities(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/schedule/activities/{id}
 */
app.http('getScheduleActivityById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const activity = await services.schedule.getActivityById(id);
      if (!activity) return { status: 404, jsonBody: { message: 'Activity not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: activity } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/schedule/activities
 */
app.http('createScheduleActivity', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IScheduleActivity>;
    try { body = (await request.json()) as Partial<IScheduleActivity>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.name || !body.startDate || !body.endDate || body.percentComplete === undefined || body.isCriticalPath === undefined) {
      return { status: 400, jsonBody: { message: 'name, startDate, endDate, percentComplete, and isCriticalPath are required', code: 'VALIDATION_ERROR' } };
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
      logger.info('Schedule activity created', { id: activity.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: activity } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/schedule/activities/{id}
 */
app.http('updateScheduleActivity', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IScheduleActivity>;
    try { body = (await request.json()) as Partial<IScheduleActivity>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.schedule.updateActivity(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'Activity not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/schedule/activities/{id}
 */
app.http('deleteScheduleActivity', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/activities/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.schedule.deleteActivity(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/schedule/metrics
 */
app.http('getScheduleMetrics', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/schedule/metrics',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const metrics = await services.schedule.getMetrics(projectId);
      return { status: 200, jsonBody: { data: metrics } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
