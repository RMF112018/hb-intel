import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Unit tests for SharePoint target alignment in project-requests-repository.
 * Validates the constructor resolves the correct site URL for the Projects list.
 */

// Mock PnPjs and Azure Identity so the constructor doesn't require real credentials.
vi.mock('@azure/identity', () => ({
  DefaultAzureCredential: vi.fn().mockImplementation(() => ({
    getToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  })),
}));
vi.mock('@pnp/sp', () => ({
  spfi: vi.fn().mockReturnValue({ using: vi.fn().mockReturnValue({}) }),
}));
vi.mock('@pnp/nodejs-commonjs', () => ({}));
vi.mock('@pnp/sp/items/index.js', () => ({}));
vi.mock('@pnp/sp/lists/index.js', () => ({}));
vi.mock('@pnp/sp/webs/index.js', () => ({}));

describe('SharePointProjectRequestsAdapter — SP target alignment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function createAdapter() {
    const mod = await import('../project-requests-repository.js');
    return new mod.SharePointProjectRequestsAdapter();
  }

  it('prefers SHAREPOINT_PROJECTS_SITE_URL over SHAREPOINT_TENANT_URL', async () => {
    process.env.SHAREPOINT_PROJECTS_SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
    process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com';

    const adapter = await createAdapter();
    // Access the private siteUrl via any cast for test assertion
    expect((adapter as any).siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
  });

  it('falls back to SHAREPOINT_TENANT_URL when SHAREPOINT_PROJECTS_SITE_URL is not set', async () => {
    delete process.env.SHAREPOINT_PROJECTS_SITE_URL;
    process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com';

    const adapter = await createAdapter();
    expect((adapter as any).siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com');
  });

  it('throws with actionable message when neither env var is set', async () => {
    delete process.env.SHAREPOINT_PROJECTS_SITE_URL;
    delete process.env.SHAREPOINT_TENANT_URL;

    await expect(createAdapter()).rejects.toThrow('SHAREPOINT_PROJECTS_SITE_URL or SHAREPOINT_TENANT_URL');
    await expect(createAdapter()).rejects.toThrow('hedrickbrotherscom.sharepoint.com/sites/HBCentral');
  });

  it('stores correct tenantUrl for token scope resolution', async () => {
    process.env.SHAREPOINT_PROJECTS_SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
    process.env.SHAREPOINT_TENANT_URL = 'https://hedrickbrotherscom.sharepoint.com';

    const adapter = await createAdapter();
    expect((adapter as any).tenantUrl).toBe('https://hedrickbrotherscom.sharepoint.com');
  });
});
