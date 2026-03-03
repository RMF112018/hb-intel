import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { createLogger } from '../../utils/logger.js';
import { getEnv } from '../../utils/env.js';

app.http('signalrNegotiate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signalr/negotiate',
  handler: async (_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const connectionString = getEnv('SIGNALR_CONNECTION_STRING', '');

    if (!connectionString) {
      // Mock mode: return mock connection info
      logger.info('SignalR negotiate: returning mock connection info');
      return {
        status: 200,
        jsonBody: {
          url: 'https://mock-signalr.service.signalr.net/client/',
          accessToken: `mock-signalr-token-${Date.now()}`,
        },
      };
    }

    // Future: real SignalR negotiate with Azure SignalR Service
    logger.info('SignalR negotiate: real implementation pending');
    return {
      status: 200,
      jsonBody: {
        url: connectionString.split(';')[0]?.replace('Endpoint=', '') ?? '',
        accessToken: 'pending-real-token',
      },
    };
  },
});
