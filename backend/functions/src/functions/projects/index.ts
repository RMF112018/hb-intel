import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IActiveProject } from '@hbc/models';
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
 * GET /api/projects
 * Paginated list of projects.
 */
app.http('getProjects', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.projects.list(page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'projects', operation: 'getProjects' })),
});

/**
 * GET /api/projects/summary
 * Portfolio summary aggregate.
 * CRITICAL: Must be registered BEFORE getProjectById to prevent {id} wildcard shadowing.
 */
app.http('getPortfolioSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/summary',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    try {
      const services = createServiceFactory();
      const summary = await services.projects.getPortfolioSummary();
      return successResponse(summary);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'projects', operation: 'getPortfolioSummary' })),
});

/**
 * GET /api/projects/{id}
 * Single project by UUID.
 */
app.http('getProjectById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = request.params.id;
    if (!id) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id is required', requestId);
    }

    try {
      const services = createServiceFactory();
      const project = await services.projects.getById(id);
      if (!project) {
        return notFoundResponse('Project', id, requestId);
      }
      return successResponse(project);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'projects', operation: 'getProjectById' })),
});

/**
 * POST /api/projects
 */
app.http('createProject', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    let body: Partial<IActiveProject>;
    try {
      body = (await request.json()) as Partial<IActiveProject>;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.name || !body.number || !body.status || !body.startDate || !body.endDate) {
      return errorResponse(400, 'VALIDATION_ERROR', 'name, number, status, startDate, and endDate are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const project = await services.projects.create({
        name: body.name,
        number: body.number,
        status: body.status,
        startDate: body.startDate,
        endDate: body.endDate,
      });
      logger.info('Project created', { id: project.id, by: auth.claims.upn });
      return successResponse(project, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'projects', operation: 'createProject' })),
});

/**
 * PUT /api/projects/{id}
 */
app.http('updateProject', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = request.params.id;
    if (!id) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id is required', requestId);
    }

    let body: Partial<IActiveProject>;
    try {
      body = (await request.json()) as Partial<IActiveProject>;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.projects.update(id, body);
      if (!updated) {
        return notFoundResponse('Project', id, requestId);
      }
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'projects', operation: 'updateProject' })),
});

/**
 * DELETE /api/projects/{id}
 */
app.http('deleteProject', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = request.params.id;
    if (!id) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id is required', requestId);
    }

    try {
      const services = createServiceFactory();
      await services.projects.delete(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'projects', operation: 'deleteProject' })),
});
