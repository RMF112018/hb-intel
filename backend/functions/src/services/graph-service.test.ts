import { describe, it, expect } from 'vitest';
import { MockGraphService, GraphService } from './graph-service.js';

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
});

describe('GraphService (real scaffold)', () => {
  it('createSecurityGroup throws G2 scaffold error', async () => {
    const svc = new GraphService();
    await expect(svc.createSecurityGroup('test', 'desc')).rejects.toThrow('G2 scaffold');
  });

  it('addGroupMembers throws G2 scaffold error', async () => {
    const svc = new GraphService();
    await expect(svc.addGroupMembers('id', ['a@hb.com'])).rejects.toThrow('G2 scaffold');
  });

  it('getGroupByDisplayName throws G2 scaffold error', async () => {
    const svc = new GraphService();
    await expect(svc.getGroupByDisplayName('test')).rejects.toThrow('G2 scaffold');
  });
});
