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
      filterPending: vi.fn().mockResolvedValue([pendingDocId]),
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    const mockConflictDetector = { check: vi.fn().mockResolvedValue(null) };
    const mockApi = { moveFile: vi.fn().mockResolvedValue('https://sp.com/project/b.pdf') };
    const mockTombstone = { create: vi.fn().mockResolvedValue('https://sp.com/b.pdf.migrated.url') };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never,
      'https://contoso.sharepoint.com/sites/hb-intel'
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(mockApi.moveFile).toHaveBeenCalledTimes(1);
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
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never,
      'https://contoso.sharepoint.com/sites/hb-intel'
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.conflictCount).toBe(1);
    expect(result.migratedCount).toBe(1);
    expect(mockApi.moveFile).toHaveBeenCalledTimes(1);
    expect(mockConflictResolver.scheduleWatchdogs).toHaveBeenCalledWith('job-001');
  });

  it('handles file move failure gracefully with error status', async () => {
    const docId = 'doc-fail';

    const mockRegistry = {
      listByContextId: vi.fn().mockResolvedValue([
        { id: docId, fileName: 'fail.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/fail.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/fail.pdf' },
      ] as IUploadedDocument[]),
      updateMigrationStatus: vi.fn().mockResolvedValue(undefined),
    };

    const mockMigrationLog = {
      filterPending: vi.fn().mockResolvedValue([docId]),
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    const mockConflictDetector = { check: vi.fn().mockResolvedValue(null) };
    const mockApi = { moveFile: vi.fn().mockRejectedValue(new Error('Network error')) };
    const mockTombstone = { create: vi.fn() };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never,
      'https://contoso.sharepoint.com/sites/hb-intel'
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.failedCount).toBe(1);
    expect(result.status).toBe('partial');
    expect(mockMigrationLog.setCheckpoint).toHaveBeenCalledWith('job-001', docId, 'failed', 'Network error');
  });

  it('handles non-Error throw in file move', async () => {
    const docId = 'doc-string-error';

    const mockRegistry = {
      listByContextId: vi.fn().mockResolvedValue([
        { id: docId, fileName: 'err.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/err.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/err.pdf' },
      ] as IUploadedDocument[]),
      updateMigrationStatus: vi.fn().mockResolvedValue(undefined),
    };

    const mockMigrationLog = {
      filterPending: vi.fn().mockResolvedValue([docId]),
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    const mockConflictDetector = { check: vi.fn().mockResolvedValue(null) };
    // Throw a string instead of Error
    const mockApi = { moveFile: vi.fn().mockRejectedValue('string error') };
    const mockTombstone = { create: vi.fn() };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never,
      'https://contoso.sharepoint.com/sites/hb-intel'
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.failedCount).toBe(1);
    expect(mockMigrationLog.setCheckpoint).toHaveBeenCalledWith('job-001', docId, 'failed', 'string error');
  });

  it('returns completed status when all files migrate successfully', async () => {
    const docId = 'doc-ok';

    const mockRegistry = {
      listByContextId: vi.fn().mockResolvedValue([
        { id: docId, fileName: 'ok.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/ok.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/ok.pdf' },
      ] as IUploadedDocument[]),
      updateMigrationStatus: vi.fn().mockResolvedValue(undefined),
    };

    const mockMigrationLog = {
      filterPending: vi.fn().mockResolvedValue([docId]),
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    const mockConflictDetector = { check: vi.fn().mockResolvedValue(null) };
    const mockApi = { moveFile: vi.fn().mockResolvedValue('https://sp.com/project/ok.pdf') };
    const mockTombstone = { create: vi.fn().mockResolvedValue('https://sp.com/ok.pdf.migrated.url') };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never,
      'https://contoso.sharepoint.com/sites/hb-intel'
    );

    const result = await svc.execute(makeScheduledMigration());

    expect(result.status).toBe('completed');
    expect(result.migratedCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(result.conflictCount).toBe(0);
    expect(mockConflictResolver.scheduleWatchdogs).not.toHaveBeenCalled();
  });

  it('throws when destinationLibraryPath is omitted (no hardcoded fallback)', async () => {
    const docId = 'doc-default';

    const mockRegistry = {
      listByContextId: vi.fn().mockResolvedValue([
        { id: docId, fileName: 'test.pdf', migrationStatus: 'pending', sharepointUrl: 'https://sp.com/test.pdf', fileSize: 1000, stagingUrl: 'https://sp.com/test.pdf' },
      ] as IUploadedDocument[]),
      updateMigrationStatus: vi.fn().mockResolvedValue(undefined),
    };

    const mockMigrationLog = {
      filterPending: vi.fn().mockResolvedValue([docId]),
      setCheckpoint: vi.fn().mockResolvedValue(undefined),
    };

    const mockConflictDetector = { check: vi.fn().mockResolvedValue(null) };
    const mockApi = { moveFile: vi.fn() };
    const mockTombstone = { create: vi.fn() };
    const mockConflictResolver = { scheduleWatchdogs: vi.fn() };

    const svc = new MigrationService(
      mockApi as never, mockRegistry as never, mockMigrationLog as never,
      mockTombstone as never, mockConflictDetector as never, mockConflictResolver as never,
      'https://contoso.sharepoint.com/sites/hb-intel'
    );

    const migration = makeScheduledMigration();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (migration as any).destinationLibraryPath = undefined;

    await expect(svc.execute(migration)).rejects.toThrow('destinationLibraryPath is required');
    expect(mockApi.moveFile).not.toHaveBeenCalled();
  });
});

describe('TombstoneWriter.create', () => {
  it('produces valid .url file content with destination link', async () => {
    const mockApi = {
      uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf.migrated.url'),
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

    // Verify uploadSmallFile was called with correct path and tombstone file name
    expect(mockApi.uploadSmallFile).toHaveBeenCalledTimes(1);
    const [siteUrl, filePath, tombstoneFile] = mockApi.uploadSmallFile.mock.calls[0];
    expect(siteUrl).toBe('https://sp.com');
    expect(filePath).toBe('Shared Documents/BD Leads/20260308_Test_Smith/RFP/file.pdf.migrated.url');
    expect(tombstoneFile.name).toBe('file.pdf.migrated.url');
    expect(tombstoneFile.type).toBe('text/plain');
  });
});
