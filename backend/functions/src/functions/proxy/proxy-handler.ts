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

  // Extract and validate bearer token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { status: 401, jsonBody: { error: 'Missing or invalid authorization header' } };
  }

  const userToken = authHeader.substring(7);

  try {
    // Acquire OBO token
    const oboToken = await services.msalObo.acquireTokenOnBehalfOf(userToken, [
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

    // In mock mode, return a mock response instead of making real HTTP calls
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

    logger.info(`Proxy ${method} ${path} → ${targetUrl} (OBO token: ${oboToken.substring(0, 15)}...)`);
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
