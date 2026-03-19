import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IContractInfo, ICommitmentApproval } from '@hbc/models';
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
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));

    try {
      const services = createServiceFactory();
      const result = await services.contracts.listContracts(projectId, page, pageSize);
      return listResponse(result.items, result.total, page, pageSize, requestId);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'getContracts' })),
});

/**
 * GET /api/projects/{projectId}/contracts/{id}
 */
app.http('getContractById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      const contract = await services.contracts.getContractById(id);
      if (!contract) return notFoundResponse('Contract', String(id), requestId);
      return successResponse(contract);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'getContractById' })),
});

/**
 * POST /api/projects/{projectId}/contracts
 */
app.http('createContract', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.params.projectId;
    if (!projectId) return errorResponse(400, 'VALIDATION_ERROR', 'projectId is required', requestId);

    let body: Partial<IContractInfo>;
    try { body = (await request.json()) as Partial<IContractInfo>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.contractNumber || !body.vendorName || body.amount === undefined || !body.status || body.executedDate === undefined) {
      return errorResponse(400, 'VALIDATION_ERROR', 'contractNumber, vendorName, amount, status, and executedDate are required', requestId);
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
      logger.info('Contract created', { id: contract.id, projectId, by: auth.claims.upn });
      return successResponse(contract, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'createContract' })),
});

/**
 * PUT /api/projects/{projectId}/contracts/{id}
 */
app.http('updateContract', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    let body: Partial<IContractInfo>;
    try { body = (await request.json()) as Partial<IContractInfo>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    try {
      const services = createServiceFactory();
      const updated = await services.contracts.updateContract(id, body);
      if (!updated) return notFoundResponse('Contract', String(id), requestId);
      return successResponse(updated);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'updateContract' })),
});

/**
 * DELETE /api/projects/{projectId}/contracts/{id}
 */
app.http('deleteContract', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{id}',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const id = parseInt(request.params.id, 10);
    if (isNaN(id)) return errorResponse(400, 'VALIDATION_ERROR', 'id must be a number', requestId);

    try {
      const services = createServiceFactory();
      await services.contracts.deleteContract(id);
      return { status: 204 };
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'deleteContract' })),
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
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const contractId = parseInt(request.params.contractId, 10);
    if (isNaN(contractId)) return errorResponse(400, 'VALIDATION_ERROR', 'contractId must be a number', requestId);

    try {
      const services = createServiceFactory();
      const approvals = await services.contracts.getApprovals(contractId);
      return successResponse(approvals);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'getContractApprovals' })),
});

/**
 * POST /api/projects/{projectId}/contracts/{contractId}/approvals
 */
app.http('createContractApproval', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/contracts/{contractId}/approvals',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    const contractId = parseInt(request.params.contractId, 10);
    if (isNaN(contractId)) return errorResponse(400, 'VALIDATION_ERROR', 'contractId must be a number', requestId);

    let body: Partial<ICommitmentApproval>;
    try { body = (await request.json()) as Partial<ICommitmentApproval>; } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.approverName || !body.approvedAt || !body.status || body.notes === undefined) {
      return errorResponse(400, 'VALIDATION_ERROR', 'approverName, approvedAt, status, and notes are required', requestId);
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
      logger.info('Contract approval created', { id: approval.id, contractId, by: auth.claims.upn });
      return successResponse(approval, 201);
    } catch {
      return errorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }, { domain: 'contracts', operation: 'createContractApproval' })),
});
