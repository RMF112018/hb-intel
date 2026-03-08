import { UploadService } from '../../services/UploadService.js';
import { SIZE_STANDARD_MAX, SIZE_HARD_BLOCK, SIZE_CHUNKED_THRESHOLD } from '../../constants/fileSizeLimits.js';

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

  it('requires confirmation for files 250MB-1GB', () => {
    const error = svc.validate(makeFile('large-model.rvt', SIZE_STANDARD_MAX + 1));
    expect(error?.code).toBe('REQUIRES_CONFIRMATION');
  });

  it('hard-blocks files over 1 GB', () => {
    const error = svc.validate(makeFile('giant.zip', SIZE_HARD_BLOCK + 1));
    expect(error?.code).toBe('EXCEEDS_HARD_LIMIT');
  });

  it('accepts .rvt (Revit) files under 250 MB', () => {
    expect(svc.validate(makeFile('building.rvt', 50 * 1024 * 1024))).toBeNull();
  });

  it('accepts .dwg (CAD) files', () => {
    expect(svc.validate(makeFile('floorplan.dwg', 5 * 1024 * 1024))).toBeNull();
  });

  it('blocks files with blocked MIME types', () => {
    const error = svc.validate(makeFile('payload.bin', 500, 'application/x-msdownload'));
    expect(error?.code).toBe('BLOCKED_MIME');
  });
});

describe('UploadService.upload', () => {
  it('throws for unconfirmed large file', async () => {
    const svc = new UploadService(null as never, null as never, null as never);
    const file = makeFile('large.rvt', SIZE_STANDARD_MAX + 1);
    await expect(svc.upload({ file, contextConfig: null as never })).rejects.toThrow(
      'Large file requires confirmation before upload'
    );
  });

  it('routes files <=4MB to uploadSmallFile', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(42) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    const file = makeFile('small.pdf', 1 * 1024 * 1024);  // 1 MB
    await svc.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
    });
    expect(mockApi.uploadSmallFile).toHaveBeenCalled();
  });

  it('routes files >4MB to chunked upload', async () => {
    const mockApi = {
      createUploadSession: vi.fn().mockResolvedValue('https://upload-session-url'),
      uploadChunk: vi.fn().mockResolvedValue({ sharepointUrl: 'https://sp.com/chunked.rvt' }),
    };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(43) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    const file = makeFile('large.rvt', SIZE_CHUNKED_THRESHOLD + 1);
    const result = await svc.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
    });
    expect(mockApi.createUploadSession).toHaveBeenCalled();
    expect(result.document.fileName).toBe('large.rvt');
  });

  it('calls onProgress callback during chunked upload', async () => {
    const mockApi = {
      createUploadSession: vi.fn().mockResolvedValue('https://upload-session-url'),
      uploadChunk: vi.fn().mockResolvedValue({ sharepointUrl: 'https://sp.com/file.rvt' }),
    };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(44) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    const progressFn = vi.fn();
    const file = makeFile('tracked.rvt', SIZE_CHUNKED_THRESHOLD + 1);
    await svc.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
      onProgress: progressFn,
    });
    expect(progressFn).toHaveBeenCalledWith(expect.objectContaining({
      fileName: 'tracked.rvt',
      percentComplete: 100,
    }));
  });

  it('throws for blocked extension during upload', async () => {
    const svc = new UploadService(null as never, null as never, null as never);
    const file = makeFile('bad.exe', 1000);
    await expect(svc.upload({ file, contextConfig: null as never })).rejects.toThrow(
      'File validation failed: BLOCKED_EXTENSION'
    );
  });

  it('allows confirmed large file upload', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/large.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(45) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    // Use a size between STANDARD_MAX and HARD_BLOCK but mark as confirmed
    // Note: file is actually small in memory but validate checks .size
    const file = makeFile('large.pdf', SIZE_STANDARD_MAX + 1);
    // This will actually go through chunked upload path since size > CHUNKED_THRESHOLD
    // Mock the chunked API too
    const mockApi2 = {
      createUploadSession: vi.fn().mockResolvedValue('https://upload-url'),
      uploadChunk: vi.fn().mockResolvedValue({ sharepointUrl: 'https://sp.com/large.pdf' }),
    };
    const svc2 = new UploadService(mockApi2 as never, mockFolderMgr as never, mockRegistry as never);
    const result = await svc2.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
      largeFileConfirmed: true,
    });
    expect(result.document.migrationStatus).toBe('pending');
  });

  it('sets migrationStatus to not-applicable when siteUrl is provided', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(46) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    const file = makeFile('project.pdf', 1 * 1024 * 1024);
    const result = await svc.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'project',
        contextLabel: 'Test',
        siteUrl: 'https://contoso.sharepoint.com/sites/project-1',
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
    });
    expect(result.document.migrationStatus).toBe('not-applicable');
  });

  it('places file in subfolder when subFolder is specified', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(47) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never);
    const file = makeFile('rfp.pdf', 1 * 1024 * 1024);
    await svc.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
      subFolder: 'RFP',
    });
    const calledPath = mockApi.uploadSmallFile.mock.calls[0][1];
    expect(calledPath).toContain('/RFP/');
  });

  it('throws when chunked upload returns no final URL', async () => {
    const mockApi = {
      createUploadSession: vi.fn().mockResolvedValue('https://upload-url'),
      // Return no sharepointUrl — simulates Graph API not returning final URL
      uploadChunk: vi.fn().mockResolvedValue({}),
    };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({ folderName: '20260308_Test_Smith', folderUrl: '...' }),
      getParentPath: vi.fn().mockReturnValue('Shared Documents/BD Leads'),
    };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, null as never);
    // Use a file slightly over chunked threshold but small enough that 1 chunk covers it
    const file = makeFile('incomplete.rvt', SIZE_CHUNKED_THRESHOLD + 1);
    await expect(svc.upload({
      file,
      contextConfig: {
        contextId: 'x',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
    })).rejects.toThrow('Chunked upload did not return a final URL');
  });
});
