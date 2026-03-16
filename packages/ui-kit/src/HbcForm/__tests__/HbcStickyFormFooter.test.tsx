import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcStickyFormFooter } from '../HbcStickyFormFooter.js';

describe('HbcStickyFormFooter', () => {
  const defaultProps = { onCancel: vi.fn() };

  it('renders with data-hbc-ui="sticky-form-footer"', () => {
    const { container } = render(<HbcStickyFormFooter {...defaultProps} />);
    expect(container.querySelector('[data-hbc-ui="sticky-form-footer"]')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    render(<HbcStickyFormFooter {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('fires onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    render(<HbcStickyFormFooter onCancel={handleCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  it('uses default labels "Save" and "Cancel"', () => {
    render(<HbcStickyFormFooter {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('supports custom labels', () => {
    render(
      <HbcStickyFormFooter
        {...defaultProps}
        primaryLabel="Submit"
        cancelLabel="Discard"
      />,
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('renders the primary button with type="submit"', () => {
    render(<HbcStickyFormFooter {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('renders the cancel button with type="button"', () => {
    render(<HbcStickyFormFooter {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
  });

  it('disables the primary button when primaryDisabled is true', () => {
    render(<HbcStickyFormFooter {...defaultProps} primaryDisabled />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('disables the primary button when primaryLoading is true', () => {
    const { container } = render(<HbcStickyFormFooter {...defaultProps} primaryLoading />);
    // When loading, HbcButton replaces text with a spinner so accessible name is empty.
    // Query by type="submit" instead.
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton).toBeDisabled();
  });

  it('renders extraActions between cancel and save', () => {
    render(
      <HbcStickyFormFooter
        {...defaultProps}
        extraActions={<button type="button">Reset</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});
