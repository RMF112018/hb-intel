// D-PH7-BW-10: Bootstrap test for safety webpart
import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapMockEnvironment } from '../bootstrap.js';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useNavStore } from '@hbc/shell';

describe('bootstrapMockEnvironment (safety)', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null });
    usePermissionStore.setState({ permissions: [] });
  });

  it('sets a non-null current user', () => {
    bootstrapMockEnvironment();
    expect(useAuthStore.getState().currentUser).not.toBeNull();
  });

  it('sets non-wildcard permissions', () => {
    bootstrapMockEnvironment();
    const perms = usePermissionStore.getState().permissions;
    expect(perms).not.toContain('*:*');
    expect(perms.length).toBeGreaterThan(0);
  });

  it('sets workspace to safety', () => {
    bootstrapMockEnvironment();
    expect(useNavStore.getState().activeWorkspace).toBe('safety');
  });

  it('uses PersonaRegistry (not hardcoded MOCK_USER)', () => {
    bootstrapMockEnvironment();
    const user = useAuthStore.getState().currentUser;
    expect(user?.id).not.toBe('user-001');
  });
});
