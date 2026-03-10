# SF06-T07 — Storage and Integration

**Package:** `packages/versioned-record/`
**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Depends On:** T01 (scaffold), T02 (contracts)
**Blocks:** T04 (hooks reference VersionApi), T05, T06 (components reference VersionApi), T08 (testing)

---

## Objective

Implement `VersionApi.ts` — the full storage adapter for `@hbc/versioned-record`. This file owns:
- All CRUD operations against the `HbcVersionSnapshots` SharePoint list
- Transparent inline/file-library routing at the 255KB threshold (D-02)
- Notification registration and send (D-09)
- Rollback append-only semantics (D-03)
- The SharePoint list provisioning script
- Cross-package integration wiring documentation for `@hbc/acknowledgment` (D-07) and `@hbc/step-wizard` (D-08)

---

## File: `src/api/VersionApi.ts`

```typescript
import { NotificationRegistry, NotificationApi } from '@hbc/notification-intelligence';
import {
  serializeSnapshot,
  requiresFileStorage,
  nextVersionNumber,
  getSnapshotIdsToSupersede,
  LARGE_SNAPSHOT_THRESHOLD_BYTES,
  SP_LIST_NAME,
  SP_FILE_LIBRARY_PATH,
  NOTIFICATION_EVENT_VERSION_CREATED,
} from '../utils/versionUtils';
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
  const siteUrl = (window as Record<string, unknown>)['_spPageContextInfo']
    ? ((window as Record<string, unknown>)['_spPageContextInfo'] as { webAbsoluteUrl: string }).webAbsoluteUrl
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
  const siteUrl = (window as Record<string, unknown>)['_spPageContextInfo']
    ? ((window as Record<string, unknown>)['_spPageContextInfo'] as { webAbsoluteUrl: string }).webAbsoluteUrl
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
  const siteUrl = (window as Record<string, unknown>)['_spPageContextInfo']
    ? ((window as Record<string, unknown>)['_spPageContextInfo'] as { webAbsoluteUrl: string }).webAbsoluteUrl
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
```

---

## SharePoint List Schema — `HbcVersionSnapshots`

### Provisioning Script: `scripts/provision-versioned-record.ps1`

```powershell
# provision-versioned-record.ps1
# Provisions the HbcVersionSnapshots SharePoint list in the root site collection.
# Run once per environment (dev, staging, prod).
# Prerequisites: PnP PowerShell module, appropriate SP admin permissions.

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [string]$ListTitle = "HbcVersionSnapshots"
)

Connect-PnPOnline -Url $SiteUrl -UseWebLogin

# Create the list if it does not exist
$list = Get-PnPList -Identity $ListTitle -ErrorAction SilentlyContinue
if (-not $list) {
  New-PnPList -Title $ListTitle -Template GenericList -OnQuickLaunch:$false
  Write-Host "Created list: $ListTitle"
}

# Add columns
$columns = @(
  @{ Name = "SnapshotId";          Type = "Text";     MaxLength = 100;  Description = "GUID primary key" },
  @{ Name = "RecordType";          Type = "Choice";   Choices = @("bd-scorecard","project-pmp","bd-intelligence","pursuit","handoff"); Description = "Record type namespace" },
  @{ Name = "RecordId";            Type = "Text";     MaxLength = 100;  Description = "Parent record identifier" },
  @{ Name = "Version";             Type = "Number";                     Description = "Auto-incremented version per RecordId" },
  @{ Name = "Tag";                 Type = "Choice";   Choices = @("draft","submitted","approved","rejected","archived","handoff","superseded"); Description = "Workflow tag at snapshot time" },
  @{ Name = "ChangeSummary";       Type = "Note";     UnlimitedLength = $true; Description = "Human or auto-generated summary" },
  @{ Name = "CreatedByUserId";     Type = "Text";     MaxLength = 200;  Description = "Author user ID" },
  @{ Name = "CreatedByDisplayName";Type = "Text";     MaxLength = 200;  Description = "Author display name" },
  @{ Name = "CreatedByRole";       Type = "Text";     MaxLength = 200;  Description = "Author role at time of creation" },
  @{ Name = "CreatedAt";           Type = "DateTime";                   Description = "UTC ISO 8601 creation timestamp" },
  @{ Name = "SnapshotJson";        Type = "Note";     UnlimitedLength = $true; Description = "Full JSON snapshot or ref:<fileLibraryPath> for large payloads" }
)

foreach ($col in $columns) {
  $existing = Get-PnPField -List $ListTitle -Identity $col.Name -ErrorAction SilentlyContinue
  if (-not $existing) {
    $params = @{
      List        = $ListTitle
      DisplayName = $col.Name
      InternalName = $col.Name
      Type        = $col.Type
    }
    if ($col.MaxLength)   { $params.MaxLength = $col.MaxLength }
    if ($col.Choices)     { $params.Choices   = $col.Choices   }
    Add-PnPField @params
    Write-Host "Added column: $($col.Name)"
  } else {
    Write-Host "Column already exists: $($col.Name)"
  }
}

# Create index on RecordType + RecordId for fast filtered queries
$indexFields = @("RecordType", "RecordId")
foreach ($f in $indexFields) {
  $field = Get-PnPField -List $ListTitle -Identity $f
  Set-PnPField -List $ListTitle -Identity $field.Id -Values @{ Indexed = $true }
  Write-Host "Indexed field: $f"
}

# Create the Snapshots folder in Shared Documents for large payload storage
$folderPath = "Shared Documents/System/Snapshots"
$folder = Get-PnPFolder -Url $folderPath -ErrorAction SilentlyContinue
if (-not $folder) {
  Add-PnPFolder -Name "Snapshots" -Folder "Shared Documents/System"
  Write-Host "Created file library folder: $folderPath"
}

Write-Host "HbcVersionSnapshots provisioning complete."
Disconnect-PnPOnline
```

---

## Cross-Package Amendment Notices

### 1. `@hbc/acknowledgment` (SF04) — No code amendment required

The `IAcknowledgmentConfig` in SF04 already includes a generic `contextPayload?: Record<string, unknown>` field. No changes to the SF04 package are needed.

**Required adoption pattern** (consuming module responsibility — document in T09):

```typescript
// In any module that combines versioning + acknowledgment (e.g., BD Scorecard director review)
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';
import { VersionApi } from '@hbc/versioned-record';

// Step 1: Create a version snapshot on submission
const snapshot = await VersionApi.createSnapshot({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  config: scorecardVersionConfig,
  snapshot: scorecard,
  tag: 'submitted',
  changeSummary: `Submitted for director review by ${currentUser.displayName}`,
  createdBy: { userId: currentUser.id, displayName: currentUser.displayName, role: currentUser.role },
});

// Step 2: Open acknowledgment with version pinned in contextPayload (D-07)
openAcknowledgment({
  recordType: 'bd-scorecard',
  recordId: scorecard.id,
  requestedFrom: directorUser,
  contextPayload: {
    version: snapshot.version,
    snapshotId: snapshot.snapshotId,
  },
});
```

The `contextPayload` is stored opaquely by `@hbc/acknowledgment` and surfaced in the acknowledgment audit trail. The consuming module is responsible for rendering "Approved v{version}" by reading `contextPayload.version` from the acknowledgment record.

### 2. `@hbc/step-wizard` (SF05) — No code amendment required

The SF05 package requires no changes. `VersionApi.createSnapshot()` is called at wizard stage-gate transitions in the consuming module's `onAllComplete` (or equivalent stage callback). Per D-08, intermediate step completions are not versioned.

**Required adoption pattern for stage-gate wiring** (consuming module responsibility — document in T09):

```typescript
// In the BD scorecard wizard consuming module
import { useStepWizard } from '@hbc/step-wizard';
import { VersionApi } from '@hbc/versioned-record';

const { advance, state } = useStepWizard(scorecardWizardConfig, scorecard);

// In the "Submit for Review" step handler (stage gate: draft → submitted)
async function handleSubmitForReview() {
  // 1. Create version snapshot at the stage gate (D-08)
  await VersionApi.createSnapshot({
    recordType: 'bd-scorecard',
    recordId: scorecard.id,
    config: scorecardVersionConfig,
    snapshot: scorecard,
    tag: 'submitted',
    changeSummary: scorecardVersionConfig.generateChangeSummary?.(previousScorecard, scorecard) ?? '',
    createdBy: currentUser,
  });

  // 2. Advance the wizard step
  await advance('submit-for-review');
}
```

### 3. `@hbc/notification-intelligence` (SF10) — Registry call already in `VersionApi.ts`

The `NotificationRegistry.register()` call at the top of `VersionApi.ts` satisfies SF10's platform registration requirement. No amendment to SF10 is needed. If `@hbc/notification-intelligence` is not yet available in the workspace during development, the `src/test/setup.ts` mock in T01 provides the stub.

---

## Smoke Test Commands

```bash
# 1. Verify SP list exists and has all required columns (run after provisioning)
# Replace <SITE_URL> with the target environment URL
pwsh scripts/provision-versioned-record.ps1 -SiteUrl "https://yourtenant.sharepoint.com/sites/hb-intel" -WhatIf

# 2. Run VersionApi unit tests against mocked SP responses
cd packages/versioned-record && pnpm test -- --reporter=verbose src/api/__tests__/VersionApi.test.ts

# 3. TypeScript check
cd packages/versioned-record && pnpm typecheck

# 4. Verify notification mock fires in test environment
cd packages/versioned-record && pnpm test -- --reporter=verbose --grep "notification"
```

---

## Representative Unit Tests

```typescript
// src/api/__tests__/VersionApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VersionApi } from '../VersionApi';
import { NotificationApi } from '@hbc/notification-intelligence';

// fetch is mocked globally via jsdom
const mockFetch = vi.fn();
global.fetch = mockFetch;

const makeListResponse = (rows: unknown[]) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ value: rows }) } as Response);

const makePostResponse = () =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: vi.fn().mockReturnValue(['user-1', 'user-2']),
  onVersionCreated: vi.fn(),
};

describe('VersionApi.createSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // getMetadataList returns empty (first version)
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ value: [] }) } as unknown as Response)
      // createSnapshot POST
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as unknown as Response);
  });

  it('creates version 1 for a new record', async () => {
    const result = await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: { score: 42 },
      tag: 'submitted',
      changeSummary: 'Initial submission',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(result.version).toBe(1);
    expect(result.tag).toBe('submitted');
    expect(result.snapshotId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('calls NotificationApi.send for each stakeholder (D-09)', async () => {
    await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: { score: 42 },
      tag: 'submitted',
      changeSummary: 'Test',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(NotificationApi.send).toHaveBeenCalledTimes(2);
    expect(NotificationApi.send).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUserId: 'user-1' })
    );
  });

  it('calls config.onVersionCreated callback', async () => {
    await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: { score: 42 },
      tag: 'submitted',
      changeSummary: 'Test',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(mockConfig.onVersionCreated).toHaveBeenCalledOnce();
  });
});

describe('VersionApi.getMetadataList', () => {
  it('returns metadata without snapshot payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        value: [{
          SnapshotId: 'snap-1',
          Version: 1,
          Tag: 'approved',
          ChangeSummary: 'Initial',
          CreatedByUserId: 'u1',
          CreatedByDisplayName: 'Alice',
          CreatedByRole: 'PM',
          CreatedAt: '2026-01-01T00:00:00Z',
          SnapshotJson: '{"score":42}',
        }],
      }),
    } as unknown as Response);

    const result = await VersionApi.getMetadataList('bd-scorecard', 'rec-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.version).toBe(1);
    // No snapshot property on IVersionMetadata
    expect('snapshot' in result[0]!).toBe(false);
    // storageRef is undefined for inline snapshots
    expect(result[0]?.storageRef).toBeUndefined();
  });

  it('sets storageRef for file-library snapshots (D-02)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        value: [{
          SnapshotId: 'snap-big',
          Version: 1,
          Tag: 'approved',
          ChangeSummary: '',
          CreatedByUserId: 'u1',
          CreatedByDisplayName: 'Alice',
          CreatedByRole: 'PM',
          CreatedAt: '2026-01-01T00:00:00Z',
          SnapshotJson: 'ref:/sites/hb-intel/Shared Documents/System/Snapshots/bd-scorecard/rec-1/snap-big.json',
        }],
      }),
    } as unknown as Response);

    const result = await VersionApi.getMetadataList('bd-scorecard', 'rec-1');
    expect(result[0]?.storageRef).toContain('snap-big.json');
  });
});
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF06-T07 completed: 2026-03-10
Files created/modified:
  - src/api/VersionApi.ts — full implementation replacing stub (CRUD, D-02 routing, D-09 notifications, D-03 rollback)
  - src/__mocks__/notification-intelligence.ts — added NotificationRegistry + NotificationApi exports
  - scripts/provision-versioned-record.ps1 — SP list provisioning script
  - src/api/__tests__/VersionApi.test.ts — 5 tests (createSnapshot v1, notifications, callback, metadata, storageRef)
  - tsconfig.json — fixed @hbc/notification-intelligence path mapping (baseUrl-relative)
Import fix: split spec's single versionUtils import into two (constants from ../constants, utilities from ../utils/versionUtils)
Window cast fix: used `window as unknown as Record<string, unknown>` for strict TS compliance
Verification: build ✅ | check-types ✅ | lint ✅ | 90 tests pass (85 prior + 5 new) ✅
Next: T08 (testing), T04/T05/T06 (hooks/components — now unblocked)
-->
