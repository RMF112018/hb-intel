import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodeSharePointPermissionMask,
  hasPermission,
  mapPermissionsToPosture,
  resolvePriorityActionsAdminPermissions,
} from '../data/priorityActionsAdminPermissions.js';

function permissionMaskPartsFromKinds(kinds: number[]): { High: string; Low: string } {
  let mask = 0n;
  for (const kind of kinds) {
    mask |= 1n << BigInt(kind);
  }
  const low = mask & 0xffffffffn;
  const high = (mask >> 32n) & 0xffffffffn;
  return {
    High: high.toString(16),
    Low: low.toString(16),
  };
}

function okJson<T>(value: T): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('priorityActionsAdminPermissions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('decodes high/low permission masks and checks permission bits', () => {
    const mask = decodeSharePointPermissionMask({
      High: '1',
      Low: '0',
    });
    expect(hasPermission(mask, 32)).toBe(true);
    expect(hasPermission(mask, 3)).toBe(false);
  });

  it('maps capability sets to expected postures', () => {
    expect(mapPermissionsToPosture({
      canView: true,
      canEdit: true,
      canReorder: true,
      canArchive: true,
      canPublish: true,
    })).toBe('editable');

    expect(mapPermissionsToPosture({
      canView: true,
      canEdit: false,
      canReorder: false,
      canArchive: false,
      canPublish: false,
    })).toBe('read-only');

    expect(mapPermissionsToPosture({
      canView: false,
      canEdit: false,
      canReorder: false,
      canArchive: false,
      canPublish: false,
    })).toBe('insufficient-permission');
  });

  it('returns simulated posture when site URL is unavailable', async () => {
    const resolved = await resolvePriorityActionsAdminPermissions(undefined);
    expect(resolved.status).toBe('simulated');
    expect(resolved.posture).toBe('editable');
    expect(resolved.permissions.canPublish).toBe(true);
  });

  it('fails closed on permission resolution failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('forbidden', { status: 403 })));
    const resolved = await resolvePriorityActionsAdminPermissions('https://example.sharepoint.com/sites/Test');
    expect(resolved.status).toBe('resolution-failed');
    expect(resolved.posture).toBe('insufficient-permission');
    expect(resolved.permissions.canPublish).toBe(false);
  });

  it('resolves editable posture when both lists are editable', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/_api/web/currentuser')) {
        return okJson({ IsSiteAdmin: false, Title: 'Maintainer' });
      }
      return okJson(permissionMaskPartsFromKinds([1, 3, 6]));
    });
    vi.stubGlobal('fetch', fetchMock);

    const resolved = await resolvePriorityActionsAdminPermissions('https://example.sharepoint.com/sites/Test');
    expect(resolved.status).toBe('resolved');
    expect(resolved.posture).toBe('editable');
    expect(resolved.permissions.canPublish).toBe(true);
  });

  it('resolves read-only posture when view permission exists without edit permission', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/_api/web/currentuser')) {
        return okJson({ IsSiteAdmin: false, Title: 'Viewer' });
      }
      return okJson(permissionMaskPartsFromKinds([1, 6]));
    });
    vi.stubGlobal('fetch', fetchMock);

    const resolved = await resolvePriorityActionsAdminPermissions('https://example.sharepoint.com/sites/Test');
    expect(resolved.status).toBe('resolved');
    expect(resolved.posture).toBe('read-only');
    expect(resolved.permissions.canView).toBe(true);
    expect(resolved.permissions.canPublish).toBe(false);
  });
});

