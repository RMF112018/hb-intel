import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcBanner } from '../index.js';

describe('HbcBanner', () => {
  it('renders with data-hbc-ui="banner"', () => {
    render(<HbcBanner variant="info">Test message</HbcBanner>);
    expect(screen.getByRole('status')).toHaveAttribute('data-hbc-ui', 'banner');
  });

  it('data-hbc-variant matches variant prop', () => {
    render(<HbcBanner variant="warning">Warning text</HbcBanner>);
    expect(screen.getByRole('alert')).toHaveAttribute('data-hbc-variant', 'warning');
  });

  it('uses role="alert" for error variant', () => {
    render(<HbcBanner variant="error">Error text</HbcBanner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="alert" for warning variant', () => {
    render(<HbcBanner variant="warning">Warning text</HbcBanner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for info variant', () => {
    render(<HbcBanner variant="info">Info text</HbcBanner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="status" for success variant', () => {
    render(<HbcBanner variant="success">Success text</HbcBanner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sets aria-live="assertive" for error/warning variants', () => {
    const { rerender } = render(<HbcBanner variant="error">Error</HbcBanner>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');

    rerender(<HbcBanner variant="warning">Warning</HbcBanner>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-live="polite" for info/success variants', () => {
    const { rerender } = render(<HbcBanner variant="info">Info</HbcBanner>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    rerender(<HbcBanner variant="success">Success</HbcBanner>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('dismiss button has aria-label="Dismiss banner"', async () => {
    const onDismiss = vi.fn();
    render(
      <HbcBanner variant="info" onDismiss={onDismiss}>
        Dismissible
      </HbcBanner>,
    );
    const btn = screen.getByLabelText('Dismiss banner');
    expect(btn).toBeInTheDocument();

    await userEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('renders children content', () => {
    render(
      <HbcBanner variant="success">
        <span data-testid="child">Custom child</span>
      </HbcBanner>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Custom child')).toBeInTheDocument();
  });
});
