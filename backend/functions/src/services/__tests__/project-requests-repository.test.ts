import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';

/**
 * Unit tests for project-requests-repository:
 * - SharePoint target alignment (constructor env var resolution)
 * - MockProjectRequestsRepository CRUD behavior
 * - escapeODataValue utility
 * - P6-03: Identifier aliasing invariant through mock round-trip
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

// ─────────────────────────────────────────────────────────────────────────────
// SharePointProjectRequestsAdapter — SP target alignment
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// escapeODataValue — OData filter escaping
// ─────────────────────────────────────────────────────────────────────────────

describe('escapeODataValue()', () => {
  // Import lazily to work with vi.resetModules
  async function getEscapeFn() {
    const mod = await import('../project-requests-repository.js');
    return mod.escapeODataValue;
  }

  it('passes through values without single quotes', async () => {
    const escape = await getEscapeFn();
    expect(escape('abc-123')).toBe('abc-123');
  });

  it('doubles single quotes for OData safety', async () => {
    const escape = await getEscapeFn();
    expect(escape("O'Brien")).toBe("O''Brien");
  });

  it('handles multiple single quotes', async () => {
    const escape = await getEscapeFn();
    expect(escape("it's a 'test'")).toBe("it''s a ''test''");
  });

  it('handles empty string', async () => {
    const escape = await getEscapeFn();
    expect(escape('')).toBe('');
  });

  it('handles UUID values unchanged', async () => {
    const escape = await getEscapeFn();
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(escape(uuid)).toBe(uuid);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MockProjectRequestsRepository — CRUD behavior
// ─────────────────────────────────────────────────────────────────────────────

function makeTestRequest(overrides: Partial<IProjectSetupRequest> = {}): IProjectSetupRequest {
  return {
    requestId: 'req-001',
    projectId: 'req-001',
    projectName: 'Test Project',
    projectLocation: 'Test Location',
    projectType: 'Residential',
    projectStage: 'Pursuit',
    submittedBy: 'user@hb.com',
    submittedAt: '2026-04-01T12:00:00.000Z',
    state: 'Submitted',
    groupMembers: ['member1@hb.com', 'member2@hb.com'],
    retryCount: 0,
    ...overrides,
  };
}

describe('MockProjectRequestsRepository — CRUD operations', () => {
  let repo: import('../project-requests-repository.js').MockProjectRequestsRepository;

  beforeEach(async () => {
    const mod = await import('../project-requests-repository.js');
    repo = new mod.MockProjectRequestsRepository();
  });

  // ── upsertRequest + getRequest round-trip ──────────────────────────────

  it('inserts and retrieves a request by requestId', async () => {
    const request = makeTestRequest();
    await repo.upsertRequest(request);

    const retrieved = await repo.getRequest('req-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.requestId).toBe('req-001');
    expect(retrieved!.projectName).toBe('Test Project');
    expect(retrieved!.groupMembers).toEqual(['member1@hb.com', 'member2@hb.com']);
  });

  it('updates an existing request on second upsert', async () => {
    await repo.upsertRequest(makeTestRequest());
    await repo.upsertRequest(makeTestRequest({ projectName: 'Updated Name', state: 'UnderReview' }));

    const retrieved = await repo.getRequest('req-001');
    expect(retrieved!.projectName).toBe('Updated Name');
    expect(retrieved!.state).toBe('UnderReview');
  });

  it('returns null for a non-existent requestId', async () => {
    const result = await repo.getRequest('does-not-exist');
    expect(result).toBeNull();
  });

  it('returns defensive copies (mutation safety)', async () => {
    await repo.upsertRequest(makeTestRequest());

    const first = await repo.getRequest('req-001');
    first!.groupMembers.push('mutated@hb.com');

    const second = await repo.getRequest('req-001');
    expect(second!.groupMembers).toEqual(['member1@hb.com', 'member2@hb.com']);
  });

  // ── listRequests ───────────────────────────────────────────────────────

  it('lists all requests without filter', async () => {
    await repo.upsertRequest(makeTestRequest({ requestId: 'r1', projectId: 'r1' }));
    await repo.upsertRequest(makeTestRequest({ requestId: 'r2', projectId: 'r2', state: 'UnderReview' }));
    await repo.upsertRequest(makeTestRequest({ requestId: 'r3', projectId: 'r3', state: 'Completed' }));

    const all = await repo.listRequests();
    expect(all).toHaveLength(3);
  });

  it('filters by state when provided', async () => {
    await repo.upsertRequest(makeTestRequest({ requestId: 'r1', projectId: 'r1', state: 'Submitted' }));
    await repo.upsertRequest(makeTestRequest({ requestId: 'r2', projectId: 'r2', state: 'UnderReview' }));
    await repo.upsertRequest(makeTestRequest({ requestId: 'r3', projectId: 'r3', state: 'Submitted' }));

    const submitted = await repo.listRequests('Submitted');
    expect(submitted).toHaveLength(2);
    expect(submitted.every((r) => r.state === 'Submitted')).toBe(true);
  });

  it('returns empty array when no requests match filter', async () => {
    await repo.upsertRequest(makeTestRequest({ state: 'Submitted' }));
    const result = await repo.listRequests('Completed');
    expect(result).toEqual([]);
  });

  // ── findByProjectNumber ────────────────────────────────────────────────

  it('finds request by projectNumber', async () => {
    await repo.upsertRequest(makeTestRequest({ projectNumber: '25-100-01' }));

    const found = await repo.findByProjectNumber('25-100-01');
    expect(found).not.toBeNull();
    expect(found!.projectNumber).toBe('25-100-01');
  });

  it('returns null when projectNumber does not match', async () => {
    await repo.upsertRequest(makeTestRequest({ projectNumber: '25-100-01' }));
    const result = await repo.findByProjectNumber('99-999-99');
    expect(result).toBeNull();
  });

  it('returns null when no requests have a projectNumber', async () => {
    await repo.upsertRequest(makeTestRequest());
    const result = await repo.findByProjectNumber('25-100-01');
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// P6-03: Identifier aliasing invariant through mock round-trip
// ─────────────────────────────────────────────────────────────────────────────

describe('P6-03: Identifier aliasing invariant', () => {
  let repo: import('../project-requests-repository.js').MockProjectRequestsRepository;

  beforeEach(async () => {
    const mod = await import('../project-requests-repository.js');
    repo = new mod.MockProjectRequestsRepository();
  });

  it('requestId === projectId survives upsert + getRequest round-trip', async () => {
    const request = makeTestRequest({ requestId: 'id-alias', projectId: 'id-alias' });
    await repo.upsertRequest(request);

    const retrieved = await repo.getRequest('id-alias');
    expect(retrieved!.requestId).toBe(retrieved!.projectId);
  });

  it('lookup by requestId returns the request even though saga uses projectId', async () => {
    const request = makeTestRequest({ requestId: 'shared-key', projectId: 'shared-key' });
    await repo.upsertRequest(request);

    // Saga calls getRequest(projectId) — works because projectId === requestId
    const found = await repo.getRequest(request.projectId);
    expect(found).not.toBeNull();
    expect(found!.requestId).toBe('shared-key');
    expect(found!.projectId).toBe('shared-key');
  });

  it('projectNumber is independent of system key', async () => {
    const request = makeTestRequest({
      requestId: 'uuid-sys-key',
      projectId: 'uuid-sys-key',
      projectNumber: '25-200-01',
    });
    await repo.upsertRequest(request);

    const byId = await repo.getRequest('uuid-sys-key');
    const byPn = await repo.findByProjectNumber('25-200-01');

    expect(byId).not.toBeNull();
    expect(byPn).not.toBeNull();
    expect(byId!.requestId).toBe(byPn!.requestId);
    expect(byId!.projectNumber).not.toBe(byId!.requestId);
  });
});
