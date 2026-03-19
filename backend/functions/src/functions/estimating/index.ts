import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { parseBody } from '../../middleware/validate.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
} from '../../utils/response-helpers.js';
import {
  CreateTrackerSchema,
  UpdateTrackerSchema,
  CreateKickoffSchema,
} from '../../validation/schemas/index.js';

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
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
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
  }, { domain: 'estimating', operation: 'getTrackers' })),
});

/**
 * GET /api/estimating/trackers/{id}
 */
app.http('getTrackerById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
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
  }, { domain: 'estimating', operation: 'getTrackerById' })),
});

/**
 * POST /api/estimating/trackers
 */
app.http('createTracker', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'estimating/trackers',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const parsed = await parseBody(request, CreateTrackerSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    try {
      const services = createServiceFactory();
      const tracker = await services.estimating.createTracker(body);
      logger.info('Tracker created', { id: tracker.id, by: auth.claims.upn });
      return successResponse(tracker, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'estimating', operation: 'createTracker' })),
});

/**
 * PUT /api/estimating/trackers/{id}
 */
app.http('updateTracker', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    const parsed = await parseBody(request, UpdateTrackerSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

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
  }, { domain: 'estimating', operation: 'updateTracker' })),
});

/**
 * DELETE /api/estimating/trackers/{id}
 */
app.http('deleteTracker', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'estimating/trackers/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
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
  }, { domain: 'estimating', operation: 'deleteTracker' })),
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
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
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
  }, { domain: 'estimating', operation: 'getKickoff' })),
});

/**
 * POST /api/estimating/kickoffs
 */
app.http('createKickoff', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'estimating/kickoffs',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const parsed = await parseBody(request, CreateKickoffSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    try {
      const services = createServiceFactory();
      const kickoff = await services.estimating.createKickoff(body);
      logger.info('Kickoff created', { projectId: kickoff.projectId, by: auth.claims.upn });
      return successResponse(kickoff, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'estimating', operation: 'createKickoff' })),
});
