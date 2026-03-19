import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProjectManagementPlan, IPMPSignature } from '@hbc/models';
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
import { withTelemetry } from '../../utils/withTelemetry.js';

/**
 * GET /api/projects/{projectId}/pmp/plans
 */
app.http('getPmpPlans', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.pmp.listPlans(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'getPmpPlans' })),
});

/**
 * GET /api/projects/{projectId}/pmp/plans/{id}
 */
app.http('getPmpPlanById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const plan = await services.pmp.getPlanById(id);
      if (!plan) return notFoundResponse('PmpPlan', String(id), requestId);
      return successResponse(plan);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'getPmpPlanById' })),
});

/**
 * POST /api/projects/{projectId}/pmp/plans
 */
app.http('createPmpPlan', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IProjectManagementPlan>;
    try { body = (await request.json()) as Partial<IProjectManagementPlan>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (body.version === undefined || !body.status) {
      return errorResponse(400, 'VALIDATION_ERROR', 'version and status are required', requestId);
    }

    try {
      const services = createServiceFactory();
      const plan = await services.pmp.createPlan({
        projectId,
        version: body.version,
        status: body.status,
      });
      logger.info('PMP plan created', { id: plan.id, projectId, by: auth.claims.upn });
      return successResponse(plan, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'createPmpPlan' })),
});

/**
 * PUT /api/projects/{projectId}/pmp/plans/{id}
 */
app.http('updatePmpPlan', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IProjectManagementPlan>;
    try { body = (await request.json()) as Partial<IProjectManagementPlan>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.pmp.updatePlan(id, body);
      if (!updated) return notFoundResponse('PmpPlan', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'updatePmpPlan' })),
});

/**
 * DELETE /api/projects/{projectId}/pmp/plans/{id}
 */
app.http('deletePmpPlan', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.pmp.deletePlan(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'deletePmpPlan' })),
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
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const pmpId = parseInt(request.params.pmpId, 10);
    if (isNaN(pmpId)) return errorResponse(400, 'VALIDATION_ERROR', 'pmpId must be a number', requestId);

    try {
      const services = createServiceFactory();
      const signatures = await services.pmp.getSignatures(pmpId);
      return successResponse(signatures);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'getPmpSignatures' })),
});

/**
 * POST /api/projects/{projectId}/pmp/plans/{pmpId}/signatures
 */
app.http('createPmpSignature', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/pmp/plans/{pmpId}/signatures',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const pmpId = parseInt(request.params.pmpId, 10);
    if (isNaN(pmpId)) return errorResponse(400, 'VALIDATION_ERROR', 'pmpId must be a number', requestId);

    let body: Partial<IPMPSignature>;
    try { body = (await request.json()) as Partial<IPMPSignature>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.signerName || !body.role || !body.signedAt || !body.status) {
      return errorResponse(400, 'VALIDATION_ERROR', 'signerName, role, signedAt, and status are required', requestId);
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
      logger.info('PMP signature created', { id: signature.id, pmpId, by: auth.claims.upn });
      return successResponse(signature, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'pmp', operation: 'createPmpSignature' })),
});
