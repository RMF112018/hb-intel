/**
 * INTEGRATION PATH: STUB (Phase 1 deliverable)
 *
 * This handler returns hardcoded mock responses ({ _mock: true }).
 * It does NOT make real Graph API calls.
 * Real Graph API forwarding via app-only token is a Phase 1 / P1-B1 deliverable.
 *
 * P3-05: Auth enforced by withAuth() at route registration.
 * P4-02: Redis cache removed (was always mocked/never used).
 *
 * Do NOT rely on this handler for production data retrieval.
 */
import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import type { IServiceContainer } from '../../services/service-factory.js';
import type { ILogger } from '../../utils/logger.js';
import { getEnv } from '../../utils/env.js';

export async function handleProxyRequest(
  request: HttpRequest,
  services: IServiceContainer,
  logger: ILogger
): Promise<HttpResponseInit> {
  const path = request.params.path ?? '';
  const method = request.method;
  const graphBase = getEnv('GRAPH_API_BASE_URL', 'https://graph.microsoft.com/v1.0');
  const targetUrl = `${graphBase}/${path}${request.url.includes('?') ? '?' + request.url.split('?')[1] : ''}`;

  try {
    const appToken = await services.managedIdentity.acquireAppToken([
      'https://graph.microsoft.com/.default',
    ]);

    // STUB: Returns mock response. Real Graph API call not yet implemented.
    const responseBody = {
      _mock: true,
      targetUrl,
      method,
      message: `Mock proxy response for ${method} ${path}`,
      timestamp: new Date().toISOString(),
    };

    logger.info(`Proxy ${method} ${path} → ${targetUrl} (app token: ${appToken.substring(0, 15)}...)`);
    return { status: 200, jsonBody: responseBody };
  } catch (err) {
    logger.error('Proxy request failed', {
      path,
      method,
      error: err instanceof Error ? err.message : String(err),
    });
    return { status: 502, jsonBody: { error: 'Proxy request failed' } };
  }
}
