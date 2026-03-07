import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { IDevAuthBypassState } from './useDevAuthBypass.js';
import { DevToolbar } from './DevToolbar.js';

const mockHookState: IDevAuthBypassState = {
  currentSession: {
    sessionId: 'session-1234567890abcdef',
    userId: 'persona-admin',
    displayName: 'Administrator',
    email: 'admin@hb-intel.local',
    roles: ['Administrator'],
    permissions: { 'feature:admin-panel': true },
    expiresAt: Date.now() + 60_000,
    acquiredAt: Date.now(),
  },
  selectedPersona: null,
  authDelay: 500,
  auditLoggingEnabled: true,
  selectPersona: vi.fn().mockResolvedValue(undefined),
  setAuthDelay: vi.fn(),
  setAuditLoggingEnabled: vi.fn(),
  expireSession: vi.fn(),
  refreshSession: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@hbc/auth/dev', () => ({
  PERSONA_REGISTRY: {
    all: () => [
      {
        id: 'persona-admin',
        name: 'Administrator',
        email: 'admin@hb-intel.local',
        roles: ['Administrator'],
        description: 'Admin persona',
      },
      {
        id: 'persona-member',
        name: 'Member',
        email: 'member@hb-intel.local',
        roles: ['Member'],
        description: 'Member persona',
      },
    ],
  },
}));

vi.mock('./useDevAuthBypass.js', () => ({
  useDevAuthBypass: () => mockHookState,
}));

describe('DevToolbar', () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalDev: boolean;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    originalDev = import.meta.env.DEV;
    sessionStorage.clear();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
    Object.assign(import.meta.env, { DEV: originalDev });
  });

  it('does not render when DEV is false', () => {
    Object.assign(import.meta.env, { DEV: false });

    act(() => {
      root.render(<DevToolbar />);
    });

    expect(container.textContent ?? '').toBe('');
  });

  it('toggles expand/collapse and tab selection', () => {
    Object.assign(import.meta.env, { DEV: true });

    act(() => {
      root.render(<DevToolbar />);
    });

    const toggle = container.querySelector('button[title="Expand dev toolbar"]') as HTMLButtonElement;
    expect(toggle).toBeTruthy();

    act(() => {
      toggle.click();
    });

    expect(container.textContent).toContain('Personas');
    const settingsTab = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'Settings');
    expect(settingsTab).toBeTruthy();

    act(() => {
      settingsTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Auth Delay: 500ms');

    const sessionTab = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'Session');
    act(() => {
      sessionTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Status:');
  });

  it('fires settings and session actions', () => {
    Object.assign(import.meta.env, { DEV: true });

    act(() => {
      root.render(<DevToolbar />);
    });

    const toggle = container.querySelector('button[title="Expand dev toolbar"]') as HTMLButtonElement;
    act(() => {
      toggle.click();
    });

    const settingsTab = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'Settings');
    act(() => {
      settingsTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const slider = container.querySelector('#auth-delay-slider') as HTMLInputElement;
    expect(slider).toBeTruthy();
    act(() => {
      slider.value = '1200';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const auditToggle = container.querySelector('#audit-logging-toggle') as HTMLInputElement;
    expect(auditToggle).toBeTruthy();
    act(() => {
      auditToggle.checked = false;
      auditToggle.dispatchEvent(new Event('change', { bubbles: true }));
    });

    sessionStorage.setItem('foo', 'bar');
    const clearButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Clear SessionStorage'),
    );
    act(() => {
      clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(sessionStorage.length).toBe(0);

    const sessionTab = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'Session');
    act(() => {
      sessionTab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const expireButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'Expire Session');
    const refreshButton = Array.from(container.querySelectorAll('button')).find((btn) => btn.textContent === 'Refresh Session');

    act(() => {
      expireButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      refreshButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockHookState.expireSession).toHaveBeenCalledTimes(1);
    expect(mockHookState.refreshSession).toHaveBeenCalledTimes(1);
  });
});
