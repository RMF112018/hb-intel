import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcMyWorkEmptyState } from '../components/HbcMyWorkEmptyState/index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@hbc/complexity');

vi.mock('@hbc/ui-kit', () => ({
  HbcEmptyState: (props: Record<string, unknown>) => (
    <div
      data-testid="empty-state"
      data-title={props.title}
      data-description={props.description}
      data-has-action={props.primaryAction ? 'true' : 'false'}
    >
      {props.primaryAction as React.ReactNode}
    </div>
  ),
  HbcButton: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcMyWorkEmptyState', () => {
  beforeEach(() => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
  });

  it('renders title in essential tier without description', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    render(<HbcMyWorkEmptyState />);
    const el = screen.getByTestId('empty-state');
    expect(el).toHaveAttribute('data-title', "You're all caught up");
    expect(el).not.toHaveAttribute('data-description', expect.any(String));
  });

  it('renders title and description in standard tier', () => {
    render(<HbcMyWorkEmptyState variant="panel" />);
    const el = screen.getByTestId('empty-state');
    expect(el).toHaveAttribute('data-title', "You're all caught up");
    expect(el).toHaveAttribute(
      'data-description',
      'No work items need your attention right now.',
    );
  });

  it('renders primary action in expert tier', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    render(<HbcMyWorkEmptyState />);
    const el = screen.getByTestId('empty-state');
    expect(el).toHaveAttribute('data-has-action', 'true');
    expect(screen.getByText('View completed items')).toBeInTheDocument();
  });

  it('uses feed variant with longer description', () => {
    render(<HbcMyWorkEmptyState variant="feed" />);
    const el = screen.getByTestId('empty-state');
    expect(el.getAttribute('data-description')).toContain(
      'All work items have been addressed',
    );
  });

  it('passes className through', () => {
    const { container } = render(<HbcMyWorkEmptyState className="custom" />);
    expect(container.querySelector('[data-testid="empty-state"]')).toBeInTheDocument();
  });
});
