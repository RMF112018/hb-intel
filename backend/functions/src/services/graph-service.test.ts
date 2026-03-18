import { describe, it, expect, vi, afterEach } from 'vitest';
import { MockGraphService, GraphService, GraphPermissionNotConfirmedError } from './graph-service.js';

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
