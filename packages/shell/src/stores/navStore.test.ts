import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveNavRouteState, useNavStore, type RouterHistoryLike } from './navStore.js';

class MockHistory implements RouterHistoryLike {
  location: { pathname: string };

  private listeners = new Set<() => void>();

  constructor(initialPathname: string) {
    this.location = { pathname: initialPathname };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  navigate(pathname: string): void {
    this.location = { pathname };
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function resetNavStore(): void {
  useNavStore.getState().stopNavSync();
  useNavStore.setState({
    activeWorkspace: null,
    activeItemId: undefined,
    toolPickerItems: [],
    sidebarItems: [],
    isSidebarOpen: true,
    isAppLauncherOpen: false,
  });
}

describe('resolveNavRouteState', () => {
  it('resolves canonical nav item and workspace for nested detail routes', () => {
    expect(resolveNavRouteState('/accounting/overview/details/123')).toEqual({
      activeWorkspace: 'accounting',
      activeItemId: 'overview',
    });
  });

  it('falls back to workspace root when no canonical nav item exists', () => {
    expect(resolveNavRouteState('/site-control/safety-monitoring')).toEqual({
      activeWorkspace: 'site-control',
      activeItemId: undefined,
    });
  });

  it('returns null workspace for unmatched paths', () => {
    expect(resolveNavRouteState('/does-not-exist')).toEqual({
      activeWorkspace: null,
      activeItemId: undefined,
    });
  });
});

describe('navStore router synchronization', () => {
  beforeEach(() => {
    resetNavStore();
  });

  afterEach(() => {
    resetNavStore();
  });

  it('syncs initial route and subsequent route changes', () => {
    const history = new MockHistory('/accounting/overview');
    useNavStore.getState().startNavSync(history);

    expect(useNavStore.getState().activeWorkspace).toBe('accounting');
    expect(useNavStore.getState().activeItemId).toBe('overview');

    history.navigate('/estimating/bids/123');
    expect(useNavStore.getState().activeWorkspace).toBe('estimating');
    expect(useNavStore.getState().activeItemId).toBe('bids');
  });

  it('syncs back/forward transitions and cleans up unsubscribe on stop', () => {
    const history = new MockHistory('/project-hub');
    useNavStore.getState().startNavSync(history);

    history.navigate('/accounting/invoices');
    expect(useNavStore.getState().activeItemId).toBe('invoices');

    // Simulate browser back/forward by replaying pathname transitions.
    history.navigate('/project-hub');
    expect(useNavStore.getState().activeItemId).toBe('portfolio');

    useNavStore.getState().stopNavSync();
    history.navigate('/estimating/bids');

    // State remains unchanged after stop, proving subscription cleanup.
    expect(useNavStore.getState().activeWorkspace).toBe('project-hub');
    expect(useNavStore.getState().activeItemId).toBe('portfolio');
  });
});
