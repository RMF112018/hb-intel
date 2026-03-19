import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IEstimatingTracker, IEstimatingKickoff } from '@hbc/models';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
} from '../../utils/response-helpers.js';

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
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.estimating.listTrackers(page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/estimating/trackers/{id}
 */
app.http('getTrackerById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    try {
      const services = createServiceFactory();
      const tracker = await services.estimating.getTrackerById(id);
      if (!tracker) {
        return notFoundResponse('Tracker', String(id), requestId);
      }
      return successResponse(tracker);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * POST /api/estimating/trackers
 */
app.http('createTracker', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'estimating/trackers',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    let body: Partial<IEstimatingTracker>;
    try {
      body = (await request.json()) as Partial<IEstimatingTracker>;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.projectId || !body.bidNumber || !body.status || !body.dueDate) {
      return errorResponse(400, 'VALIDATION_ERROR', 'projectId, bidNumber, status, and dueDate are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const tracker = await services.estimating.createTracker({
        projectId: body.projectId,
        bidNumber: body.bidNumber,
        status: body.status,
        dueDate: body.dueDate,
      });
      logger.info('Tracker created', { id: tracker.id, by: auth.claims.upn });
      return successResponse(tracker, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * PUT /api/estimating/trackers/{id}
 */
app.http('updateTracker', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    let body: Partial<IEstimatingTracker>;
    try {
      body = (await request.json()) as Partial<IEstimatingTracker>;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.estimating.updateTracker(id, body);
      if (!updated) {
        return notFoundResponse('Tracker', String(id), requestId);
      }
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * DELETE /api/estimating/trackers/{id}
 */
app.http('deleteTracker', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    try {
      const services = createServiceFactory();
      await services.estimating.deleteTracker(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
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
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.query.get('projectId');
    if (!projectId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'projectId query parameter is required', requestId);
    }

    try {
      const services = createServiceFactory();
      const kickoff = await services.estimating.getKickoff(projectId);
      if (!kickoff) {
        return notFoundResponse('EstimatingKickoff', projectId, requestId);
      }
      return successResponse(kickoff);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * POST /api/estimating/kickoffs
 */
app.http('createKickoff', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'estimating/kickoffs',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    let body: Partial<IEstimatingKickoff>;
    try {
      body = (await request.json()) as Partial<IEstimatingKickoff>;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.projectId || !body.kickoffDate || !Array.isArray(body.attendees) || !body.notes) {
      return errorResponse(400, 'VALIDATION_ERROR', 'projectId, kickoffDate, attendees (array), and notes are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const kickoff = await services.estimating.createKickoff({
        projectId: body.projectId,
        kickoffDate: body.kickoffDate,
        attendees: body.attendees,
        notes: body.notes,
      });
      logger.info('Kickoff created', { projectId: kickoff.projectId, by: auth.claims.upn });
      return successResponse(kickoff, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});
