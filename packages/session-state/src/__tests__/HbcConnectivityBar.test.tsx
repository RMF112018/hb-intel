/// <reference types="vitest/globals" />
import { render, screen, act } from '@testing-library/react';
import { SessionStateContext } from '../context/SessionStateContext.js';
import { HbcConnectivityBar } from '../components/HbcConnectivityBar.js';
import { createMockSessionContext } from '@hbc/session-state/testing';
import type { ISessionStateContext } from '../types/index.js';

function renderWithContext(
  ui: React.ReactElement,
  context: ISessionStateContext,
) {
  return render(
    <SessionStateContext.Provider value={context}>{ui}</SessionStateContext.Provider>,
  );
}

describe('HbcConnectivityBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is hidden when online and showWhenOnline is false (default)', () => {
    const ctx = createMockSessionContext({ connectivity: 'online' });
    const { container } = renderWithContext(<HbcConnectivityBar />, ctx);
    expect(container.firstChild).toBeNull();
  });

  it('shows "Connected" when online and showWhenOnline is true', () => {
    const ctx = createMockSessionContext({ connectivity: 'online' });
    renderWithContext(<HbcConnectivityBar showWhenOnline />, ctx);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows amber degraded message', () => {
    const ctx = createMockSessionContext({ connectivity: 'degraded' });
    renderWithContext(<HbcConnectivityBar />, ctx);
    const bar = screen.getByTestId('connectivity-bar');
    expect(bar).toHaveTextContent('Connection unstable');
    expect(bar).toHaveStyle({ backgroundColor: '#fff3cd' });
  });

  it('shows red offline message with pending count', () => {
    const ctx = createMockSessionContext({ connectivity: 'offline', pendingCount: 3 });
    renderWithContext(<HbcConnectivityBar />, ctx);
    const bar = screen.getByTestId('connectivity-bar');
    expect(bar).toHaveTextContent('You are offline');
    expect(bar).toHaveTextContent('3 change(s) queued');
    expect(bar).toHaveStyle({ backgroundColor: '#f8d7da' });
  });

  it('shows transient green "syncing" message on offline→online transition', () => {
    const ctx = createMockSessionContext({ connectivity: 'offline' });
    const { rerender } = render(
      <SessionStateContext.Provider value={ctx}>
        <HbcConnectivityBar />
      </SessionStateContext.Provider>,
    );

    // Transition to online
    const onlineCtx = createMockSessionContext({ connectivity: 'online' });
    rerender(
      <SessionStateContext.Provider value={onlineCtx}>
        <HbcConnectivityBar />
      </SessionStateContext.Provider>,
    );

    expect(screen.getByText(/Syncing changes/)).toBeInTheDocument();
    expect(screen.getByTestId('connectivity-bar')).toHaveStyle({ backgroundColor: '#d4edda' });

    // After 3s the bar should disappear (showWhenOnline defaults to false)
    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(screen.queryByTestId('connectivity-bar')).toBeNull();
  });

  it('has role="status" and aria-live="polite" attributes', () => {
    const ctx = createMockSessionContext({ connectivity: 'offline' });
    renderWithContext(<HbcConnectivityBar />, ctx);
    const bar = screen.getByTestId('connectivity-bar');
    expect(bar).toHaveAttribute('role', 'status');
    expect(bar).toHaveAttribute('aria-live', 'polite');
  });

  it('renders safely in SPFx-compatible env (no service worker dependency)', () => {
    // Ensure no references to navigator.serviceWorker
    const ctx = createMockSessionContext({ connectivity: 'degraded' });
    expect(() => {
      renderWithContext(<HbcConnectivityBar />, ctx);
    }).not.toThrow();
  });
});
