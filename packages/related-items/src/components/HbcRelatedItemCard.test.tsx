import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRelatedItem } from '../types/index.js';

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(),
}));

import { useComplexity } from '@hbc/complexity';
import { HbcRelatedItemCard } from './HbcRelatedItemCard.js';

function createItem(overrides: Partial<IRelatedItem> = {}): IRelatedItem {
  return {
    recordType: 'project',
    recordId: 'project-1',
    label: 'Project One',
    status: 'Active',
    href: '/projects/project-1',
    moduleIcon: 'project',
    relationship: 'has',
    relationshipLabel: 'Projects',
    bicState: { currentState: 'watch' },
    versionChip: {
      lastChanged: '2026-03-10T10:00:00.000Z',
      author: 'Casey Rivera',
    },
    ...overrides,
  };
}

describe('HbcRelatedItemCard (SF14-T06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useComplexity).mockReturnValue({
      tier: 'standard',
      atLeast: vi.fn(),
      is: vi.fn(),
      setTier: vi.fn(),
      showCoaching: false,
      setShowCoaching: vi.fn(),
      isLocked: false,
      lockedBy: null,
      lockedUntil: null,
    });
  });

  it('renders standard item metadata and relationship context deterministically', () => {
    render(<HbcRelatedItemCard item={createItem()} />);

    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByTestId('related-item-status')).toHaveTextContent('Active');
    expect(screen.getByTestId('related-item-relationship')).toHaveTextContent('Projects');
    expect(screen.getByTestId('related-item-direction')).toHaveTextContent('Has');
    expect(screen.getByTestId('related-item-link')).toHaveAttribute('href', '/projects/project-1');
  });

  it('renders relationship direction labels consistently by direction value', () => {
    const { rerender } = render(
      <HbcRelatedItemCard item={createItem({ relationship: 'originated', relationshipLabel: 'Originated Pursuit' })} />,
    );
    expect(screen.getByTestId('related-item-direction')).toHaveTextContent('Originated');

    rerender(<HbcRelatedItemCard item={createItem({ relationship: 'converted-to', relationshipLabel: 'Converted Project' })} />);
    expect(screen.getByTestId('related-item-direction')).toHaveTextContent('Converted To');

    rerender(<HbcRelatedItemCard item={createItem({ relationship: 'is-blocked-by', relationshipLabel: 'Blocked' })} />);
    expect(screen.getByTestId('related-item-direction')).toHaveTextContent('Blocked By');
  });

  it('renders version chip popover content when version metadata exists', () => {
    render(<HbcRelatedItemCard item={createItem()} />);

    expect(screen.getByTestId('related-item-version-chip')).toBeInTheDocument();
    expect(screen.getByText(/Author:/)).toHaveTextContent('Author: Casey Rivera');
  });

  it('renders BIC metadata only when enabled', () => {
    const { rerender } = render(<HbcRelatedItemCard item={createItem()} showBicState />);
    expect(screen.getByTestId('related-item-bic')).toBeInTheDocument();

    rerender(<HbcRelatedItemCard item={createItem()} showBicState={false} />);
    expect(screen.queryByTestId('related-item-bic')).not.toBeInTheDocument();
  });

  it('renders expert AI suggest affordance for AI suggestion records', () => {
    vi.mocked(useComplexity).mockReturnValue({
      tier: 'expert',
      atLeast: vi.fn(),
      is: vi.fn(),
      setTier: vi.fn(),
      showCoaching: false,
      setShowCoaching: vi.fn(),
      isLocked: false,
      lockedBy: null,
      lockedUntil: null,
    });

    render(<HbcRelatedItemCard item={createItem({ aiConfidence: 0.81 })} />);
    expect(screen.getByTestId('related-item-ai-suggest')).toBeInTheDocument();
  });

  it('handles partial/minimal item data with deterministic fallback labeling', () => {
    render(
      <HbcRelatedItemCard
        item={createItem({
          recordType: '',
          href: '',
          status: undefined,
          versionChip: undefined,
          bicState: undefined,
          label: '',
          relationshipLabel: '',
        })}
      />,
    );

    expect(screen.getByTestId('related-item-card')).toHaveAttribute('data-record-id', 'project-1');
    expect(screen.getByText('project-1')).toBeInTheDocument();
    expect(screen.getByText('related-record')).toBeInTheDocument();
    expect(screen.getByTestId('related-item-relationship')).toHaveTextContent('Related');
    expect(screen.queryByTestId('related-item-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('related-item-status')).not.toBeInTheDocument();
    expect(screen.queryByTestId('related-item-version-chip')).not.toBeInTheDocument();
  });
});
