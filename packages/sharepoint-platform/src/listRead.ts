/**
 * Narrow shared read helper for SharePoint list GET requests.
 *
 * The endpoint URL is supplied by the caller — typically from
 * `buildListItemsEndpoint` for GUID-bound reads. This helper owns
 * only the transport mechanics: `odata=nometadata` Accept header,
 * non-OK status-to-exception translation, and the `{ value: T[] }`
 * response-body unwrap.
 *
 * It deliberately does NOT construct the endpoint itself, so the
 * package's GUID-binding discipline is preserved.
 */

export interface FetchListItemsOptions {
  /** Optional AbortSignal forwarded to `fetch`. */
  signal?: AbortSignal;
  /**
   * Optional label used in the thrown error message when the response
   * is non-OK, so callers do not need to wrap the call to add context.
   */
  label?: string;
}

/**
 * GET a SharePoint list-items endpoint and return the unwrapped
 * `value` array. Throws when the response is non-OK.
 */
export async function fetchListItemsJson<T>(
  endpointUrl: string,
  options?: FetchListItemsOptions,
): Promise<T[]> {
  const response = await fetch(endpointUrl, {
    headers: { Accept: 'application/json;odata=nometadata' },
    signal: options?.signal,
  });
  if (!response.ok) {
    const label = options?.label ?? 'SharePoint list';
    throw new Error(
      `${label} request failed: ${response.status} ${response.statusText}`,
    );
  }
  const body = (await response.json()) as { value?: T[] };
  return body.value ?? [];
}
