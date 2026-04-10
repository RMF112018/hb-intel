export interface ApiEnvelope<T> {
  readonly data: T;
}

export interface ApiListEnvelope<T> {
  readonly items: readonly T[];
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!payload) {
    throw new Error(`Unexpected empty response (${response.status}).`);
  }
  return payload;
}

export async function assertOk(response: Response, operation: string): Promise<void> {
  if (!response.ok) {
    const message = await response
      .json()
      .then((body) => (body as { message?: string }).message)
      .catch(() => undefined);
    throw new Error(`${operation} failed (${response.status}): ${message ?? response.statusText}`);
  }
}

