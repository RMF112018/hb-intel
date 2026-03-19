import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { ILeadFormData } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/leads
 * Paginated list; supports ?q= for search, ?page= and ?pageSize= for pagination.
 */
app.http('getLeads', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'leads',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));
    const q = request.query.get('q') ?? '';

    try {
      const services = createServiceFactory();
      const result = q
        ? await services.leads.search(q, page, pageSize)
        : await services.leads.list(page, pageSize);

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
 * GET /api/leads/{id}
 */
app.http('getLeadById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'leads/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const lead = await services.leads.getById(id);
      if (!lead) {
        return { status: 404, jsonBody: { message: 'Lead not found', code: 'NOT_FOUND' } };
      }
      return { status: 200, jsonBody: { data: lead } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * POST /api/leads
 */
app.http('createLead', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'leads',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let body: Partial<ILeadFormData>;
    try {
      body = (await request.json()) as Partial<ILeadFormData>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.title || !body.stage || !body.clientName || body.estimatedValue === undefined) {
      return {
        status: 400,
        jsonBody: { message: 'title, stage, clientName, and estimatedValue are required', code: 'VALIDATION_ERROR' },
      };
    }

    try {
      const services = createServiceFactory();
      const lead = await services.leads.create(body as ILeadFormData);
      logger.info('Lead created', { id: lead.id, by: claims.upn });
      return { status: 201, jsonBody: { data: lead } };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});

/**
 * PUT /api/leads/{id}
 */
app.http('updateLead', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'leads/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };
    }

    let body: Partial<ILeadFormData>;
    try {
      body = (await request.json()) as Partial<ILeadFormData>;
    } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.leads.update(id, body);
      if (!updated) {
        return { status: 404, jsonBody: { message: 'Lead not found', code: 'NOT_FOUND' } };
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
 * DELETE /api/leads/{id}
 */
app.http('deleteLead', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'leads/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) {
      return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      await services.leads.delete(id);
      return { status: 204 };
    } catch {
      return {
        status: 500,
        jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() },
      };
    }
  },
});
