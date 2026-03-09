import { UploadService } from '../../services/UploadService.js';
import { SIZE_STANDARD_MAX, SIZE_HARD_BLOCK, SIZE_CHUNKED_THRESHOLD } from '../../constants/fileSizeLimits.js';

const TEST_SITE_URL = 'https://contoso.sharepoint.com/sites/hb-intel';

const makeFile = (name: string, size: number, type = 'application/pdf'): File =>
  new File([new ArrayBuffer(size)], name, { type });

// PH7.7: UploadService now requires hbIntelSiteUrl as its 4th constructor argument.
// validate() tests that don't exercise upload paths pass an empty string — it is not
// used in validate() and the constructor does not guard against empty strings itself
// (validation is the responsibility of assertHbIntelSiteUrl in the provider layer).
describe('UploadService.validate', () => {
  const svc = new UploadService(null as never, null as never, null as never, '');

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
    const svc = new UploadService(null as never, null as never, null as never, TEST_SITE_URL);
    const file = makeFile('large.rvt', SIZE_STANDARD_MAX + 1);
    await expect(svc.upload({ file, contextConfig: null as never })).rejects.toThrow(
      'Large file requires confirmation before upload'
    );
  });

  it('routes files <=4MB to uploadSmallFile', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    // PH7.7: getParentPath removed from mock — relativeFolderPath is now part of resolveOrCreate return
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(42) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
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
    // PH7.7: getParentPath removed; relativeFolderPath on resolveOrCreate return
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(43) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
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
    // PH7.7: getParentPath removed; relativeFolderPath on resolveOrCreate return
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(44) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
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
    const svc = new UploadService(null as never, null as never, null as never, TEST_SITE_URL);
    const file = makeFile('bad.exe', 1000);
    await expect(svc.upload({ file, contextConfig: null as never })).rejects.toThrow(
      'File validation failed: BLOCKED_EXTENSION'
    );
  });

  it('allows confirmed large file upload', async () => {
    const mockApi2 = {
      createUploadSession: vi.fn().mockResolvedValue('https://upload-url'),
      uploadChunk: vi.fn().mockResolvedValue({ sharepointUrl: 'https://sp.com/large.pdf' }),
    };
    // PH7.7: getParentPath removed; relativeFolderPath on resolveOrCreate return
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(45) };
    const svc2 = new UploadService(mockApi2 as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
    const file = makeFile('large.pdf', SIZE_STANDARD_MAX + 1);
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
    // PH7.7: getParentPath removed; relativeFolderPath reflects project context path
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/project-1/Shared Documents/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(46) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
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
    // PH7.7: getParentPath removed; relativeFolderPath used directly for path construction
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(47) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
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
    // PH7.7: getParentPath removed; relativeFolderPath on resolveOrCreate return
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, null as never, TEST_SITE_URL);
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

// ─── PH7.7 Boundary Tests ────────────────────────────────────────────────────
// These tests cover the new contract boundaries introduced in PH7.7:
//   - Path is built entirely from resolvedContext.relativeFolderPath (no private access)
//   - siteUrl falls through to injected hbIntelSiteUrl when contextConfig.siteUrl is null
//   - subfolder path composition is correct for all combinations

describe('UploadService.upload — PH7.7 boundary contract', () => {
  it('builds full destination path from relativeFolderPath without private method access', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_BD_Lead_Riverside_Martinez',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(100) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
    const file = makeFile('contract.pdf', 500 * 1024);

    await svc.upload({
      file,
      contextConfig: {
        contextId: 'bd-001',
        contextType: 'bd-lead',
        contextLabel: 'BD Lead: Riverside',
        siteUrl: null,
        ownerUpn: 'jm@hbc.com',
        ownerLastName: 'Martinez',
      },
    });

    const [_siteUrl, calledPath] = mockApi.uploadSmallFile.mock.calls[0];
    // Full path must be relativeFolderPath + filename — no extra parentPath reconstruction
    expect(calledPath).toBe('Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez/contract.pdf');
  });

  it('includes subfolder segment between relativeFolderPath and filename', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/rfp.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_BD_Lead_Riverside_Martinez',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(101) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
    const file = makeFile('bid.pdf', 500 * 1024);

    await svc.upload({
      file,
      contextConfig: {
        contextId: 'bd-001',
        contextType: 'bd-lead',
        contextLabel: 'BD Lead: Riverside',
        siteUrl: null,
        ownerUpn: 'jm@hbc.com',
        ownerLastName: 'Martinez',
      },
      subFolder: 'RFP',
    });

    const [_siteUrl, calledPath] = mockApi.uploadSmallFile.mock.calls[0];
    expect(calledPath).toBe('Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez/RFP/bid.pdf');
  });

  it('uses injected hbIntelSiteUrl as fallback when contextConfig.siteUrl is null', async () => {
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith',
        relativeFolderPath: 'Shared Documents/BD Leads/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(102) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
    const file = makeFile('doc.pdf', 200 * 1024);

    await svc.upload({
      file,
      contextConfig: {
        contextId: 'bd-002',
        contextType: 'bd-lead',
        contextLabel: 'Test',
        siteUrl: null,   // null — should fall through to injected TEST_SITE_URL
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
    });

    const [calledSiteUrl] = mockApi.uploadSmallFile.mock.calls[0];
    expect(calledSiteUrl).toBe(TEST_SITE_URL);
  });

  it('uses contextConfig.siteUrl when provided (project context), not injected fallback', async () => {
    const projectSiteUrl = 'https://contoso.sharepoint.com/sites/project-123';
    const mockApi = { uploadSmallFile: vi.fn().mockResolvedValue('https://sp.com/file.pdf') };
    const mockFolderMgr = {
      resolveOrCreate: vi.fn().mockResolvedValue({
        folderName: '20260308_Test_Smith',
        folderUrl: `${projectSiteUrl}/Shared Documents/20260308_Test_Smith`,
        relativeFolderPath: 'Shared Documents/20260308_Test_Smith',
      }),
    };
    const mockRegistry = { create: vi.fn().mockResolvedValue(103) };
    const svc = new UploadService(mockApi as never, mockFolderMgr as never, mockRegistry as never, TEST_SITE_URL);
    const file = makeFile('submittal.pdf', 200 * 1024);

    await svc.upload({
      file,
      contextConfig: {
        contextId: 'proj-001',
        contextType: 'project',
        contextLabel: 'Test Project',
        siteUrl: projectSiteUrl,   // explicitly set — must be preferred over injected fallback
        ownerUpn: 'u@h.com',
        ownerLastName: 'Smith',
      },
    });

    const [calledSiteUrl] = mockApi.uploadSmallFile.mock.calls[0];
    expect(calledSiteUrl).toBe(projectSiteUrl);
  });
});
