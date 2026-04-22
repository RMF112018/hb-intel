import type { SpHttpClient } from '@hbc/features-safety';

export interface SpfxLikeContext {
  pageContext?: { user?: { loginName?: string } };
  spHttpClient?: unknown;
}

interface SpHttpClientLike {
  get: (url: string, configuration: unknown, options?: Record<string, unknown>) => Promise<Response>;
  post: (url: string, configuration: unknown, options?: Record<string, unknown>) => Promise<Response>;
}

interface ContextInfoPayload {
  FormDigestValue?: string;
  d?: { GetContextWebInformation?: { FormDigestValue?: string } };
}

export function adaptSpfxHttpClient(spfxContext?: SpfxLikeContext): SpHttpClient | null {
  const sp = spfxContext?.spHttpClient as SpHttpClientLike | undefined;
  if (!sp || typeof sp.get !== 'function' || typeof sp.post !== 'function') return null;
  const SPHttpClientConfig = 1;
  const digestByWebUrl = new Map<string, string>();

  const resolveRequestDigest = async (requestUrl: string): Promise<string | undefined> => {
    const webUrl = webUrlFromApiUrl(requestUrl);
    if (!webUrl) return undefined;
    const cached = digestByWebUrl.get(webUrl);
    if (cached) return cached;
    const contextInfoResponse = await sp.post(`${webUrl}/_api/contextinfo`, SPHttpClientConfig, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=verbose',
      },
    });
    if (!contextInfoResponse.ok) return undefined;
    const payload = (await contextInfoResponse.json()) as ContextInfoPayload;
    const digest =
      payload.FormDigestValue ?? payload.d?.GetContextWebInformation?.FormDigestValue ?? undefined;
    if (digest) digestByWebUrl.set(webUrl, digest);
    return digest;
  };

  return {
    get: (url, init) =>
      sp.get(url, SPHttpClientConfig, {
        headers: init?.headers,
      }),
    post: async (url, body, init) => {
      const digest = await resolveRequestDigest(url);
      const headers =
        digest && !(init?.headers && 'X-RequestDigest' in init.headers)
          ? { ...init?.headers, 'X-RequestDigest': digest }
          : init?.headers;
      return sp.post(url, SPHttpClientConfig, {
        headers,
        body: body as BodyInit,
      });
    },
  };
}

function webUrlFromApiUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = '/_api/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx < 0) return null;
    const webPath = parsed.pathname.slice(0, idx);
    return `${parsed.origin}${webPath}`;
  } catch {
    return null;
  }
}
