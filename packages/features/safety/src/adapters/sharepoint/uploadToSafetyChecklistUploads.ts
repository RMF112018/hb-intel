import { SAFETY_UPLOAD_LIBRARY_SERVER_RELATIVE_PATH } from '../../lists/safetyUploadLibrary.js';
import { SAFETY_SITE_URL } from '../../lists/descriptors.js';
import type { UploadedWorkbookRef } from '../../domain/types.js';
import { computeChecksum } from '../../parser/xlsxWorkbookView.js';
import { type SpHttpClient } from './spHttp.js';

export interface UploadOptions {
  readonly fileName: string;
}

export async function uploadToSafetyChecklistUploads(
  client: SpHttpClient,
  bytes: ArrayBuffer,
  options: UploadOptions,
): Promise<UploadedWorkbookRef> {
  const checksum = await computeChecksum(bytes);
  const folderUrl = encodeURIComponent(SAFETY_UPLOAD_LIBRARY_SERVER_RELATIVE_PATH);
  const safeName = encodeURIComponent(options.fileName);
  const endpoint = `${SAFETY_SITE_URL}/_api/web/getFolderByServerRelativeUrl('${folderUrl}')/Files/add(url='${safeName}',overwrite=true)`;

  const response = await client.post(endpoint, bytes, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!response.ok) {
    throw new Error(`Upload to Safety Checklist Uploads failed (${response.status}).`);
  }
  const payload = (await response.json()) as {
    UniqueId?: string;
    ServerRelativeUrl?: string;
    ListItemAllFields?: { Id?: number };
  };

  const listItemEndpoint = `${SAFETY_SITE_URL}/_api/web/getFileByServerRelativeUrl('${encodeURIComponent(payload.ServerRelativeUrl ?? '')}')/ListItemAllFields`;
  let sourceUploadItemId = payload.ListItemAllFields?.Id ?? 0;
  if (!sourceUploadItemId) {
    const res = await client.get(listItemEndpoint, {
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (res.ok) {
      const body = (await res.json()) as { Id?: number };
      sourceUploadItemId = body.Id ?? 0;
    }
  }

  const sourceUploadWebUrl = payload.ServerRelativeUrl
    ? `${SAFETY_SITE_URL}${payload.ServerRelativeUrl.replace('/sites/Safety', '')}`
    : `${SAFETY_SITE_URL}/${options.fileName}`;

  return { sourceUploadItemId, sourceUploadWebUrl, checksum };
}
