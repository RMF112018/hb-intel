import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IGoNoGoScorecard } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects/{projectId}/scorecards
 */
app.http('getScorecards', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.scorecards.listScorecards(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/scorecards/{id}
 */
app.http('getScorecardById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const scorecard = await services.scorecards.getScorecardById(id);
      if (!scorecard) return { status: 404, jsonBody: { message: 'Scorecard not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: scorecard } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/scorecards
 */
app.http('createScorecard', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IGoNoGoScorecard>;
    try { body = (await request.json()) as Partial<IGoNoGoScorecard>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (body.version === undefined || body.overallScore === undefined || !body.recommendation) {
      return { status: 400, jsonBody: { message: 'version, overallScore, and recommendation are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const scorecard = await services.scorecards.createScorecard({
        projectId,
        version: body.version,
        overallScore: body.overallScore,
        recommendation: body.recommendation,
      });
      logger.info('Scorecard created', { id: scorecard.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: scorecard } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/scorecards/{id}
 */
app.http('updateScorecard', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IGoNoGoScorecard>;
    try { body = (await request.json()) as Partial<IGoNoGoScorecard>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.scorecards.updateScorecard(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'Scorecard not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/scorecards/{id}
 */
app.http('deleteScorecard', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.scorecards.deleteScorecard(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/scorecards/{scorecardId}/versions
 */
app.http('getScorecardVersions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/scorecards/{scorecardId}/versions',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const scorecardId = parseInt(request.params.scorecardId, 10);
    if (isNaN(scorecardId)) return { status: 400, jsonBody: { message: 'scorecardId must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const versions = await services.scorecards.getVersions(scorecardId);
      return { status: 200, jsonBody: { data: versions } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
