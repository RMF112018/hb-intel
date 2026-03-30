import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { createServiceFactory } from '../../services/service-factory.js';
import { handleProxyRequest } from './proxy-handler.js';
import { createLogger } from '../../utils/logger.js';
import { withAuth } from '../../middleware/auth.js';

/**
 * P3-05: Proxy routes now wrapped with withAuth() for full JWT validation.
 * Previously these routes only checked Bearer header format without validating
 * the token. The handler receives AuthContext but does not forward the user
 * token — all downstream calls use app-only Managed Identity.
 */
app.http('proxyGet', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'proxy/{*path}',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const services = createServiceFactory();
    const logger = createLogger(context);
    return handleProxyRequest(request, services, logger);
  }),
});

app.http('proxyMutate', {
  methods: ['POST', 'PATCH', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'proxy/{*path}',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const services = createServiceFactory();
    const logger = createLogger(context);
    return handleProxyRequest(request, services, logger);
  }),
});
