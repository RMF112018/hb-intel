import { resolveUploadLibraryDescriptor } from '../../lists/safetyUploadLibrary.js';
import { SAFETY_SITE_URL } from '../../lists/descriptors.js';
import type { UploadedWorkbookRef } from '../../domain/types.js';
import { computeChecksum } from '../../parser/xlsxWorkbookView.js';
import { type SpHttpClient } from './spHttp.js';

export interface UploadOptions {
  readonly fileName: string;
}

export type UploadFailureKind =
  | 'permission'
  | 'not-found'
  | 'binding'
  | 'metadata-lookup'
  | 'unknown';

export class SafetyUploadError extends Error {
  readonly kind: UploadFailureKind;
  readonly status: number;
  readonly stage: 'upload-post' | 'list-item-lookup';

  constructor(params: {
    kind: UploadFailureKind;
    status: number;
    stage: 'upload-post' | 'list-item-lookup';
    message: string;
  }) {
    super(params.message);
    this.name = 'SafetyUploadError';
    this.kind = params.kind;
    this.status = params.status;
    this.stage = params.stage;
  }
}

export async function uploadToSafetyChecklistUploads(
  client: SpHttpClient,
  bytes: ArrayBuffer,
  options: UploadOptions,
): Promise<UploadedWorkbookRef> {
  const checksum = await computeChecksum(bytes);
  const library = resolveUploadLibraryDescriptor();
  if (!library.id || library.id === '00000000-0000-0000-0000-000000000000') {
    throw new SafetyUploadError({
      kind: 'binding',
      status: 0,
      stage: 'upload-post',
      message:
        'Upload library identity is not bound. SafetyChecklistUploads GUID must be configured before upload.',
    });
  }
  const safeName = encodeURIComponent(options.fileName);
  const endpoint =
    `${SAFETY_SITE_URL}/_api/web/lists(guid'${library.id}')/RootFolder/Files` +
    `/add(url='${safeName}',overwrite=true)`;

  const response = await client.post(endpoint, bytes, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!response.ok) {
    throw new SafetyUploadError({
      kind: classifyUploadFailure(response.status),
      status: response.status,
      stage: 'upload-post',
      message: `Upload to Safety Checklist Uploads failed (${response.status}).`,
    });
  }
  const payload = (await response.json()) as {
    UniqueId?: string;
    ServerRelativeUrl?: string;
    ListItemAllFields?: { Id?: number };
  };

  const listItemEndpoint =
    `${SAFETY_SITE_URL}/_api/web/getFileByServerRelativeUrl('` +
    `${encodeURIComponent(payload.ServerRelativeUrl ?? '')}')/ListItemAllFields`;
  let sourceUploadItemId = payload.ListItemAllFields?.Id ?? 0;
  if (!sourceUploadItemId) {
    const res = await client.get(listItemEndpoint, {
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (!res.ok) {
      throw new SafetyUploadError({
        kind: 'metadata-lookup',
        status: res.status,
        stage: 'list-item-lookup',
        message:
          `Workbook upload succeeded, but metadata lookup failed (${res.status}) ` +
          'while resolving ListItemAllFields.',
      });
    }
    const body = (await res.json()) as { Id?: number };
    sourceUploadItemId = body.Id ?? 0;
  }

  const sourceUploadWebUrl = payload.ServerRelativeUrl
    ? `${SAFETY_SITE_URL}${payload.ServerRelativeUrl.replace('/sites/Safety', '')}`
    : `${SAFETY_SITE_URL}/${options.fileName}`;

  return { sourceUploadItemId, sourceUploadWebUrl, checksum };
}

function classifyUploadFailure(status: number): UploadFailureKind {
  if (status === 403) return 'permission';
  if (status === 404) return 'not-found';
  return 'unknown';
}
