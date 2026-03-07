import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { randomUUID } from 'crypto';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { isValidTransition } from '../../state-machine.js';
import { createLogger } from '../../utils/logger.js';

const PROJECT_NUMBER_PATTERN = /^\d{2}-\d{3}-\d{2}$/;

/**
 * D-PH6-08 POST /api/project-setup-requests
 * Submit a new request from the Estimating workflow.
 */
app.http('submitProjectSetupRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try {
      // D-PH6-08 Bearer trust boundary: identity is only sourced from validated token claims.
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const body = (await request.json()) as Partial<IProjectSetupRequest>;
    if (!body.projectName || !body.groupMembers?.length) {
      return { status: 400, jsonBody: { error: 'projectName and groupMembers are required' } };
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
      submittedBy: claims.upn,
      submittedAt: new Date().toISOString(),
      state: 'Submitted',
      groupMembers: body.groupMembers,
    };

    await services.projectRequests.upsertRequest(newRequest);
    logger.info('Project setup request submitted', {
      requestId,
      projectId,
      submittedBy: claims.upn,
    });

    return { status: 201, jsonBody: newRequest };
  },
});

/**
 * D-PH6-08 GET /api/project-setup-requests
 * Lists request inbox rows, optionally filtered by lifecycle state.
 */
app.http('listProjectSetupRequests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'project-setup-requests',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const services = createServiceFactory();
    const stateFilter = request.query.get('state') as ProjectSetupRequestState | null;
    const requests = await services.projectRequests.listRequests(stateFilter ?? undefined);
    return { status: 200, jsonBody: requests };
  },
});

/**
 * D-PH6-08 PATCH /api/project-setup-requests/{requestId}/state
 * Advances request lifecycle with transition + validation enforcement.
 */
app.http('advanceRequestState', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'project-setup-requests/{requestId}/state',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    let claims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const requestId = request.params.requestId;
    const body = (await request.json()) as {
      newState: ProjectSetupRequestState;
      projectNumber?: string;
      clarificationNote?: string;
    };

    if (!requestId) return { status: 400, jsonBody: { error: 'requestId is required' } };
    if (!body.newState) return { status: 400, jsonBody: { error: 'newState is required' } };

    const services = createServiceFactory();
    const existing = await services.projectRequests.getRequest(requestId);
    if (!existing) {
      return { status: 404, jsonBody: { error: 'Request not found' } };
    }

    // D-PH6-08 transition guard prevents invalid lifecycle jumps.
    if (!isValidTransition(existing.state, body.newState)) {
      return {
        status: 400,
        jsonBody: { error: `Invalid state transition: ${existing.state} → ${body.newState}` },
      };
    }

    // D-PH6-08 validation rule: ReadyToProvision requires a valid human-assigned project number.
    if (body.newState === 'ReadyToProvision') {
      if (!body.projectNumber || !PROJECT_NUMBER_PATTERN.test(body.projectNumber)) {
        return {
          status: 400,
          jsonBody: {
            error: 'Valid projectNumber (##-###-##) is required to set ReadyToProvision',
          },
        };
      }
      existing.projectNumber = body.projectNumber;
    }

    const fromState = existing.state;
    existing.state = body.newState;

    if (body.clarificationNote) {
      existing.clarificationNote = body.clarificationNote;
    }

    if (body.newState === 'Provisioning' || body.newState === 'Completed') {
      existing.completedBy = claims.upn;
      existing.completedAt = new Date().toISOString();
    }

    await services.projectRequests.upsertRequest(existing);

    logger.info('Request state advanced', {
      requestId,
      from: fromState,
      to: body.newState,
      by: claims.upn,
    });

    return { status: 200, jsonBody: existing };
  },
});
