import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDevAuthBypass } from './useDevAuthBypass.js';

const restoreSessionMock = vi.fn();
const acquireIdentityMock = vi.fn();
const normalizeSessionMock = vi.fn();

vi.mock('@hbc/auth/dev', () => {
  class MockAdapter {
    constructor(_delayMs = 500) {}

    acquireIdentity = acquireIdentityMock;
    normalizeSession = normalizeSessionMock;
    restoreSession = restoreSessionMock;
  }

  return {
    DevAuthBypassAdapter: MockAdapter,
    PERSONA_REGISTRY: {
      getById: (id: string) =>
        id === 'persona-admin'
          ? {
              id: 'persona-admin',
              name: 'Administrator',
              email: 'admin@hb-intel.local',
              roles: ['Administrator'],
              description: 'Admin persona',
            }
          : null,
    },
  };
});

function HookHarness(): JSX.Element {
  const state = useDevAuthBypass();

  return (
    <div>
      <button type="button" onClick={() => state.setAuthDelay(1200)}>
        set-delay
      </button>
      <button type="button" onClick={() => state.setAuditLoggingEnabled(false)}>
        disable-audit
      </button>
      <button
        type="button"
        onClick={() =>
          void state.selectPersona({
            id: 'persona-admin',
            name: 'Administrator',
            email: 'admin@hb-intel.local',
            roles: ['Administrator'],
            description: 'Admin persona',
          } as never)
        }
      >
        select-persona
      </button>
      <button type="button" onClick={() => state.expireSession()}>
        expire
      </button>
      <button type="button" onClick={() => void state.refreshSession()}>
        refresh
      </button>
      <div data-testid="auth-delay">{state.authDelay}</div>
      <div data-testid="audit-flag">{state.auditLoggingEnabled ? 'on' : 'off'}</div>
    </div>
  );
}

describe('useDevAuthBypass', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem('hb-auth-dev-delay', '700');
    localStorage.setItem(
      'hb-auth-dev-toolbar-state',
      JSON.stringify({ selectedPersonaId: 'persona-admin', auditLoggingEnabled: true }),
    );

    restoreSessionMock.mockResolvedValue({
      sessionId: 'restored-session-1',
      userId: 'persona-admin',
      displayName: 'Administrator',
      email: 'admin@hb-intel.local',
      roles: ['Administrator'],
      permissions: {},
      expiresAt: Date.now() + 60_000,
      acquiredAt: Date.now(),
    });

    acquireIdentityMock.mockResolvedValue({
      userId: 'generated-user',
      displayName: 'Generated User',
      email: 'generated@hb-intel.local',
      roles: ['Member'],
      metadata: {
        loginTimestamp: Date.now(),
        deviceFingerprint: 'abc',
        sessionId: 'generated-session-1',
      },
      claims: { scopes: [] },
    });

    normalizeSessionMock.mockImplementation(async (identity: { userId: string; email: string }) => ({
      sessionId: 'normalized-session-1',
      userId: identity.userId,
      displayName: 'Administrator',
      email: identity.email,
      roles: ['Administrator'],
      permissions: { 'feature:admin-panel': true },
      expiresAt: Date.now() + 60_000,
      acquiredAt: Date.now(),
    }));

    await act(async () => {
      root.render(<HookHarness />);
      await Promise.resolve();
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  it('restores persisted delay and allows updating persisted settings', async () => {
    expect(container.querySelector('[data-testid="auth-delay"]')?.textContent).toBe('700');

    const delayButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'set-delay');
    const auditButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'disable-audit');

    await act(async () => {
      delayButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      auditButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(localStorage.getItem('hb-auth-dev-delay')).toBe('1200');
    expect(localStorage.getItem('hb-auth-dev-toolbar-state')).toContain('"auditLoggingEnabled":false');
  });

  it('selects persona, expires session, and refreshes session', async () => {
    sessionStorage.setItem('hb-auth-dev-session', JSON.stringify({ version: 1 }));

    const selectButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('select-persona'),
    );
    const expireButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'expire');
    const refreshButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'refresh');

    await act(async () => {
      selectButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(acquireIdentityMock).toHaveBeenCalledTimes(1);
    expect(normalizeSessionMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      expireButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sessionStorage.getItem('hb-auth-dev-session')).toBeNull();

    await act(async () => {
      refreshButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(restoreSessionMock).toHaveBeenCalled();
  });
});
