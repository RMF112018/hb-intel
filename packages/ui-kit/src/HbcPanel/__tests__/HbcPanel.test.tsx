import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock useIsMobile to return true so we get the pure-HTML mobile bottom-sheet
// path, which renders reliably in jsdom (OverlayDrawer from Fluent does not).
vi.mock('../../hooks/useIsMobile.js', () => ({
  useIsMobile: () => true,
}));

// useFocusTrap is a no-op in this test context
vi.mock('../../hooks/useFocusTrap.js', () => ({
  useFocusTrap: () => {},
}));

import { HbcPanel } from '../index.js';

describe('HbcPanel', () => {
  it('does not render when open=false', () => {
    const { container } = render(
      <HbcPanel open={false} onClose={vi.fn()} title="Panel Title">
        Body
      </HbcPanel>,
    );
    expect(container.querySelector('[data-hbc-ui="panel"]')).not.toBeInTheDocument();
  });

  it('renders with data-hbc-ui="panel" when open=true', () => {
    render(
      <HbcPanel open={true} onClose={vi.fn()} title="Panel Title">
        Body
      </HbcPanel>,
    );
    expect(document.querySelector('[data-hbc-ui="panel"]')).toBeInTheDocument();
  });

  it('displays title text', () => {
    render(
      <HbcPanel open={true} onClose={vi.fn()} title="My Panel">
        Body
      </HbcPanel>,
    );
    expect(screen.getByText('My Panel')).toBeInTheDocument();
  });

  it('close button has aria-label="Close"', () => {
    render(
      <HbcPanel open={true} onClose={vi.fn()} title="Panel">
        Body
      </HbcPanel>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('onClose fires when close button clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <HbcPanel open={true} onClose={handleClose} title="Panel">
        Body
      </HbcPanel>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('children render in body', () => {
    render(
      <HbcPanel open={true} onClose={vi.fn()} title="Panel">
        <p>Panel body content</p>
      </HbcPanel>,
    );
    expect(screen.getByText('Panel body content')).toBeInTheDocument();
  });

  it('footer renders when provided', () => {
    render(
      <HbcPanel open={true} onClose={vi.fn()} title="Panel" footer={<button>Save</button>}>
        Body
      </HbcPanel>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
