/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionStateContext } from '../context/SessionStateContext.js';
import { HbcSyncStatusBadge } from '../components/HbcSyncStatusBadge.js';
import { createMockSessionContext } from '@hbc/session-state/testing';
import { createMockQueuedOperation } from '@hbc/session-state/testing';
import type { ISessionStateContext } from '../types/index.js';

function renderWithContext(
  ui: React.ReactElement,
  context: ISessionStateContext,
) {
  return render(
    <SessionStateContext.Provider value={context}>{ui}</SessionStateContext.Provider>,
  );
}

describe('HbcSyncStatusBadge', () => {
  it('is hidden when pendingCount is 0 and showWhenEmpty is false (default)', () => {
    const ctx = createMockSessionContext({ pendingCount: 0, queuedOperations: [] });
    const { container } = renderWithContext(<HbcSyncStatusBadge />, ctx);
    expect(container.firstChild).toBeNull();
  });

  it('shows green "Synced" check when 0 pending and showWhenEmpty is true', () => {
    const ctx = createMockSessionContext({ pendingCount: 0, queuedOperations: [] });
    renderWithContext(<HbcSyncStatusBadge showWhenEmpty />, ctx);
    const badge = screen.getByTestId('sync-badge');
    expect(badge).toHaveTextContent('✓ Synced');
    expect(badge).toHaveStyle({ backgroundColor: '#d4edda' });
  });

  it('shows amber badge with pending count when > 0', () => {
    const ops = [createMockQueuedOperation()];
    const ctx = createMockSessionContext({ pendingCount: 1, queuedOperations: ops });
    renderWithContext(<HbcSyncStatusBadge />, ctx);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('1 pending');
    expect(button).toHaveStyle({ backgroundColor: '#fff3cd' });
  });

  it('popover lists queued operations when expanded', async () => {
    const ops = [
      createMockQueuedOperation({ operationId: 'op-1', type: 'upload', target: '/api/files' }),
      createMockQueuedOperation({ operationId: 'op-2', type: 'form-save', target: '/api/forms', retryCount: 2, maxRetries: 5 }),
    ];
    const ctx = createMockSessionContext({ pendingCount: 2, queuedOperations: ops });
    renderWithContext(<HbcSyncStatusBadge />, ctx);

    // Click to expand
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    const popover = screen.getByTestId('sync-popover');
    expect(popover).toHaveTextContent('upload');
    expect(popover).toHaveTextContent('/api/files');
    expect(popover).toHaveTextContent('form-save');
    expect(popover).toHaveTextContent('/api/forms');
    expect(popover).toHaveTextContent('retry 2/5');
  });

  it('badge trigger is keyboard focusable (<button>)', () => {
    const ops = [createMockQueuedOperation()];
    const ctx = createMockSessionContext({ pendingCount: 1, queuedOperations: ops });
    renderWithContext(<HbcSyncStatusBadge />, ctx);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
    button.focus();
    expect(button).toHaveFocus();
  });

  it('popover content is keyboard navigable', async () => {
    const ops = [
      createMockQueuedOperation({ operationId: 'op-1' }),
      createMockQueuedOperation({ operationId: 'op-2' }),
    ];
    const ctx = createMockSessionContext({ pendingCount: 2, queuedOperations: ops });
    renderWithContext(<HbcSyncStatusBadge />, ctx);

    const user = userEvent.setup();
    // Tab to the button
    await user.tab();
    const button = screen.getByRole('button');
    expect(button).toHaveFocus();

    // Click to open popover
    await user.click(button);
    const popover = screen.getByTestId('sync-popover');
    expect(popover).toBeInTheDocument();
  });

  it('has appropriate aria attributes', () => {
    const ops = [createMockQueuedOperation(), createMockQueuedOperation({ operationId: 'op-2' })];
    const ctx = createMockSessionContext({ pendingCount: 2, queuedOperations: ops });
    renderWithContext(<HbcSyncStatusBadge />, ctx);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '2 pending operations');
  });
});
