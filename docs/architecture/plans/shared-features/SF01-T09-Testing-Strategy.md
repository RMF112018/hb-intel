# SF01-T09: Testing Strategy

**Package:** `@hbc/sharepoint-docs`
**Wave:** 4 — Testing & Deployment
**Estimated effort:** 1.0 sprint-week
**Prerequisite tasks:** SF01-T01 through SF01-T08 (all implementation tasks)
**Governed by:** CLAUDE.md v1.2 §8 (Verification Protocol); Interview decisions D-01 through D-12
**Coverage target:** ≥95% branches, functions, lines, statements on `FolderManager`, `UploadService`, `MigrationService`, `OfflineQueueManager` per Definition of Done

---

## 1. Testing Architecture

| Layer | Tool | Scope |
|---|---|---|
| Unit tests | Vitest + Testing Library | Individual classes and React components in isolation |
| Integration tests | Vitest + MSW (Mock Service Worker) | Service interactions with mocked Graph API responses |
| E2E tests | Playwright | Full upload → offline queue → reconnect → migration → tombstone → conflict resolution flow |
| Infrastructure tests | PnP PowerShell `Pester` | SharePoint list schema and folder structure validation |

---

## 2. Test Setup

### `src/__tests__/setup.ts`

```typescript
import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server.js';

// MSW server for mocking Graph API calls through the Azure Functions proxy
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock sessionStorage for OfflineQueueManager tests
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  get: () => true,
});

// Mock crypto.randomUUID for deterministic test IDs
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid-1234'),
}));
```

### `src/__tests__/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

/** Base URL of the Azure Functions backend proxy — matches VITE_API_BASE_URL in test env. */
const API_BASE = 'http://localhost:7071';

export const server = setupServer(
  // folder-exists endpoint
  http.get(`${API_BASE}/api/sharepoint/folder-exists`, () => {
    return HttpResponse.json({ exists: false });
  }),

  // folder creation
  http.post(`${API_BASE}/api/sharepoint/folder`, () => {
    return HttpResponse.json({ ok: true });
  }),

  // folder URL
  http.get(`${API_BASE}/api/sharepoint/folder-url`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test-Project_Smith' });
  }),

  // small file upload
  http.post(`${API_BASE}/api/sharepoint/file-upload`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test-Project_Smith/RFP/test.pdf' });
  }),

  // upload session creation
  http.post(`${API_BASE}/api/sharepoint/upload-session`, () => {
    return HttpResponse.json({ uploadUrl: `${API_BASE}/api/sharepoint/upload-chunk-session/abc123` });
  }),

  // chunk upload (returns 202 for intermediate, 200 with URL for last chunk)
  http.put(`${API_BASE}/api/sharepoint/upload-chunk`, ({ request }) => {
    const range = request.headers.get('Content-Range') ?? '';
    const [, rangeEnd, total] = range.match(/bytes (\d+)-(\d+)\/(\d+)/) ?? [];
    if (rangeEnd === total) {
      return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/.../large-file.rvt' }, { status: 200 });
    }
    return new HttpResponse(null, { status: 202 });
  }),

  // file move
  http.post(`${API_BASE}/api/sharepoint/file-move`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/project-123/.../test.pdf' });
  }),

  // URL file creation (tombstone)
  http.post(`${API_BASE}/api/sharepoint/url-file`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/.../test.pdf.migrated.url' });
  }),

  // list files in folder
  http.get(`${API_BASE}/api/sharepoint/folder-files`, () => {
    return HttpResponse.json([
      { name: 'existing-doc.pdf', size: 1024000, url: 'https://...', modifiedAt: '2026-03-01T10:00:00Z' },
    ]);
  }),

  // SharePoint list operations (document registry)
  http.post('https://contoso.sharepoint.com/sites/hb-intel/_api/web/lists/getbytitle*/items', () => {
    return HttpResponse.json({ id: 42 });
  }),
);
```

---

## 3. Unit Tests — `FolderManager`

```typescript
// src/__tests__/api/FolderManager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FolderManager } from '../../api/FolderManager.js';
import type { IDocumentContextConfig } from '../../types/index.js';

const makeConfig = (overrides: Partial<IDocumentContextConfig> = {}): IDocumentContextConfig => ({
  contextId: 'ctx-123',
  contextType: 'bd-lead',
  contextLabel: 'BD Lead: Riverside Medical Center Expansion',
  siteUrl: null,
  ownerUpn: 'jmartinez@hbc.com',
  ownerLastName: 'Martinez',
  ...overrides,
});

describe('FolderManager.buildFolderName', () => {
  let fm: FolderManager;

  beforeEach(() => {
    fm = new FolderManager(null as never, null as never, null as never);
    // Fix the date to 2026-03-08 for deterministic tests
    vi.setSystemTime(new Date('2026-03-08T14:30:00Z'));
  });

  it('produces correct yyyymmdd_{Name}_{LastName} format', () => {
    const name = fm.buildFolderName(makeConfig());
    expect(name).toBe('20260308_BD-Lead-Riverside-Medical-Center-Expansion_Martinez');
  });

  it('sanitizes spaces to underscores', () => {
    const name = fm.sanitizeName('My Great Project Name');
    expect(name).toBe('My_Great_Project_Name');
  });

  it('strips special characters', () => {
    const name = fm.sanitizeName('Project: "Alpha" & Beta (v2.0)');
    expect(name).toBe('Project_Alpha__Beta_v20');
  });

  it('truncates name at 80 characters', () => {
    const longName = 'A'.repeat(100);
    expect(fm.sanitizeName(longName)).toHaveLength(80);
  });

  it('strips diacritics from last name', () => {
    const cfg = makeConfig({ ownerLastName: 'Núñez' });
    const name = fm.buildFolderName(cfg);
    expect(name).toContain('_Nunez');
  });

  it('strips non-alpha characters from last name', () => {
    const name = fm.sanitizeLastName("O'Brien-Smith");
    expect(name).toBe('OBrienSmith');
  });

  it('folder name is stable — does not change if called twice with same config', () => {
    const name1 = fm.buildFolderName(makeConfig());
    const name2 = fm.buildFolderName(makeConfig());
    expect(name1).toBe(name2);
  });
});

describe('FolderManager.resolveOrCreate', () => {
  it('returns existing context if registry entry found', async () => {
    const mockRegistry = {
      findByContextId: vi.fn().mockResolvedValue({
        stagingUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith/test.pdf',
        fileName: 'test.pdf',
        folderName: '20260308_Test_Smith',
        uploadedAt: '2026-03-08T10:00:00Z',
      }),
    };
    const fm = new FolderManager(null as never, null as never, mockRegistry as never);
    const result = await fm.resolveOrCreate(makeConfig());
    expect(result.wasExisting).toBe(true);
    expect(mockRegistry.findByContextId).toHaveBeenCalledWith('ctx-123');
  });

  it('creates folder when not found in registry or SharePoint', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_BD-Lead-Riverside_Martinez'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never);
    const result = await fm.resolveOrCreate(makeConfig());
    expect(result.wasExisting).toBe(false);
    expect(mockApi.createFolder).toHaveBeenCalled();
    expect(mockPermissions.applyDefaultPermissions).toHaveBeenCalled();
  });
});
```

---

## 4. Unit Tests — `UploadService`

```typescript
// src/__tests__/services/UploadService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { UploadService } from '../../services/UploadService.js';
import { SIZE_STANDARD_MAX, SIZE_CONFIRM_MAX } from '../../constants/fileSizeLimits.js';

const makeFile = (name: string, size: number, type = 'application/pdf'): File =>
  new File([new ArrayBuffer(size)], name, { type });

describe('UploadService.validate', () => {
  const svc = new UploadService(null as never, null as never, null as never);

  it('returns null for a valid PDF under 250 MB', () => {
    expect(svc.validate(makeFile('report.pdf', 1024 * 1024))).toBeNull();
  });

  it('blocks .exe files', () => {
    const error = svc.validate(makeFile('virus.exe', 1000));
    expect(error?.code).toBe('BLOCKED_EXTENSION');
  });

  it('blocks .ps1 files', () => {
    const error = svc.validate(makeFile('script.ps1', 500));
    expect(error?.code).toBe('BLOCKED_EXTENSION');
  });

  it('requires confirmation for files 250MB–1GB', () => {
    const error = svc.validate(makeFile('large-model.rvt', SIZE_STANDARD_MAX + 1));
    expect(error?.code).toBe('REQUIRES_CONFIRMATION');
  });

  it('hard-blocks files over 1 GB', () => {
    const error = svc.validate(makeFile('giant.zip', SIZE_CONFIRM_MAX + 1));
    expect(error?.code).toBe('EXCEEDS_HARD_LIMIT');
  });

  it('accepts .rvt (Revit) files under 250 MB', () => {
    expect(svc.validate(makeFile('building.rvt', 50 * 1024 * 1024))).toBeNull();
  });

  it('accepts .dwg (CAD) files', () => {
    expect(svc.validate(makeFile('floorplan.dwg', 5 * 1024 * 1024))).toBeNull();
  });
});

describe('UploadService.upload', () => {
  it('throws for unconfirmed large file', async () => {
    const svc = new UploadService(null as never, null as never, null as never);
    const file = makeFile('large.rvt', SIZE_STANDARD_MAX + 1);
    await expect(svc.upload({ file, contextConfig: null as never })).rejects.toThrow('Large file requires confirmation');
  });

  it('routes files ≤4MB to uploadSmallFile', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(42) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    const file = makeFile('small.pdf', 1 * 1024 * 1024);  // 1 MB
    await svc.upload({ file, contextConfig: { contextId: 'x', contextType: 'bd-lead', contextLabel: 'Test', siteUrl: null, ownerUpn: 'u@h.com', ownerLastName: 'Smith' } });
    expect(mockApi.uploadSmallFile).toHaveBeenCalled();
  });
});
```

---

## 5. Unit Tests — `MigrationService`

```typescript
// src/__tests__/services/MigrationService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MigrationService } from '../../services/MigrationService.js';
import type { IScheduledMigration, IUploadedDocument } from '../../types/index.js';

const makeScheduledMigration = (): IScheduledMigration => ({
  jobId: 'job-001',
  sourceContextId: 'ctx-123',
  destinationProjectId: 'proj-456',
  destinationSiteUrl: 'https://contoso.sharepoint.com/sites/project-456',
  destinationLibraryPath: 'Shared Documents/Estimating',
  notifyUserUpns: ['pm@hbc.com', 'est@hbc.com'],
  directorUpn: 'director@hbc.com',
  scheduledWindowStart: '2026-03-08T22:00:00',
  scheduledWindowEnd: '2026-03-09T02:00:00',
  preNotificationSentAt: '2026-03-08T14:00:00',
  createdAt: '2026-03-08T09:00:00',
  status: 'in-progress',
});

describe('MigrationService.execute — checkpoint resume', () => {
  it('skips documents already marked completed in MigrationLog', async () => {
    const completedDocId = 'doc-001';
    const pendingDocId = 'doc-002';

    const mockRegistry = {
      listByContextId: vi.fn().mockResolvedValue([
        { id: completedDocId, fileName: 'a.pdf', migrationStatus: 'migrated', sharepointUrl: 'https://sp.com/a.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/a.pdf' },
        { id: pendingDocId, fileName: 'b.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/b.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/b.pdf' },
      ] as IUploadedDocument[]),
      updateMigrationStatus: vi.fn().mockResolvedValue(undefined),
    };

    const mockMigrationLog = {
      filterPending: vi.fn().mockResolvedValue([pendingDocId]),  // Only pendingDocId is pending
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    const mockConflictDetector = { check: vi.fn().mockResolvedValue(null) };
    const mockApi = { moveFile: vi.fn().mockResolvedValue('https://sp.com/project/b.pdf') };
    const mockTombstone = { create: vi.fn().mockResolvedValue('https://sp.com/b.pdf.migrated.url') };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(1);  // completed doc was skipped
    expect(mockApi.moveFile).toHaveBeenCalledTimes(1);  // only b.pdf was moved
    expect(mockMigrationLog.setCheckpoint).toHaveBeenCalledWith('job-001', pendingDocId, 'in-progress');
  });

  it('routes conflicting files to conflict queue and continues migrating others', async () => {
    const conflictDocId = 'doc-conflict';
    const cleanDocId = 'doc-clean';

    const mockRegistry = {
      listByContextId: vi.fn().mockResolvedValue([
        { id: conflictDocId, fileName: 'existing-doc.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/existing-doc.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/existing-doc.pdf' },
        { id: cleanDocId, fileName: 'new-doc.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/new-doc.pdf', fileSize: 2000, stagingUrl: 'https://sp.com/new-doc.pdf' },
      ] as IUploadedDocument[]),
      updateMigrationStatus: vi.fn().mockResolvedValue(undefined),
    };

    const mockMigrationLog = {
      filterPending: vi.fn().mockResolvedValue([conflictDocId, cleanDocId]),
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    // conflictDocId has a collision; cleanDocId does not
    const mockConflictDetector = {
      check: vi.fn()
        .mockResolvedValueOnce({ existingFileUrl: 'https://...', existingFileSizeBytes: 500, existingFileModifiedAt: '...' })
        .mockResolvedValueOnce(null),
      registerConflict: vi.fn().mockResolvedValue(undefined),
    };
    const mockApi = { moveFile: vi.fn().mockResolvedValue('https://sp.com/project/new-doc.pdf') };
    const mockTombstone = { create: vi.fn().mockResolvedValue('https://sp.com/new-doc.pdf.migrated.url') };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.conflictCount).toBe(1);
    expect(result.migratedCount).toBe(1);
    expect(mockApi.moveFile).toHaveBeenCalledTimes(1);  // only clean doc was moved
    expect(mockConflictResolver.scheduleWatchdogs).toHaveBeenCalledWith('job-001');
  });
});

describe('TombstoneWriter.create', () => {
  it('produces valid .url file content with destination link', async () => {
    const mockApi = {
      uploadSmallFile: vi.fn().mockImplementation(async (_siteUrl, _path, file) => {
        const text = await file.text();
        expect(text).toContain('[InternetShortcut]');
        expect(text).toContain('URL=https://project.sharepoint.com/file.pdf');
        return 'https://sp.com/file.pdf.migrated.url';
      }),
    };

    const { TombstoneWriter } = await import('../../api/TombstoneWriter.js');
    const writer = new TombstoneWriter(mockApi as never);

    const url = await writer.create({
      siteUrl: 'https://sp.com',
      sourceFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith/RFP',
      originalFileName: 'file.pdf',
      destinationUrl: 'https://project.sharepoint.com/file.pdf',
      destinationLabel: 'Project Site',
      documentId: 'doc-001',
    });

    expect(url).toBe('https://sp.com/file.pdf.migrated.url');
  });
});
```

---

## 6. Unit Tests — `OfflineQueueManager`

```typescript
// src/__tests__/services/OfflineQueueManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OfflineQueueManager } from '../../services/OfflineQueueManager.js';
import { SIZE_OFFLINE_MAX } from '../../constants/fileSizeLimits.js';

const makeFile = (name: string, size: number): File =>
  new File([new ArrayBuffer(size)], name, { type: 'application/pdf' });

describe('OfflineQueueManager', () => {
  let mgr: OfflineQueueManager;

  beforeEach(() => {
    sessionStorage.clear();
    mgr = new OfflineQueueManager();
  });

  it('throws when enqueuing files over 50 MB', async () => {
    const bigFile = makeFile('huge.pdf', SIZE_OFFLINE_MAX + 1);
    await expect(mgr.enqueue({ file: bigFile, contextId: 'ctx', contextType: 'bd-lead' }))
      .rejects.toThrow('cannot be queued for offline upload');
  });

  it('creates entry with 48-hour TTL', async () => {
    vi.setSystemTime(new Date('2026-03-08T10:00:00Z'));
    const entry = await mgr.enqueue({ file: makeFile('a.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    const expected = new Date('2026-03-10T10:00:00Z').toISOString();
    expect(entry.expiresAt).toBe(expected);
  });

  it('marks entries as expired after TTL', async () => {
    vi.setSystemTime(new Date('2026-03-08T10:00:00Z'));
    await mgr.enqueue({ file: makeFile('b.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });

    // Advance time by 49 hours
    vi.setSystemTime(new Date('2026-03-10T11:00:00Z'));

    // Create a new manager instance — pruning runs in constructor
    const mgr2 = new OfflineQueueManager();
    expect(mgr2.getSummary().hasExpiredEntries).toBe(true);
    expect(mgr2.getSummary().totalQueued).toBe(0);
  });

  it('removes entry on remove()', async () => {
    const entry = await mgr.enqueue({ file: makeFile('c.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    expect(mgr.getSummary().totalQueued).toBe(1);
    mgr.remove(entry.queueId);
    expect(mgr.getSummary().totalQueued).toBe(0);
  });

  it('calls syncAll upload function for each pending entry', async () => {
    await mgr.enqueue({ file: makeFile('d.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    await mgr.enqueue({ file: makeFile('e.pdf', 2000), contextId: 'ctx', contextType: 'bd-lead' });

    const uploadFn = vi.fn().mockResolvedValue(undefined);
    await mgr.syncAll(uploadFn);

    expect(uploadFn).toHaveBeenCalledTimes(2);
    expect(mgr.getSummary().totalQueued).toBe(0);
  });
});
```

---

## 7. Playwright E2E Tests

### Test Suite: `tests/e2e/sharepoint-docs.spec.ts`

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('@hbc/sharepoint-docs — E2E', () => {
  const SCORECARD_URL = '/bd/scorecard/test-scorecard-id';

  test.beforeEach(async ({ page }) => {
    // Authenticate with test user (uses playwright-msal fixture)
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-ready"]');
  });

  test('D-10: blocks .exe file upload with clear error message', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    await page.click('[data-testid="documents-panel-toggle"]');
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ'),
    });
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('File type not allowed');
  });

  test('D-10: shows large file confirmation dialog for 300MB file', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    await page.click('[data-testid="documents-panel-toggle"]');
    // Simulate a 300 MB file (above the 250 MB threshold)
    const buf = Buffer.alloc(300 * 1024 * 1024);
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'large-model.rvt',
      mimeType: 'application/octet-stream',
      buffer: buf,
    });
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Large file — confirm upload');
    await expect(page.locator('[role="dialog"]')).toContainText('300.0 MB');
  });

  test('D-03: queues file while offline and uploads on reconnect', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    await page.click('[data-testid="documents-panel-toggle"]');

    // Simulate offline
    await page.context().setOffline(true);

    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'offline-doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(1024 * 100),  // 100 KB
    });

    // Confirm queue indicator appears
    await expect(page.locator('[data-testid="upload-queue-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-queue-indicator"]')).toContainText('1 file queued');

    // Restore connectivity
    await page.context().setOffline(false);

    // Wait for automatic sync
    await expect(page.locator('[data-testid="upload-queue-indicator"]')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="document-list"]')).toContainText('offline-doc.pdf');
  });

  test('D-01: tombstone appears in staging folder after migration', async ({ page }) => {
    // This test requires a seeded migration-completed state in the test SharePoint tenant
    await page.goto('/migration/status/test-context-migrated');
    await expect(page.locator('[data-testid="doc-list-item"]')).toContainText('In project site');
    await expect(page.locator('[data-testid="tombstone-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="tombstone-link"]')).toHaveAttribute('href', /project-123/);
  });

  test('D-06: conflict resolution panel shows three resolution buttons', async ({ page }) => {
    // Requires a seeded conflict state in the test environment
    await page.goto('/migration/conflicts/test-job-with-conflict');
    await expect(page.locator('[data-testid="conflict-panel"]')).toBeVisible();
    await expect(page.locator('button:has-text("Use staging version")')).toBeVisible();
    await expect(page.locator('button:has-text("Keep project site version")')).toBeVisible();
    await expect(page.locator('button:has-text("Keep both")')).toBeVisible();
  });

  test('D-06: conflict resolves and disappears from panel after PM action', async ({ page }) => {
    await page.goto('/migration/conflicts/test-job-with-conflict');
    await page.click('button:has-text("Keep project site version")');
    await expect(page.locator('[data-testid="conflict-panel"]')).toContainText('All conflicts resolved');
  });

  test('D-09: document panel is not in DOM on page load (lazy-loaded)', async ({ page }) => {
    await page.goto(SCORECARD_URL);
    // Document panel chunk should not be loaded until panel is opened
    const networkRequests: string[] = [];
    page.on('request', req => networkRequests.push(req.url()));
    // Confirm hbc-sharepoint-docs chunk is absent before opening panel
    expect(networkRequests.some(url => url.includes('hbc-sharepoint-docs'))).toBe(false);
    // Open the panel
    await page.click('[data-testid="documents-panel-toggle"]');
    await page.waitForSelector('[data-testid="drop-zone"]');
    // Now the chunk should have loaded
    expect(networkRequests.some(url => url.includes('hbc-sharepoint-docs'))).toBe(true);
  });

  test('D-04: BD Director can view but not upload to another user\'s BD lead folder', async ({ page }) => {
    // Login as BD Director (different test user credentials)
    await page.goto(`${SCORECARD_URL}?userRole=bd-director`);
    await page.click('[data-testid="documents-panel-toggle"]');
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();
    // Upload button should not be visible for director viewing another user's record
    await expect(page.locator('[data-testid="drop-zone"]')).not.toBeVisible();
  });
});
```

---

## 8. Coverage Configuration

The `vitest.config.ts` (defined in SF01-T01) enforces 95% thresholds. To verify:

```bash
# Run full test suite with coverage report
pnpm --filter @hbc/sharepoint-docs test:coverage

# Open coverage report in browser
open packages/sharepoint-docs/coverage/index.html

# Run E2E tests (requires running dev environment)
pnpm --filter @hbc/sharepoint-docs test:e2e
# or with explicit config:
npx playwright test tests/e2e/sharepoint-docs.spec.ts --config=playwright.config.ts
```

### Playwright Configuration Additions (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',  // PWA dev server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  reporter: [['html', { outputFolder: 'playwright-report' }]],
});
```
