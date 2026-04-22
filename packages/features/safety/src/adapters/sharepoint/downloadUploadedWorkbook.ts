/**
 * Download a previously uploaded workbook from `Safety Checklist Uploads`
 * by its list item Id.
 *
 * Declared in Wave 1 so the replay surface is reachable from the hosted
 * runtime path; wired into retry/replay by Wave 2.
 */

import { SAFETY_SITE_URL } from '../../lists/descriptors.js';
import { resolveUploadLibraryDescriptor } from '../../lists/safetyUploadLibrary.js';
import type { SpHttpClient } from './spHttp.js';

export interface DownloadedWorkbook {
  readonly bytes: ArrayBuffer;
  readonly sourceUploadItemId: number;
}

export async function downloadUploadedWorkbook(
  client: SpHttpClient,
  sourceUploadItemId: number,
): Promise<DownloadedWorkbook> {
  const library = resolveUploadLibraryDescriptor();
  const endpoint =
    library.id && library.id !== '00000000-0000-0000-0000-000000000000'
      ? `${SAFETY_SITE_URL}/_api/web/lists(guid'${library.id}')/items(${sourceUploadItemId})/File/$value`
      : `${SAFETY_SITE_URL}/_api/web/lists/getbytitle('${escapeODataString(library.title)}')/items(${sourceUploadItemId})/File/$value`;

  const response = await client.get(endpoint, {
    headers: { Accept: 'application/octet-stream' },
  });
  if (!response.ok) {
    throw new Error(
      `Download from Safety Checklist Uploads failed (item ${sourceUploadItemId}, status ${response.status}).`,
    );
  }
  const bytes = await response.arrayBuffer();
  return { bytes, sourceUploadItemId };
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
