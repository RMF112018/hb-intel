import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProjectSetupRequest, IProvisionSiteRequest, ProjectSetupRequestState } from '@hbc/models';
import { randomUUID } from 'crypto';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { isValidTransition } from '../../state-machine.js';
import { createLogger } from '../../utils/logger.js';
import {
  errorResponse,
  successResponse,
  listResponse,
  notFoundResponse,
} from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { SagaOrchestrator } from '../provisioningSaga/saga-orchestrator.js';

const PROJECT_NUMBER_PATTERN = /^\d{2}-\d{3}-\d{2}$/;

/**
 * D-PH6-08 POST /api/project-setup-requests
 * Submit a new request from the Estimating workflow.
 */
app.http('submitProjectSetupRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const reqId = extractOrGenerateRequestId(request);

    const body = (await request.json()) as Partial<IProjectSetupRequest>;
    if (!body.projectName || !body.groupMembers?.length) {
      return errorResponse(400, 'VALIDATION_ERROR', 'projectName and groupMembers are required', reqId);
    }

    const services = createServiceFactory();
    const projectId = body.projectId ?? randomUUID();
    // D-PH6-08 request key alignment: Projects list schema key is ProjectId, so requestId mirrors projectId.
    const requestId = projectId;

    const newRequest: IProjectSetupRequest = {
      requestId,
      projectId,
      projectName: body.projectName,
      projectLocation: body.projectLocation ?? '',
      projectType: body.projectType ?? '',
      projectStage: body.projectStage ?? 'Pursuit',
      submittedBy: auth.claims.upn,
      submittedAt: new Date().toISOString(),
      state: 'Submitted',
      groupMembers: body.groupMembers,
      retryCount: 0,
    };

    await services.projectRequests.upsertRequest(newRequest);
    logger.info('Project setup request submitted', {
      requestId,
      projectId,
      submittedBy: auth.claims.upn,
    });

    return successResponse(newRequest, 201);
  }, { domain: 'projectRequests', operation: 'submitProjectSetupRequest' })),
});

/**
 * D-PH6-08 GET /api/project-setup-requests
 * Lists request inbox rows, optionally filtered by lifecycle state.
 */
app.http('listProjectSetupRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: withAuth(withTelemetry(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));
    const services = createServiceFactory();
    const stateFilter = request.query.get('state') as ProjectSetupRequestState | null;
    const requests = await services.projectRequests.listRequests(stateFilter ?? undefined);
    const start = (page - 1) * pageSize;
    return listResponse(requests.slice(start, start + pageSize), requests.length, page, pageSize, requestId);
  }, { domain: 'projectRequests', operation: 'listProjectSetupRequests' })),
});

/**
 * D-PH6-08 PATCH /api/project-setup-requests/{requestId}/state
 * Advances request lifecycle with transition + validation enforcement.
 */
app.http('advanceRequestState', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'project-setup-requests/{requestId}/state',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const reqId = extractOrGenerateRequestId(request);

    const requestId = request.params.requestId;
    const body = (await request.json()) as {
      newState: ProjectSetupRequestState;
      projectNumber?: string;
      clarificationNote?: string;
    };

    if (!requestId) return errorResponse(400, 'VALIDATION_ERROR', 'requestId is required', reqId);
    if (!body.newState) return errorResponse(400, 'VALIDATION_ERROR', 'newState is required', reqId);

    const services = createServiceFactory();
    const existing = await services.projectRequests.getRequest(requestId);
    if (!existing) {
      return notFoundResponse('ProjectSetupRequest', requestId, reqId);
    }

    // D-PH6-08 transition guard prevents invalid lifecycle jumps.
    if (!isValidTransition(existing.state, body.newState)) {
      return errorResponse(400, 'VALIDATION_ERROR', `Invalid state transition: ${existing.state} → ${body.newState}`, reqId);
    }

    // D-PH6-08 validation rule: ReadyToProvision requires a valid human-assigned project number.
    if (body.newState === 'ReadyToProvision') {
      if (!body.projectNumber || !PROJECT_NUMBER_PATTERN.test(body.projectNumber)) {
        return errorResponse(400, 'VALIDATION_ERROR', 'Valid projectNumber (##-###-##) is required to set ReadyToProvision', reqId);
      }
      existing.projectNumber = body.projectNumber;
    }

    const fromState = existing.state;
    existing.state = body.newState;

    if (body.clarificationNote) {
      existing.clarificationNote = body.clarificationNote;
    }

    if (body.newState === 'Provisioning' || body.newState === 'Completed') {
      existing.completedBy = auth.claims.upn;
      existing.completedAt = new Date().toISOString();
    }

    await services.projectRequests.upsertRequest(existing);

    logger.info('Request state advanced', {
      requestId,
      from: fromState,
      to: body.newState,
      by: auth.claims.upn,
    });

    // D-PH6-08 automatic provisioning handoff: fire-and-forget saga on approval.
    if (body.newState === 'ReadyToProvision') {
      const existingStatus = await services.tableStorage.getProvisioningStatus(existing.projectId);
      if (!existingStatus || existingStatus.overallStatus === 'Failed') {
        const provisionRequest: IProvisionSiteRequest = {
          projectId: existing.projectId,
          projectNumber: existing.projectNumber!,
          projectName: existing.projectName,
          triggeredBy: auth.claims.upn,
          correlationId: randomUUID(),
          groupMembers: existing.groupMembers,
          submittedBy: existing.submittedBy,
          groupLeaders: existing.groupLeaders,
          department: existing.department,
        };

        const orchestrator = new SagaOrchestrator(services, logger);
        orchestrator.execute(provisionRequest).catch((err) => {
          logger.error('Auto-provisioning saga failed', {
            projectId: existing.projectId,
            correlationId: provisionRequest.correlationId,
            error: err instanceof Error ? err.message : String(err),
          });
        });

        logger.info('Provisioning saga auto-triggered from approval', {
          requestId,
          projectId: existing.projectId,
          correlationId: provisionRequest.correlationId,
        });
      } else {
        logger.info('Provisioning already exists — skipping auto-trigger', {
          requestId,
          projectId: existing.projectId,
          existingStatus: existingStatus.overallStatus,
        });
      }
    }

    return successResponse(existing);
  }, { domain: 'projectRequests', operation: 'advanceRequestState' })),
});
