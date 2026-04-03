import { describe, it, expect } from 'vitest';
import { ConnectionRegistryService } from './connection-registry-service.js';
import { ConnectionNotConfiguredError, ConnectionUnhealthyError } from './hybrid-identity-errors.js';

describe('ConnectionRegistryService', () => {
  it('upsertConnection creates a new connection', async () => {
    const svc = new ConnectionRegistryService();
    const record = await svc.upsertConnection('ads-1', {
      connectorClass: 'ad-ds',
      displayName: 'Production AD DS',
      config: { endpoint: 'dc01.corp.hb.com', port: 636, baseDn: 'DC=corp,DC=hb,DC=com' },
      credential: 'secret-password',
    }, 'admin@hb.com');

    expect(record.connectorId).toBe('ads-1');
    expect(record.connectorClass).toBe('ad-ds');
    expect(record.hasCredential).toBe(true);
    expect(record.healthStatus).toBe('untested');
    // Credential must NOT appear in the returned record
    expect('credential' in record).toBe(false);
  });

  it('getConnection returns the record without credential', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', {
      connectorClass: 'ad-ds',
      displayName: 'AD DS',
      config: {},
      credential: 'secret',
    }, 'admin@hb.com');

    const record = await svc.getConnection('ads-1');
    expect(record).not.toBeNull();
    expect(record!.hasCredential).toBe(true);
    expect('credential' in record!).toBe(false);
  });

  it('getConnection returns null for unknown ID', async () => {
    const svc = new ConnectionRegistryService();
    expect(await svc.getConnection('unknown')).toBeNull();
  });

  it('getConnectionByClass finds by connector class', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', {
      connectorClass: 'ad-ds',
      displayName: 'AD DS',
      config: {},
    }, 'admin@hb.com');

    const record = await svc.getConnectionByClass('ad-ds');
    expect(record).not.toBeNull();
    expect(record!.connectorId).toBe('ads-1');
  });

  it('listConnections returns all connections', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {} }, 'admin@hb.com');
    await svc.upsertConnection('graph-1', { connectorClass: 'graph-identity', displayName: 'Graph', config: {} }, 'admin@hb.com');

    const all = await svc.listConnections();
    expect(all).toHaveLength(2);
  });

  it('upsertConnection updates existing connection', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD v1', config: { endpoint: 'dc01' } }, 'admin@hb.com');
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD v2', config: { endpoint: 'dc02' } }, 'admin@hb.com');

    const record = await svc.getConnection('ads-1');
    expect(record!.displayName).toBe('AD v2');
    expect(record!.config).toEqual({ endpoint: 'dc02' });
  });

  it('upsertConnection preserves credential if not provided on update', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {}, credential: 'secret' }, 'admin@hb.com');
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD Updated', config: {} }, 'admin@hb.com');

    expect(await svc.resolveCredential('ads-1')).toBe('secret');
  });

  it('deleteConnection removes the connection', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {} }, 'admin@hb.com');
    await svc.deleteConnection('ads-1');
    expect(await svc.getConnection('ads-1')).toBeNull();
  });

  it('testConnection updates health to healthy', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {} }, 'admin@hb.com');

    const result = await svc.testConnection('ads-1', 'admin@hb.com');
    expect(result.success).toBe(true);

    const record = await svc.getConnection('ads-1');
    expect(record!.healthStatus).toBe('healthy');
    expect(record!.lastTestedBy).toBe('admin@hb.com');
  });

  it('testConnection throws ConnectionNotConfiguredError for unknown connector', async () => {
    const svc = new ConnectionRegistryService();
    await expect(svc.testConnection('unknown', 'admin@hb.com'))
      .rejects.toThrow(ConnectionNotConfiguredError);
  });

  it('resolveCredential returns the stored credential', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {}, credential: 'my-secret' }, 'admin@hb.com');
    expect(await svc.resolveCredential('ads-1')).toBe('my-secret');
  });

  it('resolveCredential returns null for unknown connector', async () => {
    const svc = new ConnectionRegistryService();
    expect(await svc.resolveCredential('unknown')).toBeNull();
  });

  it('assertHealthy throws ConnectionNotConfiguredError when not configured', async () => {
    const svc = new ConnectionRegistryService();
    await expect(svc.assertHealthy('ad-ds')).rejects.toThrow(ConnectionNotConfiguredError);
  });

  it('assertHealthy throws ConnectionUnhealthyError when untested', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {} }, 'admin@hb.com');
    await expect(svc.assertHealthy('ad-ds')).rejects.toThrow(ConnectionUnhealthyError);
  });

  it('assertHealthy succeeds when healthy', async () => {
    const svc = new ConnectionRegistryService();
    await svc.upsertConnection('ads-1', { connectorClass: 'ad-ds', displayName: 'AD', config: {} }, 'admin@hb.com');
    await svc.testConnection('ads-1', 'admin@hb.com');
    const record = await svc.assertHealthy('ad-ds');
    expect(record.healthStatus).toBe('healthy');
  });
});
