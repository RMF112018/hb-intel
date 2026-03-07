import {
  app,
  output,
  type HttpRequest,
  type InvocationContext,
  type HttpResponseInit,
} from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';

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
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    let claims;
    try {
      // Bearer validation is handled explicitly to keep negotiate auth policy aligned
      // with PH6.2 and preserve user identity for SignalR userId assignment.
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid token for SignalR negotiate');
    }

    const projectId = request.query.get('projectId');
    if (!projectId) {
      return {
        status: 400,
        jsonBody: { error: 'projectId query parameter is required' },
      };
    }

    // Per-project group is always required; admin group is additive for global monitoring.
    const groups: string[] = [`provisioning-${projectId}`];
    const isAdmin = claims.roles.some((role) => ADMIN_ROLES.includes(role));
    if (isAdmin) {
      groups.push(ADMIN_GROUP);
    }

    // The SignalR binding generates negotiate connection data; we persist userId so
    // downstream push paths can correlate reconnect attempts to the authenticated user.
    const connectionInfo =
      (context.extraOutputs.get(connectionInfoOutput) as Record<string, unknown> | undefined) ?? {};

    context.extraOutputs.set(connectionInfoOutput, {
      ...connectionInfo,
      userId: claims.upn,
    });

    return {
      status: 200,
      jsonBody: {
        ...connectionInfo,
        userId: claims.upn,
        groups,
      },
    };
  },
});
