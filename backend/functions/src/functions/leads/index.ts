import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { parseBody } from '../../middleware/validate.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
} from '../../utils/response-helpers.js';
import type { ILeadFormData } from '@hbc/models';
import { CreateLeadSchema, UpdateLeadSchema } from '../../validation/schemas/index.js';

/**
 * GET /api/leads
 * Paginated list; supports ?q= for search, ?page= and ?pageSize= for pagination.
 */
app.http('getLeads', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'leads',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));
    const q = request.query.get('q') ?? '';

    try {
      const services = createServiceFactory();
      const result = q
        ? await services.leads.search(q, page, pageSize)
        : await services.leads.list(page, pageSize);

      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'leads', operation: 'getLeads' })),
});

/**
 * GET /api/leads/{id}
 */
app.http('getLeadById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'leads/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    try {
      const services = createServiceFactory();
      const lead = await services.leads.getById(id);
      if (!lead) {
        return notFoundResponse('Lead', String(id), requestId);
      }
      return successResponse(lead);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'leads', operation: 'getLeadById' })),
});

/**
 * POST /api/leads
 */
app.http('createLead', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'leads',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const parsed = await parseBody(request, CreateLeadSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    try {
      const services = createServiceFactory();
      const lead = await services.leads.create(body as ILeadFormData);
      logger.info('Lead created', { id: lead.id, by: auth.claims.upn });
      return successResponse(lead, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'leads', operation: 'createLead' })),
});

/**
 * PUT /api/leads/{id}
 */
app.http('updateLead', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'leads/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    const parsed = await parseBody(request, UpdateLeadSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    try {
      const services = createServiceFactory();
      const updated = await services.leads.update(id, body as Partial<ILeadFormData>);
      if (!updated) {
        return notFoundResponse('Lead', String(id), requestId);
      }
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'leads', operation: 'updateLead' })),
});

/**
 * DELETE /api/leads/{id}
 */
app.http('deleteLead', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'leads/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);
    }

    try {
      const services = createServiceFactory();
      await services.leads.delete(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'leads', operation: 'deleteLead' })),
});
