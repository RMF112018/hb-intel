import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IBuyoutEntry } from '@hbc/models';
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
 * GET /api/projects/{projectId}/buyout/entries
 */
app.http('getBuyoutEntries', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.buyout.listEntries(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/buyout/entries/{id}
 */
app.http('getBuyoutEntryById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const entry = await services.buyout.getEntryById(id);
      if (!entry) return notFoundResponse('BuyoutEntry', String(id), requestId);
      return successResponse(entry);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * POST /api/projects/{projectId}/buyout/entries
 */
app.http('createBuyoutEntry', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IBuyoutEntry>;
    try { body = (await request.json()) as Partial<IBuyoutEntry>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.costCode || !body.description || body.budgetAmount === undefined || body.committedAmount === undefined || !body.status) {
      return errorResponse(400, 'VALIDATION_ERROR', 'costCode, description, budgetAmount, committedAmount, and status are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const entry = await services.buyout.createEntry({
        projectId,
        costCode: body.costCode,
        description: body.description,
        budgetAmount: body.budgetAmount,
        committedAmount: body.committedAmount,
        status: body.status,
      });
      logger.info('Buyout entry created', { id: entry.id, projectId, by: auth.claims.upn });
      return successResponse(entry, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * PUT /api/projects/{projectId}/buyout/entries/{id}
 */
app.http('updateBuyoutEntry', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IBuyoutEntry>;
    try { body = (await request.json()) as Partial<IBuyoutEntry>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.buyout.updateEntry(id, body);
      if (!updated) return notFoundResponse('BuyoutEntry', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * DELETE /api/projects/{projectId}/buyout/entries/{id}
 */
app.http('deleteBuyoutEntry', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.buyout.deleteEntry(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/buyout/summary
 */
app.http('getBuyoutSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/summary',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    try {
      const services = createServiceFactory();
      const summary = await services.buyout.getSummary(projectId);
      return successResponse(summary);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});
