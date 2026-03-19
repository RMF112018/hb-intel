import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'node:crypto';
import type { IContractInfo, ICommitmentApproval } from '@hbc/models';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

// ═══════════════════════════════════════════════════════════════════════════
// Contract CRUD: /api/projects/{projectId}/contracts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/projects/{projectId}/contracts
 */
app.http('getContracts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.contracts.listContracts(projectId, page, pageSize);
      return { status: 200, jsonBody: { items: result.items, total: result.total, page, pageSize } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * GET /api/projects/{projectId}/contracts/{id}
 */
app.http('getContractById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const contract = await services.contracts.getContractById(id);
      if (!contract) return { status: 404, jsonBody: { message: 'Contract not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: contract } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/contracts
 */
app.http('createContract', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const projectId = request.params.projectId;
    if (!projectId) return { status: 400, jsonBody: { message: 'projectId is required', code: 'VALIDATION_ERROR' } };

    let body: Partial<IContractInfo>;
    try { body = (await request.json()) as Partial<IContractInfo>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.contractNumber || !body.vendorName || body.amount === undefined || !body.status || body.executedDate === undefined) {
      return { status: 400, jsonBody: { message: 'contractNumber, vendorName, amount, status, and executedDate are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const contract = await services.contracts.createContract({
        projectId,
        contractNumber: body.contractNumber,
        vendorName: body.vendorName,
        amount: body.amount,
        status: body.status,
        executedDate: body.executedDate,
      });
      logger.info('Contract created', { id: contract.id, projectId, by: claims.upn });
      return { status: 201, jsonBody: { data: contract } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * PUT /api/projects/{projectId}/contracts/{id}
 */
app.http('updateContract', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<IContractInfo>;
    try { body = (await request.json()) as Partial<IContractInfo>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const updated = await services.contracts.updateContract(id, body);
      if (!updated) return { status: 404, jsonBody: { message: 'Contract not found', code: 'NOT_FOUND' } };
      return { status: 200, jsonBody: { data: updated } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * DELETE /api/projects/{projectId}/contracts/{id}
 */
app.http('deleteContract', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return { status: 400, jsonBody: { message: 'id must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      await services.contracts.deleteContract(id);
      return { status: 204 };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// Contract Approvals Sub-Resource
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/projects/{projectId}/contracts/{contractId}/approvals
 */
app.http('getContractApprovals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{contractId}/approvals',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try { await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const contractId = parseInt(request.params.contractId, 10);
    if (isNaN(contractId)) return { status: 400, jsonBody: { message: 'contractId must be a number', code: 'VALIDATION_ERROR' } };

    try {
      const services = createServiceFactory();
      const approvals = await services.contracts.getApprovals(contractId);
      return { status: 200, jsonBody: { data: approvals } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});

/**
 * POST /api/projects/{projectId}/contracts/{contractId}/approvals
 */
app.http('createContractApproval', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{contractId}/approvals',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }

    const contractId = parseInt(request.params.contractId, 10);
    if (isNaN(contractId)) return { status: 400, jsonBody: { message: 'contractId must be a number', code: 'VALIDATION_ERROR' } };

    let body: Partial<ICommitmentApproval>;
    try { body = (await request.json()) as Partial<ICommitmentApproval>; } catch {
      return { status: 400, jsonBody: { message: 'Invalid JSON body', code: 'VALIDATION_ERROR' } };
    }

    if (!body.approverName || !body.approvedAt || !body.status || body.notes === undefined) {
      return { status: 400, jsonBody: { message: 'approverName, approvedAt, status, and notes are required', code: 'VALIDATION_ERROR' } };
    }

    try {
      const services = createServiceFactory();
      const approval = await services.contracts.createApproval({
        contractId,
        approverName: body.approverName,
        approvedAt: body.approvedAt,
        status: body.status,
        notes: body.notes,
      });
      logger.info('Contract approval created', { id: approval.id, contractId, by: claims.upn });
      return { status: 201, jsonBody: { data: approval } };
    } catch {
      return { status: 500, jsonBody: { message: 'Internal server error', code: 'INTERNAL_ERROR', requestId: randomUUID() } };
    }
  },
});
