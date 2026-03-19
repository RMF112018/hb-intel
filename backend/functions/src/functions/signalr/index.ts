import {
  app,
  output,
  type HttpRequest,
  type InvocationContext,
  type HttpResponseInit,
} from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { errorResponse } from '../../utils/response-helpers.js';

const ADMIN_ROLES = ['Admin', 'HBIntelAdmin'];
const ADMIN_GROUP = 'provisioning-admin';
const connectionInfoOutput = output.generic({
  type: 'signalRConnectionInfo',
  name: 'connectionInfo',
  hubName: 'provisioning',
  connectionStringSetting: 'AzureSignalRConnectionString',
});

/**
 * D-PH6-07: SignalR negotiate endpoint for per-project real-time provisioning events.
 * Validates Bearer tokens, derives group assignments, and returns connection metadata
 * consumed by SPFx clients that implement automatic reconnect and group rejoin logic.
 */
app.http('signalrNegotiate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'provisioning-negotiate',
  extraInputs: [],
  extraOutputs: [connectionInfoOutput],
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const projectId = request.query.get('projectId');
    if (!projectId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'projectId query parameter is required', requestId);
    }

    // Per-project group is always required; admin group is additive for global monitoring.
    const groups: string[] = [`provisioning-${projectId}`];
    const isAdmin = auth.claims.roles.some((role) => ADMIN_ROLES.includes(role));
    if (isAdmin) {
      groups.push(ADMIN_GROUP);
    }

    // The SignalR binding generates negotiate connection data; we persist userId so
    // downstream push paths can correlate reconnect attempts to the authenticated user.
    const connectionInfo =
      (context.extraOutputs.get(connectionInfoOutput) as Record<string, unknown> | undefined) ?? {};

    context.extraOutputs.set(connectionInfoOutput, {
      ...connectionInfo,
      userId: auth.claims.upn,
    });

    // Raw negotiate response — SignalR client SDK requires this exact shape; do NOT wrap in successResponse.
    return {
      status: 200,
      jsonBody: {
        ...connectionInfo,
        userId: auth.claims.upn,
        groups,
      },
    };
  }),
});
