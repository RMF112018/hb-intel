import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IBuyoutEntry } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects/{projectId}/buyout/entries
 */
app.http('getBuyoutEntries', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.buyout.listEntries(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/buyout/entries/{id}
 */
app.http('getBuyoutEntryById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const entry = await services.buyout.getEntryById(id);
      if (!entry) return { status: 404, jsonBody: { message: 'Buyout entry not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: entry } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/buyout/entries
 */
app.http('createBuyoutEntry', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IBuyoutEntry>;
    try { body = (await request.json()) as Partial<IBuyoutEntry>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.costCode || !body.description || body.budgetAmount === undefined || body.committedAmount === undefined || !body.status) {
      return { status: 400, jsonBody: { message: 'costCode, description, budgetAmount, committedAmount, and status are required', code: 'VALIDATION_ERROR' } };
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
      logger.info('Buyout entry created', { id: entry.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: entry } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/buyout/entries/{id}
 */
app.http('updateBuyoutEntry', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IBuyoutEntry>;
    try { body = (await request.json()) as Partial<IBuyoutEntry>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.buyout.updateEntry(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'Buyout entry not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/buyout/entries/{id}
 */
app.http('deleteBuyoutEntry', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/entries/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.buyout.deleteEntry(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/buyout/summary
 */
app.http('getBuyoutSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/buyout/summary',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const summary = await services.buyout.getSummary(projectId);
      return { status: 200, jsonBody: { data: summary } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
