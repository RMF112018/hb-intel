import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IProjectManagementPlan, IPMPSignature } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

/**
 * GET /api/projects/{projectId}/pmp/plans
 */
app.http('getPmpPlans', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.pmp.listPlans(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/pmp/plans/{id}
 */
app.http('getPmpPlanById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const plan = await services.pmp.getPlanById(id);
      if (!plan) return { status: 404, jsonBody: { message: 'PMP plan not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: plan } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/pmp/plans
 */
app.http('createPmpPlan', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IProjectManagementPlan>;
    try { body = (await request.json()) as Partial<IProjectManagementPlan>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (body.version === undefined || !body.status) {
      return { status: 400, jsonBody: { message: 'version and status are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const plan = await services.pmp.createPlan({
        projectId,
        version: body.version,
        status: body.status,
      });
      logger.info('PMP plan created', { id: plan.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: plan } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/pmp/plans/{id}
 */
app.http('updatePmpPlan', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IProjectManagementPlan>;
    try { body = (await request.json()) as Partial<IProjectManagementPlan>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.pmp.updatePlan(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'PMP plan not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/pmp/plans/{id}
 */
app.http('deletePmpPlan', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.pmp.deletePlan(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PMP Signatures Sub-Resource
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/projects/{projectId}/pmp/plans/{pmpId}/signatures
 */
app.http('getPmpSignatures', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{pmpId}/signatures',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const pmpId = parseInt(request.params.pmpId, 10);
    if (isNaN(pmpId)) return { status: 400, jsonBody: { message: 'pmpId must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const signatures = await services.pmp.getSignatures(pmpId);
      return { status: 200, jsonBody: { data: signatures } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/pmp/plans/{pmpId}/signatures
 */
app.http('createPmpSignature', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{pmpId}/signatures',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const pmpId = parseInt(request.params.pmpId, 10);
    if (isNaN(pmpId)) return { status: 400, jsonBody: { message: 'pmpId must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IPMPSignature>;
    try { body = (await request.json()) as Partial<IPMPSignature>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.signerName || !body.role || !body.signedAt || !body.status) {
      return { status: 400, jsonBody: { message: 'signerName, role, signedAt, and status are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const signature = await services.pmp.createSignature({
        pmpId,
        signerName: body.signerName,
        role: body.role,
        signedAt: body.signedAt,
        status: body.status,
      });
      logger.info('PMP signature created', { id: signature.id, pmpId, by: claims.upn });
      return { status: 201, jsonBody: { data: signature } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
