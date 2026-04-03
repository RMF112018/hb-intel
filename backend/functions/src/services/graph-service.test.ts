import { describe, it, expect, vi, afterEach } from 'vitest';
import { MockGraphService, GraphService, GraphPermissionNotConfirmedError } from './graph-service.js';
import type { IGraphUserProfile } from './graph-service.js';

// ─── Provisioning-era mock tests (unchanged) ─────────────────────────────────

describe('MockGraphService', () => {
  it('createSecurityGroup returns a unique ID', async () => {
    const svc = new MockGraphService();
    const id1 = await svc.createSecurityGroup('Group-A', 'desc');
    const id2 = await svc.createSecurityGroup('Group-B', 'desc');
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('getGroupByDisplayName finds existing group', async () => {
    const svc = new MockGraphService();
    const id = await svc.createSecurityGroup('HB-25-001-Leaders', 'desc');
    const found = await svc.getGroupByDisplayName('HB-25-001-Leaders');
    expect(found).toBe(id);
  });

  it('getGroupByDisplayName returns null for non-existent group', async () => {
    const svc = new MockGraphService();
    const result = await svc.getGroupByDisplayName('does-not-exist');
    expect(result).toBeNull();
  });

  it('addGroupMembers adds members to the group', async () => {
    const svc = new MockGraphService();
    const id = await svc.createSecurityGroup('Group-A', 'desc');
    await expect(svc.addGroupMembers(id, ['a@hb.com', 'b@hb.com'])).resolves.toBeUndefined();
  });

  it('addGroupMembers throws for non-existent group', async () => {
    const svc = new MockGraphService();
    await expect(svc.addGroupMembers('non-existent-id', ['a@hb.com'])).rejects.toThrow('not found');
  });

  it('addGroupMembers is idempotent — adding same member twice does not throw', async () => {
    const svc = new MockGraphService();
    const id = await svc.createSecurityGroup('Group-A', 'desc');
    await svc.addGroupMembers(id, ['a@hb.com']);
    await expect(svc.addGroupMembers(id, ['a@hb.com'])).resolves.toBeUndefined();
  });

  it('grantSiteAccess resolves successfully', async () => {
    const svc = new MockGraphService();
    await expect(svc.grantSiteAccess('site-123', 'app-456', 'write')).resolves.toBeUndefined();
  });

  it('grantSiteAccess defaults role to write', async () => {
    const svc = new MockGraphService();
    await expect(svc.grantSiteAccess('site-123', 'app-456')).resolves.toBeUndefined();
  });
});

// ─── P9-04: Phase 9 identity method tests ────────────────────────────────────

describe('MockGraphService — P9-04 user read/search', () => {
  const mockUser: IGraphUserProfile = {
    id: 'user-001',
    displayName: 'Jane Doe',
    userPrincipalName: 'jane.doe@hb.com',
    mail: 'jane.doe@hb.com',
    jobTitle: 'Estimator',
    department: 'Estimating',
    accountEnabled: true,
    onPremisesSyncEnabled: true,
    onPremisesLastSyncDateTime: '2026-04-01T12:00:00Z',
    onPremisesSamAccountName: 'jane.doe',
    authorityType: 'ad-ds',
  };

  it('getUser returns seeded user by UPN', async () => {
    const svc = new MockGraphService();
    svc.seedUser(mockUser);
    const result = await svc.getUser('jane.doe@hb.com');
    expect(result).toEqual(mockUser);
  });

  it('getUser returns seeded user by ID', async () => {
    const svc = new MockGraphService();
    svc.seedUser(mockUser);
    const result = await svc.getUser('user-001');
    expect(result).toEqual(mockUser);
  });

  it('getUser returns null for unknown user', async () => {
    const svc = new MockGraphService();
    expect(await svc.getUser('unknown@hb.com')).toBeNull();
  });

  it('searchUsers finds by display name prefix', async () => {
    const svc = new MockGraphService();
    svc.seedUser(mockUser);
    const results = await svc.searchUsers('Jane');
    expect(results).toHaveLength(1);
    expect(results[0].userPrincipalName).toBe('jane.doe@hb.com');
  });

  it('searchUsers returns empty for no match', async () => {
    const svc = new MockGraphService();
    svc.seedUser(mockUser);
    expect(await svc.searchUsers('ZZZ')).toHaveLength(0);
  });
});

describe('MockGraphService — P9-04 group read/search', () => {
  it('getGroup returns seeded group with authority type', async () => {
    const svc = new MockGraphService();
    svc.seedGroup('grp-001', 'IT-Admins', true, ['jane.doe@hb.com']);
    const result = await svc.getGroup('grp-001');
    expect(result).not.toBeNull();
    expect(result!.authorityType).toBe('ad-ds');
    expect(result!.onPremisesSyncEnabled).toBe(true);
  });

  it('getGroup returns null for unknown group', async () => {
    const svc = new MockGraphService();
    expect(await svc.getGroup('unknown')).toBeNull();
  });

  it('searchGroups finds by display name prefix', async () => {
    const svc = new MockGraphService();
    svc.seedGroup('grp-001', 'IT-Admins', true);
    svc.seedGroup('grp-002', 'IT-Ops', false);
    const results = await svc.searchGroups('IT-');
    expect(results).toHaveLength(2);
  });

  it('getGroupMembers returns member UPNs', async () => {
    const svc = new MockGraphService();
    const id = await svc.createSecurityGroup('Team-A', 'desc');
    await svc.addGroupMembers(id, ['a@hb.com', 'b@hb.com']);
    const members = await svc.getGroupMembers(id);
    expect(members).toContain('a@hb.com');
    expect(members).toContain('b@hb.com');
  });

  it('removeGroupMembers removes members from group', async () => {
    const svc = new MockGraphService();
    const id = await svc.createSecurityGroup('Team-A', 'desc');
    await svc.addGroupMembers(id, ['a@hb.com', 'b@hb.com']);
    await svc.removeGroupMembers(id, ['a@hb.com']);
    const members = await svc.getGroupMembers(id);
    expect(members).not.toContain('a@hb.com');
    expect(members).toContain('b@hb.com');
  });
});

describe('MockGraphService — P9-04 cloud-only user lifecycle', () => {
  it('createCloudUser returns an ID and is retrievable', async () => {
    const svc = new MockGraphService();
    const id = await svc.createCloudUser({
      displayName: 'Cloud User',
      userPrincipalName: 'cloud@hb.com',
      mailNickname: 'cloud',
      accountEnabled: true,
      passwordProfile: { password: 'P@ss1234', forceChangePasswordNextSignIn: true },
    });
    expect(id).toBeTruthy();
    const user = await svc.getUser(id);
    expect(user).not.toBeNull();
    expect(user!.authorityType).toBe('entra');
    expect(user!.onPremisesSyncEnabled).toBe(false);
  });

  it('updateCloudUser modifies properties', async () => {
    const svc = new MockGraphService();
    const id = await svc.createCloudUser({
      displayName: 'Cloud User',
      userPrincipalName: 'cloud@hb.com',
      mailNickname: 'cloud',
      accountEnabled: true,
      passwordProfile: { password: 'P@ss1234', forceChangePasswordNextSignIn: true },
    });
    await svc.updateCloudUser(id, { jobTitle: 'Manager' });
    const user = await svc.getUser(id);
    expect(user!.jobTitle).toBe('Manager');
  });

  it('setCloudUserAccountEnabled toggles account state', async () => {
    const svc = new MockGraphService();
    const id = await svc.createCloudUser({
      displayName: 'Cloud User',
      userPrincipalName: 'cloud@hb.com',
      mailNickname: 'cloud',
      accountEnabled: true,
      passwordProfile: { password: 'P@ss1234', forceChangePasswordNextSignIn: true },
    });
    await svc.setCloudUserAccountEnabled(id, false);
    const user = await svc.getUser(id);
    expect(user!.accountEnabled).toBe(false);
  });

  it('deleteCloudUser removes the user', async () => {
    const svc = new MockGraphService();
    const id = await svc.createCloudUser({
      displayName: 'Cloud User',
      userPrincipalName: 'cloud@hb.com',
      mailNickname: 'cloud',
      accountEnabled: true,
      passwordProfile: { password: 'P@ss1234', forceChangePasswordNextSignIn: true },
    });
    await svc.deleteCloudUser(id);
    expect(await svc.getUser(id)).toBeNull();
  });
});

describe('MockGraphService — P9-04 sync visibility', () => {
  it('getOrganizationSyncInfo returns sync metadata', async () => {
    const svc = new MockGraphService();
    const info = await svc.getOrganizationSyncInfo();
    expect(info.onPremisesSyncEnabled).toBe(true);
    expect(info.onPremisesLastSyncDateTime).toBeTruthy();
  });
});

describe('GraphService (permission-gated)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('createSecurityGroup throws GraphPermissionNotConfirmedError when env var is unset', async () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    const svc = new GraphService();
    await expect(svc.createSecurityGroup('test', 'desc')).rejects.toThrow(GraphPermissionNotConfirmedError);
  });

  it('addGroupMembers throws GraphPermissionNotConfirmedError when env var is unset', async () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    const svc = new GraphService();
    await expect(svc.addGroupMembers('id', ['a@hb.com'])).rejects.toThrow(GraphPermissionNotConfirmedError);
  });

  it('getGroupByDisplayName throws GraphPermissionNotConfirmedError when env var is unset', async () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    const svc = new GraphService();
    await expect(svc.getGroupByDisplayName('test')).rejects.toThrow(GraphPermissionNotConfirmedError);
  });

  it('throws when env var is "false" (not "true")', async () => {
    vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'false');
    const svc = new GraphService();
    await expect(svc.createSecurityGroup('test', 'desc')).rejects.toThrow(GraphPermissionNotConfirmedError);
  });

  it('error message includes IT setup guide reference', async () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    const svc = new GraphService();
    try {
      await svc.createSecurityGroup('test', 'desc');
      expect.fail('should throw');
    } catch (err) {
      expect((err as Error).message).toContain('IT-Department-Setup-Guide.md');
      expect((err as Error).message).toContain('Group.ReadWrite.All');
      expect((err as Error).message).toContain('GRAPH_GROUP_PERMISSION_CONFIRMED');
    }
  });

  it('error has GraphPermissionNotConfirmedError name', async () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    const svc = new GraphService();
    try {
      await svc.createSecurityGroup('test', 'desc');
      expect.fail('should throw');
    } catch (err) {
      expect((err as Error).name).toBe('GraphPermissionNotConfirmedError');
    }
  });

  it('grantSiteAccess throws GraphPermissionNotConfirmedError when env var is unset', async () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    const svc = new GraphService();
    await expect(svc.grantSiteAccess('site-123', 'app-456')).rejects.toThrow(GraphPermissionNotConfirmedError);
  });
});
