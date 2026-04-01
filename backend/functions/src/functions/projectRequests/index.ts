import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProjectSetupRequest, IProvisionSiteRequest, ProjectSetupRequestState } from '@hbc/models';
import { randomUUID } from 'crypto';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createProjectSetupServiceFactory } from '../../hosts/project-setup/service-factory.js';
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
import { isPrivileged, checkOwnership } from '../../middleware/authorization.js';
import { SagaOrchestrator } from '../provisioningSaga/saga-orchestrator.js';

const PROJECT_NUMBER_PATTERN = /^\d{2}-\d{3}-\d{2}$/;

// ── Validation helpers ──────────────────────────────────────────────────

export const VALID_PROJECT_STAGES = ['Lead', 'Pursuit', 'Preconstruction', 'Construction', 'Closeout', 'Warranty'] as const;
export const VALID_DEPARTMENTS = ['commercial', 'luxury-residential'] as const;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSubmission(body: Partial<IProjectSetupRequest>): ValidationError[] {
  const errors: ValidationError[] = [];

  // ── Required fields (aligned with wizard enforcement — P6-01) ──────
  if (!body.projectName?.trim()) {
    errors.push({ field: 'projectName', message: 'Project name is required.' });
  }
  if (!body.projectLocation?.trim()) {
    errors.push({ field: 'projectLocation', message: 'Project location is required.' });
  }
  if (!body.projectStreetAddress?.trim()) {
    errors.push({ field: 'projectStreetAddress', message: 'Street address is required.' });
  }
  if (!body.projectCity?.trim()) {
    errors.push({ field: 'projectCity', message: 'City is required.' });
  }
  if (!body.projectCounty?.trim()) {
    errors.push({ field: 'projectCounty', message: 'County is required.' });
  }
  if (!body.projectState?.trim()) {
    errors.push({ field: 'projectState', message: 'State is required.' });
  }
  if (!body.projectZip?.trim()) {
    errors.push({ field: 'projectZip', message: 'Zip is required.' });
  }
  if (!body.department) {
    errors.push({ field: 'department', message: 'Department is required.' });
  }
  if (!body.projectType?.trim()) {
    errors.push({ field: 'projectType', message: 'Project type is required.' });
  }
  if (!body.projectExecutiveUpn?.trim()) {
    errors.push({ field: 'projectExecutiveUpn', message: 'Project Executive is required.' });
  }
  if (!body.leadEstimatorUpn?.trim()) {
    errors.push({ field: 'leadEstimatorUpn', message: 'Lead Estimator is required.' });
  }
  if (!body.timberscanApproverUpn?.trim()) {
    errors.push({ field: 'timberscanApproverUpn', message: 'Timberscan Approver is required.' });
  }
  if (!body.groupMembers?.length) {
    errors.push({ field: 'groupMembers', message: 'At least one group member is required.' });
  }

  // ── Format validation ──────────────────────────────────────────────
  if (body.estimatedValue !== undefined && body.estimatedValue !== null && body.estimatedValue < 0) {
    errors.push({ field: 'estimatedValue', message: 'Estimated value must be a positive number.' });
  }
  if (body.projectStage && !VALID_PROJECT_STAGES.includes(body.projectStage as any)) {
    errors.push({ field: 'projectStage', message: `Project stage must be one of: ${VALID_PROJECT_STAGES.join(', ')}` });
  }
  if (body.department && !VALID_DEPARTMENTS.includes(body.department as any)) {
    errors.push({ field: 'department', message: `Department must be one of: ${VALID_DEPARTMENTS.join(', ')}` });
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

    const services = createProjectSetupServiceFactory();
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
      submittedByOid: auth.claims.oid,
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

      // P2-08: Structured location fields
      projectStreetAddress: body.projectStreetAddress,
      projectCity: body.projectCity,
      projectCounty: body.projectCounty,
      projectState: body.projectState,
      projectZip: body.projectZip,

      // P2-08: Classification fields
      officeDivision: body.officeDivision,
      procoreProject: body.procoreProject,

      // P2-08: Team role assignments
      projectExecutiveUpn: body.projectExecutiveUpn,
      projectManagerUpn: body.projectManagerUpn,
      leadEstimatorUpn: body.leadEstimatorUpn,
      supportingEstimatorUpns: body.supportingEstimatorUpns,
      additionalTeamMemberUpns: body.additionalTeamMemberUpns,
      timberscanApproverUpn: body.timberscanApproverUpn,
      sageAccessUpns: body.sageAccessUpns,
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
    const services = createProjectSetupServiceFactory();
    const stateFilter = request.query.get('state') as ProjectSetupRequestState | null;
    const submitterFilter = request.query.get('submitterId');

    let requests = await services.projectRequests.listRequests(stateFilter ?? undefined);

    // P9-G5-06: Role-based scoping via shared policy engine (replaces env-var UPN lists).
    const privileged = isPrivileged(auth.claims);

    if (submitterFilter) {
      // Explicit filter — only return if caller is requesting own data or is privileged
      if (!privileged) {
        const filterMatch = checkOwnership(auth.claims, { submittedBy: submitterFilter });
        if (!filterMatch.isOwner) {
          requests = [];
        } else {
          requests = requests.filter((r) => {
            const { isOwner } = checkOwnership(auth.claims, r);
            return isOwner;
          });
        }
      } else {
        requests = requests.filter((r) => r.submittedBy.toLowerCase() === submitterFilter.toLowerCase());
      }
    } else if (!privileged) {
      // Default scoping: non-privileged callers see only their own requests
      requests = requests.filter((r) => {
        const { isOwner } = checkOwnership(auth.claims, r);
        return isOwner;
      });
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
  handler: withAuth(withTelemetry(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const reqId = extractOrGenerateRequestId(request);
    const requestId = request.params.requestId;
    if (!requestId) return errorResponse(400, 'VALIDATION_ERROR', 'requestId is required', reqId);

    const services = createProjectSetupServiceFactory();
    const existing = await services.projectRequests.getRequest(requestId);
    if (!existing) return notFoundResponse('ProjectSetupRequest', requestId, reqId);

    const role = resolveRequestRole(auth.claims, existing, logger);
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

    const services = createProjectSetupServiceFactory();
    const existing = await services.projectRequests.getRequest(requestId);
    if (!existing) {
      return notFoundResponse('ProjectSetupRequest', requestId, reqId);
    }

    // D-PH6-08 transition guard prevents invalid lifecycle jumps.
    if (!isValidTransition(existing.state, body.newState)) {
      return errorResponse(400, 'VALIDATION_ERROR', `Invalid state transition: ${existing.state} → ${body.newState}`, reqId);
    }

    // P9-G5-06: Role-based authorization via shared policy engine (replaces env-var UPN lists).
    const role = resolveRequestRole(auth.claims, existing, logger);
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
      existing.completedByOid = auth.claims.oid;
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
          triggeredByOid: auth.claims.oid,
          correlationId: randomUUID(),
          groupMembers: existing.groupMembers,
          submittedBy: existing.submittedBy,
          submittedByOid: existing.submittedByOid,
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
