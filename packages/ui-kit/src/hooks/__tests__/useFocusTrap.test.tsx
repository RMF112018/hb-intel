import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useFocusTrap } from '../useFocusTrap.js';

function TrapContainer({ active }: { active: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref}>
      <button data-testid="first">First</button>
      <button data-testid="middle">Middle</button>
      <button data-testid="last">Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('auto-focuses first focusable element when active', () => {
    render(<TrapContainer active />);
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('does not focus when inactive', () => {
    render(<TrapContainer active={false} />);
    expect(document.activeElement).not.toBe(screen.getByTestId('first'));
  });

  it('wraps Tab from last to first', async () => {
    const user = userEvent.setup();
    render(<TrapContainer active />);
    screen.getByTestId('last').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('wraps Shift+Tab from first to last', async () => {
    const user = userEvent.setup();
    render(<TrapContainer active />);
    screen.getByTestId('first').focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId('last'));
  });

  it('no-op when container has no focusable elements', () => {
    function EmptyContainer() {
      const ref = React.useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true);
      return <div ref={ref}><span>No buttons</span></div>;
    }
    render(<EmptyContainer />);
    // No error thrown
  });
});
