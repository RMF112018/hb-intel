import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IRiskCostItem } from '@hbc/models';
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
 * GET /api/projects/{projectId}/risk/items
 */
app.http('getRiskItems', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.risk.listItems(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/risk/items/{id}
 */
app.http('getRiskItemById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const item = await services.risk.getItemById(id);
      if (!item) return notFoundResponse('RiskItem', String(id), requestId);
      return successResponse(item);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * POST /api/projects/{projectId}/risk/items
 */
app.http('createRiskItem', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IRiskCostItem>;
    try { body = (await request.json()) as Partial<IRiskCostItem>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.description || !body.category || body.estimatedImpact === undefined || body.probability === undefined || !body.status) {
      return errorResponse(400, 'VALIDATION_ERROR', 'description, category, estimatedImpact, probability, and status are required', requestId);
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
      logger.info('Risk item created', { id: item.id, projectId, by: auth.claims.upn });
      return successResponse(item, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * PUT /api/projects/{projectId}/risk/items/{id}
 */
app.http('updateRiskItem', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IRiskCostItem>;
    try { body = (await request.json()) as Partial<IRiskCostItem>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.risk.updateItem(id, body);
      if (!updated) return notFoundResponse('RiskItem', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * DELETE /api/projects/{projectId}/risk/items/{id}
 */
app.http('deleteRiskItem', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/items/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.risk.deleteItem(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/risk/management
 */
app.http('getRiskManagement', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/risk/management',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    try {
      const services = createServiceFactory();
      const management = await services.risk.getManagement(projectId);
      return successResponse(management);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});
