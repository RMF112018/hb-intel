/** Normalized result envelopes used across the platform package. */

export type FetchResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type WriteResult = { ok: true } | { ok: false; error: string };

/** Build an error envelope with the given message. */
export function asError(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}
