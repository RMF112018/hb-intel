/**
 * P1-C3 §2.2.1: Health probe endpoint.
 * Unauthenticated — used by Azure App Service health checks and deployment smoke tests.
 */

import { app, type HttpResponseInit } from '@azure/functions';

app.http('health', {
  route: 'health',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (): Promise<HttpResponseInit> => {
    return {
      status: 200,
      jsonBody: {
        status: 'healthy',
        environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'unknown',
        timestamp: new Date().toISOString(),
      },
    };
  },
});
