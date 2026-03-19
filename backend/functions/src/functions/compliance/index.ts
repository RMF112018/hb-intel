import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IComplianceEntry } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects/{projectId}/compliance/entries
 */
app.http('getComplianceEntries', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.compliance.listEntries(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/compliance/entries/{id}
 */
app.http('getComplianceEntryById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const entry = await services.compliance.getEntryById(id);
      if (!entry) return { status: 404, jsonBody: { message: 'Compliance entry not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: entry } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/compliance/entries
 */
app.http('createComplianceEntry', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IComplianceEntry>;
    try { body = (await request.json()) as Partial<IComplianceEntry>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.vendorName || !body.requirementType || !body.status || !body.expirationDate) {
      return { status: 400, jsonBody: { message: 'vendorName, requirementType, status, and expirationDate are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const entry = await services.compliance.createEntry({
        projectId,
        vendorName: body.vendorName,
        requirementType: body.requirementType,
        status: body.status,
        expirationDate: body.expirationDate,
      });
      logger.info('Compliance entry created', { id: entry.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: entry } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/compliance/entries/{id}
 */
app.http('updateComplianceEntry', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IComplianceEntry>;
    try { body = (await request.json()) as Partial<IComplianceEntry>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.compliance.updateEntry(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'Compliance entry not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/compliance/entries/{id}
 */
app.http('deleteComplianceEntry', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.compliance.deleteEntry(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/compliance/summary
 */
app.http('getComplianceSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/summary',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const summary = await services.compliance.getSummary(projectId);
      return { status: 200, jsonBody: { data: summary } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
