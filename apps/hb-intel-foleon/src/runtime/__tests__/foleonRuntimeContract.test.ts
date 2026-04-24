import { describe, expect, it } from 'vitest';
import { resolveFoleonRuntimeContract } from '../foleonRuntimeContract.js';
import { FOLEON_PACKAGE_VERSION } from '../../webparts/foleon/runtimeContract.js';

describe('resolveFoleonRuntimeContract', () => {
  it('returns a mock-mode contract without SPFx context', () => {
    const contract = resolveFoleonRuntimeContract({ hasSpfxContext: false });
    expect(contract.hostMode).toBe('mock');
    expect(contract.canInitialize).toBe(true);
    expect(contract.route).toBe('highlights');
  });

  it('blocks hosted mode when the site URL is absent', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      config: {
        contentRegistryListId: '11111111-1111-1111-1111-111111111111',
        placementsListId: '22222222-2222-2222-2222-222222222222',
      },
    });
    expect(contract.canInitialize).toBe(false);
    expect(contract.blockingReasons).toContain('SharePoint site URL is missing.');
  });

  it('blocks hosted mode when the content registry GUID is missing', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      config: {
        placementsListId: '22222222-2222-2222-2222-222222222222',
      },
    });
    expect(contract.canInitialize).toBe(false);
    expect(contract.blockingReasons.join(' ')).toContain('HB_FoleonContentRegistry');
  });

  it('blocks hosted highlights when placements GUID is missing', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      config: {
        contentRegistryListId: '11111111-1111-1111-1111-111111111111',
      },
    });
    expect(contract.canInitialize).toBe(false);
    expect(contract.blockingReasons.join(' ')).toContain('HB_FoleonHomepagePlacements');
  });

  it('accepts hosted reader route without a placements GUID', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      config: {
        contentRegistryListId: '11111111-1111-1111-1111-111111111111',
        foleonRoute: 'reader',
        foleonDocId: 123456,
      },
    });
    expect(contract.canInitialize).toBe(true);
    expect(contract.route).toBe('reader');
    expect(contract.docId).toBe(123456);
  });

  it('blocks when expected manifest ID mismatches', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      config: {
        contentRegistryListId: '11111111-1111-1111-1111-111111111111',
        placementsListId: '22222222-2222-2222-2222-222222222222',
        expectedManifestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      },
    });
    expect(contract.governed.manifestIdMatchesExpected).toBe(false);
    expect(contract.canInitialize).toBe(false);
  });

  it('passes governance when expected manifest ID matches', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      config: {
        contentRegistryListId: '11111111-1111-1111-1111-111111111111',
        placementsListId: '22222222-2222-2222-2222-222222222222',
        expectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
        expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      },
    });
    expect(contract.governed.manifestIdMatchesExpected).toBe(true);
    expect(contract.governed.packageVersionMatchesExpected).toBe(true);
    expect(contract.canInitialize).toBe(true);
  });

  it('parses numeric docId from a string config value', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: false,
      config: { foleonDocId: '987654' },
    });
    expect(contract.docId).toBe(987654);
  });

  it('emits typed issue codes covering every blocking condition', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      config: {
        acceptedFoleonOrigins: [],
        expectedManifestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        expectedPackageVersion: '99.99.99.99',
      },
    });
    const codes = contract.issues.map((issue) => issue.code).sort();
    expect(codes).toEqual(
      [
        'manifest-id-mismatch',
        'missing-content-registry-list-id',
        'missing-placements-list-id',
        'missing-site-url',
        'no-origins-allowlisted',
        'package-version-mismatch',
      ].sort(),
    );
    for (const issue of contract.issues) {
      expect(issue.scope).toBe('admin');
    }
  });

  it('emits zero issues for a fully configured hosted contract', () => {
    const contract = resolveFoleonRuntimeContract({
      hasSpfxContext: true,
      siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
      config: {
        contentRegistryListId: '11111111-1111-1111-1111-111111111111',
        placementsListId: '22222222-2222-2222-2222-222222222222',
      },
    });
    expect(contract.issues).toEqual([]);
    expect(contract.blockingReasons).toEqual([]);
    expect(contract.canInitialize).toBe(true);
  });
});
