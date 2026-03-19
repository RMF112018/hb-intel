import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IComplianceEntry } from '@hbc/models';
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
 * GET /api/projects/{projectId}/compliance/entries
 */
app.http('getComplianceEntries', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.compliance.listEntries(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/compliance/entries/{id}
 */
app.http('getComplianceEntryById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const entry = await services.compliance.getEntryById(id);
      if (!entry) return notFoundResponse('ComplianceEntry', String(id), requestId);
      return successResponse(entry);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * POST /api/projects/{projectId}/compliance/entries
 */
app.http('createComplianceEntry', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IComplianceEntry>;
    try { body = (await request.json()) as Partial<IComplianceEntry>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.vendorName || !body.requirementType || !body.status || !body.expirationDate) {
      return errorResponse(400, 'VALIDATION_ERROR', 'vendorName, requirementType, status, and expirationDate are required', requestId);
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
      logger.info('Compliance entry created', { id: entry.id, projectId, by: auth.claims.upn });
      return successResponse(entry, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * PUT /api/projects/{projectId}/compliance/entries/{id}
 */
app.http('updateComplianceEntry', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IComplianceEntry>;
    try { body = (await request.json()) as Partial<IComplianceEntry>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.compliance.updateEntry(id, body);
      if (!updated) return notFoundResponse('ComplianceEntry', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * DELETE /api/projects/{projectId}/compliance/entries/{id}
 */
app.http('deleteComplianceEntry', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/entries/{id}',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.compliance.deleteEntry(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});

/**
 * GET /api/projects/{projectId}/compliance/summary
 */
app.http('getComplianceSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/compliance/summary',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    try {
      const services = createServiceFactory();
      const summary = await services.compliance.getSummary(projectId);
      return successResponse(summary);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }),
});
