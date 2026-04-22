import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const getTokenSpy = vi.fn().mockResolvedValue({ token: 'azure-token' });
  const bearerBehavior = vi.fn();
  const bearerTokenSpy = vi.fn().mockReturnValue(bearerBehavior);

  return {
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

vi.mock('@pnp/queryable', () => ({
  BearerToken: mocks.bearerTokenSpy,
}));

describe('managed-identity-token-service', () => {
  it('ManagedIdentityTokenService scopes SharePoint token to tenant origin', async () => {
    const mod = await import('../managed-identity-token-service.js');
    const service = new mod.ManagedIdentityTokenService();

    const token = await service.getSharePointToken('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');

    expect(token).toBe('azure-token');
    expect(mocks.getTokenSpy).toHaveBeenCalledWith('https://hedrickbrotherscom.sharepoint.com/.default');
  });

  it('createSharePointBearerTokenBehavior returns BearerToken behavior', async () => {
    const mod = await import('../managed-identity-token-service.js');

    const behavior = await mod.createSharePointBearerTokenBehavior(
      'https://hedrickbrotherscom.sharepoint.com/sites/Safety',
      {
        getSharePointToken: vi.fn().mockResolvedValue('service-token'),
        acquireAppToken: vi.fn(),
      },
    );

    expect(mocks.bearerTokenSpy).toHaveBeenCalledWith('service-token');
    expect(behavior).toBe(mocks.bearerBehavior);
  });

  it('createSharePointBearerTokenBehavior wraps failures with structured token acquisition context', async () => {
    const mod = await import('../managed-identity-token-service.js');

    await expect(
      mod.createSharePointBearerTokenBehavior(
        'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
        {
          getSharePointToken: vi.fn().mockRejectedValue(new Error('network_error: Network request failed')),
          acquireAppToken: vi.fn(),
        },
      ),
    ).rejects.toMatchObject({
      name: 'SharePointTokenAcquisitionError',
      code: 'SHAREPOINT_TOKEN_ACQUISITION_FAILED',
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      scope: 'https://hedrickbrotherscom.sharepoint.com/.default',
    });
  });

  it('formatSharePointTokenAcquisitionDiagnostic emits operator-actionable detail', async () => {
    const mod = await import('../managed-identity-token-service.js');

    const err = new mod.SharePointTokenAcquisitionError({
      siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      scope: 'https://hedrickbrotherscom.sharepoint.com/.default',
      message: 'Unable to acquire app-only SharePoint token: network_error',
      remediation: 'Verify credentials and network.',
    });

    const diagnostic = mod.formatSharePointTokenAcquisitionDiagnostic(err);
    expect(diagnostic).toContain('[scope=https://hedrickbrotherscom.sharepoint.com/.default]');
    expect(diagnostic).toContain('[site=https://hedrickbrotherscom.sharepoint.com/sites/HBCentral]');
    expect(diagnostic).toContain('Verify credentials and network.');
  });
});
