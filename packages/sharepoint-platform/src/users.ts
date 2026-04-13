/**
 * User resolution helpers.
 *
 * `ensureUserByEmail` resolves an email to a SharePoint user id via
 * the `ensureuser` REST endpoint. `resolveCurrentUserId` is a pure
 * fetch of `/_api/web/currentuser` — no module-level cache. Callers
 * that want session-level caching should wrap it.
 */

/**
 * Resolve a SharePoint user id from an email address via the
 * ensureUser endpoint. Returns undefined if resolution fails.
 */
export async function ensureUserByEmail(
  siteUrl: string,
  email: string,
  digest: string,
): Promise<number | undefined> {
  try {
    const response = await fetch(
      `${siteUrl}/_api/web/ensureuser('${encodeURIComponent(email)}')`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
      },
    );

    if (!response.ok) return undefined;

    const body = (await response.json()) as { Id?: number };
    return body.Id;
  } catch {
    return undefined;
  }
}

/**
 * Pure resolution of the current SharePoint user's numeric id against
 * a given site URL. Does not cache. Returns undefined on any failure
 * or when `siteUrl` is missing.
 */
export async function resolveCurrentUserId(
  siteUrl: string | undefined,
): Promise<number | undefined> {
  if (!siteUrl) return undefined;
  try {
    const response = await fetch(`${siteUrl}/_api/web/currentuser`, {
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (!response.ok) return undefined;
    const body = (await response.json()) as { Id?: number };
    return body.Id;
  } catch {
    return undefined;
  }
}
