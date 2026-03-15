/**
 * Builds a relative action URL for notification payloads.
 * Preserves cross-surface pattern: relative paths work on both PWA and SPFx.
 */
export function buildActionUrl(
  basePath: string,
  params?: Record<string, string | undefined>,
): string {
  if (!params) return basePath;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
