import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProxyHttpClient } from './ProxyHttpClient.js';
import { ProxyAuthRepository } from './ProxyAuthRepository.js';

function mockFetch(response: { status?: number; jsonBody?: unknown }): void {
  const { jsonBody, status = 200 } = response;
  const resp = {
    ok: status < 400,
    status,
    json: vi.fn().mockResolvedValue(jsonBody ?? {}),
  } as unknown as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp));
}

function createClient(): ProxyHttpClient {
  return new ProxyHttpClient({ baseUrl: 'https://api.test.com/api', accessToken: 'test-token', timeout: 5000 });
}

function lastFetchUrl(): string {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
}

function lastFetchInit(): RequestInit {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
}

afterEach(() => { vi.restoreAllMocks(); });

describe('ProxyAuthRepository', () => {
  // ── Session ─────────────────────────────────────────────────────────────

  it('getCurrentUser calls GET /auth/me', async () => {
    const user = { type: 'internal', id: 'u1', displayName: 'User', email: 'u@hb.com', roles: [] };
    mockFetch({ jsonBody: { data: user } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.getCurrentUser();
    expect(lastFetchUrl()).toContain('/auth/me');
    expect(result).toEqual(user);
  });

  // ── Role definitions ─────────────────────────────────────────────────────

  it('getRoles calls GET /auth/roles', async () => {
    const roles = [{ id: 'r1', name: 'Admin', grants: ['*:*'] }];
    mockFetch({ jsonBody: { data: roles } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.getRoles();
    expect(lastFetchUrl()).toContain('/auth/roles');
    expect(result).toEqual(roles);
  });

  it('getRoleById returns role on success', async () => {
    const role = { id: 'r1', name: 'Admin', grants: ['*:*'] };
    mockFetch({ jsonBody: { data: role } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.getRoleById('r1');
    expect(lastFetchUrl()).toContain('/auth/roles/r1');
    expect(result).toEqual(role);
  });

  it('getRoleById returns null on 404', async () => {
    mockFetch({ status: 404, jsonBody: { message: 'Not found', code: 'NOT_FOUND' } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.getRoleById('missing');
    expect(result).toBeNull();
  });

  it('createRole posts to /auth/roles', async () => {
    const created = { id: 'r2', name: 'PM', grants: ['project:read'] };
    mockFetch({ jsonBody: { data: created } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.createRole({ name: 'PM', grants: ['project:read'] });
    expect(lastFetchUrl()).toContain('/auth/roles');
    expect(lastFetchInit().method).toBe('POST');
    expect(result).toEqual(created);
  });

  it('updateRole patches /auth/roles/{id}', async () => {
    const updated = { id: 'r1', name: 'Super Admin', grants: ['*:*'] };
    mockFetch({ jsonBody: { data: updated } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.updateRole('r1', { name: 'Super Admin' });
    expect(lastFetchUrl()).toContain('/auth/roles/r1');
    expect(lastFetchInit().method).toBe('PATCH');
    expect(result).toEqual(updated);
  });

  it('deleteRole sends DELETE to /auth/roles/{id}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyAuthRepository(createClient());
    await expect(repo.deleteRole('r1')).resolves.toBeUndefined();
    expect(lastFetchUrl()).toContain('/auth/roles/r1');
    expect(lastFetchInit().method).toBe('DELETE');
  });

  // ── Role assignment ───────────────────────────────────────────────────────

  it('assignRole posts to /auth/users/{userId}/roles with roleId body', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyAuthRepository(createClient());
    await repo.assignRole('u1', 'r1');
    expect(lastFetchUrl()).toContain('/auth/users/u1/roles');
    expect(lastFetchInit().method).toBe('POST');
    expect(lastFetchInit().body).toBe(JSON.stringify({ roleId: 'r1' }));
  });

  it('removeRole sends DELETE to /auth/users/{userId}/roles/{roleId}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyAuthRepository(createClient());
    await repo.removeRole('u1', 'r1');
    expect(lastFetchUrl()).toContain('/auth/users/u1/roles/r1');
    expect(lastFetchInit().method).toBe('DELETE');
  });

  // ── Permission templates ──────────────────────────────────────────────────

  it('getPermissionTemplates calls GET /auth/templates', async () => {
    const templates = [{ id: 't1', name: 'Admin', description: 'Full access', grants: ['*:*'] }];
    mockFetch({ jsonBody: { data: templates } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.getPermissionTemplates();
    expect(lastFetchUrl()).toContain('/auth/templates');
    expect(result).toEqual(templates);
  });

  it('createPermissionTemplate posts to /auth/templates', async () => {
    const created = { id: 't2', name: 'PM', description: 'PM access', grants: ['project:read'] };
    mockFetch({ jsonBody: { data: created } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.createPermissionTemplate({ name: 'PM', description: 'PM access', grants: ['project:read'] });
    expect(lastFetchUrl()).toContain('/auth/templates');
    expect(lastFetchInit().method).toBe('POST');
    expect(result).toEqual(created);
  });

  it('updatePermissionTemplate patches /auth/templates/{id}', async () => {
    const updated = { id: 't1', name: 'Super Admin', description: 'Full access', grants: ['*:*'] };
    mockFetch({ jsonBody: { data: updated } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.updatePermissionTemplate('t1', { name: 'Super Admin' });
    expect(lastFetchUrl()).toContain('/auth/templates/t1');
    expect(lastFetchInit().method).toBe('PATCH');
    expect(result).toEqual(updated);
  });

  it('deletePermissionTemplate sends DELETE to /auth/templates/{id}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyAuthRepository(createClient());
    await expect(repo.deletePermissionTemplate('t1')).resolves.toBeUndefined();
    expect(lastFetchUrl()).toContain('/auth/templates/t1');
  });

  // ── Job Title mappings ────────────────────────────────────────────────────

  it('getJobTitleMappings calls GET /auth/job-title-mappings', async () => {
    const mappings = [{ id: 'm1', roleId: 'r1', roleName: 'PM', aliases: ['Project Manager'], matchMode: 'exact', active: true, updatedAt: '2026-01-01', updatedBy: 'admin' }];
    mockFetch({ jsonBody: { data: mappings } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.getJobTitleMappings();
    expect(lastFetchUrl()).toContain('/auth/job-title-mappings');
    expect(result).toEqual(mappings);
  });

  it('createJobTitleMapping posts to /auth/job-title-mappings', async () => {
    const created = { id: 'm2', roleId: 'r2', roleName: 'Exec', aliases: ['Executive'], matchMode: 'exact', active: true, updatedAt: '2026-01-01', updatedBy: 'admin' };
    mockFetch({ jsonBody: { data: created } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.createJobTitleMapping({ roleId: 'r2', roleName: 'Exec', aliases: ['Executive'], matchMode: 'exact', active: true, updatedAt: '2026-01-01', updatedBy: 'admin' });
    expect(lastFetchUrl()).toContain('/auth/job-title-mappings');
    expect(lastFetchInit().method).toBe('POST');
    expect(result).toEqual(created);
  });

  it('updateJobTitleMapping patches /auth/job-title-mappings/{id}', async () => {
    const updated = { id: 'm1', roleId: 'r1', roleName: 'PM', aliases: ['Project Manager', 'PM'], matchMode: 'exact', active: true, updatedAt: '2026-01-02', updatedBy: 'admin' };
    mockFetch({ jsonBody: { data: updated } });
    const repo = new ProxyAuthRepository(createClient());
    const result = await repo.updateJobTitleMapping('m1', { aliases: ['Project Manager', 'PM'] });
    expect(lastFetchUrl()).toContain('/auth/job-title-mappings/m1');
    expect(lastFetchInit().method).toBe('PATCH');
    expect(result).toEqual(updated);
  });

  it('deleteJobTitleMapping sends DELETE to /auth/job-title-mappings/{id}', async () => {
    mockFetch({ status: 204 });
    const repo = new ProxyAuthRepository(createClient());
    await expect(repo.deleteJobTitleMapping('m1')).resolves.toBeUndefined();
    expect(lastFetchUrl()).toContain('/auth/job-title-mappings/m1');
  });

  // ── Error paths ───────────────────────────────────────────────────────────

  it('throws HbcDataAccessError on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const repo = new ProxyAuthRepository(createClient());
    await expect(repo.getCurrentUser()).rejects.toThrow('Network error');
  });

  it('throws on non-404 error for getRoleById', async () => {
    mockFetch({ status: 500, jsonBody: { message: 'Internal error', code: 'SERVER_ERROR' } });
    const repo = new ProxyAuthRepository(createClient());
    await expect(repo.getRoleById('r1')).rejects.toThrow();
  });
});
