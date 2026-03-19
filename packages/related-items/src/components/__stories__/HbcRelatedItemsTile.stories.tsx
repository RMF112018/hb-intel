/**
 * HbcRelatedItemsTile Storybook stories — SF14-T08
 *
 * 6 states covering compact tile lifecycle.
 */
import type { Meta, StoryObj } from '@storybook/react';
import type { IRelatedItem } from '../../types/index.js';
import { HbcRelatedItemsTile } from '../HbcRelatedItemsTile.js';

// ── Module-level mocks ─────────────────────────────────────────────

const mockUseRelatedItems = {
  items: [] as IRelatedItem[],
  groups: {} as Record<string, IRelatedItem[]>,
  isLoading: false,
  error: null as string | null,
};

const mockTier = { value: 'standard' as string };

vi.mock('@hbc/auth', () => ({
  useCurrentUser: () => ({
    type: 'internal',
    id: 'u-1',
    displayName: 'Story User',
    email: 'story@example.com',
    roles: [{ id: 'r-1', name: 'BD Manager', grants: [], source: 'manual' }],
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

vi.mock('../../hooks/index.js', () => ({
  useRelatedItems: () => ({ ...mockUseRelatedItems }),
}));

// ── Helpers ────────────────────────────────────────────────────────

function item(recordId: string, label: string, relationshipLabel: string): IRelatedItem {
  return {
    recordType: 'project',
    recordId,
    label,
    href: `/projects/${recordId}`,
    moduleIcon: 'project',
    relationship: 'has',
    relationshipLabel,
  };
}

function createItems(count: number): IRelatedItem[] {
  return Array.from({ length: count }, (_, i) =>
    item(`item-${i + 1}`, `Item ${i + 1}`, `Relationship ${i + 1}`),
  );
}

// ── Meta ───────────────────────────────────────────────────────────

const meta: Meta<typeof HbcRelatedItemsTile> = {
  title: 'Related Items/HbcRelatedItemsTile',
  component: HbcRelatedItemsTile,
  args: {
    sourceRecordType: 'bd-scorecard',
    sourceRecordId: 'bd-sc-001',
    sourceRecord: { id: 'bd-sc-001' },
  },
};

export default meta;
type Story = StoryObj<typeof HbcRelatedItemsTile>;

// ── Stories ────────────────────────────────────────────────────────

export const TopThreeItems: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = createItems(3);
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const WithViewAllOverlay: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = createItems(5);
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const SingleItem: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = createItems(1);
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const EmptyTile: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = [];
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};

export const DegradedTile: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'standard';
      mockUseRelatedItems.items = createItems(2);
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = 'API degraded — stale data shown';
      return <Story />;
    },
  ],
};

export const EssentialTierHidden: Story = {
  decorators: [
    (Story) => {
      mockTier.value = 'essential';
      mockUseRelatedItems.items = [];
      mockUseRelatedItems.isLoading = false;
      mockUseRelatedItems.error = null;
      return <Story />;
    },
  ],
};
