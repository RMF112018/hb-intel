import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { createServiceFactory } from '../../services/service-factory.js';
import { handleProxyRequest } from './proxy-handler.js';
import { createLogger } from '../../utils/logger.js';

app.http('proxyGet', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'proxy/{*path}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const services = createServiceFactory();
    const logger = createLogger(context);
    return handleProxyRequest(request, services, logger);
  },
});

app.http('proxyMutate', {
  methods: ['POST', 'PATCH', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'proxy/{*path}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const services = createServiceFactory();
    const logger = createLogger(context);
    return handleProxyRequest(request, services, logger);
  },
});
