import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProjectSetupRequest, IProvisionSiteRequest, ProjectSetupRequestState } from '@hbc/models';
import { randomUUID } from 'crypto';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createServiceFactory } from '../../services/service-factory.js';
import {
  isValidTransition,
  resolveRequestRole,
  isAuthorizedTransition,
  deriveProjectYear,
} from '../../state-machine.js';
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

// ── Validation helpers ──────────────────────────────────────────────────

const VALID_PROJECT_STAGES = ['Pursuit', 'Active'] as const;
const VALID_PROJECT_TYPES = ['GC', 'CM', 'DB', 'DBB', 'Residential', 'Commercial'] as const;

interface ValidationError {
  field: string;
  message: string;
}

function validateSubmission(body: Partial<IProjectSetupRequest>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body.projectName?.trim()) {
    errors.push({ field: 'projectName', message: 'Project name is required.' });
  }
  if (!body.projectLocation?.trim()) {
    errors.push({ field: 'projectLocation', message: 'Project location is required.' });
  }
  if (!body.groupMembers?.length) {
    errors.push({ field: 'groupMembers', message: 'At least one group member is required.' });
  }
  if (body.estimatedValue !== undefined && body.estimatedValue !== null && body.estimatedValue < 0) {
    errors.push({ field: 'estimatedValue', message: 'Estimated value must be a positive number.' });
  }
  if (body.projectStage && !VALID_PROJECT_STAGES.includes(body.projectStage as any)) {
    errors.push({ field: 'projectStage', message: `Project stage must be one of: ${VALID_PROJECT_STAGES.join(', ')}` });
  }

  return errors;
}

// ── Endpoints ───────────────────────────────────────────────────────────

/**
 * D-PH6-08 POST /api/project-setup-requests
 * Submit a new request from the Estimating workflow.
 * Backend validation now matches wizard requirements (projectName, projectLocation, groupMembers required).
 */
app.http('submitProjectSetupRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const reqId = extractOrGenerateRequestId(request);

    const body = (await request.json()) as Partial<IProjectSetupRequest>;

    // Validation parity with wizard: projectName, projectLocation, groupMembers required
    const validationErrors = validateSubmission(body);
    if (validationErrors.length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', validationErrors.map((e) => e.message).join('; '), reqId);
    }

    const services = createServiceFactory();
    const projectId = body.projectId ?? randomUUID();
    const requestId = projectId;

    const newRequest: IProjectSetupRequest = {
      requestId,
      projectId,
      projectName: body.projectName!,
      projectLocation: body.projectLocation!,
      projectType: body.projectType ?? '',
      projectStage: body.projectStage ?? 'Pursuit',
      submittedBy: auth.claims.upn,
      submittedAt: new Date().toISOString(),
      state: 'Submitted',
      groupMembers: body.groupMembers!,
      groupLeaders: body.groupLeaders,
      department: body.department,
      estimatedValue: body.estimatedValue,
      clientName: body.clientName,
      startDate: body.startDate,
      contractType: body.contractType,
      projectLeadId: body.projectLeadId,
      viewerUPNs: body.viewerUPNs,
      addOns: body.addOns,
      retryCount: 0,
      // Year derived from project number if available, else submission year
      year: body.year ?? deriveProjectYear(body.projectNumber),
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
 * Requester-scoped list: non-admin callers see only their own requests.
 * Controllers and admins see all requests (filtered by state if specified).
 */
app.http('listProjectSetupRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const page = Math.max(1, parseInt(request.query.get('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.query.get('pageSize') ?? '25', 10)));
    const services = createServiceFactory();
    const stateFilter = request.query.get('state') as ProjectSetupRequestState | null;
    const submitterFilter = request.query.get('submitterId');

    let requests = await services.projectRequests.listRequests(stateFilter ?? undefined);

    // Role-based scoping: if a submitterId filter is provided, or if the caller
    // is not a controller/admin, scope to the caller's own requests.
    const adminUpns = (process.env.ADMIN_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
    const controllerUpns = (process.env.CONTROLLER_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
    const callerUpn = auth.claims.upn.toLowerCase();
    const isPrivileged = adminUpns.includes(callerUpn) || controllerUpns.includes(callerUpn);

    if (submitterFilter) {
      // Explicit filter — only return if caller is requesting own data or is privileged
      const filterUpn = submitterFilter.toLowerCase();
      if (!isPrivileged && filterUpn !== callerUpn) {
        requests = [];
      } else {
        requests = requests.filter((r) => r.submittedBy.toLowerCase() === filterUpn);
      }
    } else if (!isPrivileged) {
      // Default scoping: non-privileged callers see only their own requests
      requests = requests.filter((r) => r.submittedBy.toLowerCase() === callerUpn);
    }

    const start = (page - 1) * pageSize;
    return listResponse(requests.slice(start, start + pageSize), requests.length, page, pageSize, requestId);
  }, { domain: 'projectRequests', operation: 'listProjectSetupRequests' })),
});

/**
 * GET /api/project-setup-requests/{requestId}
 * Direct request-by-id read. Returns 403 if the caller is not the submitter,
 * a controller, or an admin.
 */
app.http('getProjectSetupRequest', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'project-setup-requests/{requestId}',
  handler: withAuth(withTelemetry(async (request: HttpRequest, _context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const reqId = extractOrGenerateRequestId(request);
    const requestId = request.params.requestId;
    if (!requestId) return errorResponse(400, 'VALIDATION_ERROR', 'requestId is required', reqId);

    const services = createServiceFactory();
    const existing = await services.projectRequests.getRequest(requestId);
    if (!existing) return notFoundResponse('ProjectSetupRequest', requestId, reqId);

    const role = resolveRequestRole(auth.claims.upn, existing);
    if (role === 'system') {
      return errorResponse(403, 'FORBIDDEN', 'You do not have access to this request', reqId);
    }

    return successResponse(existing);
  }, { domain: 'projectRequests', operation: 'getProjectSetupRequest' })),
});

/**
 * D-PH6-08 PATCH /api/project-setup-requests/{requestId}/state
 * Advances request lifecycle with transition + role authorization enforcement.
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
      clarificationItems?: Array<{ fieldId: string; stepId: string; message: string }>;
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

    // Role-based authorization: verify the caller has authority for this transition.
    const role = resolveRequestRole(auth.claims.upn, existing);
    if (!isAuthorizedTransition(role, existing.state, body.newState)) {
      return errorResponse(403, 'FORBIDDEN',
        `Role '${role}' is not authorized for transition ${existing.state} → ${body.newState}`, reqId);
    }

    // D-PH6-08 validation rule: ReadyToProvision requires a valid human-assigned project number.
    if (body.newState === 'ReadyToProvision') {
      if (!body.projectNumber || !PROJECT_NUMBER_PATTERN.test(body.projectNumber)) {
        return errorResponse(400, 'VALIDATION_ERROR', 'Valid projectNumber (##-###-##) is required to set ReadyToProvision', reqId);
      }
      existing.projectNumber = body.projectNumber;
      // Derive year from the assigned project number
      existing.year = deriveProjectYear(body.projectNumber);
    }

    const fromState = existing.state;
    existing.state = body.newState;

    // Clarification handling: store note, items, and timestamp
    if (body.newState === 'NeedsClarification') {
      if (body.clarificationNote) {
        existing.clarificationNote = body.clarificationNote;
      }
      existing.clarificationRequestedAt = new Date().toISOString();
      if (body.clarificationItems?.length) {
        existing.clarificationItems = body.clarificationItems.map((item) => ({
          clarificationId: randomUUID(),
          fieldId: item.fieldId,
          stepId: item.stepId,
          message: item.message,
          raisedBy: auth.claims.upn,
          raisedAt: new Date().toISOString(),
          status: 'open' as const,
        }));
      }
    }

    // Clarification return: requester resubmits from NeedsClarification
    if (fromState === 'NeedsClarification' && body.newState === 'UnderReview') {
      if (body.clarificationNote) {
        existing.clarificationNote = body.clarificationNote;
      }
    }

    // Completion metadata: only set on actual completion states
    if (body.newState === 'Completed') {
      existing.completedBy = auth.claims.upn;
      existing.completedAt = new Date().toISOString();
    }

    await services.projectRequests.upsertRequest(existing);

    logger.info('Request state advanced', {
      requestId,
      from: fromState,
      to: body.newState,
      by: auth.claims.upn,
      role,
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
