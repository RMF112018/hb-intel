import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRelatedItem, IRelationshipDefinition } from '../types/index.js';

vi.mock('@hbc/auth', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(),
}));

vi.mock('@hbc/smart-empty-state', () => ({
  HbcSmartEmptyState: vi.fn(() => <div data-testid="smart-empty-state">Smart Empty State</div>),
}));

vi.mock('../hooks/index.js', () => ({
  useRelatedItems: vi.fn(),
}));

vi.mock('../registry/index.js', () => ({
  RelationshipRegistry: {
    getBySourceRecordType: vi.fn(),
  },
}));

vi.mock('./HbcRelatedItemCard.js', () => ({
  HbcRelatedItemCard: ({ item }: { item: IRelatedItem }) => (
    <div data-testid="mock-related-item-card">{item.label}</div>
  ),
}));

import { useCurrentUser } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { useRelatedItems } from '../hooks/index.js';
import { RelationshipRegistry } from '../registry/index.js';
import { HbcRelatedItemsPanel } from './HbcRelatedItemsPanel.js';

function definition(label: string, relationshipPriority: number): IRelationshipDefinition {
  return {
    sourceRecordType: 'project',
    targetRecordType: `${label.toLowerCase()}-type`,
    label,
    direction: 'has',
    targetModule: 'project',
    resolveRelatedIds: () => [],
    buildTargetUrl: (id: string) => `/items/${id}`,
    governanceMetadata: { relationshipPriority },
  };
}

function item(recordId: string, label: string, relationshipLabel: string): IRelatedItem {
  return {
    recordType: 'project',
    recordId,
    label,
    href: `/project/${recordId}`,
    moduleIcon: 'project',
    relationship: 'has',
    relationshipLabel,
  };
}

describe('HbcRelatedItemsPanel (SF14-T05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCurrentUser).mockReturnValue({
      id: 'u-1',
      displayName: 'Test User',
      email: 'test@example.com',
      roles: [{ id: 'r-1', name: 'Project Manager', permissions: [] }],
    });

    vi.mocked(useComplexity).mockReturnValue({
      tier: 'standard',
      atLeast: vi.fn((target: string) => ['essential', 'standard', 'expert'].indexOf('standard') >= ['essential', 'standard', 'expert'].indexOf(target)),
      is: vi.fn((target: string) => target === 'standard'),
      setTier: vi.fn(),
      showCoaching: false,
      setShowCoaching: vi.fn(),
      isLocked: false,
      lockedBy: null,
      lockedUntil: null,
    });

    vi.mocked(useRelatedItems).mockReturnValue({
      items: [],
      groups: {},
      aiSuggestions: undefined,
      isLoading: false,
      error: null,
    });

    vi.mocked(RelationshipRegistry.getBySourceRecordType).mockReturnValue([]);
  });

  it('hides the panel for essential complexity tier', () => {
    vi.mocked(useComplexity).mockReturnValue({
      tier: 'essential',
      atLeast: vi.fn(),
      is: vi.fn(),
      setTier: vi.fn(),
      showCoaching: false,
      setShowCoaching: vi.fn(),
      isLocked: false,
      lockedBy: null,
      lockedUntil: null,
    });

    const { container } = render(
      <HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders deterministic loading state', () => {
    vi.mocked(useRelatedItems).mockReturnValue({
      items: [],
      groups: {},
      aiSuggestions: undefined,
      isLoading: true,
      error: null,
    });

    render(<HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />);
    expect(screen.getByTestId('related-items-panel-loading')).toBeInTheDocument();
  });

  it('renders missing-source fallback when source context is invalid', () => {
    render(<HbcRelatedItemsPanel sourceRecordType=" " sourceRecordId="" sourceRecord={{}} />);
    expect(screen.getByTestId('related-items-panel-missing-source')).toBeInTheDocument();
  });

  it('renders smart empty state when no content exists', () => {
    render(<HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />);
    expect(screen.getByTestId('related-items-panel-empty')).toBeInTheDocument();
    expect(screen.getByTestId('smart-empty-state')).toBeInTheDocument();
  });

  it('renders degraded banner with stale data when error exists', () => {
    vi.mocked(useRelatedItems).mockReturnValue({
      items: [item('p-1', 'Item One', 'Projects')],
      groups: { Projects: [item('p-1', 'Item One', 'Projects')] },
      aiSuggestions: undefined,
      isLoading: false,
      error: 'backend degraded',
    });

    render(<HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />);

    expect(screen.getByTestId('related-items-degraded-banner')).toBeInTheDocument();
    expect(screen.getByTestId('mock-related-item-card')).toBeInTheDocument();
  });

  it('orders grouped sections deterministically by priority then label', () => {
    const groups = {
      Alpha: [item('a-1', 'Alpha Item', 'Alpha')],
      Beta: [item('b-1', 'Beta Item', 'Beta')],
      Gamma: [item('g-1', 'Gamma Item', 'Gamma')],
    };

    vi.mocked(useRelatedItems).mockReturnValue({
      items: [...groups.Alpha, ...groups.Beta, ...groups.Gamma],
      groups,
      aiSuggestions: undefined,
      isLoading: false,
      error: null,
    });

    vi.mocked(RelationshipRegistry.getBySourceRecordType).mockReturnValue([
      definition('Alpha', 30),
      definition('Beta', 90),
      definition('Gamma', 90),
    ]);

    render(<HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />);

    const summaries = screen.getAllByTestId('related-items-group').map((el) =>
      el.querySelector('summary')?.textContent?.trim(),
    );

    expect(summaries[0]).toContain('Beta');
    expect(summaries[1]).toContain('Gamma');
    expect(summaries[2]).toContain('Alpha');
  });

  it('renders AI suggestion group and CTA only for expert tier', () => {
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

    vi.mocked(useRelatedItems).mockReturnValue({
      items: [item('p-1', 'Item One', 'Projects')],
      groups: {
        Projects: [item('p-1', 'Item One', 'Projects')],
        'AI Suggestion': [item('ai-1', 'AI Item', 'AI Suggestion')],
      },
      aiSuggestions: [item('ai-1', 'AI Item', 'AI Suggestion')],
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />);

    expect(screen.getByTestId('related-items-ai-group')).toBeInTheDocument();
    expect(screen.getByTestId('related-items-ai-cta')).toBeInTheDocument();
  });

  it('omits AI suggestion group for standard tier', () => {
    vi.mocked(useRelatedItems).mockReturnValue({
      items: [item('p-1', 'Item One', 'Projects')],
      groups: { Projects: [item('p-1', 'Item One', 'Projects')] },
      aiSuggestions: [item('ai-1', 'AI Item', 'AI Suggestion')],
      isLoading: false,
      error: null,
    });

    render(<HbcRelatedItemsPanel sourceRecordType="project" sourceRecordId="p-1" sourceRecord={{}} />);
    expect(screen.queryByTestId('related-items-ai-group')).not.toBeInTheDocument();
  });
});
