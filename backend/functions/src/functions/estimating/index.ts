import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IEstimatingTracker, IEstimatingKickoff } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// Tracker Sub-Resource: /api/estimating/trackers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/estimating/trackers
 * Paginated list of estimating trackers.
 */
app.http('getTrackers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'estimating/trackers',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.estimating.listTrackers(page, pageSize);
      return {
        status: 200,
        jsonBody: { items: result.items, total: result.total, page, pageSize },
      };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * GET /api/estimating/trackers/{id}
 */
app.http('getTrackerById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const tracker = await services.estimating.getTrackerById(id);
      if (!tracker) {
        return { status: 404, jsonBody: { message: 'Tracker not found', code: 'NOT_FOUND' } };
      }
      return { status: 200, jsonBody: { data: tracker } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * POST /api/estimating/trackers
 */
app.http('createTracker', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'estimating/trackers',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let body: Partial<IEstimatingTracker>;
    try {
      body = (await request.json()) as Partial<IEstimatingTracker>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.projectId || !body.bidNumber || !body.status || !body.dueDate) {
      return {
        status: 400,
        jsonBody: { message: 'projectId, bidNumber, status, and dueDate are required', code: 'VALIDATION_ERROR' },
      };
    }

    try {
      const services = createServiceFactory();
      const tracker = await services.estimating.createTracker({
        projectId: body.projectId,
        bidNumber: body.bidNumber,
        status: body.status,
        dueDate: body.dueDate,
      });
      logger.info('Tracker created', { id: tracker.id, by: claims.upn });
      return { status: 201, jsonBody: { data: tracker } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * PUT /api/estimating/trackers/{id}
 */
app.http('updateTracker', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };
    }

    let body: Partial<IEstimatingTracker>;
    try {
      body = (await request.json()) as Partial<IEstimatingTracker>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.estimating.updateTracker(id, body);
      if (!updated) {
        return { status: 404, jsonBody: { message: 'Tracker not found', code: 'NOT_FOUND' } };
      }
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * DELETE /api/estimating/trackers/{id}
 */
app.http('deleteTracker', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      await services.estimating.deleteTracker(id);
      return { status: 204 };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// Kickoff Sub-Resource: /api/estimating/kickoffs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/estimating/kickoffs?projectId=
 * Retrieve kickoff record for a project. projectId query param is required.
 */
app.http('getKickoff', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'estimating/kickoffs',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const projectId = request.query.get('projectId');
    if (!projectId) {
      return { status: 400, jsonBody: { message: 'projectId query parameter is required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const kickoff = await services.estimating.getKickoff(projectId);
      if (!kickoff) {
        return { status: 404, jsonBody: { message: 'Kickoff not found', code: 'NOT_FOUND' } };
      }
      return { status: 200, jsonBody: { data: kickoff } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * POST /api/estimating/kickoffs
 */
app.http('createKickoff', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'estimating/kickoffs',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let body: Partial<IEstimatingKickoff>;
    try {
      body = (await request.json()) as Partial<IEstimatingKickoff>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.projectId || !body.kickoffDate || !Array.isArray(body.attendees) || !body.notes) {
      return {
        status: 400,
        jsonBody: { message: 'projectId, kickoffDate, attendees (array), and notes are required', code: 'VALIDATION_ERROR' },
      };
    }

    try {
      const services = createServiceFactory();
      const kickoff = await services.estimating.createKickoff({
        projectId: body.projectId,
        kickoffDate: body.kickoffDate,
        attendees: body.attendees,
        notes: body.notes,
      });
      logger.info('Kickoff created', { projectId: kickoff.projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: kickoff } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});
