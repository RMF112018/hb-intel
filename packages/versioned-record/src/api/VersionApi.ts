import { NotificationRegistry, NotificationApi } from '@hbc/notification-intelligence';
import {
  serializeSnapshot,
  requiresFileStorage,
  nextVersionNumber,
  getSnapshotIdsToSupersede,
} from '../utils/versionUtils';
import {
  SP_LIST_NAME,
  SP_FILE_LIBRARY_PATH,
  NOTIFICATION_EVENT_VERSION_CREATED,
} from '../constants';
import type {
  IVersionSnapshot,
  IVersionMetadata,
  ICreateSnapshotInput,
  IRestoreSnapshotInput,
  IRestoreSnapshotResult,
} from '../types';

// ---------------------------------------------------------------------------
// One-time notification event type registration (D-09)
// Must execute before any createSnapshot() call. Safe to call multiple times
// (NotificationRegistry.register is idempotent per SF10 spec).
// ---------------------------------------------------------------------------
NotificationRegistry.register([
  {
    eventType: NOTIFICATION_EVENT_VERSION_CREATED,
    defaultTier: 'digest',
    description: 'A new version of a record you follow was created',
    tierOverridable: true,
    channels: ['digest-email', 'in-app'],
  },
]);

// ---------------------------------------------------------------------------
// SharePoint REST API helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Returns the SharePoint REST API base URL.
 * Resolves from the current site context at runtime.
 */
function spRestUrl(path: string): string {
  const siteUrl = (window as unknown as Record<string, unknown>)['_spPageContextInfo']
    ? ((window as unknown as Record<string, unknown>)['_spPageContextInfo'] as { webAbsoluteUrl: string }).webAbsoluteUrl
    : '';
  return `${siteUrl}/_api/web/lists/GetByTitle('${SP_LIST_NAME}')${path}`;
}

/**
 * Standard SP REST headers for JSON requests.
 */
function spHeaders(method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET'): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json;odata=nometadata',
    'Content-Type': 'application/json;odata=nometadata',
  };
  if (method !== 'GET') {
    (headers as Record<string, string>)['X-HTTP-Method'] = method;
    (headers as Record<string, string>)['IF-MATCH'] = '*';
  }
  return headers;
}

async function spFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`SharePoint API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// File library helpers (D-02 — large snapshot overflow)
// ---------------------------------------------------------------------------

/**
 * Builds the SP file library path for a given snapshot.
 * Convention: `{SP_FILE_LIBRARY_PATH}/{recordType}/{recordId}/{snapshotId}.json`
 */
function fileLibraryPath(recordType: string, recordId: string, snapshotId: string): string {
  return `${SP_FILE_LIBRARY_PATH}/${recordType}/${recordId}/${snapshotId}.json`;
}

/**
 * Writes a JSON string to the SP file library via the Files REST endpoint.
 * Returns the server-relative URL of the created file.
 */
async function writeToFileLibrary(
  recordType: string,
  recordId: string,
  snapshotId: string,
  content: string
): Promise<string> {
  const siteUrl = (window as unknown as Record<string, unknown>)['_spPageContextInfo']
    ? ((window as unknown as Record<string, unknown>)['_spPageContextInfo'] as { webAbsoluteUrl: string }).webAbsoluteUrl
    : '';
  const folderPath = `${SP_FILE_LIBRARY_PATH}/${recordType}/${recordId}`;
  const fileName = `${snapshotId}.json`;
  const uploadUrl = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files/add(url='${fileName}',overwrite=true)`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/octet-stream',
    },
    body: new TextEncoder().encode(content),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`File library write failed ${res.status}: ${body}`);
  }

  return fileLibraryPath(recordType, recordId, snapshotId);
}

/**
 * Reads a JSON file from the SP file library by its server-relative path.
 */
async function readFromFileLibrary<T>(serverRelativePath: string): Promise<T> {
  const siteUrl = (window as unknown as Record<string, unknown>)['_spPageContextInfo']
    ? ((window as unknown as Record<string, unknown>)['_spPageContextInfo'] as { webAbsoluteUrl: string }).webAbsoluteUrl
    : '';
  const url = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativePath}')/$value`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`File library read failed ${res.status} for ${serverRelativePath}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// SharePoint list row type (internal)
// ---------------------------------------------------------------------------

interface SpSnapshotRow {
  SnapshotId: string;
  RecordType: string;
  RecordId: string;
  Version: number;
  Tag: string;
  ChangeSummary: string;
  CreatedByUserId: string;
  CreatedByDisplayName: string;
  CreatedByRole: string;
  CreatedAt: string;
  /** Inline JSON string OR a file reference URI prefixed with 'ref:' */
  SnapshotJson: string;
}

/**
 * Returns true when the SnapshotJson column contains a file reference
 * rather than inline JSON (D-02).
 */
function isFileRef(snapshotJson: string): boolean {
  return snapshotJson.startsWith('ref:');
}

function extractFileRef(snapshotJson: string): string {
  return snapshotJson.slice(4); // strip 'ref:' prefix
}

// ---------------------------------------------------------------------------
// VersionApi — public surface
// ---------------------------------------------------------------------------

export const VersionApi = {
  /**
   * Creates an immutable version snapshot for a record (D-01).
   * Routes the payload to the SP list (inline) or file library (>255KB) transparently (D-02).
   * Fires NotificationApi.send() for each stakeholder after a successful write (D-09).
   * Calls config.onVersionCreated() after notifications are dispatched.
   *
   * Partial-failure compensation: if the file library write succeeds but the list row
   * write fails, the orphaned file is left in place (it is inert without a referencing row)
   * and the error is rethrown. Stale orphaned files can be cleaned up by the maintenance
   * runbook defined in docs/maintenance/.
   */
  async createSnapshot<T>(input: ICreateSnapshotInput<T>): Promise<IVersionSnapshot<T>> {
    const { recordType, recordId, config, snapshot, tag, changeSummary, createdBy } = input;

    // 1. Fetch existing metadata to derive next version number
    const existing = await VersionApi.getMetadataList(recordType, recordId);
    const version = nextVersionNumber(existing);
    const snapshotId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // 2. Serialize snapshot (respecting excludeFields)
    const serialized = serializeSnapshot(
      snapshot as Record<string, unknown>,
      config.excludeFields as string[] | undefined
    );

    // 3. Route to inline or file library (D-02)
    let snapshotJson: string;
    if (requiresFileStorage(serialized)) {
      const fileRef = await writeToFileLibrary(recordType, recordId, snapshotId, serialized);
      snapshotJson = `ref:${fileRef}`;
    } else {
      snapshotJson = serialized;
    }

    // 4. Write list row
    const row: Omit<SpSnapshotRow, 'Id'> = {
      SnapshotId: snapshotId,
      RecordType: recordType,
      RecordId: recordId,
      Version: version,
      Tag: tag,
      ChangeSummary: changeSummary,
      CreatedByUserId: createdBy.userId,
      CreatedByDisplayName: createdBy.displayName,
      CreatedByRole: createdBy.role,
      CreatedAt: createdAt,
      SnapshotJson: snapshotJson,
    };

    await spFetch(spRestUrl('/items'), {
      method: 'POST',
      headers: spHeaders('POST'),
      body: JSON.stringify(row),
    });

    const versionSnapshot: IVersionSnapshot<T> = {
      snapshotId,
      version,
      createdAt,
      createdBy,
      changeSummary,
      tag,
      snapshot,
    };

    // 5. Dispatch notifications (D-09) — fire-and-forget; errors do not roll back the snapshot
    const stakeholderIds = config.getStakeholders(versionSnapshot);
    await Promise.allSettled(
      stakeholderIds.map((recipientUserId) =>
        NotificationApi.send({
          eventType: NOTIFICATION_EVENT_VERSION_CREATED,
          sourceModule: recordType,
          sourceRecordType: recordType,
          sourceRecordId: recordId,
          recipientUserId,
          title: `New version of ${recordType} created`,
          body: changeSummary || `Version ${version} was created`,
          actionUrl: `/records/${recordType}/${recordId}`,
          actionLabel: 'View Record',
        })
      )
    );

    // 6. Post-create callback
    config.onVersionCreated?.(versionSnapshot);

    return versionSnapshot;
  },

  /**
   * Returns all version metadata rows for a record, sorted by version ascending.
   * The `SnapshotJson` column is intentionally NOT included in the metadata
   * response — full payloads load on demand via getSnapshot/getSnapshotById (D-06).
   */
  async getMetadataList(recordType: string, recordId: string): Promise<IVersionMetadata[]> {
    const select = [
      'SnapshotId', 'Version', 'Tag', 'ChangeSummary',
      'CreatedByUserId', 'CreatedByDisplayName', 'CreatedByRole', 'CreatedAt',
      'SnapshotJson', // needed to detect storageRef — only the first 8 chars matter
    ].join(',');

    const filter = `RecordType eq '${recordType}' and RecordId eq '${recordId}'`;
    const url = spRestUrl(`/items?$select=${select}&$filter=${encodeURIComponent(filter)}&$orderby=Version asc`);

    const result = await spFetch<{ value: SpSnapshotRow[] }>(url);

    return result.value.map((row) => ({
      snapshotId: row.SnapshotId,
      version: row.Version,
      createdAt: row.CreatedAt,
      createdBy: {
        userId: row.CreatedByUserId,
        displayName: row.CreatedByDisplayName,
        role: row.CreatedByRole,
      },
      changeSummary: row.ChangeSummary,
      tag: row.Tag as IVersionMetadata['tag'],
      storageRef: isFileRef(row.SnapshotJson)
        ? extractFileRef(row.SnapshotJson)
        : undefined,
    }));
  },

  /**
   * Returns the full snapshot (with payload) for a given record type, record id,
   * and version number. Transparently resolves file-library references (D-02).
   */
  async getSnapshot<T>(
    recordType: string,
    recordId: string,
    version: number
  ): Promise<IVersionSnapshot<T>> {
    const filter = `RecordType eq '${recordType}' and RecordId eq '${recordId}' and Version eq ${version}`;
    const url = spRestUrl(`/items?$filter=${encodeURIComponent(filter)}`);

    const result = await spFetch<{ value: SpSnapshotRow[] }>(url);
    const row = result.value[0];
    if (!row) throw new Error(`Snapshot not found: ${recordType}/${recordId} v${version}`);

    return hydrateSnapshot<T>(row);
  },

  /**
   * Returns the full snapshot by its stable GUID `snapshotId`.
   * Used by `useVersionSnapshot`, acknowledgment deep links (D-07), and
   * rollback operations.
   */
  async getSnapshotById<T>(snapshotId: string): Promise<IVersionSnapshot<T>> {
    const filter = `SnapshotId eq '${snapshotId}'`;
    const url = spRestUrl(`/items?$filter=${encodeURIComponent(filter)}`);

    const result = await spFetch<{ value: SpSnapshotRow[] }>(url);
    const row = result.value[0];
    if (!row) throw new Error(`Snapshot not found: ${snapshotId}`);

    return hydrateSnapshot<T>(row);
  },

  /**
   * Executes a rollback by creating a new snapshot whose payload is a copy of
   * the target version (D-03). Tags all intermediate versions as 'superseded'.
   * Returns the new restored snapshot and the list of superseded snapshotIds.
   *
   * This operation is NOT atomic (SharePoint REST does not support transactions).
   * If the supersede updates fail after the new snapshot is written, the new
   * snapshot still exists and is valid. Partial supersede failures are logged
   * and surfaced in the result but do not throw.
   */
  async restoreSnapshot<T>(input: IRestoreSnapshotInput<T>): Promise<IRestoreSnapshotResult<T>> {
    const { recordType, recordId, targetSnapshotId, restoredBy, config } = input;

    // 1. Fetch the target snapshot's full payload
    const targetSnapshot = await VersionApi.getSnapshotById<T>(targetSnapshotId);

    // 2. Determine which versions to supersede (D-03)
    const metadata = await VersionApi.getMetadataList(recordType, recordId);
    const toSupersede = getSnapshotIdsToSupersede(metadata, targetSnapshotId);

    // 3. Create the new restored snapshot
    const restoredSnapshot = await VersionApi.createSnapshot<T>({
      recordType,
      recordId,
      config,
      snapshot: targetSnapshot.snapshot,
      tag: targetSnapshot.tag === 'approved' ? 'approved' : 'draft',
      changeSummary: `Restored from v${targetSnapshot.version} by ${restoredBy.displayName}`,
      createdBy: restoredBy,
    });

    // 4. Tag superseded versions (best-effort — partial failures are tolerated)
    const supersededResults = await Promise.allSettled(
      toSupersede.map((snapId) => VersionApi.tagSnapshot(snapId, 'superseded'))
    );

    const successfullySuperseded = toSupersede.filter(
      (_, i) => supersededResults[i]?.status === 'fulfilled'
    );

    return {
      restoredSnapshot,
      supersededSnapshotIds: successfullySuperseded,
    };
  },

  /**
   * Updates the tag on an existing snapshot row.
   * Used by restoreSnapshot() to mark versions as 'superseded'.
   * Internal — not exported from the public barrel.
   */
  async tagSnapshot(snapshotId: string, tag: string): Promise<void> {
    // First find the list item's numeric ID (required for PATCH)
    const filter = `SnapshotId eq '${snapshotId}'`;
    const url = spRestUrl(`/items?$select=Id&$filter=${encodeURIComponent(filter)}`);
    const result = await spFetch<{ value: Array<{ Id: number }> }>(url);
    const item = result.value[0];
    if (!item) return;

    await spFetch(spRestUrl(`/items(${item.Id})`), {
      method: 'POST',
      headers: spHeaders('PATCH'),
      body: JSON.stringify({ Tag: tag }),
    });
  },
};

// ---------------------------------------------------------------------------
// Internal hydration helper
// ---------------------------------------------------------------------------

async function hydrateSnapshot<T>(row: SpSnapshotRow): Promise<IVersionSnapshot<T>> {
  let snapshot: T;

  if (isFileRef(row.SnapshotJson)) {
    // Large snapshot — fetch from file library (D-02)
    snapshot = await readFromFileLibrary<T>(extractFileRef(row.SnapshotJson));
  } else {
    snapshot = JSON.parse(row.SnapshotJson) as T;
  }

  return {
    snapshotId: row.SnapshotId,
    version: row.Version,
    createdAt: row.CreatedAt,
    createdBy: {
      userId: row.CreatedByUserId,
      displayName: row.CreatedByDisplayName,
      role: row.CreatedByRole,
    },
    changeSummary: row.ChangeSummary,
    tag: row.Tag as IVersionSnapshot<T>['tag'],
    snapshot,
  };
}
