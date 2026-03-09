import { FolderManager } from '../../api/FolderManager.js';
import type { IDocumentContextConfig } from '../../types/index.js';

const TEST_SITE_URL = 'https://contoso.sharepoint.com/sites/hb-intel';

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
    vi.useFakeTimers();
    // PH7.7: FolderManager now requires hbIntelSiteUrl as 4th constructor argument
    fm = new FolderManager(null as never, null as never, null as never, TEST_SITE_URL);
    vi.setSystemTime(new Date('2026-03-08T14:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('produces correct yyyymmdd_{Name}_{LastName} format', () => {
    const name = fm.buildFolderName(makeConfig());
    expect(name).toBe('20260308_BD_Lead_Riverside_Medical_Center_Expansion_Martinez');
  });

  it('sanitizes spaces to underscores', () => {
    const name = fm.sanitizeName('My Great Project Name');
    expect(name).toBe('My_Great_Project_Name');
  });

  it('strips special characters and collapses underscores', () => {
    const name = fm.sanitizeName('Project: "Alpha" & Beta (v2.0)');
    expect(name).toBe('Project_Alpha_Beta_v20');
  });

  it('truncates name at 80 characters', () => {
    const longName = 'A'.repeat(100);
    expect(fm.sanitizeName(longName)).toHaveLength(80);
  });

  it('strips diacritics from last name', () => {
    const cfg = makeConfig({ ownerLastName: 'Nunez' });
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
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T14:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns existing context if registry entry found', async () => {
    const mockRegistry = {
      findByContextId: vi.fn().mockResolvedValue({
        stagingUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith/test.pdf',
        fileName: 'test.pdf',
        folderName: '20260308_Test_Smith',
        uploadedAt: '2026-03-08T10:00:00Z',
      }),
    };
    const fm = new FolderManager(null as never, null as never, mockRegistry as never, TEST_SITE_URL);
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
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    const result = await fm.resolveOrCreate(makeConfig());
    expect(result.wasExisting).toBe(false);
    expect(mockApi.createFolder).toHaveBeenCalled();
    expect(mockPermissions.applyDefaultPermissions).toHaveBeenCalled();
  });

  it('applies custom permissions when config.permissions is set', async () => {
    const customPermissions = {
      contributeGroups: ['Group1'],
      contributeUsers: ['user@hbc.com'],
      readGroups: ['Readers'],
      executiveReadGroups: ['Execs'],
    };
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/...'),
    };
    const mockPermissions = {
      applyDefaultPermissions: vi.fn().mockResolvedValue(undefined),
      applyCustomPermissions: vi.fn().mockResolvedValue(undefined),
    };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    const cfg = makeConfig({ permissions: customPermissions });
    await fm.resolveOrCreate(cfg);
    expect(mockPermissions.applyCustomPermissions).toHaveBeenCalled();
    expect(mockPermissions.applyDefaultPermissions).not.toHaveBeenCalled();
  });

  it('returns wasExisting=true when folder exists in SharePoint but not registry', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(true),
      createFolder: vi.fn(),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/...'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn() };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    const result = await fm.resolveOrCreate(makeConfig());
    expect(result.wasExisting).toBe(true);
    expect(mockApi.createFolder).not.toHaveBeenCalled();
  });

  it('creates estimating-pursuit subfolders', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/...'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    await fm.resolveOrCreate(makeConfig({ contextType: 'estimating-pursuit' }));
    // Root folder + 2 subfolders (Bid Documents, Supporting)
    expect(mockApi.createFolder).toHaveBeenCalledTimes(3);
  });

  it('creates no subfolders for project context', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/...'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    await fm.resolveOrCreate(makeConfig({ contextType: 'project', siteUrl: 'https://contoso.sharepoint.com/sites/project-1' }));
    // Root folder only, no subfolders
    expect(mockApi.createFolder).toHaveBeenCalledTimes(1);
  });

  it('creates no subfolders for system context', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/...'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    await fm.resolveOrCreate(makeConfig({ contextType: 'system' }));
    expect(mockApi.createFolder).toHaveBeenCalledTimes(1);
  });

  it('uses config.siteUrl when provided', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://custom.sharepoint.com/...'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    await fm.resolveOrCreate(makeConfig({ siteUrl: 'https://custom.sharepoint.com/sites/x' }));
    expect(mockApi.folderExists).toHaveBeenCalledWith('https://custom.sharepoint.com/sites/x', expect.any(String));
  });

  // ─── PH7.7 Boundary Tests ───────────────────────────────────────────────

  it('returns relativeFolderPath on the resolved context for new folder (bd-lead)', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Martinez'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T14:30:00Z'));
    const result = await fm.resolveOrCreate(makeConfig());
    vi.useRealTimers();
    // relativeFolderPath must be parentPath/folderName — no private methods needed by consumers
    expect(result.relativeFolderPath).toBe(
      'Shared Documents/BD Leads/20260308_BD_Lead_Riverside_Medical_Center_Expansion_Martinez'
    );
  });

  it('returns relativeFolderPath on the resolved context for registry hit', async () => {
    const mockRegistry = {
      findByContextId: vi.fn().mockResolvedValue({
        stagingUrl: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test_Smith/test.pdf',
        fileName: 'test.pdf',
        folderName: '20260308_Test_Smith',
        uploadedAt: '2026-03-08T10:00:00Z',
      }),
    };
    const fm = new FolderManager(null as never, null as never, mockRegistry as never, TEST_SITE_URL);
    const result = await fm.resolveOrCreate(makeConfig());
    // Registry branch must also populate relativeFolderPath — parentPath derived from contextType
    expect(result.relativeFolderPath).toBe('Shared Documents/BD Leads/20260308_Test_Smith');
  });

  it('uses injected hbIntelSiteUrl when config.siteUrl is null', async () => {
    const mockApi = {
      folderExists: vi.fn().mockResolvedValue(false),
      createFolder: vi.fn().mockResolvedValue(undefined),
      getFolderAbsoluteUrl: vi.fn().mockResolvedValue('https://contoso.sharepoint.com/...'),
    };
    const mockPermissions = { applyDefaultPermissions: vi.fn().mockResolvedValue(undefined) };
    const mockRegistry = { findByContextId: vi.fn().mockResolvedValue(null) };
    const fm = new FolderManager(mockApi as never, mockPermissions as never, mockRegistry as never, TEST_SITE_URL);
    // config.siteUrl = null → should fall back to injected TEST_SITE_URL
    await fm.resolveOrCreate(makeConfig({ siteUrl: null }));
    expect(mockApi.folderExists).toHaveBeenCalledWith(TEST_SITE_URL, expect.any(String));
  });
});
