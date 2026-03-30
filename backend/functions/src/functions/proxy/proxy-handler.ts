/**
 * INTEGRATION PATH: STUB (Phase 1 deliverable)
 *
 * This handler builds cache keys but returns hardcoded mock responses
 * ({ _mock: true }). It does NOT make real Graph API calls.
 * Real Graph API forwarding via app-only token is a Phase 1 / P1-B1 deliverable.
 *
 * P3-05: Auth is now enforced by withAuth() at route registration level.
 * The custom Bearer header check has been removed. All backend-to-service
 * calls use app-only Managed Identity.
 *
 * Do NOT rely on this handler for production data retrieval.
 */
import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import type { IServiceContainer } from '../../services/service-factory.js';
import type { ILogger } from '../../utils/logger.js';
import { getEnv } from '../../utils/env.js';

function buildCacheKey(path: string, query: string): string {
  return `proxy:${path}:${query}`;
}

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
    // P3-04: Acquire app-only token via Managed Identity (not OBO).
    const appToken = await services.managedIdentity.acquireAppToken([
      'https://graph.microsoft.com/.default',
    ]);

    // Check cache for GET requests
    if (method === 'GET') {
      const cacheKey = buildCacheKey(path, request.url.split('?')[1] ?? '');
      const cached = await services.redisCache.get<{ body: unknown; status: number }>(cacheKey);

      if (cached) {
        logger.info(`Cache hit for ${cacheKey}`);
        return { status: cached.status, jsonBody: cached.body };
      }
    }

    // STUB: Returns mock response. Real Graph API call not yet implemented (Phase 1 / P1-B1).
    const responseBody = {
      _mock: true,
      targetUrl,
      method,
      message: `Mock proxy response for ${method} ${path}`,
      timestamp: new Date().toISOString(),
    };

    // Cache GET responses
    if (method === 'GET') {
      const cacheKey = buildCacheKey(path, request.url.split('?')[1] ?? '');
      await services.redisCache.set(cacheKey, { body: responseBody, status: 200 }, 300);
      logger.info(`Cached response for ${cacheKey} (TTL: 300s)`);
    }

    // Invalidate cache for mutating requests
    if (method !== 'GET') {
      const cacheKey = buildCacheKey(path, '');
      await services.redisCache.delete(cacheKey);
      logger.info(`Invalidated cache for ${cacheKey}`);
    }

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
