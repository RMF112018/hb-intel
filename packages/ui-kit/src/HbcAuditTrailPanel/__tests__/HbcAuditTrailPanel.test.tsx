import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createComplexityWrapper } from '@hbc/complexity/testing';
import { HbcAuditTrailPanel } from '../index.js';

describe('HbcAuditTrailPanel', () => {
  it('renders with data-hbc-ui="HbcAuditTrailPanel" at expert tier', () => {
    const { container } = render(
      <HbcAuditTrailPanel itemId="item-123" />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcAuditTrailPanel"]'),
    ).toBeInTheDocument();
  });

  it('has role="log" with aria-label="Audit trail"', () => {
    render(
      <HbcAuditTrailPanel itemId="item-123" />,
      { wrapper: createComplexityWrapper('expert') },
    );
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-label', 'Audit trail');
  });

  it('renders heading "Audit Trail"', () => {
    render(
      <HbcAuditTrailPanel itemId="item-123" />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
  });

  it('shows "No audit entries" placeholder', () => {
    render(
      <HbcAuditTrailPanel itemId="item-123" />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(screen.getByText('No audit entries')).toBeInTheDocument();
  });

  it('preserves data-item-id and data-max-items attributes', () => {
    const { container } = render(
      <HbcAuditTrailPanel itemId="item-456" maxItems={10} />,
      { wrapper: createComplexityWrapper('expert') },
    );
    const el = container.querySelector('[data-hbc-ui="HbcAuditTrailPanel"]');
    expect(el).toHaveAttribute('data-item-id', 'item-456');
    expect(el).toHaveAttribute('data-max-items', '10');
  });

  it('returns null at standard tier (expert-gated)', () => {
    const { container } = render(
      <HbcAuditTrailPanel itemId="item-123" />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcAuditTrailPanel"]'),
    ).not.toBeInTheDocument();
  });
});
