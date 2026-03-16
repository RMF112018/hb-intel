import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Stub hooks that depend on browser APIs not fully available in jsdom
vi.mock('../../hooks/useFocusTrap.js', () => ({
  useFocusTrap: () => {},
}));

import { HbcModal } from '../index.js';

describe('HbcModal', () => {
  it('does not render when open=false', () => {
    render(
      <HbcModal open={false} onClose={vi.fn()} title="Modal">
        Body
      </HbcModal>,
    );
    expect(document.querySelector('[data-hbc-ui="modal"]')).not.toBeInTheDocument();
  });

  it('renders with data-hbc-ui="modal" when open=true', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Modal">
        Body
      </HbcModal>,
    );
    expect(document.querySelector('[data-hbc-ui="modal"]')).toBeInTheDocument();
  });

  it('default role is "dialog"', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Modal">
        Body
      </HbcModal>,
    );
    const modal = document.querySelector('[data-hbc-ui="modal"]');
    expect(modal).toHaveAttribute('role', 'dialog');
  });

  it('role="alertdialog" when role prop set', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Alert" role="alertdialog">
        Body
      </HbcModal>,
    );
    const modal = document.querySelector('[data-hbc-ui="modal"]');
    expect(modal).toHaveAttribute('role', 'alertdialog');
  });

  it('aria-modal="true" present', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Modal">
        Body
      </HbcModal>,
    );
    const modal = document.querySelector('[data-hbc-ui="modal"]');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('aria-label matches title', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Confirm Action">
        Body
      </HbcModal>,
    );
    const modal = document.querySelector('[data-hbc-ui="modal"]');
    expect(modal).toHaveAttribute('aria-label', 'Confirm Action');
  });

  it('title displayed in header', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="My Modal Title">
        Body
      </HbcModal>,
    );
    expect(screen.getByText('My Modal Title')).toBeInTheDocument();
  });

  it('close button has aria-label="Close"', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Modal">
        Body
      </HbcModal>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('onClose fires when close button clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <HbcModal open={true} onClose={handleClose} title="Modal">
        Body
      </HbcModal>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('children render in body', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Modal">
        <p>Modal body content</p>
      </HbcModal>,
    );
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('footer renders when provided', () => {
    render(
      <HbcModal open={true} onClose={vi.fn()} title="Modal" footer={<button>OK</button>}>
        Body
      </HbcModal>,
    );
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });
});
