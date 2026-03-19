import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IGoNoGoScorecard } from '@hbc/models';
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

/**
 * GET /api/projects/{projectId}/scorecards
 */
app.http('getScorecards', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.scorecards.listScorecards(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/scorecards/{id}
 */
app.http('getScorecardById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const scorecard = await services.scorecards.getScorecardById(id);
      if (!scorecard) return notFoundResponse('Scorecard', String(id), requestId);
      return successResponse(scorecard);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * POST /api/projects/{projectId}/scorecards
 */
app.http('createScorecard', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IGoNoGoScorecard>;
    try { body = (await request.json()) as Partial<IGoNoGoScorecard>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (body.version === undefined || body.overallScore === undefined || !body.recommendation) {
      return errorResponse(400, 'VALIDATION_ERROR', 'version, overallScore, and recommendation are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const scorecard = await services.scorecards.createScorecard({
        projectId,
        version: body.version,
        overallScore: body.overallScore,
        recommendation: body.recommendation,
      });
      logger.info('Scorecard created', { id: scorecard.id, projectId, by: auth.claims.upn });
      return successResponse(scorecard, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * PUT /api/projects/{projectId}/scorecards/{id}
 */
app.http('updateScorecard', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IGoNoGoScorecard>;
    try { body = (await request.json()) as Partial<IGoNoGoScorecard>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.scorecards.updateScorecard(id, body);
      if (!updated) return notFoundResponse('Scorecard', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * DELETE /api/projects/{projectId}/scorecards/{id}
 */
app.http('deleteScorecard', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.scorecards.deleteScorecard(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/scorecards/{scorecardId}/versions
 */
app.http('getScorecardVersions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{scorecardId}/versions',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const scorecardId = parseInt(request.params.scorecardId, 10);
    if (isNaN(scorecardId)) return errorResponse(400, 'VALIDATION_ERROR', 'scorecardId must be a number', requestId);

    try {
      const services = createServiceFactory();
      const versions = await services.scorecards.getVersions(scorecardId);
      return successResponse(versions);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});
