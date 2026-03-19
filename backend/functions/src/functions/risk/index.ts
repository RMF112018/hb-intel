import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IRiskCostItem } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects/{projectId}/risk/items
 */
app.http('getRiskItems', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.risk.listItems(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/risk/items/{id}
 */
app.http('getRiskItemById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const item = await services.risk.getItemById(id);
      if (!item) return { status: 404, jsonBody: { message: 'Risk item not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: item } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/risk/items
 */
app.http('createRiskItem', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IRiskCostItem>;
    try { body = (await request.json()) as Partial<IRiskCostItem>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.description || !body.category || body.estimatedImpact === undefined || body.probability === undefined || !body.status) {
      return { status: 400, jsonBody: { message: 'description, category, estimatedImpact, probability, and status are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const item = await services.risk.createItem({
        projectId,
        description: body.description,
        category: body.category,
        estimatedImpact: body.estimatedImpact,
        probability: body.probability,
        status: body.status,
      });
      logger.info('Risk item created', { id: item.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: item } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/risk/items/{id}
 */
app.http('updateRiskItem', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IRiskCostItem>;
    try { body = (await request.json()) as Partial<IRiskCostItem>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.risk.updateItem(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'Risk item not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/risk/items/{id}
 */
app.http('deleteRiskItem', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.risk.deleteItem(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/risk/management
 */
app.http('getRiskManagement', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/management',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const management = await services.risk.getManagement(projectId);
      return { status: 200, jsonBody: { data: management } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
