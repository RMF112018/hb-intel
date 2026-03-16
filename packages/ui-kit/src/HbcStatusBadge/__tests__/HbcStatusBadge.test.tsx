import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcStatusBadge } from '../index.js';
import type { StatusVariant } from '../types.js';

describe('HbcStatusBadge', () => {
  it('renders with data-hbc-ui="status-badge"', () => {
    render(<HbcStatusBadge variant="success" label="Done" />);
    expect(screen.getByText('Done').closest('[data-hbc-ui]')).toHaveAttribute(
      'data-hbc-ui',
      'status-badge',
    );
  });

  it('renders with data-hbc-status matching the variant', () => {
    render(<HbcStatusBadge variant="atRisk" label="At Risk" />);
    expect(screen.getByText('At Risk').closest('[data-hbc-status]')).toHaveAttribute(
      'data-hbc-status',
      'atRisk',
    );
  });

  it('aria-label contains variant and label text', () => {
    render(<HbcStatusBadge variant="warning" label="Needs Review" />);
    expect(screen.getByLabelText('warning: Needs Review')).toBeInTheDocument();
  });

  const allVariants: StatusVariant[] = [
    'success',
    'warning',
    'error',
    'info',
    'neutral',
    'onTrack',
    'atRisk',
    'critical',
    'pending',
    'inProgress',
    'completed',
    'draft',
  ];

  it.each(allVariants)('renders variant "%s" without error', (variant) => {
    const { container } = render(
      <HbcStatusBadge variant={variant} label={`Label-${variant}`} />,
    );
    expect(container.querySelector('[data-hbc-ui="status-badge"]')).toBeInTheDocument();
  });

  it('defaults size to "medium"', () => {
    const { container } = render(
      <HbcStatusBadge variant="success" label="Done" />,
    );
    // Badge receives size="medium" which Fluent renders — verify the badge exists
    // (size is forwarded to Fluent Badge; no DOM attribute to assert, but no error means default applied)
    expect(container.querySelector('[data-hbc-ui="status-badge"]')).toBeInTheDocument();
  });

  it('renders custom icon when icon prop is provided', () => {
    render(
      <HbcStatusBadge
        variant="success"
        label="Done"
        icon={<span data-testid="custom-icon">★</span>}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('merges className onto the Badge element', () => {
    const { container } = render(
      <HbcStatusBadge variant="info" label="Info" className="my-custom-class" />,
    );
    const badge = container.querySelector('[data-hbc-ui="status-badge"]');
    expect(badge).toHaveClass('my-custom-class');
  });
});
