/**
 * Fetch the SharePoint request digest required for write operations.
 * The digest token authenticates POST/PATCH/DELETE requests against
 * the SharePoint REST API.
 */
export async function fetchRequestDigest(siteUrl: string): Promise<string> {
  const response = await fetch(`${siteUrl}/_api/contextinfo`, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get request digest: ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as { FormDigestValue?: string };
  if (!body.FormDigestValue) {
    throw new Error('Request digest not found in contextinfo response');
  }

  return body.FormDigestValue;
}
