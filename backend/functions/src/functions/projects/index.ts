import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IActiveProject } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects
 * Paginated list of projects.
 */
app.http('getProjects', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects',
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
      const result = await services.projects.list(page, pageSize);
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
 * GET /api/projects/summary
 * Portfolio summary aggregate.
 * CRITICAL: Must be registered BEFORE getProjectById to prevent {id} wildcard shadowing.
 */
app.http('getPortfolioSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/summary',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    try {
      const services = createServiceFactory();
      const summary = await services.projects.getPortfolioSummary();
      return { status: 200, jsonBody: { data: summary } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * GET /api/projects/{id}
 * Single project by UUID.
 */
app.http('getProjectById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = request.params.id;
    if (!id) {
      return { status: 400, jsonBody: { message: 'id is required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const project = await services.projects.getById(id);
      if (!project) {
        return { status: 404, jsonBody: { message: 'Project not found', code: 'NOT_FOUND' } };
      }
      return { status: 200, jsonBody: { data: project } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * POST /api/projects
 */
app.http('createProject', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let body: Partial<IActiveProject>;
    try {
      body = (await request.json()) as Partial<IActiveProject>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.name || !body.number || !body.status || !body.startDate || !body.endDate) {
      return {
        status: 400,
        jsonBody: { message: 'name, number, status, startDate, and endDate are required', code: 'VALIDATION_ERROR' },
      };
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
      logger.info('Project created', { id: project.id, by: claims.upn });
      return { status: 201, jsonBody: { data: project } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * PUT /api/projects/{id}
 */
app.http('updateProject', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = request.params.id;
    if (!id) {
      return { status: 400, jsonBody: { message: 'id is required', code: 'VALIDATION_ERROR' } };
    }

    let body: Partial<IActiveProject>;
    try {
      body = (await request.json()) as Partial<IActiveProject>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.projects.update(id, body);
      if (!updated) {
        return { status: 404, jsonBody: { message: 'Project not found', code: 'NOT_FOUND' } };
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
 * DELETE /api/projects/{id}
 */
app.http('deleteProject', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = request.params.id;
    if (!id) {
      return { status: 400, jsonBody: { message: 'id is required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      await services.projects.delete(id);
      return { status: 204 };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});
