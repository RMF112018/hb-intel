import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createComplexityWrapper, ComplexityTestProvider } from '@hbc/complexity/testing';
import { HbcCoachingCallout } from '../index.js';

describe('HbcCoachingCallout', () => {
  // essential tier: showCoaching defaults to true
  it('renders with data-hbc-ui="HbcCoachingCallout" at essential tier', () => {
    const { container } = render(
      <HbcCoachingCallout message="Try this feature" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcCoachingCallout"]'),
    ).toBeInTheDocument();
  });

  it('has role="note" with aria-label="Guidance"', () => {
    render(
      <HbcCoachingCallout message="Try this feature" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    const note = screen.getByRole('note');
    expect(note).toHaveAttribute('aria-label', 'Guidance');
  });

  it('displays message text', () => {
    render(
      <HbcCoachingCallout message="Click here to get started" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(screen.getByText('Click here to get started')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction provided', () => {
    render(
      <HbcCoachingCallout message="Try this" actionLabel="Learn more" onAction={() => {}} />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument();
  });

  it('does NOT render action button when actionLabel omitted', () => {
    render(
      <HbcCoachingCallout message="Try this" />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('fires onAction on button click', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <HbcCoachingCallout message="Try this" actionLabel="Go" onAction={onAction} />,
      { wrapper: createComplexityWrapper('essential') },
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('returns null at expert tier (gated out)', () => {
    const { container } = render(
      <HbcCoachingCallout message="Try this" />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcCoachingCallout"]'),
    ).not.toBeInTheDocument();
  });

  it('returns null when showCoaching=false', () => {
    const { container } = render(
      <ComplexityTestProvider tier="essential" showCoaching={false}>
        <HbcCoachingCallout message="Try this" />
      </ComplexityTestProvider>,
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcCoachingCallout"]'),
    ).not.toBeInTheDocument();
  });
});
