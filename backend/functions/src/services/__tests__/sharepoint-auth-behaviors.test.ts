import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const usingSpy = vi.fn().mockReturnValue({});
  const spfiSpy = vi.fn().mockReturnValue({ using: usingSpy });
  const getTokenSpy = vi.fn().mockResolvedValue({ token: 'mock-token' });
  const bearerBehavior = vi.fn();
  const bearerTokenSpy = vi.fn().mockReturnValue(bearerBehavior);

  return {
    usingSpy,
    spfiSpy,
    getTokenSpy,
    bearerBehavior,
    bearerTokenSpy,
  };
});

vi.mock('@azure/identity', () => ({
  DefaultAzureCredential: vi.fn().mockImplementation(() => ({
    getToken: mocks.getTokenSpy,
  })),
}));

vi.mock('@pnp/sp', () => ({
  spfi: mocks.spfiSpy,
}));

vi.mock('@pnp/queryable', () => ({
  BearerToken: mocks.bearerTokenSpy,
}));

vi.mock('@pnp/nodejs-commonjs', () => ({}));
vi.mock('@pnp/sp/appcatalog/index.js', () => ({}));
vi.mock('@pnp/sp/files/index.js', () => ({}));
vi.mock('@pnp/sp/folders/index.js', () => ({}));
vi.mock('@pnp/sp/items/index.js', () => ({}));
vi.mock('@pnp/sp/lists/index.js', () => ({}));
vi.mock('@pnp/sp/security/index.js', () => ({}));
vi.mock('@pnp/sp/site-groups/index.js', () => ({}));
vi.mock('@pnp/sp/site-users/index.js', () => ({}));
vi.mock('@pnp/sp/sites/index.js', () => ({}));
vi.mock('@pnp/sp/webs/index.js', () => ({}));

describe('SharePoint adapter auth behavior wiring', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.clearAllMocks();
    mocks.usingSpy.mockReturnValue({});
    mocks.spfiSpy.mockReturnValue({ using: mocks.usingSpy });
    mocks.getTokenSpy.mockResolvedValue({ token: 'mock-token' });
    mocks.bearerTokenSpy.mockReturnValue(mocks.bearerBehavior);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('SharePoint provisioning service uses BearerToken behavior for PnP requests', async () => {
    process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

    const mod = await import('../sharepoint-provisioning-service.js');
    const service = new mod.SharePointProvisioningService();

    const targetSite = 'https://hedrickbrotherscom.sharepoint.com/sites/Safety';
    await service.openPnPContext(targetSite);

    expect(mocks.getTokenSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/.default');
    expect(mocks.spfiSpy).toHaveBeenCalledWith(targetSite);
    expect(mocks.bearerTokenSpy).toHaveBeenCalledWith('mock-token');
    expect(mocks.usingSpy).toHaveBeenCalledWith(mocks.bearerBehavior);
    expect(typeof mocks.usingSpy.mock.calls[0]?.[0]).toBe('function');
  });

  it('ProjectRequests adapter uses BearerToken behavior for PnP requests', async () => {
    process.env.SHAREPOINT_PROJECTS_SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
    process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com';

    const mod = await import('../project-requests-repository.js');
    const adapter = new mod.SharePointProjectRequestsAdapter();

    await (adapter as any).getSP();

    expect(mocks.getTokenSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/.default');
    expect(mocks.spfiSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
    expect(mocks.bearerTokenSpy).toHaveBeenCalledWith('mock-token');
    expect(typeof mocks.usingSpy.mock.calls[0]?.[0]).toBe('function');
  });

  it('Acknowledgment service uses BearerToken behavior for PnP requests', async () => {
    process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

    const mod = await import('../acknowledgment-service.js');
    const service = new mod.RealAcknowledgmentService();

    await (service as any).getSP();

    expect(mocks.getTokenSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/.default');
    expect(mocks.spfiSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
    expect(mocks.bearerTokenSpy).toHaveBeenCalledWith('mock-token');
    expect(typeof mocks.usingSpy.mock.calls[0]?.[0]).toBe('function');
  });

  it('Legacy fallback review repository uses BearerToken behavior with override token', async () => {
    process.env.SHAREPOINT_BEARER_TOKEN = 'override-token';

    const mod = await import('../legacy-fallback/review-repository.js');
    const repository = new mod.LegacyFallbackReviewRepository();

    await (repository as any).getSP();

    expect(mocks.getTokenSpy).not.toHaveBeenCalled();
    expect(mocks.spfiSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
    expect(mocks.bearerTokenSpy).toHaveBeenCalledWith('override-token');
    expect(typeof mocks.usingSpy.mock.calls[0]?.[0]).toBe('function');
  });
});
