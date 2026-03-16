import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Stub hooks that depend on browser APIs not fully available in jsdom
vi.mock('../../hooks/useFocusTrap.js', () => ({
  useFocusTrap: () => {},
}));

import { HbcConfirmDialog } from '../index.js';

describe('HbcConfirmDialog', () => {
  const defaultProps = {
    open: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
  };

  it('does not render when open=false', () => {
    render(<HbcConfirmDialog {...defaultProps} open={false} />);
    expect(document.querySelector('[data-hbc-ui="modal"]')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<HbcConfirmDialog {...defaultProps} open={true} />);
    expect(document.querySelector('[data-hbc-ui="modal"]')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('onClose fires on cancel click', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<HbcConfirmDialog {...defaultProps} open={true} onClose={handleClose} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('onConfirm fires on confirm click', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    render(<HbcConfirmDialog {...defaultProps} open={true} onConfirm={handleConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(handleConfirm).toHaveBeenCalledOnce();
  });

  it('confirm button shows loading state when loading=true', () => {
    render(<HbcConfirmDialog {...defaultProps} open={true} loading={true} />);
    // HbcButton renders a Spinner with role="progressbar" when loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
