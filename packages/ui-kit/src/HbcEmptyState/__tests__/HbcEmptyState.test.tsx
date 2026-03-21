import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcEmptyState } from '../index.js';

describe('HbcEmptyState', () => {
  it('renders with data-hbc-ui="empty-state"', () => {
    const { container } = render(<HbcEmptyState title="No data" />);
    expect(container.querySelector('[data-hbc-ui="empty-state"]')).toBeInTheDocument();
  });

  it('renders the title as a paragraph element (UIF-011: body weight, not heading)', () => {
    render(<HbcEmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Nothing here').tagName).toBe('P');
  });

  it('renders description when provided', () => {
    render(<HbcEmptyState title="Empty" description="Try adding some items." />);
    expect(screen.getByText('Try adding some items.')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    const { container } = render(<HbcEmptyState title="Empty" />);
    // Title is now a <p> (UIF-011), so check that only 1 <p> exists (no description <p>)
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1); // Only the title <p>
  });

  it('renders icon content when icon prop is provided', () => {
    render(
      <HbcEmptyState
        title="No results"
        icon={<span data-testid="icon">Icon</span>}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('uses illustration prop when icon is not provided (backward compat)', () => {
    render(
      <HbcEmptyState
        title="No results"
        illustration={<span data-testid="illustration">Illustration</span>}
      />,
    );
    expect(screen.getByTestId('illustration')).toBeInTheDocument();
  });

  it('renders primaryAction when provided', () => {
    render(
      <HbcEmptyState
        title="Empty"
        primaryAction={<button>Add Item</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('uses action prop when primaryAction is not provided (backward compat)', () => {
    render(
      <HbcEmptyState
        title="Empty"
        action={<button>Legacy Action</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Legacy Action' })).toBeInTheDocument();
  });

  it('does not render actions row when no actions are provided', () => {
    const { container } = render(<HbcEmptyState title="Empty" />);
    // The actions div only renders when resolvedPrimary or secondaryAction exists
    const emptyState = container.querySelector('[data-hbc-ui="empty-state"]')!;
    // title <p> is the only child when no icon, no description, no actions
    expect(emptyState.children).toHaveLength(1);
  });

  it('renders both primaryAction and secondaryAction together', () => {
    render(
      <HbcEmptyState
        title="Empty"
        primaryAction={<button>Primary</button>}
        secondaryAction={<button>Secondary</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
  });
});
