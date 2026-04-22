/**
 * Narrow SharePoint HTTP client interface so the feature package does
 * not import `@microsoft/sp-http` directly. The real SPFx `SPHttpClient`
 * is adapted in the app layer (see apps/safety/src/App.tsx).
 */

export interface SpHttpClient {
  get(url: string, init?: { headers?: Record<string, string> }): Promise<Response>;
  post(
    url: string,
    body: BodyInit | null,
    init?: { headers?: Record<string, string> },
  ): Promise<Response>;
}

export async function parseJsonOrThrow<T>(response: Response, contextLabel: string): Promise<T> {
  if (!response.ok) {
    const text = await safelyReadText(response);
    throw new Error(`${contextLabel} failed (${response.status}): ${text}`);
  }
  return (await response.json()) as T;
}

async function safelyReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<no body>';
  }
}

export const JSON_HEADERS = {
  Accept: 'application/json;odata=nometadata',
  'Content-Type': 'application/json;odata=verbose',
} as const;
