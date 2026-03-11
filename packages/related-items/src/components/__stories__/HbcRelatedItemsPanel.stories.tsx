/**
 * HbcRelatedItemsPanel Storybook stories — SF14-T08
 *
 * 8 states covering the full progressive-disclosure lifecycle.
 */
import type { Meta, StoryObj } from '@storybook/react';
import type { IRelatedItem, IRelationshipDefinition } from '../../types/index.js';
import { HbcRelatedItemsPanel } from '../HbcRelatedItemsPanel.js';

// ── Module-level mocks ─────────────────────────────────────────────

const mockUseRelatedItems = {
  items: [] as IRelatedItem[],
  groups: {} as Record<string, IRelatedItem[]>,
  aiSuggestions: undefined as IRelatedItem[] | undefined,
  isLoading: false,
  error: null as string | null,
};

const mockTier = { value: 'standard' as string };

vi.mock('@hbc/auth', () => ({
  useCurrentUser: () => ({
    id: 'u-1',
    displayName: 'Story User',
    email: 'story@example.com',
    roles: [{ id: 'r-1', name: 'Project Manager', permissions: [] }],
  }),
}));

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({
    tier: mockTier.value,
    atLeast: () => true,
    is: (t: string) => t === mockTier.value,
    setTier: () => {},
    showCoaching: false,
    setShowCoaching: () => {},
    isLocked: false,
    lockedBy: null,
    lockedUntil: null,
  }),
}));

vi.mock('@hbc/smart-empty-state', () => ({
  HbcSmartEmptyState: () => <div data-testid="smart-empty-state">No related items</div>,
}));

vi.mock('../../hooks/index.js', () => ({
  useRelatedItems: () => ({ ...mockUseRelatedItems }),
}));

vi.mock('../../registry/index.js', () => ({
  RelationshipRegistry: {
    getBySourceRecordType: () => [] as IRelationshipDefinition[],
  },
}));

// ── Helpers ────────────────────────────────────────────────────────

function item(recordId: string, label: string, relationshipLabel: string, extras?: Partial<IRelatedItem>): IRelatedItem {
  return {
    recordType: 'project',
    recordId,
    label,
    href: `/projects/${recordId}`,
    moduleIcon: 'project',
    relationship: 'has',
    relationshipLabel,
    ...extras,
  };
}

// ── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof HbcRelatedItemsPanel> = {
  title: 'Related Items/HbcRelatedItemsPanel',
  component: HbcRelatedItemsPanel,
  args: {
    sourceRecordType: 'project',
    sourceRecordId: 'project-001',
    sourceRecord: { id: 'project-001' },
  },
};

export default meta;
type Story = StoryObj<typeof HbcRelatedItemsPanel>;

// ── Stories ────────────────────────────────────────────────────────

export const MultiGroupDeterministic: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      const items = [
        item('p-1', 'Permit Log A', 'Permit Logs'),
        item('p-2', 'Permit Log B', 'Permit Logs'),
        item('c-1', 'Constraint 1', 'Constraints'),
        item('r-1', 'Risk 1', 'Risks'),
      ];
      mockUseRelatedItems.items = items;
      mockUseRelatedItems.groups = {
        'Permit Logs': items.filter((i) => i.relationshipLabel === 'Permit Logs'),
        Constraints: items.filter((i) => i.relationshipLabel === 'Constraints'),
        Risks: items.filter((i) => i.relationshipLabel === 'Risks'),
      };
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      mockUseRelatedItems.aiSuggestions = undefined;
      return <Story />;
    },
  ],
};

export const WithAISuggestionGroup: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'expert';
      const aiItem = item('ai-1', 'AI Suggested Project', 'AI Suggestion', { aiConfidence: 0.87 });
      const regularItem = item('p-1', 'Project Alpha', 'Projects');
      mockUseRelatedItems.items = [regularItem, aiItem];
      mockUseRelatedItems.groups = {
        Projects: [regularItem],
        'AI Suggestion': [aiItem],
      };
      mockUseRelatedItems.aiSuggestions = [aiItem];
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const AISuggestionHiddenStandard: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      const regularItem = item('p-1', 'Project Alpha', 'Projects');
      const aiItem = item('ai-1', 'AI Item', 'AI Suggestion', { aiConfidence: 0.9 });
      mockUseRelatedItems.items = [regularItem, aiItem];
      mockUseRelatedItems.groups = { Projects: [regularItem] };
      mockUseRelatedItems.aiSuggestions = [aiItem];
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const EmptyState: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = [];
      mockUseRelatedItems.groups = {};
      mockUseRelatedItems.aiSuggestions = undefined;
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const LoadingState: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = [];
      mockUseRelatedItems.groups = {};
      mockUseRelatedItems.aiSuggestions = undefined;
      mockUseRelatedItems.isLoading = true;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const DegradedWithStaleData: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      const staleItems = [item('p-1', 'Stale Project', 'Projects')];
      mockUseRelatedItems.items = staleItems;
      mockUseRelatedItems.groups = { Projects: staleItems };
      mockUseRelatedItems.aiSuggestions = undefined;
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = 'Backend degraded — showing cached data';
      return <Story />;
    },
  ],
};

export const EssentialTierHidden: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'essential';
      mockUseRelatedItems.items = [];
      mockUseRelatedItems.groups = {};
      mockUseRelatedItems.aiSuggestions = undefined;
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const MissingSource: Story = {
  args: {
    sourceRecordType: '',
    sourceRecordId: '',
    sourceRecord: {},
  },
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = [];
      mockUseRelatedItems.groups = {};
      mockUseRelatedItems.aiSuggestions = undefined;
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};
